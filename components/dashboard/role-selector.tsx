'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  HelpCircle, 
  Code, 
  Bug, 
  Map, 
  Eye, 
  FileText, 
  TestTube,
  Shield 
} from 'lucide-react';
import type { LLMRole } from '@/lib/ai-history/types';

interface RoleConfig {
  id: LLMRole;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const ROLES: RoleConfig[] = [
  {
    id: 'ask',
    name: 'Ask',
    description: 'Soru sor, kod oku',
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
  },
  {
    id: 'code',
    name: 'Code',
    description: 'Kod yaz, duzenle',
    icon: <Code className="h-5 w-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 hover:bg-green-100',
  },
  {
    id: 'debug',
    name: 'Debug',
    description: 'Hata ayikla',
    icon: <Bug className="h-5 w-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
  },
  {
    id: 'plan',
    name: 'Plan',
    description: 'Planla, tasarla',
    icon: <Map className="h-5 w-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
  },
  {
    id: 'review',
    name: 'Review',
    description: 'Kod incele',
    icon: <Eye className="h-5 w-5" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 hover:bg-cyan-100',
  },
  {
    id: 'test',
    name: 'Test',
    description: 'Test yaz',
    icon: <TestTube className="h-5 w-5" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
  },
  {
    id: 'docs',
    name: 'Docs',
    description: 'Dokumantasyon',
    icon: <FileText className="h-5 w-5" />,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 hover:bg-gray-100',
  },
];

interface RoleSelectorProps {
  selectedRole: LLMRole | null;
  onSelect: (role: LLMRole) => void;
  className?: string;
}

export function RoleSelector({
  selectedRole,
  onSelect,
  className,
}: RoleSelectorProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelect(role.id)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-lg transition-all',
                role.bgColor,
                selectedRole === role.id && 'ring-2 ring-offset-2 ring-primary'
              )}
            >
              <div className={cn(role.color)}>{role.icon}</div>
              <span className="font-medium text-sm">{role.name}</span>
              <span className="text-xs text-muted-foreground text-center">
                {role.description}
              </span>
            </button>
          ))}
        </div>
        {selectedRole && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Current:</strong>{' '}
              <Badge variant="secondary" className="ml-1">
                {selectedRole}
              </Badge>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
