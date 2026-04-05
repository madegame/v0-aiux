# AI-First Development IDE - Master Plan v3.0

> **Tarih:** 2026-04-05  
> **Proje:** VSCodeux - AI Starterkit  
> **Durum:** Konsolide Plan (plan.md + plan5nisan.md + PRODUCTION-GAPS.md)  
> **Toplam Eksik:** 127 item  
> **Tahmini Toplam:** ~550K token | ~$15-25 USD

---

## Executive Summary

### Mevcut Durum Analizi

| Kategori | Durum | Risk |
|----------|-------|------|
| UI/Layout | 85% | Dusuk |
| AI SDK | 0% | KRITIK |
| Database | 0% | KRITIK |
| Authentication | 0% | KRITIK |
| Rate Limiting | 0% | KRITIK |
| Input Validation | 0% | KRITIK |
| Testing | 0% | YUKSEK |
| Error Handling | 20% | YUKSEK |

### Eksik Paketler (package.json)

```bash
# KRITIK - Hemen ekle
pnpm add ai @ai-sdk/react                     # AI SDK v6
pnpm add @supabase/ssr @supabase/supabase-js  # Database + Auth
pnpm add @upstash/ratelimit @upstash/redis    # Rate Limiting
pnpm add zod                                  # Input Validation
pnpm add swr                                  # Data Fetching

# YUKSEK - Yakinda ekle
pnpm add @monaco-editor/react                 # Code Editor
pnpm add -D vitest @testing-library/react     # Testing

# ORTA - Sonra ekle
pnpm add -D @next/bundle-analyzer             # Performance
pnpm add -D playwright                        # E2E Testing
pnpm add -D husky lint-staged                 # Pre-commit
```

---

## v0 Max Budget Tablosu

### Faz Bazli Token ve Istek Tahminleri

| Faz | Token | Istek | Maliyet | Sure |
|-----|-------|-------|---------|------|
| **Faz 0: Temizlik** | ~8K | 5-8 | $0.50 | 1 saat |
| **Faz 1: AI SDK** | ~20K | 10-15 | $1.50 | 3 saat |
| **Faz 2: Database + Auth** | ~50K | 25-35 | $3.50 | 8 saat |
| **Faz 3: Security** | ~25K | 12-18 | $1.75 | 4 saat |
| **Faz 4: Error + UX** | ~30K | 15-20 | $2.00 | 5 saat |
| **Faz 5: Frontend** | ~45K | 20-30 | $3.00 | 7 saat |
| **Faz 6: Testing** | ~40K | 18-25 | $2.75 | 6 saat |
| **Faz 7: DevOps** | ~20K | 10-15 | $1.50 | 3 saat |
| **Faz 8: Polish** | ~35K | 15-22 | $2.50 | 5 saat |
| **TOPLAM** | **~273K** | **130-188** | **~$19.00** | **42 saat** |

### Gercekci Senaryolar

| Senaryo | Fazlar | Token | Maliyet | Sure |
|---------|--------|-------|---------|------|
| **MVP (Minimum)** | 0-3 | ~103K | $7.25 | 16 saat |
| **Production-Ready** | 0-5 | ~178K | $12.25 | 28 saat |
| **Full Feature** | 0-7 | ~238K | $16.50 | 37 saat |
| **Complete** | 0-8 | ~273K | $19.00 | 42 saat |

---

## FAZ 0: Temizlik ve Hazirlik

**Oncelik:** P0 - KRITIK  
**Token:** ~8K | **Istek:** 5-8 | **Sure:** 1 saat

### 0.1 Provider Listesi Guncelleme

```typescript
// KALDIR - chatbox.tsx, dual-chatbox.tsx
const PROVIDERS = ['cursor', 'windsurf', 'claude-code', ...]; // YANLIS

// EKLE - lib/ai/provider/models.ts
export const AI_PROVIDERS = {
  'vercel-ai-gateway': ['openai/gpt-5-mini', 'anthropic/claude-opus-4.6', 'google/gemini-3-flash'],
  'openai': ['gpt-4-turbo', 'gpt-4o', 'gpt-5-mini'],
  'anthropic': ['claude-opus-4.6', 'claude-sonnet-4'],
  'google': ['gemini-3-flash', 'gemini-3-pro'],
  'groq': ['llama-3.1-70b', 'mixtral-8x7b'],
} as const;
```

### 0.2 .env.example Olustur

```bash
# .env.example
# === Database (Supabase) ===
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# === AI (seceneklerden biri) ===
# v0 Gateway: env gerekmez (otomatik)
# OpenAI/Anthropic/Google: API key gerekir
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
AI_GATEWAY_API_KEY=

# === Rate Limiting (Upstash) ===
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# === Optional ===
GITHUB_TOKEN=
VERCEL_TOKEN=
SENTRY_DSN=
```

