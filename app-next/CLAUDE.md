# CLAUDE.md — `app-next/`

This is the Next.js production app. **The full project guide lives one level up at [`../CLAUDE.md`](../CLAUDE.md)** — read it first. It documents the stack, design tokens, every route, every modal, performance discipline, deployment, and the (frozen) legacy static reference at the repo root.

## Quick commands

```bash
npm install        # first time only
npm run dev        # → http://localhost:3000
npm run build      # production build + TypeScript check (must pass before push)
npm run start      # serve the prod build
```

`npm run build` is the source of truth. Don't ship code that doesn't pass it.

## Where to look

- **Routes** → `app/page.tsx`, `app/contact/page.tsx`, `app/appointment/page.tsx`
- **Components** → `components/`
- **Hooks** → `hooks/`
- **Pure data / types** → `lib/`
- **Design tokens** → `app/globals.css` (`@theme` block)
- **Site-wide SEO** → `app/layout.tsx` (`metadata` + Organization JSON-LD)

For everything else (RTL conventions, kashida, button hover policy, gotchas, modal state machines, the booking flow at `/appointment`, the legacy static reference), see [`../CLAUDE.md`](../CLAUDE.md).
