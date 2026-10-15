import React from 'react';

interface FooterProps {
  onNavigate?: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/assets/logo-colored.png" alt="ميون مقاولات ولوجستيات" />
            <p className="footer-desc">
              ميون الاقتصادية تجمع بين الخبرة والاستثناء لتقديم خدمات متكاملة تلبي التوقعات وتحقق احتياجات عملائنا في مختلف القطاعات الاقتصادية.
            </p>
            <div className="footer-socials">
              <a
                className="footer-social"
                href="https://www.instagram.com/meayon.sa/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
              >
                <svg viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                className="footer-social"
                href="https://x.com/meayonsa"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إكس"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a className="footer-social" href="mailto:info@myon.sa" aria-label="البريد الإلكتروني">
                <svg viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>روابطنا</h5>
            <ul>
              <li>
                <a href="#services" onClick={(e) => handleNav(e, 'services')}>
                  خدماتنا
                </a>
              </li>
              <li>
                <a href="#why" onClick={(e) => handleNav(e, 'why')}>
                  لماذا ميون
                </a>
              </li>
              <li>
                <a href="#process" onClick={(e) => handleNav(e, 'process')}>
                  كيف نعمل
                </a>
              </li>
              <li>
                <a href="#experience" onClick={(e) => handleNav(e, 'experience')}>
                  مشاريعنا في اليمن
                </a>
              </li>
              <li>
                <a href="#cta" onClick={(e) => handleNav(e, 'cta')}>
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>خدماتنا</h5>
            <ul>
              <li>
                <a href="#services" onClick={(e) => handleNav(e, 'services')}>
                  المقاولات والإنشاءات
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleNav(e, 'services')}>
                  خدمات النقل
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleNav(e, 'services')}>
                  الخدمات النفطية
                </a>
              </li>
              <li>
                <a href="#services" onClick={(e) => handleNav(e, 'services')}>
                  الشحن والتخليص الجمركي
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-cr">
            حقوق النشر &copy; 2025 — <a href="#">ميون للمقاولات واللوجستيات</a>. جميع الحقوق محفوظة.
          </div>
          <div className="footer-cr">
            <span className="latin" style={{ fontSize: '11px', letterSpacing: '.2em', color: 'var(--text-faint)' }}>
              MYON · KSA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
