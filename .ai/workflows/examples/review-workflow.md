---
name: "review-workflow"
type: sequential
scope: workspace
enabled: false
timeout: 600
---

# Code Review Workflow

Kod inceleme sureci.

## Description

Kaliteli kod incelemesi icin standart adimlari.

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `pr_url` | string | yes | Pull request URL |
| `reviewer` | string | no | Reviewer adi |

## Steps

### Step 1: Context
```yaml
action: gather-context
inputs:
  pr_url: ${pr_url}
outputs:
  files: [string]
  description: string
  related_issues: [string]
```

**Actions:**
1. PR aciklamasini oku
2. Degisen dosyalari listele
3. Ilgili issue'lari bul

### Step 2: Code Quality
```yaml
action: check-quality
inputs:
  files: ${step1.files}
outputs:
  issues: [object]
```

**Checklist:**
- [ ] TypeScript tip hatalari yok
- [ ] ESLint uyarilari yok
- [ ] Gereksiz console.log yok
- [ ] TODO/FIXME temizlendi
- [ ] Magic number'lar constant yapildi

### Step 3: Architecture
```yaml
action: check-architecture
inputs:
  files: ${step1.files}
outputs:
  concerns: [string]
```

**Checklist:**
- [ ] Single Responsibility Principle
- [ ] Component boyutu makul (<300 satir)
- [ ] Proper separation of concerns
- [ ] Reusable components
- [ ] Correct file structure

### Step 4: Security
```yaml
action: check-security
inputs:
  files: ${step1.files}
outputs:
  vulnerabilities: [object]
```

**Checklist:**
- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] XSS prevention
- [ ] CSRF protection (if needed)
- [ ] Proper auth checks

### Step 5: Performance
```yaml
action: check-performance
inputs:
  files: ${step1.files}
outputs:
  warnings: [string]
```

**Checklist:**
- [ ] No unnecessary re-renders
- [ ] Proper memoization
- [ ] Lazy loading used
- [ ] Bundle size impact minimal
- [ ] No N+1 queries

### Step 6: Tests
```yaml
action: check-tests
inputs:
  files: ${step1.files}
outputs:
  coverage_diff: number
```

**Checklist:**
- [ ] New code has tests
- [ ] Tests are meaningful
- [ ] Edge cases covered
- [ ] Coverage not decreased

### Step 7: Feedback
```yaml
action: provide-feedback
inputs:
  issues: ${step2.issues}
  concerns: ${step3.concerns}
  vulnerabilities: ${step4.vulnerabilities}
outputs:
  comments: [object]
  decision: approve | request_changes | comment
```

## Feedback Template

```markdown
## Code Review: ${pr_title}

### Summary
[Overall impression]

### Strengths
- Point 1
- Point 2

### Suggestions
- [ ] Suggestion 1 (required/optional)
- [ ] Suggestion 2 (required/optional)

### Questions
- Question 1?

### Decision
[Approve / Request Changes / Comment]
```

## Review Principles

1. **Be constructive** - Suggest, don't demand
2. **Be specific** - Reference line numbers
3. **Be timely** - Review within 24 hours
4. **Be thorough** - Don't rubber stamp
5. **Be kind** - Comment on code, not person
