'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, FileCode, Bug, Map, HelpCircle, Eye, FileText, TestTube } from 'lucide-react';
import type { HistoryEntry, LLMRole } from '@/lib/ai-history/types';

interface HistoryListProps {
  entries: HistoryEntry[];
  onSearch?: (query: string) => void;
  onFilterRole?: (role: LLMRole | 'all') => void;
  loading?: boolean;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  ask: <HelpCircle className="h-4 w-4" />,
  code: <FileCode className="h-4 w-4" />,
  debug: <Bug className="h-4 w-4" />,
  plan: <Map className="h-4 w-4" />,
  review: <Eye className="h-4 w-4" />,
  docs: <FileText className="h-4 w-4" />,
  test: <TestTube className="h-4 w-4" />,
};

const ROLE_COLORS: Record<string, string> = {
  ask: 'bg-blue-100 text-blue-800',
  code: 'bg-green-100 text-green-800',
  debug: 'bg-orange-100 text-orange-800',
  plan: 'bg-purple-100 text-purple-800',
  review: 'bg-cyan-100 text-cyan-800',
  docs: 'bg-gray-100 text-gray-800',
  test: 'bg-yellow-100 text-yellow-800',
};

export function HistoryList({
  entries,
  onSearch,
  onFilterRole,
  loading,
}: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleRoleFilter = (role: string) => {
    setSelectedRole(role);
    onFilterRole?.(role as LLMRole | 'all');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>History</span>
          <Badge variant="secondary">{entries.length} entries</Badge>
        </CardTitle>
        <div className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedRole} onValueChange={handleRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="ask">Ask</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
              <SelectItem value="plan">Plan</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="docs">Docs</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <FileText className="h-8 w-8 mb-2" />
              <p>No history entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={ROLE_COLORS[entry.role] || 'bg-gray-100'}
                        variant="secondary"
                      >
                        {ROLE_ICONS[entry.role]}
                        <span className="ml-1 capitalize">{entry.role}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {entry.provider}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {formatDate(entry.timestamp)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium line-clamp-2">
                    {entry.question}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {entry.answer}
                  </p>
                  {entry.filesChanged.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.filesChanged.slice(0, 3).map((file, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {file.path.split('/').pop()}
                        </Badge>
                      ))}
                      {entry.filesChanged.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{entry.filesChanged.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  {entry.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {entry.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
