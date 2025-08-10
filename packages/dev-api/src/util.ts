import crypto from 'crypto';

export function stableHash(input: string) {
    return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export function nowIso() {
    return new Date().toISOString();
}

export function normalizeCompany(name?: string) {
    if (!name) return '';
    let n = name.trim();
    n = n.replace(/\b(incorporated|inc\.|inc|llc|ltd\.|ltd|co\.|company|corp\.|corp)\b/gi, '').trim();
    n = n.replace(/\s{2,}/g, ' ');
    return n;
}

export function normalizeLocation(raw?: string) {
    if (!raw) return '';
    return raw.replace(/\s+/g, ' ').trim();
}

export function extractCompensation(text?: string) {
    if (!text) return '';
    const m = text.match(/\$?\s?([0-9]{2,3}[,0-9]{0,3})\s?(-|to|–)?\s?\$?\s?([0-9]{2,3}[,0-9]{0,3})?\s*(k|K|\+)?\s*(\/|per)?\s*(year|yr|hour|hr)?/);
    if (!m) return text.trim();
    return text.trim();
}

export function ensureId(id?: string) {
    return id ?? stableHash(Math.random().toString() + Date.now());
}
