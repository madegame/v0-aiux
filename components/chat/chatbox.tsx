'use client';

/**
 * @component Chatbox
 * @description Cline-style chat interface with Plan/Act toggle
 * @ai-context Ana chat bileseni - Cline tarzinda tasarim
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  FolderOpen,
  X,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Code,
  FileText,
  Bug,
  Search,
  BookOpen,
  TestTube,
  Shield,
  AtSign,
  Plus,
  Menu,
  ChevronDown,
  Settings,
  Slash,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getModelsForProvider } from '@/lib/ai/provider/models';
import type { LLMRole, LLMProvider, HistoryEntry } from '@/lib/ai-history/types';
import { getDefaultModel } from '@/lib/ai/provider/models';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  llmRole?: LLMRole;
  provider?: LLMProvider;
  model?: string;
  attachments?: Attachment[];
  filesChanged?: { path: string; changeType: 'created' | 'modified' | 'deleted' }[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'folder';
  size?: number;
  preview?: string;
}

interface ChatboxProps {
  projectId: string;
  projectName: string;
  onSendMessage: (message: string, role: LLMRole, provider: LLMProvider, model: string, attachments: Attachment[]) => Promise<string>;
  history?: HistoryEntry[];
  isProcessing?: boolean;
}

const ROLE_CONFIG: Record<LLMRole, { icon: typeof Code; label: string; description: string; color: string }> = {
  ask: { icon: Search, label: 'Ask', description: 'Sorular ve arastirma', color: 'text-blue-400' },
  code: { icon: Code, label: 'Code', description: 'Kod yazma ve duzenleme', color: 'text-emerald-400' },
  debug: { icon: Bug, label: 'Debug', description: 'Hata ayiklama', color: 'text-orange-400' },
  plan: { icon: FileText, label: 'Plan', description: 'Planlama ve mimari', color: 'text-violet-400' },
  review: { icon: BookOpen, label: 'Review', description: 'Kod inceleme', color: 'text-cyan-400' },
  test: { icon: TestTube, label: 'Test', description: 'Test yazma', color: 'text-yellow-400' },
  docs: { icon: FileText, label: 'Docs', description: 'Dokumantasyon', color: 'text-pink-400' },
  admin: { icon: Shield, label: 'Admin', description: 'Yonetim', color: 'text-red-400' },
};

const PROVIDERS: { value: LLMProvider; label: string; model: string }[] = [
  { value: 'vercel', label: 'Vercel AI Gateway', model: 'vercel:gpt-4o' },
  { value: 'openrouter', label: 'OpenRouter', model: 'openrouter:claude-3.5-sonnet' },
  { value: 'openai', label: 'OpenAI', model: 'openai:gpt-4o' },
  { value: 'anthropic', label: 'Anthropic', model: 'anthropic:claude-3.5-sonnet' },
  { value: 'google', label: 'Google', model: 'google:gemini-pro' },
  { value: 'groq', label: 'Groq', model: 'groq:llama-3.1-70b' },
  { value: 'fireworks', label: 'Fireworks', model: 'fireworks:llama-v3p1-70b' },
  { value: 'roocode', label: 'RooCode', model: 'roocode:claude-sonnet-4.5' },
  { value: 'kilocode', label: 'KiloCode', model: 'kilocode:frontier-coding' },
  { value: 'cline', label: 'Cline', model: 'cline:grok-2' },
];

export function Chatbox({
  projectId,
  projectName,
  onSendMessage,
  history = [],
  isProcessing = false,
}: ChatboxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<LLMRole>('code');
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider>('vercel');
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4o');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mode, setMode] = useState<'plan' | 'act'>('act');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Convert history to messages on mount
  useEffect(() => {
    if (history.length > 0) {
      const converted: ChatMessage[] = history.flatMap((entry) => [
        {
          id: `${entry.id}-q`,
          role: 'user' as const,
          content: entry.question,
          timestamp: entry.timestamp,
          llmRole: entry.role,
          provider: entry.provider,
        },
        {
          id: `${entry.id}-a`,
          role: 'assistant' as const,
          content: entry.answer,
          timestamp: entry.timestamp,
          llmRole: entry.role,
          provider: entry.provider,
          filesChanged: entry.filesChanged,
        },
      ]);
      setMessages(converted);
    }
  }, [history]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Update model when provider changes
  useEffect(() => {
    const defaultModel = getDefaultModel(selectedProvider);
    if (defaultModel && defaultModel.model !== selectedModel) {
      setSelectedModel(defaultModel.model);
    }
  }, [selectedProvider, selectedModel]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return;

    // In plan mode, use 'plan' role; in act mode, use selected role
    const effectiveRole = mode === 'plan' ? 'plan' : selectedRole;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
      llmRole: effectiveRole,
      provider: selectedProvider,
      model: selectedModel,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachments([]);

    try {
      const response = await onSendMessage(input, effectiveRole, selectedProvider, selectedModel, attachments);
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_response`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        llmRole: effectiveRole,
        provider: selectedProvider,
        model: selectedModel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [input, selectedRole, selectedProvider, attachments, onSendMessage, mode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map((file) => ({
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type,
      size: file.size,
      preview: type === 'image' ? URL.createObjectURL(file) : undefined,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentProvider = PROVIDERS.find(p => p.value === selectedProvider);
  const RoleConfig = ROLE_CONFIG[selectedRole];

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">{projectName}</span>
          <Badge variant="outline" className="text-xs">
            {projectId.slice(0, 8)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mode === 'plan' ? 'default' : 'secondary'} className="text-xs">
            {mode === 'plan' ? 'Planning' : 'Acting'}
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        <div className="py-4 space-y-4 chat-scroll">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-center">
              <Bot className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Type @ for context, / for slash commands & workflows. Use Plan mode for planning, Act mode for execution.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                    msg.role === 'user' ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-[85%] ${
                    msg.role === 'user' ? 'text-right' : ''
                  }`}
                >
                  {/* Header */}
                  <div
                    className={`flex items-center gap-2 mb-1 ${
                      msg.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {msg.llmRole && (
                      <Badge variant="outline" className={`text-xs ${ROLE_CONFIG[msg.llmRole].color}`}>
                        {msg.llmRole}
                      </Badge>
                    )}
                    {msg.provider && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                        {PROVIDERS.find(p => p.value === msg.provider)?.label.split(' ')[0] || msg.provider}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>

                  {/* Bubble */}
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    }`}
                  >
                    {/* Attachments */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-background/20 text-xs"
                          >
                            {att.type === 'image' ? (
                              <ImageIcon className="h-3 w-3" />
                            ) : att.type === 'folder' ? (
                              <FolderOpen className="h-3 w-3" />
                            ) : (
                              <Paperclip className="h-3 w-3" />
                            )}
                            <span className="truncate max-w-[100px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                    {/* Files Changed */}
                    {msg.filesChanged && msg.filesChanged.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Files changed:</p>
                        <div className="space-y-1">
                          {msg.filesChanged.map((file, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  file.changeType === 'created'
                                    ? 'bg-green-500'
                                    : file.changeType === 'deleted'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}
                              />
                              <code className="text-xs">{file.path}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1 mt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                            >
                              {copiedId === msg.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Regenerate</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="bg-secondary rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground">Processing...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t bg-card/50">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm"
              >
                {att.type === 'image' && att.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={att.preview}
                    alt={att.name}
                    className="h-6 w-6 rounded object-cover"
                  />
                ) : att.type === 'folder' ? (
                  <FolderOpen className="h-4 w-4" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
                <span className="truncate max-w-[150px]">{att.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeAttachment(att.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cline-style Input Area */}
      <div className="border-t bg-card">
        {/* Input Container */}
        <div className="p-3">
          <div className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-primary/50">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your task here..."
              className="w-full min-h-[60px] max-h-[200px] resize-none bg-transparent px-4 pt-3 pb-8 text-sm placeholder:text-muted-foreground focus:outline-none"
              disabled={isProcessing}
              rows={1}
            />
            
            {/* Helper Text */}
            <div className="absolute left-4 bottom-2 text-xs text-muted-foreground">
              Type @ for context, / for slash commands & workflows
            </div>
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={isProcessing || (!input.trim() && attachments.length === 0)}
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-between px-3 pb-3">
          {/* Left Side - Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'file')}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
            />

            {/* @ Context Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setInput(prev => prev + '@')}
                  >
                    <AtSign className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add context (@)</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* + Add Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Attach Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setAttachments((prev) => [
                    ...prev,
                    { id: `folder_${Date.now()}`, name: 'src/', type: 'folder' },
                  ]);
                }}>
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Add Folder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.entries(ROLE_CONFIG) as [LLMRole, typeof RoleConfig][]).map(([role, config]) => {
                  const Icon = config.icon;
                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={selectedRole === role ? 'bg-accent' : ''}
                    >
                      <Icon className={`h-4 w-4 mr-2 ${config.color}`} />
                      <div className="flex-1">
                        <div className="font-medium">{config.label}</div>
                        <div className="text-xs text-muted-foreground">{config.description}</div>
                      </div>
                      {selectedRole === role && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Provider Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2">
                  <Sparkles className="h-3 w-3" />
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {currentProvider?.label || 'Select provider'}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Provider</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {PROVIDERS.map((provider) => (
                  <DropdownMenuItem
                    key={provider.value}
                    onClick={() => setSelectedProvider(provider.value)}
                    className={selectedProvider === provider.value ? 'bg-accent' : ''}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-xs">{provider.label}</div>
                    </div>
                    {selectedProvider === provider.value && <Check className="h-3 w-3 ml-2" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Model Selector */}
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="h-8 w-32 px-2 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start" className="w-48">
                {getModelsForProvider(selectedProvider).map((model) => (
                  <SelectItem key={model.model} value={model.model} className="text-xs">
                    {model.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Right Side - Plan/Act Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
            <Button
              variant={mode === 'plan' ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 px-3 text-xs ${
                mode === 'plan' 
                  ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setMode('plan')}
            >
              Plan
            </Button>
            <Button
              variant={mode === 'act' ? 'default' : 'ghost'}
              size="sm"
              className={`h-7 px-3 text-xs ${
                mode === 'act' 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'hover:bg-muted'
              }`}
              onClick={() => setMode('act')}
            >
              Act
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
