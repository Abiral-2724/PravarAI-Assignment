import { AlertTriangle, BellRing, Trophy, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Lead } from '@/types/lead';

export default function StatsBar({ leads, loading }: { leads: Lead[]; loading: boolean }) {
  const items = [
    { label: 'Total leads', value: leads.length, icon: Users, tone: 'bg-indigo-50 text-indigo-600' },
    { label: "Today's follow-ups", value: leads.filter((l) => l.isFollowUpToday).length, icon: BellRing, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Overdue', value: leads.filter((l) => l.isOverdue).length, icon: AlertTriangle, tone: 'bg-rose-50 text-rose-600' },
    { label: 'Won', value: leads.filter((l) => l.status === 'WON').length, icon: Trophy, tone: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map(({ label, value, icon: Icon, tone }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            {loading ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <p className="text-2xl font-bold leading-none tracking-tight">{value}</p>
            )}
            <p className="mt-1 truncate text-xs text-slate-500">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}