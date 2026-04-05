export interface TerminalTab {
  id: string;
  name: string;
  cwd: string;
  isActive: boolean;
  output: string[];
}

export interface TerminalSession {
  id: string;
  name: string;
  cwd: string;
  createdAt: string;
  output: string[];
}

export interface TerminalConfig {
  fontSize: number;
  fontFamily: string;
  theme: 'light' | 'dark';
  scrollback: number;
}

export const DEFAULT_TERMINAL_CONFIG: TerminalConfig = {
  fontSize: 14,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  theme: 'dark',
  scrollback: 1000,
};

export function createTerminalSession(name?: string): TerminalSession {
  return {
    id: `term_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: name || `Terminal ${Date.now()}`,
    cwd: process.cwd(),
    createdAt: new Date().toISOString(),
    output: [],
  };
}

export function formatAnsiOutput(output: string): string {
  const ansiColors: Record<string, string> = {
    '30': 'text-black',
    '31': 'text-red-500',
    '32': 'text-green-500',
    '33': 'text-yellow-500',
    '34': 'text-blue-500',
    '35': 'text-purple-500',
    '36': 'text-cyan-500',
    '37': 'text-white',
    '90': 'text-gray-500',
  };
  
  return output
    .replace(/\x1b\[(\d+)m/g, '')
    .replace(/\x1b\[(\d+);(\d+)m/g, '')
    .replace(/\x1b\[[\d;]*[A-Z]/g, '');
}

export function truncateOutput(output: string[], maxLines: number): string[] {
  if (output.length <= maxLines) return output;
  return output.slice(-maxLines);
}
