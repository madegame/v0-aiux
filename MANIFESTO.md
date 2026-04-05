# v0.dev/Vercel Ecosystem Technical Manifesto

> Version: 1.0.0  
> Last Updated: 2026-04-04  
> Purpose: Ensuring 100% compatibility when developing with external AI coding tools

---

## Overview

This manifesto provides technical guidelines for developing this project using external AI coding tools (KiloCode, Cline, Cursor, Claude Code, RooCode, Windsurf, etc.) while maintaining full compatibility with the v0.dev/Vercel ecosystem.

**Primary Goal:** Any code developed externally can be imported back to v0.dev via GitHub without compatibility issues.

---

## Core Technology Stack

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | Next.js | 16.x | App Router ONLY |
| Language | TypeScript | 5.x | Strict mode enabled |
| Styling | Tailwind CSS | 4.x | No CSS-in-JS |
| Components | shadcn/ui | Latest | Do not modify /components/ui/* |
| AI SDK | Vercel AI SDK | 6.x | Use gateway models |
| Package Manager | pnpm | 9.x | Required for Vercel |

---

## File Structure Requirements

```
project-root/
├── app/                    # Next.js App Router (REQUIRED)
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui (READ-ONLY in v0)
│   ├── chat/               # Feature components
│   ├── dashboard/          # Feature components
│   ├── features/           # Custom feature components
│   └── shared/             # Shared components
├── lib/                    # Utilities and helpers
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── .ai/                    # AI agent configs (v0 ignores)
│   ├── rules/
│   ├── hooks/
│   ├── workflows/
│   ├── skills/
│   └── prompts/
├── .cursorrules            # Cursor IDE rules
├── .clinerules             # Cline rules
└── package.json
```

### Critical Rules

1. **DO NOT** create `pages/` directory (use `app/` only)
2. **DO NOT** modify files in `components/ui/` (v0 manages these)
3. **DO NOT** use `src/` directory wrapper
4. **ALWAYS** use `@/` import alias

---

## Compatibility Rules

### PROHIBITED (Will break v0 import)

```typescript
// ❌ Custom webpack configuration
// next.config.js
module.exports = {
  webpack: (config) => { ... } // BREAKS v0
}

// ❌ Custom babel configuration
// .babelrc or babel.config.js
{ "presets": [...] } // BREAKS v0

// ❌ CSS-in-JS libraries
import styled from 'styled-components' // BREAKS v0
import { css } from '@emotion/react' // BREAKS v0

// ❌ Non-standard import paths
import Button from '../../../components/ui/button' // BAD
import Button from 'src/components/ui/button' // BAD

// ❌ CommonJS requires
const fs = require('fs') // Use import instead
```

### REQUIRED (v0 Compatible)

```typescript
// ✅ Path aliases
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ✅ Tailwind CSS
<div className="flex items-center gap-4 p-6">

// ✅ CSS Modules (if needed)
import styles from './Component.module.css'

// ✅ Server Components (default)
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ Client Components (explicit)
'use client'
export function InteractiveComponent() { ... }

// ✅ ES Modules
import { readFile } from 'fs/promises'
```

---

## Import Patterns

### Standard Import Order

```typescript
// 1. React/Next.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. Third-party libraries
import { motion } from 'framer-motion'

// 3. UI Components (shadcn)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Feature Components
import { ChatBox } from '@/components/chat'

// 5. Utilities and Types
import { cn } from '@/lib/utils'
import type { Message } from '@/lib/types'
```

### Barrel Exports

```typescript
// components/chat/index.ts
export { ChatBox } from './chatbox'
export { FileExplorer } from './file-explorer'
export { DocumentViewer } from './document-viewer'
```

---

## Environment Variables

### Auto-Injected by Vercel (DO NOT SET MANUALLY)

```bash
VERCEL=1
VERCEL_ENV=production|preview|development
VERCEL_URL=*.vercel.app
VERCEL_GIT_COMMIT_SHA=...
VERCEL_GIT_REPO_SLUG=...
```

### Required for AI Features

```bash
# Set via Vercel Dashboard or v0 Settings
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Or use Vercel AI Gateway (recommended)
AI_GATEWAY_API_KEY=...
```

### Local Development Only

```bash
# .env.local (never commit)
DATABASE_URL=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Package.json Requirements

```json
{
  "name": "project-name",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
    // Only public npm packages
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^4.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0"
  }
}
```

### Prohibited in package.json

- Private npm packages (`@company/internal-pkg`)
- GitHub dependencies (`github:user/repo`)
- Local file dependencies (`file:../shared`)
- Incompatible packages (see list below)

---

## Incompatible Packages

| Package | Reason | Alternative |
|---------|--------|-------------|
| `styled-components` | CSS-in-JS | Tailwind CSS |
| `@emotion/*` | CSS-in-JS | Tailwind CSS |
| `sass` | Build complexity | CSS Modules |
| `less` | Build complexity | CSS Modules |
| `webpack` | v0 manages builds | - |
| `babel` | v0 manages builds | - |
| `esbuild` (direct) | v0 manages builds | - |
| `electron` | Different target | - |
| `react-native` | Different target | - |

---

## GitHub Import Requirements

### Before Importing to v0

1. **Clean repository state**
   ```bash
   git status  # Should be clean
   ```

2. **No large files**
   - Max file size: 100MB
   - No binary assets in repo (use CDN)

3. **Required .gitignore**
   ```
   node_modules/
   .next/
   .env*.local
   *.log
   .DS_Store
   ```

4. **No symlinks**
   ```bash
   find . -type l  # Should return empty
   ```

5. **Valid package.json**
   ```bash
   npm pkg fix  # Fix common issues
   ```

---

## AI Tool Specific Guidelines

### Cursor

```
.cursorrules location: project root
Context files: Include .ai/context.md
Settings sync: Use workspace settings
```

### Cline

```
.clinerules location: project root
Memory: Enable project memory
Auto-approve: Disable for safety
```

### Claude Code

```
Use CLAUDE.md for context
Project rules in .ai/rules/
Prefer plan mode for large changes
```

### RooCode / KiloCode

```
Follow v0 file structure strictly
Test imports before commit
Use conservative code changes
```

### Windsurf

```
Cascade: Good for exploration
Direct edit: Check v0 compatibility
Test with local build before push
```

---

## Pre-Commit Checklist

Before pushing changes that will be imported to v0:

- [ ] `pnpm build` succeeds locally
- [ ] No TypeScript errors (`pnpm tsc --noEmit`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] All imports use `@/` alias
- [ ] No files in `components/ui/` modified
- [ ] No webpack/babel config added
- [ ] No CSS-in-JS dependencies added
- [ ] No private packages in dependencies
- [ ] `.env.local` is in `.gitignore`
- [ ] No files larger than 100MB

---

## Troubleshooting

### "Module not found" after v0 import

1. Check import path uses `@/` alias
2. Verify barrel export exists in `index.ts`
3. Confirm file extension is `.ts` or `.tsx`

### "Build failed" in v0

1. Remove any custom webpack config
2. Check for incompatible packages
3. Verify TypeScript compiles locally

### "Styles not applying"

1. Confirm using Tailwind classes
2. Check `globals.css` imports Tailwind
3. Remove any CSS-in-JS code

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-04 | Initial manifesto |

---

## Contributing

When contributing to this project from external tools:

1. Read this manifesto fully
2. Follow all compatibility rules
3. Test locally before pushing
4. Create PR for review if unsure

**Questions?** Open an issue in the repository.
