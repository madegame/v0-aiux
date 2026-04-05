---
name: "auto-lint"
trigger: on-save
scope: workspace
enabled: false
priority: 10
---

# Auto Lint Hook

Dosya kaydedildiginde otomatik lint calistirir.

## Trigger

`on-save` - Herhangi bir `.ts` veya `.tsx` dosyasi kaydedildiginde

## Conditions

- Dosya uzantisi `.ts` veya `.tsx` olmali
- Dosya `node_modules/` icinde olmamali
- Dosya `.next/` icinde olmamali

## Actions

1. ESLint calistir
   ```bash
   pnpm lint --fix ${file}
   ```

2. Prettier calistir (opsiyonel)
   ```bash
   pnpm prettier --write ${file}
   ```

3. Sonucu raporla
   - Hata varsa: Notification goster
   - Basarili: Sessiz devam

## Variables

| Variable | Aciklama |
|----------|----------|
| `${file}` | Kaydedilen dosya yolu |
| `${dir}` | Dosyanin bulundugu klasor |
| `${ext}` | Dosya uzantisi |

## Example Output

```
[Hook: auto-lint] Running on: components/chat/chatbox.tsx
[ESLint] Fixed 2 issues
[Hook: auto-lint] Completed successfully
```

## Notes

- Bu hook varsayilan olarak devre disi
- Aktifleştirmek icin `enabled: true` yap
- CI/CD ortaminda calistirma
