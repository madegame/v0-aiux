# Workflows

> Version: 1.0  
> Type: workflow  
> Scope: global  
> Editable: true

Workflows, coklu adimli gorevleri otomatize eder.

---

## Aktif Workflows

(Henuz tanimlanmadi - baslangic icin bos)

---

## Workflow Yapisi

```yaml
---
name: "workflow-name"
type: sequential | parallel | conditional
scope: global | workspace
enabled: true | false
timeout: 300 # saniye
---

# Workflow Adi

## Description
Kisa aciklama

## Steps
1. Adim 1
2. Adim 2
3. Adim 3

## Inputs
- input1: aciklama
- input2: aciklama

## Outputs
- output1: aciklama
```

---

## Nasil Eklenir

1. `.ai/workflows/` klasorune yeni `.md` dosyasi ekle
2. Metadata ile tip tanimla (sequential, parallel, conditional)
3. Adimlari sirala
4. Input/Output tanimla

---

## Ornek Workflows

| Ornek | Dosya | Aciklama |
|-------|-------|----------|
| Feature Dev | [examples/feature-dev.md](./examples/feature-dev.md) | Yeni feature gelistirme akisi |
| Bug Fix | [examples/bug-fix.md](./examples/bug-fix.md) | Bug duzeltme workflow'u |
| TDD | [examples/tdd-workflow.md](./examples/tdd-workflow.md) | Test-Driven Development |
| Code Review | [examples/review-workflow.md](./examples/review-workflow.md) | Kod inceleme sureci |

---

## Workflow Tipleri

### Sequential
Adimlar sirayla calisir. Bir adim basarisiz olursa durur.

### Parallel
Adimlar paralel calisir. Tum adimlar tamamlaninca devam eder.

### Conditional
Adimlarin calismasi kosullara baglidir.

---

## Variables

| Variable | Aciklama |
|----------|----------|
| `${project}` | Proje adi |
| `${branch}` | Aktif branch |
| `${user}` | Kullanici adi |
| `${timestamp}` | Unix timestamp |
| `${step.output}` | Onceki adimin ciktisi |
