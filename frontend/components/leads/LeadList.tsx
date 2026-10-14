'use client';

import { AlertTriangle, BellRing, Inbox, Plus, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/lead';
import LeadRow from './LeadRow';

interface Props {
  leads: Lead[];
  loading: boolean;
  error: string | null;
  hasFilters: boolean;
  onSelect: (lead: Lead) => void;
  onRetry: () => void;
  onAdd: () => void;
}

function Section({
  title,
  icon: Icon,
  count,
  tone,
  children,
}: {
  title: string;
  icon: LucideIcon;
  count: number;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className={cn('flex items-center gap-2 text-sm font-bold', tone)}>
        <Icon className="h-4 w-4" />
        {title}
        <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
          {count}
        </span>
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export default function LeadList({ leads, loading, error, hasFilters, onSelect, onRetry, onAdd }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[104px] w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  const today = leads.filter((l) => l.isFollowUpToday);
  const overdue = leads.filter((l) => l.isOverdue && !l.isFollowUpToday);
  const rest = leads.filter((l) => !l.isFollowUpToday && !l.isOverdue);

  return (
    <div className="space-y-8">
      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      )}

      {!error && leads.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-4 font-semibold text-slate-800">
            {hasFilters ? 'No leads match your filters' : 'No leads yet'}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {hasFilters
              ? 'Try a different status or clear your search.'
              : 'Add your first lead to start tracking conversations.'}
          </p>
          {!hasFilters && (
            <Button onClick={onAdd} className="mt-5 rounded-xl bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4" />
              Add your first lead
            </Button>
          )}
        </div>
      )}

      {today.length > 0 && (
        <Section title="Today's follow-ups" icon={BellRing} count={today.length} tone="text-indigo-700">
          {today.map((l) => (
            <LeadRow key={l.id} lead={l} onSelect={onSelect} />
          ))}
        </Section>
      )}

      {overdue.length > 0 && (
        <Section title="Overdue" icon={AlertTriangle} count={overdue.length} tone="text-red-600">
          {overdue.map((l) => (
            <LeadRow key={l.id} lead={l} onSelect={onSelect} />
          ))}
        </Section>
      )}

      {rest.length > 0 && (
        <Section title="All leads" icon={Users} count={rest.length} tone="text-slate-700">
          {rest.map((l) => (
            <LeadRow key={l.id} lead={l} onSelect={onSelect} />
          ))}
        </Section>
      )}
    </div>
  );
}