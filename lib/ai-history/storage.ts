/**
 * AI History Storage System
 * MVP: JSON-based file storage with chunking and indexing
 */

import { 
  HistoryEntry, 
  HistoryIndex, 
  ChunkInfo, 
  SearchQuery, 
  SearchResult,
  StorageConfig,
  DEFAULT_STORAGE_CONFIG,
  LLMRole,
  LLMProvider
} from './types';

// ============================================
// STORAGE CLASS
// ============================================

export class AIHistoryStorage {
  private config: StorageConfig;
  private index: HistoryIndex | null = null;
  private currentChunk: HistoryEntry[] = [];
  
  constructor(config: Partial<StorageConfig> = {}) {
    this.config = { ...DEFAULT_STORAGE_CONFIG, ...config };
  }
  
  // ============================================
  // INDEX MANAGEMENT
  // ============================================
  
  async loadIndex(): Promise<HistoryIndex> {
    if (this.index) return this.index;
    
    // In browser/server, this would read from file
    // For now, return empty index
    this.index = this.createEmptyIndex();
    return this.index;
  }
  
  private createEmptyIndex(): HistoryIndex {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalEntries: 0,
      byDate: {},
      byRole: {} as Record<LLMRole, string[]>,
      byTag: {},
      byFile: {},
      bySession: {},
      byProvider: {} as Record<LLMProvider, string[]>,
      chunks: [],
    };
  }
  
  // ============================================
  // ENTRY MANAGEMENT
  // ============================================
  
  async addEntry(entry: HistoryEntry): Promise<void> {
    const index = await this.loadIndex();
    
    // Add to current chunk
    this.currentChunk.push(entry);
    
    // Update index
    this.updateIndex(index, entry);
    
    // Check if chunk needs to be split
    if (this.shouldSplitChunk()) {
      await this.splitChunk();
    }
    
    // Save index
    await this.saveIndex(index);
  }
  
  private updateIndex(index: HistoryIndex, entry: HistoryEntry): void {
    const date = entry.timestamp.split('T')[0];
    
    // By date
    if (!index.byDate[date]) index.byDate[date] = [];
    index.byDate[date].push(entry.id);
    
    // By role
    if (!index.byRole[entry.role]) index.byRole[entry.role] = [];
    index.byRole[entry.role].push(entry.id);
    
    // By provider
    if (!index.byProvider[entry.provider]) index.byProvider[entry.provider] = [];
    index.byProvider[entry.provider].push(entry.id);
    
    // By tags
    entry.tags.forEach(tag => {
      if (!index.byTag[tag]) index.byTag[tag] = [];
      index.byTag[tag].push(entry.id);
    });
    
    // By files
    entry.filesChanged.forEach(file => {
      if (!index.byFile[file.path]) index.byFile[file.path] = [];
      index.byFile[file.path].push(entry.id);
    });
    
    // By session
    if (!index.bySession[entry.sessionId]) index.bySession[entry.sessionId] = [];
    index.bySession[entry.sessionId].push(entry.id);
    
    index.totalEntries++;
    index.lastUpdated = new Date().toISOString();
  }
  
  private shouldSplitChunk(): boolean {
    const maxEntries = this.config.maxEntriesPerChunk || 100;
    return this.currentChunk.length >= maxEntries;
  }
  
  private async splitChunk(): Promise<void> {
    if (this.currentChunk.length === 0) return;
    
    const index = await this.loadIndex();
    const chunkId = `chunk_${Date.now()}`;
    const filename = `${chunkId}.json`;
    
    const chunkInfo: ChunkInfo = {
      id: chunkId,
      filename,
      startDate: this.currentChunk[0].timestamp,
      endDate: this.currentChunk[this.currentChunk.length - 1].timestamp,
      entryCount: this.currentChunk.length,
      sizeBytes: JSON.stringify(this.currentChunk).length,
    };
    
    index.chunks.push(chunkInfo);
    
    // In real implementation, save chunk to file
    // await this.saveChunk(filename, this.currentChunk);
    
    this.currentChunk = [];
  }
  
  private async saveIndex(index: HistoryIndex): Promise<void> {
    // In real implementation, save to file
    this.index = index;
  }
  
  // ============================================
  // SEARCH
  // ============================================
  
  async search(query: SearchQuery): Promise<SearchResult> {
    const index = await this.loadIndex();
    let matchingIds: Set<string> = new Set();
    let isFirstFilter = true;
    
    // Filter by role
    if (query.role && index.byRole[query.role]) {
      const ids = new Set(index.byRole[query.role]);
      matchingIds = isFirstFilter ? ids : this.intersect(matchingIds, ids);
      isFirstFilter = false;
    }
    
    // Filter by provider
    if (query.provider && index.byProvider[query.provider]) {
      const ids = new Set(index.byProvider[query.provider]);
      matchingIds = isFirstFilter ? ids : this.intersect(matchingIds, ids);
      isFirstFilter = false;
    }
    
    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      query.tags.forEach(tag => {
        if (index.byTag[tag]) {
          const ids = new Set(index.byTag[tag]);
          matchingIds = isFirstFilter ? ids : this.intersect(matchingIds, ids);
          isFirstFilter = false;
        }
      });
    }
    
    // Filter by files
    if (query.filesChanged && query.filesChanged.length > 0) {
      query.filesChanged.forEach(file => {
        if (index.byFile[file]) {
          const ids = new Set(index.byFile[file]);
          matchingIds = isFirstFilter ? ids : this.intersect(matchingIds, ids);
          isFirstFilter = false;
        }
      });
    }
    
    // If no filters, get all
    if (isFirstFilter) {
      Object.values(index.byDate).forEach(ids => {
        ids.forEach(id => matchingIds.add(id));
      });
    }
    
    // Load entries (simplified - would load from chunks)
    const entries = this.currentChunk.filter(e => matchingIds.has(e.id));
    
    // Apply text search if provided
    const filteredEntries = query.text 
      ? entries.filter(e => 
          e.question.toLowerCase().includes(query.text!.toLowerCase()) ||
          e.answer.toLowerCase().includes(query.text!.toLowerCase()) ||
          e.tags.some(t => t.toLowerCase().includes(query.text!.toLowerCase()))
        )
      : entries;
    
    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 50;
    const paginatedEntries = filteredEntries.slice(offset, offset + limit);
    
    return {
      entries: paginatedEntries,
      total: filteredEntries.length,
      hasMore: offset + limit < filteredEntries.length,
    };
  }
  
  private intersect(setA: Set<string>, setB: Set<string>): Set<string> {
    return new Set([...setA].filter(x => setB.has(x)));
  }
  
  // ============================================
  // EXPORT/IMPORT
  // ============================================
  
  async exportToJSON(): Promise<string> {
    const index = await this.loadIndex();
    return JSON.stringify({
      index,
      entries: this.currentChunk,
    }, null, 2);
  }
  
  async importFromJSON(json: string): Promise<void> {
    const data = JSON.parse(json);
    this.index = data.index;
    this.currentChunk = data.entries || [];
  }
  
  // ============================================
  // STATS
  // ============================================
  
  async getStats(): Promise<{
    totalEntries: number;
    byRole: Record<string, number>;
    byProvider: Record<string, number>;
    recentActivity: { date: string; count: number }[];
  }> {
    const index = await this.loadIndex();
    
    const byRole: Record<string, number> = {};
    Object.entries(index.byRole).forEach(([role, ids]) => {
      byRole[role] = ids.length;
    });
    
    const byProvider: Record<string, number> = {};
    Object.entries(index.byProvider).forEach(([provider, ids]) => {
      byProvider[provider] = ids.length;
    });
    
    const recentActivity = Object.entries(index.byDate)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 7)
      .map(([date, ids]) => ({ date, count: ids.length }));
    
    return {
      totalEntries: index.totalEntries,
      byRole,
      byProvider,
      recentActivity,
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let storageInstance: AIHistoryStorage | null = null;

export function getHistoryStorage(config?: Partial<StorageConfig>): AIHistoryStorage {
  if (!storageInstance) {
    storageInstance = new AIHistoryStorage(config);
  }
  return storageInstance;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createEntry(
  partial: Partial<HistoryEntry> & Pick<HistoryEntry, 'question' | 'answer' | 'role' | 'provider'>
): HistoryEntry {
  return {
    id: generateEntryId(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    sessionId: partial.sessionId || generateSessionId(),
    sequenceNumber: partial.sequenceNumber || 1,
    provider: partial.provider,
    role: partial.role,
    question: partial.question,
    answer: partial.answer,
    filesChanged: partial.filesChanged || [],
    tags: partial.tags || [],
    status: partial.status || 'completed',
    ...partial,
  };
}
