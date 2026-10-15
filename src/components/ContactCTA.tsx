import React from 'react';

export const ContactCTA: React.FC = () => {
  return (
    <section id="cta" data-ambient="#FFFFFF" data-glow=".22">
      <div className="wrap">
        <div className="cta-block">
          <div className="cta-bg-glow" aria-hidden="true"></div>
          <span className="eyebrow reveal latin">Ready to start?</span>
          <h2 className="reveal">
            خطوتك<br />
            <span className="orange-text">التالية</span><br />
            تبدأ الآن
          </h2>
          <p className="reveal">
            تواصل مع فريقنا المتخصص وابدأ رحلتك نحو النجاح بحلول متكاملة تلبي طموحاتك وتتجاوز توقعاتك.
          </p>
          <div className="cta-buttons reveal">
            <a className="btn btn-primary" href="mailto:info@myon.sa">
              تواصل معنا الآن
            </a>
            <a className="btn btn-ghost" href="#services">
              استكشف خدماتنا
            </a>
          </div>
          <div className="cta-contact reveal">
            <a href="mailto:info@myon.sa">
              <svg viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              info@myon.sa
            </a>
            <a href="https://www.instagram.com/meayon.sa/" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
              @meayon.sa
            </a>
            <a href="https://x.com/meayonsa" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
              @meayonsa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
