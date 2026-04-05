---
name: "bug-fix"
type: sequential
scope: workspace
enabled: false
timeout: 900
---

# Bug Fix Workflow

Bug duzeltme icin standart workflow.

## Description

Bug tespit edildikten sonra duzeltme sureci.
Reproduce -> Diagnose -> Fix -> Test -> Deploy

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `bug_id` | string | yes | Bug ID veya referans |
| `severity` | string | yes | critical, high, medium, low |
| `description` | string | yes | Bug aciklamasi |

## Steps

### Step 1: Reproduce
```yaml
action: investigate
inputs:
  bug_id: ${bug_id}
outputs:
  steps_to_reproduce: [string]
  affected_files: [string]
```

**Actions:**
1. Bug'i yeniden uret
2. Adimlarini dokumente et
3. Etkilenen dosyalari tespit et

### Step 2: Diagnose
```yaml
action: analyze
inputs:
  files: ${step1.affected_files}
outputs:
  root_cause: string
  solution: string
```

**Actions:**
1. Root cause analizi
2. Kod akisini takip et
3. Cozum onerileri olustur

### Step 3: Branch
```yaml
action: git-branch
inputs:
  name: fix/${bug_id}
  from: main
```

**Actions:**
1. Main'den hotfix branch olustur
2. Branch'e gec

### Step 4: Fix
```yaml
action: code
inputs:
  solution: ${step2.solution}
  files: ${step1.affected_files}
outputs:
  changed_files: [string]
```

**Actions:**
1. Cozumu uygula
2. Ilgili dosyalari duzenle
3. Console.log temizle

### Step 5: Test
```yaml
action: test
inputs:
  files: ${step4.changed_files}
  regression: true
outputs:
  passed: boolean
```

**Actions:**
1. Bug'in duzeldini dogrula
2. Regression testleri calistir
3. Edge case'leri kontrol et

### Step 6: Deploy
```yaml
action: deploy
inputs:
  branch: fix/${bug_id}
  target: main
conditions:
  - ${step5.passed} == true
  - ${severity} in [critical, high]
```

**Actions:**
1. PR olustur
2. Hizli review
3. Merge ve deploy

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `fixed` | boolean | Fix durumu |
| `root_cause` | string | Temel neden |
| `files` | array | Degisen dosyalar |

## Severity Guidelines

| Severity | Response Time | Workflow |
|----------|---------------|----------|
| Critical | Immediate | Hotfix to prod |
| High | < 4 hours | Same day fix |
| Medium | < 24 hours | Next release |
| Low | Next sprint | Backlog |
