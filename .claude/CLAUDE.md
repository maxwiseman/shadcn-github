# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**shadcn-github** is a full-stack GitHub repository browser built with Next.js that allows users to search and explore GitHub repositories with syntax-highlighted code preview, pull requests, issues, and detailed repository information. The project is built as a Turborepo monorepo using the Better-T-Stack.

## Development Commands

```bash
# Install dependencies
bun install

# Development
bun run dev              # Start all apps in development mode
bun run dev:web         # Start only the web app (http://localhost:3001)

# Building
bun run build           # Build all packages and apps
bun run check-types     # TypeScript type checking across workspace

# Database
bun run db:push         # Push schema changes to database (Drizzle)
bun run db:generate     # Generate database types and migrations
bun run db:migrate      # Run database migrations
bun run db:studio       # Open Drizzle Studio UI for database inspection

# Code Quality
bun run check           # Run Ultracite linting check
bun run fix             # Auto-fix linting and formatting issues
```

**Package Manager**: This project uses Bun 1.3.1 (configured in package.json)

## Architecture

### Monorepo Structure

```
shadcn-github/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── src/app/           # Next.js App Router pages
│       ├── src/components/    # React components (includes shadcn/ui)
│       └── src/lib/           # Utilities and API clients
├── packages/
│   ├── auth/                  # Better-Auth configuration
│   ├── db/                    # Drizzle ORM database layer
│   ├── env/                   # T3 Env validation (server & web)
│   └── config/                # Shared TypeScript config
└── turbo.json                 # Turborepo configuration
```

### Key Technologies

- **Next.js 16** with App Router (React Server Components)
- **React 19** with Babel React Compiler enabled
- **Better-Auth 1.4** for authentication
- **Drizzle ORM** with PostgreSQL (Neon serverless)
- **TailwindCSS 4** for styling
- **shadcn/ui** component library
- **Octokit** for GitHub REST API integration
- **Turborepo** for monorepo orchestration
- **Ultracite/Biome** for linting and formatting

## Environment Variables

Required environment variables (create `apps/web/.env`):

```env
# Database
DATABASE_URL=<PostgreSQL connection string>

# Authentication (Better-Auth)
BETTER_AUTH_SECRET=<32+ character secret>
BETTER_AUTH_URL=http://localhost:3001  # or production URL
CORS_ORIGIN=http://localhost:3001      # or production URL

# GitHub API
GITHUB_TOKEN=<GitHub personal access token>  # Optional but recommended for higher rate limits
DEMO_REPOS=<owner/repo,owner/repo>          # Optional: comma-separated list for demo mode

# Environment
NODE_ENV=development  # or production, test
```

**Note**: Environment variables are validated at runtime using T3 Env (see `packages/env/src/server.ts`)

## GitHub API Integration

### Rate Limiting Strategy

The app implements several strategies to handle GitHub API rate limits:

1. **Caching**: All Octokit requests use Next.js revalidation (`revalidate: 60` seconds)
2. **Error Boundaries**: Custom error boundary (`apps/web/src/app/error.tsx`) displays user-friendly rate limit messages
3. **Demo Mode**: Set `DEMO_REPOS` env var to enable demo mode with predefined repositories (no API calls)
4. **Rate Limit Detection**: Custom `RateLimitError` class in `lib/errors.ts` with `throwIfRateLimit()` helper

### GitHub Client Usage

The GitHub API client is located in `apps/web/src/lib/github-rest.ts`:

```typescript
import { fetchRepoInfo, fetchPullRequests, fetchIssues } from "@/lib/github-rest";

// All functions handle errors gracefully and return null on failure
const repo = await fetchRepoInfo("owner", "repo");
```

**Important**: All GitHub API functions wrap errors with `throwIfRateLimit()` which throws a custom `RateLimitError` that the error boundary catches.

## Workspace Packages

### @shadcn-github/env

T3 Env configuration for environment validation. Import from:
- `@shadcn-github/env/server` - Server-side variables (DATABASE_URL, auth config, etc.)
- `@shadcn-github/env/web` - Client-side variables (currently empty)

### @shadcn-github/db

Drizzle ORM database layer:
- Schema files in `schema/` directory (currently only `auth.ts` for Better-Auth tables)
- Exports `db` instance and all schema/relations
- Uses Neon serverless PostgreSQL adapter

