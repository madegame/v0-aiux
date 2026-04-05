'use client';

/**
 * @component FileExplorer
 * @description VSCode style file explorer for project navigation
 * @ai-context Dosya gezgini - klasor/dosya gosterimi, secim, context menu
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  FileJson,
  File,
  Search,
  Plus,
  RefreshCw,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  FolderPlus,
} from 'lucide-react';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  extension?: string;
  isEditable?: boolean;
  category?: 'docs' | 'ai' | 'src' | 'config';
}

interface FileExplorerProps {
  files: FileNode[];
  selectedFile?: string;
  onSelectFile: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
  onDeleteFile?: (path: string) => void;
  onRenameFile?: (path: string, newName: string) => void;
}

const FILE_ICONS: Record<string, typeof FileText> = {
  md: FileText,
  json: FileJson,
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  css: FileCode,
  default: File,
};

const CATEGORY_COLORS: Record<string, string> = {
  docs: 'text-blue-400',
  ai: 'text-emerald-400',
  src: 'text-violet-400',
  config: 'text-yellow-400',
};

function getFileIcon(extension?: string) {
  if (!extension) return File;
  return FILE_ICONS[extension] || FILE_ICONS.default;
}

function FileTreeItem({
  node,
  level = 0,
  selectedFile,
  onSelect,
  onDelete,
  onRename,
  onCreateFile,
  onCreateFolder,
}: {
  node: FileNode;
  level?: number;
  selectedFile?: string;
  onSelect: (path: string) => void;
  onDelete?: (path: string) => void;
  onRename?: (path: string, newName: string) => void;
  onCreateFile?: (parentPath: string, name: string) => void;
  onCreateFolder?: (parentPath: string, name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const isSelected = selectedFile === node.path;
  const FileIcon = node.type === 'folder' ? (isOpen ? FolderOpen : Folder) : getFileIcon(node.extension);

  if (node.type === 'folder') {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <ContextMenu>
          <ContextMenuTrigger>
            <CollapsibleTrigger asChild>
              <button
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm hover:bg-sidebar-accent rounded-sm transition-colors file-tree-item ${
                  isSelected ? 'active' : ''
                }`}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
              >
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <FileIcon className={`h-4 w-4 ${CATEGORY_COLORS[node.category || ''] || 'text-muted-foreground'}`} />
                <span className="truncate">{node.name}</span>
                {node.children && (
                  <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1">
                    {node.children.length}
                  </Badge>
                )}
              </button>
            </CollapsibleTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onCreateFile?.(node.path, 'new-file.md')}>
              <Plus className="h-4 w-4 mr-2" />
              New File
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onCreateFolder?.(node.path, 'new-folder')}>
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onRename?.(node.path, node.name)}>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(node.path)}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Path
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(node.path)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        <CollapsibleContent>
          {node.children?.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onSelect={onSelect}
              onDelete={onDelete}
              onRename={onRename}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-sm hover:bg-sidebar-accent rounded-sm transition-colors file-tree-item ${
            isSelected ? 'active bg-sidebar-accent' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 24}px` }}
          onClick={() => onSelect(node.path)}
        >
          <FileIcon className={`h-4 w-4 ${CATEGORY_COLORS[node.category || ''] || 'text-muted-foreground'}`} />
          <span className="truncate">{node.name}</span>
          {!node.isEditable && (
            <Badge variant="outline" className="ml-auto text-[10px] h-4 px-1 text-muted-foreground">
              read
            </Badge>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onSelect(node.path)}>
          <FileText className="h-4 w-4 mr-2" />
          Open
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(node.path)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Path
        </ContextMenuItem>
        {node.isEditable && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onRename?.(node.path, node.name)}>
              <Edit className="h-4 w-4 mr-2" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(node.path)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function FileExplorer({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onDeleteFile,
  onRenameFile,
}: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes.reduce<FileNode[]>((acc, node) => {
        if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
          acc.push(node);
        } else if (node.children) {
          const filtered = filterNodes(node.children);
          if (filtered.length > 0) {
            acc.push({ ...node, children: filtered });
          }
        }
        return acc;
      }, []);
    };

    return filterNodes(files);
  }, [files, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-sidebar-border">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="h-7 pl-7 text-xs bg-sidebar-accent border-0"
          />
        </div>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filteredFiles.map((node) => (
            <FileTreeItem
              key={node.id}
              node={node}
              selectedFile={selectedFile}
              onSelect={onSelectFile}
              onDelete={onDeleteFile}
              onRename={onRenameFile}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-sidebar-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{files.length} items</span>
          <Badge variant="outline" className="text-[10px]">
            AI-First
          </Badge>
        </div>
      </div>
    </div>
  );
}
