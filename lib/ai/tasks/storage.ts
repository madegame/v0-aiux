import { Task, TaskStatus, TaskType, AgentType } from './types';

const TASK_STORAGE_KEY = 'ai-tasks';

export interface TaskIndex {
  byStatus: Record<TaskStatus, string[]>;
  byType: Record<string, string[]>;
  byAgent: Record<AgentType, string[]>;
  byDate: Record<string, string[]>;
  totalTasks: number;
  lastUpdated: string;
}

export interface TaskStorage {
  tasks: Record<string, Task>;
  index: TaskIndex;
}

const DEFAULT_INDEX: TaskIndex = {
  byStatus: {
    pending: [],
    assigned: [],
    in_progress: [],
    completed: [],
    failed: [],
    blocked: [],
  },
  byType: {},
  byAgent: {
    'task-agent': [],
    supervisor: [],
  },
  byDate: {},
  totalTasks: 0,
  lastUpdated: new Date().toISOString(),
};

export class TaskStorageManager {
  private storage: TaskStorage | null = null;
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TASK_STORAGE_KEY);
      if (stored) {
        try {
          this.storage = JSON.parse(stored);
        } catch {
          this.storage = { tasks: {}, index: DEFAULT_INDEX };
        }
      } else {
        this.storage = { tasks: {}, index: DEFAULT_INDEX };
      }
    } else {
      this.storage = { tasks: {}, index: DEFAULT_INDEX };
    }
    
    this.initialized = true;
  }

  private save(): void {
    if (!this.storage || typeof window === 'undefined') return;
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(this.storage));
  }

  private updateIndex(task: Task): void {
    if (!this.storage) return;
    
    const date = task.createdAt.split('T')[0];
    const index = this.storage.index;

    index.totalTasks = Object.keys(this.storage.tasks).length;
    index.lastUpdated = new Date().toISOString();

    if (!index.byStatus[task.status]) {
      index.byStatus[task.status] = [];
    }
    if (!index.byStatus[task.status].includes(task.id)) {
      index.byStatus[task.status].push(task.id);
    }

    if (!index.byType[task.type]) {
      index.byType[task.type] = [];
    }
    if (!index.byType[task.type].includes(task.id)) {
      index.byType[task.type].push(task.id);
    }

    if (task.assignedTo) {
      if (!index.byAgent[task.assignedTo]) {
        index.byAgent[task.assignedTo] = [];
      }
      if (!index.byAgent[task.assignedTo].includes(task.id)) {
        index.byAgent[task.assignedTo].push(task.id);
      }
    }

    if (!index.byDate[date]) {
      index.byDate[date] = [];
    }
    if (!index.byDate[date].includes(task.id)) {
      index.byDate[date].push(task.id);
    }
  }

  async addTask(task: Task): Promise<void> {
    await this.init();
    if (!this.storage) return;

    this.storage.tasks[task.id] = task;
    this.updateIndex(task);
    this.save();
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    await this.init();
    if (!this.storage) return null;

    const task = this.storage.tasks[taskId];
    if (!task) return null;

    const updatedTask = { ...task, ...updates, updatedAt: new Date().toISOString() };
    this.storage.tasks[taskId] = updatedTask;
    this.updateIndex(updatedTask);
    this.save();

    return updatedTask;
  }

  async getTask(taskId: string): Promise<Task | null> {
    await this.init();
    return this.storage?.tasks[taskId] || null;
  }

  async getAllTasks(): Promise<Task[]> {
    await this.init();
    if (!this.storage) return [];
    return Object.values(this.storage.tasks);
  }

  async getTasksByStatus(status: TaskStatus): Promise<Task[]> {
    await this.init();
    if (!this.storage) return [];
    
    const taskIds = this.storage.index.byStatus[status] || [];
    return taskIds.map(id => this.storage!.tasks[id]).filter(Boolean);
  }

  async getTasksByAgent(agent: AgentType): Promise<Task[]> {
    await this.init();
    if (!this.storage) return [];
    
    const taskIds = this.storage.index.byAgent[agent] || [];
    return taskIds.map(id => this.storage!.tasks[id]).filter(Boolean);
  }

  async getPendingTasks(): Promise<Task[]> {
    return this.getTasksByStatus('pending');
  }

  async getActiveTasks(): Promise<Task[]> {
    await this.init();
    if (!this.storage) return [];
    
    const activeStatuses: TaskStatus[] = ['assigned', 'in_progress'];
    const taskIds = activeStatuses.flatMap(status => 
      this.storage!.index.byStatus[status] || []
    );
    return taskIds.map(id => this.storage!.tasks[id]).filter(Boolean);
  }

  async getCompletedTasks(): Promise<Task[]> {
    return this.getTasksByStatus('completed');
  }

  async deleteTask(taskId: string): Promise<boolean> {
    await this.init();
    if (!this.storage) return false;

    delete this.storage.tasks[taskId];
    this.save();
    return true;
  }

  async clearAll(): Promise<void> {
    await this.init();
    if (!this.storage) return;
    
    this.storage = { tasks: {}, index: DEFAULT_INDEX };
    this.save();
  }

  getStats(): { total: number; pending: number; active: number; completed: number; failed: number } {
    if (!this.storage) {
      return { total: 0, pending: 0, active: 0, completed: 0, failed: 0 };
    }

    const index = this.storage.index;
    return {
      total: index.totalTasks,
      pending: index.byStatus.pending?.length || 0,
      active: (index.byStatus.assigned?.length || 0) + (index.byStatus.in_progress?.length || 0),
      completed: index.byStatus.completed?.length || 0,
      failed: index.byStatus.failed?.length || 0,
    };
  }
}

export const taskStorage = new TaskStorageManager();
