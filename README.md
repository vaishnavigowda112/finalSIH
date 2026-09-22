# KisanMandi Maharashtra AI

This project contains both the frontend and backend in one repository, but they are clearly separated by responsibility:

- Frontend: Vite + React app in `src/` and the root HTML/Vite config
- Backend: Express API and data services in `server.ts` and `server/`

## Local development

Prerequisites:
- Node.js 18+

Install dependencies:

```bash
npm install
```

Run the backend locally:

```bash
npm run dev:backend
```

Run the Vite frontend locally:

```bash
npm run dev:frontend
```

The frontend uses `/api/*` routes and proxies them to the backend on port 3000 in local development.

## Deployment model

Recommended production split:

- Frontend: deploy on Vercel
- Backend: deploy on Render

### Frontend env

Create a Vercel environment variable:

```env
VITE_API_BASE_URL=https://your-render-service-url
```

### Backend env

Set these in Render:

```env
NODE_ENV=production
PORT=10000
GEMINI_API_KEY=
DATA_GOV_IN_API_KEY=
AGMARKNET_API_KEY=
APP_URL=https://your-render-service-url
```

## Files for deployment

- `vercel.json` - Vercel frontend routing and API rewrite config
- `render.yaml` - Render backend service config
- `.env.example` - environment variable template

## Important note

The app can still run without API keys because it includes fallback market data and default AI responses. For real live market data and Gemini-powered AI recommendations, add valid keys in your deployment environment.
