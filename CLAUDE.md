# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # Install dependencies
npm run dev       # Start Vite dev server
npm run build     # Production build (--mode production)
npm run preview   # Preview production build
```

No test or lint commands are configured.

The dev server proxies `/api` requests to `http://localhost:8001` (the backend). The backend repo is at https://github.com/Qusar0/detective-freelance.

## Architecture

Vue 3 SPA built with Vite. An investigative search platform ("Detective") that lets authenticated users query person/company data via multiple search methods (phone, email, Telegram, company name, IRBIS database).

### State Management

**Hybrid approach** — no centralized Vuex store is actively used:

- **`src/use/index.js`** — primary global state via Vue 3 reactive refs. Contains auth status (`isAuthorized`), user info, UI toggles, and the `keys_list` object for keyword/filter management. Import from here for shared state.
- **`src/store/AuthModule.js`** — Vuex module defined but not actively used in practice.

### Routing & Auth

`src/router/router.js` defines all routes. A `beforeEach` guard calls `/api/users/is_authenticated` on every navigation — unauthenticated users go to `/login`, authenticated users trying to access `/login` are redirected to `/`.

### Real-time Notifications

`App.vue` establishes an SSE (Server-Sent Events) connection on mount. The channel ID is `btoa(user_name + user_created)`. Events update query task status and user balance. Auto-reconnects on disconnect.

### API Calls

Two patterns coexist:
- Direct `fetch()` calls in components (most common) — always `credentials: 'include'`
- Axios instances in `src/api/` for the auth flow

401 responses redirect to `/login`.

### Component Conventions

All Vue files use a `V` prefix (e.g., `VMain.vue`, `VFindByNumber.vue`, `VHeader.vue`).

Pages live in `src/pages/`, reusable components in `src/components/`. Report display components are in `src/components/Reports/` with sub-tabs in `src/components/Reports/tabs/`.

### Prototype Extensions

`src/main.js` and `src/utils/index.js` add custom methods to `Date`, `Number`, and `String` prototypes:
- `Date.prototype.format()` / `.plus()` / `.minus()` — Russian locale date formatting
- `Number/String.prototype.push_space()` — number formatting with spaces

### Composables

`src/composables/useQueryManagement.js` — handles query pagination, fetching, and caching. Used in query result pages.

### Language Support

Available languages are fetched from `/api/queries/available_languages` and stored in `languageOptions` (use/index.js). The user's default language is fetched from `/api/users/default_language`.
