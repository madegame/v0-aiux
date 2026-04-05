'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Database,
  GitBranch,
  FileJson,
  Server 
} from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusType = 'ok' | 'warning' | 'error';

interface StatusItem {
  label: string;
  status: StatusType;
  message: string;
  icon: React.ReactNode;
}

interface SystemStatusProps {
  storageType: 'json' | 'sqlite' | 'cloud';
  gitConnected: boolean;
  historyCount: number;
  lastSync?: string;
}

export function SystemStatus({
  storageType,
  gitConnected,
  historyCount,
  lastSync,
}: SystemStatusProps) {
  const items: StatusItem[] = [
    {
      label: 'Storage',
      status: 'ok',
      message: `${storageType.toUpperCase()} - ${historyCount} entries`,
      icon: <Database className="h-4 w-4" />,
    },
    {
      label: 'Git',
      status: gitConnected ? 'ok' : 'warning',
      message: gitConnected ? 'Connected' : 'Not connected',
      icon: <GitBranch className="h-4 w-4" />,
    },
    {
      label: 'Config',
      status: 'ok',
      message: 'Loaded',
      icon: <FileJson className="h-4 w-4" />,
    },
    {
      label: 'System',
      status: 'ok',
      message: 'MVP v1.0.0',
      icon: <Server className="h-4 w-4" />,
    },
  ];

  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case 'ok':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>System Status</span>
          <Badge variant="outline" className="text-xs">
            {lastSync ? `Last sync: ${lastSync}` : 'Not synced'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center justify-between p-2 rounded-lg border',
                getStatusColor(item.status)
              )}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {item.message}
                </span>
                {getStatusIcon(item.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
