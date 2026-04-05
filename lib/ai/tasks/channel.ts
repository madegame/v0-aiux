import { EventEmitter } from 'events';
import { AgentMessage, AgentType, Task, TaskContent, TaskResult } from './types';
import { dispatcher } from './dispatcher';

const AGENT_CHANNEL = 'agent-communication';
const STORAGE_KEY = 'agent-message-queue';

class AgentChannel extends EventEmitter {
  private channel: BroadcastChannel | null = null;
  private messageQueue: AgentMessage[] = [];
  private initialized = false;

  constructor() {
    super();
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private init() {
    if (this.initialized) return;
    
    try {
      this.channel = new BroadcastChannel(AGENT_CHANNEL);
      this.channel.onmessage = (event) => {
        this.handleIncomingMessage(event.data);
      };
    } catch (e) {
      console.warn('[AgentChannel] BroadcastChannel not supported:', e);
    }

    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) {
        this.handleStorageEvent(event);
      }
    });

    this.initialized = true;
    this.emit('ready');
  }

  private handleIncomingMessage(msg: AgentMessage) {
    this.emit('message', msg);
    
    if (msg.t === 'task') {
      dispatcher.emit('task', msg);
    } else if (msg.t === 'result') {
      dispatcher.emit('result', msg);
    } else if (msg.t === 'notify') {
      dispatcher.emit('notify', msg);
    }
  }

  private handleStorageEvent(event: StorageEvent) {
    if (!event.newValue) return;
    
    try {
      const msg = JSON.parse(event.newValue) as AgentMessage;
      if (msg.id) {
        this.handleIncomingMessage(msg);
      }
    } catch (e) {
      console.warn('[AgentChannel] Failed to parse storage message:', e);
    }
  }

  send(msg: AgentMessage) {
    if (this.channel) {
      this.channel.postMessage(msg);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(msg));
      setTimeout(() => localStorage.removeItem(STORAGE_KEY), 1000);
    } catch (e) {
      console.warn('[AgentChannel] Storage fallback failed:', e);
    }

    this.emit('sent', msg);
  }

  sendTask(from: AgentType, to: AgentType, content: TaskContent, relatedId?: string) {
    const msg: AgentMessage = {
      t: 'task',
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      f: from,
      to,
      c: content,
      r: relatedId,
      ts: new Date().toISOString(),
    };
    
    this.send(msg);
    return msg;
  }

  sendResult(from: AgentType, to: AgentType, result: TaskResult, relatedTaskId: string) {
    const msg: AgentMessage = {
      t: 'result',
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      f: from,
      to,
      c: result,
      r: relatedTaskId,
      ts: new Date().toISOString(),
    };
    
    this.send(msg);
    return msg;
  }

  sendNotification(from: AgentType, to: AgentType, event: string, message: string, relatedTaskId?: string) {
    const msg: AgentMessage = {
      t: 'notify',
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      f: from,
      to,
      c: {
        event: event as any,
        message,
        relatedTaskId,
      },
      ts: new Date().toISOString(),
    };
    
    this.send(msg);
    return msg;
  }

  requestApproval(from: AgentType, to: AgentType, taskId: string, message: string) {
    return this.sendNotification(from, to, 'approval_needed', message, taskId);
  }

  notifyTaskComplete(from: AgentType, to: AgentType, taskId: string, summary: string) {
    return this.sendNotification(from, to, 'task_completed', summary, taskId);
  }

  notifyBlocked(from: AgentType, to: AgentType, taskId: string, reason: string) {
    return this.sendNotification(from, to, 'blocked', reason, taskId);
  }

  getQueuedMessages(): AgentMessage[] {
    return [...this.messageQueue];
  }

  clearQueue() {
    this.messageQueue = [];
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.removeAllListeners();
  }
}

export const agentChannel = new AgentChannel();
