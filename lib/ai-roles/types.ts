/**
 * LLM Roles System
 * Her LLM'e farklı roller atanabilir
 * Roller sistem veya proje seviyesinde tanımlanabilir
 */

// ============================================
// ROLE TYPES
// ============================================

export type RoleLevel = 'system' | 'project';

export interface RoleCapability {
  name: string;
  description: string;
  enabled: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  displayName: string;
  description: string;
  level: RoleLevel;
  
  // Capabilities
  capabilities: {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canCreateFiles: boolean;
    canModifyConfig: boolean;
    canAccessSecrets: boolean;
    canRunCommands: boolean;
    canModifyGit: boolean;
  };
  
  // Allowed file patterns (glob)
  allowedPaths: string[];
  deniedPaths: string[];
  
  // Prompt templates
  systemPrompt?: string;
  contextFiles?: string[];  // Files to include in context
  
  // UI
  icon?: string;
  color?: string;
}

// ============================================
// DEFAULT ROLES (System Level - Immutable)
// ============================================

export const SYSTEM_ROLES: Record<string, RoleDefinition> = {
  ask: {
    id: 'ask',
    name: 'ask',
    displayName: 'Ask',
    description: 'Soru sorma, açıklama alma, kod okuma. Değişiklik yapamaz.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canCreateFiles: false,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: false,
      canModifyGit: false,
    },
    allowedPaths: ['**/*'],
    deniedPaths: ['.env*', '**/secrets/**'],
    icon: 'HelpCircle',
    color: 'blue',
  },
  
  code: {
    id: 'code',
    name: 'code',
    displayName: 'Code',
    description: 'Kod yazma, düzenleme, refactor. Tam yazma yetkisi.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canCreateFiles: true,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: false,
      canModifyGit: true,
    },
    allowedPaths: ['**/*.{ts,tsx,js,jsx,css,json,md}'],
    deniedPaths: ['.env*', 'package-lock.json', 'pnpm-lock.yaml'],
    icon: 'Code',
    color: 'green',
  },
  
  debug: {
    id: 'debug',
    name: 'debug',
    displayName: 'Debug',
    description: 'Hata ayıklama, log analizi, sorun tespiti.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canCreateFiles: false,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: true,
      canModifyGit: false,
    },
    allowedPaths: ['**/*'],
    deniedPaths: ['.env*'],
    icon: 'Bug',
    color: 'orange',
  },
  
  plan: {
    id: 'plan',
    name: 'plan',
    displayName: 'Plan',
    description: 'Planlama, mimari tasarım, roadmap. Sadece docs yazabilir.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canCreateFiles: true,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: false,
      canModifyGit: false,
    },
    allowedPaths: ['docs/**', '.ai/**', '**/*.md'],
    deniedPaths: ['**/!(*.md)'],
    icon: 'Map',
    color: 'purple',
  },
  
  review: {
    id: 'review',
    name: 'review',
    displayName: 'Review',
    description: 'Kod inceleme, PR review, öneriler. Yazma yetkisi yok.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: false,
      canDelete: false,
      canCreateFiles: false,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: false,
      canModifyGit: false,
    },
    allowedPaths: ['**/*'],
    deniedPaths: ['.env*', '**/secrets/**'],
    icon: 'Eye',
    color: 'cyan',
  },
  
  test: {
    id: 'test',
    name: 'test',
    displayName: 'Test',
    description: 'Test yazma, test analizi. Sadece test dosyalarını değiştirir.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canCreateFiles: true,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: true,
      canModifyGit: false,
    },
    allowedPaths: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '__tests__/**'],
    deniedPaths: [],
    icon: 'TestTube',
    color: 'yellow',
  },
  
  docs: {
    id: 'docs',
    name: 'docs',
    displayName: 'Docs',
    description: 'Dokümantasyon yazma. Sadece md/mdx dosyaları.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: false,
      canCreateFiles: true,
      canModifyConfig: false,
      canAccessSecrets: false,
      canRunCommands: false,
      canModifyGit: false,
    },
    allowedPaths: ['**/*.md', '**/*.mdx', 'docs/**'],
    deniedPaths: [],
    icon: 'FileText',
    color: 'gray',
  },
  
  admin: {
    id: 'admin',
    name: 'admin',
    displayName: 'Admin',
    description: 'Tam yetki. Sadece güvenilir ortamlarda kullanın.',
    level: 'system',
    capabilities: {
      canRead: true,
      canWrite: true,
      canDelete: true,
      canCreateFiles: true,
      canModifyConfig: true,
      canAccessSecrets: true,
      canRunCommands: true,
      canModifyGit: true,
    },
    allowedPaths: ['**/*'],
    deniedPaths: [],
    icon: 'Shield',
    color: 'red',
  },
};

