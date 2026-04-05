'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  HardDrive,
  Database,
  Cloud,
  GitBranch,
  Download,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface StorageStats {
  type: 'json' | 'sqlite' | 'cloud';
  totalEntries: number;
  totalChunks: number;
  totalSize: number; // bytes
  maxSize: number; // bytes
  lastBackup?: string;
  gitSynced: boolean;
  gitBranch?: string;
}

interface StoragePanelProps {
  stats: StorageStats;
  onExportAll: () => void;
  onImportData: () => void;
  onBackup: () => Promise<void>;
  onSync: () => Promise<void>;
}

export function StoragePanel({
  stats,
  onExportAll,
  onImportData,
  onBackup,
  onSync,
}: StoragePanelProps) {
  const [syncing, setSyncing] = useState(false);
  const [backingUp, setBackingUp] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await onSync();
    } finally {
      setSyncing(false);
    }
  };

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      await onBackup();
    } finally {
      setBackingUp(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const usagePercent = (stats.totalSize / stats.maxSize) * 100;

  const storageTypeConfig = {
    json: { icon: HardDrive, label: 'JSON Files', color: 'text-blue-500' },
    sqlite: { icon: Database, label: 'SQLite', color: 'text-green-500' },
    cloud: { icon: Cloud, label: 'Cloud', color: 'text-purple-500' },
  };

  const config = storageTypeConfig[stats.type];
  const StorageIcon = config.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <StorageIcon className={`h-4 w-4 ${config.color}`} />
              Storage
            </CardTitle>
            <CardDescription className="text-xs">
              {config.label} storage backend
            </CardDescription>
          </div>
          <Badge variant="outline" className="gap-1">
            <span className={`h-2 w-2 rounded-full ${config.color.replace('text-', 'bg-')}`} />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Storage Used</span>
            <span className="font-medium">
              {formatBytes(stats.totalSize)} / {formatBytes(stats.maxSize)}
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usagePercent.toFixed(1)}% used</span>
            <span>{formatBytes(stats.maxSize - stats.totalSize)} free</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
            <div className="text-xs text-muted-foreground">Total Entries</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{stats.totalChunks}</div>
            <div className="text-xs text-muted-foreground">Data Chunks</div>
          </div>
        </div>

        {/* Git Status */}
        <div className="p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="text-sm font-medium">Git Sync</span>
            </div>
            {stats.gitSynced ? (
              <Badge variant="default" className="gap-1 bg-green-600">
                <Check className="h-3 w-3" />
                Synced
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Not connected
              </Badge>
            )}
          </div>
          {stats.gitBranch && (
            <div className="mt-2 text-xs text-muted-foreground">
              Branch: <span className="font-mono">{stats.gitBranch}</span>
            </div>
          )}
          {stats.lastBackup && (
            <div className="mt-1 text-xs text-muted-foreground">
              Last backup: {new Date(stats.lastBackup).toLocaleString('tr-TR')}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onExportAll}>
            <Download className="h-4 w-4 mr-1" />
            Export All
          </Button>
          <Button variant="outline" size="sm" onClick={onImportData}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackup}
            disabled={backingUp}
          >
            {backingUp ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <HardDrive className="h-4 w-4 mr-1" />
            )}
            Backup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing || !stats.gitSynced}
          >
            {syncing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Sync Git
          </Button>
        </div>

        {/* Version Roadmap */}
        <div className="p-3 rounded-lg border bg-muted/30">
          <div className="text-xs font-medium mb-2">Storage Roadmap</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={stats.type === 'json' ? 'default' : 'secondary'} className="text-xs">
                v1
              </Badge>
              <span className={stats.type === 'json' ? 'font-medium' : 'text-muted-foreground'}>
                JSON Files (Current)
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={stats.type === 'sqlite' ? 'default' : 'outline'} className="text-xs">
                v2
              </Badge>
              <span className={stats.type === 'sqlite' ? 'font-medium' : 'text-muted-foreground'}>
                SQLite Database
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant={stats.type === 'cloud' ? 'default' : 'outline'} className="text-xs">
                v3
              </Badge>
              <span className={stats.type === 'cloud' ? 'font-medium' : 'text-muted-foreground'}>
                Cloud + GitHub Sync
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
