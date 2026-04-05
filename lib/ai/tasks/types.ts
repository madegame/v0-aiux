export type TaskType = 
  | 'project'
  | 'ui-hooks'
  | 'sandbox'
  | 'search'
  | 'scrap'
  | 'rules'
  | 'skill'
  | 'track'
  | 'ask'
  | 'bugfix'
  | 'feature'
  | 'refactor'
  | 'test'
  | 'docs';

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';

export type TaskStatus = 
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'blocked';

export type AgentType = 'task-agent' | 'supervisor';

export interface TaskContext {
  files?: string[];
  branch?: string;
  commit?: string;
  worktreePath?: string;
  searchQuery?: string;
  scrapUrl?: string;
}

export interface TaskContent {
  type: TaskType;
  description: string;
  context: TaskContext;
  priority: TaskPriority;
}

export type MessageType = 'task' | 'result' | 'query' | 'notify' | 'approval';

export interface AgentMessage {
  t: MessageType;
  id: string;
  f: AgentType;
  to: AgentType;
  c: TaskContent | TaskResult | TaskQuery | TaskNotification;
  r?: string;
  ts: string;
}

export interface TaskResult {
  taskId: string;
  status: TaskStatus;
  summary: string;
  filesChanged?: string[];
  output?: string;
  error?: string;
  tokensUsed?: number;
}

export interface TaskQuery {
  question: string;
  context: TaskContext;
}

export interface TaskNotification {
  event: 'task_completed' | 'task_failed' | 'blocked' | 'approval_needed' | 'info';
  message: string;
  relatedTaskId?: string;
}

export interface Task {
  id: string;
  type: TaskType;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedTo?: AgentType;
  createdAt: string;
  updatedAt: string;
  context: TaskContext;
  result?: TaskResult;
  relatedTaskId?: string;
}

export interface WorktreeConfig {
  name: string;
  branch: string;
  path: string;
  taskId: string;
  createdAt: string;
  isActive: boolean;
}

export const TASK_TYPE_PATTERNS: Record<TaskType, RegExp> = {
  project: /proje(yle)?\s+(ilgilen|calis|üzerinde)/i,
  'ui-hooks': /(ui|user[ -]?interface)\s*hooks|hook\s*(otomasyon|automation)/i,
  sandbox: /sandbox|test\s*ortam/i,
  search: /(internet|web)\s*(ara[sz]t|search)|google/i,
  scrap: /scrap[ei]?|web\s*veri\s*(çek|ala)/i,
  rules: /rules?\s*(güncelle|update|olu[sz]tur)|proje\s*kurallar/i,
  skill: /skill|yetkinlik|komut\s*tan[ı]mla/i,
  track: /takip|track|proje\s*durumu/i,
  ask: /^(ne|nas[ıl]|neden|how|what|why)/i,
  bugfix: /(bug|hat[а])\s*(fix|düzelt)|bu\s*bug/i,
  feature: /(özellik|feature|yeni)\s*(ekle|olu[sz]tur|yarat)/i,
  refactor: /refactor|düzenle|yeniden\s*yaz/i,
  test: /test\s*(yaz|ekle)|birim\s*test/i,
  docs: /dokümantasyon|docs|belgeleme/i,
};

export const AGENT_FOR_TASK: Record<TaskType, AgentType> = {
  project: 'task-agent',
  'ui-hooks': 'task-agent',
  sandbox: 'task-agent',
  search: 'task-agent',
  scrap: 'task-agent',
  rules: 'supervisor',
  skill: 'supervisor',
  track: 'supervisor',
  ask: 'task-agent',
  bugfix: 'task-agent',
  feature: 'task-agent',
  refactor: 'task-agent',
  test: 'task-agent',
  docs: 'task-agent',
};

export const DEFAULT_CONTEXT: TaskContext = {};
