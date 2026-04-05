import { WorktreeConfig, AgentType } from './types';

export interface WorktreeResult {
  success: boolean;
  worktree?: WorktreeConfig;
  output?: string;
  error?: string;
}

export interface GitBranch {
  name: string;
  isCurrent: boolean;
  isRemote: boolean;
}

class WorktreeManagerClient {
  private worktrees: Map<string, WorktreeConfig> = new Map();

  async listWorktrees(): Promise<WorktreeConfig[]> {
    try {
      const response = await fetch('/api/git/worktrees', { method: 'GET' });
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  async createWorktree(branchName: string, taskId: string): Promise<WorktreeResult> {
    try {
      const response = await fetch('/api/git/worktrees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchName, taskId }),
      });
      return response.json();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, error: msg };
    }
  }

  async removeWorktree(worktreePath: string, force: boolean = false): Promise<WorktreeResult> {
    try {
      const response = await fetch('/api/git/worktrees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: worktreePath, force }),
      });
      return response.json();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      return { success: false, error: msg };
    }
  }

  async listBranches(): Promise<GitBranch[]> {
    try {
      const response = await fetch('/api/git/branches', { method: 'GET' });
      if (!response.ok) return [];
      return response.json();
    } catch {
      return [];
    }
  }

  getWorktreeForTask(taskId: string): WorktreeConfig | undefined {
    return this.worktrees.get(taskId);
  }

  getActiveWorktrees(): WorktreeConfig[] {
    return Array.from(this.worktrees.values()).filter(wt => wt.isActive);
  }
}

export const worktreeManager = new WorktreeManagerClient();
