export function detectDeviceType(userAgent: string): string {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/mobile|android.*mobile|iphone|ipod|blackberry|windows phone/.test(ua)) return 'mobile';
  if (/tablet|ipad|android(?!.*mobile)/.test(ua)) return 'tablet';
  if (/windows|macintosh|linux|chrome|firefox|safari/.test(ua)) return 'desktop';
  return 'unknown';
}
