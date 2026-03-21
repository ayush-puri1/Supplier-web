/**
 * Detects the device type from the user agent string.
 * @param {string} userAgent - The user agent string from the request headers.
 * @returns {string} - 'mobile', 'tablet', 'desktop', or 'unknown'.
 */
export function detectDeviceType(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  if (/mobile|android.*mobile|iphone|ipod|blackberry|windows phone/.test(ua)) return 'mobile';
  if (/tablet|ipad|android(?!.*mobile)/.test(ua)) return 'tablet';
  if (/windows|macintosh|linux|chrome|firefox|safari/.test(ua)) return 'desktop';
  return 'unknown';
}
