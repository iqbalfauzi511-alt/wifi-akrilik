export default function sitemap() {
  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_APP_URL
      : 'https://cobascan.my.id'
  ).replace(/\/$/, '');

  // Format date to W3C YYYY-MM-DD without milliseconds (safe for Google Search Console)
  const lastModDate = new Date().toISOString().split('T')[0];

  return [
    {
      url: baseUrl,
      lastModified: lastModDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/kebijakan-privasi`,
      lastModified: lastModDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/syarat-ketentuan`,
      lastModified: lastModDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/kebijakan-garansi`,
      lastModified: lastModDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}

