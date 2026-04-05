# System Rules (IMMUTABLE)

> **WARNING**: Bu dosya sistem kurallarını içerir ve ASLA değiştirilemez.
> Proje özel kurallar için `project-rules.md` kullanın.

---

## 1. Core Principles

### 1.1 Safety First
- Production verisi üzerinde doğrudan işlem YAPILMAZ
- Secrets/credentials ASLA kod içinde yazılmaz
- .env dosyaları ASLA commit edilmez

### 1.2 Immutability
- Bu dosya (system-rules.md) DEĞİŞTİRİLEMEZ
- lib/ai-roles/types.ts içindeki SYSTEM_ROLES DEĞİŞTİRİLEMEZ
- Node modules MANUEL düzenlenmez

### 1.3 Traceability
- Her değişiklik history'ye kaydedilir
- Her commit açıklayıcı mesaj içerir
- Her session loglanır

---

## 2. File Access Rules

### 2.1 Protected Files (Read-Only for most roles)
```
.env
.env.*
**/secrets/**
**/credentials/**
package-lock.json
pnpm-lock.yaml
yarn.lock
node_modules/**
```

### 2.2 System Files (Admin only)
```
.ai/system-rules.md
lib/ai-roles/types.ts (SYSTEM_ROLES section)
```

### 2.3 Config Files (Code role can modify)
```
tsconfig.json
next.config.*
tailwind.config.*
package.json (dependencies only)
```

---

## 3. Operation Limits

### 3.1 File Operations
- Maximum 50 files per session modification
- Maximum 10 files per single operation
- Large files (>1MB) require explicit confirmation

### 3.2 Git Operations
- Direct push to main/master FORBIDDEN
- Force push FORBIDDEN
- History rewrite FORBIDDEN

### 3.3 Command Execution
- Only whitelisted commands allowed
- No sudo/admin commands
- No package install without review

---

## 4. Code Standards

### 4.1 TypeScript
- strict mode ALWAYS enabled
- any type DISCOURAGED (use unknown)
- Explicit return types for public functions

### 4.2 React/Next.js
- Functional components ONLY
- Custom hooks for logic extraction
- Server components by default

### 4.3 Testing
- New features require tests
- Breaking changes require test updates
- Minimum 80% coverage for critical paths

---

## 5. Documentation Standards

### 5.1 Required Documentation
- Every public function has JSDoc
- Every component has description
- Every hook has usage example

### 5.2 Change Documentation
- What changed
- Why it changed
- How to verify

---

## 6. Git Workflow

### 6.1 Branch Naming
```
feature/<name>     - New features
fix/<name>         - Bug fixes
refactor/<name>    - Code improvements
docs/<name>        - Documentation
ai/<provider>/<task> - AI-generated changes
```

### 6.2 Commit Messages
```
[AI][<role>] <type>: <description>

Examples:
[AI][code] feat: add user authentication
[AI][debug] fix: resolve null pointer in form
[AI][plan] docs: update architecture decision
```

### 6.3 PR Requirements
- Description of changes
- Test coverage
- Breaking changes noted
- Screenshots for UI changes

---

## 7. Security Rules

### 7.1 Never Allowed
- Hardcoded credentials
- Eval() or Function() with user input
- innerHTML without sanitization
- SQL without parameterization

### 7.2 Always Required
- Input validation
- Output encoding
- Authentication checks
- Authorization verification

---

## 8. Performance Rules

### 8.1 Frontend
- Bundle size monitoring
- Lazy loading for routes
- Image optimization

### 8.2 Backend
- Query optimization
- Caching strategies
- Rate limiting

---

## 9. Error Handling

### 9.1 Required
- Try-catch for async operations
- User-friendly error messages
- Error logging with context

### 9.2 Forbidden
- Swallowing errors silently
- Exposing stack traces to users
- Generic error messages

---

## 10. Enforcement

These rules are enforced by:
1. Pre-commit hooks
2. CI/CD pipelines
3. AI role permissions
4. Code review requirements

Violation of system rules will:
1. Block the operation
2. Log the attempt
3. Notify administrators (in production)

---

**Last Updated**: 2024-01-01
**Version**: 1.0.0
**Status**: LOCKED
