const prisma = require('../../prisma');
const AppError = require('../utils/AppError');

const CLOSED_STATUSES = ['WON', 'LOST'];


function resolveDayWindow(dayStart, dayEnd) {
  if (dayStart && dayEnd) {
    return { start: new Date(dayStart), end: new Date(dayEnd) };
  }
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

function toLeadDto(lead, { start, end }, now) {
  const { discussions, ...rest } = lead;
  const last = discussions?.[0] ?? null;
  const open = !CLOSED_STATUSES.includes(lead.status);
  const f = lead.followUpAt;

  return {
    ...rest,
    lastNote: last?.note ?? null,
    lastDiscussionAt: last?.createdAt ?? null,
    isFollowUpToday: Boolean(open && f && f >= start && f < end),
    isOverdue: Boolean(open && f && f < now),
  };
}


function sortLeads(a, b) {
  const rank = (l) => (l.isFollowUpToday ? 0 : l.isOverdue ? 1 : 2);
  const diff = rank(a) - rank(b);
  if (diff !== 0) return diff;

  if (rank(a) < 2) return a.followUpAt - b.followUpAt;

  const aTime = (a.lastDiscussionAt ?? a.createdAt).getTime();
  const bTime = (b.lastDiscussionAt ?? b.createdAt).getTime();
  return bTime - aTime;
}

async function listLeads({ status, search, dayStart, dayEnd }) {
  const where = {};
  if (status) where.status = status;
  if (search) where.name = { contains: search, mode: 'insensitive' };

  const leads = await prisma.lead.findMany({
    where,
    include: {
      discussions: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  const window = resolveDayWindow(dayStart, dayEnd);
  const now = new Date();

  return leads.map((l) => toLeadDto(l, window, now)).sort(sortLeads);
}

async function createLead(data) {
  return prisma.lead.create({ data });
}

async function updateLead(id, data) {
  await assertLeadExists(id);
  const payload = { ...data };
  if (payload.followUpAt) payload.followUpAt = new Date(payload.followUpAt);
  return prisma.lead.update({ where: { id }, data: payload });
}

async function listDiscussions(leadId) {
  await assertLeadExists(leadId);
  return prisma.discussion.findMany({
    where: { leadId },
    orderBy: { createdAt: 'desc' },
  });
}


async function createDiscussion(leadId, { note, followUpAt }) {
  await assertLeadExists(leadId);
  const followUp = followUpAt ? new Date(followUpAt) : null;

  const [discussion, lead] = await prisma.$transaction([
    prisma.discussion.create({
      data: { leadId, note, followUpAt: followUp },
    }),
    prisma.lead.update({
      where: { id: leadId },
      
      data: { followUpAt: followUp ?? undefined },
    }),
  ]);

  return { discussion, lead };
}

async function assertLeadExists(id) {
  const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) throw new AppError(404, 'Lead not found');
}

module.exports = {
  listLeads,
  createLead,
  updateLead,
  listDiscussions,
  createDiscussion,
};