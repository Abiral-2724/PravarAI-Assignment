import { CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDateTime, timeAgo } from '@/lib/date';
import type { Discussion } from '@/types/lead';

interface Props {
  discussions: Discussion[];
  loading: boolean;
  error: string | null;
}

export default function DiscussionTimeline({ discussions, loading, error }: Props) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error}
      </p>
    );
  }

  if (discussions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No discussions yet. Log the first one below.
      </p>
    );
  }

  return (
    <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[5px] before:top-2 before:w-px before:bg-slate-200">
      {discussions.map((d, i) => (
        <li key={d.id} className="relative pl-7">
          <span
            className={cn(
              'absolute left-0 top-1.5 h-[11px] w-[11px] rounded-full ring-4 ring-slate-50',
              i === 0 ? 'bg-indigo-600' : 'bg-slate-300'
            )}
          />
          <p className="flex items-center gap-2 text-xs text-slate-500">
            {formatDateTime(d.createdAt)}
            <span className="text-slate-400">({timeAgo(d.createdAt)})</span>
            {i === 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700">
                Latest
              </span>
            )}
          </p>
          <div className="mt-1.5 rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-800 shadow-sm">
            <p className="whitespace-pre-wrap break-words">{d.note}</p>
            {d.followUpAt && (
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                <CalendarDays className="h-3.5 w-3.5" />
                Follow-up set for {formatDateTime(d.followUpAt)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}