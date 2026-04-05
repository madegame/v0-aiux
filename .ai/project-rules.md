# Project Rules (Configurable)

> Bu dosya proje özel kuralları içerir ve düzenlenebilir.
> Sistem kuralları için `system-rules.md` bakın (değiştirilemez).

---

## Project Info

| Key | Value |
|-----|-------|
| Name | AI-First Development Template |
| Version | 1.0.0 |
| Stack | Next.js 16, React 19, TypeScript, Tailwind |
| Created | 2024-01-01 |

---

## 1. Coding Conventions

### 1.1 File Naming
```
components/     PascalCase.tsx
hooks/          use-kebab-case.ts
lib/            kebab-case.ts
app/            kebab-case/page.tsx
```

### 1.2 Component Structure
```tsx
// 1. Imports (external -> internal -> types)
// 2. Types/Interfaces
// 3. Constants
// 4. Component
// 5. Exports
```

### 1.3 State Management
- Server state: React Query / SWR
- Client state: Zustand (if needed)
- Form state: React Hook Form

---

## 2. Feature Development

### 2.1 New Feature Checklist
- [ ] Design review (if UI)
- [ ] Type definitions
- [ ] Implementation
- [ ] Tests
- [ ] Documentation
- [ ] History entry

### 2.2 Feature Flags
```ts
// lib/features.ts
export const FEATURES = {
  DARK_MODE: true,
  NEW_DASHBOARD: false,
  ANALYTICS: process.env.NODE_ENV === 'production',
};
```

---

## 3. AI Development Rules

### 3.1 Preferred Providers
| Task | Primary | Secondary |
|------|---------|-----------|
| Code | Cursor | Claude Code |
| Debug | Claude Code | Windsurf |
| Plan | v0 | Claude Code |
| Review | Claude Code | - |
| Docs | Any | - |

### 3.2 Context Files
Always include these files in AI context:
```
.ai/context.md
.ai/project-rules.md
docs/architecture.md (for major changes)
lib/types.ts (for type work)
```

### 3.3 Prompt Guidelines
```markdown
# Good Prompt Structure
1. Context: What are we working on?
2. Goal: What do we want to achieve?
3. Constraints: Any limitations?
4. Output: Expected format/result?
```

---

## 4. Testing Rules

### 4.1 Test File Location
```
__tests__/          Integration tests
*.test.ts           Unit tests (co-located)
*.spec.ts           Component tests
e2e/                End-to-end tests
```

### 4.2 Test Naming
```ts
describe('ComponentName', () => {
  it('should <expected behavior> when <condition>', () => {
    // ...
  });
});
```

---

## 5. Styling Rules

### 5.1 Tailwind Conventions
```tsx
// Order: layout -> spacing -> typography -> colors -> effects
className="flex items-center gap-4 p-4 text-sm text-gray-700 bg-white rounded-lg shadow"
```

### 5.2 Custom Colors
```css
/* Use semantic tokens */
--color-primary: ...
--color-secondary: ...
--color-accent: ...
--color-success: ...
--color-warning: ...
--color-error: ...
```

### 5.3 Responsive Design
- Mobile-first approach
- Breakpoints: sm(640) md(768) lg(1024) xl(1280)
- Test on: iPhone SE, iPad, Desktop

---

## 6. API Rules

### 6.1 Route Structure
```
app/api/
├── v1/
│   ├── users/
│   │   ├── route.ts        # GET, POST
│   │   └── [id]/route.ts   # GET, PUT, DELETE
│   └── ...
```

### 6.2 Response Format
```ts
// Success
{ data: T, meta?: { pagination, etc } }

// Error
{ error: { code: string, message: string, details?: any } }
```

### 6.3 Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## 7. Git Rules (Project Specific)

### 7.1 Default Branch
- Development: `develop`
- Production: `main`

### 7.2 Protected Branches
- `main`: Requires PR + review
- `develop`: Requires PR

### 7.3 Auto-merge
- Dependabot minor updates: Auto
- AI documentation: Auto (if tests pass)

---

## 8. Environment Variables

### 8.1 Required
```env
# Database
DATABASE_URL=

# Auth (if used)
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

### 8.2 Optional
```env
# Analytics
ANALYTICS_ID=

# Feature Flags
ENABLE_FEATURE_X=
```

---

## 9. Performance Budgets

### 9.1 Bundle Size
- Main bundle: < 200KB (gzipped)
- Per-route: < 50KB (gzipped)

### 9.2 Core Web Vitals
- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1

---

## 10. Custom Rules

Add your project-specific rules here:

```yaml
# Example custom rules
- Always use date-fns for date manipulation
- Prefer server actions over API routes for mutations
- Use optimistic updates for better UX
```

---

**Last Updated**: 2024-01-01
**Editable**: Yes
**Owner**: Project Team
