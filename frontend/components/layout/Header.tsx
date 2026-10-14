'use client';

import { Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header({ onAddLead }: { onAddLead: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/30">
            <Zap className="h-5 w-5" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg font-extrabold tracking-tight">LeadFlow</h1>
            <p className="hidden text-[11px] text-slate-500 sm:block">Never miss a follow-up</p>
          </div>
        </div>

        <Button
          onClick={onAddLead}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add New Lead</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
    </header>
  );
}