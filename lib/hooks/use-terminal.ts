import { useState, useCallback, useRef, useEffect } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';

export interface UseTerminalOptions {
  initialCwd?: string;
  fontSize?: number;
  onOutput?: (output: string) => void;
}

export interface TerminalInstance {
  id: string;
  name: string;
  terminal: Terminal;
  fitAddon: FitAddon;
  cwd: string;
  isActive: boolean;
}

export function useTerminal(options: UseTerminalOptions = {}) {
  const { initialCwd = '/', fontSize = 14, onOutput } = options;
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeTerminalId, setActiveTerminalId] = useState<string | null>(null);
  const terminalCounter = useRef(0);

  const createTerminal = useCallback(() => {
    terminalCounter.current += 1;
    const id = `term-${terminalCounter.current}`;

    const terminal = new Terminal({
      fontSize,
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      cursorBlink: true,
      cursorStyle: 'bar',
      theme: {
        background: '#0f0f0f',
        foreground: '#f5f5f5',
        cursor: '#f5f5f5',
        selectionBackground: '#264f78',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    const newTerminal: TerminalInstance = {
      id,
      name: `Terminal ${terminalCounter.current}`,
      terminal,
      fitAddon,
      cwd: initialCwd,
      isActive: true,
    };

    setTerminals((prev) => {
      const deactivated = prev.map((t) => ({ ...t, isActive: false }));
      return [...deactivated, newTerminal];
    });
    setActiveTerminalId(id);

    terminal.onData((data) => {
      const output = data === '\r' ? '\r\n' : data;
      if (onOutput) onOutput(output);
    });

    terminal.writeln(`\x1b[32m$\x1b[0m Initialized ${newTerminal.name}`);
    terminal.writeln('$ Type "help" for commands');
    terminal.writeln('');

    return newTerminal;
  }, [initialCwd, fontSize, onOutput]);

  const closeTerminal = useCallback((id: string) => {
    if (terminals.length <= 1) return;

    setTerminals((prev) => {
      const filtered = prev.filter((t) => t.id !== id);
      if (activeTerminalId === id && filtered.length > 0) {
        setActiveTerminalId(filtered[filtered.length - 1].id);
      }
      return filtered;
    });
  }, [terminals.length, activeTerminalId]);

  const setActiveTerminal = useCallback((id: string) => {
    setActiveTerminalId(id);
    setTerminals((prev) =>
      prev.map((t) => ({ ...t, isActive: t.id === id }))
    );
  }, []);

  const writeToTerminal = useCallback((id: string, data: string) => {
    const term = terminals.find((t) => t.id === id);
    if (term) {
      term.terminal.write(data);
    }
  }, [terminals]);

  const clearTerminal = useCallback((id: string) => {
    const term = terminals.find((t) => t.id === id);
    if (term) {
      term.terminal.clear();
    }
  }, [terminals]);

  const getActiveTerminal = useCallback(() => {
    return terminals.find((t) => t.id === activeTerminalId);
  }, [terminals, activeTerminalId]);

  useEffect(() => {
    return () => {
      terminals.forEach(({ terminal }) => terminal.dispose());
    };
  }, []);

  return {
    terminals,
    activeTerminalId,
    createTerminal,
    closeTerminal,
    setActiveTerminal,
    writeToTerminal,
    clearTerminal,
    getActiveTerminal,
  };
}
