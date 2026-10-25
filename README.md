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
  config/        # Generation options shared by UI and API
  data/          # Mock JSON for the fake backend
  hooks/         # Reusable React hooks
  lib/           # Utilities, API client, server-only mock store
```

## Mock API

A small in-memory backend built with Route Handlers. Responses include
artificial latency so loading states behave like real inference. Data lives
in memory, so new generations persist while the server runs and reset on
restart / serverless cold start.

| Method | Endpoint           | Description                                                                 |
| ------ | ------------------ | --------------------------------------------------------------------------- |
| `GET`  | `/api/generations` | Paginated feed. Query: `type` (`image` \| `video`), `cursor`, `limit`       |
| `POST` | `/api/generations` | Create a generation. Body: `type, prompt, model, aspectRatio, count, style` |
| `GET`  | `/api/history`     | Recent generations, one cover thumbnail each                                |

Errors share one shape: `{ "error": { "code", "message" } }`.

- Results are picked by matching prompt keywords to media tags, so
  _"a cat by the window"_ returns cats.
- Include **`#error`** in a prompt to simulate a model failure (HTTP 503)
  and see the error state.

Images are served from [Unsplash](https://unsplash.com); sample videos are
from MDN (CC0), and _Sintel_ and _Big Buck Bunny_ by the Blender Foundation
(CC BY 3.0) via test-videos.co.uk.
