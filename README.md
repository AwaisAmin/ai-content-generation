# Fomi — AI Content Generation Workspace

Frontend assessment for [Fomi](https://fomi.art): a responsive, production-quality
image & video generation workspace built with Next.js.

## Tech stack

- **Next.js 16** (App Router, Cache Components) — JavaScript
- **Tailwind CSS v4** + CSS Modules
- Mocked backend via Next.js Route Handlers
- Deployed on Vercel

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Production build             |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Lint the codebase            |

## Project structure

```
src/
  app/           # Routes, layouts, API route handlers
  components/    # Reusable UI, grouped by feature
  data/          # Mock JSON for the fake backend
  hooks/         # Reusable React hooks
  lib/           # Utilities and API client
```
