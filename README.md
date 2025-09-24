# Tessaproxy (Decap CMS GitHub OAuth)

Public URL: https://project-gbxs8.vercel.app

Endpoints:
- /api/auth → redirects to GitHub login
- /api/callback → exchanges code for token (used by Decap)

Environment variables (set in Vercel → Project → Settings → Environment Variables):
- OAUTH_CLIENT_ID
- OAUTH_CLIENT_SECRET

GitHub OAuth App settings (GitHub → Settings → Developer settings → OAuth Apps):
- Homepage URL: https://project-gbxs8.vercel.app
- Authorization callback URL: https://project-gbxs8.vercel.app/api/callback
