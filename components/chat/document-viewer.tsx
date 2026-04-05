'use client';

/**
 * @component DocumentViewer
 * @description MD/JSON viewer and editor with format conversion
 * @ai-context Dokuman goruntuleme/duzenleme - MD/JSON donusumu
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Eye,
  Edit,
  Save,
  X,
  FileJson,
  FileText,
  ArrowLeftRight,
  Copy,
  Check,
  Download,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface DocumentViewerProps {
  path: string;
  content: string;
  isEditable?: boolean;
  onSave?: (content: string) => Promise<void>;
  onClose?: () => void;
}

type ViewFormat = 'raw' | 'preview' | 'json';

// MD to JSON converter (for history entries)
function mdToJson(md: string): object | null {
  try {
    const entries: Array<{
      date?: string;
      version?: string;
      question?: string;
      changes?: string[];
      tags?: string[];
    }> = [];
    const sections = md.split(/^## /m).filter(Boolean);
    
    for (const section of sections) {
      const lines = section.trim().split('\n');
      const header = lines[0];
      
      // Parse header: [2026-04-04] v0.2.0 - Title
      const headerMatch = header.match(/\[(\d{4}-\d{2}-\d{2})\]\s*v?([\d.]+)?\s*-?\s*(.*)/);
      if (headerMatch) {
        const entry: {
          date?: string;
          version?: string;
          title?: string;
          question?: string;
          changes?: string[];
          tags?: string[];
        } = {
          date: headerMatch[1],
          version: headerMatch[2] || undefined,
          title: headerMatch[3] || undefined,
        };
        
        // Find question block
        const questionStart = section.indexOf('### Soru');
        const questionEnd = section.indexOf('### ', questionStart + 1);
        if (questionStart > -1) {
          const questionBlock = section.slice(
            questionStart,
            questionEnd > -1 ? questionEnd : undefined
          );
          const questionMatch = questionBlock.match(/>\s*(.+)/s);
          if (questionMatch) {
            entry.question = questionMatch[1].trim();
          }
        }
        
        // Find changes
        const changesStart = section.indexOf('### Degisen Dosyalar');
        if (changesStart > -1) {
          const changesBlock = section.slice(changesStart);
          const changes = changesBlock.match(/`([^`]+)`/g);
          if (changes) {
            entry.changes = changes.map((c) => c.replace(/`/g, ''));
          }
        }
        
        // Find tags
        const tagsStart = section.indexOf('### Anahtar Kelimeler');
        if (tagsStart > -1) {
          const tagsBlock = section.slice(tagsStart);
          const tags = tagsBlock.match(/`([^`]+)`/g);
          if (tags) {
            entry.tags = tags.map((t) => t.replace(/`/g, ''));
          }
        }
        
        entries.push(entry);
      }
    }
    
    return { type: 'history', entries };
  } catch {
    return null;
  }
}

// JSON to MD converter
function jsonToMd(json: object): string {
  try {
    const data = json as { type?: string; entries?: Array<{
      date?: string;
      version?: string;
      title?: string;
      question?: string;
      changes?: string[];
      tags?: string[];
    }> };
    if (data.type === 'history' && Array.isArray(data.entries)) {
      let md = '# AI Development History\n\n';
      
      for (const entry of data.entries) {
        md += `## [${entry.date || 'Unknown'}]`;
        if (entry.version) md += ` v${entry.version}`;
        if (entry.title) md += ` - ${entry.title}`;
        md += '\n\n';
        
        if (entry.question) {
          md += `### Soru (Prompt)\n> ${entry.question}\n\n`;
        }
        
        if (entry.changes && entry.changes.length > 0) {
          md += `### Degisen Dosyalar\n`;
          for (const change of entry.changes) {
            md += `- \`${change}\`\n`;
          }
          md += '\n';
        }
        
        if (entry.tags && entry.tags.length > 0) {
          md += `### Anahtar Kelimeler\n`;
          md += entry.tags.map((t) => `\`${t}\``).join(' ');
          md += '\n\n';
        }
        
        md += '---\n\n';
      }
      
      return md;
    }
    
    return JSON.stringify(json, null, 2);
  } catch {
    return JSON.stringify(json, null, 2);
  }
}

// Simple MD preview renderer
function renderMarkdown(md: string): string {
  return md
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-6 mb-3 pb-2 border-b">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mb-4">$1</h1>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-2 border-primary pl-4 italic text-muted-foreground my-2">$1</blockquote>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg my-3 overflow-x-auto text-sm font-mono"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/g, '<ul class="list-disc my-2">$&</ul>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="my-2">')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="my-4 border-border" />');
}

export function DocumentViewer({
  path,
  content,
  isEditable = true,
  onSave,
  onClose,
}: DocumentViewerProps) {
  const [editedContent, setEditedContent] = useState(content);
  const [viewFormat, setViewFormat] = useState<ViewFormat>('preview');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileName = path.split('/').pop() || 'document';
  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const isJson = fileExt === 'json';
  const isMd = fileExt === 'md';

  // Convert content based on format
  const displayContent = useMemo(() => {
    if (viewFormat === 'raw') {
      return editedContent;
    }
    
    if (viewFormat === 'json') {
      if (isJson) {
        try {
          return JSON.stringify(JSON.parse(editedContent), null, 2);
        } catch {
          return editedContent;
        }
      }
      if (isMd) {
        const json = mdToJson(editedContent);
        return json ? JSON.stringify(json, null, 2) : '// Could not convert to JSON';
      }
    }
    
    if (viewFormat === 'preview') {
      if (isMd) {
        return renderMarkdown(editedContent);
      }
      if (isJson) {
        try {
          const obj = JSON.parse(editedContent);
          return jsonToMd(obj);
        } catch {
          return editedContent;
        }
      }
    }
    
    return editedContent;
  }, [editedContent, viewFormat, isJson, isMd]);

  const handleSave = useCallback(async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(editedContent);
      setIsEditing(false);
    } catch (e) {
      console.error('Save failed:', e);
    } finally {
      setIsSaving(false);
    }
  }, [editedContent, onSave]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [displayContent]);

  const handleConvert = useCallback(() => {
    if (isMd && viewFormat === 'json') {
      const json = mdToJson(editedContent);
      if (json) {
        setEditedContent(JSON.stringify(json, null, 2));
      }
    } else if (isJson && viewFormat === 'preview') {
      try {
        const obj = JSON.parse(editedContent);
        setEditedContent(jsonToMd(obj));
      } catch {
        // Ignore
      }
    }
  }, [editedContent, isJson, isMd, viewFormat]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([displayContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [displayContent, fileName]);

  return (
    <div className={`flex flex-col bg-card border rounded-lg ${isFullscreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          {isJson ? (
            <FileJson className="h-4 w-4 text-yellow-500" />
          ) : (
            <FileText className="h-4 w-4 text-blue-500" />
          )}
          <span className="text-sm font-medium">{fileName}</span>
          <Badge variant="outline" className="text-xs">
            {fileExt}
          </Badge>
          {!isEditable && (
            <Badge variant="secondary" className="text-xs">
              Read Only
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Select value={viewFormat} onValueChange={(v) => setViewFormat(v as ViewFormat)}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="raw">Raw</SelectItem>
              <SelectItem value="preview">Preview</SelectItem>
              {(isMd || isJson) && <SelectItem value="json">JSON</SelectItem>}
            </SelectContent>
          </Select>
          
          {(isMd || isJson) && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleConvert}
              title="Convert format"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDownload}
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[300px] resize-none font-mono text-sm p-4 rounded-none border-0"
          />
        ) : (
          <ScrollArea className="h-full">
            {viewFormat === 'preview' && isMd ? (
              <div
                className="p-4 prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: displayContent }}
              />
            ) : (
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">
                {displayContent}
              </pre>
            )}
          </ScrollArea>
        )}
      </div>

      {/* Footer */}
      {isEditable && (
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            {editedContent.length} characters
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditedContent(content);
                    setIsEditing(false);
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
