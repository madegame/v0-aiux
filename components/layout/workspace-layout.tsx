'use client';

/**
 * @component WorkspaceLayout
 * @description v0.app style 3-panel workspace layout with dual chatboxes
 * @ai-context Ana layout - Sol chat, ortada dashboard, sag chat
 */

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DualChatbox } from '@/components/chat/dual-chatbox';
import { CenterPanel } from '@/components/layout/center-panel';
import { SettingsPanel } from '@/components/layout/settings-panel';
import { ProjectProvider, useProject } from '@/components/chat/project-context';
import type { LLMRole, LLMProvider, HistoryEntry } from '@/lib/ai-history/types';
import {
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Settings,
  GitBranch,
  Menu,
  Sparkles,
  Layers,
  X,
  History,
  GitFork,
  RotateCcw,
  FolderPlus,
  FolderEdit,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type CenterView = 'dashboard' | 'files' | 'code-review' | 'database' | 'tasks' | 'integrations' | 'terminal';

function WorkspaceContent() {
  const { currentProject, addHistoryEntry } = useProject();
  
  // Panel states
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobilePanel, setActiveMobilePanel] = useState<'left' | 'center' | 'right'>('center');
  
  // Center panel view
  const [centerView, setCenterView] = useState<CenterView>('dashboard');
  
  // Processing states
  const [leftProcessing, setLeftProcessing] = useState(false);
  const [rightProcessing, setRightProcessing] = useState(false);

  // Listen for settings open requests from chatboxes
  useEffect(() => {
    const handler = () => setSettingsOpen(true);
    window.addEventListener('open-settings', handler);
    return () => window.removeEventListener('open-settings', handler);
  }, []);

  // History entries
  const historyEntries = currentProject?.historyEntries || [];

  // Handle messages from left chatbox (main prompt engine)
  const handleLeftMessage = useCallback(
    async (message: string, role: LLMRole, provider: LLMProvider, model?: string) => {
      setLeftProcessing(true);
      await new Promise((r) => setTimeout(r, 1500));

      const entry: HistoryEntry = {
        id: `entry_${Date.now()}`,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        sessionId: `session_${Date.now()}`,
        sequenceNumber: historyEntries.length + 1,
        provider,
        model,
        role,
        question: message,
        answer: `[Prompt Engine - ${provider}/${model}/${role}]

Analyzing your request...

1. Task identified: "${message.substring(0, 50)}..."
2. Creating PRD for approval
3. Ready to proceed with implementation

Would you like me to:
- Generate detailed PRD
- Start code generation
- Add to task list`,
        filesChanged: [],
        tags: [role, 'prompt-engine'],
        status: 'completed',
      };

      if (currentProject) {
        addHistoryEntry(currentProject.id, entry);
      }

      setLeftProcessing(false);
      return entry.answer;
    },
    [currentProject, addHistoryEntry, historyEntries.length]
  );

  // Handle messages from right chatbox (rules/skills/automation)
  const handleRightMessage = useCallback(
    async (message: string, role: LLMRole, provider: LLMProvider, model?: string) => {
      setRightProcessing(true);
      await new Promise((r) => setTimeout(r, 1200));

      const entry: HistoryEntry = {
        id: `entry_${Date.now()}`,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        sessionId: `session_${Date.now()}`,
        sequenceNumber: historyEntries.length + 1,
        provider,
        model,
        role,
        question: message,
        answer: `[Automation Agent - ${provider}/${model}/${role}]

Processing automation request...

Detected type: ${
          message.toLowerCase().includes('rule') ? 'Rule Configuration' :
          message.toLowerCase().includes('hook') ? 'Hook Setup' :
          message.toLowerCase().includes('skill') ? 'Skill Definition' :
          message.toLowerCase().includes('cron') ? 'Cronjob Schedule' :
          'General Automation'
        }

Configuration applied successfully.`,
        filesChanged: [],
        tags: [role, 'automation'],
        status: 'completed',
      };

      if (currentProject) {
        addHistoryEntry(currentProject.id, entry);
      }

      setRightProcessing(false);
      return entry.answer;
    },
    [currentProject, addHistoryEntry, historyEntries.length]
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-12 bg-card border-b z-50 flex items-center justify-between px-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">AI Starterkit</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setSettingsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-full max-w-sm p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-semibold">Navigation</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-4 space-y-2">
              <Button
                variant={activeMobilePanel === 'left' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => { setActiveMobilePanel('left'); setMobileMenuOpen(false); }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Prompt Engine
              </Button>
              <Button
                variant={activeMobilePanel === 'center' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => { setActiveMobilePanel('center'); setMobileMenuOpen(false); }}
              >
                <Layers className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeMobilePanel === 'right' ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => { setActiveMobilePanel('right'); setMobileMenuOpen(false); }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Automation
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Panel */}
      <SettingsPanel open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col w-full">
        {/* Desktop Header */}
        <header className="flex items-center justify-between px-4 py-2 border-b bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {/* Left Panel Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                  >
                    {leftPanelOpen ? (
                      <PanelLeftClose className="h-4 w-4" />
                    ) : (
                      <PanelLeft className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{leftPanelOpen ? 'Close Prompt Engine' : 'Open Prompt Engine'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Logo */}
            <div className="flex items-center gap-2 pl-2">
              <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-background" />
              </div>
              <div>
                <h1 className="text-sm font-semibold">AI Starterkit</h1>
                <p className="text-[10px] text-muted-foreground">v0.dev Ecosystem Core</p>
              </div>
            </div>
          </div>

          {/* Center - View Selector */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {(['dashboard', 'files', 'code-review', 'tasks', 'integrations', 'terminal'] as CenterView[]).map((view) => (
              <Button
                key={view}
                variant={centerView === view ? 'default' : 'ghost'}
                size="sm"
                className="h-7 text-xs capitalize"
                onClick={() => setCenterView(view)}
              >
                {view.replace('-', ' ')}
              </Button>
            ))}
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            {/* Project Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <FolderEdit className="h-3 w-3" />
                  {currentProject?.name || 'Project'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs">Project</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs">
                  <FolderPlus className="h-3.5 w-3.5 mr-2" />
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <FolderEdit className="h-3.5 w-3.5 mr-2" />
                  Rename Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-destructive">
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* History / Version Management */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <History className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">Chat History & Versions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs">
                  <History className="h-3.5 w-3.5 mr-2" />
                  View Full History
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <GitFork className="h-3.5 w-3.5 mr-2" />
                  Fork Current Session
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs">
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Rollback to Previous
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Recent Sessions:</p>
                  <div className="mt-1 space-y-1">
                    {['Session 1 (current)', 'Session 2 (2h ago)', 'Session 3 (yesterday)'].map((s, i) => (
                      <button key={i} className="w-full text-left text-[10px] px-2 py-1 rounded hover:bg-secondary truncate">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Badge
              variant={currentProject?.gitSynced ? 'default' : 'secondary'}
              className="gap-1 text-xs"
            >
              <GitBranch className="h-3 w-3" />
              {currentProject?.gitBranch || 'local'}
            </Badge>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Right Panel Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  >
                    {rightPanelOpen ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRight className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{rightPanelOpen ? 'Close Automation' : 'Open Automation'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>

        {/* Main Content - 3 Panel Layout */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup 
            key={`layout-${leftPanelOpen}-${rightPanelOpen}`}
            direction="horizontal"
          >
            {/* Left Panel - Prompt Engine Chat */}
            {leftPanelOpen && (
              <>
                <ResizablePanel 
                  id="left-panel"
                  order={1}
                  defaultSize={25} 
                  minSize={15} 
                  maxSize={40}
                >
                  <DualChatbox
                    type="prompt-engine"
                    title="Prompt Engine"
                    subtitle="Main task processing"
                    projectId={currentProject?.id || 'default'}
                    onSendMessage={handleLeftMessage}
                    history={historyEntries.filter(e => e.tags?.includes('prompt-engine'))}
                    isProcessing={leftProcessing}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Center Panel - Dashboard/Files/Code Review */}
            <ResizablePanel 
              id="center-panel"
              order={2}
              defaultSize={leftPanelOpen && rightPanelOpen ? 50 : leftPanelOpen || rightPanelOpen ? 75 : 100} 
              minSize={30}
            >
              <CenterPanel view={centerView} onViewChange={setCenterView} />
            </ResizablePanel>

            {/* Right Panel - Automation/Rules/Skills Chat */}
            {rightPanelOpen && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel 
                  id="right-panel"
                  order={3}
                  defaultSize={25} 
                  minSize={15} 
                  maxSize={40}
                >
                  <DualChatbox
                    type="automation"
                    title="Automation Agent"
                    subtitle="Rules, hooks, skills, cronjobs"
                    projectId={currentProject?.id || 'default'}
                    onSendMessage={handleRightMessage}
                    history={historyEntries.filter(e => e.tags?.includes('automation'))}
                    isProcessing={rightProcessing}
                  />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden flex flex-col w-full pt-12">
        {activeMobilePanel === 'left' && (
          <DualChatbox
            type="prompt-engine"
            title="Prompt Engine"
            subtitle="Main task processing"
            projectId={currentProject?.id || 'default'}
            onSendMessage={handleLeftMessage}
            history={historyEntries.filter(e => e.tags?.includes('prompt-engine'))}
            isProcessing={leftProcessing}
          />
        )}
        {activeMobilePanel === 'center' && (
          <CenterPanel view={centerView} onViewChange={setCenterView} />
        )}
        {activeMobilePanel === 'right' && (
          <DualChatbox
            type="automation"
            title="Automation Agent"
            subtitle="Rules, hooks, skills, cronjobs"
            projectId={currentProject?.id || 'default'}
            onSendMessage={handleRightMessage}
            history={historyEntries.filter(e => e.tags?.includes('automation'))}
            isProcessing={rightProcessing}
          />
        )}

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 flex items-center justify-around border-t bg-card py-2 z-40">
          <Button
            variant={activeMobilePanel === 'left' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col h-auto py-2 px-4"
            onClick={() => setActiveMobilePanel('left')}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] mt-1">Prompt</span>
          </Button>
          <Button
            variant={activeMobilePanel === 'center' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col h-auto py-2 px-4"
            onClick={() => setActiveMobilePanel('center')}
          >
            <Layers className="h-4 w-4" />
            <span className="text-[10px] mt-1">Dashboard</span>
          </Button>
          <Button
            variant={activeMobilePanel === 'right' ? 'default' : 'ghost'}
            size="sm"
            className="flex-col h-auto py-2 px-4"
            onClick={() => setActiveMobilePanel('right')}
          >
            <Settings className="h-4 w-4" />
            <span className="text-[10px] mt-1">Automation</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function WorkspaceLayout() {
  return (
    <ProjectProvider>
      <WorkspaceContent />
    </ProjectProvider>
  );
}
