---
name: "feature-dev"
type: sequential
scope: workspace
enabled: false
timeout: 1800
---

# Feature Development Workflow

Yeni feature gelistirme icin standart workflow.

## Description

Yeni bir feature gelistirirken izlenmesi gereken adimlar.
Plan -> Implement -> Test -> Review -> Merge

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `feature_name` | string | yes | Feature adi |
| `description` | string | yes | Feature aciklamasi |
| `assignee` | string | no | Atanan kisi |

## Steps

### Step 1: Plan
```yaml
action: create-plan
inputs:
  template: feature
  name: ${feature_name}
outputs:
  plan_file: .ai/plans/${feature_name}.md
```

**Actions:**
1. Feature scope belirleme
2. Acceptance criteria yazma
3. Taskilere bolme
4. Estimation yapma

### Step 2: Branch
```yaml
action: git-branch
inputs:
  name: feature/${feature_name}
  from: develop
outputs:
  branch: feature/${feature_name}
```

**Actions:**
1. Develop'tan yeni branch olustur
2. Branch'e gec

### Step 3: Implement
```yaml
action: code
inputs:
  plan: ${step1.plan_file}
  branch: ${step2.branch}
outputs:
  files: [changed_files]
```

**Actions:**
1. Plana gore kod yaz
2. Component'lar olustur
3. API endpoints ekle
4. Styling yap

### Step 4: Test
```yaml
action: test
inputs:
  files: ${step3.files}
outputs:
  coverage: number
  passed: boolean
```

**Actions:**
1. Unit testler yaz
2. Integration testler yaz
3. Test coverage kontrol

### Step 5: Review
```yaml
action: code-review
inputs:
  branch: ${step2.branch}
  files: ${step3.files}
outputs:
  approved: boolean
  comments: [string]
```

**Actions:**
1. Self-review yap
2. PR olustur
3. Review iste

### Step 6: Merge
```yaml
action: git-merge
inputs:
  source: ${step2.branch}
  target: develop
conditions:
  - ${step4.passed} == true
  - ${step5.approved} == true
```

**Actions:**
1. Conflicts coz
2. Merge yap
3. Branch sil (opsiyonel)

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `merged` | boolean | Merge durumu |
| `branch` | string | Feature branch |
| `files` | array | Degisen dosyalar |

## Example Usage

```bash
# Workflow'u baslat
ai workflow run feature-dev \
  --feature_name="user-auth" \
  --description="Add user authentication"
```

## Notes

- Bu workflow varsayilan olarak devre disi
- Her adim manuel onay gerektirebilir
- Timeout 30 dakika (1800 saniye)
