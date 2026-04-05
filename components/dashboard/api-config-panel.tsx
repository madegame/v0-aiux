'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Key, 
  Check, 
  X, 
  Loader2, 
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Plus
} from 'lucide-react';

export interface APIKeyConfig {
  id: string;
  provider: string;
  apiKey: string;
  model: string;
  isValid: boolean | null;
  lastValidated?: string;
}

interface APIConfigPanelProps {
  configs: APIKeyConfig[];
  onSave: (configs: APIKeyConfig[]) => void;
  onValidate: (config: APIKeyConfig) => Promise<boolean>;
}

const PROVIDER_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-3.5-sonnet'],
  google: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
  groq: ['llama-3.1-70b', 'llama-3.1-8b', 'mixtral-8x7b'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  mistral: ['mistral-large', 'mistral-medium', 'mistral-small'],
  cohere: ['command-r-plus', 'command-r', 'command'],
  perplexity: ['sonar-large', 'sonar-small'],
};

const PROVIDER_NAMES = Object.keys(PROVIDER_MODELS);

export function APIConfigPanel({ configs, onSave, onValidate }: APIConfigPanelProps) {
  const [localConfigs, setLocalConfigs] = useState<APIKeyConfig[]>(configs);
  const [validating, setValidating] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfigs(configs);
  }, [configs]);

  const updateConfig = (id: string, updates: Partial<APIKeyConfig>) => {
    setLocalConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, isValid: null } : c))
    );
    setHasChanges(true);
  };

  const addConfig = () => {
    const newConfig: APIKeyConfig = {
      id: `config_${Date.now()}`,
      provider: '',
      apiKey: '',
      model: '',
      isValid: null,
    };
    setLocalConfigs((prev) => [...prev, newConfig]);
    setHasChanges(true);
  };

  const removeConfig = (id: string) => {
    setLocalConfigs((prev) => prev.filter((c) => c.id !== id));
    setHasChanges(true);
  };

  const handleValidate = async (config: APIKeyConfig) => {
    if (!config.apiKey || !config.provider) return;
    
    setValidating(config.id);
    try {
      const isValid = await onValidate(config);
      setLocalConfigs((prev) =>
        prev.map((c) =>
          c.id === config.id
            ? { ...c, isValid, lastValidated: new Date().toISOString() }
            : c
        )
      );
    } finally {
      setValidating(null);
    }
  };

  const handleSave = () => {
    onSave(localConfigs);
    setHasChanges(false);
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validCount = localConfigs.filter((c) => c.isValid === true).length;

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">API Configuration</CardTitle>
                  <CardDescription className="text-xs">
                    Manage API keys and models
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={validCount > 0 ? 'default' : 'secondary'}>
                  {validCount}/{localConfigs.length} valid
                </Badge>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {localConfigs.map((config) => (
              <div
                key={config.id}
                className="p-4 border rounded-lg space-y-3 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {config.isValid === true && (
                      <Badge variant="default" className="gap-1 bg-green-600">
                        <Check className="h-3 w-3" />
                        Valid
                      </Badge>
                    )}
                    {config.isValid === false && (
                      <Badge variant="destructive" className="gap-1">
                        <X className="h-3 w-3" />
                        Invalid
                      </Badge>
                    )}
                    {config.isValid === null && config.apiKey && (
                      <Badge variant="secondary">Not validated</Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeConfig(config.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`provider-${config.id}`}>Provider</Label>
                    <Select
                      value={config.provider}
                      onValueChange={(v) => updateConfig(config.id, { provider: v, model: '' })}
                    >
                      <SelectTrigger id={`provider-${config.id}`}>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDER_NAMES.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {provider.charAt(0).toUpperCase() + provider.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor={`model-${config.id}`}>Model</Label>
                    <Select
                      value={config.model}
                      onValueChange={(v) => updateConfig(config.id, { model: v })}
                      disabled={!config.provider}
                    >
                      <SelectTrigger id={`model-${config.id}`}>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {(PROVIDER_MODELS[config.provider] || []).map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`apikey-${config.id}`}>API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id={`apikey-${config.id}`}
                        type={showKeys[config.id] ? 'text' : 'password'}
                        placeholder="sk-..."
                        value={config.apiKey}
                        onChange={(e) => updateConfig(config.id, { apiKey: e.target.value })}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => toggleShowKey(config.id)}
                      >
                        {showKeys[config.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleValidate(config)}
                      disabled={!config.apiKey || !config.provider || validating === config.id}
                    >
                      {validating === config.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Validate'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={addConfig}>
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSave}
                disabled={!hasChanges}
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
