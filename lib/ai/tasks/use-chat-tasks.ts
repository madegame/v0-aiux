import { useState, useCallback, useEffect } from 'react';
import type { LLMRole, LLMProvider, HistoryEntry } from '@/lib/ai-history/types';
import { createTask, agentChannel, Task, TaskContent } from '@/lib/ai/tasks';

// Helper to save task via API (instead of direct taskStorage which is server-only)
async function saveTaskViaAPI(task: Task): Promise<void> {
  try {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
  } catch (e) {
    console.warn('[useChatTasks] Failed to save task:', e);
  }
}

interface UseChatWithTasksOptions {
  projectId: string;
  agentType: 'task-agent' | 'supervisor';
  onSendMessage: (message: string, role: LLMRole, provider: LLMProvider) => Promise<string>;
  history?: HistoryEntry[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  llmRole?: LLMRole;
  provider?: LLMProvider;
  taskId?: string;
  taskType?: string;
}

export function useChatWithTasks({
  projectId,
  agentType,
  onSendMessage,
  history = [],
}: UseChatWithTasksOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<LLMRole>(agentType === 'task-agent' ? 'code' : 'admin');
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('vercel');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (history.length > 0) {
      const converted: ChatMessage[] = history.flatMap((entry) => [
        {
          id: `${entry.id}-q`,
          role: 'user' as const,
          content: entry.question,
          timestamp: entry.timestamp,
          llmRole: entry.role,
          provider: entry.provider,
        },
        {
          id: `${entry.id}-a`,
          role: 'assistant' as const,
          content: entry.answer,
          timestamp: entry.timestamp,
          llmRole: entry.role,
          provider: entry.provider,
        },
      ]);
      setMessages(converted);
    }
  }, [history]);

  useEffect(() => {
    const handleMessage = (msg: { id?: string; to: string; t: string; ts: string; c: any }) => {
      if (msg.to === agentType) {
        const systemMsg: ChatMessage = {
          id: msg.id || `msg_${Date.now()}`,
          role: 'system',
          content: formatTaskNotification(msg),
          timestamp: msg.ts,
          taskId: msg.c?.taskId || msg.c?.type,
          taskType: msg.t,
        };
        setMessages(prev => [...prev, systemMsg]);
      }
    };

    agentChannel.on('message', handleMessage);
    return () => {
      agentChannel.off('message', handleMessage);
    };
  }, [agentType]);

  const formatTaskNotification = (msg: { t: string; c: any }): string => {
    if (msg.t === 'task') {
      return `[📋 Task Received] ${msg.c?.type}: ${msg.c?.description?.slice(0, 100)}...`;
    } else if (msg.t === 'result') {
      return `[✅ Result] ${msg.c?.summary?.slice(0, 100)}...`;
    } else if (msg.t === 'notify') {
      return `[🔔 ${msg.c?.event}] ${msg.c?.message}`;
    }
    return '';
  };

  const detectTaskIntent = useCallback((input: string): boolean => {
    const taskKeywords = [
      'proje', 'ui-hooks', 'sandbox', 'search', 'scrap', 'rules',
      'skill', 'track', 'bug fix', 'feature', 'refactor', 'test',
      'hook otomasyon', 'araştır', 'incele', 'bu bug', 'yeni özellik'
    ];
    return taskKeywords.some(kw => input.toLowerCase().includes(kw));
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      llmRole: selectedRole,
      provider: selectedProvider,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    const isTaskIntent = detectTaskIntent(input);
    
    if (isTaskIntent && agentType === 'supervisor') {
      const task = createTask(input, undefined, []);
      task.status = 'assigned';
      task.assignedTo = task.assignedTo || 'task-agent';
      
      await saveTaskViaAPI(task);
      setPendingTask(task);
      
      const targetAgent = task.assignedTo === 'supervisor' ? 'task-agent' : 'supervisor';
      const content: TaskContent = {
        type: task.type,
        description: task.description,
        context: task.context,
        priority: task.priority,
      };
      
      agentChannel.sendTask('supervisor', targetAgent, content);
      
      const sysMsg: ChatMessage = {
        id: `sys_${Date.now()}`,
        role: 'system',
        content: `[📤 Task dispatched to ${targetAgent}]: ${task.type} (${task.priority}) - Saved: ${task.id}`,
        timestamp: new Date().toISOString(),
        taskId: task.id,
        taskType: task.type,
      };
      setMessages(prev => [...prev, sysMsg]);
    }

    try {
      const response = await onSendMessage(input, selectedRole, selectedProvider);
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        llmRole: selectedRole,
        provider: selectedProvider,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'system',
        content: `[Error] ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setInput('');
      setIsProcessing(false);
      setPendingTask(null);
    }
  }, [input, selectedRole, selectedProvider, onSendMessage, agentType, detectTaskIntent]);

  return {
    messages,
    input,
    setInput,
    selectedRole,
    setSelectedRole,
    selectedProvider,
    setSelectedProvider,
    isProcessing,
    pendingTask,
    handleSend,
    detectTaskIntent,
  };
}