// ============================================
// PROVIDER ROLE ASSIGNMENT
// ============================================

export interface ProviderRoleAssignment {
  provider: string;
  defaultRole: string;
  allowedRoles: string[];
  customPrompt?: string;
}

export const DEFAULT_PROVIDER_ROLES: ProviderRoleAssignment[] = [
  // AI Model Providers (for API usage)
  {
    provider: 'openai',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'plan', 'review', 'test', 'docs'],
  },
  {
    provider: 'anthropic',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'plan', 'review', 'test', 'docs'],
  },
  {
    provider: 'google',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'plan', 'review'],
  },
  {
    provider: 'openrouter',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'plan', 'review', 'test', 'docs'],
  },
  {
    provider: 'groq',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug'],
  },
  // IDE/Tool Providers (for context)
  {
    provider: 'cursor',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'test'],
  },
  {
    provider: 'v0',
    defaultRole: 'code',
    allowedRoles: ['code', 'plan'],
  },
  {
    provider: 'cline',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'plan', 'test'],
  },
  {
    provider: 'claude-code',
    defaultRole: 'plan',
    allowedRoles: ['ask', 'code', 'debug', 'plan', 'review', 'admin'],
  },
  {
    provider: 'windsurf',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug', 'plan'],
  },
  {
    provider: 'roocode',
    defaultRole: 'code',
    allowedRoles: ['ask', 'code', 'debug'],
  },
  {
    provider: 'kilocode',
    defaultRole: 'ask',
    allowedRoles: ['ask', 'code'],
  },
];

// ============================================
// ROLE CONTEXT
// ============================================

export interface RoleContext {
  role: RoleDefinition;
  provider: string;
  sessionId: string;
  startedAt: string;
  
  // Current state
  filesAccessed: string[];
  filesModified: string[];
  commandsRun: string[];
}

export function createRoleContext(
  roleId: string,
  provider: string
): RoleContext {
  const role = SYSTEM_ROLES[roleId];
  if (!role) {
    throw new Error(`Unknown role: ${roleId}`);
  }
  
  return {
    role,
    provider,
    sessionId: `${roleId}_${Date.now()}`,
    startedAt: new Date().toISOString(),
    filesAccessed: [],
    filesModified: [],
    commandsRun: [],
  };
}

// ============================================
// PERMISSION CHECK
// ============================================

export function checkPermission(
  context: RoleContext,
  action: keyof RoleDefinition['capabilities'],
  path?: string
): { allowed: boolean; reason?: string } {
  const { role } = context;
  
  // Check capability
  if (!role.capabilities[action]) {
    return {
      allowed: false,
      reason: `Role "${role.displayName}" does not have "${action}" capability`,
    };
  }
  
  // Check path if provided
  if (path) {
    const isAllowed = matchesGlob(path, role.allowedPaths);
    const isDenied = matchesGlob(path, role.deniedPaths);
    
    if (isDenied) {
      return {
        allowed: false,
        reason: `Path "${path}" is denied for role "${role.displayName}"`,
      };
    }
    
    if (!isAllowed) {
      return {
        allowed: false,
        reason: `Path "${path}" is not in allowed paths for role "${role.displayName}"`,
      };
    }
  }
  
  return { allowed: true };
}

// Simple glob matcher (in real implementation, use minimatch or similar)
function matchesGlob(path: string, patterns: string[]): boolean {
  // Simplified - would use proper glob matching
  return patterns.some(pattern => {
    if (pattern === '**/*') return true;
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(path);
    }
    return path.startsWith(pattern);
  });
}
