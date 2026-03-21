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

// City-specific FAQ generator
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

  // Fetch other cities for related links
  const { data: allCities } = await supabase
    .from('cities')
    .select('slug, name_ar, lawyer_count')
    .neq('slug', slug)
    .order('lawyer_count', { ascending: false })
    .limit(6);

  const cityFAQs = getCityFAQs(city.name_ar, lawyers?.length || city.lawyer_count);

  // JSON-LD: ItemList for lawyers in this city
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

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://www.dalil-almuhameen.com' },
      { '@type': 'ListItem', position: 2, name: 'المدن', item: 'https://www.dalil-almuhameen.com/cities' },
      { '@type': 'ListItem', position: 3, name: city.name_ar, item: `https://www.dalil-almuhameen.com/cities/${slug}` },
    ],
  };

  // FAQ JSON-LD
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
    <main>
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

      <section className="city-header">
        <h1>محامين في {city.name_ar}</h1>
        <p>دليل شامل لأفضل {lawyers?.length || 0} محامي ومكتب محاماة في {city.name_ar} — تقييمات حقيقية ومعلومات تفصيلية</p>
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

      {/* City FAQ Section */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <h2>❓ أسئلة شائعة عن المحامين في {city.name_ar}</h2>
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
              <h2>🏙️ تصفح محامين في مدن أخرى</h2>
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
