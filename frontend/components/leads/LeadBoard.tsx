'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/layout/Header';
import { useDebounce } from '@/hooks/useDebounce';
import { useLeads } from '@/hooks/useLeads';
import { STATUS_ORDER } from '@/lib/constants';
import type { Lead, StatusFilterValue } from '@/types/lead';
import AddLeadDialog from './AddLeadDialog';
import LeadDialog from './LeadDialog';
import LeadList from './LeadList';
import SearchBar from './SearchBar';
import StatsBar from './StatsBar';
import StatusFilter from './StatusFilter';

export default function LeadBoard() {
  const [status, setStatus] = useState<StatusFilterValue>('ALL');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);

  const { leads, loading, error, refetch } = useLeads(search);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const counts = useMemo(() => {
    const c = { ALL: leads.length } as Record<StatusFilterValue, number>;
    for (const s of STATUS_ORDER) c[s] = 0;
    for (const l of leads) c[l.status] += 1;
    return c;
  }, [leads]);

  // Server order (today, overdue, rest) is preserved by filter()
  const visible = useMemo(
    () => (status === 'ALL' ? leads : leads.filter((l) => l.status === status)),
    [leads, status]
  );

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72 bg-gradient-to-b from-indigo-50 via-slate-50 to-transparent" />

      <Header onAddLead={() => setAddOpen(true)} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">Your pipeline</h2>
          <p className="mt-1 text-sm text-slate-500">
            Track every conversation and stay on top of your follow-ups.
          </p>
        </div>

        <StatsBar leads={leads} loading={loading} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusFilter value={status} counts={counts} onChange={setStatus} />
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </div>

        <LeadList
          leads={visible}
          loading={loading}
          error={error}
          hasFilters={status !== 'ALL' || search.trim() !== ''}
          onSelect={setSelectedLead}
          onRetry={refetch}
          onAdd={() => setAddOpen(true)}
        />
      </main>

      <AddLeadDialog open={addOpen} onOpenChange={setAddOpen} onCreated={refetch} />

      {selectedLead && (
        <LeadDialog
          key={selectedLead.id}
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onChanged={refetch}
        />
      )}
    </div>
  );
}