# LeadFlow API

REST API for LeadFlow, a lightweight lead management tool. Sales reps track leads, log every discussion, and set follow-up reminders.

**Stack:** Node.js, Express 4, PostgreSQL (Supabase), Prisma 6, Zod 3

## Features

- Lead CRUD with status tracking (New, Contacted, Qualified, Proposal Sent, Won, Lost)
- Discussion history per lead, newest first
- Saving a discussion with a follow-up date updates the lead in one transaction
- Today's follow-ups and overdue flags computed server-side, using the client's timezone window
- Filter by status, search by name (case-insensitive)
- Request validation with Zod and consistent JSON error responses
- Seed script that uses the API itself

## Prerequisites

- Node.js 18 or newer (20 recommended)
- A PostgreSQL database: a Supabase project, or local Postgres


## Setup

### 1. Install dependencies

```bash
cd backend
bun install
```

### 2. Configure environment

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `PORT` | API port. Default `4000` |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Allowed CORS origin. Default `http://localhost:3000` |
| `DATABASE_URL` | Connection string used by the app at runtime |

**Supabase:** open your project, click **Connect**, then **ORMs**, then **Prisma**, and copy both strings.

- `DATABASE_URL` is the pooled connection 

### 3. Run migrations

```bash
npx prisma migrate dev
```

### 4. Start the server

```bash
npm run dev
```

The API runs at `http://localhost:4000`. Check `http://localhost:4000/health`.

### 5. Seed sample data (optional)

With the server running, in a second terminal:

```bash
npm run seed
```

The script creates 7 leads with discussions by calling the API. It skips leads that already exist by name, so it is safe to run again. To target another URL: `API_URL=https://your-api.example.com npm run seed`.


## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start with nodemon (auto reload) |
| `npm start` | Start in production mode |
| `npm run seed` | Create sample leads through the API |

## API reference

Base URL: `http://localhost:4000`

Success responses are `{ "data": ... }`. Errors are `{ "error": { "message": "...", "details": [...] } }`.

### Statuses

`NEW`, `CONTACTED`, `QUALIFIED`, `PROPOSAL_SENT`, `WON`, `LOST`

### `GET /health`

Returns `200 { "status": "ok" }`.

### `GET /api/leads`

List leads, with today's follow-ups first, then overdue, then everything else by latest activity.

| Query param | Required | Description |
|---|---|---|
| `status` | no | Filter by one status |
| `search` | no | Case-insensitive match on the lead name |
| `dayStart` | no | ISO 8601 start of the client's "today" |
| `dayEnd` | no | ISO 8601 end of the client's "today" |

If `dayStart` and `dayEnd` are omitted, the server uses the current UTC day.

Each lead includes computed fields:

```json
{
  "id": "6f1c...",
  "name": "Aarav Sharma",
  "company": "Sharma Textiles",
  "phone": "+91 98765 43210",
  "status": "CONTACTED",
  "followUpAt": "2026-10-14T12:30:00.000Z",
  "createdAt": "...",
  "updatedAt": "...",
  "lastNote": "Sent the brochure. Asked me to call back this afternoon.",
  "lastDiscussionAt": "...",
  "isFollowUpToday": true,
  "isOverdue": false
}
```

Won and Lost leads never have `isFollowUpToday` or `isOverdue` set.

### `POST /api/leads`

```json
{ "name": "Aarav Sharma", "company": "Sharma Textiles", "phone": "+91 98765 43210", "status": "NEW" }
```

Only `name` is required. `status` defaults to `NEW`. Returns `201` with the lead.

### `PATCH /api/leads/:id`

Update any of `name`, `company`, `phone`, `status`, `followUpAt` (ISO 8601 or `null`). At least one field is required. Returns `200` with the lead.

### `GET /api/leads/:id/discussions`

Returns `200` with the discussion list, newest first.

### `POST /api/leads/:id/discussions`

```json
{ "note": "Called, wants a demo", "followUpAt": "2026-10-15T10:00:00+05:30" }
```

`note` is required (max 2000 characters). `followUpAt` is optional. When given, the lead's `followUpAt` is updated in the same transaction. When omitted, the lead's existing follow-up is left alone.

Returns `201`:

```json
{ "data": { "discussion": { "...": "..." }, "lead": { "...": "..." } } }
```

### Status codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation failed or malformed JSON |
| 404 | Lead or route not found |
| 500 | Unexpected server error |

Example validation error:

```json
{
  "error": {
    "message": "Validation failed",
    "details": [{ "field": "name", "message": "Name is required" }]
  }
}
```

## Project structure

```
backend/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── scripts/
│   └── seed-via-api.js
└── src/
    ├── config/        env and Prisma client
    ├── controllers/   HTTP layer, no business logic
    ├── middleware/    validation, 404, error handler
    ├── routes/        route definitions
    ├── services/      business logic and database access
    ├── utils/         AppError, asyncHandler
    ├── validators/    Zod schemas
    ├── app.js         Express app
    └── server.js      entry point and graceful shutdown
```

## Design decisions

- **Layers:** routes, then validation, then controllers, then services. Controllers stay thin and the services own the logic and the database access.
- **Timezones:** timestamps are stored in UTC. The client sends its local midnight-to-midnight window so "today" matches what the user sees.
- **Follow-up consistency:** a discussion and the lead's follow-up update run in one `prisma.$transaction`, so they cannot drift apart.
- **Closed leads:** Won and Lost leads never get follow-up flags, so closed deals do not nag.
- **Errors:** a central error handler turns Zod errors, malformed JSON and Prisma "not found" errors into consistent JSON. Internal error messages are hidden in production.
- **Indexes:** `status`, `followUpAt`, `name` on leads, and `(leadId, createdAt)` on discussions.
