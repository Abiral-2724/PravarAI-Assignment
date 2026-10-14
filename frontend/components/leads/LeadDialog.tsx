'use client';

import { useState } from 'react';
import { Building2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDiscussions } from '@/hooks/useDiscussions';
import { api } from '@/lib/api';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import type { CreateDiscussionResult, Lead, LeadStatus } from '@/types/lead';
import DiscussionForm from './DiscussionForm';
import DiscussionTimeline from './DiscussionTimeline';
import FollowUpChip from './FollowUpChip';
import LeadAvatar from './LeadAvatar';

interface Props {
  lead: Lead;
  onClose: () => void;
  onChanged: () => void; // tells the board to refetch the list
}

export default function LeadDialog({ lead: initialLead, onClose, onChanged }: Props) {
  // Local copy so the dialog stays correct even if a filter hides this lead in the list
  const [lead, setLead] = useState<Lead>(initialLead);
  const [savingStatus, setSavingStatus] = useState(false);
  const { discussions, loading, error, prepend } = useDiscussions(lead.id);

  async function handleStatusChange(value: string) {
    const status = value as LeadStatus;
    if (status === lead.status) return;

    setSavingStatus(true);
    try {
      const updated = await api.updateLead(lead.id, { status });
      setLead((prev) => ({ ...prev, status: updated.status }));
      onChanged();
      toast.success(`Status updated to ${STATUS_META[updated.status].label}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSavingStatus(false);
    }
  }

  function handleSaved({ discussion, lead: updated }: CreateDiscussionResult) {
    prepend(discussion);
    setLead((prev) => ({ ...prev, followUpAt: updated.followUpAt }));
    onChanged();
  }

  const showFollowUp = lead.followUpAt && lead.status !== 'WON' && lead.status !== 'LOST';

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-2xl">
        <div className="flex flex-wrap items-start gap-4 border-b bg-gradient-to-br from-indigo-50/70 via-white to-white p-6 pr-14">
          <LeadAvatar name={lead.name} size="lg" />

          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-xl font-bold">{lead.name}</DialogTitle>
            <DialogDescription className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              {lead.company && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  {lead.company}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                {lead.phone ?? 'No phone number'}
              </span>
            </DialogDescription>
          </div>

          <Select value={lead.status} onValueChange={handleStatusChange} disabled={savingStatus}>
            <SelectTrigger className="w-44 rounded-xl bg-white" aria-label="Lead status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
                    {STATUS_META[s].label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showFollowUp && (
          <div className="flex items-center gap-2 border-b bg-white px-6 py-3 text-sm text-slate-500">
            Next follow-up
            <FollowUpChip followUpAt={lead.followUpAt} status={lead.status} />
          </div>
        )}

        <div className="max-h-[40vh] min-h-[160px] overflow-y-auto bg-slate-50/70 p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Activity {!loading && <span className="text-slate-400">({discussions.length})</span>}
          </h3>
          <DiscussionTimeline discussions={discussions} loading={loading} error={error} />
        </div>

        <DiscussionForm leadId={lead.id} onSaved={handleSaved} />
      </DialogContent>
    </Dialog>
  );
}