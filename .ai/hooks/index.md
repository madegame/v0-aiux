# Hooks

> Version: 1.0  
> Type: hook  
> Scope: global  
> Editable: true

Hooks, belirli olaylar gerceklestiginde otomatik olarak calisir.

---

## Aktif Hooks

(Henuz tanimlanmadi - baslangic icin bos)

---

## Hook Yapisi

```yaml
---
name: "hook-name"
trigger: on-save | on-commit | on-push | on-create | on-delete | custom
scope: global | workspace
enabled: true | false
priority: 1-100
---

# Hook Adi

## Trigger
Aciklama

## Actions
1. Aksiyon 1
2. Aksiyon 2

## Conditions
- Kosul 1
- Kosul 2
```

---

## Nasil Eklenir

1. `.ai/hooks/` klasorune yeni `.md` dosyasi ekle
2. Metadata blogu ile trigger tanimla
3. Aksiyonlari listele
4. Kosullari belirt

---

## Ornek Hooklar

| Ornek | Dosya | Aciklama |
|-------|-------|----------|
| Auto Lint | [examples/auto-lint.md](./examples/auto-lint.md) | Dosya kaydedildiginde lint calistir |
| Auto Test | [examples/auto-test.md](./examples/auto-test.md) | Commit oncesi test calistir |
| Type Check | [examples/type-check.md](./examples/type-check.md) | Push oncesi TypeScript kontrol |

---

## Kullanilabilir Triggerlar

| Trigger | Aciklama |
|---------|----------|
| `on-save` | Dosya kaydedildiginde |
| `on-commit` | Commit yapilmadan once |
| `on-push` | Push yapilmadan once |
| `on-create` | Yeni dosya olusturuldugunda |
| `on-delete` | Dosya silindiginde |
| `on-branch` | Yeni branch olusturuldugunda |
| `on-merge` | Branch merge edildiginde |
| `custom` | Ozel tetikleyici |
