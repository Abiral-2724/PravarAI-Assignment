'use client';

import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { followUpPresets, parseLocalDateTime, todayInputValue } from '@/lib/date';
import type { CreateDiscussionResult } from '@/types/lead';

interface Props {
  leadId: string;
  onSaved: (result: CreateDiscussionResult) => void;
}

export default function DiscussionForm({ leadId, onSaved }: Props) {
  const [note, setNote] = useState('');
  const [withFollowUp, setWithFollowUp] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!note.trim()) {
      setError('Please write a note before saving.');
      return;
    }

    let followUpAt: string | undefined;
    if (withFollowUp) {
      const when = parseLocalDateTime(date, time);
      if (!when) {
        setError('Pick both a date and a time for the follow-up.');
        return;
      }
      if (when.getTime() <= Date.now()) {
        setError('Follow-up must be in the future.');
        return;
      }
      followUpAt = when.toISOString();
    }

    setSaving(true);
    setError(null);
    try {
      const result = await api.createDiscussion(leadId, { note: note.trim(), followUpAt });
      onSaved(result);
      setNote('');
      setWithFollowUp(false);
      setDate('');
      setTime('');
      toast.success(followUpAt ? 'Note saved and follow-up set' : 'Note saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSaving(false);
    }
  }

  // Ctrl/Cmd + Enter saves from the textarea
  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-t bg-white p-5">
      <Textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder="What was discussed? (Ctrl/Cmd + Enter to save)"
        rows={3}
        maxLength={2000}
        className="resize-none rounded-xl"
        aria-label="New discussion note"
      />

      {withFollowUp && (
        <div className="space-y-2.5 rounded-xl bg-slate-50 p-3">
          <div className="flex flex-wrap gap-1.5">
            {followUpPresets().map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setDate(p.date);
                  setTime(p.time);
                  setError(null);
                }}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-indigo-50 hover:text-indigo-700 hover:ring-indigo-200"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Input
              type="date"
              min={todayInputValue()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Follow-up date"
              className="h-9 w-40 bg-white"
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Follow-up time"
              className="h-9 w-32 bg-white"
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="set-followup"
            checked={withFollowUp}
            onCheckedChange={(c) => {
              setWithFollowUp(c === true);
              setError(null);
            }}
          />
          <Label htmlFor="set-followup" className="cursor-pointer text-sm text-slate-600">
            Set follow-up
          </Label>
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-slate-900 hover:bg-slate-800"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? 'Saving' : 'Save note'}
        </Button>
      </div>
    </form>
  );
}