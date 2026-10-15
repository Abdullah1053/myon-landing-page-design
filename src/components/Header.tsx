import React, { useState, useEffect } from 'react';

interface HeaderProps {
  onNavigate?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const [isSolid, setIsSolid] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsSolid(currentScrollY > 50);

      if (currentScrollY > 160) {
        if (currentScrollY > lastScrollY) {
          setIsHidden(true); // scrolling down
        } else {
          setIsHidden(false); // scrolling up
        }
      } else {
        setIsHidden(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    if (onNavigate) {
      onNavigate(targetId);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <header id="header" className={`${isSolid ? 'solid' : ''} ${isHidden ? 'hidden' : ''}`}>
        <a
          className="header-logo"
          href="#hero"
          aria-label="ميون"
          onClick={(e) => handleLinkClick(e, '#hero')}
        >
          <img src="/assets/logo-colored.png" alt="شعار ميون" id="headerLogoImg" />
        </a>

        <nav id="main-nav" aria-label="التنقل الرئيسي">
          <a href="#services" onClick={(e) => handleLinkClick(e, '#services')}>
            خدماتنا
          </a>
          <a href="#why" onClick={(e) => handleLinkClick(e, '#why')}>
            لماذا ميون
          </a>
          <a href="#process" onClick={(e) => handleLinkClick(e, '#process')}>
            كيف نعمل
          </a>
          <a href="#experience" onClick={(e) => handleLinkClick(e, '#experience')}>
            مشاريعنا في اليمن
          </a>
          <a
            className="nav-cta"
            href="#cta"
            onClick={(e) => handleLinkClick(e, '#cta')}
          >
            تواصل معنا
          </a>
        </nav>

        <button
          className="menu-toggle"
          aria-label="القائمة"
          id="menuToggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(20,24,30,0.7)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '36px 28px',
              width: 'min(360px, 90vw)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <img src="/assets/logo-colored.png" alt="ميون" style={{ height: '36px' }} />
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text)',
                }}
              >
                &times;
              </button>
            </div>
            <a
              href="#services"
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '18px', fontWeight: 600 }}
              onClick={(e) => handleLinkClick(e, '#services')}
            >
              خدماتنا
            </a>
            <a
              href="#why"
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '18px', fontWeight: 600 }}
              onClick={(e) => handleLinkClick(e, '#why')}
            >
              لماذا ميون
            </a>
            <a
              href="#process"
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '18px', fontWeight: 600 }}
              onClick={(e) => handleLinkClick(e, '#process')}
            >
              كيف نعمل
            </a>
            <a
              href="#experience"
              style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '18px', fontWeight: 600 }}
              onClick={(e) => handleLinkClick(e, '#experience')}
            >
              مشاريعنا في اليمن
            </a>
            <a
              className="btn btn-primary"
              href="#cta"
              style={{ marginTop: '10px' }}
              onClick={(e) => handleLinkClick(e, '#cta')}
            >
              تواصل معنا
            </a>
          </div>
        </div>
      )}
    </>
  );
};
