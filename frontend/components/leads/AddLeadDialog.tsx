'use client';

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AlertCircle, Building2, Loader2, Phone, User, UserPlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { avatarColor, getInitials } from '../../lib/avatar';
import { STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { LeadStatus } from '@/types/lead';

const PHONE_REGEX = /^[0-9+()\-\s]{6,20}$/; // same rule as the backend

type FieldKey = 'name' | 'company' | 'phone';
type FormState = Record<FieldKey, string> & { status: LeadStatus };
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMPTY: FormState = { name: '', company: '', phone: '', status: 'NEW' };

function validate(f: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!f.name.trim()) errors.name = 'Name is required';
  if (f.phone.trim() && !PHONE_REGEX.test(f.phone.trim())) {
    errors.phone = 'Enter a valid phone number';
  }
  return errors;
}

function Field({
  id,
  label,
  optional,
  icon: Icon,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  icon: LucideIcon;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-medium text-slate-700">
        {label}{' '}
        {optional ? (
          <span className="font-normal text-slate-400">(optional)</span>
        ) : (
          <span className="text-rose-500">*</span>
        )}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        {children}
      </div>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  cn(
    'h-11 rounded-xl bg-white pl-10',
    hasError && 'border-rose-300 focus-visible:ring-rose-200'
  );

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export default function AddLeadDialog({ open, onOpenChange, onCreated }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors & { form?: string }>({});
  const [saving, setSaving] = useState(false);
  const [addAnother, setAddAnother] = useState(false);

  const clientErrors = validate(form);
  const errorFor = (k: FieldKey) =>
    serverErrors[k] ?? (touched[k] ? clientErrors[k] : undefined);

  const hasName = form.name.trim().length > 0;

  const reset = () => {
    setForm(EMPTY);
    setTouched({});
    setServerErrors({});
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const setField = (key: FieldKey, transform?: (v: string) => string) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = transform ? transform(e.target.value) : e.target.value;
      setForm((f) => ({ ...f, [key]: value }));
      setServerErrors((s) => ({ ...s, [key]: undefined, form: undefined }));
    };

  const blur = (key: FieldKey) => () => setTouched((t) => ({ ...t, [key]: true }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ name: true, company: true, phone: true });

    const firstInvalid = (['name', 'phone'] as const).find((k) => clientErrors[k]);
    if (firstInvalid) {
      document.getElementById(`lead-${firstInvalid}`)?.focus();
      return;
    }

    setSaving(true);
    try {
      const created = await api.createLead({
        name: form.name.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
        status: form.status,
      });
      toast.success(`${created.name} added`);
      onCreated();
      reset();
      if (addAnother) {
        document.getElementById('lead-name')?.focus();
      } else {
        onOpenChange(false);
      }
    } catch (err) {
      // Map server-side validation errors back onto the fields
      const mapped: FieldErrors = {};
      if (err instanceof ApiError && err.details) {
        for (const d of err.details) {
          if (d.field === 'name' || d.field === 'company' || d.field === 'phone') {
            mapped[d.field] = d.message;
          }
        }
      }
      setServerErrors(
        Object.keys(mapped).length > 0
          ? mapped
          : { form: err instanceof Error ? err.message : 'Failed to add lead' }
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-lg">
        <DialogHeader className="flex-row items-center gap-4 space-y-0 border-b bg-gradient-to-br from-indigo-50 via-white to-white p-6 pr-14 text-left">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-bold transition-colors',
              hasName ? avatarColor(form.name) : 'bg-indigo-100 text-indigo-600'
            )}
          >
            {hasName ? getInitials(form.name) : <UserPlus className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-lg font-bold">
              {hasName ? form.name.trim() : 'New lead'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-500">
              Add the basics now. You can log discussions right after.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5 p-6">
            <Field id="lead-name" label="Full name" icon={User} error={errorFor('name')}>
              <Input
                id="lead-name"
                value={form.name}
                onChange={setField('name')}
                onBlur={blur('name')}
                placeholder="e.g. Aarav Sharma"
                maxLength={120}
                autoFocus
                autoComplete="off"
                aria-invalid={Boolean(errorFor('name'))}
                aria-describedby={errorFor('name') ? 'lead-name-error' : undefined}
                className={inputClass(Boolean(errorFor('name')))}
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="lead-company" label="Company" optional icon={Building2} error={errorFor('company')}>
                <Input
                  id="lead-company"
                  value={form.company}
                  onChange={setField('company')}
                  onBlur={blur('company')}
                  placeholder="e.g. Sharma Textiles"
                  maxLength={120}
                  autoComplete="off"
                  className={inputClass(Boolean(errorFor('company')))}
                />
              </Field>

              <Field id="lead-phone" label="Phone" optional icon={Phone} error={errorFor('phone')}>
                <Input
                  id="lead-phone"
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={setField('phone', (v) => v.replace(/[^0-9+()\-\s]/g, ''))}
                  onBlur={blur('phone')}
                  placeholder="+91 98765 43210"
                  maxLength={20}
                  autoComplete="off"
                  aria-invalid={Boolean(errorFor('phone'))}
                  aria-describedby={errorFor('phone') ? 'lead-phone-error' : undefined}
                  className={inputClass(Boolean(errorFor('phone')))}
                />
              </Field>
            </div>

            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-slate-700">Status</Label>
              <div role="radiogroup" aria-label="Lead status" className="flex flex-wrap gap-2">
                {STATUS_ORDER.map((s) => {
                  const selected = form.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition',
                        selected
                          ? 'bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-full', STATUS_META[s].dot)} />
                      {STATUS_META[s].label}
                    </button>
                  );
                })}
              </div>
            </div>

            {serverErrors.form && (
              <p role="alert" className="flex items-center gap-1.5 text-sm text-rose-600">
                <AlertCircle className="h-4 w-4" />
                {serverErrors.form}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="add-another"
                checked={addAnother}
                onCheckedChange={(c) => setAddAnother(c === true)}
              />
              <Label htmlFor="add-another" className="cursor-pointer text-sm text-slate-600">
                Add another
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving' : 'Save lead'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}