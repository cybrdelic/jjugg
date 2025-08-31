declare module 'dompurify' {
  export function sanitize(dirty: string, options?: any): string;
  const _default: { sanitize: typeof sanitize };
  export default _default;
}
