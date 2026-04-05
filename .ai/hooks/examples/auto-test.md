---
name: "auto-test"
trigger: on-commit
scope: workspace
enabled: false
priority: 20
---

# Auto Test Hook

Commit yapilmadan once ilgili testleri calistirir.

## Trigger

`on-commit` - Git commit komutu calistirildiginda

## Conditions

- Degisen dosyalar `.ts` veya `.tsx` uzantili olmali
- Test dosyasi mevcut olmali (`*.test.ts` veya `*.spec.ts`)
- `--no-verify` flagi kullanilmamis olmali

## Actions

1. Degisen dosyalari tespit et
   ```bash
   git diff --staged --name-only
   ```

2. Ilgili test dosyalarini bul
   ```bash
   # component.tsx -> component.test.tsx
   # lib/utils.ts -> lib/utils.test.ts
   ```

3. Testleri calistir
   ```bash
   pnpm test ${testFiles}
   ```

4. Sonuca gore devam et
   - Basarili: Commit devam eder
   - Basarisiz: Commit iptal edilir

## Variables

| Variable | Aciklama |
|----------|----------|
| `${stagedFiles}` | Stage edilmis dosyalar |
| `${testFiles}` | Ilgili test dosyalari |
| `${commitMsg}` | Commit mesaji |

## Example Output

```
[Hook: auto-test] Detecting changed files...
[Hook: auto-test] Found 3 staged files
[Hook: auto-test] Running tests for: chatbox.test.tsx, utils.test.ts
[Test] 2 passed, 0 failed
[Hook: auto-test] Commit allowed
```

## Skip Hook

```bash
git commit --no-verify -m "message"
```
