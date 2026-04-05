---
name: "component-gen"
category: generation
scope: global
enabled: true
requires: []
---

# Component Generation Skill

React component olusturma yetenegi.

## Description

Next.js ve shadcn/ui uyumlu component'lar olusturur.

## Usage

```bash
ai skill invoke component-gen --name=<name> --type=<type> [--props=<props>]
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | yes | Component adi (PascalCase) |
| `type` | string | no | client, server, form, list, card |
| `props` | string | no | Prop tanimlari |
| `path` | string | no | Hedef klasor |

## Component Types

### server (default)
React Server Component.

```typescript
// components/features/UserList.tsx
import { Card } from '@/components/ui/card';

interface UserListProps {
  limit?: number;
}

export async function UserList({ limit = 10 }: UserListProps) {
  const users = await fetchUsers(limit);
  
  return (
    <div className="grid gap-4">
      {users.map(user => (
        <Card key={user.id}>
          {user.name}
        </Card>
      ))}
    </div>
  );
}
```

### client
Client Component with interactivity.

```typescript
// components/features/Counter.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: CounterProps) {
  const [count, setCount] = useState(initialValue);
  
  return (
    <div className="flex items-center gap-4">
      <Button onClick={() => setCount(c => c - 1)}>-</Button>
      <span>{count}</span>
      <Button onClick={() => setCount(c => c + 1)}>+</Button>
    </div>
  );
}
```

### form
Form component with validation.

```typescript
// components/features/ContactForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const { register, handleSubmit, formState } = useForm<ContactFormData>();
  
  const onSubmit = async (data: ContactFormData) => {
    // Handle submission
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register('name', { required: true })} />
      </div>
      {/* More fields */}
      <Button type="submit" disabled={formState.isSubmitting}>
        Submit
      </Button>
    </form>
  );
}
```

### list
List component with loading states.

### card
Card-based display component.

## File Structure

Generated structure:
```
components/features/
├── ComponentName/
│   ├── index.ts           # Barrel export
│   ├── ComponentName.tsx  # Main component
│   └── types.ts           # Type definitions (optional)
```

Or single file:
```
components/features/
└── ComponentName.tsx
```

## Commands

### Generate Basic
```
Create a [server/client] component named [Name].
Props: [prop definitions]
Use shadcn/ui components.
Follow project conventions.
```

### Generate with Tests
```
Create component [Name] with:
1. Component file
2. Test file
3. Storybook story (optional)
```

## Examples

```bash
# Basic server component
ai skill invoke component-gen --name=ProductCard --type=server

# Client form
ai skill invoke component-gen --name=LoginForm --type=form

# With props
ai skill invoke component-gen --name=Avatar --props="src:string,alt:string,size?:sm|md|lg"
```

## v0.dev Compatibility

All generated components follow v0.dev patterns:
- Uses `@/` import alias
- Uses shadcn/ui components
- Tailwind CSS styling
- TypeScript with proper types
- No CSS-in-JS
