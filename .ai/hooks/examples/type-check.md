---
name: "type-check"
trigger: on-push
scope: global
enabled: false
priority: 30
---

# Type Check Hook

Push yapilmadan once TypeScript tip kontrolu yapar.

## Trigger

`on-push` - Git push komutu calistirildiginda

## Conditions

- Remote branch'e push yapiliyorsa
- `main` veya `develop` branch'ine push yapiliyorsa (opsiyonel)

## Actions

1. TypeScript derleyici calistir
   ```bash
   pnpm tsc --noEmit
   ```

2. Hata varsa push'u engelle
   ```bash
   # Exit code 0: Push devam
   # Exit code 1: Push iptal
   ```

3. Hata raporla
   ```
   Type errors found in:
   - components/chat/chatbox.tsx:45 - Type 'string' is not assignable to type 'number'
   ```

## Variables

| Variable | Aciklama |
|----------|----------|
| `${branch}` | Hedef branch |
| `${remote}` | Remote adi |

## Example Output

```
[Hook: type-check] Running TypeScript check...
[TSC] Checking 142 files...
[TSC] No errors found
[Hook: type-check] Push allowed
```

## Bypass

```bash
git push --no-verify
```

## Related

- [auto-lint.md](./auto-lint.md)
- [auto-test.md](./auto-test.md)
