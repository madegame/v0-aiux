# 🎯 Proje Bağlamı (AI Context)

> Bu dosya AI araçlarının projeyi hızlıca anlaması için özet bilgi içerir.
> HER SEANSIN BAŞINDA BU DOSYAYI OKU.

## Tek Cümle Özet
[Proje açıklaması buraya eklenecek]

## Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 4.2 + shadcn/ui
- **State:** React Hooks + SWR (planned)
- **Backend:** [Henüz belirlenmedi]

## Mevcut Durum
- **Versiyon:** 0.1.0
- **Faz:** 1 - Core Features
- **Branch:** develop

## Kritik Dosyalar
```
docs/agent.md      → Nasıl geliştireceğini öğren
docs/plan.md       → Ne yapılacağını öğren
docs/history.md    → Ne yapıldığını öğren
.ai/rules.md       → Kuralları öğren
```

## Hızlı Komutlar
```bash
pnpm dev           # Development
pnpm build         # Production build
pnpm lint          # Lint check
```

## Dikkat Et
1. `components/ui/` klasörüne DOKUNMA (shadcn managed)
2. Her değişikliği `docs/history.md`'ye kaydet
3. Type'ları `lib/types.ts`'de tanımla
4. Server Components varsayılan, Client sadece gerektiğinde
