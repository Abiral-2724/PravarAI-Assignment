
const API_URL = (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const inFuture = (ms) => new Date(Date.now() + ms).toISOString();
const inPast = (ms) => new Date(Date.now() - ms).toISOString();


function laterToday(hoursAhead) {
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 0, 0);
  const target = new Date(Date.now() + hoursAhead * HOUR);
  return (target < endOfDay ? target : endOfDay).toISOString();
}


const LEADS = [
  {
    name: 'Aarav Sharma',
    company: 'Sharma Textiles',
    phone: '+91 98765 43210',
    status: 'CONTACTED',
    discussions: [
      { note: 'Intro call. Interested in wealth planning for the family business.' },
      { note: 'Sent the brochure. Asked me to call back this afternoon.', followUpAt: () => laterToday(2) },
    ],
  },
  {
    name: 'Karan Malhotra',
    company: 'Malhotra Estates',
    phone: '+91 97777 88899',
    status: 'CONTACTED',
    discussions: [
      { note: 'Left a voicemail and sent a follow-up email.', followUpAt: () => laterToday(3) },
    ],
  },
  {
    name: 'Priya Nair',
    company: 'Nair & Co',
    phone: '+91 91234 56780',
    status: 'QUALIFIED',
    discussions: [
      { note: 'Discovery call. Budget confirmed, decision maker is the CFO.' },
      { note: 'Shared pricing. Waiting for CFO feedback.', followUpAt: () => inPast(2 * DAY) }, // overdue
    ],
  },
  {
    name: 'Rohan Mehta',
    company: 'Mehta Logistics',
    phone: '+91 99887 77665',
    status: 'PROPOSAL_SENT',
    discussions: [
      { note: 'Requirements workshop completed with the ops team.' },
      { note: 'Proposal v1 sent over email.', followUpAt: () => inFuture(2 * DAY) }, // upcoming
    ],
  },
  {
    name: 'Sneha Kulkarni',
    company: 'Kulkarni Foods',
    status: 'NEW',
    discussions: [], // no discussions yet
  },
  {
    name: 'Vikram Singh',
    company: 'VS Constructions',
    phone: '+91 90000 11122',
    status: 'WON',
    discussions: [
      { note: 'Initial pitch went well. Wants a detailed proposal.' },
      { note: 'Contract signed. Onboarding starts next week.' },
    ],
  },
  {
    name: 'Ananya Iyer',
    company: 'Iyer Pharma',
    phone: '+91 95555 44433',
    status: 'LOST',
    discussions: [
      { note: 'Demo given to the leadership team.' },
      { note: 'Went with a competitor because of pricing.' },
    ],
  },
];

async function call(method, path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = json?.error?.details ? ` ${JSON.stringify(json.error.details)}` : '';
    throw new Error(`${method} ${path} -> ${res.status}: ${json?.error?.message ?? 'Request failed'}${detail}`);
  }
  return json?.data;
}

async function main() {
  console.log(`Seeding via ${API_URL}`);

  try {
    await call('GET', '/health');
  } catch {
    console.error('Cannot reach the API. Start it first (npm run dev) or set API_URL.');
    process.exit(1);
  }

  
  const existing = new Set((await call('GET', '/api/leads')).map((l) => l.name.toLowerCase()));

  let created = 0;
  let skipped = 0;

  for (const { discussions, ...lead } of LEADS) {
    if (existing.has(lead.name.toLowerCase())) {
      console.log(`  skip  ${lead.name} (already exists)`);
      skipped += 1;
      continue;
    }

    const { id } = await call('POST', '/api/leads', lead);

   
    for (const d of discussions) {
      await call('POST', `/api/leads/${id}/discussions`, {
        note: d.note,
        ...(d.followUpAt && { followUpAt: d.followUpAt() }),
      });
    }

    console.log(`  added ${lead.name} (${discussions.length} discussions)`);
    created += 1;
  }

  console.log(`Done. ${created} created, ${skipped} skipped.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});