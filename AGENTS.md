# Workspace AI agent guidance

This repository contains two main applications in the same workspace:

- `app-next/`: frontend built with Next.js 16 (`app` router, React 19, TypeScript, Tailwind CSS)
- `app-go/`: backend built with Go 1.26 using SQLite and Gorilla sessions

## Key facts

- The frontend proxies requests through local Next.js API routes under `app-next/src/app/api`.
- Those API routes forward requests to the Go backend at `http://127.0.0.1:8080` and preserve cookies.
- Backend endpoints are exposed by `app-go/main.go` and include:
  - `POST /account/create`
  - `POST /account/login`
  - `POST /account/logout`
  - `GET /account/me`
  - `GET|POST|DELETE /account/books`

## Recommended commands

- Frontend dev: `cd app-next && npm install && npm run dev`
- Frontend build: `cd app-next && npm run build`
- Frontend lint: `cd app-next && npm run lint`
- Backend run: `cd app-go && go run main.go`

## What agents should know

- `app-next` uses client components for login, logout, account creation, and book CRUD.
- Client code uses `axios` for `/api/account/login` and `/api/account/create`, and native `fetch` for `/api/book`, `/api/account/me`, and `/api/account/logout`.
- `app-next/src/data/access.ts` contains the backend origin configuration used by API route proxies.
- Use `credentials: "include"` or `withCredentials: true` when forwarding cookies between browser and backend.
- `app-next` uses path alias `@/*` for `src/*`.
- The backend stores session values in Gorilla sessions and uses plain SQLite via `modernc.org/sqlite`.

## Guidance for changes

- Preserve the existing login/session flow when modifying the frontend or backend.
- Keep backend endpoint names and request payload shapes compatible with frontend callers unless you update both sides.
- If adding backend behavior, update both `app-go` and the frontend API route proxy layer in `app-next/src/app/api`.
- Prefer small, focused changes over broad refactors in this workspace.

## References

- `app-next/AGENTS.md` — frontend-specific Next.js/React guidance
- `app-next/README.md` — Next.js project bootstrap and local dev notes
