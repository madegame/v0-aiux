---
name: "documentation"
category: documentation
scope: global
enabled: true
requires: []
---

# Documentation Skill

Dokumantasyon olusturma yetenegi.

## Description

Kod icin otomatik dokumantasyon olusturur.

## Usage

```bash
ai skill invoke documentation --target=<path> --type=<doc_type>
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `target` | string | yes | Dosya veya klasor |
| `type` | string | no | jsdoc, readme, api, storybook |
| `format` | string | no | markdown, html, json |

## Documentation Types

### jsdoc
Fonksiyon ve component'lar icin JSDoc yorumlari.

```typescript
/**
 * Validates email format using regex.
 * 
 * @param email - The email address to validate
 * @returns True if email is valid, false otherwise
 * @example
 * validateEmail('test@example.com') // true
 * validateEmail('invalid') // false
 */
function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}
```

### readme
Component veya modul icin README dosyasi.

```markdown
# ComponentName

Brief description.

## Installation
...

## Usage
...

## Props
| Prop | Type | Default | Description |
...

## Examples
...
```

### api
API endpoint'leri icin dokumantasyon.

```markdown
## POST /api/auth/login

Authenticate user and return token.

### Request
```json
{
  "email": "string",
  "password": "string"
}
```

### Response
```json
{
  "token": "string",
  "user": {...}
}
```

### Errors
| Code | Message |
...
```

### storybook
Component icin Storybook story'si.

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
};
```

## Commands

### Generate JSDoc
```
Add JSDoc comments to all functions in this file.
Include @param, @returns, and @example.
```

### Generate README
```
Create a README.md for this component/module.
Include installation, usage, props, and examples.
```

### Generate API Docs
```
Document this API route.
Include request/response schemas and error codes.
```

## Output Formats

| Format | Output |
|--------|--------|
| markdown | .md files |
| html | Static HTML docs |
| json | Structured JSON |

## Examples

```bash
# JSDoc for file
ai skill invoke documentation --target=lib/utils.ts --type=jsdoc

# README for component
ai skill invoke documentation --target=components/Button --type=readme

# API documentation
ai skill invoke documentation --target=app/api --type=api
```
