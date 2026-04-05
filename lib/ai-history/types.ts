/**
 * AI History System Types
 * MVP: JSON-based storage
 * v2: SQLite (local)
 * v3: Cloud/GitHub sync
 */

// ============================================
// CORE TYPES
// ============================================

export type LLMProvider =
  | 'openai'        // gpt-5-mini, gpt-4-turbo, codex
  | 'anthropic'     // claude-opus-4.6, claude-sonnet, claude-code
  | 'google'        // gemini-3-flash, gemini-pro
  | 'groq'          // llama-3.1
  | 'fireworks'     // mixtral
  | 'openrouter'    // 200+ model (custom API key)
  | 'vercel'        // Vercel AI Gateway (default)
  | 'roocode'       // RooCode integrations
  | 'kilocode'      // KiloCode models
  | 'cline';        // Cline integrations

export type LLMRole = 
  | 'ask'      // Soru sorma, aciklama alma
  | 'code'     // Kod yazma, refactor
  | 'debug'    // Hata ayiklama
  | 'plan'     // Planlama, mimari
  | 'review'   // Kod inceleme
  | 'test'     // Test yazma
  | 'docs'     // Dokumantasyon
  | 'admin';   // Yonetim, koordinasyon

export type EntryStatus = 
  | 'pending'   // İşleniyor
  | 'completed' // Tamamlandı
  | 'failed'    // Başarısız
  | 'partial';  // Kısmen tamamlandı

export type FileChangeType = 
  | 'created' 
  | 'modified' 
  | 'deleted' 
  | 'renamed';

// ============================================
// HISTORY ENTRY
// ============================================

export interface FileChange {
  path: string;
  changeType: FileChangeType;
  linesAdded?: number;
  linesRemoved?: number;
  diff?: string; // Git diff format (optional, for detailed tracking)
}

export interface HistoryEntry {
  // Identification
  id: string;                    // UUID
  version: string;               // Semantic version (1.0.0)
  timestamp: string;             // ISO 8601
  
  // Session Info
  sessionId: string;             // Grup related entries
  sequenceNumber: number;        // Order within session
  
  // LLM Info
  provider: LLMProvider;
  model?: string;                // e.g., "gpt-4", "claude-3"
  role: LLMRole;
  
  // Content
  question: string;              // User prompt
  answer: string;                // LLM response (summarized)
  fullResponse?: string;         // Full response (optional)
  
  // Changes
  filesChanged: FileChange[];
  
  // Metadata
  tags: string[];                // Searchable tags
  relatedEntries?: string[];     // Related entry IDs
  branch?: string;               // Git branch
  commit?: string;               // Git commit hash
  
  // Status
  status: EntryStatus;
  errorMessage?: string;
  
  // Metrics (optional)
  metrics?: {
    tokensUsed?: number;
    responseTimeMs?: number;
    cost?: number;
  };
}

// ============================================
// INDEX TYPES (for fast search)
// ============================================

export interface HistoryIndex {
  version: string;
  lastUpdated: string;
  totalEntries: number;
  
  // Quick lookups
  byDate: Record<string, string[]>;      // date -> entry IDs
  byRole: Record<LLMRole, string[]>;     // role -> entry IDs
  byTag: Record<string, string[]>;       // tag -> entry IDs
  byFile: Record<string, string[]>;      // file path -> entry IDs
  bySession: Record<string, string[]>;   // session -> entry IDs
  byProvider: Record<LLMProvider, string[]>;
  
  // Chunk info (for large histories)
  chunks: ChunkInfo[];
}

export interface ChunkInfo {
  id: string;
  filename: string;
  startDate: string;
  endDate: string;
  entryCount: number;
  sizeBytes: number;
}

// ============================================
// STORAGE CONFIG
// ============================================

export interface StorageConfig {
  type: 'json' | 'sqlite' | 'cloud';
  
  // JSON specific
  jsonPath?: string;
  maxEntriesPerChunk?: number;   // Default: 100
  maxChunkSizeMB?: number;       // Default: 1MB
  
  // SQLite specific (v2)
  sqlitePath?: string;
  
  // Cloud specific (v3)
  cloudProvider?: 'github' | 'vercel';
  syncInterval?: number;
}

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  type: 'json',
  jsonPath: '.ai/history',
  maxEntriesPerChunk: 100,
  maxChunkSizeMB: 1,
};

// ============================================
// SESSION TYPES
// ============================================

export interface Session {
  id: string;
  startedAt: string;
  endedAt?: string;
  provider: LLMProvider;
  role: LLMRole;
  branch?: string;
  summary?: string;
  entryCount: number;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchQuery {
  text?: string;
  role?: LLMRole;
  provider?: LLMProvider;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  filesChanged?: string[];
  status?: EntryStatus;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  entries: HistoryEntry[];
  total: number;
  hasMore: boolean;
}

// ============================================
// GIT INTEGRATION TYPES
// ============================================

export interface GitConfig {
  autoCommit: boolean;
  commitPrefix: string;          // e.g., "[AI]"
  branch: string;
  worktreeSupport: boolean;      // For multi-LLM parallel work
}

export const DEFAULT_GIT_CONFIG: GitConfig = {
  autoCommit: false,
  commitPrefix: '[AI]',
  branch: 'main',
  worktreeSupport: false,
};

export interface WorktreeInfo {
  name: string;
  branch: string;
  path: string;
  provider: LLMProvider;
  role: LLMRole;
  createdAt: string;
  isActive: boolean;
}
