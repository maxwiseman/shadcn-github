# shadcn-github

A GitHub repository browser built with Next.js and shadcn/ui. Search and explore GitHub repositories with syntax-highlighted code preview, pull requests, issues, and an interactive file tree.

## Features

- **Repository search** - Find any GitHub repository by name
- **Code browsing** - Navigate files with an interactive file tree and syntax-highlighted code preview
- **Pull requests** - View pull request details and file diffs
- **Issues** - Browse and read repository issues
- **Dark mode** - Light and dark theme support
- **Demo mode** - Configure predefined repositories for showcasing without hitting API rate limits

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, React Server Components)
- [React 19](https://react.dev) with React Compiler
- [shadcn/ui](https://ui.shadcn.com) component library
- [TailwindCSS 4](https://tailwindcss.com)
- [Octokit](https://github.com/octokit/rest.js) for GitHub API
- [Better-Auth](https://www.better-auth.com) for authentication
- [Drizzle ORM](https://orm.drizzle.team) with PostgreSQL (Neon)
- [Turborepo](https://turbo.build) monorepo

## Getting Started

```bash
# Install dependencies
bun install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit .env with your database URL, auth secret, and optionally a GitHub token

# Push database schema
bun run db:push

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Project Structure

```
shadcn-github/
├── apps/
│   └── web/                # Next.js application
│       ├── src/app/        # App Router pages
│       ├── src/components/ # React components
│       └── src/lib/        # GitHub API client, utilities
├── packages/
│   ├── auth/               # Better-Auth configuration
│   ├── db/                 # Drizzle ORM database layer
│   ├── env/                # Environment variable validation (T3 Env)
│   └── config/             # Shared TypeScript config
```

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start all apps in development mode |
| `bun run build` | Build all packages and apps |
| `bun run check-types` | TypeScript type checking |
| `bun run check` | Lint and format check |
| `bun run fix` | Auto-fix lint and format issues |
| `bun run db:push` | Push schema changes to database |
| `bun run db:studio` | Open Drizzle Studio |

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (32+ characters) |
| `BETTER_AUTH_URL` | Yes | App URL for auth |
| `GITHUB_TOKEN` | No | GitHub PAT for higher rate limits |
| `DEMO_REPOS` | No | Comma-separated `owner/repo` list for demo mode |
