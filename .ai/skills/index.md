# Skills

> Version: 1.0  
> Type: skill  
> Scope: global  
> Editable: true

Skills, tekrar kullanilabilir yetenekler ve komut setleridir.

---

## Aktif Skills

(Henuz tanimlanmadi - baslangic icin bos)

---

## Skill Yapisi

```yaml
---
name: "skill-name"
category: code | review | documentation | testing | deployment
scope: global | workspace
enabled: true | false
requires: [dependency1, dependency2]
---

# Skill Adi

## Description
Kisa aciklama

## Usage
Nasil kullanilir

## Commands
Komutlar listesi

## Examples
Ornek kullanimlar
```

---

## Nasil Eklenir

1. `.ai/skills/` klasorune yeni `.md` dosyasi ekle
2. Kategori ve gereksinimler tanimla
3. Komutlari ve ornekleri ekle

---

## Ornek Skills

| Ornek | Dosya | Aciklama |
|-------|-------|----------|
| Code Review | [examples/code-review.md](./examples/code-review.md) | Kod inceleme yetenegi |
| Refactor | [examples/refactor.md](./examples/refactor.md) | Refactoring teknikleri |
| Documentation | [examples/documentation.md](./examples/documentation.md) | Dokumantasyon olusturma |
| Component Gen | [examples/component-gen.md](./examples/component-gen.md) | Component olusturma |

---

## Kategoriler

| Kategori | Aciklama |
|----------|----------|
| `code` | Kod yazma ve duzenleme |
| `review` | Kod inceleme |
| `documentation` | Dokumantasyon |
| `testing` | Test yazma |
| `deployment` | Deploy islemleri |
| `analysis` | Kod analizi |
| `generation` | Kod uretme |

---

## Skill Invocation

```bash
# Skill calistir
ai skill invoke code-review --file=component.tsx

# Skill listele
ai skill list

# Skill detaylari
ai skill info refactor
```
