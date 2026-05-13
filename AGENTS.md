# Repository Guidelines

## Project Structure & Module Organization

This is a static, no-build HTML/CSS/JavaScript site for Tikura Flix. There is no framework, bundler, or package manager configuration.

- `index.html`, `style.css`, `script.js`: landing page and hero/course carousel behavior.
- `cursos.html`, `cursos.css`, `cursos.js`: course catalog page and horizontal scrolling controls.
- `login.html`, `registro.html`, `auth.css`, `auth.js`: authentication pages and shared Supabase auth logic.
- `checkout.html`, `checkout.css`: checkout page.
- `supabase-config.js`: browser-loaded public Supabase URL and anon key.
- `.env` and `.env.example`: reference files only; they are not consumed by the current frontend code.

## Build, Test, and Development Commands

No build step is required. Open any `.html` file directly in a browser, or run a simple static server from the repository root:

```bash
npx serve .
python -m http.server 8080
```

Use a server when validating browser routing, CDN loading, or auth flows. There are currently no `npm test`, lint, or build commands.

## Coding Style & Naming Conventions

Keep changes in plain HTML, CSS, and JavaScript. Use 4-space indentation in JavaScript where existing files use it, and avoid adding tooling unless the project explicitly adopts it.

Follow the page-specific CSS prefixes to prevent selector collisions:

- `tk-` for `index.html` / `style.css`
- `course-` for `cursos.html` / `cursos.css`
- `auth-` for login/register styles in `auth.css`
- `checkout-` for checkout styles in `checkout.css`

Preserve existing data-attribute hooks such as `data-auth-form`, `data-auth-status`, and `data-scroll`; JavaScript relies on these selectors.

## Testing Guidelines

There is no automated test suite. Validate changes manually in the browser at the relevant page widths. For auth work, test both success and error states on `login.html` and `registro.html`. For carousel or slideshow changes, verify button controls and timed transitions.

## Commit & Pull Request Guidelines

This checkout does not include Git history, so no project-specific commit convention can be inferred. Use short, imperative commit subjects such as `Update auth error handling` or `Refine course catalog layout`.

Pull requests should describe the user-facing change, list pages touched, note manual browser checks, and include screenshots for visual changes.

## Security & Configuration Tips

The Supabase anon key in `supabase-config.js` is public client configuration. Do not add service-role keys, private credentials, or production secrets to frontend files.
