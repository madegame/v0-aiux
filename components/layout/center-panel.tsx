'use client';

/**
 * @component CenterPanel
 * @description Center dashboard with multiple views (files, code review, tasks, integrations)
 * @ai-context Orta panel - v0.app stilinde dashboard
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  FolderOpen,
  FileCode,
  GitPullRequest,
  Database,
  ListTodo,
  Layers,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  Zap,
  Cloud,
  Shield,
  GitBranch,
  Package,
  Terminal,
  Box,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FileExplorer } from '@/components/chat/file-explorer';
import { TerminalPanel } from '@/components/workspace/terminal-panel';

type CenterView = 'dashboard' | 'files' | 'code-review' | 'database' | 'tasks' | 'integrations' | 'terminal';

interface CenterPanelProps {
  view: CenterView;
  onViewChange: (view: CenterView) => void;
}

// Demo files for file explorer
const DEMO_FILES = [
  { id: 'app', name: 'app', type: 'folder' as const, path: 'app', category: 'src' as const, children: [
    { id: 'app/page.tsx', name: 'page.tsx', type: 'file' as const, path: 'app/page.tsx', extension: 'tsx', isEditable: true, category: 'src' as const },
    { id: 'app/layout.tsx', name: 'layout.tsx', type: 'file' as const, path: 'app/layout.tsx', extension: 'tsx', isEditable: true, category: 'src' as const },
  ]},
  { id: '.ai', name: '.ai', type: 'folder' as const, path: '.ai', category: 'ai' as const, children: [
    { id: '.ai/rules', name: 'rules', type: 'folder' as const, path: '.ai/rules', category: 'ai' as const, children: [
      { id: '.ai/rules/system.md', name: 'system.md', type: 'file' as const, path: '.ai/rules/system.md', extension: 'md', isEditable: false, category: 'ai' as const },
    ]},
  ]},
];

// Demo tasks
const DEMO_TASKS = [
  { id: '1', title: 'Setup authentication flow', status: 'completed' as const, priority: 'high' as const, tags: ['auth', 'security'] },
  { id: '2', title: 'Create dashboard UI', status: 'in-progress' as const, priority: 'high' as const, tags: ['ui', 'dashboard'] },
  { id: '3', title: 'Integrate Supabase database', status: 'in-progress' as const, priority: 'medium' as const, tags: ['database', 'supabase'] },
  { id: '4', title: 'Add AI chat functionality', status: 'todo' as const, priority: 'high' as const, tags: ['ai', 'chat'] },
  { id: '5', title: 'Deploy to Vercel', status: 'todo' as const, priority: 'low' as const, tags: ['deploy', 'vercel'] },
];

// Stats cards data
const STATS = [
  { label: 'Tasks Completed', value: '12', change: '+3 today', icon: CheckCircle2, color: 'text-emerald-400' },
  { label: 'Active Sessions', value: '3', change: '2 agents', icon: Zap, color: 'text-yellow-400' },
  { label: 'Files Modified', value: '28', change: 'Last 24h', icon: FileCode, color: 'text-blue-400' },
  { label: 'Integrations', value: '5', change: 'All active', icon: Package, color: 'text-violet-400' },
];

function DashboardView() {
  return (
    <div className="p-4 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((stat, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <Badge variant="secondary" className="text-[10px]">{stat.change}</Badge>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button variant="outline" className="h-auto py-3 flex-col gap-1">
            <Plus className="h-4 w-4" />
            <span className="text-xs">New Task</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1">
            <GitPullRequest className="h-4 w-4" />
            <span className="text-xs">Create PR</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1">
            <Terminal className="h-4 w-4" />
            <span className="text-xs">Run Script</span>
          </Button>
          <Button variant="outline" className="h-auto py-3 flex-col gap-1">
            <Cloud className="h-4 w-4" />
            <span className="text-xs">Deploy</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity & Tasks */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Recent Tasks</CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs">View All</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {DEMO_TASKS.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50">
                {task.status === 'completed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : task.status === 'in-progress' ? (
                  <Clock className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{task.title}</p>
                  <div className="flex gap-1 mt-1">
                    {task.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">{tag}</Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Project Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Project Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Overall Completion</span>
                <span className="text-muted-foreground">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>UI Components</span>
                <span className="text-muted-foreground">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>API Integration</span>
                <span className="text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Testing</span>
                <span className="text-muted-foreground">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FilesView() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('code');
  const [terminalOpen, setTerminalOpen] = useState(false);

  const DEMO_CODE = `// ${selectedFile || 'file.tsx'}
'use client';

import { useState } from 'react';

export default function Component() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Hello World</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}`;

  return (
    <div className="flex flex-col h-full">
      {/* VSCode-style Layout */}
      <div className="flex flex-1 min-h-0">
        {/* Explorer Sidebar - Full Height */}
        <div className="w-56 border-r bg-card flex flex-col h-full shrink-0">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Explorer</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <Plus className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <FolderOpen className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <FileExplorer
              files={DEMO_FILES}
              selectedFile={selectedFile || undefined}
              onSelectFile={setSelectedFile}
            />
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab Bar with View Toggle */}
          <div className="h-9 border-b bg-card flex items-center justify-between px-2 shrink-0">
            <div className="flex items-center gap-1">
              {selectedFile && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-t-md border border-b-0 -mb-px">
                  <FileCode className="h-3.5 w-3.5" />
                  <span className="text-xs">{selectedFile.split('/').pop()}</span>
                  <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-destructive/20">
                    <span className="text-[10px]">&times;</span>
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                <TabsList className="h-7">
                  <TabsTrigger value="code" className="text-[10px] h-5 px-2">
                    <FileCode className="h-3 w-3 mr-1" />
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-[10px] h-5 px-2">
                    <Play className="h-3 w-3 mr-1" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="split" className="text-[10px] h-5 px-2">
                    <Layers className="h-3 w-3 mr-1" />
                    Split
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Code/Preview Area */}
          <div className="flex-1 min-h-0">
            {selectedFile ? (
              <div className={`h-full ${viewMode === 'split' ? 'flex' : ''}`}>
                {/* Code Panel */}
                {(viewMode === 'code' || viewMode === 'split') && (
                  <div className={`${viewMode === 'split' ? 'w-1/2 border-r' : 'w-full'} h-full`}>
                    <ScrollArea className="h-full">
                      <pre className="text-xs p-4 font-mono leading-relaxed">
                        <code>{DEMO_CODE}</code>
                      </pre>
                    </ScrollArea>
                  </div>
                )}
                {/* Preview Panel */}
                {(viewMode === 'preview' || viewMode === 'split') && (
                  <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full bg-background`}>
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-border/50 m-2 rounded-lg">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                          <Play className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">Live Preview</h3>
                        <p className="text-xs text-muted-foreground">Component preview will appear here</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Select a file to view</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the explorer on the left</p>
                </div>
              </div>
            )}
          </div>

          {/* Terminal at Bottom */}
          {terminalOpen && (
            <div className="h-48 border-t bg-card shrink-0">
              <div className="h-7 border-b flex items-center justify-between px-3 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <Terminal className="h-3.5 w-3.5" />
                  <span className="text-xs">Terminal</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5"
                  onClick={() => setTerminalOpen(false)}
                >
                  <span className="text-[10px]">&times;</span>
                </Button>
              </div>
              <ScrollArea className="h-[calc(100%-1.75rem)]">
                <div className="p-3 font-mono text-xs text-muted-foreground">
                  <p>$ npm run dev</p>
                  <p className="text-emerald-400">ready - started server on 0.0.0.0:3000</p>
                  <p className="text-muted-foreground/60">Waiting for input...</p>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 border-t bg-card flex items-center justify-between px-3 shrink-0">
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            main
          </span>
          <span>TypeScript</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 text-[10px] px-2"
            onClick={() => setTerminalOpen(!terminalOpen)}
          >
            <Terminal className="h-3 w-3 mr-1" />
            Terminal
          </Button>
        </div>
      </div>
    </div>
  );
}

function CodeReviewView() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Code Review</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reviews..." className="pl-8 w-64 h-8" />
          </div>
          <Button size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            New Review
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { title: 'Auth flow refactor', branch: 'feature/auth', status: 'pending', comments: 5 },
          { title: 'Dashboard components', branch: 'feature/dashboard', status: 'approved', comments: 12 },
          { title: 'API error handling', branch: 'fix/api-errors', status: 'changes', comments: 3 },
        ].map((review, i) => (
          <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitPullRequest className={`h-5 w-5 ${
                    review.status === 'approved' ? 'text-emerald-400' :
                    review.status === 'changes' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`} />
                  <div>
                    <p className="font-medium text-sm">{review.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs gap-1">
                        <GitBranch className="h-3 w-3" />
                        {review.branch}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{review.comments} comments</span>
                    </div>
                  </div>
                </div>
                <Badge variant={
                  review.status === 'approved' ? 'default' :
                  review.status === 'changes' ? 'secondary' :
                  'outline'
                } className="capitalize">{review.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Task type for UI display
interface UITask {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

function TasksView() {
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  
  // Using demo tasks for now - will connect to API route for task storage
  const tasks: UITask[] = DEMO_TASKS;

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Task List</h2>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs h-6">All</TabsTrigger>
              <TabsTrigger value="todo" className="text-xs h-6">Todo</TabsTrigger>
              <TabsTrigger value="in-progress" className="text-xs h-6">In Progress</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs h-6">Done</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ListTodo className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No tasks yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Tasks are created when you assign work to agents
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:bg-card/80 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : task.status === 'in-progress' ? (
                      <Clock className="h-4 w-4 text-yellow-400" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex-1">
                    <p className={`text-sm ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5">{tag}</Badge>
                      ))}
                      <Badge variant={
                        task.priority === 'high' ? 'destructive' :
                        task.priority === 'medium' ? 'default' :
                        'secondary'
                      } className="text-[10px] px-1.5 capitalize">{task.priority}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function IntegrationsView() {
  const integrations = [
    { name: 'Supabase', description: 'Database & Auth', status: 'connected', icon: Database, color: 'text-emerald-400' },
    { name: 'Vercel', description: 'Deployment & Hosting', status: 'connected', icon: Cloud, color: 'text-foreground' },
    { name: 'GitHub', description: 'Version Control', status: 'connected', icon: GitBranch, color: 'text-foreground' },
    { name: 'Neon', description: 'Serverless Postgres', status: 'available', icon: Database, color: 'text-cyan-400' },
    { name: 'Vercel AI SDK', description: 'AI Integration', status: 'connected', icon: Zap, color: 'text-yellow-400' },
    { name: 'Playwright', description: 'E2E Testing', status: 'available', icon: Terminal, color: 'text-pink-400' },
    { name: 'MCP', description: 'Model Context Protocol', status: 'available', icon: Box, color: 'text-violet-400' },
    { name: 'Stripe', description: 'Payments', status: 'available', icon: Shield, color: 'text-blue-400' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Integrations</h2>
          <p className="text-sm text-muted-foreground">Vercel Ecosystem & Third-party Services</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {integrations.map((integration, i) => (
              <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${integration.color}`}>
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'} className="text-xs capitalize">
                      {integration.status}
                    </Badge>
                  </div>
                  {integration.status === 'connected' && (
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Configure
                        <ArrowUpRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                  {integration.status === 'available' && (
                    <div className="mt-3 pt-3 border-t">
                      <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                        Connect
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="connected" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {integrations.filter(i => i.status === 'connected').map((integration, i) => (
              <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${integration.color}`}>
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Badge variant="default" className="text-xs">Connected</Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      Configure
                      <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="available" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {integrations.filter(i => i.status === 'available').map((integration, i) => (
              <Card key={i} className="hover:bg-card/80 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-secondary flex items-center justify-center ${integration.color}`}>
                        <integration.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Available</Badge>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full h-7 text-xs">
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Future Phases Section */}
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Box className="h-4 w-4 text-muted-foreground" />
            Sandbox & Future Phases
          </CardTitle>
          <CardDescription className="text-xs">
            Reserved for upcoming features and experimental integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-2">
            {['Multi-Agent Orchestration', 'Real-time Collaboration', 'Custom MCP Servers'].map((feature, i) => (
              <div key={i} className="p-3 rounded-md border border-dashed bg-secondary/30 text-center">
                <p className="text-xs text-muted-foreground">{feature}</p>
                <Badge variant="outline" className="text-[10px] mt-2">Coming Soon</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CenterPanel({ view, onViewChange }: CenterPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      <ScrollArea className="flex-1">
        {view === 'dashboard' && <DashboardView />}
        {view === 'files' && <FilesView />}
        {view === 'code-review' && <CodeReviewView />}
        {view === 'tasks' && <TasksView />}
        {view === 'integrations' && <IntegrationsView />}
        {view === 'terminal' && <TerminalPanel />}
        {view === 'database' && (
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database Explorer
                </CardTitle>
                <CardDescription className="text-xs">
                  Connect a database integration to explore your data
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-4">No database connected</p>
                <Button size="sm" onClick={() => onViewChange('integrations')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Database Integration
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
