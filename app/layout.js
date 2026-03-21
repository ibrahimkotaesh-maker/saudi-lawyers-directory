import "./globals.css";

export const metadata = {
  metadataBase: new URL('https://www.dalil-almuhameen.com'),
  title: "دليل المحامين السعوديين | أكبر دليل للمحامين في المملكة",
  description: "ابحث عن أفضل المحامين ومكاتب المحاماة في السعودية. تقييمات حقيقية، أرقام هواتف، مواقع إلكترونية، وساعات عمل لأكثر من 1,170 محامي في 16 مدينة سعودية.",
  keywords: "محامي, محامين, مكتب محاماة, مستشار قانوني, السعودية, الرياض, جدة, الدمام",
  verification: {
    google: "ejFjTme3HsC5WZTaKwI7BWIF_9onC0gZ_JebhIoh_TQ",
  },
  openGraph: {
    title: "دليل المحامين السعوديين",
    description: "أكبر دليل للمحامين في المملكة العربية السعودية — أكثر من 1,170 محامي في 16 مدينة",
    locale: "ar_SA",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {/* Navigation */}
        <nav className="nav">
          <div className="nav-inner">
            <a href="/" className="nav-logo">
              <div className="nav-logo-icon">⚖️</div>
              دليل المحامين
            </a>
            <ul className="nav-links">
              <li><a href="/">الرئيسية</a></li>
              <li><a href="/lawyers">المحامين</a></li>
              <li><a href="/cities">المدن</a></li>
              <li><a href="/faq">أسئلة شائعة</a></li>
            </ul>
          </div>
        </nav>

        {children}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-inner">
            <div className="footer-brand">
              <h3>⚖️ دليل المحامين السعوديين</h3>
              <p>أكبر دليل شامل للمحامين ومكاتب المحاماة في المملكة العربية السعودية. بيانات محدثة لأكثر من 1,170 محامي.</p>
            </div>
            <div className="footer-links">
              <h4>المدن الرئيسية</h4>
              <ul>
                <li><a href="/cities/riyadh">الرياض</a></li>
                <li><a href="/cities/jeddah">جدة</a></li>
                <li><a href="/cities/dammam-khobar">الدمام</a></li>
                <li><a href="/cities/mecca">مكة المكرمة</a></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>روابط سريعة</h4>
              <ul>
                <li><a href="/lawyers">تصفح المحامين</a></li>
                <li><a href="/cities">تصفح المدن</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} دليل المحامين السعوديين — جميع الحقوق محفوظة</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
