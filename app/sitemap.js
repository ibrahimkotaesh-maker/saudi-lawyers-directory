import { supabase } from '@/lib/supabase';

const BASE_URL = 'https://www.dalil-almuhameen.com';

export default async function sitemap() {
  // Fetch all lawyers
  const { data: lawyers } = await supabase.from('lawyers').select('slug');
  // Fetch all cities
  const { data: cities } = await supabase.from('cities').select('slug');

  const staticPages = [
    { url: BASE_URL, lastModified: new Date(), priority: 1.0, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/lawyers`, lastModified: new Date(), priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/cities`, lastModified: new Date(), priority: 0.8, changeFrequency: 'monthly' },
  ];

  const cityPages = (cities || []).map(c => ({
    url: `${BASE_URL}/cities/${c.slug}`,
    lastModified: new Date(),
    priority: 0.8,
    changeFrequency: 'monthly',
  }));

  const lawyerPages = (lawyers || []).map(l => ({
    url: `${BASE_URL}/lawyers/${l.slug}`,
    lastModified: new Date(),
    priority: 0.6,
    changeFrequency: 'monthly',
  }));

  return [...staticPages, ...cityPages, ...lawyerPages];
}
