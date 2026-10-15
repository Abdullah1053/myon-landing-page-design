import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const WhyUs: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf6f7fa, 1);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf6f7fa, 5, 18);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 1, 6);

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const oLight = new THREE.PointLight(0xe85b1a, 4, 12);
    oLight.position.set(2, 2, 3);
    scene.add(oLight);

    const rim = new THREE.DirectionalLight(0xfff5ea, 0.8);
    rim.position.set(-3, 4, -2);
    scene.add(rim);

    const grid = new THREE.GridHelper(20, 20, 0xdce0e6, 0xeaeef3);
    grid.position.y = -2.2;
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xc74a10,
      metalness: 0.35,
      roughness: 0.28,
      emissive: 0x8a2e05,
      emissiveIntensity: 0.14,
    });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0xff7a33, transparent: true, opacity: 0.95 });

    function addCube(x: number, y: number, z: number, sx: number, sy: number, sz: number, em: number) {
      const geo = new THREE.BoxGeometry(sx, sy, sz);
      const m = baseMat.clone();
      m.emissiveIntensity = em || 0.08;
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      group.add(mesh);

      const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone());
      line.position.set(x, y, z);
      group.add(line);
      return mesh;
    }

    const c1 = addCube(0, 0, 0, 1.4, 1.4, 1.4, 0.12);
    const c2 = addCube(-1.2, -0.5, -0.4, 0.8, 0.8, 0.8, 0.06);
    const c3 = addCube(1.1, 0.6, -0.6, 0.6, 0.6, 0.6, 0.15);
    const c4 = addCube(0.4, -1.1, 0.3, 0.5, 0.5, 0.5, 0.1);

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.04, 8, 32),
      new THREE.MeshStandardMaterial({ color: 0xc74a10, emissive: 0xe85b1a, emissiveIntensity: 0.7 })
    );
    torus.position.set(0, 2.2, 0);
    torus.rotation.x = Math.PI / 2;
    scene.add(torus);

    let animId = 0;
    let isVisible = false;

    function animate(t: number) {
      if (!isVisible) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(animate);
      const s = t * 0.001;
      group.rotation.y = s * 0.18;
      group.rotation.x = Math.sin(s * 0.3) * 0.12;
      c1.rotation.x = s * 0.3;
      c2.rotation.y = -s * 0.4;
      c3.rotation.z = s * 0.25;
      c4.rotation.x = s * 0.2;
      torus.rotation.y = s * 0.6;
      oLight.position.x = Math.sin(s * 0.5) * 3;
      oLight.position.y = 2 + Math.sin(s * 0.3) * 1;
      renderer.render(scene, camera);
    }

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(canvas);

    return () => {
      io.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      renderer.dispose();
    };
  }, []);

  return (
    <section id="why" data-ambient="#F6F7FA" data-glow=".15">
      <div className="wrap">
        <div className="why-grid">
          <div className="why-visual reveal-left">
            <canvas id="whyCanvas3D" ref={canvasRef} aria-hidden="true"></canvas>
            <div className="why-visual-overlay"></div>
            <div className="why-badge latin">Since 2019</div>
          </div>

          <div className="why-copy">
            <span className="idx reveal">٠٢ — لماذا ميون</span>
            <h2 className="reveal">
              المستقبل<br />
              <span className="orange-text">يبدأ هنا</span>
            </h2>
            <p className="reveal">
              نحوّل التحديات إلى فرص، ونضع بين يديك حلولاً مبتكرة تدفع أعمالك نحو القمة بأسلوب يجمع بين الخبرة والاستثناء.
            </p>

            <div className="why-features">
              <div className="why-feat reveal">
                <div className="why-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <div className="why-feat-title">بكل سهولة، نحن معك</div>
                  <div className="why-feat-desc">
                    طلب خدماتنا أصبح أبسط مما تتخيل — تواصل سريع ومباشر لتحصل على ما تحتاجه دون تعقيد.
                  </div>
                </div>
              </div>

              <div className="why-feat reveal">
                <div className="why-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <div>
                  <div className="why-feat-title">كل شيء في مكان واحد</div>
                  <div className="why-feat-desc">
                    خدمات شاملة تغطي كل جوانب أعمالك من النقل والتخليص إلى الإنشاءات والخدمات النفطية.
                  </div>
                </div>
              </div>

              <div className="why-feat reveal">
                <div className="why-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
                  </svg>
                </div>
                <div>
                  <div className="why-feat-title">تقنيات تسبق الزمن</div>
                  <div className="why-feat-desc">
                    حلولنا مصممة لتتماشى مع المستقبل وتضمن لك التفوق في بيئة تنافسية متسارعة.
                  </div>
                </div>
              </div>

              <div className="why-feat reveal">
                <div className="why-feat-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <div className="why-feat-title">الاحترافية في التفاصيل</div>
                  <div className="why-feat-desc">
                    نعمل بجانبك خطوة بخطوة — كل عملية تُدار بدقة لأننا نؤمن بأن النجاح يكمن في التفاصيل الصغيرة.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
