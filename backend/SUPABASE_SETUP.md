# Supabase setup for LendWise API

This backend persists **users**, **loan applications** (with eligibility results), **extracted documents**, and **chat history** to Supabase PostgreSQL using the repository pattern.

## 1. Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → choose org, name, database password, region
3. Wait for the project to finish provisioning

## 2. Run the database schema

1. Open **SQL Editor** in the Supabase dashboard
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql)
3. Click **Run**

This creates:

| Table | Purpose |
|-------|---------|
| `users` | Applicants / demo users |
| `loan_applications` | Income, credit, employment + **eligibility results** |
| `extracted_documents` | PDF extraction fields + `source` (`gemini` / `fallback_mock`) |
| `chat_history` | User and assistant messages grouped by `session_id` |

## 3. Configure environment variables

Copy `backend/.env.example` to `backend/.env` and set:

```env
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DEFAULT_USER_EMAIL=demo@lendwise.local
```

Where to find values:

- **Project URL** → Settings → API → Project URL
- **Service role key** → Settings → API → `service_role` (secret)

> **Security:** Use the **service role** key only on the server. Never commit it or ship it to the browser. The frontend should use the `anon` key only if you add Supabase client-side later.

## 4. Install Python dependencies

From the `backend/` folder:

```powershell
cd backend
.venv\Scripts\activate
pip install -r requirements.txt
```

## 5. Start the API

```powershell
uvicorn app.main:app --reload
```

If Supabase env vars are missing, the API still runs but **skips persistence** (same as before).

## 6. Verify persistence

### Eligibility → `loan_applications`

```powershell
curl -X POST "http://127.0.0.1:8000/eligibility" `
  -H "Content-Type: application/json" `
  -d '{"income": 80000, "credit_score": 780, "employment_type": "salaried"}'
```

Check **Table Editor** → `loan_applications` for `approval_status`, `risk_score`, `reason`.

### Extraction → `extracted_documents`

```powershell
curl -X POST "http://127.0.0.1:8000/extract-document" `
  -F "file=@C:\path\to\document.pdf"
```

Check `extracted_documents` for `name`, `dob`, `pan`, `aadhaar`, `address`, `source`.

### Chat → `chat_history`

```powershell
curl -X POST "http://127.0.0.1:8000/chat" `
  -H "Content-Type: application/json" `
  -d '{"message": "What is a good credit score for a home loan?"}'
```

Response includes `session_id`. Table `chat_history` should have two rows (user + assistant).

Optional body fields:

```json
{
  "message": "Tell me more",
  "session_id": "uuid-from-previous-response",
  "user_id": "optional-user-uuid"
}
```

Optional header: `X-User-Id: <uuid>` on `/eligibility` and `/extract-document`.

## Architecture

```
Routes → storage_service (async) → Repositories → Supabase PostgREST
```

| Layer | Location |
|-------|----------|
| SQL schema | `supabase/schema.sql` |
| DB client | `app/db/client.py` |
| Record models | `app/schemas/database.py` |
| Repositories | `app/repositories/*.py` |
| Persistence orchestration | `app/services/storage_service.py` |

Each repository implements **create**, **get_by_id**, **list_all**, **update**, **delete**, plus domain queries (`list_by_user`, `list_by_session`, etc.).

## Demo user

When no `X-User-Id` / `user_id` is sent, rows are linked to a demo user created from `DEFAULT_USER_EMAIL` (`demo@lendwise.local` by default).

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Supabase is not configured` | Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`, restart uvicorn |
| RLS permission errors | Backend uses service role (bypasses RLS). Do not use the `anon` key here |
| Table does not exist | Re-run `supabase/schema.sql` in SQL Editor |
| Invalid UUID in header | Send a valid UUID or omit the header |
