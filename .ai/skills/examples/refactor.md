---
name: "refactor"
category: code
scope: global
enabled: true
requires: []
---

# Refactor Skill

Kod refactoring yetenegi.

## Description

Kodu daha temiz, okunabilir ve maintainable hale getirir.

## Usage

```bash
ai skill invoke refactor --file=<path> --type=<refactor_type>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | string | yes | Refactor edilecek dosya |
| `type` | string | no | Refactor tipi |
| `scope` | string | no | function, component, file, module |

## Refactor Types

### extract-component
Buyuk component'i kucuk parcalara ayir.

```typescript
// Before
function Dashboard() {
  return (
    <div>
      <header>...</header>  // 50 lines
      <main>...</main>      // 100 lines
      <footer>...</footer>  // 30 lines
    </div>
  );
}

// After
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardMain />
      <DashboardFooter />
    </div>
  );
}
```

### extract-hook
Tekrar eden logic'i custom hook'a tasi.

```typescript
// Before (in multiple components)
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData);
  setLoading(false);
}, []);

// After
const { data, loading } = useApi('/api/data');
```

### extract-utility
Tekrar eden fonksiyonlari lib/utils'e tasi.

### rename
Degisken, fonksiyon veya dosya adini degistir.

### simplify
Karmasik logic'i basitlestir.

### inline
Gereksiz abstraction'i kaldir.

## Commands

### Analyze
```
Analyze this code for refactoring opportunities.
List potential improvements with priority.
```

### Apply
```
Apply the suggested refactoring:
1. Extract [X] into separate [component/hook/utility]
2. Rename [old] to [new]
3. Simplify [function/logic]
```

## Output Format

```markdown
## Refactoring: ${filename}

### Opportunities Found

1. **Extract Component** (Priority: High)
   - Lines: 50-150
   - Reason: Component too large
   - New file: components/XYZ.tsx

2. **Extract Hook** (Priority: Medium)
   - Lines: 20-35
   - Reason: Repeated in 3 files
   - New file: hooks/useXYZ.ts

### Suggested Changes
[Code diff or examples]

### Impact
- Readability: +30%
- Maintainability: +25%
- Testability: +40%
```

## Examples

```bash
# Analyze for opportunities
ai skill invoke refactor --file=Dashboard.tsx --type=analyze

# Extract component
ai skill invoke refactor --file=Dashboard.tsx --type=extract-component

# Full refactor
ai skill invoke refactor --file=Dashboard.tsx
```
