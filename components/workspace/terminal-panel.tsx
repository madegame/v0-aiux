'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Terminal as TerminalIcon,
  Plus,
  X,
  Maximize2,
  Minimize2,
  Trash2,
  Copy,
  Settings,
  Play,
} from 'lucide-react';

interface TerminalTab {
  id: string;
  name: string;
  output: string[];
  cwd: string;
  isActive: boolean;
}

interface TerminalPanelProps {
  onMinimize?: () => void;
  isMinimized?: boolean;
}

const MAX_OUTPUT_LINES = 1000;

export function TerminalPanel({ onMinimize, isMinimized = false }: TerminalPanelProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    { id: 'term-1', name: 'Terminal 1', output: [], cwd: '/', isActive: true },
  ]);
  const [activeTabId, setActiveTabId] = useState('term-1');
  const [isMaximized, setIsMaximized] = useState(false);
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tabCounterRef = useRef(1);

  const activeTab = tabs.find(t => t.id === activeTabId);

  useEffect(() => {
    if (activeTab && activeTab.output.length === 0) {
      setTabs(prev => prev.map(t => 
        t.id === activeTabId 
          ? { ...t, output: ['$ Welcome to AI Starterkit Terminal', '$ Type commands and press Enter', ''] }
          : t
      ));
    }
  }, [activeTabId]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [activeTab?.output]);

  const addTab = useCallback(() => {
    tabCounterRef.current += 1;
    const newTab: TerminalTab = {
      id: `term-${tabCounterRef.current}`,
      name: `Terminal ${tabCounterRef.current}`,
      output: [],
      cwd: '/',
      isActive: false,
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((tabId: string) => {
    if (tabs.length === 1) return;
    setTabs((prev) => {
      const newTabs = prev.filter((t) => t.id !== tabId);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
      return newTabs;
    });
  }, [tabs.length, activeTabId]);

  const selectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    setTabs((prev) =>
      prev.map((t) => ({ ...t, isActive: t.id === tabId }))
    );
  }, []);

  const executeCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim() || isExecuting) return;

    const currentTab = tabs.find(t => t.id === activeTabId);
    if (!currentTab) return;

    setIsExecuting(true);
    
    const newOutput = [
      ...currentTab.output,
      `$ ${cmd}`,
    ];

    setTabs(prev => prev.map(t => 
      t.id === activeTabId ? { ...t, output: newOutput } : t
    ));

    try {
      const response = await fetch('/api/terminal/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: cmd, 
          cwd: currentTab.cwd 
        }),
      });

      const result = await response.json();

      if (result.success) {
        const outputLines = result.output 
          ? result.output.split('\n').filter(Boolean)
          : [];
        const finalOutput = [
          ...newOutput,
          ...outputLines,
          ''
        ];
        setTabs(prev => prev.map(t => 
          t.id === activeTabId ? { ...t, output: finalOutput.slice(-MAX_OUTPUT_LINES) } : t
        ));
      } else {
        const errorLines = result.error?.split('\n').filter(Boolean) || [result.error];
        const finalOutput = [
          ...newOutput,
          ...errorLines.map(e => `\x1b[31m${e}\x1b[0m`),
          ''
        ];
        setTabs(prev => prev.map(t => 
          t.id === activeTabId ? { ...t, output: finalOutput.slice(-MAX_OUTPUT_LINES) } : t
        ));
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      const finalOutput = [
        ...newOutput,
        `\x1b[31mError: ${errMsg}\x1b[0m`,
        ''
      ];
      setTabs(prev => prev.map(t => 
        t.id === activeTabId ? { ...t, output: finalOutput.slice(-MAX_OUTPUT_LINES) } : t
      ));
    } finally {
      setIsExecuting(false);
      setInput('');
    }
  }, [activeTabId, tabs, isExecuting]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  if (isMinimized) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Terminal</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={addTab}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
          {onMinimize && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onMinimize}
            >
              <Minimize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Terminal Tabs */}
      <div className="flex items-center gap-1 px-2 py-1 border-b bg-muted/30 overflow-x-auto">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
              tab.isActive
                ? 'bg-background text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => selectTab(tab.id)}
          >
            <TerminalIcon className="h-3 w-3" />
            <span className="whitespace-nowrap">{tab.name}</span>
            {tabs.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X className="h-2 w-2" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Terminal Content */}
      <div className="flex-1 flex flex-col bg-[#0f0f0f]">
        <div
          ref={outputRef}
          className="flex-1 overflow-auto p-2 font-mono text-sm"
          style={{
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '13px',
            lineHeight: '1.4',
          }}
        >
          {activeTab?.output.map((line, i) => (
            <div 
              key={i} 
              className="whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ 
                __html: line
                  .replace(/\x1b\[32m/g, '<span class="text-green-500">')
                  .replace(/\x1b\[31m/g, '<span class="text-red-500">')
                  .replace(/\x1b\[33m/g, '<span class="text-yellow-500">')
                  .replace(/\x1b\[34m/g, '<span class="text-blue-500">')
                  .replace(/\x1b\[0m/g, '</span>')
              }}
            />
          ))}
        </div>

        {/* Input Line */}
        <div className="flex items-center gap-2 px-3 py-2 border-t border-[#333]">
          <span className="text-green-500 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isExecuting}
            className="flex-1 bg-transparent outline-none text-sm font-mono text-[#f5f5f5]"
            placeholder="Type command..."
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => executeCommand(input)}
            disabled={isExecuting || !input.trim()}
          >
            <Play className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="flex items-center justify-between px-3 py-1 border-t bg-card text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>bash</span>
          <span>•</span>
          <span>UTF-8</span>
          <span>•</span>
          <span>{activeTab?.cwd || '/'}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-5 w-5">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
