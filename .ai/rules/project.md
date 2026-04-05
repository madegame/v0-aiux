# Project Rules
# Proje ozel kurallar - Dashboard'dan duzenlenebilir
# Bu dosya system.md kurallarini override edebilir

---
version: "1.0"
type: project
project_name: "v0-ai-starterkit"
editable: true
last_updated: "2026-04-04"
---

## Project-Specific Rules

### Architecture
- Dual Agent System: Task Agent (sol) + Supervisor (sag)
- Workspace: Orta panel (editor, preview, terminal)
- Resizable panels kullan (`components/ui/resizable.tsx`)

### AI Integration
- Vercel AI Gateway kullan (zero config)
- AI SDK v6 patterns
- Streaming responses

### Component Hierarchy
```
app/page.tsx
  ├── TaskAgentChat (sol panel)
  ├── WorkspacePanel (orta panel)
  │   ├── FileExplorer
  │   ├── DocumentViewer
  │   └── TerminalPanel (post-MVP)
  └── SupervisorChat (sag panel)
```

### State Management
- SWR for data fetching
- React Context for global UI state
- Local state for component-specific

### Roles (This Project)
- Task Agent: code, debug, test
- Supervisor: plan, review, admin
- Shared: ask, docs

## Custom Patterns

### Chat Message Format
```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentType: 'task' | 'supervisor';
  llmRole: LLMRole;
  timestamp: string;
}
```

### File Operations
```typescript
// Always log file operations
console.log("[v0] File operation:", { action, path });

// Use project context for file access
const { files, addFile, updateFile } = useProjectContext();
```

## Override Rules

### Allow in This Project
- Terminal commands (for Task Agent debug role)
- Multiple chat instances

### Deny in This Project
- Direct .env modifications
- npm/pnpm install commands

---

# Metadata
keywords: [dual-agent, workspace, ai-sdk, vercel]
category: project
priority: high
extends: system.md
