# StreamHub — Front-end Streaming Platform

This repository contains a front-end streaming platform demo (`streaming_platform.html`, `.css`, `.js`). It includes:

- A responsive UI (hero, featured content, trending, footer).
- Video player modal and interactive content cards.
- Demo email verification sign-in flow (client-side, insecure — for demonstration only).
- Optional Google Sign-In integration (recommended for production) via Google Identity Services.

Goals in this update:
- Prepare the project for publishing as a static site (GitHub Pages, Netlify, Vercel).
- Add optional production-ready guidance for authentication and email delivery.

### Getting started (local preview)

1. Open `streaming_platform.html` in your browser (double-click the file). For best results serve it with a static server:

```powershell
# If you have npm installed:
npm install -g serve
serve .

# Or using Python 3:
python -m http.server 8000
```

2. Visit `http://localhost:5000` or `http://localhost:8000` depending on the server used.

### Authentication options

1. Google Sign-In (recommended)
   - Create OAuth credentials in Google Cloud Console (OAuth 2.0 Client IDs for 'Web application').
   - Add your origin(s) and redirect URIs.
   - Copy the `Client ID` and put it into the meta tag in `streaming_platform.html`:

```html
<meta name="google-signin-client_id" content="YOUR_CLIENT_ID.apps.googleusercontent.com">
```

   - The front-end will automatically render Google's sign-in button in the auth modal.
   - For secure token verification, validate the ID token on your backend.

2. Email verification flow (demo)
   - The demo flow generates a 6-digit code in the browser and displays it in a temporary notification. This is NOT secure and only for local demos.
   - Production: implement a backend endpoint that sends the code to users via SMTP or a transactional email provider (SendGrid, Mailgun, SES). Then verify the code server-side.

### Publishing

- GitHub Pages
  - Push this repository to GitHub and enable GitHub Pages from repository settings (branch `main` or `gh-pages`).

- Netlify / Vercel
  - Drag and drop the site folder or connect the repo; these platforms will detect static sites automatically.

### Backend (optional)

If you want server-side email delivery or session management, implement a small backend:

- Node/Express example (not included by default):
  - Endpoint to `POST /send-code` to send verification codes via `nodemailer` or an email API.
  - Endpoint to `POST /verify-code` to validate codes and create a server session.

Security notes
- Never store secrets or API keys in client-side code.
- Use HttpOnly cookies for sessions when possible.
- Validate ID tokens or authorization codes on the server.

---

If you want, I can:
- Scaffold a minimal Node/Express backend with `/send-code` and `/verify-code` routes using `nodemailer`.
- Add a small CI workflow to build and deploy to GitHub Pages.
- Wire up full Google OAuth server-side verification example.

Which of these would you like me to do next?