### 0.3 Gorevler

- [ ] Provider tiplerini guncelle (`lib/ai-history/types.ts`)
- [ ] Chatbox provider listesini temizle
- [ ] `.env.example` olustur
- [ ] Gereksiz IDE referanslarini kaldir

---

## FAZ 1: AI SDK Entegrasyonu

**Oncelik:** P0 - KRITIK  
**Token:** ~20K | **Istek:** 10-15 | **Sure:** 3 saat

### 1.1 Paket Kurulumu

```bash
pnpm add ai @ai-sdk/react
```

### 1.2 Chat API Route

```typescript
// app/api/chat/stream/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, model = "anthropic/claude-sonnet-4-20250514", systemPrompt } = await req.json();
  
  const result = await streamText({
    model,
    messages,
    system: systemPrompt || `You are an AI development assistant for VSCodeux IDE.`,
  });
  
  return result.toDataStreamResponse();
}
```

### 1.3 useChat Hook Entegrasyonu

```typescript
// components/chat/ai-chatbox.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function AIChatbox({ type }: { type: 'prompt-engine' | 'automation' }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat/stream',
    body: { type },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your prompt..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading} className="mt-2 w-full">
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </form>
    </div>
  );
}
```

### 1.4 Gorevler

- [ ] `ai` ve `@ai-sdk/react` paketlerini ekle
- [ ] `app/api/chat/stream/route.ts` olustur
- [ ] Mock chat response'lari kaldir
- [ ] `useChat` hook ile chatbox'lari guncelle
- [ ] System prompt'lar icin `lib/ai/prompts/` olustur
- [ ] Model selector'u AI Gateway modelleriyle guncelle

---

## FAZ 2: Database + Authentication

**Oncelik:** P0 - KRITIK  
**Token:** ~50K | **Istek:** 25-35 | **Sure:** 8 saat

### 2.1 Supabase Kurulumu

```bash
pnpm add @supabase/ssr @supabase/supabase-js
```

### 2.2 Database Schema

```sql
-- scripts/001_create_tables.sql

-- Users tablosu (Supabase Auth ile otomatik)

-- Projects tablosu
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks tablosu
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages tablosu
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('prompt-engine', 'automation')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Git worktrees tablosu
CREATE TABLE git_worktrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  branch TEXT NOT NULL,
  path TEXT NOT NULL,
  is_current BOOLEAN DEFAULT false,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE git_worktrees ENABLE ROW LEVEL SECURITY;

-- Projects RLS
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Tasks RLS
CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

-- Chat messages RLS
CREATE POLICY "Users can view own messages" ON chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Worktrees RLS
CREATE POLICY "Users can view own worktrees" ON git_worktrees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own worktrees" ON git_worktrees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own worktrees" ON git_worktrees FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_tasks_user ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_chat_project ON chat_messages(project_id);
CREATE INDEX idx_chat_type ON chat_messages(type);
```

### 2.3 Supabase Client

```typescript
// lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// lib/db/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/db/supabase-server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

### 2.4 Auth Middleware

```typescript
// lib/auth/require-auth.ts
import { createSupabaseServerClient } from '@/lib/db/supabase-server';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/auth/login');
  }
  
  return user;
}

export async function getOptionalUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
```

### 2.5 Auth UI

```typescript
// app/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/db/supabase-browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully');
      router.push('/');
    }
    setLoading(false);
  };

  const handleGitHubLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In to VSCodeux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={handleGitHubLogin}>
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 2.6 Gorevler

- [ ] Supabase entegrasyonu ekle (v0 Settings > Integrations)
- [ ] Database schema olustur
- [ ] `lib/db/` klasorunu olustur
- [ ] Auth middleware olustur
- [ ] Login/Signup sayfalari olustur
- [ ] API route'lari auth ile guncelle
- [ ] In-memory storage'i Supabase ile degistir

---

## FAZ 3: Security (Rate Limiting + Validation)

**Oncelik:** P0 - KRITIK  
**Token:** ~25K | **Istek:** 12-18 | **Sure:** 4 saat

### 3.1 Rate Limiting

```bash
pnpm add @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit/index.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// General API: 60 requests per minute
export const apiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  analytics: true,
  prefix: 'api',
});

// AI requests: 10 requests per minute (daha pahalı)
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ai',
});

// Auth attempts: 5 per minute (brute force koruması)
export const authRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
  analytics: true,
  prefix: 'auth',
});
```

### 3.2 Input Validation

```bash
pnpm add zod
```

