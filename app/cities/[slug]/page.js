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
    title: `محامين في ${city.name_ar} — أفضل ${city.lawyer_count} محامي | دليل المحامين السعوديين`,
    description: `دليل شامل لأفضل ${city.lawyer_count} محامي ومكتب محاماة في ${city.name_ar}. تقييمات حقيقية من العملاء، أرقام هواتف مباشرة، مواقع إلكترونية، وساعات عمل. ابحث عن محاميك الآن.`,
    keywords: `محامي ${city.name_ar}, مكتب محاماة ${city.name_ar}, محامين ${city.name_ar}, مستشار قانوني ${city.name_ar}`,
  };
}

function getCityFAQs(cityName, lawyerCount) {
  return [
    {
      q: `كم عدد المحامين في ${cityName}؟`,
      a: `يوجد أكثر من ${lawyerCount} محامي ومكتب محاماة مسجل في ${cityName} ضمن دليل المحامين السعوديين. يتم تحديث القائمة بشكل دوري لتشمل أحدث المعلومات والتقييمات.`,
    },
    {
      q: `كيف أجد أفضل محامي في ${cityName}؟`,
      a: `يمكنك استخدام دليل المحامين السعوديين للبحث عن محامين في ${cityName} ومقارنة تقييماتهم ومراجعات العملاء. ننصح باختيار محامي حاصل على تقييم 4 نجوم فأعلى ولديه عدد كبير من المراجعات الإيجابية.`,
    },
    {
      q: `ما هي تكلفة المحامي في ${cityName}؟`,
      a: `تختلف تكلفة المحامي في ${cityName} حسب نوع القضية وخبرة المحامي. الاستشارة الأولية تتراوح بين 300-1,500 ريال. للقضايا التجارية والجنائية، يُنصح بالتواصل مباشرة مع المحامي لمعرفة الأتعاب.`,
    },
    {
      q: `هل يوجد محامين متخصصين في القضايا التجارية في ${cityName}؟`,
      a: `نعم، يوجد عدد من المحامين المتخصصين في القضايا التجارية وقضايا الشركات في ${cityName}. يمكنك تصفح قائمة المحامين في الأسفل والتواصل مباشرة مع المحامي المناسب.`,
    },
  ];
}

function renderStars(rating) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  const result = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) result.push(<span key={i} className="star-icon filled">★</span>);
    else if (i === full && half) result.push(<span key={i} className="star-icon half">★</span>);
    else result.push(<span key={i} className="star-icon empty">★</span>);
  }
  return result;
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

  const { data: allCities } = await supabase
    .from('cities')
    .select('slug, name_ar, lawyer_count')
    .neq('slug', slug)
    .order('lawyer_count', { ascending: false })
    .limit(6);

  const cityFAQs = getCityFAQs(city.name_ar, lawyers?.length || city.lawyer_count);

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `محامين في ${city.name_ar}`,
    description: `قائمة بأفضل المحامين ومكاتب المحاماة في ${city.name_ar}`,
    numberOfItems: lawyers?.length || 0,
    itemListElement: (lawyers || []).slice(0, 10).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LegalService',
        name: l.name,
        url: `https://www.dalil-almuhameen.com/lawyers/${l.slug}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: city.name_ar,
          addressCountry: 'SA',
        },
        ...(l.rating ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: l.rating,
            reviewCount: l.ratings_count || 0,
          },
        } : {}),
      },
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://www.dalil-almuhameen.com' },
      { '@type': 'ListItem', position: 2, name: 'المدن', item: 'https://www.dalil-almuhameen.com/cities' },
      { '@type': 'ListItem', position: 3, name: city.name_ar, item: `https://www.dalil-almuhameen.com/cities/${slug}` },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cityFAQs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <main className="directory-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="breadcrumb">
        <div className="container">
          <Link href="/">الرئيسية</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href="/cities">المدن</Link>
          <span className="breadcrumb-sep">/</span>
          <span>{city.name_ar}</span>
        </div>
      </nav>

      <div className="directory-content">
        {/* Top Bar */}
        <div className="directory-topbar">
          <div className="topbar-right">
            <h1>محامين في {city.name_ar}</h1>
            <span className="results-badge">دليل شامل لأفضل {lawyers?.length || 0} محامي ومكتب محاماة في {city.name_ar}</span>
          </div>
        </div>

        {/* Results */}
        <div className="results-list">
          {lawyers?.map((lawyer, idx) => (
            <Link href={`/lawyers/${lawyer.slug}`} key={lawyer.id} className="result-card">
              <div className="card-rank">{idx + 1}</div>

              <div className="card-image">
                {lawyer.photo_url ? (
                  <img src={lawyer.photo_url} alt={lawyer.name} />
                ) : (
                  <div className="card-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                  </div>
                )}
              </div>

              <div className="card-body">
                <div className="card-top">
                  <h3 className="card-name">{lawyer.name}</h3>
                  <div className="card-location">{lawyer.city || lawyer.source_city}{lawyer.district ? ` — ${lawyer.district}` : ''}</div>
                </div>

                {lawyer.rating && (
                  <div className="card-rating">
                    <div className="stars">{renderStars(lawyer.rating)}</div>
                    <span className="rating-num">{lawyer.rating}</span>
                    <span className="rating-count">({lawyer.ratings_count} تقييم)</span>
                  </div>
                )}

                {lawyer.practice_area && (
                  <div className="card-tags">
                    {lawyer.practice_area.split('،').slice(0, 4).map((area, i) => (
                      <span key={i} className="tag">{area.trim()}</span>
                    ))}
                    {lawyer.practice_area.split('،').length > 4 && (
                      <span className="tag tag-more">+{lawyer.practice_area.split('،').length - 4}</span>
                    )}
                  </div>
                )}

                <div className="card-footer">
                  {lawyer.phone_international && (
                    <span className="card-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      {lawyer.phone_international}
                    </span>
                  )}
                  {lawyer.website && (
                    <span className="card-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      موقع إلكتروني
                    </span>
                  )}
                  {lawyer.opening_hours && (
                    <span className="card-meta">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      ساعات العمل
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* City FAQ Section */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <h2>أسئلة شائعة عن المحامين في {city.name_ar}</h2>
          </div>
          <div className="faq-list">
            {cityFAQs.map((faq, i) => (
              <details key={i} className="faq-item">
                <summary className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-icon">+</span>
                </summary>
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Related Cities */}
      {allCities && allCities.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>تصفح محامين في مدن أخرى</h2>
            </div>
            <div className="related-cities-grid">
              {allCities.map(c => (
                <Link href={`/cities/${c.slug}`} key={c.slug} className="related-city-link">
                  {c.name_ar} ({c.lawyer_count} محامي)
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
