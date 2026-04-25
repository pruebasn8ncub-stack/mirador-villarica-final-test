import type { MetadataRoute } from 'next';

const SITE_URL = 'https://mirador-villarrica-chatbot.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL,             lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/#proyecto`,    lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/#master-plan`, lastModified: now, changeFrequency: 'daily',   priority: 0.95 },
    { url: `${SITE_URL}/#galeria`,     lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/#tour-360`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/#ubicacion`,   lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/#cotizar`,     lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
  ];
}
