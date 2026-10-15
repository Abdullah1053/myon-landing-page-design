import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { YEMEN_MAP_DATA } from '../data/yemenMapData';
import { Project, Governorate } from '../types';

interface MarkerItem {
  id: string;
  index: number;
  group: THREE.Group;
  beacon: THREE.Mesh;
  pulseRing: THREE.Mesh;
  baseZ: number;
}

// Responsive Camera Base Distance so Yemen 3D Map fits phone screens comfortably without clipping
const getResponsiveBaseZoom = (width?: number) => {
  const w = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
  if (w <= 375) return 25.0; // Small phone portrait
  if (w <= 480) return 23.5; // Standard mobile phone
  if (w <= 640) return 22.0; // Large phone / phablet
  if (w <= 992) return 20.0; // Tablet
  return 18.2; // Desktop
};

export const YemenMapExperience: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const detailsAreaRef = useRef<HTMLDivElement>(null);

  const projects: Project[] = YEMEN_MAP_DATA.projects as Project[];
  const governorates: Governorate[] = YEMEN_MAP_DATA.governorates as Governorate[];

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [cardFade, setCardFade] = useState<boolean>(false);
  const pinElementsRef = useRef<{ [id: string]: HTMLDivElement | null }>({});

  const isAutoRotateRef = useRef(isAutoRotate);
  isAutoRotateRef.current = isAutoRotate;

  const currentIdxRef = useRef(currentIdx);
  currentIdxRef.current = currentIdx;

  const selectedGovIdRef = useRef<string | null>(projects[0]?.govId || 'aden');
  const hoveredGovIdRef = useRef<string | null>(null);
  const selectedProjectIdRef = useRef<string | null>(projects[0]?.id || 'aden-port');
  const updateGovernorateStylesRef = useRef<((selId: string | null, hovId: string | null) => void) | null>(null);

  // 3D Controls references
  const controlsRef = useRef<{
    targetRotX: number;
    currentRotX: number;
    targetRotY: number;
    currentRotY: number;
    targetZoom: number;
    currentZoom: number;
    isPointerDown: boolean;
    lastX: number;
    lastY: number;
    autoRotatePaused: boolean;
    autoRotateResumeTimer: any;
    hasCustomZoom: boolean;
  }>({
    targetRotX: 0,
    currentRotX: 0,
    targetRotY: 0,
    currentRotY: 0,
    targetZoom: 18.2,
    currentZoom: 18.2,
    isPointerDown: false,
    lastX: 0,
    lastY: 0,
    autoRotatePaused: false,
    autoRotateResumeTimer: null,
    hasCustomZoom: false,
  });

  const govMeshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
  const govLinesMapRef = useRef<Map<string, THREE.LineSegments[]>>(new Map());
  const markerObjectsRef = useRef<MarkerItem[]>([]);

  const selectProject = (id: string, shouldScroll = false) => {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return;

    setCardFade(true);
    setTimeout(() => {
      setCurrentIdx(idx);
      setCardFade(false);
    }, 200);

    const proj = projects[idx];
    selectedProjectIdRef.current = proj.id;
    selectedGovIdRef.current = proj.govId;

    if (updateGovernorateStylesRef.current) {
      updateGovernorateStylesRef.current(selectedGovIdRef.current, hoveredGovIdRef.current);
    }

    if (shouldScroll && detailsAreaRef.current) {
      detailsAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleHoverGov = (govId: string | null) => {
    hoveredGovIdRef.current = govId;
    if (updateGovernorateStylesRef.current) {
      updateGovernorateStylesRef.current(selectedGovIdRef.current, hoveredGovIdRef.current);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const isTouch =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouch ? 1.5 : 1.75));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const ctrl = controlsRef.current;

    const initialBaseZ = getResponsiveBaseZoom(stage.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200));
    camera.position.set(0, 0, initialBaseZ);
    ctrl.targetZoom = initialBaseZ;
    ctrl.currentZoom = initialBaseZ;

    const resizeCanvas = () => {
      if (!canvas || !stage) return;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Automatically adjust camera zoom to fit Yemen map on phones vs desktop
      if (!ctrl.hasCustomZoom) {
        const responsiveZ = getResponsiveBaseZoom(w);
        ctrl.targetZoom = responsiveZ;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const sunLight = new THREE.DirectionalLight(0xfffaf4, 1.3);
    sunLight.position.set(14, 22, 18);
    scene.add(sunLight);

    const rimOrange = new THREE.DirectionalLight(0xe85b1a, 1.8);
    rimOrange.position.set(-16, -8, 12);
    scene.add(rimOrange);

    const fillBlue = new THREE.DirectionalLight(0x76889e, 0.4);
    fillBlue.position.set(6, -16, -10);
    scene.add(fillBlue);

    // Map Group
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // Pedestal and Coordinate Rings
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, 0, -0.04);

    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xc74a10, transparent: true, opacity: 0.42, side: THREE.DoubleSide });
    pedestalGroup.add(new THREE.Mesh(new THREE.RingGeometry(9.6, 9.64, 64), ringMat1));

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xe85b1a, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    pedestalGroup.add(new THREE.Mesh(new THREE.RingGeometry(7.4, 7.43, 64), ringMat2));

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x943206, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
    pedestalGroup.add(new THREE.Mesh(new THREE.RingGeometry(11.8, 11.84, 64), ringMat3));

    // Ground reflection plane
    const shadowGeo = new THREE.PlaneGeometry(25, 17);
    const canvasShadow = document.createElement('canvas');
    canvasShadow.width = 256;
    canvasShadow.height = 256;
    const sctx = canvasShadow.getContext('2d');
    if (sctx) {
      const sgrad = sctx.createRadialGradient(128, 128, 10, 128, 128, 120);
      sgrad.addColorStop(0, 'rgba(232, 91, 26, 0.18)');
      sgrad.addColorStop(0.45, 'rgba(148, 50, 6, 0.16)');
      sgrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      sctx.fillStyle = sgrad;
      sctx.fillRect(0, 0, 256, 256);
    }
    const shadowTex = new THREE.CanvasTexture(canvasShadow);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.85, depthWrite: false });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, 0, -0.06);
    pedestalGroup.add(shadowMesh);

    mapGroup.add(pedestalGroup);

    // Default Warm Light Orange Materials (Replacing pale grey)
    const govMatFront = new THREE.MeshStandardMaterial({
      color: 0xFFA26B,
      roughness: 0.32,
      metalness: 0.15,
      emissive: 0xE85B1A,
      emissiveIntensity: 0.18,
    });
    const govMatSide = new THREE.MeshStandardMaterial({
      color: 0xD96628,
      roughness: 0.38,
      metalness: 0.22,
    });

    const extrudeSettings = {
      depth: 0.38,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 2,
    };

    const interactiveMeshes: THREE.Mesh[] = [];

    governorates.forEach((gov) => {
      const meshes: THREE.Mesh[] = [];
      const lines: THREE.LineSegments[] = [];

      gov.polygons.forEach((poly) => {
        if (!poly || poly.length === 0) return;
        const extRing = poly[0];
        if (extRing.length < 3) return;

        const shape = new THREE.Shape();
        shape.moveTo(extRing[0][0], extRing[0][1]);
        for (let i = 1; i < extRing.length; i++) {
          shape.lineTo(extRing[i][0], extRing[i][1]);
        }

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
          frontMat: frontM,
          sideMat: sideM,
        };

        const edgesGeom = new THREE.EdgesGeometry(geom, 30);
        const lineMat = new THREE.LineBasicMaterial({ color: 0xC24A0E, transparent: true, opacity: 0.6 });
        const lineSeg = new THREE.LineSegments(edgesGeom, lineMat);
        mesh.add(lineSeg);

        mapGroup.add(mesh);
        meshes.push(mesh);
        lines.push(lineSeg);
        interactiveMeshes.push(mesh);
      });

      govMeshMapRef.current.set(gov.id, meshes);
      govLinesMapRef.current.set(gov.id, lines);
    });

    // 3D Project Markers
    const markerObjects: MarkerItem[] = [];

    projects.forEach((proj, idx) => {
      const pos = proj.projected;
      const markerGroup = new THREE.Group();
      markerGroup.position.set(pos[0], pos[1], 0.42);

      // Pulse Disc
      const pulseGeo = new THREE.RingGeometry(0.12, 0.32, 32);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xe85b1a,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.set(0, 0, 0.01);
      markerGroup.add(pulseMesh);

      // Light Pillar
      const pillarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 16);
      pillarGeo.rotateX(Math.PI / 2);
      pillarGeo.translate(0, 0, 0.18);
      const pillarMat = new THREE.MeshStandardMaterial({
        color: 0xff6b2b,
        emissive: 0xe85b1a,
        emissiveIntensity: 0.75,
        transparent: true,
        opacity: 0.82,
        roughness: 0.2,
      });
      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      markerGroup.add(pillarMesh);

      // Floating Diamond Beacon
      const beaconGeo = new THREE.OctahedronGeometry(0.14, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: 0xff7a3d,
        emissive: 0xe85b1a,
        emissiveIntensity: idx === 0 ? 1.6 : 0.85,
        roughness: 0.15,
        metalness: 0.3,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.set(0, 0, 0.45);
      if (idx === 0) beaconMesh.scale.set(1.45, 1.45, 1.45);
      markerGroup.add(beaconMesh);

      mapGroup.add(markerGroup);

      markerObjects.push({
        id: proj.id,
        index: idx,
        group: markerGroup,
        beacon: beaconMesh,
        pulseRing: pulseMesh,
        baseZ: 0.45,
      });
    });

    markerObjectsRef.current = markerObjects;

    // Master Styles Updater for Default (Light Orange), Distinct Golden Hover, and Primary Orange Pressed State
    const updateStyles = (selectedGovId: string | null, hoveredGovId: string | null) => {
      const selectedProjId = selectedProjectIdRef.current;

      governorates.forEach((g) => {
        const isPressed = g.id === selectedGovId;
        const isHovered = !isPressed && g.id === hoveredGovId;

        const meshes = govMeshMapRef.current.get(g.id) || [];
        const lines = govLinesMapRef.current.get(g.id) || [];

        meshes.forEach((m) => {
          const frontMat = (m as any).userData?.frontMat as THREE.MeshStandardMaterial;
          const sideMat = (m as any).userData?.sideMat as THREE.MeshStandardMaterial;

          if (isPressed) {
            // PRESSED LOCATION: Iconic Primary Myon Orange with prominent 3D extrusion
            if (frontMat) {
              frontMat.color.setHex(0xE85B1A); // Website Primary Orange
              frontMat.emissive.setHex(0xC74A10);
              frontMat.emissiveIntensity = 0.75;
              frontMat.roughness = 0.18;
              frontMat.metalness = 0.22;
            }
            if (sideMat) {
              sideMat.color.setHex(0x9A3406); // Deep warm amber-orange
              sideMat.roughness = 0.28;
              sideMat.metalness = 0.40;
            }
            m.position.z = 0.14;
          } else if (isHovered) {
            // HOVERING SELECTION: Distinct luminous radiant golden-sunburst amber
            if (frontMat) {
              frontMat.color.setHex(0xFFD034); // Glowing golden sunburst (clearly differs from orange)
              frontMat.emissive.setHex(0xFFAA00);
              frontMat.emissiveIntensity = 0.62;
              frontMat.roughness = 0.22;
              frontMat.metalness = 0.18;
            }
            if (sideMat) {
              sideMat.color.setHex(0xE59800); // Warm gold bevel & sides
              sideMat.roughness = 0.32;
              sideMat.metalness = 0.25;
            }
            m.position.z = 0.08;
          } else {
            // DEFAULT COLOR: Rich, warm Light Orange (no longer pale!)
            if (frontMat) {
              frontMat.color.setHex(0xFFA26B); // Warm Light Orange
              frontMat.emissive.setHex(0xE85B1A);
              frontMat.emissiveIntensity = 0.18;
              frontMat.roughness = 0.32;
              frontMat.metalness = 0.15;
            }
            if (sideMat) {
              sideMat.color.setHex(0xD96628); // Terracotta orange sides
              sideMat.roughness = 0.38;
              sideMat.metalness = 0.22;
            }
            m.position.z = 0;
          }
        });

        lines.forEach((l) => {
          const lineMat = l.material as THREE.LineBasicMaterial;
          if (lineMat) {
            if (isPressed) {
              lineMat.color.setHex(0xFFFFFF); // Brilliant illuminated white boundary
              lineMat.opacity = 1.0;
            } else if (isHovered) {
              lineMat.color.setHex(0xFFFFFF); // High-contrast white-gold neon hover outline
              lineMat.opacity = 1.0;
            } else {
              lineMat.color.setHex(0xC24A0E); // Deep crisp orange borders on light orange
              lineMat.opacity = 0.60;
            }
          }
        });
      });

      // 3D Diamond Marker highlights
      markerObjectsRef.current.forEach((m) => {
        const isBeaconPressed = m.id === selectedProjId;
        const proj = projects.find((p) => p.id === m.id);
        const isBeaconHovered = !isBeaconPressed && proj && proj.govId === hoveredGovId;

        const mat = m.beacon.material as THREE.MeshStandardMaterial;
        if (isBeaconPressed) {
          m.beacon.scale.set(1.5, 1.5, 1.5);
          if (mat) {
            mat.color.setHex(0xFFFFFF);
            mat.emissive.setHex(0xE85B1A);
            mat.emissiveIntensity = 1.9;
          }
        } else if (isBeaconHovered) {
          m.beacon.scale.set(1.35, 1.35, 1.35);
          if (mat) {
            mat.color.setHex(0xFFD034); // Match radiant golden hover
            mat.emissive.setHex(0xFFAA00);
            mat.emissiveIntensity = 1.6;
          }
        } else {
          m.beacon.scale.set(1.0, 1.0, 1.0);
          if (mat) {
            mat.color.setHex(0xFF7A3D);
            mat.emissive.setHex(0xE85B1A);
            mat.emissiveIntensity = 0.9;
          }
        }
      });
    };

    updateGovernorateStylesRef.current = updateStyles;

    // Pointer Drag & Orbit Controls
    // ctrl already initialized above

    const onPointerDown = (e: PointerEvent) => {
      ctrl.isPointerDown = true;
      ctrl.lastX = e.clientX;
      ctrl.lastY = e.clientY;
      ctrl.autoRotatePaused = true;
      clearTimeout(ctrl.autoRotateResumeTimer);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!ctrl.isPointerDown) return;
      const dx = e.clientX - ctrl.lastX;
      const dy = e.clientY - ctrl.lastY;
      ctrl.lastX = e.clientX;
      ctrl.lastY = e.clientY;

      ctrl.targetRotY += dx * 0.0055;
      ctrl.targetRotX += dy * 0.0045;
      ctrl.targetRotX = Math.max(-0.65, Math.min(0.65, ctrl.targetRotX));
    };

    const onPointerUp = () => {
      if (!ctrl.isPointerDown) return;
      ctrl.isPointerDown = false;
      clearTimeout(ctrl.autoRotateResumeTimer);
      ctrl.autoRotateResumeTimer = setTimeout(() => {
        ctrl.autoRotatePaused = false;
      }, 4000);
    };

    stage.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });

    // Wheel Zoom
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      ctrl.hasCustomZoom = true;
      ctrl.targetZoom += (e.deltaY > 0 ? 1 : -1) * 1.2;
      ctrl.targetZoom = Math.max(12.0, Math.min(32.0, ctrl.targetZoom));
    };
    stage.addEventListener('wheel', onWheel, { passive: false });

    // Raycasting & Hover on Governorates
    const raycaster = new THREE.Raycaster();
    const mousePos = new THREE.Vector2();
    const tooltip = tooltipRef.current;

    const onHoverMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const rect = stage.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const currentId = hit.userData ? hit.userData.govId : null;

        if (hoveredGovIdRef.current !== currentId) {
          hoveredGovIdRef.current = currentId;
          updateStyles(selectedGovIdRef.current, hoveredGovIdRef.current);
        }

        stage.style.cursor = 'pointer';

        if (tooltip && hit.userData) {
          const govName = hit.userData.nameAr;
          const relatedProj = projects.find((p) => p.govId === hit.userData.govId);
          tooltip.style.display = 'block';
          tooltip.style.left = `${e.clientX - rect.left}px`;
          tooltip.style.top = `${e.clientY - rect.top}px`;
          tooltip.innerHTML = `
            <div class="tt-title">📍 ${govName}</div>
            <div class="tt-sub">${relatedProj ? relatedProj.title : 'محافظة يمنية — نطاق التغطية اللوجستية'}</div>
          `;
        }
      } else {
        if (hoveredGovIdRef.current !== null) {
          hoveredGovIdRef.current = null;
          updateStyles(selectedGovIdRef.current, null);
        }
        stage.style.cursor = ctrl.isPointerDown ? 'grabbing' : 'grab';
        if (tooltip) tooltip.style.display = 'none';
      }
    };

    const onHoverLeave = () => {
      if (hoveredGovIdRef.current !== null) {
        hoveredGovIdRef.current = null;
        updateStyles(selectedGovIdRef.current, null);
      }
      if (tooltip) tooltip.style.display = 'none';
      stage.style.cursor = 'default';
    };

    const onClickStage = (e: MouseEvent) => {
      const rect = stage.getBoundingClientRect();
      mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mousePos, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        if (hit.userData && hit.userData.govId) {
          const matched = projects.find((p) => p.govId === hit.userData.govId);
          if (matched) {
            selectProject(matched.id, true);
          } else {
            selectedGovIdRef.current = hit.userData.govId;
            selectedProjectIdRef.current = null;
            updateStyles(selectedGovIdRef.current, hoveredGovIdRef.current);
          }
        }
      }
    };

    stage.addEventListener('pointermove', onHoverMove, { passive: true });
    stage.addEventListener('pointerleave', onHoverLeave, { passive: true });
    stage.addEventListener('click', onClickStage);

    // Animation Loop with IntersectionObserver
    let animId = 0;
    let clockTime = 0;
    const vProj = new THREE.Vector3();
    let isVisible = false;

    const renderLoop = () => {
      if (!isVisible) {
        animId = 0;
        return;
      }
      animId = requestAnimationFrame(renderLoop);
      clockTime += 0.02;

      if (isAutoRotateRef.current && !ctrl.autoRotatePaused) {
        ctrl.targetRotY += 0.0014;
      }

      ctrl.currentRotX += (ctrl.targetRotX - ctrl.currentRotX) * 0.08;
      ctrl.currentRotY += (ctrl.targetRotY - ctrl.currentRotY) * 0.08;
      ctrl.currentZoom += (ctrl.targetZoom - ctrl.currentZoom) * 0.08;

      mapGroup.rotation.x = ctrl.currentRotX;
      mapGroup.rotation.y = ctrl.currentRotY;
      camera.position.z = ctrl.currentZoom;

      const w = stage.clientWidth;
      const h = stage.clientHeight;

      markerObjects.forEach((m, i) => {
        const bob = Math.sin(clockTime * 2.5 + i * 0.8) * 0.08;
        m.beacon.position.z = m.baseZ + bob;
        m.beacon.rotation.z += 0.03;

        const pScale = 1.0 + Math.abs(Math.sin(clockTime * 2.0 + i * 0.8)) * 0.6;
        m.pulseRing.scale.set(pScale, pScale, 1);
        (m.pulseRing.material as THREE.MeshBasicMaterial).opacity = 0.9 - (pScale - 1.0) * 0.7;

        m.beacon.getWorldPosition(vProj);
        vProj.project(camera);

        const pinEl = pinElementsRef.current[m.id];
        if (pinEl) {
          if (vProj.z < 1.0) {
            const sx = (vProj.x * 0.5 + 0.5) * w;
            const sy = (-vProj.y * 0.5 + 0.5) * h;
            pinEl.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0) translate(-50%, -100%)`;
            pinEl.style.display = 'flex';
          } else {
            pinEl.style.display = 'none';
          }
        }
      });

      renderer.render(scene, camera);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !animId) {
          animId = requestAnimationFrame(renderLoop);
        }
      },
      { threshold: 0.05 }
    );
    io.observe(stage);

    // Initial highlight for first project
    selectProject(projects[0].id, false);

    return () => {
      io.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      stage.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      stage.removeEventListener('wheel', onWheel);
      stage.removeEventListener('pointermove', onHoverMove);
      stage.removeEventListener('pointerleave', onHoverLeave);
      stage.removeEventListener('click', onClickStage);
      renderer.dispose();
    };
  }, []);

  const activeProject = projects[currentIdx] || projects[0];

  const handleReset = () => {
    const w = stageRef.current?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const baseZ = getResponsiveBaseZoom(w);
    controlsRef.current.targetRotX = 0;
    controlsRef.current.targetRotY = 0;
    controlsRef.current.targetZoom = baseZ;
    controlsRef.current.hasCustomZoom = false;
  };

  const handleZoomIn = () => {
    controlsRef.current.hasCustomZoom = true;
    controlsRef.current.targetZoom = Math.max(12.0, controlsRef.current.targetZoom - 2.5);
  };

  const handleZoomOut = () => {
    controlsRef.current.hasCustomZoom = true;
    controlsRef.current.targetZoom = Math.min(32.0, controlsRef.current.targetZoom + 2.5);
  };

  const handlePrev = () => {
    const next = (currentIdx - 1 + projects.length) % projects.length;
    selectProject(projects[next].id, false);
  };

  const handleNext = () => {
    const next = (currentIdx + 1) % projects.length;
    selectProject(projects[next].id, false);
  };

  return (
    <section id="experience" data-ambient="#F4F6F9" data-glow=".2">
      <div className="wrap">
        <div className="section-head text-center experience-head">
          <span className="idx reveal">٠٤ — خبراتنا ومشاريعنا السابقة</span>
          <h2 className="reveal">
            بصمتنا الميدانية<br />
            <span className="orange-text">عبر خارطة اليمن</span>
          </h2>
          <p className="reveal">
            استكشف مشاريعنا وإنجازاتنا الميدانية في مختلف المحافظات والموانئ الاستراتيجية — منظومة متكاملة من المقاولات الإنشائية، سلاسل الإمداد اللوجستية، والخدمات النفطية التخصصية التي تمتد عبر الجغرافيا اليمنية من الساحل إلى الصحراء.
          </p>
        </div>

        {/* 3D Interactive Map Container */}
        <div className="yemen-map-card reveal" id="yemenMapCard">
          {/* HUD Top Bar */}
          <div className="map-hud-top">
            <div className="map-hud-meta">
              <div className="map-hud-badge">
                <span className="hud-pulse"></span> خريطة تفاعلية ثلاثية الأبعاد (3D)
              </div>
              <div className="map-hud-title">خارطة المشاريع والانتشار الميداني — الجمهورية اليمنية</div>
              <div className="map-legend-pills" aria-label="دليل ألوان الخارطة التفاعلية">
                <span className="legend-item" title="البرتقالي الهادئ: التغطية الميدانية الشاملة">
                  <span className="legend-dot default"></span>
                  <span>تغطية شاملة</span>
                </span>
                <span className="legend-item" title="الذهبي المشع: المعاينة عند التحويم">
                  <span className="legend-dot hover"></span>
                  <span>معاينة تفاعلية</span>
                </span>
                <span className="legend-item" title="البرتقالي الأساسي لميون: المشروع والموقع المختار">
                  <span className="legend-dot active"></span>
                  <span>الموقع المختار</span>
                </span>
              </div>
            </div>

            <div className="map-hud-controls">
              <button
                className="map-ctrl-btn"
                id="mapResetBtn"
                type="button"
                title="إعادة ضبط زاوية الرؤية"
                onClick={handleReset}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span>إعادة ضبط</span>
              </button>

              <button
                className={`map-ctrl-btn ${isAutoRotate ? 'active' : ''}`}
                id="mapAutoRotateBtn"
                type="button"
                title="تشغيل / إيقاف الدوران التلقائي"
                onClick={() => setIsAutoRotate(!isAutoRotate)}
              >
                <svg viewBox="0 0 24 24" id="rotateIcon">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                <span>{isAutoRotate ? 'إيقاف التدوير' : 'تدوير تلقائي'}</span>
              </button>

              <div className="map-zoom-group">
                <button
                  className="map-ctrl-btn icon-only"
                  id="mapZoomIn"
                  type="button"
                  aria-label="تكبير"
                  onClick={handleZoomIn}
                >
                  <svg viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <button
                  className="map-ctrl-btn icon-only"
                  id="mapZoomOut"
                  type="button"
                  aria-label="تصغير"
                  onClick={handleZoomOut}
                >
                  <svg viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 3D Canvas Stage */}
          <div className="yemen-map-stage" ref={stageRef} id="yemenMapStage">
            <canvas id="yemenMapCanvas" ref={canvasRef} aria-label="خريطة اليمن ثلاثية الأبعاد التفاعلية"></canvas>

            {/* Pins Overlay */}
            <div id="yemenPinsOverlay" ref={overlayRef} className="yemen-pins-overlay" aria-hidden="true">
              {projects.map((proj) => {
                const isActive = activeProject.id === proj.id;
                return (
                  <div
                    key={proj.id}
                    ref={(el) => {
                      if (el) pinElementsRef.current[proj.id] = el;
                    }}
                    className={`yemen-map-pin ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      selectProject(proj.id, true);
                    }}
                    onMouseEnter={() => handleHoverGov(proj.govId)}
                    onMouseLeave={() => handleHoverGov(null)}
                  >
                    <div className="pin-badge">
                      <span className="pin-tag">📍</span>
                      <span className="pin-name">{proj.city}</span>
                    </div>
                    <div className="pin-beacon-core">
                      <div className="pin-dot"></div>
                      <div className="pin-pulse-ring"></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div id="mapTooltip" ref={tooltipRef} className="map-hover-tooltip" style={{ display: 'none' }}></div>

            <div className="map-watermark latin" aria-hidden="true">
              <span>OPERATIONS GRID • 12°N - 19°N / 42°E - 54°E • REPUBLIC OF YEMEN</span>
            </div>

            <div className="map-hint-bar">
              <span>
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                </svg>{' '}
                <span className="hint-desktop">اسحب للتدوير ثلاثي الأبعاد • انقر على أي موقع أو علامة للاطلاع على تفاصيل المشروع</span>
                <span className="hint-mobile">اسحب للتدوير 3D • انقر على أي موقع للاطلاع</span>
              </span>
            </div>
          </div>

          {/* Location Filter Pills Bar */}
          <div className="map-locations-bar">
            <div className="locations-bar-header">
              <span className="locations-bar-title">المحطات والمشاريع النشطة:</span>
              <span className="locations-count-tag">٨ محطات استراتيجية</span>
            </div>
            <div className="locations-pills" id="locationsPills" role="tablist">
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  className={`loc-pill ${activeProject.id === proj.id ? 'active' : ''}`}
                  type="button"
                  onClick={() => selectProject(proj.id, false)}
                  onMouseEnter={() => handleHoverGov(proj.govId)}
                  onMouseLeave={() => handleHoverGov(null)}
                >
                  <span className="loc-icon">◆</span>
                  <span>{proj.city}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dedicated Project Details Area */}
        <div className="project-details-area reveal" ref={detailsAreaRef} id="projectDetailsArea">
          <div className="project-details-header">
            <div className="details-eyebrow">
              <span className="latin">PROJECT PROFILE &amp; CASE STUDY</span>
              <span className="details-divider">•</span>
              <span className="details-active-city" id="detailsActiveCityTag">
                {activeProject.city}
              </span>
            </div>
            <div className="details-nav-btns">
              <button
                className="btn-proj-nav"
                id="prevProjectBtn"
                type="button"
                aria-label="المشروع السابق"
                onClick={handlePrev}
              >
                <svg viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
                <span>السابق</span>
              </button>
              <div className="details-progress-dots" id="detailsProgressDots">
                {projects.map((p, i) => (
                  <span
                    key={p.id}
                    className={`dot-step ${i === currentIdx ? 'active' : ''}`}
                    title={p.city}
                    onClick={() => selectProject(p.id, false)}
                  />
                ))}
              </div>
              <button
                className="btn-proj-nav"
                id="nextProjectBtn"
                type="button"
                aria-label="المشروع التالي"
                onClick={handleNext}
              >
                <span>التالي</span>
                <svg viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
          </div>

          {/* Project Showcase Card */}
          <div className={`project-card ${cardFade ? 'fade-out' : ''}`} id="activeProjectCard">
            <div className="project-grid">
              <div className="project-main">
                <div className="project-badge-row">
                  <span className="proj-cat-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a14.5 14.5 0 000 20M2 12h20" />
                    </svg>
                    {activeProject.category}
                  </span>
                  <span className="proj-status-badge">● {activeProject.status}</span>
                  <span className="proj-year-badge">{activeProject.year}</span>
                </div>

                <h3 className="project-title">{activeProject.title}</h3>
                <p className="project-tagline">{activeProject.tagline}</p>

                <div className="project-location-bar">
                  <svg viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>
                    <strong>الموقع الجغرافي:</strong> {activeProject.location}
                  </span>
                </div>

                <p className="project-desc">{activeProject.overview}</p>

                <div className="project-scope-grid">
                  <div className="scope-col">
                    <div className="scope-col-title">
                      <svg viewBox="0 0 24 24">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                      </svg>
                      <span>الخدمات والمهام المنفذة</span>
                    </div>
                    <ul className="scope-list">
                      {activeProject.services.map((s, idx) => (
                        <li key={idx} className="scope-item">
                          <svg viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="scope-col">
                    <div className="scope-col-title">
                      <svg viewBox="0 0 24 24">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      <span>الأسطول والمعدات والتقنيات</span>
                    </div>
                    <ul className="scope-list">
                      {activeProject.technologies.map((t, idx) => (
                        <li key={idx} className="scope-item">
                          <svg viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="project-stats-grid">
                  {activeProject.stats.map((st, idx) => (
                    <div key={idx} className="pstat-card">
                      <div className="pstat-val">{st.val}</div>
                      <div className="pstat-label">{st.label}</div>
                    </div>
                  ))}
                </div>

                <div className="project-action-row">
                  <a className="btn btn-primary" href="#cta">
                    طلب استشارة لهذا المشروع
                  </a>
                  <a className="btn btn-ghost" href="#services">
                    استعراض كافة الخدمات
                  </a>
                </div>
              </div>

              <div className="project-visual-col">
                <div className="project-img-wrapper">
                  <img
                    className="project-img"
                    src={`/${activeProject.image}`}
                    alt={activeProject.title}
                    loading="lazy"
                  />
                  <div className="project-img-overlay"></div>
                  <div className="project-img-caption">
                    <span className="cap-city">{activeProject.city}</span>
                    <span className="cap-tag">{activeProject.category}</span>
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
