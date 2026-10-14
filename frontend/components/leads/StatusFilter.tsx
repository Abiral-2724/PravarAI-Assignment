'use client';

import { cn } from '@/lib/utils';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import type { StatusFilterValue } from '@/types/lead';

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'ALL', label: 'All' },
  ...STATUS_ORDER.map((s) => ({ value: s, label: STATUS_META[s].label })),
];

interface Props {
  value: StatusFilterValue;
  counts: Record<StatusFilterValue, number>;
  onChange: (value: StatusFilterValue) => void;
}

export default function StatusFilter({ value, counts, onChange }: Props) {
  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              active
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
            )}
          >
            {opt.value !== 'ALL' && (
              <span className={cn('h-2 w-2 rounded-full', STATUS_META[opt.value].dot)} />
            )}
            {opt.label}
            <span
              className={cn(
                'rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              )}
            >
              {counts[opt.value]}
            </span>
          </button>
        );
      })}
    </div>
  );
}