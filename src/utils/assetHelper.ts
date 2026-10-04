/**
 * Utility to resolve relative asset paths for local dev and subpath deployments like GitHub Pages.
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  
  // External URLs or Data URIs remain untouched
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  // Clean leading slash
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Prepend Vite base URL (e.g. './' or '/repo-name/')
  const baseUrl = import.meta.env.BASE_URL || './';
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  
  return `${normalizedBase}${cleanPath}`;
}
