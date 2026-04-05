import {
  Task,
  TaskType,
  TaskPriority,
  TaskStatus,
  AgentType,
  TaskContent,
  TaskResult,
  AgentMessage,
  MessageType,
  TASK_TYPE_PATTERNS,
  AGENT_FOR_TASK,
  DEFAULT_CONTEXT,
} from './types';

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function parseTaskType(input: string): TaskType {
  const normalized = input.trim().toLowerCase();
  
  for (const [type, pattern] of Object.entries(TASK_TYPE_PATTERNS)) {
    if (pattern.test(normalized)) {
      return type as TaskType;
    }
  }
  
  return 'ask';
}

export function parsePriority(input: string): TaskPriority {
  const normalized = input.toLowerCase();
  
  if (normalized.includes('acil') || normalized.includes('urgent') || normalized.includes('p0')) {
    return 'P0';
  }
  if (normalized.includes('önemli') || normalized.includes('important') || normalized.includes('p1')) {
    return 'P1';
  }
  if (normalized.includes('sonra') || normalized.includes('later') || normalized.includes('p2')) {
    return 'P2';
  }
  
  return 'P1';
}

export function extractContext(input: string, attachments?: { name: string; type: string }[]): Task['context'] {
  const context: Task['context'] = {};
  
  const fileMatch = input.match(/@([^\s]+)/g);
  if (fileMatch) {
    context.files = fileMatch.map(f => f.slice(1));
  }
  
  const branchMatch = input.match(/branch:(\S+)/);
  if (branchMatch) {
    context.branch = branchMatch[1];
  }
  
  const searchMatch = input.match(/(?:search|ara):(.+)/i);
  if (searchMatch) {
    context.searchQuery = searchMatch[1].trim();
  }
  
  const scrapMatch = input.match(/(?:scrap|çek):(.+)/i);
  if (scrapMatch) {
    context.scrapUrl = scrapMatch[1].trim();
  }
  
  if (attachments && attachments.length > 0) {
    const files = attachments
      .filter(a => a.type === 'file')
      .map(a => a.name);
    if (files.length > 0) {
      context.files = [...(context.files || []), ...files];
    }
  }
  
  return context;
}

export function createTask(
  input: string,
  priority?: TaskPriority,
  attachments?: { name: string; type: string }[]
): Task {
  const type = parseTaskType(input);
  const ctx = extractContext(input, attachments);
  
  return {
    id: generateId(),
    type,
    description: input,
    priority: priority || parsePriority(input),
    status: 'pending',
    assignedTo: AGENT_FOR_TASK[type],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    context: ctx,
  };
}

export function createTaskContent(task: Task): TaskContent {
  return {
    type: task.type,
    description: task.description,
    context: task.context,
    priority: task.priority,
  };
}

export function createAgentMessage(
  from: AgentType,
  to: AgentType,
  type: MessageType,
  content: TaskContent | TaskResult,
  relatedId?: string
): AgentMessage {
  return {
    t: type,
    id: generateId(),
    f: from,
    to,
    c: content,
    r: relatedId,
    ts: new Date().toISOString(),
  };
}

export function createTaskResult(
  taskId: string,
  status: TaskStatus,
  summary: string,
  options?: {
    filesChanged?: string[];
    output?: string;
    error?: string;
    tokensUsed?: number;
  }
): TaskResult {
  return {
    taskId,
    status,
    summary,
    filesChanged: options?.filesChanged,
    output: options?.output,
    error: options?.error,
    tokensUsed: options?.tokensUsed,
  };
}

export function isTaskContent(content: TaskContent | TaskResult | TaskResult): content is TaskContent {
  return 'type' in content && 'description' in content && 'priority' in content;
}

export function isTaskResult(content: TaskContent | TaskResult | TaskResult): content is TaskResult {
  return 'taskId' in content && 'status' in content && 'summary' in content;
}

export function formatTaskForDisplay(task: Task): string {
  const statusEmoji = {
    pending: '⏳',
    assigned: '📋',
    in_progress: '🔄',
    completed: '✅',
    failed: '❌',
    blocked: '🚫',
  };
  
  return `${statusEmoji[task.status]} **${task.type.toUpperCase()}** (${task.priority})
${task.description}
${task.context.files?.length ? `📁 Files: ${task.context.files.join(', ')}` : ''}`;
}

export function formatMessageForToken(msg: AgentMessage): string {
  const compact = {
    t: msg.t,
    id: msg.id.slice(0, 8),
    f: msg.f === 'task-agent' ? 'TA' : 'SUP',
    to: msg.to === 'task-agent' ? 'TA' : 'SUP',
    c: typeof msg.c === 'string' ? msg.c : msg.c,
  };
  
  return JSON.stringify(compact);
}

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  project: 'Proje',
  'ui-hooks': 'UI Hooks',
  sandbox: 'Sandbox',
  search: 'Araştırma',
  scrap: 'Web Scrap',
  rules: 'Rules',
  skill: 'Skill',
  track: 'Takip',
  ask: 'Soru',
  bugfix: 'Bug Fix',
  feature: 'Feature',
  refactor: 'Refactor',
  test: 'Test',
  docs: 'Dokümantasyon',
};
