import app from '../serverApp';

export default function handler(req: any, res: any) {
  // Normalize Vercel rewrite path (/api/index?__vercel_path=...) back to /api/...
  if (req.url && req.url.startsWith('/api/index')) {
    try {
      const urlObj = new URL(req.url, 'http://localhost');
      const subPath = urlObj.searchParams.get('__vercel_path');
      if (subPath !== null) {
        urlObj.searchParams.delete('__vercel_path');
        const qs = urlObj.searchParams.toString();
        req.url = `/api/${subPath}${qs ? `?${qs}` : ''}`;
      }
    } catch {
      // Fallback to original URL
    }
  }
  return app(req, res);
}
