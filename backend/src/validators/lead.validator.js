const { z } = require('zod');

const STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'WON',
  'LOST',
];

// Trimmed optional text. Empty string becomes null, missing stays undefined.
const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max, `Must be at most ${max} characters`)
    .nullish()
    .transform((v) => (v === undefined ? undefined : v || null));

const phone = z
  .string()
  .trim()
  .regex(/^[0-9+()\-\s]{6,20}$/, 'Invalid phone number')
  .or(z.literal(''))
  .nullish()
  .transform((v) => (v === undefined ? undefined : v || null));

const isoDate = z.string().datetime({ offset: true, message: 'Must be an ISO 8601 date-time' });

const idParam = z.object({
  id: z.string().uuid('Invalid lead id'),
});

const listLeadsQuery = z.object({
  status: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.enum(STATUSES).optional()
  ),
  search: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(100).optional()
  ),
  // Client's "today" window so pinning respects the user's timezone
  dayStart: isoDate.optional(),
  dayEnd: isoDate.optional(),
});

const createLeadBody = z.object({
  name: z.string({ required_error: 'Name is required' }).trim().min(1, 'Name is required').max(120),
  company: optionalText(120),
  phone,
  status: z.enum(STATUSES).default('NEW'),
});

const updateLeadBody = z
  .object({
    name: z.string().trim().min(1, 'Name cannot be empty').max(120).optional(),
    company: optionalText(120),
    phone,
    status: z.enum(STATUSES).optional(),
    followUpAt: isoDate.nullable().optional(),
  })
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });

const createDiscussionBody = z.object({
  note: z.string({ required_error: 'Note is required' }).trim().min(1, 'Note is required').max(2000),
  followUpAt: isoDate.nullish(),
});

module.exports = {
  idParam,
  listLeadsQuery,
  createLeadBody,
  updateLeadBody,
  createDiscussionBody,
};