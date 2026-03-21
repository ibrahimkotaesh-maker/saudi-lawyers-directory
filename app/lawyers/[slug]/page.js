import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Generate static paths for all lawyers
export async function generateStaticParams() {
  const { data } = await supabase.from('lawyers').select('slug');
  return (data || []).map(l => ({ slug: l.slug }));
}

// Dynamic metadata per lawyer
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!lawyer) return {};

  const city = lawyer.city || lawyer.source_city;
  return {
    title: `${lawyer.name} — محامي في ${city} | دليل المحامين السعوديين`,
    description: `${lawyer.name} — محامي في ${city}. تقييم ${lawyer.rating || 'غير متوفر'}/5 من ${lawyer.ratings_count || 0} تقييم. ${lawyer.phone_international ? `هاتف: ${lawyer.phone_international}` : ''} عنوان: ${lawyer.formatted_address}`,
  };
}

export default async function LawyerProfile({ params }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const { data: lawyer } = await supabase
    .from('lawyers')
    .select('*')
    .eq('slug', decodedSlug)
    .single();

  if (!lawyer) notFound();

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('lawyer_id', lawyer.id)
    .order('rating', { ascending: false });

  // Fetch similar lawyers (same city)
  const { data: similar } = await supabase
    .from('lawyers')
    .select('*')
    .eq('source_city', lawyer.source_city)
    .neq('id', lawyer.id)
    .not('rating', 'is', null)
    .order('rating', { ascending: false })
    .limit(4);

  const city = lawyer.city || lawyer.source_city;

  // Find city slug for internal linking
  const { data: cityData } = await supabase
    .from('cities')
    .select('slug, name_ar')
    .eq('name_ar', lawyer.source_city)
    .single();

  const citySlug = cityData?.slug || '';

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: lawyer.name,
    url: `https://www.dalil-almuhameen.com/lawyers/${decodedSlug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: lawyer.region,
      addressCountry: 'SA',
      streetAddress: lawyer.formatted_address,
    },
    telephone: lawyer.phone_international || undefined,
    ...(lawyer.website ? { sameAs: lawyer.website } : {}),
    aggregateRating: lawyer.rating ? {
      '@type': 'AggregateRating',
      ratingValue: lawyer.rating,
      reviewCount: lawyer.ratings_count || 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    geo: lawyer.latitude ? {
      '@type': 'GeoCoordinates',
      latitude: lawyer.latitude,
      longitude: lawyer.longitude,
    } : undefined,
    ...(reviews && reviews.length > 0 ? {
      review: reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author || 'مستخدم' },
        reviewRating: r.rating ? { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 } : undefined,
        reviewBody: r.review_text || undefined,
      })),
    } : {}),
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://www.dalil-almuhameen.com' },
      ...(citySlug ? [{ '@type': 'ListItem', position: 2, name: `محامين في ${city}`, item: `https://www.dalil-almuhameen.com/cities/${citySlug}` }] : []),
      { '@type': 'ListItem', position: citySlug ? 3 : 2, name: lawyer.name, item: `https://www.dalil-almuhameen.com/lawyers/${decodedSlug}` },
    ],
  };

  function renderStars(rating) {
    if (!rating) return '';
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let s = '★'.repeat(full);
    if (half) s += '★';
    return s;
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <div className="container">
          <Link href="/">الرئيسية</Link>
          <span className="breadcrumb-sep">/</span>
          {citySlug ? (
            <><Link href={`/cities/${citySlug}`}>محامين في {city}</Link><span className="breadcrumb-sep">/</span></>
          ) : null}
          <span>{lawyer.name}</span>
        </div>
      </nav>

      {/* Header */}
      <section className="profile-header">
        <div className="profile-header-inner">
          <div className="profile-photo">
              {lawyer.photo_url ? (
                <img src={lawyer.photo_url} alt={lawyer.name} />
              ) : '⚖️'}
            </div>
          <div className="profile-title">
            <h1>{lawyer.name}</h1>
            <div className="profile-badges">
              {lawyer.rating && (
                <span className="badge badge-gold">
                  ★ {lawyer.rating} ({lawyer.ratings_count} تقييم)
                </span>
              )}
              <span className="badge badge-green">📍 {city}</span>
              {lawyer.district && (
                <span className="badge badge-gray">{lawyer.district}</span>
              )}
              {lawyer.business_status === 'OPERATIONAL' && (
                <span className="badge badge-green">✓ نشط</span>
              )}
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {lawyer.formatted_address}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="profile-content">
        <div>
          {/* Info Cards */}
          <div className="info-cards" style={{ marginBottom: '40px' }}>
            {lawyer.phone_international && (
              <a href={`tel:${lawyer.phone_international}`} className="info-card">
                <div className="info-card-icon">📞</div>
                <div className="info-card-content">
                  <h4>رقم الهاتف</h4>
                  <p style={{ direction: 'ltr', textAlign: 'right' }}>{lawyer.phone_international}</p>
                </div>
              </a>
            )}
            {lawyer.phone_local && (
              <a href={`tel:${lawyer.phone_local}`} className="info-card">
                <div className="info-card-icon">📱</div>
                <div className="info-card-content">
                  <h4>الهاتف المحلي</h4>
                  <p style={{ direction: 'ltr', textAlign: 'right' }}>{lawyer.phone_local}</p>
                </div>
              </a>
            )}
            {lawyer.website && (
              <a href={lawyer.website} target="_blank" rel="noopener noreferrer" className="info-card">
                <div className="info-card-icon">🌐</div>
                <div className="info-card-content">
                  <h4>الموقع الإلكتروني</h4>
                  <p><span style={{ color: 'var(--green)' }}>زيارة الموقع ↗</span></p>
                </div>
              </a>
            )}
            {lawyer.google_maps_url && (
              <a href={lawyer.google_maps_url} target="_blank" rel="noopener noreferrer" className="info-card">
                <div className="info-card-icon">🗺️</div>
                <div className="info-card-content">
                  <h4>الموقع على الخريطة</h4>
                  <p><span style={{ color: 'var(--green)' }}>فتح في خرائط قوقل ↗</span></p>
                </div>
              </a>
            )}
            {lawyer.opening_hours && (
              <div className="info-card" style={{ alignItems: 'flex-start' }}>
                <div className="info-card-icon">🕐</div>
                <div className="info-card-content">
                  <h4>ساعات العمل</h4>
                  <div style={{ fontSize: '0.88rem', lineHeight: '1.9' }}>
                    {lawyer.opening_hours.split('; ').map((h, i) => (
                      <div key={i}>{h}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews */}
          {reviews && reviews.length > 0 && (
            <div className="reviews-section">
              <h2>💬 المراجعات ({reviews.length})</h2>
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <span className="review-author">{review.author || 'مستخدم'}</span>
                    <span className="review-time">{review.time_desc}</span>
                  </div>
                  {review.rating && (
                    <div className="review-stars">{renderStars(review.rating)}</div>
                  )}
                  {review.review_text && (
                    <p className="review-text">{review.review_text}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar — Similar Lawyers */}
        <div>
          {citySlug && (
            <div style={{ marginBottom: '24px' }}>
              <Link href={`/cities/${citySlug}`} className="search-btn" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', fontSize: '0.9rem' }}>
                عرض جميع المحامين في {city} ←
              </Link>
            </div>
          )}
          {similar && similar.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>محامين آخرين في {city}</h3>
              {similar.map(s => (
                <Link href={`/lawyers/${s.slug}`} key={s.id}>
                  <div className="lawyer-card" style={{ marginBottom: '12px', padding: '16px' }}>
                    <div className="lawyer-card-header" style={{ marginBottom: '8px' }}>
                      <div className="lawyer-avatar" style={{ width: 40, height: 40, fontSize: '1rem' }}>⚖️</div>
                      <div className="lawyer-info">
                        <h3 style={{ fontSize: '0.9rem' }}>{s.name}</h3>
                        <div className="lawyer-location" style={{ fontSize: '0.8rem' }}>
                          {s.rating && <span>★ {s.rating}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
