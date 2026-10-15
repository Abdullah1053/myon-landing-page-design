import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [percent, setPercent] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const brandHeroRef = useRef<HTMLDivElement>(null);
  const stripesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock scroll during preloading
    document.body.style.overflow = 'hidden';

    const target = 100;
    const duration = 1800; // 1.8 seconds smooth progress
    const startTime = performance.now();
    let animId: number;

    const updatePreloader = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Cubic ease out
      const eased = Math.min(1, 1.001 - Math.pow(2, -10 * progress));
      const count = Math.floor(eased * target);
      setPercent(count);

      if (progress < 1) {
        animId = requestAnimationFrame(updatePreloader);
      } else {
        setPercent(100);
        setTimeout(finishAnimation, 220);
      }
    };

    animId = requestAnimationFrame(updatePreloader);

    function finishAnimation() {
      document.body.style.overflow = '';

      if (brandHeroRef.current && stripesRef.current) {
        const stripes = stripesRef.current.querySelectorAll('.loader-stripe');
        const exitTl = gsap.timeline();

        // 1. Fade out brand hero
        exitTl.to(brandHeroRef.current, {
          opacity: 0,
          y: -22,
          scale: 0.94,
          duration: 0.4,
          ease: 'power2.inOut',
        });

        // 2. Cascade orange stripes up
        exitTl.to(
          stripes,
          {
            yPercent: -100,
            duration: 0.82,
            stagger: 0.07,
            ease: 'power4.inOut',
            onComplete: () => {
              setIsVisible(false);
              if (onComplete) onComplete();
            },
          },
          '+=0.06'
        );
      } else {
        setIsVisible(false);
        if (onComplete) onComplete();
      }
    }

    return () => {
      cancelAnimationFrame(animId);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div id="preloader" ref={preloaderRef} className="preloader-overlay" aria-label="شاشة التحميل">
      {/* Cascading Vertical Orange Stripes (#E85B1A) */}
      <div className="preloader-stripes" ref={stripesRef} id="preloaderStripes">
        <div className="loader-stripe"></div>
        <div className="loader-stripe"></div>
        <div className="loader-stripe"></div>
        <div className="loader-stripe"></div>
        <div className="loader-stripe"></div>
      </div>

      {/* Central Brand Hero */}
      <div className="preloader-brand-hero" ref={brandHeroRef} id="preloaderBrand">
        <div className="preloader-logo-wrap">
          <img src="/assets/logo-white.png" alt="شعار ميون" className="preloader-logo-img" />
          <span className="preloader-logo-sheen"></span>
        </div>

        <div className="preloader-brand-copy">
          <h2 className="preloader-company-name">شركة ميون للمقاولات والخدمات اللوجستية</h2>
          <p className="preloader-tagline">MYON CONTRACTING &amp; LOGISTICS</p>
        </div>

        {/* Animated Underline & Progress Meter */}
        <div className="preloader-line-meter">
          <div className="preloader-track">
            <div
              className="preloader-bar"
              id="loaderBar"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <div className="preloader-counter-wrap">
            <span className="preloader-counter" id="loaderPercent">
              {percent < 10 ? `0${percent}` : percent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
