declare module 'mailparser' {
  export function simpleParser(source: string | Buffer): Promise<{
    subject?: string;
    from?: { text?: string } | null;
    date?: string | Date | null;
    text?: string | null;
    html?: string | null;
  }>;
}
