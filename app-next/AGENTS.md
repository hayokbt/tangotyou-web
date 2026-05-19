<!-- BEGIN:nextjs-agent-rules -->
# Next.js frontend notes for this workspace

This frontend is built with Next.js 16 using the `app` router and client-side interactions in `app-next/src/app`.

Key points:

- The app uses local API routes under `app-next/src/app/api` to proxy requests to the Go backend at `http://127.0.0.1:8080`.
- Keep cookie handling intact: the API routes propagate `Set-Cookie` and forward `Cookie` headers.
- The frontend uses `credentials: "include"` and `axios` with `withCredentials: true`.
- `@/*` path alias maps to `app-next/src/*`.
- UI pages currently include:
  - `/` home page
  - `/account` login/new-account page
  - `/booklist` book management page

When modifying the frontend, avoid breaking the proxy pattern and session flows unless the backend is updated in sync.

Read the official Next.js docs in `node_modules/next/dist/docs/` if you need API details.
<!-- END:nextjs-agent-rules -->
