import React, { useEffect } from 'react';
import { SPEC_DATA } from '../data/specData';

interface SpecModalProps {
  hotspotType: string | null;
  onClose: () => void;
}

export const SpecModal: React.FC<SpecModalProps> = ({ hotspotType, onClose }) => {
  useEffect(() => {
    if (hotspotType) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [hotspotType, onClose]);

  if (!hotspotType) return null;

  const data = SPEC_DATA[hotspotType];
  if (!data) return null;

  return (
    <div
      className="spec-modal-backdrop active"
      id="specModalBackdrop"
      aria-hidden="false"
      onClick={onClose}
    >
      <div
        className="spec-modal"
        id="specModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="spec-modal-close" id="specModalClose" aria-label="إغلاق" onClick={onClose}>
          &times;
        </button>

        <div className="spec-modal-body" id="specModalBody">
          <div className="spec-modal-header">
            <span className="spec-modal-badge">{data.badge}</span>
            <h3 id="modalTitle">{data.title}</h3>
            <p>{data.desc}</p>
          </div>

          <div className="spec-grid">
            {data.specs.map((s, idx) => (
              <div key={idx} className="spec-item">
                <div className="spec-item-label">{s.label}</div>
                <div className="spec-item-val">{s.val}</div>
              </div>
            ))}
          </div>

          <ul className="spec-features-list">
            {data.features.map((f, idx) => (
              <li key={idx}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
