'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CITIES = [
  'الرياض', 'جدة', 'الدمام والخبر والظهران', 'مكة المكرمة', 'المدينة المنورة',
  'الطائف', 'تبوك', 'أبها', 'خميس مشيط', 'بريدة', 'حائل', 'نجران', 'جازان',
  'الأحساء', 'ينبع', 'الجبيل',
];

const PER_PAGE = 20;

export default function LawyersPage() {
  const searchParams = useSearchParams();
  const [lawyers, setLawyers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minRating, setMinRating] = useState('');
  const [hasPhone, setHasPhone] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchLawyers();
  }, [page, city, minRating, hasPhone]);

  async function fetchLawyers() {
    setLoading(true);
    let query = supabase
      .from('lawyers')
      .select('*', { count: 'exact' })
      .order('rating', { ascending: false, nullsFirst: false })
      .order('ratings_count', { ascending: false })
      .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }
    if (city) {
      query = query.eq('source_city', city);
    }
    if (minRating) {
      query = query.gte('rating', parseFloat(minRating));
    }
    if (hasPhone) {
      query = query.neq('phone_international', '');
    }

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

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <main>
      <section className="browse-header">
        <h1>تصفح المحامين</h1>
        {/* Search */}
        <div className="search-container">
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="ابحث باسم المحامي أو المكتب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍 ابحث</button>
          </form>
        </div>

        {/* Filters */}
        <div className="filters-bar" style={{ marginTop: '20px' }}>
          <select
            className="filter-btn"
            value={city}
            onChange={(e) => { setCity(e.target.value); setPage(0); }}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            <option value="">كل المدن</option>
            {CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            className="filter-btn"
            value={minRating}
            onChange={(e) => { setMinRating(e.target.value); setPage(0); }}
            style={{ padding: '8px 16px', cursor: 'pointer' }}
          >
            <option value="">كل التقييمات</option>
            <option value="4.5">⭐ 4.5+</option>
            <option value="4">⭐ 4+</option>
            <option value="3">⭐ 3+</option>
          </select>
          <button
            className={`filter-btn ${hasPhone ? 'active' : ''}`}
            onClick={() => { setHasPhone(!hasPhone); setPage(0); }}
          >
            📞 لديه هاتف
          </button>
        </div>
      </section>

      <section className="browse-results">
        <div className="container">
          <p className="results-count">
            {loading ? 'جاري البحث...' : `عرض ${total} نتيجة`}
          </p>

          {!loading && (
            <div className="lawyers-grid">
              {lawyers.map(lawyer => (
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
                      {lawyer.opening_hours && (
                        <span className="meta-tag">🕐 ساعات</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {page > 0 && (
                <button className="page-btn" onClick={() => setPage(page - 1)}>→</button>
              )}
              {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                const pageNum = page < 5 ? i : page - 4 + i;
                if (pageNum >= totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={`page-btn ${pageNum === page ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              {page < totalPages - 1 && (
                <button className="page-btn" onClick={() => setPage(page + 1)}>←</button>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
