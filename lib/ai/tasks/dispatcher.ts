import { EventEmitter } from 'events';
import {
  Task,
  AgentType,
  AgentMessage,
  TaskContent,
  TaskResult,
  WorktreeConfig,
  TaskStatus,
  TaskQuery,
} from './types';
import { createAgentMessage, createTaskResult, isTaskContent, isTaskResult } from './parser';

type MessageHandler = (msg: AgentMessage) => void | Promise<void>;
type TaskHandler = (task: Task) => void | Promise<void>;

export class AgentDispatcher extends EventEmitter {
  private tasks: Map<string, Task> = new Map();
  private handlers: Map<AgentType, MessageHandler> = new Map();
  private taskHandlers: Map<AgentType, TaskHandler> = new Map();
  private currentAgent: AgentType = 'task-agent';

  constructor() {
    super();
    this.setupDefaultHandlers();
  }

  private setupDefaultHandlers() {
    this.on('task', this.handleTask.bind(this));
    this.on('result', this.handleResult.bind(this));
    this.on('query', this.handleQuery.bind(this));
    this.on('notify', this.handleNotify.bind(this));
  }

  setCurrentAgent(agent: AgentType) {
    this.currentAgent = agent;
  }

  getCurrentAgent(): AgentType {
    return this.currentAgent;
  }

  registerHandler(agent: AgentType, handler: MessageHandler) {
    this.handlers.set(agent, handler);
  }

  registerTaskHandler(agent: AgentType, handler: TaskHandler) {
    this.taskHandlers.set(agent, handler);
  }

  dispatch(task: Task): AgentMessage | null {
    const targetAgent = task.assignedTo;
    if (!targetAgent) {
      console.error('[Dispatcher] No target agent for task:', task.type);
      return null;
    }

    task.status = 'assigned';
    task.updatedAt = new Date().toISOString();
    this.tasks.set(task.id, task);

    const content: TaskContent = {
      type: task.type,
      description: task.description,
      context: task.context,
      priority: task.priority,
    };

    const msg = createAgentMessage(
      this.currentAgent,
      targetAgent,
      'task',
      content,
      task.relatedTaskId
    );

    this.emit('dispatch', msg, task);
    return msg;
  }

  dispatchToSupervisor(task: Task): AgentMessage | null {
    const prevAgent = task.assignedTo;
    task.assignedTo = 'supervisor';
    task.updatedAt = new Date().toISOString();
    
    const content: TaskContent = {
      type: task.type,
      description: task.description,
      context: task.context,
      priority: task.priority,
    };

    const msg = createAgentMessage(
      prevAgent || this.currentAgent,
      'supervisor',
      'task',
      content,
      task.relatedTaskId
    );

    this.emit('dispatch', msg, task);
    return msg;
  }

  sendResult(taskId: string, status: TaskStatus, summary: string, options?: Partial<TaskResult>): AgentMessage | null {
    const task = this.tasks.get(taskId);
    if (!task) {
      console.warn('[Dispatcher] Task not found:', taskId);
      return null;
    }

    const result = createTaskResult(taskId, status, summary, options);
    task.status = status;
    task.result = result;
    task.updatedAt = new Date().toISOString();

    const targetAgent = task.assignedTo === 'supervisor' ? 'task-agent' : 'supervisor';
    const msg = createAgentMessage(
      this.currentAgent,
      targetAgent,
      'result',
      result,
      taskId
    );

    this.emit('result', msg, task);
    return msg;
  }

  private handleTask(msg: AgentMessage, task: Task) {
    const handler = this.taskHandlers.get(msg.to);
    if (handler) {
      handler(task);
    }
  }

  private handleResult(msg: AgentMessage, task: Task) {
    if (isTaskResult(msg.c)) {
      task.status = msg.c.status;
      task.result = msg.c;
      task.updatedAt = new Date().toISOString();
      this.emit('task:updated', task);
    }
  }

  private handleQuery(msg: AgentMessage) {
    const content = msg.c as TaskContent | TaskResult | TaskQuery;
    const handler = this.handlers.get(msg.to);
    if (handler) {
      handler(msg);
    }
  }

  private handleNotify(msg: AgentMessage) {
    this.emit('notification', msg);
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getTasksByAgent(agent: AgentType): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.assignedTo === agent);
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === status);
  }

  getPendingTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'pending');
  }

  getActiveTasks(): Task[] {
    return Array.from(this.tasks.values()).filter(t => t.status === 'in_progress' || t.status === 'assigned');
  }
}

export const dispatcher = new AgentDispatcher();
