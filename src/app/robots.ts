import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/checkout/',
          '/cart/',
          '/seller/',
          '/_next/',
          '/studio/analysis/'
        ],
      },
    ],
    sitemap: 'https://www.nira6.in/sitemap.xml',
  };
}
