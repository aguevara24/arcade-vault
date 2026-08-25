# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault — a platform for playing games online and competing for the highest score (in Spanish in the README: "plataforma para jugar online y competir por la mayor cantidad de puntos").

The project follows Spec Driven Design via the `/spec` and `/spec-impl` skills from https://github.com/Klerith/fernando-skills, installed with:

```bash
npx skills@latest add Klerith/fernando-skills
```

Currently the repo is an unmodified `create-next-app` scaffold — no app-specific routes, components, or game logic exist yet beyond `app/page.tsx` and `app/layout.tsx`.

## Skills
Usa siempre /frontend-design para diseñar la interfaz de usuario.

## IMPORTANT: read Next.js docs before writing code

This project pins a Next.js version (16.3.1) that may include breaking changes relative to your training data — APIs, conventions, and file structure may differ. Before writing any Next.js code, read the relevant guide under `node_modules/next/dist/docs/` (sections: `01-app`, `02-pages`, `03-architecture`, `04-community`). Heed deprecation notices found there.


## Architecture

- Next.js App Router (`app/` directory), TypeScript, React 19.
- Styling via Tailwind CSS v4, configured through `@theme inline` in `app/globals.css` (no `tailwind.config.js` — v4 uses CSS-based config).
- Path alias `@/*` maps to the repo root (see `tsconfig.json`).
- `next.config.ts` is currently empty of custom config.
