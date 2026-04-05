# AI-First Development IDE - Master Plan (ARCHIVED)

> **DIKKAT:** Bu dosya arsivlendi. Guncel plan icin bkz: **[MASTER_PLAN.md](./MASTER_PLAN.md)**
>
> **Durum:** ARSIVLENDI  
> **Tarih:** 2026-04-04 (Arsiv: 2026-04-05)  
> **Versiyon:** 3.0 - Konsolide plana tasinmistir

---

## Mevcut Kod Durumu Analizi

### Tamamlanan Parcalar
| Komponent | Dosya | Durum | Not |
|-----------|-------|-------|-----|
| Dashboard Layout | `app/page.tsx` | 80% | Sidebar + Main content mevcut |
| Chatbox | `components/chat/chatbox.tsx` | 70% | Tek chat, dual-agent degil |
| File Explorer | `components/chat/file-explorer.tsx` | 90% | Calisir durumda |
| Document Viewer | `components/chat/document-viewer.tsx` | 85% | MD editing mevcut |
| Project Context | `components/chat/project-context.tsx` | 100% | State management OK |
| AI History Types | `lib/ai-history/types.ts` | 100% | Kapsamli tip sistemi |
| UI Components | `components/ui/*` | 100% | shadcn/ui + resizable |

### Eksik/Guncellenecek Parcalar
| Komponent | Oncelik | Token Tahmini | Not |
|-----------|---------|---------------|-----|
| Dual Chatbox (Sol/Sag) | P0 | ~8,000 | Mevcut chatbox ikiye bolunecek |
| Provider Guncelleme | P0 | ~2,000 | IDE listesi -> AI Gateway |
| Resizable Panels | P1 | ~3,000 | `components/ui/resizable.tsx` MEVCUT |
| Terminal Panel | P1 | ~15,000 | xterm.js entegrasyonu |
| Monaco Editor | P2 | ~8,000 | Code editor yukseltme |
| AI SDK Entegrasyonu | P2 | ~10,000 | Gercek AI baglantisi |

### Kaldirilacak/Degisecek Kod
```typescript
// chatbox.tsx - KALDIRILACAK Provider listesi:
const PROVIDERS = [
  'cursor', 'windsurf', 'claude-code', 'kilo-code', 'roo-code', 'cline', 'v0'
];

// YENI: AI Gateway destekli provider listesi:
const PROVIDERS = [
  'openai/gpt-5-mini', 'anthropic/claude-opus-4.6', 'google/gemini-3-flash'
];
```

---

## Vizyon

Cursor/Windsurf benzeri, dual-agent destekli, Vercel sandbox entegrasyonlu, AI-native bir gelistirme ortami.

---

## Genel Token & Maliyet Tahmini

| Metrik | Task Agent (Sol) | Supervisor Agent (Sag) | Toplam |
|--------|------------------|------------------------|--------|
| Ortalama Istek/Seans | 15-25 | 5-10 | 20-35 |
| Token/Istek (Input) | ~2,000 | ~3,500 | - |
| Token/Istek (Output) | ~1,500 | ~800 | - |
| Toplam Token/Seans | ~52,500 | ~43,000 | ~95,500 |
| Tahmini Maliyet/Seans | $0.15-0.25 | $0.12-0.18 | $0.27-0.43 |

> (Not: GPT-4 Turbo fiyatlandirmasi baz alinmistir. Claude/Gemini farkli olabilir)

---

## Prompt Sihirbazi (KRITIK)

Prompt muhendisligi bu sistemin kalbidir. Her rol icin optimize edilmis system prompt'lar:

```typescript
interface PromptWizard {
  // Her rol icin template
  roleTemplates: Record<AgentRole, SystemPrompt>;
  
  // Context injection
  contextBuilders: {
    fileContext: (files: string[]) => string;
    historyContext: (messages: Message[]) => string;
    codebaseContext: (structure: FileTree) => string;
  };
  
  // Token optimizasyonu
  compression: {
    enabled: boolean;
    maxTokens: number;
    strategy: 'truncate' | 'summarize' | 'selective';
  };
}

// Ornek System Prompt (Task Agent)
const TASK_AGENT_PROMPT = `
Sen bir Task Agent'sin. Gorevlerin:
1. Kod yazma ve duzenleme
2. Bug fixing ve debugging
3. Dosya operasyonlari

