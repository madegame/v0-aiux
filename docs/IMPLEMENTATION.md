# Implementation Guide - v0 AI Starterkit

## Architecture Overview

### 3-Panel Layout Architecture
```
┌─────────────────────────────────────────────────────────┐
│                   Workspace Layout                      │
├──────────────┬──────────────────────┬──────────────────┤
│              │                      │                  │
│   Left:      │     Center:          │   Right:         │
│   Prompt     │     Dashboard        │   Automation     │
│   Engine     │     - Files          │   Agent          │
│   Chat       │     - Tasks          │   Chat           │
│              │     - Code Review    │                  │
│              │     - Terminal       │                  │
│              │     - Integrations   │                  │
├──────────────┼──────────────────────┼──────────────────┤
│  25%         │      50%             │      25%         │
│  (resizable) │   (resizable)        │   (resizable)    │
└──────────────┴──────────────────────┴──────────────────┘
```

**Resizable Panels:**
- Left panel: Min 15%, Max 40% (default 25%)
- Center panel: Min 30% (dynamic based on left/right)
- Right panel: Min 15%, Max 40% (default 25%)

---

## File Structure

### Components
```
components/
├── layout/
│   ├── workspace-layout.tsx     # Main 3-panel container
│   ├── center-panel.tsx         # Dashboard with multiple views
│   ├── settings-panel.tsx       # LLM/model/rules config
│   └── index.ts
├── chat/
│   ├── dual-chatbox.tsx         # Enhanced chat with role/provider
│   ├── chatbox.tsx              # Original chatbox
│   └── index.ts
└── workspace/
    └── terminal-panel.tsx       # Terminal output viewer
```

### API Routes
```
app/api/
├── tasks/
│   └── route.ts                 # Task CRUD operations
├── chat/
│   └── route.ts                 # Chat history storage
├── git/
│   └── worktrees/
│       └── route.ts             # Worktree management
├── files/
│   └── route.ts                 # File operations (TODO)
├── integrations/
│   └── route.ts                 # Integration status (TODO)
└── agents/
    └── route.ts                 # Agent management (TODO)
```

### Library Structure
```
lib/
├── ai/
│   └── tasks/
│       ├── types.ts             # Task/Agent types
│       ├── parser.ts            # Message parsing
│       ├── dispatcher.ts        # Agent dispatcher (client-compatible)
│       ├── channel.ts           # Event channel
│       ├── worktree.ts          # Git worktree API client
│       ├── storage.ts           # Storage utilities (uses API routes)
│       └── index.ts             # Exports (client-safe)
└── utils/
    └── api.ts                   # API utility functions
```

---

## API Reference

### Tasks API

#### GET /api/tasks
Get all tasks or filter by status.

**Query Parameters:**
- `filter`: 'all' | 'todo' | 'in-progress' | 'completed' (default: 'all')
- `limit`: number (default: 50)

**Response:**
```json
[
  {
    "id": "1",
    "title": "Setup project",
    "status": "completed",
    "priority": "high",
    "tags": ["setup"],
    "createdAt": "2026-04-05T21:00:00Z"
  }
]
```

#### POST /api/tasks
Create a new task.

**Request Body:**
```json
{
  "title": "New task",
  "status": "todo",
  "priority": "medium",
  "tags": ["feature"],
  "description": "Task description"
}
```

#### PUT /api/tasks
Update an existing task.

**Request Body:**
```json
{
  "id": "1",
  "status": "in-progress",
  "priority": "high"
}
```

#### DELETE /api/tasks
Delete a task.

**Query Parameters:**
- `id`: Task ID (required)

---

### Chat API

#### GET /api/chat
Get chat history.

**Query Parameters:**
- `type`: 'prompt-engine' | 'automation' (default: 'prompt-engine')
- `limit`: number (default: 50)

**Response:**
```json
[
  {
    "id": "1",
    "type": "prompt-engine",
    "role": "ask",
    "provider": "openai",
    "message": "User message",
    "context": {...},
    "timestamp": "2026-04-05T21:00:00Z"
  }
]
```

#### POST /api/chat
Save a chat message.

**Request Body:**
```json
{
  "type": "prompt-engine",
  "role": "ask",
  "provider": "openai",
  "message": "User message",
  "context": {}
}
```

---

### Git Worktrees API

#### GET /api/git/worktrees
Get all git worktrees.

**Response:**
```json
[
  {
    "id": "main",
    "branch": "main",
    "path": "/workspace/main",
    "isCurrent": true,
    "createdAt": "2026-03-06T00:00:00Z"
  }
]
```

#### POST /api/git/worktrees
Create a new git worktree.

**Request Body:**
```json
{
  "branchName": "feature/new-ui",
  "taskId": "task-123"
}
```

**Response:**
```json
{
  "success": true,
  "worktree": {
    "id": "worktree-1712346400000",
    "branch": "feature/new-ui",
    "path": "/workspace/feature-new-ui",
    "isCurrent": false,
    "taskId": "task-123",
    "createdAt": "2026-04-05T21:00:00Z"
  },
  "message": "Worktree created for branch: feature/new-ui"
}
```

---

## State Management

### Client-Side State
- **Chatbox state**: Message history, active chat type (prompt-engine/automation)
- **Panel state**: Open/closed, resized widths, current center view
- **Settings state**: Selected LLM, model, role, provider

