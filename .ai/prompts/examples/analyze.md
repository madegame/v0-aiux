---
name: "analyze"
category: analysis
scope: global
editable: true
---

# Analyze Prompt

Kod veya proje analizi icin prompt template.

## Usage

```
ai prompt run analyze --target=<path> --depth=<shallow|deep>
```

## Template

```
Analyze the following code/project:

Target: {{target_path}}
Depth: {{analysis_depth}}

## Analysis Areas

1. **Structure**
   - File organization
   - Module dependencies
   - Component hierarchy

2. **Quality**
   - Code style consistency
   - TypeScript usage
   - Best practices adherence

3. **Performance**
   - Bundle size impact
   - Render optimization
   - Data fetching patterns

4. **Security**
   - Input validation
   - Authentication checks
   - Data exposure risks

5. **Maintainability**
   - Documentation
   - Test coverage
   - Code complexity

## Output Format

### Summary
[1-2 paragraph overview]

### Strengths
- Point 1
- Point 2
- Point 3

### Areas for Improvement
| Area | Issue | Priority | Suggestion |
|------|-------|----------|------------|
| ... | ... | P0-P3 | ... |

### Metrics
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Files | X | - | - |
| Lines | X | <500/file | OK/WARN |
| Complexity | X | <10 | OK/WARN |
| Coverage | X% | >80% | OK/WARN |

### Recommendations
1. [Priority: High] Recommendation
2. [Priority: Medium] Recommendation
3. [Priority: Low] Recommendation
```

## Variables

| Variable | Description |
|----------|-------------|
| `{{target_path}}` | File or directory path |
| `{{analysis_depth}}` | shallow or deep |

## Examples

### Shallow Analysis
```
ai prompt run analyze --target=components/chat --depth=shallow
```

### Deep Analysis
```
ai prompt run analyze --target=. --depth=deep
```
