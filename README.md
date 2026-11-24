# Scaling Atlas

**Live: [vkdev01.github.io/scaling-atlas](https://vkdev01.github.io/scaling-atlas/)**

An interactive system design course: twelve animated lessons that show how a
request travels, where the time goes, and how to scale a system without
breaking it.

Built with Next.js (App Router, static export), Tailwind CSS and shadcn/ui
components. No backend, no database, no tracking — progress lives in
`localStorage`.

## What's inside

- **12 lessons across 6 modules** — Foundations, Scaling, Data & Storage,
  Communication, Reliability, Whole Systems.
- **A data-driven diagram engine.** Each lesson declares nodes on a
  1000×600 canvas and each step declares which nodes and edges are live. The
  renderer dims everything else and animates a packet along the active path.
- **Progress tracking** per lesson and per step, persisted in the browser.
- **Search** over every lesson and step (`⌘K` or `/`).
- **Keyboard navigation** — `←` / `→` between steps, `space` to pause the
  animation.
- Light and dark themes, dark by default.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Build the static site

```bash
npm run build        # writes ./out
npx serve out        # preview the exported site
```

`next.config.mjs` sets `output: "export"`, so the build is plain HTML/CSS/JS.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and
publishes `out/` to GitHub Pages. The workflow injects
`NEXT_PUBLIC_BASE_PATH=/<repo-name>` because a project site is served from a
subpath; the same variable makes `basePath` and `assetPrefix` match locally.

If the first run fails, set **Settings → Pages → Build and deployment → Source**
to **GitHub Actions**.

## Adding a lesson

1. Add a `Lesson` object to the relevant file in `content/` (or a new file, then
   register it in `content/index.ts`).
2. Give it nodes with `x`/`y` inside the canvas and edges between node ids.
3. Write steps; each step can light up `active` nodes and `edges`.

The sidebar, search index, prev/next links and static routes all derive from
that data — nothing else to wire up.

## Content note

The latencies, sizes and throughput numbers are teaching models chosen to make
relationships visible. They are not measurements of any real system.

The prose, diagrams and code here are original. The site was inspired by the
genre of animated system-design explainers, not copied from one.
