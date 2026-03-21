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
          <div className="cities-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
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
    </main>
  );
}
