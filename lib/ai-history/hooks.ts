'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  HistoryEntry, 
  SearchQuery, 
  SearchResult,
  LLMRole,
  LLMProvider 
} from './types';
import { getHistoryStorage, createEntry } from './storage';

// ============================================
// useAIHistory Hook
// ============================================

export function useAIHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{
    totalEntries: number;
    byRole: Record<string, number>;
    byProvider: Record<string, number>;
    recentActivity: { date: string; count: number }[];
  } | null>(null);
  
  const storage = getHistoryStorage();
  
  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);
  
  const loadStats = useCallback(async () => {
    const newStats = await storage.getStats();
    setStats(newStats);
  }, [storage]);
  
  // Search entries
  const search = useCallback(async (query: SearchQuery): Promise<SearchResult> => {
    setLoading(true);
    try {
      const result = await storage.search(query);
      setEntries(result.entries);
      return result;
    } finally {
      setLoading(false);
    }
  }, [storage]);
  
  // Add new entry
  const addEntry = useCallback(async (
    data: {
      question: string;
      answer: string;
      role: LLMRole;
      provider: LLMProvider;
      filesChanged?: { path: string; changeType: 'created' | 'modified' | 'deleted' | 'renamed' }[];
      tags?: string[];
    }
  ) => {
    const entry = createEntry(data);
    await storage.addEntry(entry);
    await loadStats();
    return entry;
  }, [storage, loadStats]);
  
  // Filter by role
  const filterByRole = useCallback(async (role: LLMRole) => {
    return search({ role });
  }, [search]);
  
  // Filter by provider
  const filterByProvider = useCallback(async (provider: LLMProvider) => {
    return search({ provider });
  }, [search]);
  
  // Filter by tag
  const filterByTag = useCallback(async (tag: string) => {
    return search({ tags: [tag] });
  }, [search]);
  
  // Text search
  const textSearch = useCallback(async (text: string) => {
    return search({ text });
  }, [search]);
  
  // Export
  const exportHistory = useCallback(async () => {
    return storage.exportToJSON();
  }, [storage]);
  
  // Import
  const importHistory = useCallback(async (json: string) => {
    await storage.importFromJSON(json);
    await loadStats();
  }, [storage, loadStats]);
  
  return {
    entries,
    loading,
    stats,
    search,
    addEntry,
    filterByRole,
    filterByProvider,
    filterByTag,
    textSearch,
    exportHistory,
    importHistory,
    refresh: loadStats,
  };
}

// ============================================
// useCurrentSession Hook
// ============================================

export function useCurrentSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const { addEntry } = useAIHistory();
  
  // Start new session
  const startSession = useCallback(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    setSequenceNumber(0);
    return newSessionId;
  }, []);
  
  // Log interaction
  const logInteraction = useCallback(async (
    data: {
      question: string;
      answer: string;
      role: LLMRole;
      provider: LLMProvider;
      filesChanged?: { path: string; changeType: 'created' | 'modified' | 'deleted' | 'renamed' }[];
      tags?: string[];
    }
  ) => {
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = startSession();
    }
    
    const newSequence = sequenceNumber + 1;
    setSequenceNumber(newSequence);
    
    return addEntry({
      ...data,
      // sessionId: currentSessionId,
      // sequenceNumber: newSequence,
    });
  }, [sessionId, sequenceNumber, startSession, addEntry]);
  
  return {
    sessionId,
    sequenceNumber,
    startSession,
    logInteraction,
  };
}
