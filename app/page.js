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
        <div className="hero-badge">أكبر دليل للمحامين في المملكة</div>
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
            <button type="submit" className="search-btn">ابحث</button>
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
            <h2>أفضل المحامين تقييماً</h2>
            <p>محامين حاصلين على أعلى التقييمات من العملاء</p>
          </div>
          <div className="featured-list">
            {featured?.map((lawyer, idx) => (
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
                  <h3 className="card-name">{lawyer.name}</h3>
                  <div className="card-location">{lawyer.city || lawyer.source_city}{lawyer.district ? ` — ${lawyer.district}` : ''}</div>
                  {lawyer.rating && (
                    <div className="card-rating">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`star-icon ${i < Math.floor(lawyer.rating) ? 'filled' : (i === Math.floor(lawyer.rating) && lawyer.rating % 1 >= 0.3 ? 'half' : 'empty')}`}>★</span>
                        ))}
                      </div>
                      <span className="rating-num">{lawyer.rating}</span>
                      <span className="rating-count">({lawyer.ratings_count} تقييم)</span>
                    </div>
                  )}
                  {lawyer.practice_area && (
                    <div className="card-tags">
                      {lawyer.practice_area.split('،').slice(0, 3).map((area, i) => (
                        <span key={i} className="tag">{area.trim()}</span>
                      ))}
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
            <h2>تصفح حسب المدينة</h2>
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
            <h2>أسئلة شائعة</h2>
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
