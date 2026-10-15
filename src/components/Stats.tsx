import React, { useEffect, useRef, useState } from 'react';

export const Stats: React.FC = () => {
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    clients: 0,
    experience: 0,
    sectors: 0,
    satisfaction: 0,
  });
  const sectionRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const startCounter = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const dur = 1600;
      const t0 = performance.now();
      const targets = {
        clients: 10,
        experience: 6,
        sectors: 4,
        satisfaction: 100,
      };

      const step = (now: number) => {
        const p = Math.min((now - t0) / dur, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setCounts({
          clients: Math.round(ease * targets.clients),
          experience: Math.round(ease * targets.experience),
          sectors: Math.round(ease * targets.sectors),
          satisfaction: Math.round(ease * targets.satisfaction),
        });
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((x) => {
            if (x.isIntersecting) {
              startCounter();
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.3 }
      );
      io.observe(el);
      return () => io.disconnect();
    } else {
      startCounter();
    }
  }, []);

  return (
    <section id="stats" ref={sectionRef} data-ambient="#FFFFFF" data-glow=".1">
      <div className="wrap">
        <div className="stats-grid">
          <div className="stat-item in">
            <div className="stat-num">
              <span className="count-val">{counts.clients}</span>
              <span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">عملاء يثقون بنا</div>
          </div>

          <div className="stat-item in">
            <div className="stat-num">
              <span className="count-val">{counts.experience}</span>
              <span className="stat-suffix">+</span>
            </div>
            <div className="stat-label">سنوات من الخبرة</div>
          </div>

          <div className="stat-item in">
            <div className="stat-num">
              <span className="count-val">{counts.sectors}</span>
              <span className="stat-suffix"></span>
            </div>
            <div className="stat-label">قطاعات خدمية</div>
          </div>

          <div className="stat-item in">
            <div className="stat-num">
              <span className="count-val">{counts.satisfaction}</span>
              <span className="stat-suffix">%</span>
            </div>
            <div className="stat-label">رضا العملاء</div>
          </div>
        </div>
      </div>
    </section>
  );
};
