---
name: "typescript-rules"
category: language
scope: global
enabled: true
---

# TypeScript Rules

TypeScript strict mode kurallari.

## Type Definitions

### Interface vs Type
```typescript
// Use interface for objects that may be extended
interface User {
  id: string;
  name: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Use type for unions, primitives, tuples
type Status = 'pending' | 'active' | 'inactive';
type Point = [number, number];
type Callback = (value: string) => void;
```

### Generics
```typescript
// Generic components
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}

// Generic functions
function first<T>(array: T[]): T | undefined {
  return array[0];
}
```

### Utility Types
```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Required - all properties required
type RequiredUser = Required<User>;

// Pick - select properties
type UserName = Pick<User, 'name'>;

// Omit - exclude properties
type UserWithoutId = Omit<User, 'id'>;

// Record - object with specific key/value types
type UserMap = Record<string, User>;
```

## Component Types

### Props
```typescript
// Explicit interface
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// With HTML attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}
```

### Event Handlers
```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

// Input events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Click events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};
```

### Refs
```typescript
// Element ref
const inputRef = useRef<HTMLInputElement>(null);

// Mutable ref
const countRef = useRef<number>(0);

// Forward ref
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});
```

## Prohibited Patterns

```typescript
// ❌ DO NOT use any
const data: any = fetchData(); // WRONG

// ❌ DO NOT use non-null assertion carelessly
const name = user!.name; // WRONG (usually)

// ❌ DO NOT ignore type errors
// @ts-ignore // WRONG
// @ts-expect-error // WRONG (without explanation)

// ❌ DO NOT use implicit any
function process(data) {} // WRONG - data is implicit any
```

## Required Patterns

```typescript
// ✅ Use explicit types
const data: UserData = await fetchData();

// ✅ Use unknown for untyped data
async function fetchData(): Promise<unknown> {
  const res = await fetch('/api/data');
  return res.json();
}

// ✅ Use type guards
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  );
}

// ✅ Use satisfies for type checking
const config = {
  apiUrl: process.env.API_URL,
  timeout: 5000,
} satisfies Config;
```

## Null Handling

```typescript
// Optional chaining
const name = user?.profile?.name;

// Nullish coalescing
const displayName = name ?? 'Anonymous';

// Type narrowing
if (user !== null && user !== undefined) {
  console.log(user.name); // user is User here
}
```
