# LendWise deployment guide

Deploy the **React (TanStack Start) frontend** to **Vercel** and the **FastAPI backend** to **Render**.

```
┌─────────────┐      HTTPS + CORS       ┌──────────────────┐
│   Vercel    │ ──────────────────────► │  Render (API)    │
│  Frontend   │   VITE_API_BASE_URL     │  FastAPI :8000   │
└─────────────┘                         └────────┬─────────┘
                                                 │
                                                 ▼
                                        ┌──────────────────┐
                                        │ Supabase (opt.)  │
                                        │ Gemini API       │
                                        └──────────────────┘
```

---

## Prerequisites

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend hosting |
| [Render](https://render.com) | Backend hosting |
| [Google AI Studio](https://aistudio.google.com/apikey) | Gemini API key |
| [Supabase](https://supabase.com) | Optional database |

---

## 1. Backend — Render

### Option A: Blueprint (`render.yaml`)

1. Push this repo to GitHub.
2. Render → **New** → **Blueprint** → select the repo.
3. Render reads [`render.yaml`](./render.yaml) and creates `lendwise-api`.
4. Set secret env vars in the dashboard (see below).

### Option B: Manual Web Service

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |

### Backend environment variables (Render)

| Variable | Required | Example |
|----------|----------|---------|
| `ENVIRONMENT` | Yes | `production` |
| `DEBUG` | Yes | `false` |
| `CORS_ORIGINS` | Yes | `https://your-app.vercel.app` |
| `GEMINI_API_KEY` | Yes | `AIza...` |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` |
| `SUPABASE_URL` | Optional | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | service role key |
| `DEFAULT_USER_EMAIL` | No | `demo@lendwise.local` |
| `UPLOAD_DIR` | No | `uploads` |
| `MAX_UPLOAD_MB` | No | `10` |

**CORS (production):** Set `CORS_ORIGINS` to your Vercel URL(s), comma-separated, **no trailing slashes**:

```env
CORS_ORIGINS=https://lendwise.vercel.app,https://lendwise-git-main-yourteam.vercel.app
```

Render sets `PORT` automatically — do not hardcode it.

### Health check (Render)

Render pings **`GET /health`** and expects HTTP **200** with:

```json
{
  "status": "ok",
  "app_name": "LendWise API",
  "debug": false,
  "environment": "production",
  "supabase_connected": true,
  "gemini_configured": true,
  "version": "0.1.0"
}
```

Validate after deploy:

```powershell
.\scripts\verify-health.ps1 -BaseUrl "https://lendwise-api.onrender.com"
```

```bash
./scripts/verify-health.sh https://lendwise-api.onrender.com
```

### Files (backend)

| File | Purpose |
|------|---------|
| [`render.yaml`](./render.yaml) | Render Blueprint |
| [`backend/Procfile`](./backend/Procfile) | Process start command |
| [`backend/runtime.txt`](./backend/runtime.txt) | Python version pin |
| [`backend/.env.example`](./backend/.env.example) | Env template |

> **Note:** Render free tier uses ephemeral disk — uploaded PDFs in `uploads/` may not persist across restarts. Use Supabase for durable data; consider Render persistent disk or object storage for production files.

---

## 2. Frontend — Vercel

### Connect repository

1. Vercel → **Add New** → **Project** → import Git repo.
2. **Root Directory:** repository root (not `backend`).
3. **Framework Preset:** TanStack Start (auto-detected).
4. **Node.js Version:** 22.x (recommended in Project Settings).

### Build configuration

| Setting | Value |
|---------|--------|
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output** | Handled by Nitro → `.vercel/output` |

[`vercel.json`](./vercel.json) sets `framework: tanstack-start`.

When `VERCEL=1`, [`vite.config.ts`](./vite.config.ts) enables the **Nitro** plugin for Vercel-compatible output.

### Frontend environment variables (Vercel)

| Variable | Required | Example |
|----------|----------|---------|
| `VITE_API_BASE_URL` | Yes | `https://lendwise-api.onrender.com` |

Set for **Production**, **Preview**, and **Development** as needed.

Copy [`.env.example`](./.env.example) to `.env.local` for local dev:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### Deploy

```bash
git push origin main
```

Or:

```bash
npx vercel --prod
```

### Post-deploy checklist

1. Open the Vercel URL — app loads.
2. **Process Application** — upload PDF (hits Render API).
3. **Loan Assistant** — chat works (`GEMINI_API_KEY` on Render).
4. Browser DevTools → Network — no CORS errors.

---

## 3. Local development

**Terminal 1 — backend:**

```powershell
cd backend
copy .env.example .env
# Edit .env with keys
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

**Terminal 2 — frontend:**

```powershell
cd ..
copy .env.example .env.local
npm install
npm run dev
```

Verify health:

```powershell
.\scripts\verify-health.ps1
```

---

## 4. Configuration reference

### Production CORS flow

1. Deploy frontend → copy Vercel URL.
2. Set Render `CORS_ORIGINS` to that URL (and preview URLs if needed).
3. Redeploy / restart Render service.
4. Set Vercel `VITE_API_BASE_URL` to Render URL.
5. Redeploy Vercel.

### Security checklist

- [ ] `DEBUG=false` on Render
- [ ] `ENVIRONMENT=production` on Render
- [ ] CORS lists only your Vercel domains (not `*`)
- [ ] `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` only on Render (never Vercel)
- [ ] Service role key not committed to git

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error in browser | Add exact Vercel origin to Render `CORS_ORIGINS` |
| `502` on chat/extract | Set `GEMINI_API_KEY` on Render |
| Vercel build fails | Use Node 22+; ensure `nitro` is installed |
| Render health check fails | Confirm `healthCheckPath` is `/health`; run verify script |
| API URL wrong on Vercel | Set `VITE_API_BASE_URL` and redeploy |
| Supabase not saving | Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on Render |

---

## 6. File index

| Path | Platform |
|------|----------|
| `vercel.json` | Vercel |
| `vite.config.ts` | Vercel (Nitro when `VERCEL=1`) |
| `.env.example` | Frontend env template |
| `render.yaml` | Render Blueprint |
| `backend/Procfile` | Render / Heroku-style |
| `backend/runtime.txt` | Python version |
| `backend/.env.example` | Backend env template |
| `scripts/verify-health.ps1` | Health validation (Windows) |
| `scripts/verify-health.sh` | Health validation (Unix) |
