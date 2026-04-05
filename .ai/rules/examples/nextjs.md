---
name: "nextjs-rules"
category: framework
scope: workspace
enabled: true
---

# Next.js Rules

Next.js 16+ gelistirme kurallari.

## App Router Rules

### File Structure
```
app/
├── layout.tsx          # Root layout (required)
├── page.tsx            # Home page
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 UI
├── globals.css         # Global styles
└── [route]/
    ├── page.tsx        # Route page
    └── layout.tsx      # Nested layout
```

### Server vs Client Components

**Default: Server Component**
```typescript
// No directive needed for server components
export default async function Page() {
  const data = await fetchData(); // Server-side
  return <div>{data}</div>;
}
```

**Client Component**
```typescript
'use client'; // MUST be first line

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Data Fetching

**Server Component (preferred)**
```typescript
export default async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache', // or 'no-store'
  });
  return <div>{data}</div>;
}
```

**Client Component (when needed)**
```typescript
'use client';
import useSWR from 'swr';

export function DataComponent() {
  const { data, error, isLoading } = useSWR('/api/data', fetcher);
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  return <div>{data}</div>;
}
```

### Metadata

```typescript
// app/layout.tsx or app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
  },
};
```

### API Routes

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
```

## Prohibited Patterns

```typescript
// ❌ DO NOT use pages directory
pages/index.tsx // WRONG

// ❌ DO NOT use getServerSideProps/getStaticProps
export async function getServerSideProps() {} // WRONG

// ❌ DO NOT import server-only in client
'use client';
import { db } from '@/lib/db'; // WRONG
```

## Required Patterns

```typescript
// ✅ Use async/await in server components
export default async function Page() {
  const data = await getData();
  return <div>{data}</div>;
}

// ✅ Use loading.tsx for suspense
export default function Loading() {
  return <Skeleton />;
}

// ✅ Use error.tsx for error boundaries
'use client';
export default function Error({ error, reset }) {
  return <ErrorDisplay error={error} onRetry={reset} />;
}
```
