/**
 * Simple HTML escaping utility to sanitize content and prevent XSS.
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== "string") {
    return unsafe;
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
