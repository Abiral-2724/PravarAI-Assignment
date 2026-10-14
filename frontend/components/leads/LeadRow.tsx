'use client';

import { Building2, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLOSED_STATUSES } from '@/lib/constants';
import { timeAgo } from '@/lib/date';
import type { Lead } from '@/types/lead';
import FollowUpChip from './FollowUpChip';
import LeadAvatar from './LeadAvatar';
import StatusBadge from './StatusBadge';

interface Props {
  lead: Lead;
  onSelect: (lead: Lead) => void;
}

export default function LeadRow({ lead, onSelect }: Props) {
  const closed = CLOSED_STATUSES.includes(lead.status);
  const timeLabel = lead.lastDiscussionAt
    ? timeAgo(lead.lastDiscussionAt)
    : `Created ${timeAgo(lead.createdAt)}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(lead)}
      className={cn(
        'group relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition-all',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        'border-slate-200/80 hover:border-indigo-200',
        lead.isFollowUpToday && 'border-indigo-200 bg-indigo-50/40',
        lead.isOverdue && 'border-red-200 bg-red-50/50', // overdue wins over "today"
        closed && 'opacity-75'
      )}
    >
      <span
        className={cn(
          'absolute inset-y-0 left-0 w-1',
          lead.isOverdue ? 'bg-red-500' : lead.isFollowUpToday ? 'bg-indigo-500' : 'bg-transparent'
        )}
      />

      <LeadAvatar name={lead.name} />

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
          <span className="font-semibold text-slate-900">{lead.name}</span>
          {lead.company && (
            <span className="inline-flex items-center gap-1 text-sm text-slate-500">
              <Building2 className="h-3.5 w-3.5" />
              {lead.company}
            </span>
          )}
        </span>

        <span className="mt-1 block truncate text-sm text-slate-600">
          {lead.lastNote ?? <em className="text-slate-400">No discussions yet</em>}
        </span>

        <span className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {timeLabel}
          </span>
          <FollowUpChip followUpAt={lead.followUpAt} status={lead.status} />
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end gap-3">
        <StatusBadge status={lead.status} />
        <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500" />
      </span>
    </button>
  );
}