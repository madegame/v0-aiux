---
name: "tdd-workflow"
type: sequential
scope: workspace
enabled: false
timeout: 1200
---

# Test-Driven Development Workflow

TDD metodolojisi ile kod gelistirme.

## Description

Red -> Green -> Refactor dongusu.

## Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `feature` | string | yes | Feature veya fonksiyon adi |
| `spec` | string | yes | Beklenen davranis |

## Steps

### Step 1: Red (Write Failing Test)
```yaml
action: write-test
inputs:
  feature: ${feature}
  spec: ${spec}
outputs:
  test_file: string
```

**Actions:**
1. Test dosyasi olustur
2. Test case'leri yaz
3. Testlerin fail ettigini dogrula

```typescript
// Example: components/auth/login.test.tsx
describe('Login', () => {
  it('should validate email format', () => {
    // Test code that FAILS initially
  });
});
```

### Step 2: Green (Make Test Pass)
```yaml
action: implement
inputs:
  test_file: ${step1.test_file}
outputs:
  implementation: string
```

**Actions:**
1. Minimum kodu yaz
2. Testi gecir
3. Sadece gerekeni yap

```typescript
// Minimum implementation to pass
function validateEmail(email: string): boolean {
  return email.includes('@');
}
```

### Step 3: Refactor
```yaml
action: refactor
inputs:
  implementation: ${step2.implementation}
  test_file: ${step1.test_file}
outputs:
  refactored: boolean
```

**Actions:**
1. Kodu iyilestir
2. Testlerin hala gectigini dogrula
3. Tekrar eden kodu temizle

```typescript
// Refactored implementation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
```

### Step 4: Repeat
```yaml
action: check-coverage
inputs:
  feature: ${feature}
outputs:
  coverage: number
  complete: boolean
```

**Actions:**
1. Coverage kontrol
2. Eksik case'leri tespit
3. Donguyu tekrarla veya bitir

## TDD Rules

1. **Oncce test yaz** - Hic kod yazma test olmadan
2. **Minimum kod** - Sadece testi gecirecek kadar yaz
3. **Refactor surekli** - Her yesil'den sonra iyilestir
4. **Kucuk adimlar** - Buyuk degisikliklerden kacin

## Coverage Targets

| Type | Target |
|------|--------|
| Unit Tests | > 80% |
| Integration | > 60% |
| E2E | Critical paths |

## Example Cycle

```
1. Write test: validateEmail("invalid") -> false
2. Run test: FAIL (function not found)
3. Write code: return false
4. Run test: PASS
5. Write test: validateEmail("valid@email.com") -> true
6. Run test: FAIL
7. Write code: return email.includes('@')
8. Run test: PASS
9. Refactor: Use regex
10. Run test: PASS
```
