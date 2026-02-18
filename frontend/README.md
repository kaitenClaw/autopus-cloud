# OCaaS Frontend (React + Vite)

Web UI for OCaaS agent chat, sessions, and runtime status.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

- `VITE_API_BASE_URL`: Backend base URL (example: `http://localhost:3000`)
- `VITE_CLOUD_HEALTH_URL` (optional): Cloud health endpoint for status bar

> Note: API calls are made to `/api/...` paths (for example `/api/auth/login`).

## Auth UI Flow (No Browser Console Needed)

The app now includes an in-app Auth modal:

- Open via **Login** button in the left profile area, or from empty-state CTA.
- Two tabs:
  - **Login**: email + password
  - **Sign Up**: name (optional) + email + password
- Successful login/sign-up:
  - stores token in `localStorage` key `ocaas_token`
  - updates connected status immediately
  - closes modal
  - reloads agents/sessions in authenticated mode
- **Logout** is available from the left profile area and clears `ocaas_token`.
- Inline form errors are shown for invalid credentials and network failures.

## Build

```bash
npm run build
```
