'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function LawyersPageWrapper() {
  return (
    <Suspense fallback={<div style={{padding:'140px 24px',textAlign:'center'}}>جاري التحميل...</div>}>
      <LawyersPage />
    </Suspense>
  );
}

const CITIES = [
  'الرياض', 'جدة', 'الدمام والخبر والظهران', 'مكة المكرمة', 'المدينة المنورة',
  'الطائف', 'تبوك', 'أبها', 'خميس مشيط', 'بريدة', 'حائل', 'نجران', 'جازان',
  'الأحساء', 'ينبع', 'الجبيل',
];

const PRACTICE_AREAS = [
  { label: 'قضايا تجارية', value: 'تجارية' },
  { label: 'قضايا عمالية', value: 'عمالية' },
  { label: 'أحوال شخصية', value: 'أحوال شخصية' },
  { label: 'قضايا جنائية', value: 'جنائية' },
  { label: 'قضايا عقارية', value: 'عقارية' },
  { label: 'استشارات قانونية', value: 'استشارات قانونية' },
  { label: 'تحكيم', value: 'تحكيم' },
  { label: 'ملكية فكرية', value: 'ملكية فكرية' },
  { label: 'قضايا مالية وتأمين', value: 'مالية وتأمين' },
  { label: 'قضايا إدارية', value: 'إدارية' },
  { label: 'تركات ومواريث', value: 'تركات ومواريث' },
  { label: 'قضايا مرورية', value: 'مرورية' },
];

const RATING_OPTIONS = [
  { label: '4.5 فما فوق', value: '4.5' },
  { label: '4.0 فما فوق', value: '4' },
  { label: '3.0 فما فوق', value: '3' },
];

const PER_PAGE = 20;

