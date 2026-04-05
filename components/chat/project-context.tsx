'use client';

/**
 * @component ProjectContext
 * @description Project isolation context provider
 * @ai-context Proje izolasyonu - her proje kendi kuralları, LLM ayarları
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LLMRole, LLMProvider, HistoryEntry } from '@/lib/ai-history/types';

export interface ProjectConfig {
  id: string;
  name: string;
  path: string;
  createdAt: string;
  lastModified: string;
  // LLM Settings - project specific
  defaultProvider: LLMProvider;
  defaultRole: LLMRole;
  apiKeys: Record<LLMProvider, string>;
  // Rules - project specific
  systemRulesPath: string;
  projectRulesPath: string;
  // History
  historyPath: string;
  historyEntries: HistoryEntry[];
  // Git
  gitBranch?: string;
  gitRemote?: string;
  gitSynced: boolean;
  // Metadata
  tags: string[];
  status: 'active' | 'archived' | 'template';
}

interface ProjectContextValue {
  // Current project
  currentProject: ProjectConfig | null;
  projects: ProjectConfig[];
  // Actions
  setCurrentProject: (projectId: string) => void;
  createProject: (name: string, path: string) => ProjectConfig;
  updateProject: (projectId: string, updates: Partial<ProjectConfig>) => void;
  deleteProject: (projectId: string) => void;
  archiveProject: (projectId: string) => void;
  duplicateProject: (projectId: string, newName: string) => ProjectConfig;
  // LLM Settings
  updateLLMSettings: (projectId: string, provider: LLMProvider, role: LLMRole) => void;
  setApiKey: (projectId: string, provider: LLMProvider, key: string) => void;
  // History
  addHistoryEntry: (projectId: string, entry: HistoryEntry) => void;
  clearHistory: (projectId: string) => void;
  exportHistory: (projectId: string) => string;
  importHistory: (projectId: string, json: string) => void;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

// Default project template
const createDefaultProject = (id: string, name: string, path: string): ProjectConfig => ({
  id,
  name,
  path,
  createdAt: new Date().toISOString(),
  lastModified: new Date().toISOString(),
  defaultProvider: 'cursor',
  defaultRole: 'code',
  apiKeys: {} as Record<LLMProvider, string>,
  systemRulesPath: `${path}/.ai/system-rules.md`,
  projectRulesPath: `${path}/.ai/project-rules.md`,
  historyPath: `${path}/.ai/history`,
  historyEntries: [],
  gitSynced: false,
  tags: [],
  status: 'active',
});

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<ProjectConfig[]>([
    createDefaultProject('project_default', 'AI-First Dev', '/vercel/share/v0-project'),
  ]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('project_default');

  const currentProject = projects.find((p) => p.id === currentProjectId) || null;

  const setCurrentProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
  }, []);

  const createProject = useCallback((name: string, path: string): ProjectConfig => {
    const id = `project_${Date.now()}`;
    const newProject = createDefaultProject(id, name, path);
    setProjects((prev) => [...prev, newProject]);
    setCurrentProjectId(id);
    return newProject;
  }, []);

  const updateProject = useCallback((projectId: string, updates: Partial<ProjectConfig>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, ...updates, lastModified: new Date().toISOString() }
          : p
      )
    );
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (currentProjectId === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      setCurrentProjectId(remaining[0]?.id || '');
    }
  }, [currentProjectId, projects]);

  const archiveProject = useCallback((projectId: string) => {
    updateProject(projectId, { status: 'archived' });
  }, [updateProject]);

  const duplicateProject = useCallback((projectId: string, newName: string): ProjectConfig => {
    const source = projects.find((p) => p.id === projectId);
    if (!source) throw new Error('Project not found');

    const id = `project_${Date.now()}`;
    const newProject: ProjectConfig = {
      ...source,
      id,
      name: newName,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      historyEntries: [], // Don't copy history
      gitSynced: false,
    };
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, [projects]);

  const updateLLMSettings = useCallback((projectId: string, provider: LLMProvider, role: LLMRole) => {
    updateProject(projectId, { defaultProvider: provider, defaultRole: role });
  }, [updateProject]);

  const setApiKey = useCallback((projectId: string, provider: LLMProvider, key: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, apiKeys: { ...p.apiKeys, [provider]: key } }
          : p
      )
    );
  }, []);

  const addHistoryEntry = useCallback((projectId: string, entry: HistoryEntry) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, historyEntries: [entry, ...p.historyEntries] }
          : p
      )
    );
  }, []);

  const clearHistory = useCallback((projectId: string) => {
    updateProject(projectId, { historyEntries: [] });
  }, [updateProject]);

  const exportHistory = useCallback((projectId: string): string => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return '[]';
    return JSON.stringify(project.historyEntries, null, 2);
  }, [projects]);

  const importHistory = useCallback((projectId: string, json: string) => {
    try {
      const entries = JSON.parse(json) as HistoryEntry[];
      updateProject(projectId, { historyEntries: entries });
    } catch (e) {
      console.error('Failed to import history:', e);
    }
  }, [updateProject]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        setCurrentProject,
        createProject,
        updateProject,
        deleteProject,
        archiveProject,
        duplicateProject,
        updateLLMSettings,
        setApiKey,
        addHistoryEntry,
        clearHistory,
        exportHistory,
        importHistory,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
