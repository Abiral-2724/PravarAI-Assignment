export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'WON'
  | 'LOST';

export type StatusFilterValue = LeadStatus | 'ALL';

export interface Lead {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  followUpAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed by GET /api/leads only
  lastNote?: string | null;
  lastDiscussionAt?: string | null;
  isFollowUpToday?: boolean;
  isOverdue?: boolean;
}

export interface Discussion {
  id: string;
  leadId: string;
  note: string;
  followUpAt: string | null;
  createdAt: string;
}

export interface CreateLeadInput {
  name: string;
  company?: string;
  phone?: string;
  status?: LeadStatus;
}

export interface UpdateLeadInput {
  status?: LeadStatus;
  name?: string;
  company?: string;
  phone?: string;
}

export interface CreateDiscussionInput {
  note: string;
  followUpAt?: string;
}

export interface CreateDiscussionResult {
  discussion: Discussion;
  lead: Lead;
}