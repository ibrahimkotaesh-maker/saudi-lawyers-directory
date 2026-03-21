import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function HomePage() {
  // Fetch featured lawyers (highest rated)
  const { data: featured } = await supabase
    .from('lawyers')
    .select('*')
    .not('rating', 'is', null)
    .gt('ratings_count', 10)
    .order('rating', { ascending: false })
    .order('ratings_count', { ascending: false })
    .limit(6);

  // Fetch cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('lawyer_count', { ascending: false });

  // Stats
  const { count: totalLawyers } = await supabase.from('lawyers').select('*', { count: 'exact', head: true });
  const { count: totalReviews } = await supabase.from('reviews').select('*', { count: 'exact', head: true });

  const cityImages = {
    'riyadh': '/cities/riyadh.png', 'jeddah': '/cities/jeddah.png',
    'dammam-khobar': '/cities/dammam-khobar.png', 'mecca': '/cities/mecca.png',
    'medina': '/cities/medina.png', 'taif': '/cities/taif.png',
    'tabuk': '/cities/tabuk.png', 'abha': '/cities/abha.png',
    'khamis': '/cities/khamis.png', 'buraydah': '/cities/buraydah.png',
    'hail': '/cities/hail.png', 'najran': '/cities/najran.png',
    'jazan': '/cities/jazan.png', 'al-ahsa': '/cities/al-ahsa.png',
    'yanbu': '/cities/yanbu.png', 'jubail': '/cities/jubail.png',
  };

  // Homepage FAQs
  const homeFaqs = [
    { q: 'كيف أجد محامي في السعودية؟', a: 'استخدم دليل المحامين السعوديين للبحث عن محامين في 16 مدينة سعودية. يمكنك البحث باسم المحامي أو اختيار مدينتك لعرض المحامين القريبين منك مع تقييمات حقيقية وأرقام هواتف.' },
    { q: 'كم عدد المحامين في الدليل؟', a: `يضم دليل المحامين السعوديين أكثر من ${totalLawyers?.toLocaleString('ar-SA')} محامي ومكتب محاماة في ${cities?.length} مدينة سعودية، مع أكثر من ${totalReviews?.toLocaleString('ar-SA')} تقييم حقيقي من العملاء.` },
    { q: 'هل الدليل مجاني؟', a: 'نعم، دليل المحامين السعوديين مجاني تماماً. يمكنك البحث عن المحامين وقراءة التقييمات والحصول على معلومات التواصل بدون أي رسوم.' },
  ];

  // WebSite JSON-LD with SearchAction
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'دليل المحامين السعوديين',
    url: 'https://www.dalil-almuhameen.com',
    description: 'أكبر دليل شامل للمحامين ومكاتب المحاماة في المملكة العربية السعودية',
    inLanguage: 'ar',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.dalil-almuhameen.com/lawyers?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // Organization JSON-LD
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'دليل المحامين السعوديين',
    url: 'https://www.dalil-almuhameen.com',
    logo: 'https://www.dalil-almuhameen.com/favicon.ico',
    description: `دليل شامل لأكثر من ${totalLawyers} محامي في ${cities?.length} مدينة سعودية`,
    areaServed: { '@type': 'Country', name: 'المملكة العربية السعودية' },
  };

  // FAQ JSON-LD
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="hero-badge">🇸🇦 أكبر دليل للمحامين في المملكة</div>
        <h1>
          ابحث عن <span>محامٍ موثوق</span>
          <br />في المملكة العربية السعودية
        </h1>
        <p className="hero-subtitle">
          أكثر من {totalLawyers?.toLocaleString('ar-SA')} محامي ومكتب محاماة في {cities?.length} مدينة سعودية. تقييمات حقيقية، أرقام هواتف، ومعلومات تفصيلية.
        </p>

        {/* Search */}
        <div className="search-container">
          <form className="search-bar" action="/lawyers" method="get">
            <input type="text" name="q" placeholder="ابحث باسم المحامي أو المكتب..." />
            <select name="city">
              <option value="">كل المدن</option>
              {cities?.map(c => (
                <option key={c.slug} value={c.name_ar}>{c.name_ar}</option>
              ))}
            </select>
            <button type="submit" className="search-btn">🔍 ابحث</button>
          </form>
        </div>

        {/* Stats */}
        <div className="stats-strip">
          <div className="stat-item">
            <div className="stat-number">{totalLawyers?.toLocaleString('ar-SA')}+</div>
            <div className="stat-label">محامي ومكتب</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{cities?.length}</div>
            <div className="stat-label">مدينة</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{totalReviews?.toLocaleString('ar-SA')}+</div>
            <div className="stat-label">تقييم ومراجعة</div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED LAWYERS ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <h2>⭐ أفضل المحامين تقييماً</h2>
            <p>محامين حاصلين على أعلى التقييمات من العملاء</p>
          </div>
          <div className="lawyers-grid">
            {featured?.map(lawyer => (
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
                      <span className="meta-tag">📞 متوفر</span>
                    )}
                    {lawyer.website && (
                      <span className="meta-tag">🌐 موقع</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link href="/lawyers" className="search-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
              عرض جميع المحامين ←
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ BROWSE BY CITY ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>🏙️ تصفح حسب المدينة</h2>
            <p>اختر مدينتك للعثور على المحامين القريبين منك</p>
          </div>
          <div className="cities-grid">
            {cities?.map(city => (
              <Link href={`/cities/${city.slug}`} key={city.slug}>
                <div className="city-card city-card-photo">
                  <div className="city-photo">
                    <img src={cityImages[city.slug] || '/cities/riyadh.png'} alt={city.name_ar} />
                    <div className="city-photo-overlay">
                      <h3>{city.name_ar}</h3>
                      <div className="city-count">{city.lawyer_count} محامي</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="section" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <h2>كيف يعمل الدليل؟</h2>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">١</div>
              <h3>ابحث</h3>
              <p>ابحث باسم المحامي أو اختر مدينتك من القائمة</p>
            </div>
            <div className="step-card">
              <div className="step-number">٢</div>
              <h3>قارن</h3>
              <p>قارن التقييمات والمراجعات لاختيار الأفضل</p>
            </div>
            <div className="step-card">
              <div className="step-number">٣</div>
              <h3>تواصل</h3>
              <p>اتصل مباشرة أو زر الموقع الإلكتروني للمحامي</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ SECTION ═══ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>❓ أسئلة شائعة</h2>
            <p>إجابات سريعة على أكثر الأسئلة شيوعاً</p>
          </div>
          <div className="faq-list">
            {homeFaqs.map((faq, i) => (
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
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/faq" className="search-btn" style={{ display: 'inline-block', textDecoration: 'none', background: 'var(--bg-secondary)', color: 'var(--text)' }}>
              عرض جميع الأسئلة الشائعة ←
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
