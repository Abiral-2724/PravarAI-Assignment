# LeadFlow Web

Single-screen lead management UI for LeadFlow. A sales rep can see all leads, open any lead in a dialog to read the discussion history, log new notes with optional follow-up reminders, change status, and add new leads.

**Stack:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, date-fns, sonner

## Features

- **Lead list** with name, company, status badge, last note and time since last activity
- **Today's follow-ups** pinned in their own section at the top
- **Overdue follow-ups** highlighted in red, in a separate section
- **Status filter** with live counts per status (client-side, instant switching)
- **Search by name** (debounced, server-side)
- **Stats strip:** total leads, today's follow-ups, overdue, won
- **Lead timeline dialog** (no page navigation):
  - Discussion history, newest first
  - Status dropdown that saves immediately
  - Note form with optional follow-up date and time
  - Quick follow-up presets (In 1 hour, Tomorrow 10 AM, In 3 days, Next week)
- **Add lead dialog** with live avatar preview, inline validation, status picker and an "Add another" option
- Loading skeletons, empty states, error states with retry, and toast notifications

## Prerequisites

- Node.js 18.18 or newer (20 recommended)
- The LeadFlow API running (see `backend/README.md`)

## Setup

### 1. Install dependencies

```bash
cd frontend
bun install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the LeadFlow API, no trailing slash. Default `http://localhost:4000` |

The backend's `CLIENT_URL` must match this app's origin (`http://localhost:3000` by default), otherwise the browser blocks requests with a CORS error.

### 3. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production build |
| `npm run lint` | Run ESLint |


## Project structure

```
frontend/
├── app/
│   ├── layout.tsx            root layout, font, toaster
│   └── page.tsx              renders LeadBoard
├── components/
│   ├── ui/                   shadcn/ui primitives
│   ├── layout/
│   │   └── Header.tsx
│   └── leads/
│       ├── LeadBoard.tsx         page state: filter, search, dialogs
│       ├── LeadList.tsx          sections and empty/error states
│       ├── LeadRow.tsx           one lead card
│       ├── LeadAvatar.tsx
│       ├── StatsBar.tsx
│       ├── StatusBadge.tsx
│       ├── StatusFilter.tsx
│       ├── SearchBar.tsx
│       ├── FollowUpChip.tsx      today / overdue / upcoming chip
│       ├── LeadDialog.tsx        timeline dialog
│       ├── DiscussionTimeline.tsx
│       ├── DiscussionForm.tsx
│       └── AddLeadDialog.tsx
├── hooks/
│   ├── useLeads.ts           fetch, abort stale requests, refetch
│   ├── useDiscussions.ts     per-lead history with optimistic prepend
│   └── useDebounce.ts
├── lib/
│   ├── api.ts                typed API client and ApiError
│   ├── constants.ts          status labels and colors
│   ├── date.ts               time ago, today window, presets
│   └── avatar.ts             initials and color
└── types/
    └── lead.ts
```

## Design decisions

- **Server is the source of truth for ordering.** The API returns leads sorted (today, overdue, rest) with `isFollowUpToday` and `isOverdue` flags. The UI only groups them, so the pin logic lives in one place.
- **Timezone-aware "today".** The frontend sends its local midnight-to-midnight window as `dayStart` and `dayEnd`, so "today" matches what the user sees.
- **Refetch after mutations.** After adding a lead, saving a note or changing status, the list refetches. The dialog updates its own timeline instantly from the POST response, so the note appears with no wait.
- **Client-side status filter.** Filtering by status runs over the fetched list, which gives instant switching and per-status counts. Search is still server-side, so counts reflect the current search.


## Demo flow

1. Start the backend and run `npm run seed` there to load sample data.
2. Open the app. Check **Today's follow-ups** and the red **Overdue** section.
3. Filter by status and try the search box.
4. Click a lead, change its status, and add a note with a follow-up preset.
5. Close the dialog and confirm the list reflects the change.
6. Click **Add New Lead** and create one. It appears right away with status **New**.


## Troubleshooting

| Problem | Fix |
|---|---|
| "Cannot reach the server. Is the API running?" | Start the backend and check `NEXT_PUBLIC_API_URL` |
| CORS error in the browser console | Set the backend `CLIENT_URL` to `http://localhost:3000` and restart it |
| Changed `.env.local` but nothing changed | Restart `npm run dev`. 

