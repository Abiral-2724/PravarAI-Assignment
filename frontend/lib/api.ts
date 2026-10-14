import type {
    CreateDiscussionInput,
    CreateDiscussionResult,
    CreateLeadInput,
    Discussion,
    Lead,
    LeadStatus,
    UpdateLeadInput,
  } from '@/types/lead';
  
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  
  export interface FieldError {
    field: string;
    message: string;
  }
  
  export class ApiError extends Error {
    status: number;
    details?: FieldError[];
  
    constructor(status: number, message: string, details?: FieldError[]) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.details = details;
    }
  }
  
  async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        cache: 'no-store',
        // Only set the header when sending a body, so GETs avoid a CORS preflight
        headers: init.body ? { 'Content-Type': 'application/json' } : undefined,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      throw new ApiError(0, 'Cannot reach the server. Is the API running?');
    }
  
    const json = await res.json().catch(() => null);
  
    if (!res.ok) {
      throw new ApiError(
        res.status,
        json?.error?.message ?? 'Something went wrong',
        json?.error?.details
      );
    }
    return json.data as T;
  }
  
  export interface GetLeadsParams {
    status?: LeadStatus;
    search?: string;
    dayStart: string;
    dayEnd: string;
  }
  
  export const api = {
    getLeads(params: GetLeadsParams, signal?: AbortSignal) {
      const qs = new URLSearchParams();
      if (params.status) qs.set('status', params.status);
      if (params.search) qs.set('search', params.search);
      qs.set('dayStart', params.dayStart);
      qs.set('dayEnd', params.dayEnd);
      return request<Lead[]>(`/api/leads?${qs.toString()}`, { signal });
    },
  
    createLead(input: CreateLeadInput) {
      return request<Lead>('/api/leads', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  
    updateLead(id: string, input: UpdateLeadInput) {
      return request<Lead>(`/api/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
    },
  
    getDiscussions(leadId: string, signal?: AbortSignal) {
      return request<Discussion[]>(`/api/leads/${leadId}/discussions`, { signal });
    },
  
    createDiscussion(leadId: string, input: CreateDiscussionInput) {
      return request<CreateDiscussionResult>(`/api/leads/${leadId}/discussions`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
    },
  };