function LawyersPage() {
  const searchParams = useSearchParams();
  const [lawyers, setLawyers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [practiceArea, setPracticeArea] = useState(searchParams.get('practice') || '');
  const [minRating, setMinRating] = useState('');
  const [hasPhone, setHasPhone] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [page, setPage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchLawyers();
  }, [page, city, practiceArea, minRating, hasPhone, hasWebsite]);

  async function fetchLawyers() {
    setLoading(true);
    let query = supabase
      .from('lawyers')
      .select('*', { count: 'exact' })
      .order('rating', { ascending: false, nullsFirst: false })
      .order('ratings_count', { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1);

    if (search) query = query.ilike('name', `%${search}%`);
    if (city) query = query.eq('source_city', city);
    if (practiceArea) query = query.ilike('practice_area', `%${practiceArea}%`);
    if (minRating) query = query.gte('rating', parseFloat(minRating));
    if (hasPhone) query = query.neq('phone_international', '');
    if (hasWebsite) query = query.neq('website', '');

    const { data, count } = await query;
    setLawyers(data || []);
    setTotal(count || 0);
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(0);
    fetchLawyers();
  }

  function clearFilters() {
    setCity('');
    setPracticeArea('');
    setMinRating('');
    setHasPhone(false);
    setHasWebsite(false);
    setPage(0);
  }

  const activeFilterCount = [city, practiceArea, minRating, hasPhone, hasWebsite].filter(Boolean).length;
  const totalPages = Math.ceil(total / PER_PAGE);

  function renderStars(rating) {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i} className="star-icon filled">★</span>);
      else if (i === full && half) stars.push(<span key={i} className="star-icon half">★</span>);
      else stars.push(<span key={i} className="star-icon empty">★</span>);
    }
    return stars;
  }

  return (
    <main className="directory-page">
      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Filter Sidebar */}
      <aside className={`filter-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>تصفية النتائج</h2>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>

        <div className="sidebar-body">
          {/* City Filter */}
          <div className="filter-section">
            <h3 className="filter-title">المدينة</h3>
            <div className="filter-options">
              <label className={`filter-radio ${!city ? 'selected' : ''}`}>
                <input type="radio" name="city" checked={!city} onChange={() => { setCity(''); setPage(0); }} />
                <span>كل المدن</span>
              </label>
              {CITIES.map(c => (
                <label key={c} className={`filter-radio ${city === c ? 'selected' : ''}`}>
                  <input type="radio" name="city" checked={city === c} onChange={() => { setCity(c); setPage(0); }} />
                  <span>{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Practice Area Filter */}
          <div className="filter-section">
            <h3 className="filter-title">مجال التخصص</h3>
            <div className="filter-options">
              {PRACTICE_AREAS.map(pa => (
                <label key={pa.value} className={`filter-chip ${practiceArea === pa.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="practice"
                    checked={practiceArea === pa.value}
                    onChange={() => { setPracticeArea(practiceArea === pa.value ? '' : pa.value); setPage(0); }}
                  />
                  <span>{pa.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h3 className="filter-title">التقييم</h3>
            <div className="filter-options">
              {RATING_OPTIONS.map(r => (
                <label key={r.value} className={`filter-radio ${minRating === r.value ? 'selected' : ''}`}>
                  <input type="radio" name="rating" checked={minRating === r.value} onChange={() => { setMinRating(minRating === r.value ? '' : r.value); setPage(0); }} />
                  <span className="rating-filter-label">
                    <span className="star-icon filled">★</span> {r.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="filter-section">
            <h3 className="filter-title">خيارات إضافية</h3>
            <label className={`filter-toggle ${hasPhone ? 'selected' : ''}`}>
              <input type="checkbox" checked={hasPhone} onChange={() => { setHasPhone(!hasPhone); setPage(0); }} />
              <span>لديه رقم هاتف</span>
            </label>
            <label className={`filter-toggle ${hasWebsite ? 'selected' : ''}`}>
              <input type="checkbox" checked={hasWebsite} onChange={() => { setHasWebsite(!hasWebsite); setPage(0); }} />
              <span>لديه موقع إلكتروني</span>
            </label>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="btn-clear" onClick={clearFilters}>مسح الكل</button>
          <button className="btn-apply" onClick={() => setSidebarOpen(false)}>عرض النتائج</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="directory-content">
        {/* Top Bar */}
        <div className="directory-topbar">
          <div className="topbar-right">
            <h1>دليل المحامين السعوديين</h1>
            <span className="results-badge">{loading ? '...' : total.toLocaleString('ar-SA')} محامي</span>
          </div>
        </div>

        {/* Search + Quick Filters */}
        <div className="search-filters-row">
          <form className="dir-search" onSubmit={handleSearch}>
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              type="text"
              placeholder="ابحث باسم المحامي أو المكتب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">ابحث</button>
          </form>

          <div className="quick-filters">
            <button
              className={`qf-btn ${sidebarOpen ? 'active' : ''}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
              الفلاتر
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>

            {/* Quick practice area pills */}
            {PRACTICE_AREAS.slice(0, 6).map(pa => (
              <button
                key={pa.value}
                className={`qf-pill ${practiceArea === pa.value ? 'active' : ''}`}
                onClick={() => { setPracticeArea(practiceArea === pa.value ? '' : pa.value); setPage(0); }}
              >
                {pa.label}
              </button>
            ))}
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="active-filters">
              {city && (
                <span className="active-tag">
                  {city}
                  <button onClick={() => { setCity(''); setPage(0); }}>✕</button>
                </span>
              )}
              {practiceArea && (
                <span className="active-tag">
                  {PRACTICE_AREAS.find(p => p.value === practiceArea)?.label || practiceArea}
                  <button onClick={() => { setPracticeArea(''); setPage(0); }}>✕</button>
                </span>
              )}
              {minRating && (
                <span className="active-tag">
                  تقييم {minRating}+
                  <button onClick={() => { setMinRating(''); setPage(0); }}>✕</button>
                </span>
              )}
              {hasPhone && (
                <span className="active-tag">
                  رقم هاتف
                  <button onClick={() => { setHasPhone(false); setPage(0); }}>✕</button>
                </span>
              )}
              {hasWebsite && (
                <span className="active-tag">
                  موقع إلكتروني
                  <button onClick={() => { setHasWebsite(false); setPage(0); }}>✕</button>
                </span>
              )}
              <button className="clear-all-btn" onClick={clearFilters}>مسح الكل</button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="results-list">
          {loading ? (
            <div className="loading-state">
              {[1,2,3].map(i => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-body">
                    <div className="skeleton-line w60" />
                    <div className="skeleton-line w40" />
                    <div className="skeleton-line w80" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            lawyers.map((lawyer, idx) => (
              <Link href={`/lawyers/${lawyer.slug}`} key={lawyer.id} className="result-card">
                <div className="card-rank">{page * PER_PAGE + idx + 1}</div>

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
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="dir-pagination">
            <button
              className="page-link"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="9 18 15 12 9 6"/></svg>
              السابق
            </button>

            <div className="page-numbers">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) pageNum = i;
                else if (page < 3) pageNum = i;
                else if (page > totalPages - 4) pageNum = totalPages - 7 + i;
                else pageNum = page - 3 + i;
                if (pageNum >= totalPages || pageNum < 0) return null;
                return (
                  <button
                    key={pageNum}
                    className={`page-num ${pageNum === page ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {(pageNum + 1).toLocaleString('ar-SA')}
                  </button>
                );
              })}
            </div>

            <button
              className="page-link"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              التالي
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
