# LeadFlow

A single-screen lead management tool, built as a lightweight CRM. A sales rep can track their leads, log every discussion, and set follow-up reminders.

**Stack**

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 4, Zod |
| Database | PostgreSQL (Supabase or local) with Prisma 6 |


## Features

### Core requirements

- **Lead list** showing name, company, status badge, last discussion note and time since last activity
- **Status filter:** New, Contacted, Qualified, Proposal Sent, Won, Lost
- **Today's follow-ups** pinned at the top of the list
- **Lead timeline dialog** (opens in place, no page navigation):
  - Full discussion history, newest first
  - Form to add a note with an optional follow-up date and time
  - Saving a follow-up updates the lead and the list immediately
  - Status can be changed from the dialog and persists
- **Add new lead:** name required, company and phone optional, status defaults to New

### Bonus features

- **Search by name** (debounced, case-insensitive)
- **Overdue follow-ups highlighted in red**, in their own section
- **Status filters with live counts**
- **Seed script** that creates 7 sample leads with discussions by calling the API

### Extras

- Stats strip: total leads, today's follow-ups, overdue, won
- Quick follow-up presets (In 1 hour, Tomorrow 10 AM, In 3 days, Next week)
- `Ctrl/Cmd + Enter` saves a note
- Add Lead dialog with live avatar preview, inline validation, status picker and "Add another"
- Loading skeletons, empty states, error states with retry, toast notifications
- Request validation, consistent JSON errors and correct status codes (200, 201, 400, 404, 500)

## Repository structure

```
leadflow/
├── backend/               Express API, Prisma schema, seed script
│   └── README.md          API reference and backend details
├── frontend/              Next.js app
│   └── README.md          UI structure and design notes


```bash
git clone <your-repo-url>
cd leadflow
```

## Manual setup 

### 1. Backend

```bash
cd backend
bun install
cp .env.example .env
```

Edit `.env` and fill in your database URLs:

| Variable | Description |
|---|---|
| `PORT` | API port. Default `4000` |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Allowed CORS origin. Default `http://localhost:3000` |
| `DATABASE_URL` | Runtime connection string |


**Supabase:** open your project, click **Connect**, then **ORMs**, then **Prisma**, and copy strings. `DATABASE_URL` is the pooled connection (port 5432).


Run migrations and start the API:

```bash
npx prisma migrate dev
bun run dev
```

The API runs at http://localhost:4000.

### 2. Seed sample data (optional)

With the API running, in a second terminal:

```bash
cd backend
bun run seed
```

The script calls the API to create 7 leads with discussions. It skips leads that already exist, so it is safe to run twice. It creates today's follow-ups, an overdue lead, an upcoming follow-up, a lead with no notes, and Won and Lost leads, so every UI state is visible.

### 3. Frontend

```bash
cd frontend
bun install
cp .env.example .env.local
bun run dev
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the API, no trailing slash. Default `http://localhost:4000` |

Open http://localhost:3000.

## Environment variables summary

| File | Variables |
|---|---|
| `backend/.env` | `PORT`, `NODE_ENV`, `CLIENT_URL`, `DATABASE_URL`, `DIRECT_URL` |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` |


Every variable is listed in the matching `.env.example`.

