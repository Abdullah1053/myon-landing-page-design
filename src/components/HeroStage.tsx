import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroStageProps {
  onOpenHotspot: (type: string) => void;
}

export const HeroStage: React.FC<HeroStageProps> = ({ onOpenHotspot }) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const stickyStageRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const containerGyroRef = useRef<HTMLDivElement>(null);
  const stage1HeadlinesRef = useRef<HTMLDivElement>(null);
  const stage2StatementRef = useRef<HTMLDivElement>(null);
  const stage3InspectionRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  // SVG Elements
  const orangeSkinRef = useRef<SVGGElement>(null);
  const hookBlockRef = useRef<SVGGElement>(null);
  const verticalCableRef = useRef<SVGLineElement>(null);
  const sling1Ref = useRef<SVGLineElement>(null);
  const sling2Ref = useRef<SVGLineElement>(null);
  const sling3Ref = useRef<SVGLineElement>(null);
  const sling4Ref = useRef<SVGLineElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const stickyStage = stickyStageRef.current;
    const hookBlock = hookBlockRef.current;
    const verticalCable = verticalCableRef.current;
    const sling1 = sling1Ref.current;
    const sling2 = sling2Ref.current;
    const sling3 = sling3Ref.current;
    const sling4 = sling4Ref.current;
    const orangeSkin = orangeSkinRef.current;
    const containerGyro = containerGyroRef.current;
    const bgLayer = bgLayerRef.current;

    if (!stage || !stickyStage) return;

    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);

    // Crane Hoist Rigging Updater without DOM readback
    const updateCrane = (yVal: number) => {
      const curY = 55 + yVal;
      if (hookBlock) {
        hookBlock.style.transform = `translate3d(430px, ${curY.toFixed(2)}px, 0)`;
      }
      if (verticalCable) verticalCable.setAttribute('y2', curY.toFixed(2));
      const apexY = (curY + 24).toFixed(2);
      if (sling1) sling1.setAttribute('y1', apexY);
      if (sling2) sling2.setAttribute('y1', apexY);
      if (sling3) sling3.setAttribute('y1', apexY);
      if (sling4) sling4.setAttribute('y1', apexY);
    };

    // Numerical State Objects for Zero-Reflow Interpolation
    const hookState = { y: 0 };
    const animState = {
      rotY: 0,
      rotX: 0,
      transY: 0,
    };

    // Master ScrollTrigger Timeline across the scroll stage
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: isTouch ? 0.45 : 0.7,
        fastScrollEnd: true,
        preventOverlaps: true,
      },
    });

    // ── STAGE 1 -> STAGE 2 (0.0 to 0.50)
    tl.to(stage1HeadlinesRef.current, { opacity: 0, y: -35, duration: 0.28 }, 0)
      .to(bgLayer, { backgroundColor: '#E85B1A', duration: 0.32 }, 0.15)
      .to(orangeSkin, { opacity: 1, duration: 0.28 }, 0.18)
      .to(
        hookState,
        {
          y: 55,
          duration: 0.42,
          ease: 'none',
          onUpdate: () => updateCrane(hookState.y),
        },
        0.1
      )
      .to(
        animState,
        {
          rotY: 14,
          rotX: -4,
          transY: 25,
          duration: 0.35,
          ease: 'power1.inOut',
        },
        0.1
      )
      .fromTo(
        stage2StatementRef.current,
        { opacity: 0, scale: 0.94, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22 },
        0.26
      )
      .to(stage2StatementRef.current, { opacity: 1, duration: 0.22 }, 0.48)
      .to(stage2StatementRef.current, { opacity: 0, scale: 1.04, y: -25, duration: 0.18 }, 0.7)
      // ── STAGE 2 -> STAGE 3 (0.50 to 1.0)
      .to(bgLayer, { backgroundColor: '#F8F9FA', duration: 0.24 }, 0.68)
      .to(orangeSkin, { opacity: 0.15, duration: 0.24 }, 0.7)
      .to(
        animState,
        {
          rotY: -8,
          rotX: 3,
          duration: 0.25,
          ease: 'power1.inOut',
        },
        0.45
      )
      .to(
        animState,
        {
          rotY: 0,
          rotX: 0,
          transY: 10,
          duration: 0.24,
          ease: 'power1.out',
        },
        0.72
      )
      .to(
        hookState,
        {
          y: 20,
          duration: 0.24,
          ease: 'power1.out',
          onUpdate: () => updateCrane(hookState.y),
        },
        0.74
      )
      .fromTo(
        stage3InspectionRef.current,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.22 },
        0.76
      )
      .to(scrollCueRef.current, { opacity: 0, duration: 0.1 }, 0.85);

    // High-performance Gyro / Organic Sway Loop
    let targetGyroX = 0;
    let targetGyroY = 0;
    let currentGyroX = 0;
    let currentGyroY = 0;
    let gyroRaf: number;
    let swayTime = 0;

    const onPointerMove = (e: PointerEvent) => {
      // Don't hijack or stutter touch scrolls on mobile
      if (e.pointerType === 'touch') return;
      const rect = stickyStage.getBoundingClientRect();
      targetGyroX = (e.clientX - rect.left) / rect.width - 0.5;
      targetGyroY = (e.clientY - rect.top) / rect.height - 0.5;
    };

    const onPointerLeave = () => {
      targetGyroX = 0;
      targetGyroY = 0;
    };

    stickyStage.addEventListener('pointermove', onPointerMove, { passive: true });
    stickyStage.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const gyroLoop = () => {
      gyroRaf = requestAnimationFrame(gyroLoop);

      if (isTouch) {
        // Luxury organic breathing tilt for phone view
        swayTime += 0.02;
        targetGyroX = Math.sin(swayTime * 0.7) * 0.08;
        targetGyroY = Math.cos(swayTime * 0.5) * 0.05;
      }

      currentGyroX += (targetGyroX - currentGyroX) * 0.08;
      currentGyroY += (targetGyroY - currentGyroY) * 0.08;

      if (containerGyro) {
        const finalRotY = animState.rotY + currentGyroX * 12;
        const finalRotX = animState.rotX - currentGyroY * 8;
        const finalTransY = animState.transY;

        containerGyro.style.transform = `translate3d(0, ${finalTransY.toFixed(2)}px, 0) rotateY(${finalRotY.toFixed(2)}deg) rotateX(${finalRotX.toFixed(2)}deg)`;
      }
    };
    gyroLoop();

    return () => {
      tl.kill();
      cancelAnimationFrame(gyroRaf);
      stickyStage.removeEventListener('pointermove', onPointerMove);
      stickyStage.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <section id="hero" ref={stageRef} className="hero-scroll-stage" data-ambient="#FFFFFF" data-glow=".18">
      <div className="theatrical-sticky-stage" ref={stickyStageRef} id="theatricalStage">
        {/* Dynamic Stage Background Layer */}
        <div className="theatrical-bg-layer" ref={bgLayerRef} id="theatricalBg"></div>
        <div className="theatrical-vignette" id="theatricalVignette"></div>

        {/* Stage 1 Headlines (0% - 25% Scroll) */}
        <div className="theatrical-headlines" ref={stage1HeadlinesRef} id="stage1Headlines">
          <div className="stage1-top">
            <span className="theatrical-eyebrow">شركة ميون للمقاولات والخدمات اللوجستية</span>
            <h1 className="display-title-ar">
              دقة <span className="orange-word">وإنجاز</span>
            </h1>
            <p className="display-sub-ar">
              منظومة نقل وتوريد متكاملة — نصل بكل شحنة إلى وجهتها بأعلى معايير الأمان والسرعة والاحترافية
            </p>
          </div>

          {/* Luxury Architectural Display Watermarks */}
          <div className="stage1-watermark stage1-wm-left" aria-hidden="true">
            PRECISION
          </div>
          <div className="stage1-watermark stage1-wm-right" aria-hidden="true">
            DELIVERY
          </div>

          {/* Trust Badges */}
          <div className="stage1-badges">
            <div className="stage1-badge">
              <span className="badge-dot"></span>
              <span>ISO 9001 / 14001 CERTIFIED</span>
            </div>
            <div className="stage1-badge">
              <span className="badge-dot"></span>
              <span>24/7 SATELLITE FLEET MONITORING</span>
            </div>
            <div className="stage1-badge">
              <span className="badge-dot"></span>
              <span>KSA &amp; REGIONAL LOGISTICS</span>
            </div>
          </div>
        </div>

        {/* The 3D Isometric SVG Container Wrapper with Crane Rigging */}
        <div className="container-3d-scene" id="containerScene">
          <div className="container-gyro-wrapper" ref={containerGyroRef} id="containerGyro">
            <svg
              id="shippingContainerSvg"
              viewBox="0 0 920 620"
              xmlns="http://www.w3.org/2000/svg"
              className="container-svg"
              aria-label="حاوية ميون ثلاثية الأبعاد"
            >
              <defs>
                {/* White Edition Gradients */}
                <linearGradient id="roofGradWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EEF2F6" />
                  <stop offset="45%" stopColor="#E2E7ED" />
                  <stop offset="100%" stopColor="#CBD2DC" />
                </linearGradient>
                <linearGradient id="doorGradWhite" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#D7DEE7" />
                  <stop offset="100%" stopColor="#B8C2CF" />
                </linearGradient>
                <linearGradient id="sideWallGradWhite" x1="0%" y1="0%" x2="100%" y2="60%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="35%" stopColor="#F4F6F9" />
                  <stop offset="75%" stopColor="#E5EAF0" />
                  <stop offset="100%" stopColor="#D5DCE5" />
                </linearGradient>

                {/* Orange Edition Gradients */}
                <linearGradient id="roofGradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FF7A33" />
                  <stop offset="50%" stopColor="#E85B1A" />
                  <stop offset="100%" stopColor="#C74A10" />
                </linearGradient>
                <linearGradient id="doorGradOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C74A10" />
                  <stop offset="100%" stopColor="#943206" />
                </linearGradient>
                <linearGradient id="sideWallGradOrange" x1="0%" y1="0%" x2="100%" y2="60%">
                  <stop offset="0%" stopColor="#FF7329" />
                  <stop offset="35%" stopColor="#E85B1A" />
                  <stop offset="70%" stopColor="#D84E0F" />
                  <stop offset="100%" stopColor="#B83D06" />
                </linearGradient>

                {/* Metal Trim Gradients */}
                <linearGradient id="metalRailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4F5866" />
                  <stop offset="50%" stopColor="#2D333C" />
                  <stop offset="100%" stopColor="#191D22" />
                </linearGradient>
                <linearGradient id="cableGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6B7584" />
                  <stop offset="50%" stopColor="#9BA6B5" />
                  <stop offset="100%" stopColor="#4A5260" />
                </linearGradient>
                <linearGradient id="hookSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#737D8C" />
                  <stop offset="40%" stopColor="#343B45" />
                  <stop offset="100%" stopColor="#1A1E24" />
                </linearGradient>

                {/* Contact Shadow Filter */}
                <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(20,24,32,0.38)" />
                  <stop offset="50%" stopColor="rgba(20,24,32,0.18)" />
                  <stop offset="100%" stopColor="rgba(20,24,32,0)" />
                </radialGradient>
              </defs>

              {/* Ground Contact Shadow */}
              <ellipse cx="430" cy="455" rx="340" ry="70" fill="url(#groundShadow)" />

              {/* CRANE HOISTING ASSEMBLY */}
              <g id="craneHoistAssembly" className="crane-assembly">
                <line
                  ref={verticalCableRef}
                  id="craneVerticalCable"
                  x1="430"
                  y1="-80"
                  x2="430"
                  y2="55"
                  stroke="url(#cableGrad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />

                <g ref={hookBlockRef} id="craneHookBlock" transform="translate(430, 55)">
                  <path
                    d="M -14 -32 L 14 -32 L 18 -10 L 14 6 L -14 6 L -18 -10 Z"
                    fill="url(#hookSteelGrad)"
                    stroke="#A0ACB9"
                    strokeWidth="1.2"
                  />
                  <circle cx="0" cy="-14" r="8" fill="#1C2128" stroke="#D3DCE6" strokeWidth="1.5" />
                  <circle cx="0" cy="-14" r="3" fill="#A0ACB9" />
                  <rect x="-11" y="-3" width="22" height="6" fill="#E85B1A" rx="1" />
                  <line x1="-8" y1="-3" x2="-4" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
                  <line x1="-1" y1="-3" x2="3" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
                  <line x1="6" y1="-3" x2="10" y2="3" stroke="#FFFFFF" strokeWidth="1.5" />
                  <path
                    d="M 0 6 C 0 16 -12 20 -12 30 C -12 40 4 44 14 36 C 22 28 16 18 10 18 C 6 18 5 22 7 24 C 9 26 5 32 0 32 C -5 32 -7 28 -7 24 C -7 18 4 14 4 6 Z"
                    fill="url(#hookSteelGrad)"
                    stroke="#8895A5"
                    strokeWidth="1.2"
                  />
                  <line x1="-1" y1="18" x2="10" y2="19" stroke="#E85B1A" strokeWidth="2" />
                  <circle id="craneSlingApex" cx="0" cy="24" r="3.5" fill="#FFFFFF" />
                </g>

                <g id="craneSlingCables">
                  <line
                    ref={sling1Ref}
                    id="slingCable1"
                    x1="430"
                    y1="79"
                    x2="140"
                    y2="120"
                    stroke="url(#cableGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    ref={sling2Ref}
                    id="slingCable2"
                    x1="430"
                    y1="79"
                    x2="590"
                    y2="92"
                    stroke="url(#cableGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    ref={sling3Ref}
                    id="slingCable3"
                    x1="430"
                    y1="79"
                    x2="720"
                    y2="145"
                    stroke="url(#cableGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    ref={sling4Ref}
                    id="slingCable4"
                    x1="430"
                    y1="79"
                    x2="240"
                    y2="182"
                    stroke="url(#cableGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              </g>

              {/* CONTAINER BODY GROUP */}
              <g id="containerChassis">
                <polygon points="140,335 240,397 720,360 590,307" fill="#14171D" />
                <polygon points="400,380 435,377 435,389 400,392" fill="#0E1014" stroke="#3A424F" strokeWidth="1" />
                <polygon points="500,372 535,369 535,381 500,384" fill="#0E1014" stroke="#3A424F" strokeWidth="1" />

                {/* ═══ WHITE CARGO EDITION ═══ */}
                <g id="containerFaceGroupWhite" className="container-skin-white">
                  <polygon points="140,120 590,92 720,145 240,182" fill="url(#roofGradWhite)" stroke="#9DA8B6" strokeWidth="1.2" />

                  {/* Corrugation Roof Lines */}
                  <g stroke="#3A424F">
                    {[
                      { x1: 159.6, y1: 118.8, x2: 260.9, y2: 180.4 },
                      { x1: 179.1, y1: 117.6, x2: 281.7, y2: 178.8 },
                      { x1: 198.7, y1: 116.3, x2: 302.6, y2: 177.2 },
                      { x1: 218.3, y1: 115.1, x2: 323.5, y2: 175.6 },
                      { x1: 237.8, y1: 113.9, x2: 344.3, y2: 174.0 },
                      { x1: 257.4, y1: 112.7, x2: 365.2, y2: 172.3 },
                      { x1: 277.0, y1: 111.5, x2: 386.1, y2: 170.7 },
                      { x1: 296.5, y1: 110.3, x2: 407.0, y2: 169.1 },
                      { x1: 316.1, y1: 109.0, x2: 427.8, y2: 167.5 },
                      { x1: 335.7, y1: 107.8, x2: 448.7, y2: 165.9 },
                      { x1: 355.2, y1: 106.6, x2: 469.6, y2: 164.3 },
                      { x1: 374.8, y1: 105.4, x2: 490.4, y2: 162.7 },
                      { x1: 394.3, y1: 104.2, x2: 511.3, y2: 161.1 },
                      { x1: 413.9, y1: 103.0, x2: 532.2, y2: 159.5 },
                      { x1: 433.5, y1: 101.7, x2: 553.0, y2: 157.9 },
                      { x1: 453.0, y1: 100.5, x2: 573.9, y2: 156.3 },
                      { x1: 472.6, y1: 99.3, x2: 594.8, y2: 154.7 },
                      { x1: 492.2, y1: 98.1, x2: 615.7, y2: 153.0 },
                      { x1: 511.7, y1: 96.9, x2: 636.5, y2: 151.4 },
                      { x1: 531.3, y1: 95.7, x2: 657.4, y2: 149.8 },
                      { x1: 550.9, y1: 94.4, x2: 678.3, y2: 148.2 },
                      { x1: 570.4, y1: 93.2, x2: 699.1, y2: 146.6 },
                    ].map((l, i) => (
                      <React.Fragment key={i}>
                        <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.5" />
                        <line x1={l.x1 + 0.8} y1={l.y1 - 0.5} x2={l.x2 + 0.8} y2={l.y2 - 0.5} stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.2" />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* Door Face */}
                  <polygon points="140,120 240,182 240,397 140,335" fill="url(#doorGradWhite)" stroke="#7A8696" strokeWidth="1.2" />
                  <line x1="190" y1="151" x2="190" y2="366" stroke="#222830" strokeWidth="2.5" />
                  <line x1="191" y1="151" x2="191" y2="366" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="1" />

                  {/* Outer Hinges */}
                  <rect x="137" y="145" width="6" height="12" rx="1" fill="#1C2026" />
                  <rect x="137" y="200" width="6" height="12" rx="1" fill="#1C2026" />
                  <rect x="137" y="260" width="6" height="12" rx="1" fill="#1C2026" />
                  <rect x="137" y="315" width="6" height="12" rx="1" fill="#1C2026" />

                  {/* CSC Safety Plate */}
                  <rect x="150" y="280" width="28" height="18" fill="#181D24" stroke="#D3DCE6" strokeWidth="0.8" rx="1" />
                  <line x1="153" y1="285" x2="175" y2="285" stroke="#FFFFFF" strokeWidth="1.2" />
                  <line x1="153" y1="289" x2="172" y2="289" stroke="#E85B1A" strokeWidth="1" />
                  <line x1="153" y1="293" x2="168" y2="293" stroke="#FFFFFF" strokeWidth="1" />

                  {/* Mini Logo Badge on Door */}
                  <rect x="202" y="282" width="26" height="16" fill="#E85B1A" rx="2" />
                  <image href="/assets/logo-white.png" x="204" y="283" width="22" height="14" preserveAspectRatio="xMidYMid meet" />

                  {/* Locking Rods */}
                  <g>
                    {/* Rod 1 */}
                    <line x1="162" y1="128.6" x2="162" y2="353.6" stroke="#1E232A" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="162.6" y1="128.6" x2="162.6" y2="353.6" stroke="#9DA8B6" strokeWidth="1.8" strokeLinecap="round" />
                    <rect x="158" y="130.6" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <rect x="158" y="339.6" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <circle cx="162" cy="204.6" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                    <circle cx="162" cy="275.5" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />

                    {/* Rod 2 */}
                    <line x1="184" y1="142.3" x2="184" y2="367.3" stroke="#1E232A" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="184.6" y1="142.3" x2="184.6" y2="367.3" stroke="#9DA8B6" strokeWidth="1.8" strokeLinecap="round" />
                    <rect x="180" y="144.3" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <rect x="180" y="353.3" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <circle cx="184" cy="218.2" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                    <circle cx="184" cy="289.2" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                    <path d="M 184 265.5 l -16 8 l 0 16" stroke="#12161C" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="168" cy="289.5" r="3" fill="#E85B1A" />

                    {/* Rod 3 */}
                    <line x1="198" y1="151.0" x2="198" y2="376.0" stroke="#1E232A" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="198.6" y1="151.0" x2="198.6" y2="376.0" stroke="#9DA8B6" strokeWidth="1.8" strokeLinecap="round" />
                    <rect x="194" y="153.0" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <rect x="194" y="362.0" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <circle cx="198" cy="226.9" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                    <circle cx="198" cy="297.9" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                    <path d="M 198 274.2 l 16 8 l 0 16" stroke="#12161C" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="214" cy="298.2" r="3" fill="#E85B1A" />

                    {/* Rod 4 */}
                    <line x1="218" y1="163.4" x2="218" y2="388.4" stroke="#1E232A" strokeWidth="4.5" strokeLinecap="round" />
                    <line x1="218.6" y1="163.4" x2="218.6" y2="388.4" stroke="#9DA8B6" strokeWidth="1.8" strokeLinecap="round" />
                    <rect x="214" y="165.4" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <rect x="214" y="374.4" width="8" height="11" rx="2" fill="#14181F" stroke="#7A8796" strokeWidth="0.8" />
                    <circle cx="218" cy="239.3" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                    <circle cx="218" cy="310.3" r="4.5" fill="#2E3540" stroke="#8E9AA8" strokeWidth="0.8" />
                  </g>

                  {/* Long Side Wall */}
                  <polygon points="240,182 720,145 720,360 240,397" fill="url(#sideWallGradWhite)" stroke="#7A8696" strokeWidth="1.2" />

                  {/* Side Wall Ribs */}
                  <g stroke="#3A424F">
                    {Array.from({ length: 23 }, (_, idx) => {
                      const x = 260 + idx * 20;
                      const y1 = 180.5 - idx * 1.545;
                      const y2 = 395.5 - idx * 1.545;
                      return (
                        <React.Fragment key={idx}>
                          <line x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                          <line x1={x + 1.2} y1={y1} x2={x + 1.2} y2={y2} stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="1.2" />
                        </React.Fragment>
                      );
                    })}
                  </g>

                  {/* Corporate Diagonal Chevron Stripes */}
                  <g className="side-chevrons" opacity="0.92">
                    <polygon points="320,176 360,173 470,378 430,381" fill="#E85B1A" />
                    <polygon points="370,172 400,170 500,375 470,378" fill="#C74A10" />
                    <polygon points="410,169 425,168 520,373 505,375" fill="#E85B1A" opacity="0.8" />
                  </g>

                  {/* Official MYON Brand Logo */}
                  <g className="side-branding" transform="skewY(-4.41)">
                    <image
                      href="/assets/logo-colored.png"
                      x="480"
                      y="205"
                      width="210"
                      height="210"
                      preserveAspectRatio="xMidYMid meet"
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(20,24,32,0.12))' }}
                    />
                  </g>
                </g>

                {/* ═══ ORANGE VERMILION EDITION (Cross-fades on Scroll) ═══ */}
                <g ref={orangeSkinRef} id="containerFaceGroupOrange" className="container-skin-orange" opacity="0">
                  <polygon points="140,120 590,92 720,145 240,182" fill="url(#roofGradOrange)" stroke="#FFA066" strokeWidth="1.2" />

                  {/* Roof corrugation */}
                  <g stroke="#611E02">
                    {[
                      { x1: 159.6, y1: 118.8, x2: 260.9, y2: 180.4 },
                      { x1: 179.1, y1: 117.6, x2: 281.7, y2: 178.8 },
                      { x1: 198.7, y1: 116.3, x2: 302.6, y2: 177.2 },
                      { x1: 218.3, y1: 115.1, x2: 323.5, y2: 175.6 },
                      { x1: 237.8, y1: 113.9, x2: 344.3, y2: 174.0 },
                      { x1: 257.4, y1: 112.7, x2: 365.2, y2: 172.3 },
                      { x1: 277.0, y1: 111.5, x2: 386.1, y2: 170.7 },
                      { x1: 296.5, y1: 110.3, x2: 407.0, y2: 169.1 },
                      { x1: 316.1, y1: 109.0, x2: 427.8, y2: 167.5 },
                      { x1: 335.7, y1: 107.8, x2: 448.7, y2: 165.9 },
                      { x1: 355.2, y1: 106.6, x2: 469.6, y2: 164.3 },
                      { x1: 374.8, y1: 105.4, x2: 490.4, y2: 162.7 },
                      { x1: 394.3, y1: 104.2, x2: 511.3, y2: 161.1 },
                      { x1: 413.9, y1: 103.0, x2: 532.2, y2: 159.5 },
                      { x1: 433.5, y1: 101.7, x2: 553.0, y2: 157.9 },
                      { x1: 453.0, y1: 100.5, x2: 573.9, y2: 156.3 },
                      { x1: 472.6, y1: 99.3, x2: 594.8, y2: 154.7 },
                      { x1: 492.2, y1: 98.1, x2: 615.7, y2: 153.0 },
                      { x1: 511.7, y1: 96.9, x2: 636.5, y2: 151.4 },
                      { x1: 531.3, y1: 95.7, x2: 657.4, y2: 149.8 },
                      { x1: 550.9, y1: 94.4, x2: 678.3, y2: 148.2 },
                      { x1: 570.4, y1: 93.2, x2: 699.1, y2: 146.6 },
                    ].map((l, i) => (
                      <React.Fragment key={i}>
                        <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="currentColor" strokeOpacity="0.22" strokeWidth="2.5" />
                        <line x1={l.x1 + 0.8} y1={l.y1 - 0.5} x2={l.x2 + 0.8} y2={l.y2 - 0.5} stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="1.2" />
                      </React.Fragment>
                    ))}
                  </g>

                  {/* Orange Door */}
                  <polygon points="140,120 240,182 240,397 140,335" fill="url(#doorGradOrange)" stroke="#E85B1A" strokeWidth="1.2" />
                  <line x1="190" y1="151" x2="190" y2="366" stroke="#421300" strokeWidth="2.5" />
                  <line x1="191" y1="151" x2="191" y2="366" stroke="#FFA366" strokeOpacity="0.4" strokeWidth="1" />
                  <rect x="137" y="145" width="6" height="12" rx="1" fill="#2E1004" />
                  <rect x="137" y="200" width="6" height="12" rx="1" fill="#2E1004" />
                  <rect x="137" y="260" width="6" height="12" rx="1" fill="#2E1004" />
                  <rect x="137" y="315" width="6" height="12" rx="1" fill="#2E1004" />

                  {/* Side wall orange */}
                  <polygon points="240,182 720,145 720,360 240,397" fill="url(#sideWallGradOrange)" stroke="#FFA066" strokeWidth="1.2" />
                  <g stroke="#661E00">
                    {Array.from({ length: 23 }, (_, idx) => {
                      const x = 260 + idx * 20;
                      const y1 = 180.5 - idx * 1.545;
                      const y2 = 395.5 - idx * 1.545;
                      return (
                        <React.Fragment key={idx}>
                          <line x1={x} y1={y1} x2={x} y2={y2} stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                          <line x1={x + 1.2} y1={y1} x2={x + 1.2} y2={y2} stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="1.2" />
                        </React.Fragment>
                      );
                    })}
                  </g>

                  {/* Crisp White Chevrons */}
                  <g className="side-chevrons" opacity="0.95">
                    <polygon points="320,176 360,173 470,378 430,381" fill="#FFFFFF" />
                    <polygon points="370,172 400,170 500,375 470,378" fill="#F0F4F8" />
                    <polygon points="410,169 425,168 520,373 505,375" fill="#FFFFFF" opacity="0.8" />
                  </g>

                  {/* Official MYON White Brand Logo */}
                  <g className="side-branding" transform="skewY(-4.41)">
                    <image
                      href="/assets/logo-white.png"
                      x="480"
                      y="205"
                      width="210"
                      height="210"
                      preserveAspectRatio="xMidYMid meet"
                      style={{ filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.28))' }}
                    />
                  </g>
                </g>

                {/* ═══ CORNER CASTINGS & SATELLITE IOT BEACON ═══ */}
                <g id="containerTopDetails">
                  <g transform="translate(140, 120) rotate(-10)">
                    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#20252D" stroke="#6C7A8B" strokeWidth="1" />
                    <ellipse cx="0" cy="0" rx="4.5" ry="3" fill="#0C0E12" />
                  </g>
                  <g transform="translate(590, 92) rotate(-5)">
                    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#20252D" stroke="#6C7A8B" strokeWidth="1" />
                    <ellipse cx="0" cy="0" rx="4.5" ry="3" fill="#0C0E12" />
                  </g>
                  <g transform="translate(720, 145) rotate(5)">
                    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#20252D" stroke="#6C7A8B" strokeWidth="1" />
                    <ellipse cx="0" cy="0" rx="4.5" ry="3" fill="#0C0E12" />
                  </g>
                  <g transform="translate(240, 182) rotate(10)">
                    <rect x="-8" y="-8" width="16" height="16" rx="2" fill="#20252D" stroke="#6C7A8B" strokeWidth="1" />
                    <ellipse cx="0" cy="0" rx="4.5" ry="3" fill="#0C0E12" />
                  </g>

                  {/* Telematics Puck */}
                  <g id="roofIoTPuck" transform="translate(480, 115)">
                    <ellipse cx="0" cy="0" rx="9" ry="5.5" fill="#1C2128" stroke="#8E9AA8" strokeWidth="1" />
                    <ellipse cx="0" cy="-2" rx="6" ry="3.5" fill="#2E3744" />
                    <circle id="iotBeaconLed" cx="0" cy="-2" r="2" fill="#00FF66" />
                  </g>
                </g>
              </g>
            </svg>
          </div>
        </div>

        {/* Stage 2 Theatrical Statement (25% - 65% Scroll) */}
        <div className="theatrical-statement" ref={stage2StatementRef} id="stage2Statement">
          <div className="statement-badge">رؤية لوجستية متجددة · LOGISTICS ENHANCED</div>
          <h2 className="statement-quote">
            «نبتكر حلولاً لوجستية بمعايير عالمية ورؤية متجددة — ثقة مبنية على الدقة، السرعة، والالتزام المطلق.»
          </h2>
          <p className="statement-en">
            WE BRING LOGISTICS WITH FLAIR AND BRIGHT INNOVATION · TRUSTED BY THOSE WHO PRIZE CARE, SPEED, AND DEDICATION
          </p>
          <div className="statement-metrics">
            <div className="s-metric">
              <span className="s-val">+10,000</span>
              <span className="s-lbl">شحنة ناجحة وموثقة</span>
            </div>
            <div className="s-metric">
              <span className="s-val">99.4%</span>
              <span className="s-lbl">معدل الالتزام بالمواعيد</span>
            </div>
            <div className="s-metric">
              <span className="s-val">24/7</span>
              <span className="s-lbl">تتبع وإشراف لحظي</span>
            </div>
          </div>
        </div>

        {/* Stage 3 Inspection Hotspots (65% - 100% Scroll) */}
        <div className="theatrical-inspection" ref={stage3InspectionRef} id="stage3Inspection">
          <div className="inspection-header">
            <span className="eyebrow">فحص ومواصفات الحاوية · TECHNICAL INSPECTION</span>
            <h3>المواصفات الهندسية وأنظمة الأمان القياسية</h3>
          </div>

          {/* Hotspot 1: Security */}
          <div
            className="hotspot-card hotspot-security"
            data-hotspot="security"
            role="button"
            tabIndex={0}
            aria-label="أمان وحماية قصوى"
            onClick={() => onOpenHotspot('security')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenHotspot('security');
              }
            }}
          >
            <div className="hotspot-beacon">
              <span className="beacon-ring"></span>
              <span className="beacon-core">1</span>
            </div>
            <div className="hotspot-info">
              <h4>أمان وحماية ISO 1496</h4>
              <p>أقفال فولاذية معتمدة وأختام إلكترونية ضد العبث</p>
              <span className="hotspot-link">استعراض المواصفات ←</span>
            </div>
          </div>

          {/* Hotspot 2: IoT Tracking */}
          <div
            className="hotspot-card hotspot-tracking"
            data-hotspot="tracking"
            role="button"
            tabIndex={0}
            aria-label="تتبع فضائي ذكي"
            onClick={() => onOpenHotspot('tracking')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenHotspot('tracking');
              }
            }}
          >
            <div className="hotspot-beacon">
              <span className="beacon-ring"></span>
              <span className="beacon-core">2</span>
            </div>
            <div className="hotspot-info">
              <h4>تتبع فضائي لحظي (IoT)</h4>
              <p>مستشعرات GPS وحرارة متصلة بالأقمار الصناعية</p>
              <span className="hotspot-link">استعراض المواصفات ←</span>
            </div>
          </div>

          {/* Hotspot 3: Delivery */}
          <div
            className="hotspot-card hotspot-delivery"
            data-hotspot="delivery"
            role="button"
            tabIndex={0}
            aria-label="سرعة وتخليص فوري"
            onClick={() => onOpenHotspot('delivery')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenHotspot('delivery');
              }
            }}
          >
            <div className="hotspot-beacon">
              <span className="beacon-ring"></span>
              <span className="beacon-core">3</span>
            </div>
            <div className="hotspot-info">
              <h4>سرعة وتخليص فوري</h4>
              <p>ربط مباشر مع منصة فسح والموانئ والمنافذ</p>
              <span className="hotspot-link">استعراض المواصفات ←</span>
            </div>
          </div>

          {/* Hotspot 4: Support */}
          <div
            className="hotspot-card hotspot-support"
            data-hotspot="support"
            role="button"
            tabIndex={0}
            aria-label="غرفة عمليات على مدار الساعة"
            onClick={() => onOpenHotspot('support')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpenHotspot('support');
              }
            }}
          >
            <div className="hotspot-beacon">
              <span className="beacon-ring"></span>
              <span className="beacon-core">4</span>
            </div>
            <div className="hotspot-info">
              <h4>غرفة عمليات 24/7</h4>
              <p>إشراف لوجستي مستمر وإدارة مسارات الأسطول</p>
              <span className="hotspot-link">استعراض المواصفات ←</span>
            </div>
          </div>
        </div>

        {/* Scroll Cue Indicator */}
        <div className="theatrical-scroll-cue" ref={scrollCueRef} id="theatricalScrollCue">
          <div className="theatrical-cue-track">
            <div className="theatrical-cue-thumb" id="theatricalCueThumb"></div>
          </div>
          <span className="theatrical-cue-text">مرر للاستكشاف · SCROLL</span>
        </div>
      </div>
    </section>
  );
};
