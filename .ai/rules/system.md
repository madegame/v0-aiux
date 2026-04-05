# System Rules
# Bu dosya tum projeler icin gecerli kuralları icerir
# Cursor, Cline, Claude Code uyumlu format
# Dashboard'dan duzenlenebilir

---
version: "1.0"
type: system
editable: true
last_updated: "2026-04-04"
---

## Code Style

### TypeScript
- Strict mode aktif
- `any` kullanma, `unknown` tercih et
- Explicit return types kullan
- Interface > Type (extend edilebilirlik icin)

### React
- Server Components varsayilan
- Client Components icin `'use client'` direktifi
- Hooks kurallarina uy (Rules of Hooks)
- Memo/callback sadece gerektiginde

### Naming
- Components: PascalCase (`UserProfile.tsx`)
- Files: kebab-case (`user-profile.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_ITEMS`)
- Types/Interfaces: PascalCase (`UserData`)

## File Structure

```
app/              # Next.js App Router
components/
  ui/             # shadcn/ui - DOKUNMA
  chat/           # Chat components
  workspace/      # Workspace components
lib/
  ai/             # AI SDK integration
  ai-roles/       # Role definitions
  ai-history/     # History system
hooks/            # Custom hooks
.ai/              # AI configuration
  rules/          # Rule files
  roles/          # Role definitions
  prompts/        # Prompt templates
```

## Protected Paths

DO NOT MODIFY:
- `components/ui/*` - shadcn/ui components
- `node_modules/*`
- `*.lock` files
- `.env*` files (read-only reference OK)

## Commit Format

```
<type>(<scope>): <description>

[AI-AGENT]: <agent-type>
[ROLE]: <role-used>
[CHANGES]: <file-list>
```

Types: feat, fix, refactor, docs, test, chore

## Debug Logging

```typescript
// Use [v0] prefix for AI debug logs
console.log("[v0] Component mounted:", data);
console.log("[v0] API response:", response);

// Remove after debugging
```

## Error Handling

```typescript
// Always use try-catch with typed errors
try {
  await riskyOperation();
} catch (error) {
  if (error instanceof CustomError) {
    // Handle specific error
  }
  console.error("[v0] Error:", error);
  throw error; // Re-throw if needed
}
```

---

# Metadata (for indexing)
keywords: [typescript, react, nextjs, coding-style, file-structure]
category: system
priority: high
