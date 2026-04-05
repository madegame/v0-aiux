---
name: "testing-rules"
category: quality
scope: workspace
enabled: true
---

# Testing Rules

Test yazma ve organizasyon kurallari.

## Test File Structure

```
component/
├── Component.tsx
├── Component.test.tsx      # Unit tests
└── Component.stories.tsx   # Storybook (optional)

lib/
├── utils.ts
└── utils.test.ts
```

## Naming Conventions

```typescript
// Test file: same name + .test.tsx
// Button.tsx -> Button.test.tsx

// Test descriptions: clear and specific
describe('Button', () => {
  it('should render with primary variant', () => {});
  it('should call onClick when clicked', () => {});
  it('should be disabled when disabled prop is true', () => {});
});
```

## Unit Tests

### Component Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Utility Tests
```typescript
import { formatDate, validateEmail } from './utils';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2026-01-15');
    expect(formatDate(date)).toBe('January 15, 2026');
  });

  it('handles invalid date', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});

describe('validateEmail', () => {
  it.each([
    ['test@example.com', true],
    ['invalid', false],
    ['@example.com', false],
    ['test@', false],
  ])('validates %s as %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected);
  });
});
```

### Hook Tests
```typescript
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());
    act(() => {
      result.current.increment();
    });
    expect(result.current.count).toBe(1);
  });

  it('accepts initial value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });
});
```

## Integration Tests

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    
    render(<LoginForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={jest.fn()} />);
    
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });
});
```

## Mocking

```typescript
// Mock module
jest.mock('@/lib/api', () => ({
  fetchUsers: jest.fn(),
}));

// Mock implementation
import { fetchUsers } from '@/lib/api';
const mockFetchUsers = fetchUsers as jest.MockedFunction<typeof fetchUsers>;

beforeEach(() => {
  mockFetchUsers.mockResolvedValue([
    { id: '1', name: 'User 1' },
  ]);
});
```

## Coverage Targets

| Type | Minimum | Target |
|------|---------|--------|
| Statements | 70% | 80% |
| Branches | 70% | 80% |
| Functions | 70% | 80% |
| Lines | 70% | 80% |

## Prohibited Patterns

```typescript
// ❌ Testing implementation details
expect(component.state.isOpen).toBe(true); // WRONG

// ❌ Snapshot overuse
expect(component).toMatchSnapshot(); // Only for specific cases

// ❌ Not waiting for async
const button = screen.getByRole('button');
fireEvent.click(button);
expect(result).toBe(true); // WRONG - might not be ready
```