### @shadcn-github/auth

Better-Auth configuration:
- Drizzle adapter with PostgreSQL
- Email/password authentication enabled
- Next.js cookies plugin for session management
- API route handler: `apps/web/src/app/api/auth/[...all]/route.ts`

### @shadcn-github/config

Shared TypeScript configuration (`tsconfig.base.json`):
- Strict mode enabled
- Module resolution: bundler
- Base config extended by all packages

## Next.js App Router Structure

The main app is organized using Next.js App Router conventions:

- `app/page.tsx` - Homepage with repository search
- `app/layout.tsx` - Root layout with theme provider and toast container
- `app/error.tsx` - Error boundary (handles rate limits)
- `app/not-found.tsx` - 404 page
- `app/[username]/[repo]/` - Dynamic repository pages
  - `page.tsx` - Repository overview with file tree
  - `layout.tsx` - Repository layout with navigation
  - `pulls/[number]/page.tsx` - Pull request detail page
  - `issues/[number]/page.tsx` - Issue detail page
  - `file-tree.tsx` - File browser component (server component)
  - `preview.tsx` - Code preview with syntax highlighting
  - `pr-file-diff.tsx` - Pull request diff viewer

## Code Patterns

### Server vs Client Components

- **Default to Server Components** for data fetching (async functions in page.tsx files)
- **Client Components** only when needed (use `"use client"` directive):
  - Interactive forms (`repo-search.tsx`, `sign-in-form.tsx`)
  - Theme toggle (`mode-toggle.tsx`)
  - Components using React hooks

### Data Fetching

```typescript
// Server Component (preferred)
export default async function Page({ params }: { params: { username: string; repo: string } }) {
  const repoData = await fetchRepoInfo(params.username, params.repo);
  // ...
}

// Static generation for top repos
export async function generateStaticParams() {
  // Returns array of params for static generation at build time
}
```

### Performance Optimizations

- **Revalidation**: GitHub API calls cached for 60 seconds
- **Static Generation**: Top 100 JavaScript repos pre-rendered at build time
- **React Compiler**: Automatic memoization via Babel plugin
- **Image Optimization**: Next.js Image component configured for GitHub avatars
- **Debounced Search**: 300ms debounce on repository search

### Error Handling

- All GitHub API functions return `null` on error (never throw, except for rate limits)
- Use `throwIfRateLimit()` wrapper to detect rate limit errors
- Error boundaries at route level catch and display rate limit errors

### Styling

- TailwindCSS 4 utility classes
- Dark mode support via `next-themes`
- Class sorting with `clsx` and `cn` utility (from shadcn/ui)

### Authentication

- Better-Auth handles session management
- Auth routes: `/login`, `/dashboard`
- API route: `/api/auth/[...all]` (Better-Auth handler)

## Common Development Scenarios

### Adding a new GitHub API endpoint

1. Add TypeScript interface for response in `apps/web/src/lib/github-rest.ts`
2. Create async function using `createOctokit()` helper
3. Wrap with try-catch and `throwIfRateLimit(error)`
4. Return `null` or empty array on error

### Adding a new repository page

1. Create route in `apps/web/src/app/[username]/[repo]/`
2. Use Server Component for data fetching
3. Call GitHub API functions from `lib/github-rest.ts`
4. Handle `null` returns gracefully

### Database schema changes

1. Modify schema in `packages/db/src/schema/`
2. Run `bun run db:generate` to create migrations
3. Run `bun run db:push` to apply to database
4. Types are automatically generated

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `bun x ultracite fix`
- **Check for issues**: `bun x ultracite check`
- **Diagnose setup**: `bun x ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**Next.js:**

- Use Next.js `<Image>` component for images
- Use `next/head` or App Router metadata API for head elements
- Use Server Components for async data fetching instead of async Client Components

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**Solid/Svelte/Vue/Qwik:**

- Use `class` and `for` attributes (not `className` or `htmlFor`)

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations
6. **Documentation** - Add comments for complex logic, but prefer self-documenting code

---

Most formatting and common issues are automatically fixed by Biome. Run `bun x ultracite fix` before committing to ensure compliance.
