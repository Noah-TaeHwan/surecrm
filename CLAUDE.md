# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚀 Essential Commands

### Development

```bash
npm run dev                # Start development server with HMR
npm run build              # Create production build
npm start                  # Run production server
```

### Code Quality

```bash
npm run typecheck          # Run TypeScript type checking
npm run lint               # Check code style issues
npm run lint:fix           # Auto-fix linting issues
npm run format             # Format code with Prettier
npm run format:check       # Check formatting issues
```

### Testing

```bash
npm run test               # Run tests in watch mode
npm run test:run           # Run tests once
npm run test:ui            # Open Vitest UI
npm run test:coverage      # Generate coverage report
```

### Database Operations

```bash
npm run db:generate        # Generate migrations from schema changes
npm run db:migrate         # Apply pending migrations
npm run db:push            # Push schema changes directly (dev only)
npm run db:studio          # Open Drizzle Studio for database GUI
npm run db:reset:clean     # Reset database to clean state
```

### Version Management

```bash
npm run version:patch      # Bump patch version (0.1.0 → 0.1.1)
npm run version:minor      # Bump minor version (0.1.0 → 0.2.0)
npm run version:major      # Bump major version (0.1.0 → 1.0.0)
npm run push               # Auto-version, tag, and push to git
npm run release            # Commit all changes and push with auto-versioning
```

### Internationalization

```bash
npm run i18n:extract       # Extract translation keys from code
npm run i18n:validate      # Validate translation completeness
npm run i18n:missing       # Find missing translation keys
npm run i18n:stats         # Show translation statistics
```

## 🏗️ Architecture Overview

### Technology Stack

- **Framework**: React Router v7 (Full-stack React framework)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL) with Drizzle ORM
- **Authentication**: Supabase Auth
- **UI Components**: Shadcn UI, Radix UI
- **Internationalization**: react-i18next (ko, en, ja)
- **State Management**: Server state via React Router loaders/actions
- **Deployment**: Vercel

### Project Structure

```
surecrm/
├── app/
│   ├── api/               # API business logic layer
│   │   └── shared/        # Shared API modules (clients, teams, etc.)
│   ├── common/            # Shared components and utilities
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Layout components
│   │   └── utils/         # Utility functions
│   ├── features/          # Feature-based modules
│   │   ├── dashboard/     # Dashboard with KPIs and charts
│   │   ├── clients/       # Client management
│   │   ├── pipeline/      # Sales pipeline management
│   │   ├── calendar/      # Google Calendar integration
│   │   ├── billing/       # Subscription and payments
│   │   └── team/          # Team collaboration
│   ├── lib/               # Core configurations
│   │   ├── i18n/          # Internationalization setup
│   │   ├── supabase/      # Supabase client configuration
│   │   └── db/            # Database schema and types
│   └── routes/            # Route handlers and API endpoints
├── public/
│   └── locales/           # Translation files (ko, en, ja)
├── supabase/              # Database migrations and config
└── scripts/               # Utility scripts
```

### Key Architectural Patterns

1. **Feature-Based Organization**: Each major feature lives in `app/features/` with its own components, hooks, and utilities.

2. **API Layer Separation**: Business logic is separated from routes:
   - Routes in `app/routes/` handle HTTP concerns
   - API logic in `app/api/shared/` contains business logic
   - Clear TypeScript interfaces for all API responses

3. **Database Architecture**:
   - Drizzle ORM for type-safe queries
   - Schema defined in `app/lib/db/schema.ts`
   - Row-level security (RLS) policies in Supabase
   - Consistent naming conventions (snake_case in DB, camelCase in code)

4. **Component Architecture**:
   - Mobile-first responsive design
   - Desktop/Mobile component variants using `useIsMobile()` hook
   - Consistent use of shadcn/ui components
   - Form handling with react-hook-form and zod validation

5. **Authentication & Authorization**:
   - Session-based auth via Supabase
   - Protected routes using `requireUser()` helper
   - Team-based access control
   - Subscription status checks for premium features

6. **Internationalization**:
   - Namespace-based translation files
   - Language switcher in user settings
   - Automatic language detection
   - Fallback to Korean for missing translations

7. **Error Handling**:
   - Consistent error responses from API
   - Toast notifications for user feedback
   - Error boundaries for graceful failures
   - Detailed logging with Sentry integration

### Development Guidelines

1. **Type Safety**: Always define TypeScript types for API responses, database queries, and component props.

2. **Mobile-First**: Design and implement for mobile screens first, then enhance for desktop.

3. **API Consistency**: Follow existing patterns in `app/api/shared/` for new API endpoints.

4. **Component Reusability**: Use common components from `app/common/components/` before creating new ones.

5. **Database Changes**: Always generate migrations with `npm run db:generate` after schema changes.

6. **Testing**: Write tests for critical business logic and API endpoints.

7. **Internationalization**: Add translation keys to appropriate namespace files when adding new UI text.

8. **Performance**: Use React Router's data APIs (loaders/actions) for server-side data fetching.

### Important Conventions

- **File Naming**: Use kebab-case for files, PascalCase for components
- **Route Naming**: Follow React Router v7 conventions (e.g., `_layout.tsx`, `+page.tsx`)
- **API Routes**: Prefix with `api.` (e.g., `api.clients.tsx`)
- **Database Queries**: Always include proper WHERE clauses for team/user filtering
- **Date Handling**: Use date-fns for all date operations
- **Styling**: Use Tailwind classes, avoid inline styles
- **Forms**: Use react-hook-form with zod schemas for validation

### Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client code
- Always validate user permissions in API endpoints
- Use RLS policies for database security
- Sanitize user inputs before database operations
- Check subscription status for premium features

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the [todo.md](http://todo.md/) file with a summary of the changes you made and any other relevant information.

**한국어로 답변하세요.**
**USE context7 MCP**
**THINK DEEP**

Always respond in Korean.

Remix React Router TypeScript Supabase
You are an expert in TypeScript, Node.js, React Router, React, Remix, Shadcn UI, Radix UI, Tailwind and Supabase.

Key Principles

- Write concise, technical TypeScript code with accurate examples.
- Use functional and declarative programming patterns; avoid classes.
- Prefer iteration and modularization over code duplication.
- Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
- Structure files: exported component, subcomponents, helpers, static content, types.

Naming Conventions

- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

TypeScript Usage

- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

Syntax and Formatting

- Use the "function" keyword for pure functions.
- Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
- Use declarative JSX.

UI and Styling

- Use Shadcn UI, Radix, and Tailwind for components and styling.

Key Conventions

- Don't import anything from Radix UI. Always import UI componentsfrom Shadcn UI.
- Don't import anything from Remix. Any @remix-run import should be imported from "react-router".
- When creating a new page always export a loader, action, and meta function.
- Route types should be imported like this: `import type { Route } from "./+types/...";`
- `useLoaderData` does not exist anymore. Instead, components receive Router.ComponentProps type param that contains loaderData.
- `useActionData` does not exist anymore. Instead, components receive Router.ComponentProps type param that contains actionData.
- Never use `useLoaderData` or `useActionData` in page components.
- `loader` function takes a Route.LoaderArgs type param.
- `action` function takes a Route.ActionArgs type param.
- `meta` function takes a Route.MetaFunction type param.
- `meta` returns MetaFunction type.
- `json` does not exists anymore. Return plain objects i.e `export function loader({ request }: Route.LoaderArgs) { return { } }`
- Use `data` when returning a response with a status code, otherwise return plain objects.

**THINK DEEP**
Always respond in Korean.
