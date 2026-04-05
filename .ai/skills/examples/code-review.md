---
name: "code-review"
category: review
scope: global
enabled: true
requires: []
---

# Code Review Skill

Kod inceleme yetenegi.

## Description

Verilen kodu cesitli acalardan inceler ve geri bildirim saglar.

## Usage

```bash
ai skill invoke code-review --file=<path> [--focus=<area>]
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | string | yes | Incelenecek dosya |
| `focus` | string | no | Odak alani: quality, security, performance, all |
| `severity` | string | no | Minimum severity: info, warning, error |

## Commands

### Quick Review
```
Review this file for common issues:
- Code quality
- Best practices
- Potential bugs
```

### Security Review
```
Analyze this code for security vulnerabilities:
- Input validation
- XSS prevention
- Authentication/Authorization
- Data exposure
```

### Performance Review
```
Check this code for performance issues:
- Unnecessary re-renders
- Memory leaks
- Expensive operations
- Bundle size impact
```

## Output Format

```markdown
## Code Review: ${filename}

### Summary
[1-2 sentence overview]

### Issues Found

#### [SEVERITY] Issue Title
- **Line:** X-Y
- **Description:** What's wrong
- **Suggestion:** How to fix

### Recommendations
- Recommendation 1
- Recommendation 2

### Score: X/10
```

## Examples

### Example 1: Basic Review
```bash
ai skill invoke code-review --file=components/Button.tsx
```

Output:
```markdown
## Code Review: Button.tsx

### Summary
Generally well-written component with minor improvements possible.

### Issues Found

#### [WARNING] Missing aria-label
- **Line:** 15
- **Description:** Button without text needs aria-label
- **Suggestion:** Add aria-label="Close" to icon-only button

### Score: 8/10
```

### Example 2: Security Focus
```bash
ai skill invoke code-review --file=api/auth.ts --focus=security
```

## Related Skills

- [refactor.md](./refactor.md)
- [documentation.md](./documentation.md)
