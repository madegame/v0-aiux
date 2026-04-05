'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Save,
  RotateCcw,
  Eye,
  Edit3,
  Check,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface MDFile {
  path: string;
  name: string;
  content: string;
  category: 'docs' | 'ai' | 'project';
  isEditable: boolean;
}

interface MDEditorPanelProps {
  files: MDFile[];
  onSave: (path: string, content: string) => Promise<void>;
  onLoad: (path: string) => Promise<string>;
}

const DEFAULT_FILES: MDFile[] = [
  { path: 'docs/agent.md', name: 'agent.md', content: '', category: 'docs', isEditable: true },
  { path: 'docs/guide.md', name: 'guide.md', content: '', category: 'docs', isEditable: true },
  { path: 'docs/plan.md', name: 'plan.md', content: '', category: 'docs', isEditable: true },
  { path: 'docs/history.md', name: 'history.md', content: '', category: 'docs', isEditable: true },
  { path: 'docs/architecture.md', name: 'architecture.md', content: '', category: 'docs', isEditable: true },
  { path: '.ai/system-rules.md', name: 'system-rules.md', content: '', category: 'ai', isEditable: false },
  { path: '.ai/project-rules.md', name: 'project-rules.md', content: '', category: 'ai', isEditable: true },
  { path: '.ai/context.md', name: 'context.md', content: '', category: 'ai', isEditable: true },
  { path: 'README.md', name: 'README.md', content: '', category: 'project', isEditable: true },
];

export function MDEditorPanel({ files = DEFAULT_FILES, onSave, onLoad }: MDEditorPanelProps) {
  const [selectedFile, setSelectedFile] = useState<MDFile | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile.path);
    }
  }, [selectedFile?.path]);

  useEffect(() => {
    setHasChanges(content !== originalContent);
  }, [content, originalContent]);

  const loadFileContent = async (path: string) => {
    try {
      const fileContent = await onLoad(path);
      setContent(fileContent);
      setOriginalContent(fileContent);
      setSaveStatus('idle');
    } catch {
      setContent('');
      setOriginalContent('');
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !hasChanges) return;
    
    setSaving(true);
    try {
      await onSave(selectedFile.path, content);
      setOriginalContent(content);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(originalContent);
  };

  const handleFileSelect = (path: string) => {
    const file = files.find((f) => f.path === path);
    if (file) {
      setSelectedFile(file);
    }
  };

  const groupedFiles = files.reduce((acc, file) => {
    if (!acc[file.category]) acc[file.category] = [];
    acc[file.category].push(file);
    return acc;
  }, {} as Record<string, MDFile[]>);

  const categoryLabels = {
    docs: 'Documentation',
    ai: 'AI Config',
    project: 'Project',
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Markdown Editor
          </CardTitle>
          {selectedFile && (
            <div className="flex items-center gap-2">
              {!selectedFile.isEditable && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Read Only
                </Badge>
              )}
              {saveStatus === 'saved' && (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <Check className="h-3 w-3" />
                  Saved
                </Badge>
              )}
              {hasChanges && saveStatus !== 'saved' && (
                <Badge variant="secondary">Unsaved changes</Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Selector */}
        <div className="flex gap-3">
          <Select
            value={selectedFile?.path}
            onValueChange={handleFileSelect}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a file to edit">
                {selectedFile && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    {selectedFile.path}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedFiles).map(([category, categoryFiles]) => (
                <div key={category}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </div>
                  {categoryFiles.map((file) => (
                    <SelectItem key={file.path} value={file.path}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {file.path}
                        {!file.isEditable && (
                          <Badge variant="outline" className="text-xs ml-2">
                            readonly
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedFile ? (
          <>
            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'edit' | 'preview')}>
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="edit" className="gap-1">
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-1">
                    <Eye className="h-3 w-3" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                {selectedFile.isEditable && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReset}
                      disabled={!hasChanges}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>

              <TabsContent value="edit" className="mt-3">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="File content..."
                  disabled={!selectedFile.isEditable}
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-3">
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm">{content}</pre>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a file to edit</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
