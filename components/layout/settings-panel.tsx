'use client';

/**
 * @component SettingsPanel
 * @description Settings sheet with LLM config, model selection, rules, hooks, skills, roles
 * @ai-context Ayarlar paneli - LLM, model, rules, hooks, skills, roles
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Settings,
  Cpu,
  Key,
  FileText,
  Webhook,
  Zap,
  Users,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// LLM Provider configurations
const LLM_PROVIDERS = [
  { value: 'vercel', label: 'Vercel AI Gateway', models: ['gpt-4o', 'gpt-4o-mini', 'claude-3.5-sonnet', 'gemini-pro'] },
  { value: 'openai', label: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
  { value: 'anthropic', label: 'Anthropic', models: ['claude-3.5-sonnet', 'claude-3-opus', 'claude-3-haiku'] },
  { value: 'google', label: 'Google AI', models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'] },
  { value: 'openrouter', label: 'OpenRouter', models: ['auto', 'meta-llama/llama-3.1-70b', 'mistral/mixtral-8x7b'] },
  { value: 'groq', label: 'Groq', models: ['llama-3.1-70b', 'mixtral-8x7b', 'gemma-7b'] },
  { value: 'roocode', label: 'RooCode', models: ['claude-sonnet-4.5', 'gpt-5', 'claude-opus'] },
  { value: 'kilocode', label: 'KiloCode', models: ['frontier-coding', 'claude-sonnet', 'gpt-4o'] },
  { value: 'cline', label: 'Cline', models: ['grok-2', 'claude-opus', 'gemini-pro-1.5'] },
];

// Demo rules
const DEMO_RULES = [
  { id: '1', name: 'system.md', type: 'system', description: 'Core system rules - read only', editable: false },
  { id: '2', name: 'project.md', type: 'project', description: 'Project-specific rules', editable: true },
  { id: '3', name: 'coding.md', type: 'custom', description: 'Coding standards', editable: true },
];

// Demo hooks
const DEMO_HOOKS = [
  { id: '1', name: 'pre-commit', trigger: 'Before git commit', enabled: true },
  { id: '2', name: 'post-deploy', trigger: 'After Vercel deploy', enabled: true },
  { id: '3', name: 'on-error', trigger: 'On error detection', enabled: false },
];

// Demo skills
const DEMO_SKILLS = [
  { id: '1', name: 'code-review', description: 'Automated code review', category: 'review' },
  { id: '2', name: 'test-generation', description: 'Generate unit tests', category: 'test' },
  { id: '3', name: 'documentation', description: 'Auto-generate docs', category: 'docs' },
];

// Demo roles
const DEMO_ROLES = [
  { id: '1', name: 'task-agent', description: 'Code execution and task completion', permissions: ['code', 'debug', 'test'] },
  { id: '2', name: 'supervisor', description: 'Planning and code review', permissions: ['plan', 'review', 'admin'] },
  { id: '3', name: 'docs-agent', description: 'Documentation specialist', permissions: ['docs', 'ask'] },
];

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState('llm');
  const [selectedProvider, setSelectedProvider] = useState('vercel');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const currentProvider = LLM_PROVIDERS.find(p => p.value === selectedProvider);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </SheetTitle>
          <SheetDescription>
            Configure LLM, rules, hooks, skills, and roles
          </SheetDescription>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
            <TabsTrigger value="llm" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              <Cpu className="h-4 w-4 mr-2" />
              LLM
            </TabsTrigger>
            <TabsTrigger value="rules" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              <FileText className="h-4 w-4 mr-2" />
              Rules
            </TabsTrigger>
            <TabsTrigger value="hooks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              <Webhook className="h-4 w-4 mr-2" />
              Hooks
            </TabsTrigger>
            <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              <Zap className="h-4 w-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="roles" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-3 px-4">
              <Users className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[calc(100vh-180px)]">
            {/* LLM Settings Tab */}
            <TabsContent value="llm" className="p-6 space-y-6 mt-0">
              {/* Provider Selection */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">LLM Provider</Label>
                  <p className="text-xs text-muted-foreground mb-2">Select your preferred AI provider</p>
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LLM_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model Selection */}
                <div>
                  <Label className="text-sm font-medium">Model</Label>
                  <p className="text-xs text-muted-foreground mb-2">Choose the AI model to use</p>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProvider?.models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key */}
                <div>
                  <Label className="text-sm font-medium">API Key</Label>
                  <p className="text-xs text-muted-foreground mb-2">Your provider API key (encrypted)</p>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Advanced Settings */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="advanced">
                    <AccordionTrigger className="text-sm">Advanced Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Stream Responses</Label>
                          <p className="text-xs text-muted-foreground">Enable real-time streaming</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm">Auto-retry on Error</Label>
                          <p className="text-xs text-muted-foreground">Retry failed requests</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div>
                        <Label className="text-sm">Max Tokens</Label>
                        <Input type="number" defaultValue={4096} className="mt-2" />
                      </div>
                      <div>
                        <Label className="text-sm">Temperature</Label>
                        <Input type="number" step="0.1" defaultValue={0.7} min={0} max={2} className="mt-2" />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save LLM Settings
                </Button>
              </div>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="p-6 space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">AI Rules</h3>
                  <p className="text-xs text-muted-foreground">Configure behavior rules for AI agents</p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-2">
                {DEMO_RULES.map((rule) => (
                  <Card key={rule.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{rule.name}</p>
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={rule.type === 'system' ? 'secondary' : 'outline'} className="text-xs">
                            {rule.type}
                          </Badge>
                          {rule.editable ? (
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Read Only
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Rule Editor */}
              <Card className="border-dashed">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Quick Edit: project.md</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    className="min-h-[150px] font-mono text-xs"
                    defaultValue={`# Project Rules

## Code Style
- Use TypeScript strict mode
- Prefer functional components
- Use Tailwind CSS for styling

## AI Behavior
- Always explain changes
- Follow existing patterns
- Add comments for complex logic`}
                  />
                  <Button size="sm" className="mt-3">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hooks Tab */}
            <TabsContent value="hooks" className="p-6 space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Hooks</h3>
                  <p className="text-xs text-muted-foreground">Event-triggered automations</p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Hook
                </Button>
              </div>

              <div className="space-y-2">
                {DEMO_HOOKS.map((hook) => (
                  <Card key={hook.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Webhook className={`h-4 w-4 ${hook.enabled ? 'text-emerald-400' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="text-sm font-medium">{hook.name}</p>
                            <p className="text-xs text-muted-foreground">{hook.trigger}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch defaultChecked={hook.enabled} />
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="p-6 space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Skills</h3>
                  <p className="text-xs text-muted-foreground">Reusable AI capabilities</p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Skill
                </Button>
              </div>

              <div className="space-y-2">
                {DEMO_SKILLS.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <div>
                            <p className="text-sm font-medium">{skill.name}</p>
                            <p className="text-xs text-muted-foreground">{skill.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="p-6 space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Agent Roles</h3>
                  <p className="text-xs text-muted-foreground">Define AI agent personas and permissions</p>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Role
                </Button>
              </div>

              <div className="space-y-2">
                {DEMO_ROLES.map((role) => (
                  <Card key={role.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-violet-400" />
                          <div>
                            <p className="text-sm font-medium">{role.name}</p>
                            <p className="text-xs text-muted-foreground">{role.description}</p>
                            <div className="flex gap-1 mt-1">
                              {role.permissions.map((perm) => (
                                <Badge key={perm} variant="secondary" className="text-[10px] px-1.5">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
