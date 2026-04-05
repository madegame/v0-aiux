'use client';

/**
 * @component AIChatbox
 * @description AI SDK 6 powered chatbox with streaming support
 * @ai-context AI SDK 6 entegrasyonu - useChat hook ile streaming
 */

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  Code,
  FileText,
  Bug,
  BookOpen,
  TestTube,
  Shield,
  Zap,
  RotateCcw,
  ChevronDown,
  Search,
  Loader2,
} from 'lucide-react';
import type { LLMRole } from '@/lib/ai-history/types';
import { DEFAULT_MODEL, PROVIDER_CONFIGS } from '@/lib/ai/provider/models';

interface AIChatboxProps {
  type: 'prompt-engine' | 'automation';
  title: string;
  subtitle: string;
  projectId?: string;
}

const ROLE_CONFIG: Record<LLMRole, { icon: React.ElementType; label: string; color: string }> = {
  ask:    { icon: Search,    label: 'Ask',    color: 'text-blue-400' },
  code:   { icon: Code,      label: 'Code',   color: 'text-emerald-400' },
  debug:  { icon: Bug,       label: 'Debug',  color: 'text-orange-400' },
  plan:   { icon: FileText,  label: 'Plan',   color: 'text-violet-400' },
  review: { icon: BookOpen,  label: 'Review', color: 'text-cyan-400' },
  test:   { icon: TestTube,  label: 'Test',   color: 'text-yellow-400' },
  docs:   { icon: FileText,  label: 'Docs',   color: 'text-pink-400' },
  admin:  { icon: Shield,    label: 'Admin',  color: 'text-red-400' },
};

export function AIChatbox({
  type,
  title,
  subtitle,
}: AIChatboxProps) {
  const [input, setInput] = useState('');
  const [selectedRole, setSelectedRole] = useState<LLMRole>(
    type === 'prompt-engine' ? 'code' : 'admin'
  );
  const [selectedModel] = useState(DEFAULT_MODEL);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat/stream',
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          model: selectedModel,
          role: selectedRole,
          type,
        },
      }),
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 360)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => setMessages([]);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // Extract text from message parts (AI SDK 6 format)
  const getMessageText = (message: typeof messages[0]): string => {
    if (!message.parts || !Array.isArray(message.parts)) return '';
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join('');
  };

  const RoleIcon = ROLE_CONFIG[selectedRole].icon;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col h-full bg-background">

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b bg-card shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {type === 'prompt-engine'
              ? <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
              : <Zap className="h-3.5 w-3.5 text-yellow-400 shrink-0" />}
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-none truncate">{title}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <Badge variant="outline" className="text-[9px] px-1.5 h-5">
              AI SDK 6
            </Badge>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={handleClear}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">Clear chat</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="py-3 px-3 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center gap-2">
                <Bot className="h-7 w-7 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {type === 'prompt-engine'
                    ? 'Start coding, ask questions,\nor generate code...'
                    : 'Configure rules, hooks,\nskills or workflows...'}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const text = getMessageText(msg);
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`shrink-0 h-5 w-5 rounded flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-primary' : 'bg-secondary'
                      }`}
                    >
                      {msg.role === 'user'
                        ? <User className="h-2.5 w-2.5 text-primary-foreground" />
                        : <Bot className="h-2.5 w-2.5" />}
                    </div>

                    {/* Bubble */}
                    <div className={`flex-1 max-w-[86%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      <div
                        className={`rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{text}</p>
                      </div>
                      <div className={`flex items-center gap-1 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-muted-foreground" suppressHydrationWarning>
                          {formatTime(msg.createdAt || new Date())}
                        </span>
                        {msg.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-3.5 w-3.5"
                            onClick={() => copyToClipboard(text, msg.id)}
                          >
                            {copiedId === msg.id
                              ? <Check className="h-2.5 w-2.5 text-emerald-500" />
                              : <Copy className="h-2.5 w-2.5" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2">
                <div className="shrink-0 h-5 w-5 rounded bg-secondary flex items-center justify-center">
                  <Loader2 className="h-2.5 w-2.5 animate-spin" />
                </div>
                <div className="bg-secondary rounded-lg px-2.5 py-2">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-card p-2 shrink-0">
          {/* Role picker */}
          <div className="flex items-center gap-1 mb-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px] gap-1">
                  <RoleIcon className={`h-3 w-3 ${ROLE_CONFIG[selectedRole].color}`} />
                  <span>{ROLE_CONFIG[selectedRole].label}</span>
                  <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground">Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.entries(ROLE_CONFIG) as [LLMRole, typeof ROLE_CONFIG[LLMRole]][]).map(([key, cfg]) => (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setSelectedRole(key)}
                    className={`text-xs ${selectedRole === key ? 'bg-accent' : ''}`}
                  >
                    <cfg.icon className={`h-3 w-3 mr-2 ${cfg.color}`} />
                    {cfg.label}
                    {selectedRole === key && <Check className="h-3 w-3 ml-auto" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-muted-foreground/40 text-[10px]">|</span>
            <span className="text-[10px] text-muted-foreground truncate">
              {PROVIDER_CONFIGS['vercel-ai-gateway'].displayName}
            </span>
          </div>

          {/* Textarea + send */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                type === 'prompt-engine'
                  ? 'Ask a question or describe your task...'
                  : 'Configure automation...'
              }
              className="w-full min-h-[100px] max-h-[360px] resize-none bg-secondary rounded-lg px-3 py-2 pr-9 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 leading-relaxed"
              disabled={isLoading}
              rows={4}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="icon"
              variant="ghost"
              className="absolute right-1.5 bottom-1.5 h-6 w-6 text-primary hover:bg-primary/10 disabled:opacity-30"
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Send className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>

      </div>
    </TooltipProvider>
  );
}
