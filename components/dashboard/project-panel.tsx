'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FolderPlus,
  GitBranch,
  Upload,
  Download,
  Trash2,
  CheckCircle,
  Clock,
  FolderOpen,
  Plus,
  Save,
} from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  path: string;
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  lastModified: string;
  branch?: string;
  historyCount: number;
}

interface ProjectPanelProps {
  projects: Project[];
  activeProject: Project | null;
  onCreateProject: (name: string, path: string) => void;
  onSelectProject: (project: Project) => void;
  onArchiveProject: (id: string) => void;
  onExportProject: (id: string) => void;
  onImportProject: () => void;
}

export function ProjectPanel({
  projects,
  activeProject,
  onCreateProject,
  onSelectProject,
  onArchiveProject,
  onExportProject,
  onImportProject,
}: ProjectPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPath, setNewProjectPath] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

  const handleCreate = () => {
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName, newProjectPath || `/projects/${newProjectName.toLowerCase().replace(/\s+/g, '-')}`);
    setNewProjectName('');
    setNewProjectPath('');
    setIsCreating(false);
  };

  const filteredProjects = projects.filter((p) => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusConfig = {
    active: { color: 'bg-green-500', label: 'Active' },
    archived: { color: 'bg-gray-500', label: 'Archived' },
    draft: { color: 'bg-yellow-500', label: 'Draft' },
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              Projects
            </CardTitle>
            <CardDescription className="text-xs">
              Manage AI development projects
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onImportProject}>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Project Form */}
        {isCreating && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
            <div className="space-y-1.5">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My AI Project"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="project-path">Path (optional)</Label>
              <Input
                id="project-path"
                placeholder="/projects/my-project"
                value={newProjectPath}
                onChange={(e) => setNewProjectPath(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleCreate}
                disabled={!newProjectName.trim()}
              >
                <FolderPlus className="h-4 w-4 mr-1" />
                Create
              </Button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Project List */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  activeProject?.id === project.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{project.name}</h4>
                      <Badge
                        variant="secondary"
                        className={`${statusConfig[project.status].color} text-white text-xs`}
                      >
                        {statusConfig[project.status].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {project.path}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {project.branch && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="h-3 w-3" />
                          {project.branch}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(project.lastModified)}
                      </span>
                      <span>{project.historyCount} entries</span>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportProject(project.id);
                      }}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveProject(project.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FolderOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No projects found</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsCreating(true)}
                >
                  Create your first project
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Active Project Info */}
        {activeProject && (
          <div className="p-3 border rounded-lg bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Active Project</span>
            </div>
            <div className="text-sm">
              <p className="font-medium">{activeProject.name}</p>
              <p className="text-xs text-muted-foreground">{activeProject.path}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
