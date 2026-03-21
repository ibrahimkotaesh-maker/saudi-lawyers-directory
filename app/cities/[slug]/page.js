import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const { data } = await supabase.from('cities').select('slug');
  return (data || []).map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!city) return {};
  return {
    title: `محامين في ${city.name_ar} | دليل المحامين السعوديين`,
    description: `قائمة بأفضل ${city.lawyer_count} محامي ومكتب محاماة في ${city.name_ar}. تقييمات حقيقية، أرقام هواتف، ومعلومات تفصيلية.`,
  };
}

export default async function CityPage({ params }) {
  const { slug } = await params;

  const { data: city } = await supabase
    .from('cities')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!city) notFound();

  const { data: lawyers } = await supabase
    .from('lawyers')
    .select('*')
    .eq('source_city', city.name_ar)
    .order('rating', { ascending: false, nullsFirst: false })
    .order('ratings_count', { ascending: false });

  return (
    <main>
      <section className="city-header">
        <h1>محامين في {city.name_ar}</h1>
        <p>{lawyers?.length || 0} محامي ومكتب محاماة</p>
      </section>

      <section className="browse-results">
        <div className="container">
          <div className="lawyers-grid">
            {lawyers?.map(lawyer => (
              <Link href={`/lawyers/${lawyer.slug}`} key={lawyer.id}>
                <div className="lawyer-card">
                  <div className="lawyer-card-header">
                    <div className="lawyer-avatar">
                          {lawyer.photo_url ? (
                            <img src={lawyer.photo_url} alt={lawyer.name} />
                          ) : '⚖️'}
                        </div>
                    <div className="lawyer-info">
                      <h3>{lawyer.name}</h3>
                      <div className="lawyer-location">
                        📍 {lawyer.city || lawyer.source_city}
                        {lawyer.district ? ` — ${lawyer.district}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="lawyer-meta">
                    {lawyer.rating && (
                      <span className="rating-badge">
                        <span className="star">★</span> {lawyer.rating}
                        <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.8rem' }}>
                          ({lawyer.ratings_count})
                        </span>
                      </span>
                    )}
                    {lawyer.phone_international && (
                      <span className="meta-tag">📞 {lawyer.phone_international}</span>
                    )}
                    {lawyer.website && (
                      <span className="meta-tag">🌐 موقع</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
