# v0.dev/Vercel Ecosystem Technical Manifesto v2.0

> Version: 2.0.0  
> Last Updated: 2026-04-05  
> Purpose: Complete compatibility guide for multi-IDE, multi-LLM, multi-Agent development

---

## Executive Summary

Bu manifesto, projenin v0.dev ekosistemi ile %100 uyumlu kalarak cesitli IDE'ler (Cursor, Windsurf, VS Code), LLM'ler (Claude, GPT, Gemini) ve AI Agent'lar (Cline, RooCode, KiloCode, Aider) ile gelistirilmesi icin teknik kilavuz saglar.

**Ana Hedefler:**
1. v0.dev'e GitHub uzerinden sorunsuz import
2. v0 API kullanarak veya kullanmadan gelistirme esnekligi
3. Tum AI araclari icin tutarli davranis
4. Sifir konfigurasyonla calisan proje yapisi

---

## Table of Contents

1. [IDE Uyumluluk Matrisi](#1-ide-uyumluluk-matrisi)
2. [LLM Provider Karsilastirmasi](#2-llm-provider-karsilastirmasi)
3. [AI Agent Ozellikleri](#3-ai-agent-ozellikleri)
4. [v0 API Entegrasyonu](#4-v0-api-entegrasyonu)
5. [v0 API Olmadan Gelistirme](#5-v0-api-olmadan-gelistirme)
6. [Hibrit Gelistirme Stratejisi](#6-hibrit-gelistirme-stratejisi)
7. [Teknoloji Stack](#7-teknoloji-stack)
8. [Dosya Yapisi](#8-dosya-yapisi)
9. [Uyumluluk Kurallari](#9-uyumluluk-kurallari)
10. [Guvenlik ve Best Practices](#10-guvenlik-ve-best-practices)

---

## 1. IDE Uyumluluk Matrisi

### 1.1 Tam Uyumlu IDE'ler (Tier 1)

| IDE | v0 Uyumu | v0 API Destegi | LLM Destegi | Agent Destegi | Ozel Dosya |
|-----|----------|----------------|-------------|---------------|------------|
| **Cursor** | %100 | HAYIR (kendi sistemi) | Claude, GPT | Dahili | `.cursorrules` |
| **Windsurf** | %100 | HAYIR (kendi sistemi) | Claude, GPT | Cascade | `.windsurfrules` |
| **VS Code + Cline** | %100 | EVET (OpenAI-compat) | Tum LLM'ler + v0 | Cline | `.clinerules` |
| **VS Code + RooCode** | %100 | EVET (OpenAI-compat) | Tum LLM'ler + v0 | RooCode | `.clinerules` |
| **VS Code + KiloCode** | %100 | EVET (Native) | Tum LLM'ler + v0 | KiloCode | `.clinerules` |
| **VS Code + Continue** | %95 | EVET (Custom) | Tum LLM'ler + v0 | Continue | `config.json` |
| **Terminal + Aider** | %90 | EVET (OpenAI-compat) | Tum LLM'ler + v0 | Aider | `.aider.conf.yml` |

### 1.2 Uyumlu IDE'ler (Tier 2)

| IDE | v0 Uyumu | Notlar |
|-----|----------|--------|
| **Zed** | %90 | Assistant Panel ile |
| **JetBrains + AI Assistant** | %85 | Ek konfigurasyon gerekli |
| **Neovim + Avante** | %80 | Lua config gerekli |

### 1.3 IDE Konfigurasyonu

#### Cursor Optimal Ayarlar
```json
// .cursor/settings.json
{
  "cursor.ai.model": "claude-sonnet-4-20250514",
  "cursor.ai.contextFiles": [
    ".ai/context.md",
    ".ai/rules/system.md",
    "plan.md"
  ],
  "cursor.ai.rules": ".cursorrules"
}
```

#### Windsurf Optimal Ayarlar
```json
// .windsurf/settings.json
{
  "cascade.enabled": true,
  "cascade.autoApprove": false,
  "ai.model": "claude-sonnet-4",
  "ai.contextWindow": 200000
}
```

#### Cline Optimal Ayarlar
```json
// .vscode/cline.json
{
  "provider": "anthropic",
  "model": "claude-sonnet-4-20250514",
  "customInstructions": ".clinerules",
  "alwaysApprove": false,
  "memory": {
    "enabled": true,
    "location": ".ai/memory/"
  }
}
```

---

## 2. LLM Provider Karsilastirmasi

### 2.1 v0 API Uyumlu Provider'lar

| Provider | Model | v0 Gateway | Direkt API | Maliyet (1M token) |
|----------|-------|------------|------------|-------------------|
| **Anthropic** | claude-sonnet-4 | Evet | Evet | $3/$15 |
| **OpenAI** | gpt-5-mini | Evet | Evet | $2/$10 |
| **Google** | gemini-3-flash | Evet | Evet | $0.075/$0.30 |
| **xAI** | grok-3 | API Key gerek | Evet | $5/$15 |
| **Groq** | llama-4-70b | API Key gerek | Evet | $0.70/$0.80 |

### 2.2 Model Secim Rehberi

```
GOREV                    ONERIEN MODEL              NEDEN
----------------------------------------------------------------------
UI/Component Tasarimi    claude-sonnet-4            Gorsel anlayis ustun
Kod Refactoring          gpt-5-mini                 Hizli, tutarli
Debug/Hata Ayiklama      claude-sonnet-4            Derin analiz
Dokumantasyon            gemini-3-flash             Hizli, ucuz
Kompleks Mimari          claude-opus-4              En iyi reasoning
Hizli Prototip           groq/llama-4-70b           En hizli inference
```

### 2.3 LLM Konfigurasyonu (lib/ai/provider/config.ts)

```typescript
// v0 Gateway uzerinden (ONERILEN)
export const V0_GATEWAY_MODELS = {
  default: "anthropic/claude-sonnet-4-20250514",
  fast: "openai/gpt-5-mini",
  cheap: "google/gemini-3-flash",
  best: "anthropic/claude-opus-4"
} as const;

// Direkt API (Alternatif)
export const DIRECT_API_MODELS = {
  anthropic: {
    model: "claude-sonnet-4-20250514",
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  openai: {
    model: "gpt-5-mini",
    apiKey: process.env.OPENAI_API_KEY
  }
} as const;
```

---

## 3. AI Agent Ozellikleri

### 3.1 Agent Karsilastirma Tablosu

| Agent | IDE | Otonom Mod | MCP | v0 API Destegi | v0 Import | Ozel Ozellik |
|-------|-----|------------|-----|----------------|-----------|--------------|
| **Cline** | VS Code | Evet | Evet | EVET (OpenAI-compat) | %100 | Memory, Plan Mode |
| **RooCode** | VS Code | Evet | Evet | EVET (OpenAI-compat) | %95 | Multi-file edit |
| **KiloCode** | VS Code | Evet | Hayir | EVET (Native) | %95 | Fast iteration |
| **Aider** | Terminal | Evet | Hayir | EVET (OpenAI-compat) | %90 | Git-native |
| **Claude Code** | Terminal | Evet | Evet | HAYIR | %100 | Deep reasoning |
| **Cursor Composer** | Cursor | Kismi | Hayir | HAYIR | %100 | Multi-file |
| **Windsurf Cascade** | Windsurf | Evet | Hayir | HAYIR | %100 | Flow-based |
| **Continue** | VS Code | Kismi | Hayir | EVET (Custom) | %90 | Autocomplete |

### 3.2 Agent Secim Rehberi

```
SENARYO                           ONERILEN AGENT       NEDEN
------------------------------------------------------------------------
Hizli UI degisiklikleri           Cursor Composer      En hizli feedback
Kompleks refactoring              Claude Code          Derin analiz
Multi-repo calisma                Aider                Git-native
Otonom task completion            Cline                Plan + Memory
v0 ile senkron calisma            v0 Web UI            Native entegrasyon
```

### 3.3 Agent-Spesifik Kurallar

#### Cline icin (.clinerules)
```markdown
# Cline Project Rules

## Context (Her seans oku)
- .ai/context.md -> Proje ozeti
- .ai/rules/system.md -> Degismez kurallar
- plan.md -> Mevcut gorevler

## Davranis
- Her degisiklikten sonra HISTORY.md guncelle
- [v0] prefix ile debug log
- components/ui/ DOKUNULMAZ
- TypeScript strict mode ZORUNLU

## MCP Servers (Opsiyonel)
- filesystem: Dosya islemleri
- github: PR/Issue yonetimi
- memory: Uzun sureli hafiza
```

#### Aider icin (.aider.conf.yml)
```yaml
model: anthropic/claude-sonnet-4-20250514
edit-format: diff
auto-commits: true
dirty-commits: false
map-tokens: 2048
read:
  - .ai/context.md
  - .ai/rules/system.md
  - plan.md
```

#### Claude Code icin (CLAUDE.md)
```markdown
# Claude Code Context

## Proje: v0-aiui
Dual-agent AI development workspace

## Onemli Dosyalar
- .ai/context.md: Her seans oku
- plan.md: Mevcut fazlar
- HISTORY.md: Degisiklik kaydi

## Kurallar
- components/ui/ READONLY
- @/ import alias kullan
- Server Components varsayilan
```

---

## 4. v0 API Entegrasyonu

### 4.1 ONEMLI: v0 API OpenAI-Compatible!

**v0 API, OpenAI-compatible endpoint sunuyor.** Bu demek oluyor ki:

| Arac | v0 API Kullanabilir mi? | Nasil? |
|------|-------------------------|--------|
| **Cline** | EVET | OpenAI Compatible provider + base URL |
| **RooCode** | EVET | OpenAI Compatible provider + base URL |
| **KiloCode** | EVET | Native v0 destegi VAR |
| **Aider** | EVET | `--openai-api-base` flag |
| **Continue** | EVET | Custom provider config |
| **LiteLLM** | EVET | v0 provider destegi |
| **Cursor** | HAYIR | Kendi sistemi, import ile uyumlu |
| **Windsurf** | HAYIR | Kendi sistemi, import ile uyumlu |

### 4.2 v0 API Endpoint Bilgileri

```
Base URL:     https://api.v0.dev/v1
API Key:      v0 Dashboard > Settings > API Keys
Models:       v0-1.5-md (gunluk), v0-1.5-lg (kompleks)
Format:       OpenAI Chat Completions uyumlu
```

### 4.3 Cline'da v0 API Kullanimi

```json
// VS Code > Cline Settings
{
  "provider": "openai-compatible",
  "baseUrl": "https://api.v0.dev/v1",
  "apiKey": "YOUR_V0_API_KEY",
  "model": "v0-1.5-lg"
}
```

**Cline GUI'de:**
1. API Provider: "OpenAI Compatible" sec
2. Base URL: `https://api.v0.dev/v1`
3. API Key: v0 Dashboard'dan al
4. Model ID: `v0-1.5-lg` veya `v0-1.5-md`

### 4.4 KiloCode'da v0 API Kullanimi

KiloCode native v0 destegi sunuyor:

```json
// KiloCode Settings
{
  "provider": "v0",
  "apiKey": "YOUR_V0_API_KEY",
  "model": "v0-1.5-lg"
}
```

Referans: [kilo.ai/docs/ai-providers/v0](https://kilo.ai/docs/ai-providers/v0)

### 4.5 RooCode'da v0 API Kullanimi

```json
// RooCode (Cline fork) - Ayni yapilandirma
{
  "provider": "openai-compatible", 
  "baseUrl": "https://api.v0.dev/v1",
  "apiKey": "YOUR_V0_API_KEY",
  "model": "v0-1.5-lg"
}
```

### 4.6 Aider'da v0 API Kullanimi

```bash
# Terminal'de
export OPENAI_API_BASE=https://api.v0.dev/v1
export OPENAI_API_KEY=YOUR_V0_API_KEY

aider --model v0-1.5-lg
```

veya `.aider.conf.yml`:

```yaml
openai-api-base: https://api.v0.dev/v1
openai-api-key: YOUR_V0_API_KEY
model: v0-1.5-lg
```

### 4.7 LiteLLM ile v0 API

```python
import litellm

response = litellm.completion(
    model="v0/v0-1.5-lg",
    messages=[{"role": "user", "content": "Create a button component"}],
    api_key="YOUR_V0_API_KEY"
)
```

### 4.8 v0 API Kullanim Senaryolari

```
SENARYO                    v0 API            AVANTAJ
----------------------------------------------------------------------
UI Component uretimi       streamText        Streaming + shadcn uyumu
Chat/Sohbet ozellligi      streamText        Real-time response
Kod analizi                generateText      Tek seferde sonuc
Image generation           gateway model     Nano Banana 2 destegi
Multi-step workflow        workflow devkit   Durable execution
Lokal IDE (Cline/Aider)    OpenAI-compat     Ayni model, farkli arayuz
```

### 4.10 v0 API Key Alma

1. [v0.dev](https://v0.dev) > Sign In
2. Settings > API Keys
3. "Create new key" tikla
4. Key'i guvenli bir yere kaydet (bir kez gosterilir)

### 4.11 v0 API Fiyatlandirma

| Model | Input (1M token) | Output (1M token) | Kullanim |
|-------|------------------|-------------------|----------|
| **v0-1.5-md** | $3.00 | $15.00 | Gunluk gorevler, UI |
| **v0-1.5-lg** | $5.00 | $25.00 | Kompleks reasoning |

**Tipik Seans Maliyeti:**
- Basit UI task: $0.50-1.00
- Orta kompleksite: $1.50-3.00
- Buyuk refactor: $4.00-8.00

### 4.12 v0 API Konfigurasyonu (Next.js Route)

```typescript
// lib/ai/v0-api.ts
import { createAI } from 'ai';

// v0 Gateway (Zero Config - ONERILEN)
export const ai = createAI({
  model: "anthropic/claude-sonnet-4-20250514"
  // API key otomatik v0 tarafindan enjekte edilir
});

// Alternatif: Ozel API Key
export const aiWithKey = createAI({
  model: "anthropic/claude-sonnet-4-20250514",
  apiKey: process.env.AI_GATEWAY_API_KEY
});
```

### 4.3 v0 API Route Pattern

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, model = "anthropic/claude-sonnet-4-20250514" } = await req.json();
  
  const result = await streamText({
    model, // v0 Gateway model string
    messages,
    system: `You are an AI assistant...`,
  });
  
  return result.toDataStreamResponse();
}
```

### 4.4 v0 API Fiyatlandirma (Max Intelligence)

| Islem | Token | Birim Fiyat | Maliyet |
|-------|-------|-------------|---------|
| Input | 100K | $5.00/1M | $0.50 |
| Output | 100K | $25.00/1M | $2.50 |
| **Tipik Seans** | 200K karisik | - | **~$3-5** |

---

## 5. v0 API Olmadan Gelistirme

### 5.1 Tamamen Lokal/Alternatif Gelistirme

```
YONTEM                     ARACLAR                    MALIYET
----------------------------------------------------------------------
Lokal LLM                  Ollama + llama3.2          Ucretsiz
Anthropic Direkt           Claude API                 Pay-per-use
OpenAI Direkt              GPT API                    Pay-per-use
Google AI Studio           Gemini                     Ucretsiz tier
Groq                       Llama/Mixtral              Ucretsiz tier
```

### 5.2 Lokal Gelistirme Setup

```typescript
// lib/ai/local-provider.ts
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// Direkt Anthropic
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Direkt OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Ollama (Lokal)
export const ollama = {
  baseURL: 'http://localhost:11434/api',
  model: 'llama3.2:70b'
};
```

### 5.3 v0'a Import Oncesi Checklist

v0 API kullanmadan gelistirirken, GitHub'a push etmeden once:

```bash
# 1. Build test
pnpm build

# 2. Type check
pnpm tsc --noEmit

# 3. Lint
pnpm lint

# 4. Import path kontrolu
grep -r "from '\.\." --include="*.tsx" --include="*.ts" | head -20
# Hic sonuc donmemeli (tum importlar @/ ile olmali)

# 5. Yasak paket kontrolu
cat package.json | grep -E "styled-components|emotion|sass|webpack"
# Hic sonuc donmemeli

# 6. components/ui degisiklik kontrolu
git diff --name-only origin/main | grep "components/ui"
# Hic sonuc donmemeli
```

### 5.4 CI/CD Entegrasyonu

```yaml
# .github/workflows/v0-compat.yml
name: v0 Compatibility Check

on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Type check
        run: pnpm tsc --noEmit
        
      - name: Lint
        run: pnpm lint
        
      - name: Build
        run: pnpm build
        
      - name: Check import paths
        run: |
          if grep -r "from '\.\." --include="*.tsx" --include="*.ts" src/ app/ components/ lib/; then
            echo "ERROR: Relative imports found. Use @/ alias."
            exit 1
          fi
          
      - name: Check protected files
        run: |
          CHANGED=$(git diff --name-only origin/main | grep "components/ui" || true)
          if [ -n "$CHANGED" ]; then
            echo "ERROR: components/ui files modified"
            exit 1
          fi
```

---

## 6. Hibrit Gelistirme Stratejisi

### 6.1 Onerilen Workflow

```
FAZLAR                ARAC                 ACIKLAMA
----------------------------------------------------------------------
1. Planlama          v0 Web UI            Hizli prototip, UI kesfet
2. Core Dev          Cursor/Cline         Detayli implementasyon
3. Debug             Claude Code          Derin analiz
4. Review            v0 Web UI            Uyumluluk kontrolu
5. Deploy            v0 Publish           Tek tikla Vercel deploy
```

### 6.2 Senkronizasyon Stratejisi

```
GitHub Repository (Merkez)
         |
    +----+----+
    |         |
  v0.dev   Local IDE
    |         |
    v         v
[UI/Quick]  [Core Dev]
    |         |
    +----+----+
         |
      Merge
         |
      Deploy
```

### 6.3 Branch Stratejisi

```
main (production)
  |
  +-- develop (integration)
        |
        +-- feature/xyz (lokal IDE)
        +-- v0/component-abc (v0'dan)
        +-- ai/cline/task-123 (Cline)
        +-- ai/cursor/refactor (Cursor)
```

---

## 7. Teknoloji Stack

### 7.1 Core Stack (Degistirilemez)

| Katman | Teknoloji | Versiyon | Durum |
|--------|-----------|----------|-------|
| Framework | Next.js | 16.x | LOCKED |
| Language | TypeScript | 5.x | LOCKED |
| Styling | Tailwind CSS | 4.x | LOCKED |
| Components | shadcn/ui | Latest | LOCKED |
| AI SDK | Vercel AI SDK | 6.x | LOCKED |
| Package Manager | pnpm | 9.x | LOCKED |

### 7.2 Opsiyonel Eklemeler (v0 Uyumlu)

| Kategori | Secenekler | Oneri |
|----------|------------|-------|
| Database | Supabase, Neon, Upstash | Supabase |
| Auth | Supabase Auth, Auth.js | Supabase Auth |
| Storage | Vercel Blob, Supabase Storage | Vercel Blob |
| Analytics | Vercel Analytics, PostHog | Vercel Analytics |
| Monitoring | Sentry, Vercel | Sentry |

### 7.3 Yasak Paketler

```typescript
// ASLA KULLANILMAYACAK
const FORBIDDEN_PACKAGES = [
  'styled-components',    // CSS-in-JS
  '@emotion/*',           // CSS-in-JS
  'sass',                 // Build complexity
  'less',                 // Build complexity
  'webpack',              // v0 yonetiyor
  'babel',                // v0 yonetiyor
  'esbuild',              // v0 yonetiyor (direkt)
  'electron',             // Farkli target
  'react-native',         // Farkli target
  'styled-jsx',           // CSS-in-JS
  '@stitches/*',          // CSS-in-JS
];
```

---

## 8. Dosya Yapisi

### 8.1 Zorunlu Yapi

```
project-root/
├── app/                      # Next.js App Router (ZORUNLU)
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Home page
│   ├── globals.css           # Global styles + Tailwind
│   └── api/                  # API routes
│       └── chat/
│           └── route.ts
├── components/
│   ├── ui/                   # shadcn/ui (READ-ONLY)
│   ├── chat/                 # Chat feature
│   ├── dashboard/            # Dashboard feature
│   ├── layout/               # Layout components
│   ├── features/             # Domain features
│   └── shared/               # Shared components
├── lib/
│   ├── ai/                   # AI utilities
│   │   ├── provider/         # LLM providers
│   │   └── tasks/            # Task system
│   ├── utils.ts              # Utility functions
│   └── types.ts              # Type definitions
├── hooks/                    # Custom React hooks
├── public/                   # Static assets
├── .ai/                      # AI config (v0 ignores)
│   ├── context.md
│   ├── rules/
│   ├── roles/
│   ├── workflows/
│   ├── skills/
│   ├── prompts/
│   └── hooks/
├── docs/                     # Documentation
├── .cursorrules              # Cursor rules
├── .clinerules               # Cline rules
├── .claude/                  # Claude Code config
│   └── settings.json
├── MANIFESTO.md              # Bu dosya
├── HISTORY.md                # Degisiklik tarihi
├── plan.md                   # Proje plani
└── package.json
```

### 8.2 Import Kurallari

```typescript
// DOGRU - v0 Uyumlu
import { Button } from '@/components/ui/button';
import { ChatBox } from '@/components/chat';
import { cn } from '@/lib/utils';
import type { Message } from '@/lib/types';

// YANLIS - v0 Uyumsuz
import { Button } from '../../../components/ui/button';  // Relative
import { Button } from 'src/components/ui/button';       // src prefix
import Button from '@/components/ui/button';             // Default import
```

---

## 9. Uyumluluk Kurallari

### 9.1 Kritik Kurallar (Ihlal = v0 Import Hatasi)

| Kural | Aciklama | Kontrol |
|-------|----------|---------|
| App Router | Sadece `app/` kullan, `pages/` YASAK | Otomatik |
| Path Alias | Tum importlar `@/` ile | CI check |
| UI Components | `components/ui/` READONLY | Git hook |
| CSS-in-JS | Yasak, Tailwind kullan | Package check |
| Custom Build | webpack/babel config YASAK | File check |

### 9.2 Onemli Kurallar (Ihlal = Potansiyel Sorun)

| Kural | Aciklama | Kontrol |
|-------|----------|---------|
| TypeScript | Strict mode, `any` yasak | TSC |
| Server Components | Varsayilan, Client acikca belirt | Review |
| Barrel Exports | Her klasorde `index.ts` | Review |
| Error Boundaries | Her feature icin | Review |

### 9.3 Stil Kurallari (Onerilir)

| Kural | Aciklama |
|-------|----------|
| Dosya isimleri | kebab-case (`user-profile.tsx`) |
| Component isimleri | PascalCase (`UserProfile`) |
| Hook isimleri | camelCase (`useAuth`) |
| Constant isimleri | SCREAMING_SNAKE (`API_URL`) |
| Type isimleri | PascalCase (`UserData`) |

---

## 10. Guvenlik ve Best Practices

### 10.1 Environment Variables

```bash
# .env.local (ASLA commit etme)
DATABASE_URL=...
ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...

# Vercel Dashboard'da ayarla (Onerilen)
AI_GATEWAY_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...

# Otomatik (v0/Vercel enjekte eder)
VERCEL=1
VERCEL_ENV=production
```

### 10.2 Guvenlik Kontrol Listesi

- [ ] Hardcoded credentials YOK
- [ ] .env dosyalari .gitignore'da
- [ ] API key'ler Vercel Dashboard'da
- [ ] Input validation (Zod)
- [ ] SQL injection korunasi (parameterized queries)
- [ ] XSS korunasi (React default)
- [ ] CSRF token (Next.js middleware)

### 10.3 Performance Checklist

- [ ] Images optimize (next/image)
- [ ] Code splitting (dynamic import)
- [ ] Bundle size < 200KB initial
- [ ] Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] Server Components maksimum kullanim
- [ ] Cache headers dogru

---

## Appendix A: Hizli Referans

### Komutlar

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm lint             # Lint check
pnpm tsc --noEmit     # Type check

# shadcn/ui
npx shadcn@latest add button    # Add component
npx shadcn@latest diff          # Check updates

# Git
git checkout -b ai/cline/task-xyz    # AI branch
git push origin HEAD                  # Push branch
```

### Debug

```typescript
// Development debugging
console.log('[v0] Debug:', data);

// Production (Sentry)
Sentry.captureException(error);
```

### IDE Shortcuts

| IDE | Agent Cagir | Chat Ac | Multi-file |
|-----|-------------|---------|------------|
| Cursor | Cmd+K | Cmd+L | Cmd+Shift+I |
| Windsurf | Cmd+L | Cmd+L | Auto |
| VS Code+Cline | Cmd+Shift+P > Cline | Sidebar | Auto |

---

## Appendix B: Troubleshooting

### v0 Import Hatalari

| Hata | Cozum |
|------|-------|
| "Module not found" | Import path `@/` kullan |
| "Build failed" | webpack/babel config sil |
| "Styles not working" | Tailwind kullan, CSS-in-JS sil |
| "Type error" | TypeScript strict mode duzenle |

### Senkronizasyon Sorunlari

```bash
# v0'dan cekmeden once
git stash
git pull origin main
git stash pop

# Conflict cozumu
git checkout --ours components/ui/  # v0 versiyonu koru
```

---

## Version History

| Versiyon | Tarih | Degisiklikler |
|----------|-------|---------------|
| 1.0.0 | 2026-04-04 | Ilk manifesto |
| 2.0.0 | 2026-04-05 | IDE/LLM/Agent matrisleri, v0 API detaylari, hibrit strateji |
| 2.1.0 | 2026-04-05 | v0 API OpenAI-compatible eklendi, Cline/KiloCode/RooCode/Aider entegrasyonu |

---

## Maintainers

- Proje Sahibi: [@alpseroglu](https://github.com/alpseroglu)
- v0 Entegrasyon: v0.dev ekosistemi

---

**Bu manifesto projenin tek kaynak dogrulugudur. Tum AI araclari ve gelistiriciler bu kurallara uyar.**
