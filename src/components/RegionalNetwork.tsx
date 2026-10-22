import React, { useState } from 'react';
import { REGIONS_DATA } from '../data/regionsData';
import { RegionInfo, BranchInfo } from '../types';

interface RegionalNetworkProps {
  onNavigate?: (id: string) => void;
}

export const RegionalNetwork: React.FC<RegionalNetworkProps> = ({ onNavigate }) => {
  const [activeRegionId, setActiveRegionId] = useState<string>('saudi');
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const activeRegion: RegionInfo =
    REGIONS_DATA.find((r) => r.id === activeRegionId) || REGIONS_DATA[0];

  const handleSelectRegion = (id: string) => {
    setActiveRegionId(id);
    setSelectedBranchId(null);
  };

  const handleYemenMapScroll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('experience');
    } else {
      const el = document.getElementById('experience');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="regions" className="regions-section" data-ambient="#F7F9FB" data-glow=".25">
      <div className="wrap">
        {/* Section Header */}
        <div className="section-head text-center reveal">
          <span className="idx">٠٤ — شبكة الأقاليم والفروع الدولية</span>
          <h2>
            منظومة أقاليم ميون<br />
            <span className="orange-text">حضور استراتيجي في ٤ دول كبرى</span>
          </h2>
          <p>
            تعتمد ميون على هيكلية أقاليم تشغيلية دولية متكاملة تربط أسواق التوريد العالمية بمراكز الاستهلاك
            والمشاريع الميدانية في الشرق الأوسط، عبر فروعنا المعتمدة في المملكة العربية السعودية، الجمهورية اليمنية،
            جمهورية الصين الشعبية، والولايات المتحدة الأمريكية.
          </p>
        </div>

        {/* Global Logistics Corridors Map Graphic (SVG HUD) */}
        <div className="global-corridors-card reveal">
          <div className="corridors-hud-bar">
            <div className="corridors-badge">
              <span className="corridor-pulse-dot"></span>
              <span>خريطة الربط اللوجستي بين الأقاليم الأربعة</span>
            </div>
            <div className="corridors-latin latin">
              INTER-REGIONAL OPERATIONAL GRID · KSA ⇄ YEMEN ⇄ CHINA ⇄ USA
            </div>
          </div>

          <div className="world-canvas-wrap">
            <svg
              className="world-svg-map"
              viewBox="0 0 1000 480"
              preserveAspectRatio="xMidYMid meet"
              aria-label="خريطة الأقاليم الأربعة وسلاسل الإمداد الدولية"
            >
              <defs>
                {/* Glow Filter */}
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Gradients */}
                <linearGradient id="corridorGradOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E85B1A" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#FF6B2B" stopOpacity="1" />
                  <stop offset="100%" stopColor="#E85B1A" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="corridorGradBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#4A6572" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#E85B1A" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* World Grid Lines */}
              <g className="world-grid-lines" opacity="0.18">
                <line x1="40" y1="120" x2="960" y2="120" stroke="#CBD5E1" strokeDasharray="4 6" />
                <line x1="40" y1="240" x2="960" y2="240" stroke="#CBD5E1" strokeDasharray="4 6" />
                <line x1="40" y1="360" x2="960" y2="360" stroke="#CBD5E1" strokeDasharray="4 6" />
                <line x1="250" y1="40" x2="250" y2="440" stroke="#CBD5E1" strokeDasharray="4 6" />
                <line x1="560" y1="40" x2="560" y2="440" stroke="#CBD5E1" strokeDasharray="4 6" />
                <line x1="820" y1="40" x2="820" y2="440" stroke="#CBD5E1" strokeDasharray="4 6" />
              </g>

              {/* Simplified Abstract Continental Outlines for Context */}
              <g className="continent-outlines" fill="#EEF2F6" stroke="#DCE3EC" strokeWidth="1" opacity="0.75">
                {/* North America */}
                <path d="M 120 90 L 260 90 L 300 130 L 280 200 L 220 230 L 190 280 L 160 250 L 140 210 L 90 160 Z" />
                {/* Europe & Africa */}
                <path d="M 460 100 L 530 90 L 560 140 L 550 200 L 580 270 L 540 380 L 490 350 L 470 230 L 430 180 L 440 120 Z" />
                {/* Arabian Peninsula & Middle East */}
                <path d="M 550 210 L 610 200 L 640 230 L 630 280 L 590 300 L 560 260 Z" fill="#FFE8DC" stroke="#FFCCA8" strokeWidth="1.5" />
                {/* Asia / China */}
                <path d="M 640 120 L 860 100 L 910 160 L 880 250 L 820 290 L 740 270 L 670 220 Z" />
              </g>

              {/* Connecting Supply Arcs Between the 4 Hubs */}
              {/* USA (Houston/NY: x=210, y=190) <-> KSA (Riyadh: x=590, y=235) */}
              <path
                d="M 210 190 Q 400 90 590 235"
                fill="none"
                stroke="url(#corridorGradOrange)"
                strokeWidth="2"
                strokeDasharray="6 6"
                className="animated-corridor-arc"
              />
              {/* KSA (x=590, y=235) <-> Yemen (x=595, y=285) */}
              <path
                d="M 590 235 L 595 285"
                fill="none"
                stroke="#E85B1A"
                strokeWidth="3.5"
                className="animated-corridor-direct"
              />
              {/* China (Guangzhou: x=820, y=225) <-> KSA (x=590, y=235) */}
              <path
                d="M 820 225 Q 700 140 590 235"
                fill="none"
                stroke="url(#corridorGradOrange)"
                strokeWidth="2.5"
                strokeDasharray="7 5"
                className="animated-corridor-arc"
              />
              {/* China (x=820, y=225) <-> Yemen (x=595, y=285) - Maritime Silk Route */}
              <path
                d="M 820 225 Q 730 330 595 285"
                fill="none"
                stroke="#E85B1A"
                strokeWidth="2"
                strokeDasharray="5 7"
                opacity="0.85"
                className="animated-corridor-arc-reverse"
              />
              {/* USA <-> China trans-Pacific connection */}
              <path
                d="M 210 190 Q 80 140 40 150"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <path
                d="M 960 170 Q 900 180 820 225"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />

              {/* Node 1: USA (x=210, y=190) */}
              <g
                className={`map-interactive-node ${activeRegionId === 'usa' ? 'active' : ''}`}
                onClick={() => handleSelectRegion('usa')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="210" cy="190" r="26" fill="#E85B1A" fillOpacity="0.12" className="node-pulse-circle" />
                <circle cx="210" cy="190" r="14" fill="#FFFFFF" stroke="#E85B1A" strokeWidth="2.5" filter="url(#glowFilter)" />
                <circle cx="210" cy="190" r="6" fill="#E85B1A" />
                <text x="210" y="152" textAnchor="middle" fill="#14171C" fontSize="13" fontWeight="bold" fontFamily="El Messiri, serif">
                  🇺🇸 إقليم أمريكا
                </text>
                <text x="210" y="168" textAnchor="middle" fill="#E85B1A" fontSize="10" fontWeight="600" fontFamily="Cormorant Garamond, serif" letterSpacing="1px">
                  HOUSTON · NY
                </text>
              </g>

              {/* Node 2: KSA (x=590, y=235) */}
              <g
                className={`map-interactive-node ${activeRegionId === 'saudi' ? 'active' : ''}`}
                onClick={() => handleSelectRegion('saudi')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="590" cy="235" r="32" fill="#E85B1A" fillOpacity="0.18" className="node-pulse-circle" />
                <circle cx="590" cy="235" r="18" fill="#E85B1A" stroke="#FFFFFF" strokeWidth="3" filter="url(#glowFilter)" />
                <circle cx="590" cy="235" r="8" fill="#FFFFFF" />
                <text x="590" y="196" textAnchor="middle" fill="#E85B1A" fontSize="15" fontWeight="bold" fontFamily="El Messiri, serif">
                  🇸🇦 إقليم السعودية
                </text>
                <text x="590" y="212" textAnchor="middle" fill="#555E6C" fontSize="11" fontWeight="600" fontFamily="Cormorant Garamond, serif" letterSpacing="1px">
                  HQ · RIYADH · JEDDAH · DAMMAM
                </text>
              </g>

              {/* Node 3: Yemen (x=595, y=285) */}
              <g
                className={`map-interactive-node ${activeRegionId === 'yemen' ? 'active' : ''}`}
                onClick={() => handleSelectRegion('yemen')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="595" cy="285" r="28" fill="#E85B1A" fillOpacity="0.14" className="node-pulse-circle" />
                <circle cx="595" cy="285" r="15" fill="#FFFFFF" stroke="#E85B1A" strokeWidth="2.5" filter="url(#glowFilter)" />
                <circle cx="595" cy="285" r="6" fill="#E85B1A" />
                <text x="595" y="325" textAnchor="middle" fill="#14171C" fontSize="13" fontWeight="bold" fontFamily="El Messiri, serif">
                  🇾🇪 إقليم اليمن
                </text>
                <text x="595" y="340" textAnchor="middle" fill="#E85B1A" fontSize="10" fontWeight="600" fontFamily="Cormorant Garamond, serif" letterSpacing="1px">
                  ADEN · SANAA · MUKALLA · MARIB
                </text>
              </g>

              {/* Node 4: China (x=820, y=225) */}
              <g
                className={`map-interactive-node ${activeRegionId === 'china' ? 'active' : ''}`}
                onClick={() => handleSelectRegion('china')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="820" cy="225" r="28" fill="#E85B1A" fillOpacity="0.14" className="node-pulse-circle" />
                <circle cx="820" cy="225" r="15" fill="#FFFFFF" stroke="#E85B1A" strokeWidth="2.5" filter="url(#glowFilter)" />
                <circle cx="820" cy="225" r="6" fill="#E85B1A" />
                <text x="820" y="185" textAnchor="middle" fill="#14171C" fontSize="13" fontWeight="bold" fontFamily="El Messiri, serif">
                  🇨🇳 إقليم الصين
                </text>
                <text x="820" y="200" textAnchor="middle" fill="#E85B1A" fontSize="10" fontWeight="600" fontFamily="Cormorant Garamond, serif" letterSpacing="1px">
                  GUANGZHOU · YIWU · SHANGHAI
                </text>
              </g>
            </svg>
          </div>

          <div className="corridors-legend-strip">
            <div className="legend-tag">
              <span className="dot dot-hq"></span>
              <span>المقر الإقليمي الرئيسي (السعودية)</span>
            </div>
            <div className="legend-tag">
              <span className="dot dot-field"></span>
              <span>العمليات الميدانية والانتشار (اليمن)</span>
            </div>
            <div className="legend-tag">
              <span className="dot dot-source"></span>
              <span>التوريد والمصانع العالمية (الصين)</span>
            </div>
            <div className="legend-tag">
              <span className="dot dot-intl"></span>
              <span>اللوجستيات الدولية العابرة (أمريكا)</span>
            </div>
          </div>
        </div>

        {/* Region Switcher Tabs */}
        <div className="regions-nav-pills reveal" role="tablist">
          {REGIONS_DATA.map((region) => {
            const isSelected = region.id === activeRegionId;
            return (
              <button
                key={region.id}
                role="tab"
                aria-selected={isSelected}
                className={`region-tab-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectRegion(region.id)}
              >
                <span className="tab-flag">{region.flagEmoji}</span>
                <div className="tab-text">
                  <span className="tab-name">{region.nameAr}</span>
                  <span className="tab-sub">{region.roleBadge}</span>
                </div>
                {isSelected && <span className="tab-active-indicator"></span>}
              </button>
            );
          })}
        </div>

        {/* Active Region Full Showcase */}
        <div className="region-showcase-card reveal" key={activeRegion.id}>
          {/* Top Banner / Hero */}
          <div className="region-banner">
            <div className="region-banner-info">
              <div className="region-meta-badges">
                <span className="region-country-badge">
                  <span className="flag">{activeRegion.flagEmoji}</span>
                  <span>{activeRegion.nameEn}</span>
                </span>
                <span className="region-role-pill">● {activeRegion.roleBadge}</span>
                <span className="region-hub-pill">المركز: {activeRegion.hubCity}</span>
              </div>

              <h3 className="region-title">{activeRegion.nameAr}</h3>
              <p className="region-tagline">{activeRegion.tagline}</p>
              <p className="region-desc">{activeRegion.overview}</p>
            </div>

            {/* Regional Stats Counter */}
            <div className="region-stats-box">
              <div className="rstats-head">مؤشرات الإقليم التشغيلية</div>
              <div className="rstats-grid">
                {activeRegion.stats.map((st, i) => (
                  <div key={i} className="rstat-col">
                    <div className="rstat-num">{st.val}</div>
                    <div className="rstat-lbl">{st.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Strategic Corridors Bar */}
          <div className="region-corridors-bar">
            <div className="corridors-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
              </svg>
              <span>الممرات وسلاسل الربط النشطة لهذا الإقليم:</span>
            </div>
            <div className="corridors-list">
              {activeRegion.corridors.map((c, i) => (
                <div key={i} className="corridor-chip">
                  <span className="chip-bullet">◆</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Branches and Stations Showcase */}
          <div className="region-branches-wrapper">
            <div className="branches-section-title">
              <h4>
                الفروع والمكاتب المعتمدة في {activeRegion.nameAr}
              </h4>
              <span className="branches-count-pill">
                {activeRegion.branches.length} مكاتب ومحطات رئيسية
              </span>
            </div>

            <div className="branches-cards-grid">
              {activeRegion.branches.map((branch: BranchInfo) => {
                const isExpanded = selectedBranchId === branch.id;
                return (
                  <div
                    key={branch.id}
                    className={`branch-card ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setSelectedBranchId(isExpanded ? null : branch.id)}
                  >
                    <div className="branch-card-header">
                      <div className="branch-icon-wrap">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 21h18M5 21V7l8-4v18M13 21V3l6 3v15" />
                        </svg>
                      </div>
                      <div className="branch-title-wrap">
                        <span className="branch-type-tag">{branch.type}</span>
                        <h5 className="branch-name">{branch.nameAr}</h5>
                        <span className="branch-name-en latin">{branch.nameEn}</span>
                      </div>
                    </div>

                    <div className="branch-address-row">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{branch.address}</span>
                    </div>

                    <p className="branch-highlight">
                      <strong>الدور الرئيسي:</strong> {branch.highlight}
                    </p>

                    <div className="branch-services-tags">
                      {branch.services.map((srv, si) => (
                        <span key={si} className="bs-tag">
                          ✓ {srv}
                        </span>
                      ))}
                    </div>

                    <div className="branch-footer-row">
                      <div className="branch-contact-links">
                        {branch.phone && (
                          <a
                            href={`tel:${branch.phone}`}
                            className="b-contact-item"
                            onClick={(e) => e.stopPropagation()}
                            title="اتصال هاتفي"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                            </svg>
                            <span>{branch.city}</span>
                          </a>
                        )}
                        {branch.email && (
                          <a
                            href={`mailto:${branch.email}`}
                            className="b-contact-item"
                            onClick={(e) => e.stopPropagation()}
                            title="إرسال بريد إلكتروني"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                            <span>{branch.email}</span>
                          </a>
                        )}
                      </div>

                      <a
                        href="#cta"
                        className="branch-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onNavigate) onNavigate('cta');
                        }}
                      >
                        طلب الخدمة
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contextual Action Bar Depending on Selected Region */}
          <div className="region-action-bar">
            {activeRegion.id === 'yemen' ? (
              <div className="region-action-box yemen-action">
                <div className="action-text">
                  <h5>الانتشار الميداني التفصيلي في اليمن</h5>
                  <p>
                    هل تريد استكشاف كافة مشاريعنا الإنشائية واللوجستية والنفطية عبر خريطة اليمن التفاعلية ثلاثية الأبعاد (3D)؟
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleYemenMapScroll}
                >
                  استكشف خريطة مشاريع اليمن (3D) ↧
                </button>
              </div>
            ) : activeRegion.id === 'china' ? (
              <div className="region-action-box china-action">
                <div className="action-text">
                  <h5>استيراد وتوريد صناعي مباشر من الصين</h5>
                  <p>
                    فريق مكاتب كوانزو وييوو مستعد لتوفير عروض الأسعار، فحص المصانع، وحجز الحاويات فوراً.
                  </p>
                </div>
                <a href="#cta" className="btn btn-primary" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('cta'); }}>
                  بدء التوريد والاستيراد من الصين
                </a>
              </div>
            ) : activeRegion.id === 'usa' ? (
              <div className="region-action-box usa-action">
                <div className="action-text">
                  <h5>لوجستيات معدات الطاقة والتجارة الأمريكية</h5>
                  <p>
                    تنسيق شحن قطع الغيار المتخصصة والآلات الثقيلة من هيوستن وموانئ الولايات المتحدة.
                  </p>
                </div>
                <a href="#cta" className="btn btn-primary" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('cta'); }}>
                  طلب تنسيق شحن دولي من أمريكا
                </a>
              </div>
            ) : (
              <div className="region-action-box saudi-action">
                <div className="action-text">
                  <h5>المقر الرئيسي — الرياض والمملكة العربية السعودية</h5>
                  <p>
                    مستعدون لتقديم الاستشارات الشاملة، إدارة المشاريع الإنشائية، وعقود الإسناد اللوجستي الكبرى.
                  </p>
                </div>
                <a href="#cta" className="btn btn-primary" onClick={(e) => { e.preventDefault(); if (onNavigate) onNavigate('cta'); }}>
                  طلب استشارة وعقد من المقر الرئيسي
                </a>
              </div>
            )}
          </div>
        </div>

        {/* All Regions Quick Summary Matrix */}
        <div className="regions-matrix-wrap reveal">
          <div className="matrix-head">
            <span className="matrix-title">دليل الأقاليم والفروع الأربعة بميون — نظرة سريعة</span>
            <span className="matrix-subtitle latin">FOUR STRATEGIC TERRITORIES · ONE UNIFIED EXCELLENCE</span>
          </div>

          <div className="regions-matrix-grid">
            {REGIONS_DATA.map((reg) => (
              <div
                key={reg.id}
                className={`matrix-card ${reg.id === activeRegionId ? 'active' : ''}`}
                onClick={() => handleSelectRegion(reg.id)}
              >
                <div className="m-card-top">
                  <span className="m-flag">{reg.flagEmoji}</span>
                  <span className="m-code latin">{reg.countryCode}</span>
                </div>
                <h5 className="m-name">{reg.nameAr}</h5>
                <span className="m-role">{reg.roleBadge}</span>

                <div className="m-branches-list">
                  <div className="m-branches-label">الفروع والمحطات:</div>
                  <ul>
                    {reg.branches.map((b) => (
                      <li key={b.id}>
                        <span className="m-bullet">▪</span>
                        <span>{b.city}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="m-card-action">
                  <span>استعراض الإقليم</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
