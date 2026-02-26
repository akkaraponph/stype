# slowlytype

Minimal typing test focused on calm, consistent typing. Track WPM, accuracy, and history.

Built with **[vinext](https://vinext.io/)** — a Vite-based reimplementation of the Next.js API for [Cloudflare Workers](https://workers.cloudflare.com/). Same `app/` routing, React Server Components, and deployment flow; faster builds and smaller bundles.

## Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

## Getting started

```bash
# Install dependencies
npm install

# Run dev server (Vite HMR)
npm run dev

# Production build
npm run build
```

## Deploy to Cloudflare Workers

```bash
# Deploy to production
npm run deploy

# Deploy to a preview URL
npm run deploy:preview

# Deploy with experimental TPR (Trusted Publisher Registry)
npx vinext deploy --experimental-tpr
```

Uses [Wrangler](https://developers.cloudflare.com/workers/wrangler/) under the hood; configure `wrangler.toml` and Cloudflare account as needed.

## Tech stack

- **[vinext](https://vinext.io/)** — Next.js API on Vite, deployable to Cloudflare
- **React 19** — UI and client state
- **Tailwind CSS 4** — Styling
- **TanStack Query** — Data fetching
- **TypeScript** — Typing

## Scripts

| Script            | Command              | Description                    |
|-------------------|----------------------|--------------------------------|
| `dev`             | `vite dev`           | Local dev server with HMR      |
| `build`           | `vite build`         | Production build               |
| `deploy`          | `vinext deploy`      | Deploy to Cloudflare Workers   |
| `deploy:preview`  | `vinext deploy --preview` | Deploy to preview URL     |
| `lint`            | `eslint`             | Run ESLint                     |
| `test`            | `vitest run`         | Run tests                      |
