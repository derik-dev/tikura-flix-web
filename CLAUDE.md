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

## Page Map

| Page | HTML | CSS | JS |
|---|---|---|---|
| Landing / home | `index.html` | `style.css` | `script.js` |
| Course catalog | `cursos.html` | `cursos.css` | `cursos.js` |
| Lesson player | `aulas.html` | `aulas.css` | `aulas.js` |
| Login | `login.html` | `auth.css` | `auth.js` |
| Register | `registro.html` | `auth.css` | `auth.js` |
| Checkout | `checkout.html` | `checkout.css` | `checkout.js` |
| My account | `conta.html` | `conta.css` | `conta.js` |
| My courses | `meus-cursos.html` | `meus-cursos.css` | `meus-cursos.js` |
| Search | `pesquisar.html` | `pesquisar.css` | `pesquisar.js` |
| Community | `comunidade.html` | `comunidade.css` | `comunidade.js` |
| Admin panel | `admin/index.html` | `admin/admin.css` | `admin/admin.js` |
| Shared header | — | `tk-header.css` | `tk-header.js` |

## Architecture

### Data layer — `database.js`

All pages load `database.js`, which exposes `window.TikuraDB`. This is the single data access layer:

- `TikuraDB.getClient()` — returns a singleton Supabase client, or `null` if config is missing
- `TikuraDB.getCourses()` — fetches published courses; falls back to `fallbackCourses` array if Supabase is unreachable
- `TikuraDB.getCourseWithLessons(slug)` — fetches course + modules + lessons + per-user watch progress
- `TikuraDB.getMyCourses(userId)` — enrollments + completion percentages
- `TikuraDB.requireUser()` — redirects to `login.html` if not authenticated; upserts profile row on every call
- `TikuraDB.createCheckoutOrder(payload)` — inserts into `checkout_orders`
- Community: `getCommunityPosts`, `createCommunityPost`, `setCommunityLike`
- Helpers: `escapeHtml`, `getInitials`, `normalizeCourse`, `timeAgo`

**Fallback pattern**: every async method that hits Supabase silently falls back to local static data when the client is null or the query errors. Pages are fully functional without a live database.

### Supabase config — `supabase-config.js`

Exposes credentials on `window.TIKURA_SUPABASE = { url, anonKey }`. Safe to commit (public anon key). The `.env` / `.env.example` files are reference-only and are not read by any JS.

### Shared header — `tk-header.js`

Authenticated pages (cursos, aulas, conta, meus-cursos, pesquisar, comunidade) include `tk-header.css` and `tk-header.js`. The script:
1. Marks the active nav link based on `location.pathname`
2. Queries `profiles.avatar_url` from Supabase and displays the photo, or falls back to initials

`login.html` intentionally does **not** include the shared header.

### Auth flow — `auth.js`

Wires up forms identified by `data-auth-form="login"` and `data-auth-form="register"`. Status messages use `[data-auth-status]` elements (hidden by default). On login success → redirects to `cursos.html`; on register success → prompts email confirmation.

### Lesson player — `aulas.html`

Reads `?curso=<slug>` from the URL. Calls `TikuraDB.getCourseWithLessons(slug)` to render modules/lessons. Calls `TikuraDB.markLessonWatched(lessonId)` on playback. Lessons with IDs starting with `local-` are fallback data and do not write to Supabase.

### Admin panel — `admin/index.html`

Requires `profiles.role = 'admin'`. Manages courses (CRUD), orders, and webhook configuration. Publishing a course sends a POST to a configurable webhook URL (stored in `localStorage`).

### Carousel scroll — `cursos.html`

The `.course-track` uses `transform: translateX` driven by JS (not CSS `overflow` scroll). The wrapper `.course-track-wrap` uses `overflow-x: clip` (not `hidden`) so that hover panels can expand downward without being clipped — `overflow-x: clip` does not force `overflow-y` to `auto`, unlike `overflow-x: hidden/auto/scroll`.

### Avatar upload — `conta.js`

Uses Cropper.js (CDN) for in-browser crop before upload. Uploads to Supabase Storage bucket `avatars` at path `{userId}/avatar.jpg`. Saves the **clean URL** (without cache-buster) to `profiles.avatar_url`; adds `?t=Date.now()` only at display time.

## CSS Naming Conventions

- `index.html` / `style.css` → `tk-` prefix (e.g. `tk-hero-fw`, `tk-btn-red`)
- `cursos.html` / `cursos.css` → `course-` prefix
- `login.html` / `registro.html` / `auth.css` → `auth-` prefix
- `checkout.html` / `checkout.css` → `checkout-` prefix
- `conta.html` / `conta.css` → `conta-` prefix
- `admin/` → `adm-` prefix
- Shared header → `tkh-` prefix

## Database Schema (Supabase)

Key tables: `profiles`, `courses`, `course_modules`, `lessons`, `enrollments`, `lesson_progress`, `checkout_orders`, `community_posts`, `community_likes`.

The `profiles` table requires an `avatar_url text` column that is **not in the base schema file** — add it manually:
```sql
alter table public.profiles add column if not exists avatar_url text;
```

Run `supabase-schema.sql` in the Supabase SQL Editor to bootstrap the schema and seed courses. All tables have RLS enabled; see the schema file for policies.