### Server-Side State
- **Task storage**: Database (Supabase/Neon) - not yet integrated
- **Chat history**: Database persistence
- **Git worktrees**: File system
- **Integrations**: External service connections

### State Flow
```
User Input
   ↓
Chat Component (client)
   ↓
API Route (server)
   ↓
Database/External Service
   ↓
Response (JSON)
   ↓
Component Update (SWR/React)
```

---

## LLM Integration

### Chatbox Configuration

Each chatbox has:
1. **Role Selector** - Type of AI assistant
   - `ask` - General questions
   - `code` - Code generation
   - `debug` - Error debugging
   - `plan` - Architecture planning
   - `review` - Code review
   - `test` - Test writing
   - `docs` - Documentation
   - `admin` - Project administration

2. **Provider Selector** - AI service provider
   - `vercel-ai-gateway` - Default (zero-config)
   - `openai` - OpenAI GPT models
   - `anthropic` - Anthropic Claude
   - `google` - Google Gemini
   - `openrouter` - OpenRouter (any model)
   - `groq` - Groq LLMs

3. **Model Selector** - Specific model variant
   - Shows available models based on provider
   - Examples: gpt-4, claude-opus, gemini-pro

### Configuration Storage
Stored in browser localStorage (per-session):
```javascript
{
  "chatbox-prompt-engine": {
    "role": "ask",
    "provider": "openai",
    "model": "gpt-4"
  },
  "chatbox-automation": {
    "role": "admin",
    "provider": "anthropic",
    "model": "claude-opus"
  }
}
```

---

## User Flow

### Prompt Engine (Left Chatbox)

1. User enters prompt/requirement
2. AI generates task list and PRD
3. User reviews and approves
4. Code generation starts
5. Results appear in center panel

### Automation Agent (Right Chatbox)

1. User configures rules, hooks, skills
2. Agent monitors task execution
3. Parallel automation tasks run
4. Results sync to main workflow

### Center Panel Views

- **Dashboard**: Overview of project status
- **Files**: File explorer with content viewer
- **Tasks**: Task list with filtering/sorting
- **Code Review**: Diff viewer for PRs
- **Terminal**: Command output and logs
- **Integrations**: Connected services status

---

## Environment Variables

No additional env vars needed for basic functionality.

For full integrations, add:
```
NEXT_PUBLIC_AI_GATEWAY_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
GITHUB_TOKEN=your_token
NEON_DATABASE_URL=your_url
```

---

## Mobile Responsive Design

### Mobile View (< 768px)
- Bottom navigation sheet instead of sidebars
- Single full-width panel at a time
- Slide-out navigation menu
- Touch-optimized controls

### Tablet View (768px - 1024px)
- Collapsible left sidebar
- Full center panel
- Right panel as slide-out

### Desktop View (> 1024px)
- 3-panel layout as designed
- Resizable dividers
- Keyboard shortcuts enabled

---

## Next Steps (Phase 3)

1. **Database Integration**
   - Connect Supabase or Neon
   - Persist tasks and chat history
   - User authentication

2. **Real-time Sync**
   - WebSocket for live updates
   - Multi-user collaboration
   - Conflict resolution

3. **Code Execution**
   - Sandbox environment
   - File system operations
   - Terminal access

4. **AI Features**
   - PRD generation
   - Multi-agent coordination
   - Cron job scheduling

5. **GitHub Integration**
   - Push/pull workflows
   - Branch creation
   - PR management

---

## Debugging

### Common Issues

**1. child_process error**
- Don't import server-side modules in client components
- Use API routes instead
- Check imports in `/lib/ai/tasks/index.ts`

**2. State not syncing**
- Use SWR for data fetching
- Call API routes, not server functions
- Check network tab in DevTools

**3. Panel layout broken**
- Verify ResizablePanelGroup key prop
- Check defaultSize values add up to 100%
- Use id and order props on panels

### Debug Logging
```typescript
console.log('[v0] Component mounted:', componentName);
console.log('[v0] API call:', endpoint, payload);
console.log('[v0] State update:', newState);
```

---

## Performance Tips

1. **Code Splitting**
   - Use dynamic imports for heavy components
   - Lazy load dashboard views

2. **Caching**
   - SWR caching for API responses
   - Browser caching for static files

3. **Optimization**
   - Memoize chatbox components
   - Virtual scroll for long task lists
   - Debounce resize handlers

---

## Testing Checklist

- [ ] Dual chatboxes load and send messages
- [ ] Panel resize works smoothly
- [ ] Center panel views switch without errors
- [ ] Settings persist across sessions
- [ ] API routes return correct data
- [ ] Mobile responsiveness on various screen sizes
- [ ] LLM provider switching works
- [ ] Task filtering and sorting works
- [ ] Chat history persists
- [ ] File explorer displays files correctly

---

## Contributing

When adding new features:

1. Keep components in `components/` directory
2. API logic in `app/api/` routes
3. Types in `lib/ai/tasks/types.ts`
4. Utilities in `lib/utils/`
5. Follow existing naming conventions
6. Test in browser DevTools
7. Run `pnpm build` before committing

---

Generated: 2026-04-05  
Last Updated: Phase 2 Complete
