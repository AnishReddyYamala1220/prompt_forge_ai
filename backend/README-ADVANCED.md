# PromptForge AI — Advanced Agent Upgrade

This folder contains replacement backend files for the starter project.

## Windows PowerShell setup

From the project root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and add your Gemini API key. Never share or commit this file.

Start backend:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Test health:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
```

Open API docs:

http://127.0.0.1:8000/docs

## Deploy the full app to Vercel

The root Vercel configuration builds the Vite frontend and serves it from the
FastAPI app. Run history uses SQLite locally and requires PostgreSQL on Vercel.

1. Create a Vercel project with the repository root as its Root Directory.
2. Connect a PostgreSQL provider from the Vercel Marketplace (for example Neon)
   and make sure it provides `DATABASE_URL`.
3. Add `GEMINI_API_KEY` and, optionally, `GEMINI_FALLBACK_API_KEY` in Vercel
   Project Settings → Environment Variables. Do not commit or share these keys.
4. Deploy from the project root with the Vercel CLI or a connected Git repository.

The Vercel build command is configured in the root `vercel.json`. The app uses
the same origin for frontend and API requests, so no production API URL setting
is needed. Vercel deployments fail to initialize the database if `DATABASE_URL`
is missing; SQLite storage is not persistent on serverless deployments.

## Test a workflow from PowerShell

```powershell
$body = @{
  task = "Create a practical plan to reduce food waste in a college hostel. Include a low-cost pilot, steps, stakeholders, risks and measurable indicators."
} | ConvertTo-Json

Invoke-RestMethod -Uri http://127.0.0.1:8000/api/run -Method Post -ContentType "application/json" -Body $body
```

## Agent flow

1. Planner Agent creates a structured plan.
2. Tool Selection Agent selects only from a restricted local tool registry.
3. Local tools provide text statistics or safe arithmetic.
4. Prompt Architect creates three strategies.
5. Execution Agents generate answers concurrently.
6. Critic Agent scores each candidate against five criteria.
7. Refinement Agent performs up to `MAX_REFINEMENT_ROUNDS` bounded improvement cycles.
8. Critic re-scores each refinement; lower-scoring revisions are rejected.
9. Verification Agent checks consistency, task fit, constraints and safety.
10. Master Orchestrator returns an execution trace.

## Environment variables

- `GEMINI_API_KEY`: required API key
- `GEMINI_FALLBACK_API_KEY`: optional fallback key, used after primary quota or transient server errors; configure a key with independent available quota
- `GEMINI_MODEL`: model name available to your API key
- `GEMINI_FALLBACK_MODEL`: model used with the fallback key; defaults to `gemini-3.5-flash-lite`
- `MAX_REFINEMENT_ROUNDS`: 0 to 3; default 2
- `MIN_ACCEPTABLE_SCORE`: score threshold 0 to 10; default 8
- `DATABASE_PATH`: SQLite path
- `DATABASE_URL`: PostgreSQL connection string; required on Vercel

## Important limitations

- Model-generated scores are estimates, not objective truth.
- Verification is model-assisted and does not browse the web.
- The local tool registry does not execute shell commands, arbitrary Python, browser actions or external side effects.
- Check important outputs yourself before relying on them.
- Multiple model calls can use API quota and may incur charges.
