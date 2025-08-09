import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Normalize and dedupe helper
function normalizeStack(items: string[]): string[] {
    const seen = new Set<string>();
    const clean = (s: string) => s.trim().replace(/^[-•\s]+/, '').replace(/\s+/g, ' ');
    const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

    const canonical = (s: string) => {
        const x = s.toLowerCase();
        if (/(nodejs|node\.js|node)/.test(x)) return 'Node.js';
        if (/(nextjs|next\.js)/.test(x)) return 'Next.js';
        if (/(reactjs|react\.js|react)/.test(x)) return 'React';
        if (/(typescript)/.test(x)) return 'TypeScript';
        if (/(javascript)/.test(x)) return 'JavaScript';
        if (/(postgresql|postgres)/.test(x)) return 'PostgreSQL';
        if (/(mysql)/.test(x)) return 'MySQL';
        if (/(sqlite)/.test(x)) return 'SQLite';
        if (/(mongodb)/.test(x)) return 'MongoDB';
        if (/(graphql)/.test(x)) return 'GraphQL';
        if (/(docker)/.test(x)) return 'Docker';
        if (/(kubernetes|k8s)/.test(x)) return 'Kubernetes';
        if (/(aws)/.test(x)) return 'AWS';
        if (/(azure)/.test(x)) return 'Azure';
        if (/(gcp|google cloud)/.test(x)) return 'GCP';
        if (/(python)/.test(x)) return 'Python';
        if (/(java\b)/.test(x)) return 'Java';
        if (/(spring)/.test(x)) return 'Spring';
        if (/(c#|\.net|dotnet)/.test(x)) return '.NET/C#';
        if (/(go\b|golang)/.test(x)) return 'Go';
        if (/(rust)/.test(x)) return 'Rust';
        if (/(tailwind)/.test(x)) return 'Tailwind CSS';
        if (/(redux|zustand|mobx)/.test(x)) return 'State Management';
        if (/(jest|vitest|cypress|storybook)/.test(x)) return 'Testing';
        return cap(clean(s));
    };

    const out: string[] = [];
    for (const raw of items) {
        const c = canonical(String(raw));
        if (!c || c.length > 64) continue;
        const key = c.toLowerCase();
        if (!seen.has(key)) {
            seen.add(key);
            out.push(c);
        }
    }
    return out.slice(0, 20);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { jobDescription } = req.body || {};
        if (!jobDescription || typeof jobDescription !== 'string') {
            return res.status(400).json({ error: 'jobDescription_required', aiUsed: false, stack: [] });
        }

        // If no API key, signal AI unavailability (no silent fallback)
        if (!process.env.OPENAI_API_KEY) {
            return res.status(503).json({ error: 'ai_unavailable_missing_api_key', aiUsed: false, stack: [] });
        }

        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const model = process.env.AI_MODEL || 'gpt-4o-mini';

        const system = `You extract a concise tech stack from job descriptions.\nReturn ONLY a JSON array of distinct technology/tool names (strings). No extra text.`;
        const user = `Job Description:\n\n${jobDescription}\n\nReturn a JSON array of strings, e.g.: ["React", "Next.js", "TypeScript"].`;

        const completion = await openai.chat.completions.create({
            model,
            temperature: 0.1,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            max_tokens: 300,
        });

        const text = completion.choices?.[0]?.message?.content?.trim() ?? '[]';

        let arr: string[] = [];
        try {
            arr = JSON.parse(text);
        } catch {
            // Try to extract JSON array from text
            const m = text.match(/\[[\s\S]*\]/);
            if (m) {
                try { arr = JSON.parse(m[0]); } catch { arr = []; }
            }
        }

        if (!Array.isArray(arr)) arr = [];

        const stack = normalizeStack(arr);
        return res.status(200).json({ stack, aiUsed: true });
    } catch (err) {
        // Explicitly indicate AI failure
        return res.status(503).json({ error: 'ai_inference_failed', aiUsed: false, stack: [] });
    }
}
