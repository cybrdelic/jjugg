import { z } from 'zod';

export const IngestEnvelope = z.object({
    type: z.enum(['form_capture', 'posting_capture', 'draft_update']).describe('event type'),
    scope: z.string(),
    url: z.string().url().or(z.string().min(1)),
    ts: z.number().int().or(z.string()).transform((v) => typeof v === 'string' ? Date.parse(v) : v),
    fields: z.record(z.any()).optional(),
    posting: z.object({
        title: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        desc_html: z.string().optional(),
    }).partial().optional(),
    raw: z.record(z.any()).optional(),
});

export type IngestEnvelope = z.infer<typeof IngestEnvelope>;

export const StatusUpdate = z.object({
    status: z.enum(['draft', 'submitted', 'screen', 'phone', 'tech', 'takehome', 'onsite', 'offer', 'hired', 'rejected'])
});

export const LinkEmail = z.object({
    email_id: z.string(),
    application_id: z.string()
});

export const RerunPipeline = z.object({
    entity: z.enum(['application', 'email', 'posting', 'draft']),
    id: z.string(),
    steps: z.array(z.string()).optional()
});
