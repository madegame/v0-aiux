'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Send, 
  Loader2, 
  Sparkles,
  Code,
  Bug,
  FileText,
  HelpCircle,
  Eye,
  TestTube,
  Shield,
  Map
} from 'lucide-react';
import type { LLMRole, LLMProvider } from '@/lib/ai-history/types';

interface PromptPanelProps {
  selectedRole: LLMRole | null;
  selectedProvider: LLMProvider | null;
  onRoleChange: (role: LLMRole) => void;
  onProviderChange: (provider: LLMProvider) => void;
  onSubmit: (prompt: string, role: LLMRole, provider: LLMProvider) => void;
  isProcessing?: boolean;
}

const ROLE_CONFIG = {
  ask: { icon: HelpCircle, color: 'bg-blue-500', label: 'Ask' },
  code: { icon: Code, color: 'bg-green-500', label: 'Code' },
  debug: { icon: Bug, color: 'bg-orange-500', label: 'Debug' },
  plan: { icon: Map, color: 'bg-purple-500', label: 'Plan' },
  review: { icon: Eye, color: 'bg-cyan-500', label: 'Review' },
  test: { icon: TestTube, color: 'bg-yellow-500', label: 'Test' },
  docs: { icon: FileText, color: 'bg-gray-500', label: 'Docs' },
  admin: { icon: Shield, color: 'bg-red-500', label: 'Admin' },
};

const PROVIDERS: LLMProvider[] = [
  'vercel', 'openai', 'anthropic', 'google', 'groq', 'fireworks', 'openrouter',
  'roocode', 'kilocode', 'cline'
];

export function PromptPanel({
  selectedRole,
  selectedProvider,
  onRoleChange,
  onProviderChange,
  onSubmit,
  isProcessing = false,
}: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleSubmit = () => {
    if (!prompt.trim() || !selectedRole || !selectedProvider || isProcessing) return;
    onSubmit(prompt.trim(), selectedRole, selectedProvider);
    setPrompt('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const RoleIcon = selectedRole ? ROLE_CONFIG[selectedRole]?.icon : Sparkles;

  return (
    <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Prompt Input
          </CardTitle>
          <div className="flex items-center gap-2">
            {selectedRole && (
              <Badge variant="secondary" className="gap-1">
                <RoleIcon className="h-3 w-3" />
                {ROLE_CONFIG[selectedRole]?.label}
              </Badge>
            )}
            {selectedProvider && (
              <Badge variant="outline">{selectedProvider}</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Role & Provider Selection */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Select
              value={selectedRole || undefined}
              onValueChange={(v) => onRoleChange(v as LLMRole)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_CONFIG).map(([role, config]) => {
                  const Icon = config.icon;
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={selectedProvider || undefined}
              onValueChange={(v) => onProviderChange(v as LLMProvider)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Provider" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((provider) => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            placeholder="Enter your prompt... (Ctrl+Enter to send)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] max-h-[200px] resize-none pr-12"
            disabled={isProcessing}
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2"
            onClick={handleSubmit}
            disabled={!prompt.trim() || !selectedRole || !selectedProvider || isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Templates */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Fix bug', prompt: 'Fix the following bug: ' },
            { label: 'Add feature', prompt: 'Add a new feature: ' },
            { label: 'Refactor', prompt: 'Refactor this code: ' },
            { label: 'Explain', prompt: 'Explain how this works: ' },
          ].map((template) => (
            <Button
              key={template.label}
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setPrompt(template.prompt)}
            >
              {template.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