```typescript
// lib/validations/index.ts
export * from './task';
export * from './chat';
export * from './project';

// lib/validations/task.ts
import { z } from 'zod';

export const TaskStatusSchema = z.enum(['todo', 'in-progress', 'completed']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(5000).optional(),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  tags: z.array(z.string().max(50)).max(10).optional(),
  projectId: z.string().uuid().optional(),
});

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
  id: z.string().uuid(),
});

// lib/validations/chat.ts
import { z } from 'zod';

export const ChatTypeSchema = z.enum(['prompt-engine', 'automation']);

export const SendMessageSchema = z.object({
  type: ChatTypeSchema,
  content: z.string().min(1).max(50000),
  model: z.string().optional(),
  projectId: z.string().uuid().optional(),
});

// lib/validations/project.ts
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  settings: z.record(z.unknown()).optional(),
});
```

### 3.3 Security Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { apiRateLimiter, aiRateLimiter, authRateLimiter } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'anonymous';
  
  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Rate limiting
  if (path.startsWith('/api/')) {
    let limiter = apiRateLimiter;
    
    if (path.startsWith('/api/chat/stream') || path.startsWith('/api/ai/')) {
      limiter = aiRateLimiter;
    } else if (path.startsWith('/api/auth/')) {
      limiter = authRateLimiter;
    }
    
    const { success, limit, reset, remaining } = await limiter.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfter: reset },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }
  
  return response;
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 3.4 Gorevler

- [ ] Upstash Redis entegrasyonu ekle
- [ ] Rate limiter'lari olustur
- [ ] Zod validation schemalar olustur
- [ ] API route'lara validation ekle
- [ ] Security headers middleware ekle
- [ ] CORS yapilandirmasi

---

## FAZ 4: Error Handling + UX

**Oncelik:** P1 - YUKSEK  
**Token:** ~30K | **Istek:** 15-20 | **Sure:** 5 saat

### 4.1 Error Pages

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[v0] Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md text-center">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
```

### 4.2 API Error Handler

```typescript
// lib/api/error-handler.ts
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  console.error('[v0] API Error:', error);
  
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 4.3 Loading States

```typescript
// components/loading/chat-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// components/loading/task-skeleton.tsx
export function TaskSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
```

### 4.4 SWR Data Fetching

```bash
pnpm add swr
```

