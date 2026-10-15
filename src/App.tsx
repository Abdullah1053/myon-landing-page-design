import React, { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Preloader } from './components/Preloader';
import { AmbientFX } from './components/AmbientFX';
import { Header } from './components/Header';
import { HeroStage } from './components/HeroStage';
import { Ticker } from './components/Ticker';
import { Services } from './components/Services';
import { WhyUs } from './components/WhyUs';
import { Stats } from './components/Stats';
import { Process } from './components/Process';
import { YemenMapExperience } from './components/YemenMapExperience';
import { ContactCTA } from './components/ContactCTA';
import { Footer } from './components/Footer';
import { SpecModal } from './components/SpecModal';
import './style.css';

gsap.registerPlugin(ScrollTrigger);

// Prevent mobile browser address bar expand/collapse from causing scroll jump
ScrollTrigger.config({
  ignoreMobileResize: true,
});

export const App: React.FC = () => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const lenisRef = React.useRef<Lenis | null>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const isMobileWidth = typeof window !== 'undefined' && window.innerWidth <= 768;
    const isPhoneTouch = isTouch || isMobileWidth;
    const progressEl = document.getElementById('progress');

    // Lenis Smooth Scroll configured with firmer touch resistance and controlled damping on phones
    if (!reduceMotion) {
      const lenis = new Lenis({
        duration: isPhoneTouch ? 1.25 : 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: isPhoneTouch ? 0.6 : 1.0, // Substantially firmer touch scrolling resistance on phones
        wheelMultiplier: 0.95,
      });
      lenisRef.current = lenis;

      lenis.on('scroll', (e: any) => {
        ScrollTrigger.update();
        if (progressEl && e && typeof e.progress === 'number') {
          progressEl.style.transform = `scaleX(${e.progress})`;
        }
      });

      gsap.ticker.add((time) => lenis.raf(time * 1000));
      // lagSmoothing prevents violent jumps when minor frame stalls occur
      gsap.ticker.lagSmoothing(500, 33);
    } else {
      // Fallback progress bar for reduced motion
      const updateProgress = () => {
        if (progressEl) {
          const scrolled = window.scrollY;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const progress = maxScroll > 0 ? scrolled / maxScroll : 0;
          progressEl.style.transform = `scaleX(${progress})`;
        }
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
    }

    // Section Ambient Background Colors
    const ambientEl = document.getElementById('ambient');
    const glowEl = document.getElementById('glow');

    const sections = document.querySelectorAll('section[data-ambient]');
    sections.forEach((sec) => {
      const c = sec.getAttribute('data-ambient');
      const g = parseFloat(sec.getAttribute('data-glow') || '.4');
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => {
          if (ambientEl && c) gsap.to(ambientEl, { backgroundColor: c, duration: 0.8, overwrite: 'auto' });
          if (glowEl) gsap.to(glowEl, { opacity: g, duration: 0.8, overwrite: 'auto' });
        },
        onEnterBack: () => {
          if (ambientEl && c) gsap.to(ambientEl, { backgroundColor: c, duration: 0.8, overwrite: 'auto' });
          if (glowEl) gsap.to(glowEl, { opacity: g, duration: 0.8, overwrite: 'auto' });
        },
      });
    });

    // Reveal animations
    const reveals = document.querySelectorAll('.reveal, .reveal-left');
    reveals.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => el.classList.add('in'),
      });
    });

    ScrollTrigger.refresh();

    return () => {
      if (lenisRef.current) lenisRef.current.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const handleNavigate = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { offset: 0 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handlePreloaderComplete = () => {
    ScrollTrigger.refresh();
  };

  return (
    <div className="app-container">
      <Preloader onComplete={handlePreloaderComplete} />
      <AmbientFX />
      <Header onNavigate={handleNavigate} />

      <main>
        <HeroStage onOpenHotspot={(type) => setActiveHotspot(type)} />
        <Ticker />
        <Services />
        <WhyUs />
        <Stats />
        <Process />
        <YemenMapExperience />
        <ContactCTA />
      </main>

      <Footer onNavigate={handleNavigate} />
      <SpecModal hotspotType={activeHotspot} onClose={() => setActiveHotspot(null)} />
    </div>
  );
};

export default App;