KISITLAMALAR:
- Plan yapma yetkisi supervisor'da
- Mimari kararlar icin supervisor'a danisılmalı
- Her degisiklik loglanir

CIKTI FORMATI:
- Kod bloklari \`\`\`lang formatinda
- Aciklamalar kisa ve net
- Degisiklikler diff formatinda
`;
```

### Prompt Token Optimizasyonu

| Strateji | Token Tasarrufu | Kalite Etkisi | Oneri |
|----------|-----------------|---------------|-------|
| Context Truncation | %30-40 | Orta dusus | Uzun seanslarda kullan |
| History Summarization | %50-60 | Dusuk dusus | 10+ mesajda aktif et |
| Selective File Context | %40-50 | Minimal | Her zaman aktif |
| Code Compression | %20-30 | Riskli | Sadece preview icin |

---

# FAZ 0: Temizlik & Provider Guncelleme (ONCELIK: YUKSEK)

| Metrik | Deger | Guncelleme |
|--------|-------|------------|
| Tahmini Token | ~5,000 | Azaltildi - cogu altyapi mevcut |
| Istek Sayisi | 3-5 | |
| Karmasiklik | 2/10 | |
| Uyum Skoru | 9/10 | |
| Teknik Borc | 1/10 | |
| Sure | 30-60 dk | |

## 0.1 Provider Sistemi Guncelleme (KRITIK)
```typescript
// lib/ai-history/types.ts - DEGISECEK
// Eski: IDE bazli provider listesi
export type LLMProvider = 'cursor' | 'windsurf' | 'claude-code' | ...;

// Yeni: AI Gateway + OpenRouter uyumlu
export type LLMProvider = 
  | 'openai'      // gpt-5-mini, gpt-4-turbo
  | 'anthropic'   // claude-opus-4.6, claude-sonnet
  | 'google'      // gemini-3-flash
  | 'groq'        // llama-3.1
  | 'fireworks'   // mixtral
  | 'openrouter'; // Tum modellere erisim (custom API key)

// OpenRouter entegrasyonu
interface OpenRouterConfig {
  apiKey: string;           // OPENROUTER_API_KEY
  defaultModel: string;     // ornek: 'anthropic/claude-3-opus'
  availableModels: string[];
}
```

**Gorevler:**
- [ ] `lib/ai-history/types.ts` - LLMProvider tipini guncelle
- [ ] `components/chat/chatbox.tsx` - PROVIDERS listesini guncelle
- [ ] Model selector ekle (provider + model secimi)
- [ ] OpenRouter API key input (dashboard settings)
- [ ] OpenRouter model listesi dinamik yukleme

## 0.2 Kaldirilacak Kod
- [x] ~~Cursor/Windsurf IDE secimi~~ (zaten kaldirildi)
- [ ] Eski provider UI'lari temizlenecek
- [ ] Demo PROVIDERS sabiti guncellenecek

> **NOT:** Schema dosyalari gereksiz - TypeScript tip sistemi yeterli

---

# FAZ 1: Dual Agent Layout (ONCELIK: KRITIK)

| Metrik | Deger | Guncelleme |
|--------|-------|------------|
| Tahmini Token | ~25,000 | Azaltildi - mevcut kod kullanilacak |
| Istek Sayisi | 12-18 | |
| Karmasiklik | 6/10 | Resizable zaten mevcut |
| Uyum Skoru | 8/10 | |
| Teknik Borc | 2/10 | |
| Sure | 4-6 saat | |

## 1.1 Layout Refactor (Token: ~8,000)

**Mevcut Durum:** `app/page.tsx` tek chatbox iceriyor
**Hedef:** Sol Task Agent + Orta Workspace + Sag Supervisor Agent

```
+----------------+--------------------------------+----------------+
|   LEFT CHAT    |       CENTER WORKSPACE         |   RIGHT CHAT   |
|   (Task Agent) | [Code] [Preview] [Terminal]    |  (Supervisor)  |
|   ask/code/    | Monaco Editor veya Preview     |   plan/review  |
|   debug/test   | File Tree (collapible)         |   admin        |
+----------------+--------------------------------+----------------+
```

**Mevcut Dosyalar Kullanilacak:**
- `components/ui/resizable.tsx` - HAZIR (react-resizable-panels)
- `components/chat/chatbox.tsx` - REFACTOR edilecek
- `components/chat/file-explorer.tsx` - OLDUĞU GIBI

**Gorevler:**
- [ ] `app/page.tsx` - ResizablePanelGroup ile 3'lu layout
- [ ] `components/chat/task-agent-chat.tsx` - Sol panel (yeni)
- [ ] `components/chat/supervisor-chat.tsx` - Sag panel (yeni)
- [ ] `components/workspace/workspace-panel.tsx` - Orta panel (yeni)

## 1.2 Dual Chat Sistemi (Token: ~12,000)

**MEVCUT `chatbox.tsx` analizi:**
- 600+ satir, tam ozellikli
- Role selector mevcut (ask, code, debug, plan, review, test, docs, admin)
- Provider selector mevcut (guncellenecek)
- Attachment sistemi mevcut
- History entegrasyonu mevcut

**Refactor Plani:**
```typescript
// Mevcut chatbox.tsx -> base-chat.tsx (ortak logic)
// Yeni: task-agent-chat.tsx (sol - code/debug/test odakli)
// Yeni: supervisor-chat.tsx (sag - plan/review/admin odakli)