```typescript
// lib/swr/fetcher.ts
export async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error('Fetch failed');
    throw error;
  }
  
  return res.json();
}

// hooks/use-tasks.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/swr/fetcher';
import type { Task } from '@/lib/ai/tasks/types';

export function useTasks(projectId?: string) {
  const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks';
  
  const { data, error, isLoading, mutate } = useSWR<Task[]>(url, fetcher, {
    revalidateOnFocus: true,
  });

  return {
    tasks: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

// hooks/use-chat-history.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/swr/fetcher';

export function useChatHistory(type: 'prompt-engine' | 'automation', projectId?: string) {
  const url = `/api/chat?type=${type}${projectId ? `&projectId=${projectId}` : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return {
    messages: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
```

### 4.5 Gorevler

- [ ] `app/error.tsx` olustur
- [ ] `app/not-found.tsx` olustur
- [ ] API error handler olustur
- [ ] Toast notifications entegre et (sonner mevcut)
- [ ] SWR ile data fetching
- [ ] Loading skeletonlari ekle
- [ ] Optimistic updates ekle

---

## FAZ 5: Frontend Gelistirmeleri

**Oncelik:** P1 - YUKSEK  
**Token:** ~45K | **Istek:** 20-30 | **Sure:** 7 saat

### 5.1 Monaco Editor

```bash
pnpm add @monaco-editor/react
```

```typescript
// components/editor/code-editor.tsx
'use client';

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Skeleton } from '@/components/ui/skeleton';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

interface CodeEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
  readOnly?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  readOnly = false,
}: CodeEditorProps) {
  const { theme } = useTheme();
  
  return (
    <MonacoEditor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      options={{
        readOnly,
        minimap: { enabled: true },
        fontSize: 14,
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        folding: true,
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
```

### 5.2 Command Palette

```typescript
// components/command/command-palette.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  FileText, Settings, Terminal, MessageSquare, ListTodo, GitBranch
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => setOpen(false)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Files</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <ListTodo className="mr-2 h-4 w-4" />
            <span>Tasks</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <Terminal className="mr-2 h-4 w-4" />
            <span>Terminal</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => setOpen(false)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>New Chat</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <GitBranch className="mr-2 h-4 w-4" />
            <span>Create Branch</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

### 5.3 xterm.js Terminal (Mevcut ama kullanilmiyor)

```typescript
// components/terminal/xterm-terminal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  onInput?: (data: string) => void;
}

export function XTerminal({ onInput }: XTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  useEffect(() => {
    if (!terminalRef.current || xtermRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, monospace',
      theme: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.onData((data) => onInput?.(data));
    
    term.writeln('Welcome to VSCodeux Terminal');
    term.write('$ ');

    xtermRef.current = term;

    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [onInput]);

  return (
    <div ref={terminalRef} className="h-full w-full bg-[#0d1117] rounded-lg overflow-hidden" />
  );
}
```

### 5.4 Gorevler

- [ ] Monaco Editor entegrasyonu
- [ ] Command Palette (Cmd+K)
- [ ] xterm.js terminal aktif et
- [ ] Keyboard shortcuts ekle
- [ ] File uploader ekle
- [ ] Diff viewer ekle
- [ ] Onboarding wizard

---

## FAZ 6: Testing

**Oncelik:** P1 - YUKSEK  
**Token:** ~40K | **Istek:** 18-25 | **Sure:** 6 saat

### 6.1 Test Altyapisi

```bash
pnpm add -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'components/ui/'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
});

// vitest.setup.ts
import '@testing-library/jest-dom';
```

### 6.2 Gorevler

- [ ] Vitest kurulumu
- [ ] Test setup dosyalari
- [ ] Unit tests (lib/, hooks/)
- [ ] Component tests (components/)
- [ ] API route tests (app/api/)
- [ ] Coverage raporlama

---

## FAZ 7: DevOps

**Oncelik:** P1 - YUKSEK  
**Token:** ~20K | **Istek:** 10-15 | **Sure:** 3 saat

### 7.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
          
      - run: pnpm install --frozen-lockfile
      
      - name: Type Check
        run: pnpm tsc --noEmit
        
      - name: Lint
        run: pnpm lint
        
      - name: Test
        run: pnpm test
        
      - name: Build
        run: pnpm build
```

### 7.2 Gorevler

- [ ] GitHub Actions CI
- [ ] Pre-commit hooks (husky + lint-staged)
- [ ] Vercel deployment config
- [ ] Sentry error tracking
- [ ] Vercel Analytics

---

## FAZ 8: Polish & Optimization

**Oncelik:** P2 - ORTA  
**Token:** ~35K | **Istek:** 15-22 | **Sure:** 5 saat

### 8.1 Gorevler

- [ ] Code splitting (dynamic imports)
- [ ] Bundle analysis
- [ ] Image optimization
- [ ] Caching strategy
- [ ] Accessibility fixes
- [ ] i18n hazirlik
- [ ] TypeScript strict mode
- [ ] ESLint configuration
- [ ] Documentation

---

## Oncelik Ozeti

### P0 - Kritik (Faz 0-3)

| Gorev | Token | Sure |
|-------|-------|------|
| Provider temizlik | 3K | 30 dk |
| AI SDK | 15K | 3 saat |
| Database | 30K | 5 saat |
| Auth | 20K | 3 saat |
| Rate limiting | 8K | 2 saat |
| Input validation | 10K | 2 saat |
| .env.example | 2K | 15 dk |
| **P0 TOPLAM** | **88K** | **16 saat** |

### P1 - Yuksek (Faz 4-7)

| Gorev | Token | Sure |
|-------|-------|------|
| Error handling | 10K | 2 saat |
| SWR | 12K | 2 saat |
| Loading states | 8K | 1 saat |
| Monaco Editor | 10K | 2 saat |
| Terminal | 12K | 2 saat |
| Command Palette | 8K | 1 saat |
| Testing | 40K | 6 saat |
| CI/CD | 15K | 2 saat |
| **P1 TOPLAM** | **115K** | **18 saat** |

### P2 - Orta (Faz 8)

| Gorev | Token | Sure |
|-------|-------|------|
| Code splitting | 5K | 1 saat |
| Accessibility | 12K | 2 saat |
| Documentation | 8K | 1 saat |
| ESLint | 5K | 1 saat |
| **P2 TOPLAM** | **30K** | **5 saat** |

---

## Toplam Ozet

| Kategori | Token | Istek | Maliyet | Sure |
|----------|-------|-------|---------|------|
| P0 Kritik | ~88K | 40-55 | $6-8 | 16 saat |
| P1 Yuksek | ~115K | 50-70 | $8-10 | 18 saat |
| P2 Orta | ~30K | 15-22 | $2-3 | 5 saat |
| **TOPLAM** | **~233K** | **105-147** | **$16-21** | **39 saat** |

---

## Sonraki Adimlar

1. **Hemen:** Faz 0 (Temizlik) baslat
2. **Bugun:** Supabase entegrasyonu ekle
3. **Yarin:** AI SDK entegrasyonu
4. **Hafta Sonu:** Auth + Security
5. **Hafta 2:** Frontend + Testing

**Onay icin:** "Baslayalim" deyin.

---

*Olusturulma: 2026-04-05*  
*Son Guncelleme: v3.0 (Konsolide)*  
*Toplam Eksik: 127 item*  
*Tahmini Efor: 39 saat*  
*Tahmini Maliyet: $16-21 USD (v0 Max)*
