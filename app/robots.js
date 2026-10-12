export default function robots() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_APP_URL
      : 'https://cobascan.my.id'
  ).replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/api/',
        '/login',
        '/activate/',
        '/auth/',
        '/business/',
        '/q/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