// Role filtreleme:
const TASK_ROLES: LLMRole[] = ['ask', 'code', 'debug', 'test'];
const SUPERVISOR_ROLES: LLMRole[] = ['plan', 'review', 'docs', 'admin'];
```

| Alt Gorev | Token | Karmasiklik | Not |
|-----------|-------|-------------|-----|
| base-chat.tsx (extract) | ~3,000 | 5/10 | Ortak hook ve logic |
| task-agent-chat.tsx | ~4,000 | 5/10 | Sol panel |
| supervisor-chat.tsx | ~4,000 | 5/10 | Sag panel |
| inter-agent-comm.ts | ~1,000 | 4/10 | Agent iletisimi |

## 1.3 File/Tab Sistemi (Token: ~5,000)

**MEVCUT:**
- `file-explorer.tsx` - TAM CALISIR
- `document-viewer.tsx` - TAM CALISIR

**EKSIK:**
- [ ] Tab sistemi (dosya tablari) - ~2,000 token
- [ ] Monaco editor entegrasyonu - ~3,000 token (post-MVP olabilir)

> **ONERI:** MVP icin mevcut document-viewer yeterli, Monaco Phase 2'ye ertelenebilir

---

# FAZ 2: Terminal & Sandbox (ONCELIK: ORTA)

| Metrik | Deger | Guncelleme |
|--------|-------|------------|
| Tahmini Token | ~20,000 | Sadece Node.js ile baslama |
| Istek Sayisi | 10-15 | |
| Karmasiklik | 7/10 | xterm.js karmasik |
| Uyum Skoru | 7/10 | |
| Teknik Borc | 4/10 | API degisebilir |
| Sure | 6-10 saat | |

> **KARAR GEREKLI:** Terminal MVP'ye dahil mi? Yoksa Phase 2 mi?

## 2.1 Terminal Panel (Token: ~12,000)

**Bilesenler:**
```typescript
// components/workspace/terminal-panel.tsx
// - xterm.js entegrasyonu
// - Tab destegi (birden fazla terminal)
// - Output formatting (ANSI colors)
```

| Alt Gorev | Token | Karmasiklik | Not |
|-----------|-------|-------------|-----|
| terminal-panel.tsx | ~5,000 | 7/10 | xterm.js + fit addon |
| terminal-tabs.tsx | ~2,000 | 4/10 | Multi-terminal |
| output-formatter.ts | ~2,000 | 4/10 | ANSI parsing |
| terminal-hooks.ts | ~3,000 | 5/10 | useTerminal hook |

## 2.2 Sandbox Entegrasyonu (Token: ~8,000)

**Simdilik SKIP - Post-MVP**

> **ONERI:** Terminal UI'i MVP'de yap, sandbox API entegrasyonu Phase 2'ye birak. Mock terminal output ile baslayabilirsin.

---

# FAZ 3: AI SDK Entegrasyonu (ONCELIK: YUKSEK)

| Metrik | Deger | Guncelleme |
|--------|-------|------------|
| Tahmini Token | ~15,000 | AI Gateway basitlestirir |
| Istek Sayisi | 8-12 | |
| Karmasiklik | 5/10 | AI SDK v6 iyi dokumante |
| Uyum Skoru | 9/10 | |
| Teknik Borc | 1/10 | |
| Sure | 3-5 saat | |

## 3.1 AI SDK v6 + OpenRouter Entegrasyonu (Token: ~12,000)

**Provider Secenekleri:**
1. **Vercel AI Gateway** - Zero config (v0 icinde)
2. **OpenRouter** - Custom API key ile tum modeller

```typescript
// lib/ai/provider.ts
import { generateText, streamText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Vercel AI Gateway (default)
const gatewayResponse = await generateText({
  model: 'openai/gpt-5-mini',
  prompt: userMessage,
});

// OpenRouter (custom API key)
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const routerResponse = await generateText({
  model: openrouter('anthropic/claude-3-opus'),
  prompt: userMessage,
});
```

**OpenRouter Avantajlari:**
- 200+ model tek API ile
- Kullanici kendi API key'ini girebilir
- Model karsilastirma ve fallback
- Maliyet takibi

| Alt Gorev | Token | Karmasiklik | Not |
|-----------|-------|-------------|-----|
| lib/ai/provider.ts | ~3,000 | 4/10 | AI Gateway wrapper |
| lib/ai/chat-handler.ts | ~3,000 | 5/10 | Chat stream handler |
| app/api/chat/route.ts | ~2,500 | 4/10 | API route |
| hooks/use-chat.ts | ~1,500 | 3/10 | useChat hook kullan |

## 3.2 Prompt Sistemi (Token: ~5,000)

```typescript
// lib/ai/prompts/index.ts
export const SYSTEM_PROMPTS = {
  task_agent: `Sen bir Task Agent'sin. Gorevlerin:
    1. Kod yazma ve duzenleme
    2. Bug fixing ve debugging
    3. Dosya operasyonlari`,
    
  supervisor: `Sen bir Supervisor Agent'sin. Gorevlerin:
    1. Planlama ve mimari kararlar
    2. Kod review
    3. Yonetim ve koordinasyon`,
};
```

| Alt Gorev | Token | Karmasiklik | Not |
|-----------|-------|-------------|-----|
| lib/ai/prompts/index.ts | ~2,000 | 4/10 | Role-based prompts |
| lib/ai/prompts/context.ts | ~2,000 | 5/10 | Context builder |
| lib/ai/prompts/templates.ts | ~1,000 | 3/10 | Reusable templates |

---

# FAZ 4: Database & Storage (POST-MVP)

| Metrik | Deger |
|--------|-------|
| Tahmini Token | ~20,000 |
| Oncelik | POST-MVP |
| Karmasiklik | 6/10 |

## 4.1 Database Secimi

**ONERI:** Supabase (Auth + DB + Storage birlikte)

| Gorev | Token | Oncelik |
|-------|-------|---------|
| Supabase setup | ~5,000 | P1 |
| User auth | ~5,000 | P1 |
| Chat history persist | ~5,000 | P2 |
| Project storage | ~5,000 | P2 |

> **NOT:** MVP icin localStorage/client-side yeterli. Production icin Supabase ekle.

---

# FAZ 5+ : Gelecek Ozellikler (POST-MVP)

> **Bu fazlar MVP sonrasi planlanacak**

## 5.1 Vercel Ekosistem Entegrasyonlari
- Vercel Blob (dosya storage)
- Vercel KV (session/cache)
- GitHub entegrasyonu

## 5.2 MCP Desteği  
- Linear (issue tracking)
- Notion (docs)
- Sentry (error tracking)

## 5.3 SaaS Altyapisi
- Supabase Auth
- Odeme Entegrasyonu (secenekler: Stripe, Paddle, Iyzico, PayTR, LemonSqueezy)
- Upstash rate limiting

---

# MVP Ozeti (GUNCELLENDI)

## Token Tahmini - MVP Scope

| Faz | Token | Istek | Sure | Oncelik |
|-----|-------|-------|------|---------|
| Faz 0: Provider Guncelleme | ~5,000 | 3-5 | 30-60 dk | P0 |
| Faz 1: Dual Agent Layout | ~25,000 | 12-18 | 4-6 saat | P0 |
| Faz 3: AI SDK Entegrasyonu | ~15,000 | 8-12 | 3-5 saat | P0 |
| **MVP TOPLAM** | **~45,000** | **23-35** | **8-12 saat** | |

## Opsiyonel (MVP+)

| Faz | Token | Oncelik | Not |
|-----|-------|---------|-----|
| Faz 2: Terminal | ~20,000 | P1 | MVP'den sonra |
| Faz 4: Database | ~20,000 | P2 | Production icin |

## Karmasiklik Ozeti

| Faz | Karmasiklik | Teknik Borc | Risk |
|-----|-------------|-------------|------|
| Faz 0 | 2/10 | 1/10 | Dusuk |
| Faz 1 | 6/10 | 2/10 | Orta |
| Faz 3 | 5/10 | 1/10 | Dusuk |

---

# Kritik Kararlar (ONAY GEREKLI)

## 1. MVP Scope
- [x] **ONERILEN:** Faz 0 + Faz 1 + Faz 3 (~45,000 token)
- [ ] Alternatif: Terminal dahil (+20,000 token)

## 2. Terminal
- [ ] MVP'ye dahil mi?
- [x] **ONERI:** MVP'den sonra (Phase 2)

## 3. Database
- [x] **ONERI:** MVP icin client-side state yeterli
- [ ] Production icin Supabase eklenecek

## 4. Agent Iletisimi
- [ ] Supervisor Task Agent'a yetki verebilir mi?
- [ ] Ortak context paylasimi nasil olacak?

---

# Uygulama Sirasi (ONERILEN)

| Sira | Gorev | Token | Sure |
|------|-------|-------|------|
| 1 | Provider tiplerini guncelle (+ OpenRouter) | ~2,500 | 20 dk |
| 2 | ResizablePanelGroup layout | ~5,000 | 1 saat |
| 3 | Task Agent Chat (sol) | ~6,000 | 1.5 saat |
| 4 | Supervisor Chat (sag) | ~6,000 | 1.5 saat |
| 5 | Workspace Panel (orta) | ~4,000 | 1 saat |
| 6 | AI SDK + OpenRouter entegrasyonu | ~12,000 | 2.5 saat |
| 7 | LLM Secici (model dropdown) | ~3,000 | 45 dk |
| 8 | Prompt sistemi | ~5,000 | 1 saat |
| 9 | API Key Settings UI | ~3,000 | 45 dk |
| 10 | Test ve ince ayar | ~5,000 | 1 saat |
| **TOPLAM** | | **~51,500** | **~11.5 saat** |

---

# Onay Checklist

- [ ] MVP scope (Faz 0 + 1 + 3) onaylandi mi?
- [ ] Terminal Phase 2'ye ertelendi mi?
- [ ] Provider sistemi AI Gateway'e gecis onaylandi mi?
- [ ] Dual agent (Task + Supervisor) yaklasimi onaylandi mi?

---

## Sonraki Adim

Onayladiginizda asagidaki siraya gore kodlamaya baslayacagim:

1. `lib/ai-history/types.ts` - Provider tiplerini guncelle
2. `app/page.tsx` - 3'lu resizable layout
3. `components/chat/task-agent-chat.tsx` - Sol panel
4. `components/chat/supervisor-chat.tsx` - Sag panel
5. `lib/ai/provider.ts` - AI SDK entegrasyonu

**"Onayliyorum" demeniz yeterli.**
