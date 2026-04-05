'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  GitBranch,
  Download,
  Upload,
  RefreshCw,
  BookOpen,
  Settings,
  Zap,
} from 'lucide-react';

interface QuickActionsProps {
  onExport?: () => void;
  onImport?: () => void;
  onRefresh?: () => void;
  onOpenDocs?: () => void;
}

export function QuickActions({
  onExport,
  onImport,
  onRefresh,
  onOpenDocs,
}: QuickActionsProps) {
  const actions = [
    {
      label: 'View Docs',
      icon: <BookOpen className="h-4 w-4" />,
      onClick: onOpenDocs,
      variant: 'default' as const,
    },
    {
      label: 'Export History',
      icon: <Download className="h-4 w-4" />,
      onClick: onExport,
      variant: 'outline' as const,
    },
    {
      label: 'Import History',
      icon: <Upload className="h-4 w-4" />,
      onClick: onImport,
      variant: 'outline' as const,
    },
    {
      label: 'Refresh',
      icon: <RefreshCw className="h-4 w-4" />,
      onClick: onRefresh,
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              onClick={action.onClick}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
