import { isPast, isToday } from 'date-fns';
import { AlertTriangle, BellRing, CalendarClock } from 'lucide-react';
import { CLOSED_STATUSES } from '@/lib/constants';
import { formatDateTime, formatTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';

interface Props {
  followUpAt: string | null;
  status: LeadStatus;
}

export default function FollowUpChip({ followUpAt, status }: Props) {
  if (!followUpAt || CLOSED_STATUSES.includes(status)) return null;

  const date = new Date(followUpAt);

  let Icon = CalendarClock;
  let tone = 'bg-slate-100 text-slate-600';
  let text = `Follow-up ${formatDateTime(followUpAt)}`;

  if (isPast(date)) {
    Icon = AlertTriangle;
    tone = 'bg-red-100 text-red-700';
    text = `Overdue since ${formatDateTime(followUpAt)}`;
  } else if (isToday(date)) {
    Icon = BellRing;
    tone = 'bg-indigo-100 text-indigo-700';
    text = `Today at ${formatTime(followUpAt)}`;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        tone
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}