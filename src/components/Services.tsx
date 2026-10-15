import React from 'react';

export const Services: React.FC = () => {
  return (
    <section id="services" data-ambient="#F9FAFC" data-glow=".12">
      <div className="wrap">
        <div className="section-head">
          <span className="idx reveal">٠١ — خدماتنا</span>
          <h2 className="reveal">
            التكامل<br />
            <span className="orange-text">في خدماتنا</span>
          </h2>
          <p className="reveal">
            ارتقِ بمستوى أعمالك مع ميون — منظومة خدمات متكاملة تغطي كل احتياجات مشاريعك بكفاءة واحترافية استثنائية.
          </p>
        </div>

        <div className="services-grid">
          <div className="svc-card reveal">
            <span className="svc-num">01</span>
            <div className="svc-icon">
              <svg viewBox="0 0 24 24">
                <polygon points="3 22 21 22 12 2 3 22" />
                <line x1="12" y1="14" x2="12" y2="22" />
                <line x1="8" y1="22" x2="8" y2="18" />
                <line x1="16" y1="22" x2="16" y2="18" />
              </svg>
            </div>
            <h3>المقاولات والإنشاءات</h3>
            <p>
              نحوّل الأفكار إلى معالم بارزة تُلهم الأجيال، بخدمات مقاولات وإنشاءات تعتمد على الإبداع والدقة الهندسية. نقدم مجموعة شاملة من الخدمات لتلبية احتياجات مشاريعك بكل احترافية.
            </p>
          </div>

          <div className="svc-card reveal">
            <span className="svc-num">02</span>
            <div className="svc-icon">
              <svg viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <h3>خدمات النقل</h3>
            <p>
              نحرك أعمالك بحلول نقل مصممة لتجاوز التوقعات. سواء شحنات خفيفة أو نقل مشاريع ضخمة، نضمن سلامة وصولها بسرعة ودقة — لأن كل رحلة تبدأ بثقة وتنتهي بالنجاح.
            </p>
          </div>

          <div className="svc-card reveal">
            <span className="svc-num">03</span>
            <div className="svc-icon">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M6 22V12a4 4 0 018 0v10" />
                <path d="M2 22h20" />
              </svg>
            </div>
            <h3>الخدمات النفطية</h3>
            <p>
              في عالم الطاقة نبقى الشريك الذي يُعتمد عليه. نقدم حلولاً شاملة لدعم العمليات النفطية في أصعب الظروف — من نقل المعدات الثقيلة إلى تقديم الإمدادات الحيوية.
            </p>
          </div>

          <div className="svc-card reveal">
            <span className="svc-num">04</span>
            <div className="svc-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <h3>الشحن والتخليص الجمركي</h3>
            <p>
              نحوّل التعقيد إلى بساطة في كل عملية عبور. بخبرتنا واحترافنا نُسرّع الإجراءات الجمركية لضمان تسليم شحناتك بسلاسة — لتصل إلى حيث يجب دون عناء أو تأخير.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
