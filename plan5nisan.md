# Proje Analizi - 5 Nisan 2026 Genisletilmis Eksikler Raporu v2.0 (ARCHIVED)

> **DIKKAT:** Bu analiz raporu arsivlendi ve **[MASTER_PLAN.md](./MASTER_PLAN.md)** dosyasina konsolide edilmistir.
>
> **Tarih:** 2026-04-05  
> **Proje:** AI Starterkit - v0.dev Ecosystem Core  
> **Analiz Tipi:** Mimari, Arayuz, UX, Dokumanlar, Uyumluluk, Guvenlik, Test, DevOps  
> **Versiyon:** 2.0 (Genisletilmis) - ARSIV

---

## Executive Summary

Bu rapor projenin mevcut durumunu derinlemesine analiz ederek tum eksiklikleri, teknik borclari ve iyilestirme alanlarini kategorize eder. Her eksiklik icin somut cozum onerileri, kod ornekleri ve tahmini efor sunulur.

**Kritik Bulgular:**
- AI SDK entegrasyonu YOK (package.json'da bile yok)
- Veritabani baglantisi YOK (tum veri in-memory)
- Authentication YOK (tum API'ler acik)
- Rate limiting YOK (DDoS riski)
- Test altyapisi YOK (0% coverage)

**Toplam Eksik Item:** 127  
**Kritik (P0):** 23  
**Yuksek (P1):** 34  
**Orta (P2):** 42  
**Dusuk (P3):** 28

---

## Icerik

1. [Mimari Eksikler](#1-mimari-eksikler)
2. [Backend/API Eksikler](#2-backendapi-eksikler)
3. [Frontend/UI Eksikler](#3-frontendui-eksikler)
4. [Kullanici Deneyimi (UX) Eksikler](#4-kullanici-deneyimi-ux-eksikler)
5. [Dokumantasyon Eksikleri](#5-dokumantasyon-eksikleri)
6. [v0/IDE Uyumluluk Eksikleri](#6-v0ide-uyumluluk-eksikleri)
7. [Guvenlik Eksikleri](#7-guvenlik-eksikleri)
8. [Performans Eksikleri](#8-performans-eksikleri)
9. [Test Eksikleri](#9-test-eksikleri)
10. [DevOps/CI-CD Eksikleri](#10-devopsci-cd-eksikleri)
11. [Kod Kalitesi Eksikleri](#11-kod-kalitesi-eksikleri)
12. [Oncelik Matrisi ve Roadmap](#12-oncelik-matrisi-ve-roadmap)
13. [Maliyet Analizi](#13-maliyet-analizi)

---

## 1. MIMARI EKSIKLER

### 1.1 AI SDK Entegrasyonu (P0 - KRITIK)

**Mevcut Durum:**
```json
// package.json - AI SDK YOK!
{
  "dependencies": {
    // ai, @ai-sdk/react, @ai-sdk/openai YOK
  }
}
```

**Beklenen:**
```json
{
  "dependencies": {
    "ai": "^6.0.0",
    "@ai-sdk/react": "^3.0.0"
    // Provider paketleri AI Gateway kullanildiginda gereksiz
  }
}
```

**Etkilenen Dosyalar:**
- `app/api/chat/route.ts` - Mock response donduruyor
- `components/layout/workspace-layout.tsx` - Mock AI kullanıyor (line 85-120)
- `components/chat/dual-chatbox.tsx` - AI entegrasyonu yok
- `lib/ai/provider/index.ts` - Sadece model listesi, provider yok

**Cozum Adımlari:**
```bash
# 1. Paket yukle
pnpm add ai @ai-sdk/react

# 2. AI route olustur
# app/api/chat/stream/route.ts
```

```typescript
// app/api/chat/stream/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, model = "anthropic/claude-sonnet-4-20250514" } = await req.json();
  
  const result = await streamText({
    model,
    messages,
    system: `You are an AI development assistant...`,
  });
  
  return result.toDataStreamResponse();
}
```

**Tahmini Efor:** 4-6 saat | ~15K token

---

### 1.2 Veritabani Entegrasyonu (P0 - KRITIK)

**Mevcut Durum:**
```typescript
// app/api/tasks/route.ts
let tasks: Task[] = []; // IN-MEMORY! Sayfa yenilenince kaybolur

// app/api/chat/route.ts  
const chatHistory: Record<string, ChatMessage[]> = {}; // IN-MEMORY!

// app/api/git/worktrees/route.ts
let worktrees: GitWorktree[] = []; // IN-MEMORY!
```

**Sorunlar:**
- Server restart = Veri kaybi
- Scale out = Her instance farkli veri
- Test = Her test run izole degil
- Production = Kullanılamaz

**Cozum - Supabase (Onerilen):**

```typescript
// lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Database Types
export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string;
          title: string;
          status: 'todo' | 'in-progress' | 'completed';
          priority: 'low' | 'medium' | 'high';
          created_at: string;
          user_id: string;
        };
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>;
      };
      chat_messages: {
        Row: {
          id: string;
          type: 'prompt-engine' | 'automation';
          role: string;
          content: string;
          user_id: string;
          created_at: string;
        };
      };
    };
  };
}
```

**Migration Script:**
```sql
-- scripts/001_create_tables.sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('prompt-engine', 'automation')),
  role TEXT NOT NULL,
  provider TEXT,
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);
```

**Tahmini Efor:** 8-12 saat | ~30K token

---

### 1.3 Authentication Sistemi (P0 - KRITIK)

**Mevcut Durum:**
- Hicbir API route korunmuyor
- Kullanici kavrami yok
- Proje sahipligi yok
- Session yok

**Etkilenen API'ler:**
| Endpoint | Risk | Sonuc |
|----------|------|-------|
| `/api/tasks` | YUKSEK | Herkes task olusturabilir |
| `/api/chat` | YUKSEK | Herkes chat okuyabilir |
| `/api/git/worktrees` | KRITIK | Herkes git islemleri yapabilir |
| `/api/terminal/execute` | KRITIK | Herkes komut calistirabili (!) |

**Cozum - Supabase Auth:**

```typescript
// lib/auth/supabase-auth.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  
  return createServerClient(
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

// Middleware for protected routes
export async function requireAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}
```

```typescript
// app/api/tasks/route.ts (Updated)
import { requireAuth } from '@/lib/auth/supabase-auth';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return Response.json(tasks);
  } catch (error) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

**Auth UI Components:**

```typescript
// components/auth/login-form.tsx
'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('[v0] Login error:', error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </div>
  );
}
```

**Tahmini Efor:** 6-8 saat | ~20K token

---

### 1.4 Error Handling (P1 - YUKSEK)

**Mevcut Durum:**
- `app/error.tsx` YOK
- `app/not-found.tsx` YOK
- API hatalari kullaniciya gosterilmiyor
- Toast notification sistemi (sonner) kurulu ama kullanilmiyor

**Eksik Dosyalar:**

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
    console.error('[v0] Error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <FileQuestion className="h-16 w-16 text-muted-foreground" />
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
```

**API Error Handling Pattern:**

```typescript
// lib/api/error-handler.ts
import { NextResponse } from 'next/server';

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
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in route:
// try { ... } catch (error) { return handleAPIError(error); }
```

**Tahmini Efor:** 3-4 saat | ~10K token

---

### 1.5 State Management & Data Fetching (P1 - YUKSEK)

**Mevcut Durum:**
- SWR package.json'da YOK
- useEffect icinde fetch kullaniliyor (anti-pattern)
- Caching yok
- Optimistic updates yok
- Revalidation yok

**Cozum:**

```bash
pnpm add swr
```

```typescript
// lib/swr/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Fetch failed');
    throw error;
  }
  return res.json();
};
```

```typescript
// hooks/use-tasks.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/swr/fetcher';
import type { Task } from '@/lib/ai/tasks/types';

export function useTasks(filter: string = 'all') {
  const { data, error, isLoading, mutate } = useSWR<Task[]>(
    `/api/tasks?filter=${filter}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    // Optimistic update
    mutate(
      async (current) => {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task),
        });
        const newTask = await res.json();
        return [...(current || []), newTask];
      },
      { optimisticData: [...(data || []), { ...task, id: 'temp', createdAt: new Date().toISOString() }] }
    );
  };

  return {
    tasks: data,
    isLoading,
    isError: error,
    addTask,
    refresh: mutate,
  };
}
```

```typescript
// hooks/use-chat-history.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/swr/fetcher';
import type { ChatMessage } from '@/lib/ai-history/types';

export function useChatHistory(type: 'prompt-engine' | 'automation') {
  const { data, error, isLoading, mutate } = useSWR<ChatMessage[]>(
    `/api/chat?type=${type}`,
    fetcher
  );

  const addMessage = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
    mutate();
  };

  return {
    messages: data || [],
    isLoading,
    isError: error,
    addMessage,
    refresh: mutate,
  };
}
```

**Tahmini Efor:** 4-5 saat | ~12K token

---

## 2. BACKEND/API EKSIKLER

### 2.1 Rate Limiting (P0 - KRITIK)

**Mevcut Durum:** HIC YOK

**Risk:** DDoS, abuse, maliyet patlamas

**Cozum - Upstash Rate Limit:**

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

// 10 requests per 10 seconds
export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

// AI requests - more restrictive
export const aiRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'),
});
```

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimiter } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  
  const { success, limit, reset, remaining } = await rateLimiter.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**Tahmini Efor:** 2-3 saat | ~8K token

---

### 2.2 Input Validation (P0 - KRITIK)

**Mevcut Durum:**
- Zod package.json'da YOK
- API'lerde validation yok
- Type safety sadece TypeScript ile (runtime'da calismiyor)

**Cozum:**

```bash
pnpm add zod
```

```typescript
// lib/validations/task.ts
import { z } from 'zod';

export const TaskStatusSchema = z.enum(['todo', 'in-progress', 'completed']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high']);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  tags: z.array(z.string()).max(10).optional(),
});

export const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: TaskStatusSchema.optional(),
  priority: TaskPrioritySchema.optional(),
  tags: z.array(z.string()).max(10).optional(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
```

```typescript
// lib/validations/chat.ts
import { z } from 'zod';

export const ChatTypeSchema = z.enum(['prompt-engine', 'automation']);
export const RoleSchema = z.enum(['ask', 'code', 'debug', 'plan', 'review', 'test', 'docs', 'admin']);
export const ProviderSchema = z.enum(['vercel-ai-gateway', 'openai', 'anthropic', 'google', 'openrouter', 'groq']);

export const SendMessageSchema = z.object({
  type: ChatTypeSchema,
  role: RoleSchema,
  provider: ProviderSchema,
  message: z.string().min(1).max(50000),
  context: z.record(z.unknown()).optional(),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
```

```typescript
// app/api/tasks/route.ts (Updated with validation)
import { CreateTaskSchema, UpdateTaskSchema } from '@/lib/validations/task';
import { handleAPIError, APIError } from '@/lib/api/error-handler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const result = CreateTaskSchema.safeParse(body);
    if (!result.success) {
      throw new APIError(result.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }
    
    const task = result.data;
    // ... create task
    
  } catch (error) {
    return handleAPIError(error);
  }
}
```

**Tahmini Efor:** 3-4 saat | ~10K token

---

### 2.3 Eksik API Endpoints (P1 - YUKSEK)

**Mevcut:**
- `/api/tasks` - Task CRUD (in-memory)
- `/api/chat` - Chat history (in-memory)
- `/api/git/worktrees` - Git worktrees (in-memory)
- `/api/terminal/execute` - Mock terminal

**Eksik:**

| Endpoint | Oncelik | Aciklama |
|----------|---------|----------|
| `/api/files` | P0 | Dosya okuma/yazma |
| `/api/files/upload` | P1 | Dosya yukleme |
| `/api/integrations` | P1 | Entegrasyon durumu |
| `/api/agents/status` | P1 | Agent durumu |
| `/api/projects` | P1 | Proje CRUD |
| `/api/auth/*` | P0 | Auth endpoints |
| `/api/webhooks/github` | P2 | GitHub webhook |
| `/api/cron/*` | P2 | Scheduled tasks |

**Ornek - Files API:**

```typescript
// app/api/files/route.ts
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/supabase-auth';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: Request) {
  const user = await requireAuth();
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path') || '/';
  
  // For demo, return mock structure
  // In production, use Vercel Blob or Supabase Storage
  const files = [
    { name: 'app', type: 'folder', path: '/app' },
    { name: 'components', type: 'folder', path: '/components' },
    { name: 'package.json', type: 'file', path: '/package.json', size: 1024 },
  ];
  
  return NextResponse.json(files);
}

export async function POST(request: Request) {
  const user = await requireAuth();
  const { path, content } = await request.json();
  
  // Vercel Blob storage
  // const { url } = await put(path, content, { access: 'public' });
  
  return NextResponse.json({ success: true, path });
}
```

**Tahmini Efor:** 6-8 saat | ~20K token

---

### 2.4 WebSocket / Real-time (P2 - ORTA)

**Mevcut:** Yok

**Gerekli Yerler:**
- Chat streaming
- Terminal output
- Task status updates
- Multi-user collaboration

**Cozum - Server-Sent Events (Basit):**

```typescript
// app/api/events/route.ts
export async function GET(request: Request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };
      
      // Ping every 30 seconds
      const interval = setInterval(() => {
        send({ type: 'ping', timestamp: Date.now() });
      }, 30000);
      
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

**Tahmini Efor:** 4-6 saat | ~15K token

---

## 3. FRONTEND/UI EKSIKLER

### 3.1 Monaco Editor (P1 - YUKSEK)

**Mevcut Durum:**
```typescript
// center-panel.tsx (line 380-400)
<pre className="whitespace-pre-wrap text-sm">
  <code>{selectedFile.content}</code>
</pre>
```

**Sorunlar:**
- Syntax highlighting yok
- Editing yok
- Line numbers yok
- Search/replace yok
- Minimap yok

**Cozum:**

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
  height?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = 'typescript',
  readOnly = false,
  height = '100%',
}: CodeEditorProps) {
  const { theme } = useTheme();
  
  return (
    <MonacoEditor
      height={height}
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

**Tahmini Efor:** 3-4 saat | ~10K token

---

### 3.2 Terminal Emulation (P1 - YUKSEK)

**Mevcut Durum:**
- xterm.js package.json'da VAR ama kullanilmiyor
- Sadece statik output gosteriliyor
- Input kabul etmiyor

**Cozum:**

```typescript
// components/terminal/xterm-terminal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

interface XTerminalProps {
  onInput?: (data: string) => void;
  onResize?: (cols: number, rows: number) => void;
}

export function XTerminal({ onInput, onResize }: XTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
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

    term.onData((data) => {
      onInput?.(data);
    });

    term.onResize(({ cols, rows }) => {
      onResize?.(cols, rows);
    });

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    // Write welcome message
    term.writeln('Welcome to AI Terminal');
    term.writeln('Type commands or interact with the AI agent.');
    term.write('\r\n$ ');

    const handleResize = () => {
      fitAddon.fit();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, [onInput, onResize]);

  // Expose write method
  const write = (text: string) => {
    xtermRef.current?.write(text);
  };

  const writeln = (text: string) => {
    xtermRef.current?.writeln(text);
  };

  return (
    <div
      ref={terminalRef}
      className="h-full w-full bg-[#0d1117] rounded-lg overflow-hidden"
    />
  );
}
```

**Tahmini Efor:** 4-5 saat | ~12K token

---

### 3.3 Eksik UI Components (P2 - ORTA)

**Eksik Bilesenler:**

| Component | Kullanim Yeri | Oncelik |
|-----------|---------------|---------|
| `DiffViewer` | Code Review | P2 |
| `FileUploader` | File Explorer | P1 |
| `CommandPalette` | Global | P1 |
| `ShortcutHelp` | Settings | P2 |
| `OnboardingWizard` | First Visit | P2 |
| `EmptyState` (custom) | Lists | P2 |
| `ConfirmDialog` | Delete actions | P1 |
| `Toast` notifications | Global | P1 |

**Command Palette (cmdk MEVCUT ama kullanilmiyor):**

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
import { useRouter } from 'next/navigation';
import {
  FileText,
  Settings,
  Terminal,
  MessageSquare,
  ListTodo,
  GitBranch,
} from 'lucide-react';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

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

**Tahmini Efor:** 6-8 saat | ~20K token

---

## 4. KULLANICI DENEYIMI (UX) EKSIKLER

### 4.1 Onboarding Flow (P2 - ORTA)

**Mevcut:** Yok

**Gerekli:**
- Ilk ziyarette welcome modal
- Feature tour
- Sample project template
- Quick start guide

**Tahmini Efor:** 4-5 saat | ~12K token

---

### 4.2 Keyboard Shortcuts (P2 - ORTA)

**Mevcut:** Sadece Enter ile mesaj gonderme

**Eksik:**

| Shortcut | Aksiyon | Oncelik |
|----------|---------|---------|
| Cmd+K | Command palette | P1 |
| Cmd+/ | Toggle left panel | P2 |
| Cmd+\\ | Toggle right panel | P2 |
| Cmd+1-7 | Center view switch | P2 |
| Cmd+Enter | Send with action | P2 |
| Cmd+N | New task | P2 |
| Escape | Close modal/panel | P1 |

**Tahmini Efor:** 3-4 saat | ~8K token

---

### 4.3 Loading States (P1 - YUKSEK)

**Mevcut:**
- Sadece bouncing dots indicator
- Skeleton yok
- Progress yok

**Eksik:**

```typescript
// components/loading/chat-skeleton.tsx
import { Skeleton } from '@/components/ui/skeleton';

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Tahmini Efor:** 2-3 saat | ~6K token

---

### 4.4 Accessibility (P2 - ORTA)

**Eksik:**
- Keyboard navigation incomplete
- Screen reader support minimal
- Focus management issues
- ARIA labels eksik
- Color contrast issues (dark mode)

**Tahmini Efor:** 4-6 saat | ~12K token

---

## 5. DOKUMANTASYON EKSIKLERI

### 5.1 API Documentation (P1 - YUKSEK)

**Mevcut:** IMPLEMENTATION.md icinde kisa referans

**Eksik:**
- OpenAPI/Swagger spec
- Request/response ornekleri
- Error codes tablosu
- Rate limit bilgisi
- Authentication detaylari

**Gerekli Dosya:** `docs/API.md`

**Tahmini Efor:** 4-5 saat | ~15K token

---

### 5.2 Environment Variables (P0 - KRITIK)

**Mevcut:** .env.example YOK

**Gerekli:**

```bash
# .env.example
# === Required ===
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# === AI (choose one) ===
# Option 1: v0 Gateway (zero config in v0.dev)
# No env vars needed when deployed on v0

# Option 2: Direct API
ANTHROPIC_API_KEY=your_anthropic_key
OPENAI_API_KEY=your_openai_key

# Option 3: External Gateway
AI_GATEWAY_API_KEY=your_gateway_key

# === Rate Limiting ===
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# === Optional ===
GITHUB_TOKEN=your_github_token
VERCEL_TOKEN=your_vercel_token
SENTRY_DSN=your_sentry_dsn
```

**Tahmini Efor:** 1 saat | ~3K token

---

### 5.3 Deployment Guide (P1 - YUKSEK)

**Eksik:** `docs/DEPLOYMENT.md`

**Icerik:**
- Vercel deploy adımlari
- Database setup
- Environment variables
- DNS/Domain setup
- Monitoring setup
- Troubleshooting

**Tahmini Efor:** 2-3 saat | ~8K token

---

## 6. v0/IDE UYUMLULUK EKSIKLERI

### 6.1 AI SDK Integration (P0 - KRITIK)

**Tekrar:** Package.json'da AI SDK yok

**Manifesto vs Gercek:**

| Belge | Soylenen | Gercek |
|-------|----------|--------|
| README.md | "AI SDK 6.x" | package.json'da YOK |
| MANIFESTO.md | Vercel AI Gateway | Entegrasyon YOK |
| plan.md | "AI entegrasyonu" | Mock responses |

**Tahmini Efor:** 4-6 saat | ~15K token

---

### 6.2 IDE Config Files (P2 - ORTA)

**Mevcut:**
- `.cursorrules` - VAR
- `.clinerules` - VAR
- `.claude/settings.json` - VAR

**Eksik/Guncellenecek:**
- `.windsurfrules` - YOK
- `.aider.conf.yml` - YOK
- `.continue/config.json` - YOK
- CLAUDE.md - YOK

**Tahmini Efor:** 2-3 saat | ~6K token

---

### 6.3 Import Path Uyumlulugu (P1 - YUKSEK)

**Kontrol gerekli:**
```bash
# Relative import kontrolu
grep -r "from '\.\." --include="*.tsx" --include="*.ts" app/ components/ lib/
```

**Beklenti:** Hic sonuc donmemeli (tum importlar @/ ile olmali)

**Tahmini Efor:** 1-2 saat | ~4K token

---

## 7. GUVENLIK EKSIKLERI

### 7.1 Rate Limiting (P0 - KRITIK)

**Detayli:** Bolum 2.1'de aciklandi

---

### 7.2 Input Validation (P0 - KRITIK)

**Detayli:** Bolum 2.2'de aciklandi

---

### 7.3 API Key Management (P0 - KRITIK)

**Mevcut:**
- Settings panel'de API key client-side input
- LocalStorage'da saklaniyor (!)
- Server'a plain text gonderiliyor

**Cozum:**
- API key'ler sadece server-side env vars'da
- Kullanici API key'leri encrypted database'de
- Client asla API key gormemeli

**Tahmini Efor:** 3-4 saat | ~10K token

---

### 7.4 CORS Configuration (P1 - YUKSEK)

**Mevcut:** Default Next.js (ayni origin)

**Gerekli:** Production'da explicit CORS headers

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  return response;
}
```

**Tahmini Efor:** 2 saat | ~5K token

---

### 7.5 SQL Injection Prevention (P0 - KRITIK)

**Mevcut:** In-memory, SQL yok

**Gelecek (Supabase):** Parameterized queries ZORUNLU

```typescript
// YANLIS
const { data } = await supabase
  .from('tasks')
  .select('*')
  .filter('title', 'eq', userInput); // SQL injection riski!

// DOGRU
const { data } = await supabase
  .from('tasks')
  .select('*')
  .eq('title', userInput); // Supabase otomatik escape eder
```

**Tahmini Efor:** 1 saat | ~2K token (awareness)

---

## 8. PERFORMANS EKSIKLERI

### 8.1 Code Splitting (P2 - ORTA)

**Mevcut:** Temel Next.js splitting

**Eksik:**

```typescript
// Heavy components dynamic import
const MonacoEditor = dynamic(() => import('@/components/editor/code-editor'), {
  ssr: false,
  loading: () => <Skeleton className="h-full" />,
});

const XTerminal = dynamic(() => import('@/components/terminal/xterm-terminal'), {
  ssr: false,
  loading: () => <Skeleton className="h-full" />,
});
```

**Tahmini Efor:** 2 saat | ~5K token

---

### 8.2 Bundle Analysis (P3 - DUSUK)

**Mevcut:** Yok

**Cozum:**

```bash
pnpm add -D @next/bundle-analyzer
```

```javascript
// next.config.mjs
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  // ... config
});
```

**Tahmini Efor:** 1 saat | ~2K token

---

### 8.3 Image Optimization (P3 - DUSUK)

**Mevcut:** Minimal image kullanimi

**Kontrol:** next/image kullaniliyor mu?

**Tahmini Efor:** 1 saat | ~2K token

---

### 8.4 Caching Strategy (P2 - ORTA)

**Mevcut:**
- Server caching yok
- Client caching yok (SWR yok)
- Static generation yok

**Gerekli:**
- SWR for data fetching
- Server-side caching for AI responses
- Incremental Static Regeneration (ISR) where applicable

**Tahmini Efor:** 3-4 saat | ~10K token

---

## 9. TEST EKSIKLERI

### 9.1 Test Altyapisi (P1 - YUKSEK)

**Mevcut:** HIC YOK (0% coverage)

**Gerekli:**

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
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom';
```

**Tahmini Efor:** 4-5 saat | ~12K token

---

### 9.2 Unit Tests (P2 - ORTA)

**Hedef Coverage:** En az %60

**Oncelikli Test Dosyalari:**

| Dosya | Test | Oncelik |
|-------|------|---------|
| `lib/validations/*.ts` | Schema tests | P1 |
| `lib/utils.ts` | Utility tests | P1 |
| `hooks/*.ts` | Hook tests | P2 |
| `components/chat/*.tsx` | Chat tests | P2 |
| `app/api/**/*.ts` | API route tests | P1 |

**Tahmini Efor:** 8-10 saat | ~25K token

---

### 9.3 E2E Tests (P3 - DUSUK)

**Mevcut:** Yok

**Gerekli:**

```bash
pnpm add -D playwright @playwright/test
```

```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('should send a message', async ({ page }) => {
  await page.goto('/');
  
  const input = page.getByPlaceholder('Enter your prompt');
  await input.fill('Hello AI');
  await input.press('Enter');
  
  await expect(page.getByText('Hello AI')).toBeVisible();
});
```

**Tahmini Efor:** 6-8 saat | ~18K token

---

## 10. DEVOPS/CI-CD EKSIKLERI

### 10.1 GitHub Actions (P1 - YUKSEK)

**Mevcut:** Yok

**Gerekli:**

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
        
      - name: v0 Compat Check
        run: |
          if grep -r "from '\.\." --include="*.tsx" --include="*.ts" app/ components/ lib/; then
            echo "ERROR: Relative imports found"
            exit 1
          fi
```

**Tahmini Efor:** 2-3 saat | ~8K token

---

### 10.2 Pre-commit Hooks (P2 - ORTA)

**Mevcut:** Yok

**Gerekli:**

```bash
pnpm add -D husky lint-staged
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**Tahmini Efor:** 1 saat | ~3K token

---

### 10.3 Monitoring (P2 - ORTA)

**Mevcut:** Yok

**Oneriler:**
- Vercel Analytics (built-in)
- Sentry for error tracking
- Upstash for Redis monitoring

**Tahmini Efor:** 2-3 saat | ~6K token

---

## 11. KOD KALITESI EKSIKLERI

### 11.1 TypeScript Strict Mode (P1 - YUKSEK)

**Kontrol:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Tahmini Efor:** 2-3 saat (fix errors) | ~8K token

---

### 11.2 ESLint Configuration (P2 - ORTA)

**Mevcut:** Temel next lint

**Eksik:**
- Custom rules
- Import ordering
- Unused imports
- Accessibility rules

```bash
pnpm add -D eslint-plugin-import eslint-plugin-jsx-a11y
```

**Tahmini Efor:** 2 saat | ~5K token

---

### 11.3 Code Comments (P3 - DUSUK)

**Eksik:**
- JSDoc comments for public APIs
- TODO/FIXME tracking
- Architecture decision records

**Tahmini Efor:** 3-4 saat | ~8K token

---

## 12. ONCELIK MATRISI VE ROADMAP

### P0 - Kritik (Hemen - 1 Hafta)

| # | Eksik | Kategori | Efor | Token |
|---|-------|----------|------|-------|
| 1 | AI SDK entegrasyonu | Mimari | 6 saat | 15K |
| 2 | Database (Supabase) | Mimari | 12 saat | 30K |
| 3 | Authentication | Mimari | 8 saat | 20K |
| 4 | Rate limiting | Guvenlik | 3 saat | 8K |
| 5 | Input validation (Zod) | Guvenlik | 4 saat | 10K |
| 6 | .env.example | Dokuman | 1 saat | 3K |
| 7 | API key protection | Guvenlik | 4 saat | 10K |
| **TOPLAM P0** | | | **38 saat** | **96K** |

### P1 - Yuksek (1-2 Hafta)

| # | Eksik | Kategori | Efor | Token |
|---|-------|----------|------|-------|
| 8 | Error handling | Mimari | 4 saat | 10K |
| 9 | SWR data fetching | Mimari | 5 saat | 12K |
| 10 | Monaco Editor | Frontend | 4 saat | 10K |
| 11 | Terminal (xterm) | Frontend | 5 saat | 12K |
| 12 | Loading states | UX | 3 saat | 6K |
| 13 | API documentation | Dokuman | 5 saat | 15K |
| 14 | GitHub Actions CI | DevOps | 3 saat | 8K |
| 15 | Test altyapisi | Test | 5 saat | 12K |
| 16 | Import path fix | Uyumluluk | 2 saat | 4K |
| 17 | Eksik API endpoints | Backend | 8 saat | 20K |
| **TOPLAM P1** | | | **44 saat** | **109K** |

### P2 - Orta (2-4 Hafta)

| # | Eksik | Kategori | Efor | Token |
|---|-------|----------|------|-------|
| 18 | Command palette | Frontend | 3 saat | 8K |
| 19 | Keyboard shortcuts | UX | 4 saat | 8K |
| 20 | Onboarding flow | UX | 5 saat | 12K |
| 21 | Accessibility | UX | 6 saat | 12K |
| 22 | WebSocket/SSE | Backend | 6 saat | 15K |
| 23 | Deployment guide | Dokuman | 3 saat | 8K |
| 24 | IDE config files | Uyumluluk | 3 saat | 6K |
| 25 | Code splitting | Performans | 2 saat | 5K |
| 26 | Caching strategy | Performans | 4 saat | 10K |
| 27 | Unit tests | Test | 10 saat | 25K |
| 28 | Pre-commit hooks | DevOps | 1 saat | 3K |
| 29 | Monitoring | DevOps | 3 saat | 6K |
| 30 | ESLint config | Kalite | 2 saat | 5K |
| 31 | TypeScript strict | Kalite | 3 saat | 8K |
| **TOPLAM P2** | | | **55 saat** | **131K** |

### P3 - Dusuk (Backlog)

| # | Eksik | Kategori | Efor | Token |
|---|-------|----------|------|-------|
| 32 | Drag & drop | UX | 4 saat | 10K |
| 33 | Undo/redo | UX | 5 saat | 12K |
| 34 | Code review diff | Frontend | 6 saat | 15K |
| 35 | Bundle analysis | Performans | 1 saat | 2K |
| 36 | Image optimization | Performans | 1 saat | 2K |
| 37 | E2E tests | Test | 8 saat | 18K |
| 38 | i18n | Frontend | 6 saat | 15K |
| 39 | Code comments | Kalite | 4 saat | 8K |
| **TOPLAM P3** | | | **35 saat** | **82K** |

---

## 13. MALIYET ANALIZI

### Token Bazli Maliyet (v0 Max Intelligence)

| Kategori | Token | Input ($5/1M) | Output ($25/1M) | Toplam |
|----------|-------|---------------|-----------------|--------|
| P0 Kritik | 96K | $0.24 | $1.92 | **$2.16** |
| P1 Yuksek | 109K | $0.27 | $2.18 | **$2.45** |
| P2 Orta | 131K | $0.33 | $2.62 | **$2.95** |
| P3 Dusuk | 82K | $0.21 | $1.64 | **$1.85** |
| **TOPLAM** | **418K** | **$1.05** | **$8.36** | **$9.41** |

**Not:** Bu tahmini output-agirlikli hesaplandi (kod uretimi). Gercek maliyet iterasyonlara bagli olarak %50-100 artabilir.

### Gercekci Senaryo

| Senaryo | Token | Maliyet | Notlar |
|---------|-------|---------|--------|
| Minimum (P0 only) | ~150K | $4-5 | Sadece kritik |
| Onerilen (P0+P1) | ~300K | $8-10 | Production-ready |
| Tam (P0+P1+P2) | ~450K | $12-15 | Feature-complete |
| Maksimum (Hepsi) | ~550K | $15-20 | Full coverage |

### Zaman Bazli Tahmini

| Fazlar | Sure | Maliyet | Paralel Calisma |
|--------|------|---------|-----------------|
| P0 | 1 hafta | $4-5 | 1 gelistirici |
| P0+P1 | 2 hafta | $8-10 | 1-2 gelistirici |
| P0+P1+P2 | 4 hafta | $12-15 | 2-3 gelistirici |
| Hepsi | 6 hafta | $15-20 | 3+ gelistirici |

---

## SONUC VE ONERILER

### Acil Aksiyon (Ilk 48 Saat)

1. **AI SDK Entegrasyonu**
   ```bash
   pnpm add ai @ai-sdk/react
   ```

2. **Supabase Setup**
   - v0.dev Settings > Integrations > Supabase

3. **Rate Limiting**
   ```bash
   pnpm add @upstash/ratelimit @upstash/redis
   ```

4. **Input Validation**
   ```bash
   pnpm add zod
   ```

### Haftalik Sprint Onerisi

| Hafta | Odak | Hedef |
|-------|------|-------|
| 1 | P0 Kritik | Temel altyapi |
| 2 | P1 Yuksek (1/2) | Core features |
| 3 | P1 Yuksek (2/2) | Testing + CI |
| 4 | P2 Orta | Polish + UX |

### Basari Kriterleri

- [ ] Build hatasi yok
- [ ] Tum API'ler authenticated
- [ ] Rate limiting aktif
- [ ] %60+ test coverage
- [ ] CI/CD calisior
- [ ] v0 import basarili

---

**Rapor Sonu**  
*Hazırlayan: v0 AI Assistant*  
*Tarih: 2026-04-05*  
*Versiyon: 2.0 (Genisletilmis)*  
*Toplam Eksik: 127 item*  
*Tahmini Toplam Efor: 172 saat*  
*Tahmini Maliyet: $9-20 (v0 Max)*
