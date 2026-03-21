import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const metadata = {
  title: 'المدن | دليل المحامين السعوديين',
  description: 'تصفح المحامين حسب المدينة في المملكة العربية السعودية — الرياض، جدة، الدمام، مكة، المدينة، وأكثر.',
};

export default async function CitiesPage() {
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .order('lawyer_count', { ascending: false });

  const cityIcons = {
    'riyadh': '🏙️', 'jeddah': '🌊', 'dammam-khobar': '🏗️', 'mecca': '🕋',
    'medina': '🕌', 'taif': '🌹', 'tabuk': '🏔️', 'abha': '⛰️',
    'khamis': '🌿', 'buraydah': '🌴', 'hail': '🏜️', 'najran': '🌅',
    'jazan': '🐠', 'al-ahsa': '🌾', 'yanbu': '⚓', 'jubail': '🏭',
  };

  return (
    <main>
      <section className="browse-header">
        <h1>تصفح حسب المدينة</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
          اختر مدينتك للعثور على المحامين القريبين منك
        </p>
      </section>

      <section className="section">
        <div className="container">
          <div className="cities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {cities?.map(city => (
              <Link href={`/cities/${city.slug}`} key={city.slug}>
                <div className="city-card" style={{ padding: '32px 24px' }}>
                  <div className="city-icon">{cityIcons[city.slug] || '🏛️'}</div>
                  <h3>{city.name_ar}</h3>
                  <div className="city-count">{city.lawyer_count} محامي</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
