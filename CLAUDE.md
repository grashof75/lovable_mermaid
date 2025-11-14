# CLAUDE.md - AI Assistant Guide for Lovable Mermaid Project

## Project Overview

**lovable_mermaid** is an advanced AI-powered Mermaid diagram editor that combines manual editing, AI-powered generation, real-time preview, and collaborative features. The application is a full-stack web SPA built with modern React and backed by Supabase.

**Project Status:** Beta
**Lovable Project URL:** https://lovable.dev/projects/e751f4c0-8ecf-4b68-92d9-99805a66e66e

### Core Features

1. **Diagram Editing**: Code editor with syntax highlighting for Mermaid diagrams
2. **AI Generation**: OpenAI GPT-4o-mini integration for natural language to diagram conversion
3. **Interactive Preview**: Real-time rendering with zoom (2x-8x), pan, and component selection
4. **Saved Views**: Hierarchical organization of diagram views with zoom/pan state
5. **Collaboration**: Comments system linked to specific views
6. **Export**: SVG export with intelligent filename generation
7. **Theme Support**: Light/dark mode with automatic diagram re-rendering

---

## Technology Stack

### Frontend

- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1 with SWC transpiler
- **Styling**: Tailwind CSS 3.4.11 + PostCSS + Autoprefixer
- **UI Components**: shadcn/ui (65+ components) built on Radix UI
- **Icons**: Lucide React 0.462.0
- **Routing**: React Router v6.26.2
- **Forms**: React Hook Form 7.53.0 + Zod 3.23.8
- **State Management**:
  - React Context API (auth)
  - TanStack React Query 5.56.2 (server state)
  - Component-level useState (local state)
