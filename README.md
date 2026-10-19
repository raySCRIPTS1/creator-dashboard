# CreatorPulse

Dark creator dashboard built with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style reusable Button component, Lucide icons and Recharts.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What works
- Responsive navigation and dashboard cards
- Demo statistics clearly labelled as illustrative
- Manual TikTok account entry and editable metrics
- Income and expense tracking, with net earnings
- Browser localStorage persistence and CSV export

## What is not connected yet
This starter **does not** connect to TikTok or fetch live data. The chart uses illustrative data even after demo mode is cleared. TikTok's official Login Kit and Display API need a registered app, approved scopes, OAuth callback routes, server-side token storage, a database and scheduled snapshots for historical trends. Never place OAuth client secrets or access tokens in client-side code or localStorage.

Suggested production stack: PostgreSQL + Prisma, Auth.js or Clerk, encrypted token storage, background jobs and per-user access controls.
