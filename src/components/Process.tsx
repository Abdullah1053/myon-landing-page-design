import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Process: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillLineRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  useEffect(() => {
    const container = containerRef.current;
    const fillEl = fillLineRef.current;
    if (!container || !fillEl) return;

    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window || window.innerWidth <= 768);

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top 75%',
      end: 'bottom 45%',
      scrub: isTouch ? 1.0 : 0.6,
      onUpdate: (self) => {
        fillEl.style.height = `${(self.progress * 100).toFixed(1)}%`;
        const stepIndex = Math.min(Math.floor(self.progress * 4) + 1, 4);
        setActiveStep(stepIndex);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section id="process" data-ambient="#F8F9FB" data-glow=".14">
      <div className="wrap">
        <div className="process-head">
          <span className="idx reveal">٠٣ — كيف نعمل</span>
          <h2 className="reveal">
            رحلتك معنا<br />
            <span className="orange-text">خطوة بخطوة</span>
          </h2>
        </div>

        <div className="process-steps" id="processSteps" ref={containerRef}>
          <div className="process-line">
            <div className="process-line-fill" id="processLineFill" ref={fillLineRef}></div>
          </div>

          <div className={`process-step ${activeStep >= 1 ? 'active' : ''}`} data-step="1">
            <div className="step-content">
              <div className="step-label">الخطوة الأولى</div>
              <div className="step-title">التواصل والاستشارة</div>
              <div className="step-desc">
                تواصل معنا وسنستمع إلى متطلباتك بعناية لفهم احتياجاتك تماماً وتحديد أفضل الحلول المناسبة لمشروعك.
              </div>
            </div>
            <div className="step-dot">
              <div className="step-dot-inner">١</div>
            </div>
            <div className="step-empty"></div>
          </div>

          <div className={`process-step ${activeStep >= 2 ? 'active' : ''}`} data-step="2">
            <div className="step-empty"></div>
            <div className="step-dot">
              <div className="step-dot-inner">٢</div>
            </div>
            <div className="step-content">
              <div className="step-label">الخطوة الثانية</div>
              <div className="step-title">التخطيط والتصميم</div>
              <div className="step-desc">
                نضع خطة شاملة ومفصّلة لمشروعك تشمل الجدول الزمني والميزانية وآليات التنفيذ لضمان أعلى مستويات الكفاءة.
              </div>
            </div>
          </div>

          <div className={`process-step ${activeStep >= 3 ? 'active' : ''}`} data-step="3">
            <div className="step-content">
              <div className="step-label">الخطوة الثالثة</div>
              <div className="step-title">التنفيذ والإشراف</div>
              <div className="step-desc">
                ننفذ المشروع بأيدي فريق متخصص مع إشراف دقيق في كل مرحلة لضمان الجودة والالتزام بالمواعيد المحددة.
              </div>
            </div>
            <div className="step-dot">
              <div className="step-dot-inner">٣</div>
            </div>
            <div className="step-empty"></div>
          </div>

          <div className={`process-step ${activeStep >= 4 ? 'active' : ''}`} data-step="4">
            <div className="step-empty"></div>
            <div className="step-dot">
              <div className="step-dot-inner">٤</div>
            </div>
            <div className="step-content">
              <div className="step-label">الخطوة الرابعة</div>
              <div className="step-title">التسليم ومتابعة ما بعد</div>
              <div className="step-desc">
                نسلّم مشروعك بأعلى المعايير ونواصل دعمك بعد الاستلام لضمان رضاك الكامل وحل أي استفسارات مستقبلية.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
