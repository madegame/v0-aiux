---
name: "generate"
category: generation
scope: global
editable: true
---

# Generate Prompt

Kod uretimi icin prompt template.

## Usage

```
ai prompt run generate --type=<type> --name=<name> [--options]
```

## Template

```
Generate {{generation_type}} with the following specifications:

Name: {{name}}
Type: {{type}}
Path: {{target_path}}

## Requirements

{{requirements_list}}

## Constraints

- Follow v0.dev/Vercel ecosystem patterns
- Use TypeScript strict mode
- Use shadcn/ui components where applicable
- Use Tailwind CSS for styling
- Use @/ import alias
- No CSS-in-JS

## Generated Code Format

### File: {{file_path}}

\`\`\`typescript
// Generated code here
\`\`\`

## Verification Checklist

- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Follows project structure
- [ ] Uses correct imports
- [ ] Has proper types
```

## Generation Types

### component
```
Generate a React component:
- Name: {{name}}
- Type: server | client
- Props: {{props}}
- Features: {{features}}
```

### hook
```
Generate a custom hook:
- Name: use{{Name}}
- Purpose: {{purpose}}
- Returns: {{return_type}}
```

### api-route
```
Generate an API route:
- Path: /api/{{path}}
- Method: {{method}}
- Request: {{request_schema}}
- Response: {{response_schema}}
```

### utility
```
Generate a utility function:
- Name: {{name}}
- Purpose: {{purpose}}
- Params: {{params}}
- Returns: {{return_type}}
```

### type
```
Generate TypeScript types:
- Name: {{name}}
- Fields: {{fields}}
- Extends: {{extends}}
```

## Examples

### Generate Component
```
ai prompt run generate --type=component --name=UserCard
```

### Generate Hook
```
ai prompt run generate --type=hook --name=useAuth
```

### Generate API Route
```
ai prompt run generate --type=api-route --name=users --method=POST
```

## Variables

| Variable | Description |
|----------|-------------|
| `{{generation_type}}` | What to generate |
| `{{name}}` | Entity name |
| `{{target_path}}` | Output path |
| `{{requirements_list}}` | Specific requirements |
