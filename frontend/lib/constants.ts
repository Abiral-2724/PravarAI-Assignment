import type { LeadStatus } from '@/types/lead';

export const STATUS_ORDER: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'WON',
  'LOST',
];

export const STATUS_META: Record<LeadStatus, { label: string; badge: string; dot: string }> = {
  NEW: { label: 'New', badge: 'bg-sky-50 text-sky-700 ring-sky-600/20', dot: 'bg-sky-500' },
  CONTACTED: { label: 'Contacted', badge: 'bg-amber-50 text-amber-700 ring-amber-600/20', dot: 'bg-amber-500' },
  QUALIFIED: { label: 'Qualified', badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20', dot: 'bg-indigo-500' },
  PROPOSAL_SENT: { label: 'Proposal Sent', badge: 'bg-violet-50 text-violet-700 ring-violet-600/20', dot: 'bg-violet-500' },
  WON: { label: 'Won', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20', dot: 'bg-emerald-500' },
  LOST: { label: 'Lost', badge: 'bg-slate-100 text-slate-600 ring-slate-500/20', dot: 'bg-slate-400' },
};

export const CLOSED_STATUSES: LeadStatus[] = ['WON', 'LOST'];