- **Diagrams**: Mermaid 11.4.1
- **Drag & Drop**: @dnd-kit/* 6.3.1+
- **Utilities**:
  - lodash 4.17.21
  - date-fns 3.6.0
  - file-saver 2.0.5

### Backend & Deployment

- **BaaS**: Supabase (PostgreSQL + Auth + Real-time)
- **Hosting**: Netlify
- **AI**: OpenAI GPT-4o-mini (optional, with mock fallback)

### Development Tools

- **Linting**: ESLint 9.9.0 with TypeScript and React plugins
- **IDE Integration**: Lovable Tagger + Claude Code hooks

---

## Directory Structure

```
/home/user/lovable_mermaid/
├── src/
│   ├── main.tsx                    # React DOM entry point
│   ├── App.tsx                     # Root component with routing
│   ├── pages/
│   │   ├── Index.tsx               # Main application page (35KB - largest)
│   │   └── NotFound.tsx            # 404 page
│   ├── components/
│   │   ├── Header.tsx              # Nav header with theme toggle
│   │   ├── Editor.tsx              # Mermaid code editor
│   │   ├── Preview.tsx             # Diagram preview with controls
│   │   ├── AIPrompt.tsx            # AI prompt input
│   │   ├── ViewSidebar.tsx         # Saved views (37KB)
│   │   ├── DiagramsList.tsx        # Diagram list (29KB)
│   │   ├── CommentsPanel.tsx       # Comments system (13KB)
│   │   ├── QuickNavigationBar.tsx  # Quick nav (12KB)
│   │   ├── MainLayout.tsx          # Resizable panel layout
│   │   ├── AuthModal.tsx           # Auth dialog
│   │   ├── ErrorBoundary.tsx       # React error boundary
│   │   ├── SafeComponent.tsx       # Error-safe wrapper
│   │   ├── SafeMermaidRenderer.tsx # Safe Mermaid rendering
│   │   └── ui/                     # shadcn/ui components (65+)
│   ├── contexts/
│   │   └── AuthProvider.tsx        # Auth context
│   ├── hooks/
│   │   ├── usePreviewControls.ts   # Preview zoom/pan
│   │   ├── use-toast.ts            # Toast notifications
│   │   └── use-mobile.tsx          # Mobile detection
│   ├── integrations/supabase/
│   │   ├── client.ts               # Supabase client
│   │   └── types.ts                # Auto-generated types
│   ├── types/
│   │   ├── database.ts             # Database schema types
│   │   └── comments.ts             # Comment types
│   ├── utils/
│   │   ├── api.ts                  # OpenAI integration (6.5KB)
│   │   ├── supabase.ts             # DB operations layer
│   │   └── transitions.ts          # CSS transitions
│   └── lib/
│       └── utils.ts                # clsx/tailwind-merge utils
├── supabase/
│   ├── config.toml
│   └── migrations/                 # 3 SQL migration files
├── public/                         # Static assets
├── .claude/
│   └── settings.local.json         # Claude Code config
├── Configuration:
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── components.json             # shadcn/ui config
│   ├── netlify.toml
│   └── .env.example
└── Documentation:
    ├── README.md
    ├── DOCUMENTAZIONE_VERSIONE_ATTUALE.md  # Italian docs
    ├── PRE_COMMIT_CHECKLIST.md
    ├── LOVABLE_ERROR_FIX_PROMPT.md
    └── LOVABLE_ROUTER_FIX_PROMPT.md
```

**Key Statistics:**
- 83 TypeScript/TSX files
- 65+ shadcn/ui components
- 18 main feature components
- ~2000+ lines of source code

---

## Key Entry Points

### Application Initialization Flow

```
index.html
  → src/main.tsx (React DOM initialization)
    → src/App.tsx (providers + routing)
      → src/pages/Index.tsx (main app)
```

### Important Files by Responsibility

| File | Size | Purpose |
|------|------|---------|
| `src/pages/Index.tsx` | 35KB | Main application page, manages all state |
| `src/components/ViewSidebar.tsx` | 37KB | Saved views with drag-drop & nesting |
| `src/components/DiagramsList.tsx` | 29KB | Diagram list with search/filter |
| `src/components/Preview.tsx` | 18KB | Diagram rendering with zoom/pan |
| `src/components/CommentsPanel.tsx` | 13KB | Collaborative comments |
| `src/utils/supabase.ts` | 6.5KB | Database abstraction layer |
| `src/utils/api.ts` | - | OpenAI integration with mock fallback |

---

## Development Conventions & Patterns

### File Naming

- **Components**: PascalCase (`Header.tsx`, `Preview.tsx`)
- **UI Library**: kebab-case (`alert-dialog.tsx`, `use-toast.ts`)
- **Descriptive names**: Indicate purpose (`SafeMermaidRenderer.tsx`)

### Component Architecture

1. **Functional Components**: Use hooks exclusively
2. **ForwardRef**: For imperative handles (e.g., `Preview` with `PreviewRef`)
3. **Prop Interfaces**: Define at component level with TypeScript
4. **Error Boundaries**: Comprehensive error handling system
   - `ErrorBoundary.tsx` - React error boundary
   - `SafeComponent.tsx` - Component-level error wrapper
   - `SafeMermaidRenderer.tsx` - Diagram rendering errors

### State Management Layers

1. **Context API**: Authentication via `AuthProvider`
2. **React Query**: Server state (Supabase operations)
3. **useState**: Component-local state
4. **localStorage**: API key persistence
5. **Zustand**: Available but not heavily used

### Import Path Aliases

```typescript
@ → src/
@/components → src/components
@/hooks → src/hooks
@/utils → src/utils
@/lib → src/lib
@/types → src/types
```

Configured in `vite.config.ts` and `components.json`.

### Type Safety

- **Strict Mode**: Enabled in `tsconfig.json`
- **Auto-generated Types**: Supabase schema types
- **Zod Validation**: Form schemas
- **No implicit any**: Enforced

### Error Handling Pattern

```typescript
// Always wrap risky operations
try {
  const { data, error } = await db.diagrams.getAll(userId)
  if (error) throw error
  // handle data
} catch (error) {
  console.error("Operation failed:", error)
  toast.error("User-friendly message")
}
```

---

## Database Schema & Operations

### Existing Tables (Supabase)

1. **profiles** - User profile data
2. **diagrams** - Mermaid diagram storage
3. **saved_views** - Saved zoom/pan views with hierarchical nesting
4. **comments** - Collaboration comments linked to views
5. **ai_prompts** - AI generation history (proposed)
6. **prompt_pool** - AI prompt templates (proposed)

### Database Operations Layer

**File**: `src/utils/supabase.ts`

Provides type-safe abstraction:

```typescript
// Example usage
import { db } from '@/utils/supabase'

// Get all diagrams
const diagrams = await db.diagrams.getAll(userId)

// Create view
const view = await db.savedViews.create({
  diagram_id,
  name: "My View",
  zoom_level: 3.5,
  pan_x: 100,
  pan_y: 200
})

// Get user stats
const stats = await db.getUserStats(userId)
```

### Migrations

Located in `/home/user/lovable_mermaid/supabase/migrations/`:
1. `20250821165318_*.sql` - Initial schema
2. `20250822_fix_comments_foreign_key.sql`
3. `20250822_increase_zoom_limit.sql`

---

## Common Development Tasks

### Setup & Installation

```bash
# Clone repository
git clone <repo-url>
cd lovable_mermaid

# Install dependencies
npm install

# Start dev server (localhost:8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

Create `.env` from `.env.example`:

```env
# Required
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional (can be user-configured in app)
VITE_OPENAI_API_KEY=your-openai-api-key

# Optional server-side
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Note**: Variables prefixed with `VITE_` are client-side exposed.

### Adding New Components

1. **UI Component** (from shadcn/ui):
   ```bash
   npx shadcn-ui@latest add [component-name]
   ```
   Components appear in `src/components/ui/`

2. **Feature Component**:
   - Create in `src/components/`
   - Use PascalCase naming
   - Import path alias: `@/components/MyComponent`
   - Wrap risky logic in `SafeComponent`

### Working with Forms

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const formSchema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email()
})

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema)
})
```

### Authentication Flow

```typescript
// Get auth context
import { useAuth } from '@/contexts/AuthProvider'

const { user, signIn, signUp, signOut } = useAuth()

// Sign in
await signIn(email, password)

// Sign up
await signUp(email, password)

// Sign out
await signOut()

// Check if authenticated
if (!user) return <AuthModal />
```

### Toast Notifications

```typescript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Success",
  description: "Operation completed"
})

toast({
  title: "Error",
  description: "Something went wrong",
  variant: "destructive"
})
```

---

## AI Integration

### OpenAI Integration

**File**: `src/utils/api.ts`

**Dual-mode approach:**
1. **With API Key**: Live OpenAI GPT-4o-mini calls
2. **Demo Mode**: Mock responses for development

**Storage**: API key in localStorage (client-side)

**Prompt Engineering**: System prompt ensures valid Mermaid syntax output

```typescript
// Usage
import { generateDiagramFromPrompt } from '@/utils/api'

const code = await generateDiagramFromPrompt(
  userPrompt,
  apiKey // optional, uses localStorage if not provided
)
```

---

## Testing & Quality

### Current Status

**No automated tests configured** - manual testing only

**Quality Checks:**
- ESLint for static analysis
- TypeScript strict mode
- Manual testing via dev server

### Pre-Commit Checklist

See `PRE_COMMIT_CHECKLIST.md` for full checklist:

1. Run `npm run dev` and verify no blank screens
2. Check browser console for errors
3. Test error boundaries
4. Run `npm run build` successfully
5. Verify TypeScript compilation

**Critical Success Criteria:**
- ❌ NO blank/white screens
- ❌ NO "Uncaught Error" in console
- ❌ NO infinite loops or crashes
- ✅ Application loads and displays content
- ✅ Error boundaries catch errors gracefully

---

## Deployment

### Netlify Configuration

**File**: `netlify.toml`

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200  # SPA fallback routing
```

### Deployment Process

1. Push to GitHub
2. Netlify auto-builds via `npm run build`
3. Serves `/dist` folder
4. All routes redirect to `/index.html` (SPA)

### Required Secrets (Netlify)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Optional: `VITE_OPENAI_API_KEY`

---

## Claude Code Integration

### Hooks & Permissions

**File**: `.claude/settings.local.json`

**Allowed Git Operations:**
- `git clean`, `git add`, `git push`
- `git config`, `git commit`
- `git remote set-url`, `git rm`

**SessionStart Hook**: Displays screenshot monitoring message

**UserPromptSubmit Hook**: Checks for new screenshots (Windows PowerShell)

### Branch Workflow

**Current Branch**: `claude/claude-md-mhzg2xt036h8ehp7-01UruZLgom2RVthTSfbTepMp`

**Git Requirements:**
- Branch must start with `claude/`
- Branch must end with session ID
- Push with `-u origin <branch-name>`
- Retry on network errors (4 times, exponential backoff)

---

## Important Gotchas & Best Practices

### ⚠️ Critical Issues to Avoid

1. **Blank Screen Bug**: Always wrap components in error boundaries
   - Use `SafeComponent` wrapper
   - Implement `ErrorBoundary` at app root
   - Check browser console before committing

2. **Mermaid Rendering**:
   - Use `SafeMermaidRenderer` wrapper
   - Handle syntax errors gracefully
   - Re-render on theme change

3. **Type Safety**:
   - Never use `any` unless absolutely necessary
   - Use auto-generated Supabase types
   - Validate with Zod schemas

4. **Authentication**:
   - Always check `user` before protected operations
   - Handle session recovery on page reload
   - Use `useAuth()` hook, not Supabase client directly

5. **Performance**:
   - Memoize expensive operations
   - Use React.memo for heavy components
   - Debounce auto-save (30s default)

### 🎯 Best Practices

1. **Error Handling**: Always catch and display user-friendly messages
2. **Loading States**: Show loading indicators for async operations
3. **Responsive Design**: Test on mobile (use `use-mobile.tsx` hook)
4. **Accessibility**: Radix UI components are accessible by default
5. **Theme Support**: All components must support light/dark mode
6. **Type Everything**: No implicit any, strict mode enabled

### 📝 Code Style

- **Components**: One component per file
- **Imports**: Use path aliases (`@/components`)
- **Formatting**: Follow existing patterns
- **Comments**: Explain "why", not "what"
- **Naming**: Be descriptive, prefer clarity over brevity

---

## Architecture Decisions & Rationale

### Why These Choices?

1. **Vite over CRA**: Faster builds, better HMR, modern tooling
2. **TypeScript Strict**: Catch errors at compile time
3. **shadcn/ui**: Accessible, customizable, no runtime overhead
4. **Supabase**: Serverless, built-in auth, real-time capabilities
5. **React Query**: Simplified server state, automatic caching
6. **Tailwind CSS**: Rapid styling, consistent design system
7. **Context for Auth**: Lightweight, no Redux needed
8. **Mock API Fallback**: Works offline/demo mode

### Future Enhancements Recommended

See `DOCUMENTAZIONE_VERSIONE_ATTUALE.md` for detailed roadmap:

1. **Testing**: Add Vitest + React Testing Library
2. **Real-time Collaboration**: WebSocket for simultaneous editing
3. **Mobile Optimization**: Touch devices, responsive panels
4. **Advanced Export**: PNG, PDF formats
5. **Template System**: Pre-built diagram templates
6. **Performance**: Code splitting, lazy loading
7. **Analytics**: User behavior tracking
8. **Offline Support**: Service Workers

---

## Troubleshooting Common Issues

### Blank Screen

1. Check browser console for errors
2. Verify `ErrorBoundary.tsx` is in `App.tsx`
3. Ensure all imports are correct
4. Check Supabase connection
5. Verify environment variables

### TypeScript Errors

1. Run `npm run build` to see all errors
2. Check auto-generated types: `src/integrations/supabase/types.ts`
3. Ensure imports use path aliases correctly
4. Verify all dependencies are installed

### Build Failures

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check for missing dependencies
3. Verify all import paths
4. Ensure all files are saved

### Supabase Issues

1. Verify `.env` has correct credentials
2. Check Supabase dashboard for RLS policies
3. Ensure migrations are applied
4. Test connection with Supabase client

### AI Generation Not Working

1. Check OpenAI API key in localStorage
2. Verify internet connection
3. Check browser console for API errors
4. Try demo mode (works without API key)

---

## Quick Reference: File Locations

### Key Configuration
- **Vite Config**: `/home/user/lovable_mermaid/vite.config.ts`
- **TypeScript**: `/home/user/lovable_mermaid/tsconfig.json`
- **Tailwind**: `/home/user/lovable_mermaid/tailwind.config.ts`
- **shadcn/ui**: `/home/user/lovable_mermaid/components.json`
- **Netlify**: `/home/user/lovable_mermaid/netlify.toml`

### Key Components
- **Main App**: `/home/user/lovable_mermaid/src/pages/Index.tsx`
- **Auth Context**: `/home/user/lovable_mermaid/src/contexts/AuthProvider.tsx`
- **DB Layer**: `/home/user/lovable_mermaid/src/utils/supabase.ts`
- **AI Integration**: `/home/user/lovable_mermaid/src/utils/api.ts`
- **Error Boundary**: `/home/user/lovable_mermaid/src/components/ErrorBoundary.tsx`

### Database
- **Migrations**: `/home/user/lovable_mermaid/supabase/migrations/`
- **Config**: `/home/user/lovable_mermaid/supabase/config.toml`

### Documentation
- **README**: `/home/user/lovable_mermaid/README.md`
- **Italian Docs**: `/home/user/lovable_mermaid/DOCUMENTAZIONE_VERSIONE_ATTUALE.md`
- **Pre-commit**: `/home/user/lovable_mermaid/PRE_COMMIT_CHECKLIST.md`

---

## Working with AI Assistants (Claude Code)

### What to Do

✅ **Read existing documentation** before making changes
✅ **Use error boundaries** for all new components
✅ **Follow TypeScript strict mode** - no `any` types
✅ **Test locally** with `npm run dev` before committing
✅ **Check browser console** for errors
✅ **Use path aliases** (`@/components`) for imports
✅ **Handle loading and error states** in all async operations
✅ **Preserve existing functionality** when refactoring
✅ **Follow established patterns** in similar components
✅ **Commit with descriptive messages** following PRE_COMMIT_CHECKLIST.md

### What NOT to Do

❌ **Don't commit without testing** - blank screens are unacceptable
❌ **Don't break existing functionality** - verify all features still work
❌ **Don't ignore TypeScript errors** - fix them before committing
❌ **Don't bypass error boundaries** - use SafeComponent wrapper
❌ **Don't use `any` type** - properly type everything
❌ **Don't hardcode values** - use environment variables
❌ **Don't skip error handling** - always catch and display errors
❌ **Don't create new patterns** - follow existing conventions
❌ **Don't push to wrong branch** - verify branch name first

### Commit Message Template

```
<type>: <short description>

- <bullet point of what changed>
- <bullet point of what changed>
- <bullet point of what changed>

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

---

## Summary

This is a **production-ready, sophisticated web application** with:

- Modern React + TypeScript stack
- Comprehensive error handling system
- Type-safe database operations
- AI-powered diagram generation
- Collaborative features
- Professional development practices

**Main Areas for Maturity:**
- Automated testing coverage
- Real-time collaboration features
- Mobile optimization
- Advanced export formats

**For AI Assistants:**
This project follows strict TypeScript conventions, uses comprehensive error boundaries, and requires thorough testing before commits. Always prioritize user experience and code quality. When in doubt, refer to existing patterns in the codebase and consult the documentation files.

---

**Last Updated**: 2025-11-14
**Project Version**: 0.0.0 (Beta)
**Maintained for**: Claude Code and AI Assistant Integration
