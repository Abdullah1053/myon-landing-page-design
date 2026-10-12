(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  const hasThree = typeof THREE !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* Graceful asset fallback */
  document.querySelectorAll("img[src]").forEach(img =>
    img.addEventListener("error", () => img.style.display = "none", { once: true })
  );

  /* ─── LENIS ─── */
  let lenis = null;
  if (typeof Lenis !== "undefined" && hasGSAP && !reduce) {
    lenis = new Lenis({
      duration: 1.3,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.lenis = lenis;
    document.querySelectorAll('a[href^="#"]').forEach(a =>
      a.addEventListener("click", e => {
        const t = document.querySelector(a.getAttribute("href"));
        if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: 0 }); }
      })
    );
  }

  /* ═══════════════════════════════════════════════════════════
     MYON ORANGE STRIPES (#E85B1A) PRELOADER & BRAND HERO
     ═══════════════════════════════════════════════════════════ */
  (function initFigmaMotionPreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;

    const percentEl = document.getElementById("loaderPercent");
    const barEl = document.getElementById("loaderBar");
    const stripes = document.querySelectorAll(".loader-stripe");
    const brandHero = document.getElementById("preloaderBrand");

    // Lock page scrolling during initial load
    document.body.style.overflow = "hidden";
    if (window.lenis) window.lenis.stop();

    let count = 0;
    const target = 100;
    const duration = 1800; // 1.8 seconds smooth progress
    const startTime = performance.now();

    function updatePreloader(now) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Figma cubic ease-out
      const eased = Math.min(1, 1.001 - Math.pow(2, -10 * progress));
      count = Math.floor(eased * target);

      if (percentEl) percentEl.textContent = (count < 10 ? "0" : "") + count + "%";
      if (barEl) barEl.style.width = (eased * 100) + "%";

      if (progress < 1) {
        requestAnimationFrame(updatePreloader);
      } else {
        // Complete state
        if (percentEl) percentEl.textContent = "100%";
        if (barEl) barEl.style.width = "100%";

        setTimeout(finishPreloader, 220);
      }
    }

    requestAnimationFrame(updatePreloader);

    function finishPreloader() {
      // Unlock scroll
      document.body.style.overflow = "";
      if (window.lenis) window.lenis.start();

      if (hasGSAP && stripes.length > 0) {
        const exitTl = gsap.timeline();

        // 1. Brand hero (logo image, title, tagline, underline progress) completely fades & scales down FIRST
        if (brandHero) {
          exitTl.to(brandHero, {
            opacity: 0,
            y: -22,
            scale: 0.94,
            duration: 0.4,
            ease: "power2.inOut"
          });
        }

        // 2. Cascading Orange Stripes wipe upward AFTER brand hero is completely gone
        exitTl.to(stripes, {
          yPercent: -100,
          duration: 0.82,
          stagger: 0.07,
          ease: "power4.inOut",
          onComplete: () => {
            preloader.style.display = "none";
            ScrollTrigger.refresh();
          }
        }, "+=0.06");

        // 3. Staggered Hero entrance as stripes open
        exitTl.fromTo(["#stage1Headlines", "#containerScene"], 
          { opacity: 0, y: 36 }, 
          { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.12 },
          "-=0.55"
        );
      } else {
        if (brandHero) {
          brandHero.style.transition = "opacity 0.35s ease, transform 0.35s ease";
          brandHero.style.opacity = "0";
          brandHero.style.transform = "scale(0.94)";
        }
        setTimeout(() => {
          preloader.classList.add("loaded");
          if (hasGSAP) {
            ScrollTrigger.refresh();
            gsap.fromTo(["#stage1Headlines", "#containerScene"], 
              { opacity: 0, y: 35 }, 
              { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", delay: 0.2, stagger: 0.1 }
            );
          }
          setTimeout(() => {
            preloader.style.display = "none";
          }, 900);
        }, 400);
      }
    }
  })();

  /* ─── HEADER + PROGRESS ─── */
  const header = document.getElementById("header");
  const progress = document.getElementById("progress");
  if (hasGSAP) {
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: s => {
        progress.style.transform = "scaleX(" + s.progress + ")";
        header.classList.toggle("solid", s.scroll() > 50);
        if (s.scroll() > 160) header.classList.toggle("hidden", s.direction === 1);
        else header.classList.remove("hidden");
      }
    });
  }

  /* ─── AMBIENT COLOR ─── */
  const ambientEl = document.getElementById("ambient");
  const glowEl = document.getElementById("glow");
  document.querySelectorAll("section[data-ambient]").forEach(sec => {
    const c = sec.getAttribute("data-ambient");
    const g = parseFloat(sec.getAttribute("data-glow") || ".4");
    if (hasGSAP)
      ScrollTrigger.create({
        trigger: sec, start: "top 60%", end: "bottom 40%",
        onEnter: () => { gsap.to(ambientEl, { backgroundColor: c, duration: 1.2, overwrite: "auto" }); gsap.to(glowEl, { opacity: g, duration: 1.2, overwrite: "auto" }); },
        onEnterBack: () => { gsap.to(ambientEl, { backgroundColor: c, duration: 1.2, overwrite: "auto" }); gsap.to(glowEl, { opacity: g, duration: 1.2, overwrite: "auto" }); }
      });
  });

  /* ─── REVEALS ─── */
  const reveals = document.querySelectorAll(".reveal, .reveal-left");
  if (hasGSAP && !reduce) {
    reveals.forEach(el => ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => el.classList.add("in") }));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.18 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
  }

  /* ─── THREE.JS WHY 3D SCENE ─── */
  if (hasThree && !reduce) {
    (function () {
      const canvas = document.getElementById("whyCanvas3D");
      if (!canvas) return;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0xF6F7FA, 1);
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0xF6F7FA, 5, 18);
      const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
      camera.position.set(0, 1, 6);
      function resize() { const w = canvas.clientWidth, h = canvas.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
      resize();
      window.addEventListener("resize", resize, { passive: true });
      scene.add(new THREE.AmbientLight(0xffffff, 0.85));
      const oLight = new THREE.PointLight(0xE85B1A, 4, 12); oLight.position.set(2, 2, 3); scene.add(oLight);
      const rim = new THREE.DirectionalLight(0xfff5ea, 0.8); rim.position.set(-3, 4, -2); scene.add(rim);
      const grid = new THREE.GridHelper(20, 20, 0xDCE0E6, 0xEAEEF3); grid.position.y = -2.2; scene.add(grid);
      const group = new THREE.Group(); scene.add(group);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xC74A10, metalness: 0.35, roughness: 0.28, emissive: 0x8A2E05, emissiveIntensity: 0.14 });
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xFF7A33, transparent: true, opacity: 0.95 });
      function addCube(x, y, z, sx, sy, sz, em) {
        const geo = new THREE.BoxGeometry(sx, sy, sz);
        const m = baseMat.clone(); m.emissiveIntensity = em || 0.08;
        const mesh = new THREE.Mesh(geo, m); mesh.position.set(x, y, z); group.add(mesh);
        const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat.clone()); line.position.set(x, y, z); group.add(line);
        return mesh;
      }
      const c1 = addCube(0,0,0,1.4,1.4,1.4,.12), c2 = addCube(-1.2,-.5,-.4,.8,.8,.8,.06), c3 = addCube(1.1,.6,-.6,.6,.6,.6,.15), c4 = addCube(.4,-1.1,.3,.5,.5,.5,.1);
      const torus = new THREE.Mesh(new THREE.TorusGeometry(.4,.04,8,32), new THREE.MeshStandardMaterial({ color: 0xC74A10, emissive: 0xE85B1A, emissiveIntensity: .7 }));
      torus.position.set(0, 2.2, 0); torus.rotation.x = Math.PI/2; scene.add(torus);
      function animate(t) {
        requestAnimationFrame(animate);
        const s = t * 0.001;
        group.rotation.y = s * 0.18; group.rotation.x = Math.sin(s * 0.3) * 0.12;
        c1.rotation.x = s*.3; c2.rotation.y = -s*.4; c3.rotation.z = s*.25; torus.rotation.y = s*.6;
        oLight.position.x = Math.sin(s*.5)*3; oLight.position.y = 2+Math.sin(s*.3)*1;
        renderer.render(scene, camera);
      }
      animate(0);
    })();
  }

  /* ═══════════════════════════════════════════════════════════
     THEATRICAL 320VH SCROLL STAGE & 3D ISOMETRIC SVG CONTAINER
     Apple-grade continuous scroll choreography with crane hoist,
     3D perspective yaw/pitch, dynamic color morph & inspection mode
     ═══════════════════════════════════════════════════════════ */
  function initTheatricalScrollHero() {
    const stage = document.getElementById("hero");
    const stickyStage = document.getElementById("theatricalStage");
    if (!stage || !stickyStage) return;

    const bgLayer = document.getElementById("theatricalBg");
    const containerGyro = document.getElementById("containerGyro");
    const stage1Headlines = document.getElementById("stage1Headlines");
    const stage2Statement = document.getElementById("stage2Statement");
    const stage3Inspection = document.getElementById("stage3Inspection");
    const scrollCue = document.getElementById("theatricalScrollCue");

    // SVG animated elements
    const orangeSkin = document.getElementById("containerFaceGroupOrange");
    const hookBlock = document.getElementById("craneHookBlock");
    const verticalCable = document.getElementById("craneVerticalCable");
    const sling1 = document.getElementById("slingCable1");
    const sling2 = document.getElementById("slingCable2");
    const sling3 = document.getElementById("slingCable3");
    const sling4 = document.getElementById("slingCable4");

    // Master ScrollTrigger Timeline across the 320vh height
    if (hasGSAP && !reduce) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2
        }
      });

      // ── STAGE 1 -> STAGE 2 (0.0 to 0.50):
      // Headlines lift & fade
      tl.to(stage1Headlines, { opacity: 0, y: -45, duration: 0.28 }, 0)
        // Background color blend to vermilion brand orange (#E85B1A)
        .to(bgLayer, { backgroundColor: "#E85B1A", duration: 0.32 }, 0.15)
        // Container morph to vibrant vermilion orange
        .to(orangeSkin, { opacity: 1, duration: 0.28 }, 0.18)

        // Crane Hoist descends: hook lowers from 55 to 110
        .to(hookBlock, {
          y: 55,
          duration: 0.42,
          ease: "none",
          onUpdate: function () {
            const curY = 55 + (hookBlock._gsap ? hookBlock._gsap.y : 0);
            if (verticalCable) verticalCable.setAttribute("y2", curY);
            const apexY = curY + 24;
            if (sling1) sling1.setAttribute("y1", apexY);
            if (sling2) sling2.setAttribute("y1", apexY);
            if (sling3) sling3.setAttribute("y1", apexY);
            if (sling4) sling4.setAttribute("y1", apexY);
          }
        }, 0.1)

        // 3D Perspective Rotation (Yaw & Pitch)
        .to(containerGyro, {
          "--scroll-rot-y": "16deg",
          "--scroll-rot-x": "-5deg",
          "--scroll-trans-y": "30px",
          duration: 0.35,
          ease: "power1.inOut"
        }, 0.1)

        // Stage 2 Statement enters
        .fromTo(stage2Statement, 
          { opacity: 0, scale: 0.92, y: 35 }, 
          { opacity: 1, scale: 1, y: 0, duration: 0.22 }, 
          0.26
        )
        // Statement holds in focus
        .to(stage2Statement, { opacity: 1, duration: 0.22 }, 0.48)
        // Statement lifts & fades out
        .to(stage2Statement, { opacity: 0, scale: 1.05, y: -30, duration: 0.18 }, 0.70)

        // ── STAGE 2 -> STAGE 3 (0.50 to 1.0):
        // Background blends into soft inspection bay neutral
        .to(bgLayer, { backgroundColor: "#F8F9FA", duration: 0.24 }, 0.68)
        // Container returns to crisp inspection mode
        .to(orangeSkin, { opacity: 0.15, duration: 0.24 }, 0.70)
        // 3D Perspective centers for inspection
        .to(containerGyro, {
          "--scroll-rot-y": "-10deg",
          "--scroll-rot-x": "4deg",
          duration: 0.25,
          ease: "power1.inOut"
        }, 0.45)
        .to(containerGyro, {
          "--scroll-rot-y": "0deg",
          "--scroll-rot-x": "0deg",
          "--scroll-trans-y": "15px",
          duration: 0.24,
          ease: "power1.out"
        }, 0.72)

        // Crane hoist re-stabilizes
        .to(hookBlock, {
          y: 20,
          duration: 0.24,
          onUpdate: function () {
            const curY = 55 + (hookBlock._gsap ? hookBlock._gsap.y : 0);
            if (verticalCable) verticalCable.setAttribute("y2", curY);
            const apexY = curY + 24;
            if (sling1) sling1.setAttribute("y1", apexY);
            if (sling2) sling2.setAttribute("y1", apexY);
            if (sling3) sling3.setAttribute("y1", apexY);
            if (sling4) sling4.setAttribute("y1", apexY);
          }
        }, 0.74)

        // Inspection Hotspots enter
        .fromTo(stage3Inspection,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.22 },
          0.76
        )
        // Scroll cue fades out
        .to(scrollCue, { opacity: 0, duration: 0.1 }, 0.85);
    }

    // ── Interactive Mouse Gyro Tilt Loop ──
    let targetGyroX = 0, targetGyroY = 0;
    let currentGyroX = 0, currentGyroY = 0;
    let gyroRaf = null;

    stickyStage.addEventListener("pointermove", e => {
      const rect = stickyStage.getBoundingClientRect();
      targetGyroX = (e.clientX - rect.left) / rect.width - 0.5;
      targetGyroY = (e.clientY - rect.top) / rect.height - 0.5;
    }, { passive: true });

    stickyStage.addEventListener("pointerleave", () => {
      targetGyroX = 0;
      targetGyroY = 0;
    }, { passive: true });

    function gyroLoop() {
      gyroRaf = requestAnimationFrame(gyroLoop);
      currentGyroX += (targetGyroX - currentGyroX) * 0.08;
      currentGyroY += (targetGyroY - currentGyroY) * 0.08;
      stickyStage.style.setProperty("--gyro-x", currentGyroX.toFixed(4));
      stickyStage.style.setProperty("--gyro-y", currentGyroY.toFixed(4));
    }
    gyroLoop();

    // ── Inspection Modal Dialog Logic ──
    const modalBackdrop = document.getElementById("specModalBackdrop");
    const modalBody = document.getElementById("specModalBody");
    const modalClose = document.getElementById("specModalClose");

    const specData = {
      security: {
        badge: "ISO 1496-1 / CSC CERTIFIED",
        title: "أنظمة الأمان والإغلاق المحكم (ISO 1496)",
        desc: "أبواب فولاذية مزدوجة مصممة لتحمل أعتى ظروف النقل البري والبحري، مزودة بـ 4 قضبان قفل من فولاذ الكورتن المعالج.",
        specs: [
          { label: "مادة الصنع", val: "Corten-A Weathering Steel" },
          { label: "قوة الشد للأقفال", val: "520 N/mm² Tensile Strength" },
          { label: "الأختام الجمركية", val: "ISO 17712 High Security Seal" },
          { label: "حشية الإحكام", val: "EPDM Double Lip (-40°C to +80°C)" }
        ],
        features: [
          "أقفال مزدوجة مقاومة للقص ومحمية بصناديق قفل فولاذية (Lock Boxes).",
          "توافق كامل مع متطلبات التفتيش الجمركي الذكي وإجراءات الفحص بالأشعة.",
          "عزل كلي ضد تسرب المياه والرطوبة والأتربة الصحراوية بفضل حشيات EPDM.",
          "شهادة اعتماد CSC الدولية لاختبارات الضغط والتكديس حتى 9 حاويات."
        ]
      },
      tracking: {
        badge: "SATELLITE IoT & TELEMATICS",
        title: "منظومة التتبع الفضائي الذكي (IoT Smart Sensor)",
        desc: "وحدة تتبع ذكية مثبتة أعلى الحاوية متصلة بالأقمار الصناعية وشبكات 4G/5G لتزويد غرفة العمليات ببيانات لحظية.",
        specs: [
          { label: "نظام تحديد المواقع", val: "Dual GPS & GLONASS Constellation" },
          { label: "دقة التتبع", val: "أقل من 2.5 متر على مدار 24 ساعة" },
          { label: "حساسات البيئة", val: "مراقبة الحرارة والرطوبة الداخلية" },
          { label: "حساس الصدمات", val: "3-Axis Accelerometer (> 2.5G Impact)" }
        ],
        features: [
          "تنبيهات فورية عند فتح الأبواب أو تجاوز السياج الجغرافي المحدد للمسار (Geofencing).",
          "سجل بيئي موثق لدرجات الحرارة ونسبة الرطوبة للشحنات الحساسة.",
          "بطارية احتياطية طويلة الأجل مدعومة بتقنية الاستشعار الشمسي منخفض الطاقة.",
          "تكامل رقمي مباشر مع بوابة العميل لمتابعة الشحنة دقيقة بدقيقة."
        ]
      },
      delivery: {
        badge: "EXPEDITE CORRIDORS & PORT CLEARANCE",
        title: "التزام فائق بالمواعيد والربط اللوجستي السريع",
        desc: "شبكة نقل متطورة تغطي كافة موانئ ومنافذ المملكة مع تنسيق جمركي استباقي يضمن تفريغ وتسليم الشحنات في وقت قياسي.",
        specs: [
          { label: "معدل الالتزام بالمواعيد", val: "99.4% On-time Delivery Index" },
          { label: "الربط الجمركي", val: "تكامل مباشر مع منصة فسح (FASAH)" },
          { label: "أسطول النقل", val: "شاحنات حديثة بنظام التعليق الهوائي" },
          { label: "زمن الاستجابة للموانئ", val: "أقل من 3 ساعات من لحظة الإذن" }
        ],
        features: [
          "مسارات نقل سريعة مخصصة تربط ميناء جدة الإسلامي وميناء الملك عبدالعزيز بالرياض.",
          "تخليص جمركي فوري واستباقي يقلل فترات المكوث في ساحات الحاويات.",
          "شاحنات مجهزة بأنظمة تعليق متطورة لحماية البضائع من اهتزازات الطرق السريعة.",
          "إشعارات وصول تلقائية مع إثبات التسليم الإلكتروني (e-POD)."
        ]
      },
      support: {
        badge: "24/7 LOGISTICS OPERATIONS CENTER",
        title: "غرفة عمليات وإشراف لوجستي على مدار الساعة",
        desc: "فريق عمليات متخصص يعمل على مدار 24 ساعة طوال أيام الأسبوع لتقديم الدعم الفني، إدارة الأزمات، والتنسيق الميداني.",
        specs: [
          { label: "ساعات العمل", val: "24 ساعة / 7 أيام بدون انقطاع" },
          { label: "زمن الاستجابة للبلاغات", val: "أقل من 8 دقائق" },
          { label: "التغطية التأمينية", val: "تأمين شامل على البضائع المنقولة" },
          { label: "قنوات التواصل", val: "بوابة رقمية · اتصال مباشر · واتساب موثق" }
        ],
        features: [
          "إشراف مباشر على حركة السائقين ومراقبة فترات الراحة والسلامة المرورية.",
          "إدارة مخصصة لتصاريح النقل الثقيل ونقل المعدات النفطية والإنشائية.",
          "فريق تدخل سريع لحالات الطوارئ والأعطال الميدانية على الطرق السريعة.",
          "تقارير أداء دورية وتحليلات لوجستية مخصصة للعملاء والمشاريع الكبرى."
        ]
      }
    };

    function openModal(type) {
      const data = specData[type];
      if (!data || !modalBackdrop || !modalBody) return;

      modalBody.innerHTML = `
        <div class="spec-modal-header">
          <span class="spec-modal-badge">${data.badge}</span>
          <h3 id="modalTitle">${data.title}</h3>
          <p>${data.desc}</p>
        </div>
        <div class="spec-grid">
          ${data.specs.map(s => `
            <div class="spec-item">
              <div class="spec-item-label">${s.label}</div>
              <div class="spec-item-val">${s.val}</div>
            </div>
          `).join("")}
        </div>
        <ul class="spec-features-list">
          ${data.features.map(f => `<li>${f}</li>`).join("")}
        </ul>
      `;

      modalBackdrop.classList.add("active");
      modalBackdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      if (!modalBackdrop) return;
      modalBackdrop.classList.remove("active");
      modalBackdrop.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    document.querySelectorAll(".hotspot-card[data-hotspot]").forEach(card => {
      card.addEventListener("click", () => {
        openModal(card.getAttribute("data-hotspot"));
      });
      card.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(card.getAttribute("data-hotspot"));
        }
      });
    });

    if (modalClose) modalClose.addEventListener("click", closeModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", e => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && modalBackdrop && modalBackdrop.classList.contains("active")) {
        closeModal();
      }
    });
  }

  // Initialize Theatrical Hero
  initTheatricalScrollHero();

  /* ─── COUNTERS ─── */
  document.querySelectorAll(".stat-item").forEach(item => {
    const el = item.querySelector(".count-val");
    const target = parseInt(item.dataset.count, 10);
    if (!el || isNaN(target)) return;
    let started = false;
    const go = () => {
      if (started) return; started = true;
      item.classList.add("in");
      const dur = 1600, t0 = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round((1-(1-p)**3)*target);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(e => { e.forEach(x => { if(x.isIntersecting){go();io.unobserve(item)}}); }, { threshold:.5 });
      io.observe(item);
    } else go();
  });

  /* ─── PROCESS TIMELINE ─── */
  if (hasGSAP && !reduce) {
    const steps = document.querySelectorAll(".process-step");
    const fillEl = document.getElementById("processLineFill");
    const container = document.getElementById("processSteps");
    if (container && fillEl && steps.length) {
      ScrollTrigger.create({
        trigger: container, start: "top 80%", end: "bottom 40%", scrub: true,
        onUpdate: self => {
          fillEl.style.height = (self.progress * 100) + "%";
          const idx = Math.min(Math.floor(self.progress * steps.length), steps.length - 1);
          steps.forEach((s, i) => s.classList.toggle("active", i <= idx));
        }
      });
    }
  }

  
  /* ─── PREVIOUS WORK EXPERIENCE: 3D YEMEN MAP & PROJECT SHOWCASE ─── */
  (function initYemenMapSection() {
    const mapData = window.YEMEN_MAP_DATA;
    const canvas = document.getElementById("yemenMapCanvas");
    const stage = document.getElementById("yemenMapStage");
    const overlay = document.getElementById("yemenPinsOverlay");
    const tooltip = document.getElementById("mapTooltip");
    const pillsContainer = document.getElementById("locationsPills");
    const activeProjectCard = document.getElementById("activeProjectCard");
    const activeCityTag = document.getElementById("detailsActiveCityTag");
    const progressDots = document.getElementById("detailsProgressDots");
    const prevBtn = document.getElementById("prevProjectBtn");
    const nextBtn = document.getElementById("nextProjectBtn");
    const resetBtn = document.getElementById("mapResetBtn");
    const rotateBtn = document.getElementById("mapAutoRotateBtn");
    const autoRotateText = document.getElementById("autoRotateText");
    const zoomInBtn = document.getElementById("mapZoomIn");
    const zoomOutBtn = document.getElementById("mapZoomOut");
    const fallbackEl = document.getElementById("mapFallback");

    if (!mapData || !canvas) return;

    const projects = mapData.projects || [];
    const governorates = mapData.governorates || [];
    let currentProjIdx = 0;
    let isAutoRotate = false;
    let autoRotatePaused = false;
    let autoRotateResumeTimer = null;

    /* Check WebGL Support */
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
    } catch (e) {
      if (fallbackEl) fallbackEl.style.display = "flex";
      renderProjectShowcase(0);
      setupLocationPills();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    
    let targetZoom = 18.2;
    let currentZoom = 18.2;
    const MIN_ZOOM = 13.0;
    const MAX_ZOOM = 28.0;

    camera.position.set(0, 0, currentZoom);

    function resizeCanvas() {
      if (!canvas || !stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    /* Lighting */
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaf4, 1.3);
    sunLight.position.set(14, 22, 18);
    scene.add(sunLight);

    const rimOrange = new THREE.DirectionalLight(0xE85B1A, 1.8);
    rimOrange.position.set(-16, -8, 12);
    scene.add(rimOrange);

    const fillBlue = new THREE.DirectionalLight(0x76889e, 0.4);
    fillBlue.position.set(6, -16, -10);
    scene.add(fillBlue);

    /* 3D Map Group */
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // Initial cinematic isometric orientation
    const DEFAULT_ROT_X = 0.0;
    const DEFAULT_ROT_Y = 0.0;
    let targetRotX = DEFAULT_ROT_X;
    let currentRotX = DEFAULT_ROT_X;
    let targetRotY = DEFAULT_ROT_Y;
    let currentRotY = DEFAULT_ROT_Y;

    mapGroup.rotation.x = currentRotX;
    mapGroup.rotation.y = currentRotY;

    /* Pedestal and Concentric Coordinate Rings */
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, 0, -0.04);

    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xC74A10, transparent: true, opacity: 0.42, side: THREE.DoubleSide });
    const ringGeo1 = new THREE.RingGeometry(9.6, 9.64, 64);
    pedestalGroup.add(new THREE.Mesh(ringGeo1, ringMat1));

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xE85B1A, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const ringGeo2 = new THREE.RingGeometry(7.4, 7.43, 64);
    pedestalGroup.add(new THREE.Mesh(ringGeo2, ringMat2));

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x943206, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    const ringGeo3 = new THREE.RingGeometry(11.8, 11.84, 64);
    pedestalGroup.add(new THREE.Mesh(ringGeo3, ringMat3));

    // Ground reflection plane
    const shadowGeo = new THREE.PlaneGeometry(25, 17);
    const canvasShadow = document.createElement("canvas");
    canvasShadow.width = 256; canvasShadow.height = 256;
    const sctx = canvasShadow.getContext("2d");
    const sgrad = sctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    sgrad.addColorStop(0, "rgba(232, 91, 26, 0.18)");
    sgrad.addColorStop(0.45, "rgba(148, 50, 6, 0.16)");
    sgrad.addColorStop(1, "rgba(255, 255, 255, 0)");
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(canvasShadow);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, 0, -0.06);
    pedestalGroup.add(shadowMesh);

    mapGroup.add(pedestalGroup);

    /* Materials for Governorates */
    const govMatFront = new THREE.MeshStandardMaterial({
      color: 0xC74A10,
      roughness: 0.38,
      metalness: 0.32,
      emissive: 0x8A2E05,
      emissiveIntensity: 0.12
    });
    const govMatSide = new THREE.MeshStandardMaterial({
      color: 0x943206,
      roughness: 0.32,
      metalness: 0.48
    });

    const govMeshMap = new Map(); // govId -> array of meshes
    const govLinesMap = new Map(); // govId -> array of border lines
    const interactiveMeshes = []; // for raycasting

    /* Extrude Governorates */
    const extrudeSettings = {
      depth: 0.38,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2
    };

    governorates.forEach(gov => {
      const meshes = [];
      const lines = [];

      gov.polygons.forEach(poly => {
        if (!poly || poly.length === 0) return;
        const extRing = poly[0];
        if (extRing.length < 3) return;

        const shape = new THREE.Shape();
        shape.moveTo(extRing[0][0], extRing[0][1]);
        for (let i = 1; i < extRing.length; i++) {
          shape.lineTo(extRing[i][0], extRing[i][1]);
        }

        // Add inner holes if any
        for (let h = 1; h < poly.length; h++) {
          const holeRing = poly[h];
          if (holeRing.length >= 3) {
            const holePath = new THREE.Path();
            holePath.moveTo(holeRing[0][0], holeRing[0][1]);
            for (let j = 1; j < holeRing.length; j++) {
              holePath.lineTo(holeRing[j][0], holeRing[j][1]);
            }
            shape.holes.push(holePath);
          }
        }

        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const frontM = govMatFront.clone();
        const sideM = govMatSide.clone();
        const mesh = new THREE.Mesh(geom, [frontM, sideM]);
        mesh.userData = {
          govId: gov.id,
          nameAr: gov.nameAr,
          nameEn: gov.nameEn,
          frontMat: frontM
        };

        // Top border edges
        const edgesGeom = new THREE.EdgesGeometry(geom, 30);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xFF7A33, transparent: true, opacity: 0.9 });
        const lineSeg = new THREE.LineSegments(edgesGeom, lineMat);
        mesh.add(lineSeg);

        mapGroup.add(mesh);
        meshes.push(mesh);
        lines.push(lineSeg);
        interactiveMeshes.push(mesh);
      });

      govMeshMap.set(gov.id, meshes);
      govLinesMap.set(gov.id, lines);
    });

    /* 3D Project Markers (Pins) */
    const markerObjects = []; // { id, group, beacon, pulseRing, pinEl }

    projects.forEach((proj, idx) => {
      const pos = proj.projected;
      const markerGroup = new THREE.Group();
      markerGroup.position.set(pos[0], pos[1], 0.42);

      // 1. Ground Pulse Disc
      const pulseGeo = new THREE.RingGeometry(0.12, 0.32, 32);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xE85B1A,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.set(0, 0, 0.01);
      markerGroup.add(pulseMesh);

      // 2. Light Pillar
      const pillarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 16);
      pillarGeo.rotateX(Math.PI / 2);
      pillarGeo.translate(0, 0, 0.18);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xFF6B2B,
        emissive: 0xE85B1A,
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.82,
        roughness: 0.2
      });
      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      markerGroup.add(pillarMesh);

      // 3. Floating Diamond Beacon
      const beaconGeo = new THREE.OctahedronGeometry(0.14, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0xFF7A3D,
        emissive: 0xE85B1A,
        emissiveIntensity: 0.95,
        roughness: 0.15,
        metalness: 0.3
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.set(0, 0, 0.45);
      markerGroup.add(beaconMesh);

      mapGroup.add(markerGroup);

      // HTML Projected Pin Badge
      const pinEl = document.createElement("div");
      pinEl.className = "yemen-map-pin" + (idx === 0 ? " active" : "");
      pinEl.dataset.id = proj.id;
      pinEl.innerHTML = `
        <div class="pin-badge">
          <span class="pin-tag">📍</span>
          <span class="pin-name">${proj.city}</span>
        </div>
        <div class="pin-beacon-core">
          <div class="pin-dot"></div>
          <div class="pin-pulse-ring"></div>
        </div>
      `;
      pinEl.addEventListener("click", (e) => {
        e.stopPropagation();
        selectProject(proj.id, true);
      });
      overlay.appendChild(pinEl);

      markerObjects.push({
        id: proj.id,
        index: idx,
        group: markerGroup,
        beacon: beaconMesh,
        pulseRing: pulseMesh,
        pinEl: pinEl,
        baseZ: 0.45
      });
    });

    /* HTML Elements & Interaction Setup */
    setupLocationPills();
    setupProgressDots();
    renderProjectShowcase(0);

    function setupLocationPills() {
      if (!pillsContainer) return;
      pillsContainer.innerHTML = "";
      projects.forEach((proj, idx) => {
        const btn = document.createElement("button");
        btn.className = "loc-pill" + (idx === 0 ? " active" : "");
        btn.type = "button";
        btn.dataset.id = proj.id;
        btn.innerHTML = `<span class="loc-icon">◆</span><span>${proj.city}</span>`;
        btn.addEventListener("click", () => {
          selectProject(proj.id, false);
        });
        pillsContainer.appendChild(btn);
      });
    }

    function setupProgressDots() {
      if (!progressDots) return;
      progressDots.innerHTML = "";
      projects.forEach((p, idx) => {
        const dot = document.createElement("span");
        dot.className = "dot-step" + (idx === 0 ? " active" : "");
        dot.title = p.city;
        dot.addEventListener("click", () => {
          selectProject(p.id, false);
        });
        progressDots.appendChild(dot);
      });
    }

    /* Select Active Project */
    function selectProject(projId, shouldScroll) {
      const idx = projects.findIndex(p => p.id === projId);
      if (idx === -1) return;
      currentProjIdx = idx;
      const proj = projects[idx];

      // Update Pin Badges
      markerObjects.forEach(m => {
        const isActive = (m.id === projId);
        m.pinEl.classList.toggle("active", isActive);
        if (isActive) {
          m.beacon.scale.set(1.4, 1.4, 1.4);
          m.beacon.material.emissiveIntensity = 1.6;
        } else {
          m.beacon.scale.set(1.0, 1.0, 1.0);
          m.beacon.material.emissiveIntensity = 0.95;
        }
      });

      // Update Location Filter Pills
      if (pillsContainer) {
        pillsContainer.querySelectorAll(".loc-pill").forEach(p => {
          p.classList.toggle("active", p.dataset.id === projId);
        });
      }

      // Update Progress Dots
      if (progressDots) {
        progressDots.querySelectorAll(".dot-step").forEach((dot, i) => {
          dot.classList.toggle("active", i === idx);
        });
      }

      // Highlight Governorates
      governorates.forEach(g => {
        const isTarget = (g.id === proj.govId);
        const meshes = govMeshMap.get(g.id) || [];
        const lines = govLinesMap.get(g.id) || [];
        meshes.forEach(m => {
          if (isTarget) {
            m.userData.frontMat.color.setHex(0xFF6B2B);
            m.userData.frontMat.emissive.setHex(0xE85B1A);
            m.userData.frontMat.emissiveIntensity = 0.65;
          } else {
            m.userData.frontMat.color.setHex(0xC74A10);
            m.userData.frontMat.emissive.setHex(0x8A2E05);
            m.userData.frontMat.emissiveIntensity = 0.12;
          }
        });
        lines.forEach(l => {
          if (isTarget) {
            l.material.color.setHex(0xFFFFFF);
            l.material.opacity = 1.0;
          } else {
            l.material.color.setHex(0xFF7A33);
            l.material.opacity = 0.75;
          }
        });
      });

      // Render Project Showcase Details
      renderProjectShowcase(idx);

      // Smooth scroll to dedicated details area if requested
      if (shouldScroll) {
        const detailsEl = document.getElementById("projectDetailsArea");
        if (detailsEl) {
          if (window.lenis) {
            window.lenis.scrollTo(detailsEl, { offset: -60 });
          } else {
            detailsEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    }

    /* Render Project Showcase Card */
    function renderProjectShowcase(idx) {
      if (!activeProjectCard) return;
      const p = projects[idx];
      if (!p) return;

      if (activeCityTag) activeCityTag.textContent = p.city;

      // Animate transition out
      activeProjectCard.classList.add("fade-out");

      setTimeout(() => {
        const servicesHtml = p.services.map(s => `
          <li class="scope-item">
            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${s}</span>
          </li>
        `).join("");

        const techHtml = p.technologies.map(t => `
          <li class="scope-item">
            <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>${t}</span>
          </li>
        `).join("");

        const statsHtml = p.stats.map(st => `
          <div class="pstat-card">
            <div class="pstat-val">${st.val}</div>
            <div class="pstat-label">${st.label}</div>
          </div>
        `).join("");

        activeProjectCard.innerHTML = `
          <div class="project-grid">
            <div class="project-main">
              <div class="project-badge-row">
                <span class="proj-cat-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M2 12h20"/></svg>
                  ${p.category}
                </span>
                <span class="proj-status-badge">● ${p.status}</span>
                <span class="proj-year-badge">${p.year}</span>
              </div>

              <h3 class="project-title">${p.title}</h3>
              <p class="project-tagline">${p.tagline}</p>

              <div class="project-location-bar">
                <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span><strong>الموقع الجغرافي:</strong> ${p.location}</span>
              </div>

              <p class="project-desc">${p.overview}</p>

              <div class="project-scope-grid">
                <div class="scope-col">
                  <div class="scope-col-title">
                    <svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                    <span>الخدمات والمهام المنفذة</span>
                  </div>
                  <ul class="scope-list">
                    ${servicesHtml}
                  </ul>
                </div>

                <div class="scope-col">
                  <div class="scope-col-title">
                    <svg viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    <span>الأسطول والمعدات والتقنيات</span>
                  </div>
                  <ul class="scope-list">
                    ${techHtml}
                  </ul>
                </div>
              </div>

              <div class="project-stats-grid">
                ${statsHtml}
              </div>

              <div class="project-action-row">
                <a class="btn btn-primary" href="#cta">طلب استشارة لهذا المشروع</a>
                <a class="btn btn-ghost" href="#services">استعراض كافة الخدمات</a>
              </div>
            </div>

            <div class="project-visual-col">
              <div class="project-img-wrapper">
                <img class="project-img" src="${p.image}" alt="${p.title}" loading="lazy" />
                <div class="project-img-overlay"></div>
                <div class="project-img-caption">
                  <span class="cap-city">${p.city}</span>
                  <span class="cap-tag">${p.category}</span>
                </div>
              </div>
            </div>
          </div>
        `;

        activeProjectCard.classList.remove("fade-out");
      }, 220);
    }

    /* Prev / Next Buttons */
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const nextIdx = (currentProjIdx - 1 + projects.length) % projects.length;
        selectProject(projects[nextIdx].id, false);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const nextIdx = (currentProjIdx + 1) % projects.length;
        selectProject(projects[nextIdx].id, false);
      });
    }

    /* Controls: Reset, AutoRotate, Zoom */
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        targetRotX = DEFAULT_ROT_X;
        targetRotY = DEFAULT_ROT_Y;
        targetZoom = 18.2;
      });
    }

    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        isAutoRotate = !isAutoRotate;
        rotateBtn.classList.toggle("active", isAutoRotate);
        if (autoRotateText) autoRotateText.textContent = isAutoRotate ? "إيقاف التدوير" : "تدوير تلقائي";
      });
    }

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        targetZoom = Math.max(MIN_ZOOM, targetZoom - 2.5);
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        targetZoom = Math.min(MAX_ZOOM, targetZoom + 2.5);
      });
    }

    /* Pointer Drag & Orbit Controls */
    let isPointerDown = false;
    let lastX = 0, lastY = 0;

    stage.addEventListener("pointerdown", e => {
      isPointerDown = true;
      lastX = e.clientX;
      lastY = e.clientY;
      autoRotatePaused = true;
      clearTimeout(autoRotateResumeTimer);
    }, { passive: true });

    window.addEventListener("pointermove", e => {
      if (!isPointerDown) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      targetRotY += dx * 0.0055;
      targetRotX += dy * 0.0045;
      // Clamp X rotation to keep map viewable from top/isometric
      targetRotX = Math.max(-0.65, Math.min(0.65, targetRotX));
    }, { passive: true });

    window.addEventListener("pointerup", () => {
      if (!isPointerDown) return;
      isPointerDown = false;
      // Resume auto-rotation after 4 seconds of idle
      clearTimeout(autoRotateResumeTimer);
      autoRotateResumeTimer = setTimeout(() => {
        autoRotatePaused = false;
      }, 4000);
    }, { passive: true });

    // Wheel Zoom
    stage.addEventListener("wheel", e => {
      e.preventDefault();
      targetZoom += (e.deltaY > 0 ? 1 : -1) * 1.2;
      targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    }, { passive: false });

    /* Raycasting & Hover on Governorate meshes */
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();
    let hoveredGovId = null;

    function resetGovHover(govId) {
      if (!govId) return;
      const isSelected = (govId === projects[currentProjIdx].govId);
      const meshes = govMeshMap.get(govId) || [];
      const lines = govLinesMap.get(govId) || [];
      meshes.forEach(m => {
        if (isSelected) {
          m.userData.frontMat.color.setHex(0xFF6B2B);
          m.userData.frontMat.emissive.setHex(0xE85B1A);
          m.userData.frontMat.emissiveIntensity = 0.65;
        } else {
          m.userData.frontMat.color.setHex(0xC74A10);
          m.userData.frontMat.emissive.setHex(0x8A2E05);
          m.userData.frontMat.emissiveIntensity = 0.12;
        }
      });
      lines.forEach(l => {
        if (isSelected) {
          l.material.color.setHex(0xFFFFFF);
          l.material.opacity = 1.0;
        } else {
          l.material.color.setHex(0xFF7A33);
          l.material.opacity = 0.75;
        }
      });
    }

    function applyGovHover(govId) {
      if (!govId) return;
      const isSelected = (govId === projects[currentProjIdx].govId);
      if (isSelected) return; // Keep active selected styling
      const meshes = govMeshMap.get(govId) || [];
      const lines = govLinesMap.get(govId) || [];
      meshes.forEach(m => {
        m.userData.frontMat.color.setHex(0xE05818);
        m.userData.frontMat.emissive.setHex(0xFF7A33);
        m.userData.frontMat.emissiveIntensity = 0.42;
      });
      lines.forEach(l => {
        l.material.color.setHex(0xFFFFFF);
        l.material.opacity = 0.95;
      });
    }

    stage.addEventListener("pointermove", e => {
      const rect = stage.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        const currentId = hit.userData ? hit.userData.govId : null;

        if (hoveredGovId !== currentId) {
          if (hoveredGovId) resetGovHover(hoveredGovId);
          hoveredGovId = currentId;
          if (hoveredGovId) applyGovHover(hoveredGovId);
        }

        stage.style.cursor = "pointer";

        // Tooltip
        if (tooltip && hit.userData) {
          const govName = hit.userData.nameAr;
          const relatedProj = projects.find(p => p.govId === hit.userData.govId);
          tooltip.style.display = "block";
          tooltip.style.left = (e.clientX - rect.left) + "px";
          tooltip.style.top = (e.clientY - rect.top) + "px";
          tooltip.innerHTML = `
            <div class="tt-title">📍 ${govName}</div>
            <div class="tt-sub">${relatedProj ? relatedProj.title : "محافظة يمنية — نطاق التغطية"}</div>
          `;
        }
      } else {
        if (hoveredGovId) {
          resetGovHover(hoveredGovId);
          hoveredGovId = null;
        }
        stage.style.cursor = isPointerDown ? "grabbing" : "grab";
        if (tooltip) tooltip.style.display = "none";
      }
    }, { passive: true });

    stage.addEventListener("pointerleave", () => {
      if (hoveredGovId) {
        resetGovHover(hoveredGovId);
        hoveredGovId = null;
      }
      if (tooltip) tooltip.style.display = "none";
      stage.style.cursor = "default";
    }, { passive: true });

    stage.addEventListener("click", e => {
      const rect = stage.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.govId) {
          const matched = projects.find(p => p.govId === hit.userData.govId);
          if (matched) {
            selectProject(matched.id, true);
          }
        }
      }
    });

    /* Animation Render Loop */
    const vProj = new THREE.Vector3();
    let clockTime = 0;

    function renderLoop() {
      requestAnimationFrame(renderLoop);

      clockTime += 0.02;

      // Auto-rotation
      if (isAutoRotate && !autoRotatePaused && !reduce) {
        targetRotY += 0.0014;
      }

      // Smooth damping
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentZoom += (targetZoom - currentZoom) * 0.08;

      mapGroup.rotation.x = currentRotX;
      mapGroup.rotation.y = currentRotY;
      camera.position.z = currentZoom;

      // Animate Pin Beacons & Pulse Rings
      markerObjects.forEach((m, i) => {
        const bob = Math.sin(clockTime * 2.5 + i * 0.8) * 0.08;
        m.beacon.position.z = m.baseZ + bob;
        m.beacon.rotation.z += 0.03;

        // Pulse scale
        const pScale = 1.0 + Math.abs(Math.sin(clockTime * 2.0 + i * 0.8)) * 0.6;
        m.pulseRing.scale.set(pScale, pScale, 1);
        m.pulseRing.material.opacity = 0.9 - (pScale - 1.0) * 0.7;

        // Project 3D tip to Screen Overlay
        m.beacon.getWorldPosition(vProj);
        vProj.project(camera);

        if (vProj.z < 1.0) {
          const w = stage.clientWidth;
          const h = stage.clientHeight;
          const sx = (vProj.x * 0.5 + 0.5) * w;
          const sy = (-vProj.y * 0.5 + 0.5) * h;
          m.pinEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
          m.pinEl.style.display = "flex";
        } else {
          m.pinEl.style.display = "none";
        }
      });

      renderer.render(scene, camera);
    }

    renderLoop();
  })();

  /* ─── REFRESH ─── */
  if (hasGSAP) {
    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

})();