# AI Starterkit - v0.dev Ecosystem Core

> Bu proje v0.dev ve Vercel ekosistemi icin gelistirilmis cekirdek projedir.  
> Diger vibecoding araclari (Cursor, Cline, Claude Code, vb.) ile uyumlu calisir.

[![v0.dev](https://img.shields.io/badge/v0.dev-Ecosystem%20Core-000000)](https://v0.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-red)](./LICENSE)

---

## v0.dev Ecosystem Core

Bu proje v0.dev/Vercel ekosistemi icin temel gelistirme yardimcisi olarak tasarlanmistir. GitHub uzerinden v0.dev'e import edildiginde %100 uyumlu calisir.

### Temel Ozellikler

- v0.dev ile tam uyumluluk
- Next.js 16 App Router
- shadcn/ui component library
- Vercel deploy-ready
- Multi-tool vibecoding destegi

---

## Desteklenen Vibecoding Araclari

| Arac | Uyumluluk | Kullanim Alani |
|------|-----------|----------------|
| **v0.dev** | Primary | UI generation, component creation, layout design |
| **Cursor** | %95 | Code editing, debugging, primary IDE |
| **Claude Code** | %90 | Planning, architecture, code review |
| **Cline** | %85 | Task automation, workflows, API integration |
| **Windsurf** | %85 | Exploration, Cascade mode |
| **RooCode** | %80 | Agent-based development |
| **KiloCode** | %75 | Lightweight tasks |

**New in Phase 2:** 3-panel VS Code-style layout, dual chatboxes, API routes, Vercel ecosystem integrations

Detayli analiz icin: [docs/COMPATIBILITY.md](./docs/COMPATIBILITY.md)

---

## Hizli Baslangic

```bash
# Bagimliliklari yukle
pnpm install

# Development server
pnpm dev

# Production build
pnpm build

# Production server
pnpm start
```

---

## Proje Yapisi

```
project-root/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn/ui (READ-ONLY in v0)
│   ├── chat/               # Chat components
│   ├── dashboard/          # Dashboard components
│   ├── features/           # Feature components
│   └── shared/             # Shared components
├── lib/                    # Utilities
├── hooks/                  # Custom hooks
├── services/               # Business logic
├── docs/                   # Documentation
│   └── COMPATIBILITY.md    # Tool compatibility
├── .ai/                    # AI agent configuration
│   ├── rules/              # Global + workspace rules
│   ├── hooks/              # Event-triggered actions
│   ├── workflows/          # Multi-step workflows
│   ├── skills/             # Reusable capabilities
│   └── prompts/            # Prompt templates
├── .cursorrules            # Cursor IDE rules
├── .clinerules             # Cline rules
├── MANIFESTO.md            # Technical compatibility guide
└── LICENSE                 # Proprietary license
```

---

## Kritik Dokumanlar

| Dokuman | Amac |
|---------|------|
| [MANIFESTO.md](./MANIFESTO.md) | v0 uyumluluk rehberi - DIS ARACLARLA CALISIRKEN MUTLAKA OKU |
| [docs/IMPLEMENTATION.md](./docs/IMPLEMENTATION.md) | **YENI:** Tam mimari rehberi, API referansi, state yönetimi |
| [docs/CONVERSATION_LOG.md](./docs/CONVERSATION_LOG.md) | **YENI:** Proje geçmişi, kararlar, bütçe takibi |
| [docs/TASK_LIST.md](./docs/TASK_LIST.md) | **YENI:** Tamamlanan görevler, bekleyen fazlar, status |
| [docs/COMPATIBILITY.md](./docs/COMPATIBILITY.md) | Arac karsilastirma ve workflow onerileri |
| [.ai/rules/](./. ai/rules/) | Global ve proje kurallari |
| [.ai/context.md](./.ai/context.md) | Proje baglami |
| [HISTORY.md](./HISTORY.md) | Degisiklik gecmisi |

---

## Dis Arac Kullanimi

Bu projeyi Cursor, Cline, Claude Code veya diger araclarla gelistirirken:

1. **MANIFESTO.md** dosyasini oku
2. `@/` import alias kullan
3. `components/ui/` klasorunu degistirme
4. Tailwind CSS kullan (CSS-in-JS kullanma)
5. Push oncesi `pnpm build` calistir

```bash
# Pre-commit kontrol
pnpm build && pnpm lint && pnpm tsc --noEmit
```

---

## Rules Sistemi

Cline-uyumlu rules sistemi:

```
.ai/
├── rules/
│   ├── system.md           # Sistem kurallari (referans)
│   ├── project.md          # Proje kurallari (duzenlenebilir)
│   └── examples/           # Ornek kurallar
├── hooks/
│   └── examples/           # Ornek hooklar
├── workflows/
│   └── examples/           # Ornek workflowlar
└── skills/
    └── examples/           # Ornek skilller
```

---

## Tech Stack

| Teknoloji | Versiyon | Amac |
|-----------|----------|------|
| Next.js | 16.x | Framework (App Router) |
| React | 19.x | UI Library |
| TypeScript | 5.7.x | Type Safety |
| Tailwind CSS | 4.x | Styling |
| shadcn/ui | Latest | Component Library |
| AI SDK | 6.x | AI Integration |
| pnpm | 9.x | Package Manager |

---

## Lisans

**PROPRIETARY LICENSE**

Bu yazilim ticari veya bireysel kullanim icin lisanslanmamistir.  
Sadece degerlendirme ve demonstrasyon amaciyla kullanilabilir.

Detaylar icin: [LICENSE](./LICENSE)

---

## v0.dev Import

Bu projeyi v0.dev'e import etmek icin:

1. GitHub'a push et
2. v0.dev'de "Import from GitHub" sec
3. Repository'yi sec
4. Import et

**Not:** `.ai/` klasoru v0 tarafindan yok sayilir ama GitHub'da kalir.
