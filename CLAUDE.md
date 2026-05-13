# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tikura Flix is a static, no-build Brazilian Portuguese course/membership platform for Vanessa Tikura's spiritual content. It is plain HTML/CSS/JS — no framework, no bundler, no package manager.

## Development

Open any `.html` file directly in a browser (no server required) or use a local static server:

```bash
npx serve .
# or
python -m http.server 8080
```

There are no build, lint, or test commands.

## Architecture

The site is split into independent page modules, each with its own CSS file:

| Page | HTML | CSS | JS |
|---|---|---|---|
| Landing / home | `index.html` | `style.css` | `script.js` |
| Course catalog | `cursos.html` | `cursos.css` | `cursos.js` |
| Login | `login.html` | `auth.css` | `auth.js` |
| Register | `registro.html` | `auth.css` | `auth.js` |
| Checkout | `checkout.html` | `checkout.css` | — |

**Auth flow** (`auth.js`): Supabase JS SDK (loaded from CDN) is initialized via `supabase-config.js`, which exposes credentials on `window.TIKURA_SUPABASE`. On login success, redirects to `cursos.html`; on register success, prompts email confirmation.

**Supabase config**: credentials live in `supabase-config.js` (public anon key, safe to commit). The `.env` / `.env.example` files are reference-only — they are not consumed by any JS.

## CSS Naming Conventions

- `index.html` / `style.css` use the `tk-` prefix (e.g., `tk-hero-fw`, `tk-btn-red`).
- `cursos.html` / `cursos.css` use the `course-` prefix.
- `login.html` / `registro.html` / `auth.css` use the `auth-` prefix.
- `checkout.html` / `checkout.css` use the `checkout-` prefix.

Keep naming consistent when adding new elements to avoid cross-file collisions.

## Key Patterns

- Auth forms are identified by `data-auth-form="login"` / `data-auth-form="register"` attributes; `auth.js` wires them up automatically.
- Status messages use `[data-auth-status]` elements (hidden by default, shown on error/success).
- Horizontal scrolling carousels use `data-scroll="prev"` / `data-scroll="next"` buttons paired with a `.course-track` container.
- Hero slideshow in `index.html` uses `.tk-h-slide` elements with `.active` class toggled by `script.js`; auto-advances every 6 seconds.
