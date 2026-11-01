import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { MIDDLE_EAST_MAP_DATA, MiddleEastCountry } from '../data/middleEastMapData';
import { YEMEN_MAP_DATA } from '../data/yemenMapData';
import { REGIONS_DATA } from '../data/regionsData';
import { Project, Governorate, RegionInfo, BranchInfo } from '../types';

interface MarkerItem {
  id: string;
  type: 'project' | 'ksa-hub' | 'gateway';
  group: THREE.Group;
  beacon: THREE.Mesh;
  pulseRing: THREE.Mesh;
  baseZ: number;
}

// Hub data for KSA and International Gateways
interface HubNode {
  id: string;
  nameAr: string;
  nameEn: string;
  country: string;
  city: string;
  projected: [number, number];
  role: string;
  isGateway?: boolean;
}

const KSA_HUBS: HubNode[] = [
  {
    id: 'ksa-riyadh',
    nameAr: 'الرياض — المقر الرئيسي',
    nameEn: 'Riyadh Main HQ',
    country: 'SAU',
    city: 'الرياض',
    projected: [-1.463, 12.303],
    role: 'المقر الرئيسي والإدارة العامة المركزية',
  },
  {
    id: 'ksa-jeddah',
    nameAr: 'جدة — المركز الغربي وميناء البحر الأحمر',
    nameEn: 'Jeddah Western Hub',
    country: 'SAU',
    city: 'جدة',
    projected: [-11.192, 7.946],
    role: 'محطة الشحن البحري والمستودعات والتخليص الجمركي',
  },
  {
    id: 'ksa-dammam',
    nameAr: 'الدمام — عمليات الشرقية وميناء الخليج',
    nameEn: 'Dammam Eastern Hub',
    country: 'SAU',
    city: 'الدمام',
    projected: [2.995, 14.608],
    role: 'مركز الإسناد اللوجستي لقطاع الطاقة والربط الخليجي',
  },
];

const GATEWAYS: HubNode[] = [
  {
    id: 'gateway-china',
    nameAr: '🇨🇳 إقليم الصين — كوانزو / ييوو',
    nameEn: 'China Strategic Hub (Guangzhou)',
    country: 'CHN',
    city: 'كوانزو / ييوو',
    projected: [26.0, 14.0],
    role: 'بوابة التوريد الصناعي المباشر والحاويات البحرية',
    isGateway: true,
  },
  {
    id: 'gateway-usa',
    nameAr: '🇺🇸 إقليم أمريكا — هيوستن / نيويورك',
    nameEn: 'USA International Hub (Houston)',
    country: 'USA',
    city: 'هيوستن',
    projected: [-32.0, 18.0],
    role: 'محطة معدات الطاقة والآلات الثقيلة والشحن الدولي',
    isGateway: true,
  },
];

// Responsive Camera Zoom Levels
const getResponsiveBaseZoom = (width?: number) => {
  const w = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
  if (w <= 375) return 25.0;
  if (w <= 480) return 23.5;
  if (w <= 640) return 22.0;
  if (w <= 992) return 20.0;
  return 18.2;
};

const getResponsiveMiddleEastZoom = (width?: number) => {
  const w = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1200);
  if (w <= 375) return 58.0;
  if (w <= 480) return 54.0;
  if (w <= 640) return 48.0;
  if (w <= 992) return 44.0;
  return 38.5;
};

export interface UnifiedMapExperienceRef {
  focusMiddleEast: () => void;
  focusSaudi: () => void;
  focusYemen: () => void;
  focusChina: () => void;
  focusUSA: () => void;
  selectProjectById: (id: string) => void;
}

interface UnifiedMapExperienceProps {
  onNavigate?: (id: string) => void;
  initialFocus?: 'middle-east' | 'saudi' | 'yemen' | 'china' | 'usa';
}

export const UnifiedMapExperience = forwardRef<UnifiedMapExperienceRef, UnifiedMapExperienceProps>(
  ({ onNavigate, initialFocus = 'middle-east' }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const detailsAreaRef = useRef<HTMLDivElement>(null);

    const projects: Project[] = YEMEN_MAP_DATA.projects as Project[];
    const governorates: Governorate[] = YEMEN_MAP_DATA.governorates as Governorate[];
    const countries: MiddleEastCountry[] = MIDDLE_EAST_MAP_DATA.countries;

    // View States
    const [currentFocus, setCurrentFocus] = useState<'middle-east' | 'saudi' | 'yemen' | 'china' | 'usa'>(initialFocus);
    const [activeRegionId, setActiveRegionId] = useState<string>('saudi');
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [currentIdx, setCurrentIdx] = useState<number>(0);
    const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
    const [cardFade, setCardFade] = useState<boolean>(false);

    const isAutoRotateRef = useRef(isAutoRotate);
    isAutoRotateRef.current = isAutoRotate;

    const pinElementsRef = useRef<{ [id: string]: HTMLDivElement | null }>({});
    const selectedGovIdRef = useRef<string | null>(projects[0]?.govId || 'YE-AD');
    const hoveredGovIdRef = useRef<string | null>(null);
    const selectedCountryIdRef = useRef<string | null>(null);
    const hoveredCountryIdRef = useRef<string | null>(null);

    const updateMeshStylesRef = useRef<(() => void) | null>(null);

    // Camera & Pan Controls Reference
    const controlsRef = useRef<{
      targetRotX: number;
      currentRotX: number;
      targetRotY: number;
      currentRotY: number;
      targetZoom: number;
      currentZoom: number;
      targetPanX: number;
      currentPanX: number;
      targetPanY: number;
      currentPanY: number;
      isPointerDown: boolean;
      lastX: number;
      lastY: number;
      autoRotatePaused: boolean;
      autoRotateResumeTimer: any;
      hasCustomZoom: boolean;
    }>({
      targetRotX: -0.42,
      currentRotX: -0.42,
      targetRotY: 0.05,
      currentRotY: 0.05,
      targetZoom: 38.5,
      currentZoom: 38.5,
      targetPanX: 0,
      currentPanX: 0,
      targetPanY: 10.0,
      currentPanY: 10.0,
      isPointerDown: false,
      lastX: 0,
      lastY: 0,
      autoRotatePaused: false,
      autoRotateResumeTimer: null,
      hasCustomZoom: false,
    });

    const govMeshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
    const govLinesMapRef = useRef<Map<string, THREE.LineSegments[]>>(new Map());
    const countryMeshMapRef = useRef<Map<string, THREE.Mesh[]>>(new Map());
    const countryLinesMapRef = useRef<Map<string, THREE.LineSegments[]>>(new Map());
    const markerObjectsRef = useRef<MarkerItem[]>([]);

    const activeProject = projects[currentIdx] || projects[0];
    const activeRegion: RegionInfo =
      REGIONS_DATA.find((r) => r.id === activeRegionId) || REGIONS_DATA[0];

    // Smooth Glide Camera Focus Actions
    const glideTo = (panX: number, panY: number, zoom: number, rotX = -0.42, rotY = 0.05) => {
      controlsRef.current.targetPanX = panX;
      controlsRef.current.targetPanY = panY;
      controlsRef.current.targetZoom = zoom;
      controlsRef.current.targetRotX = rotX;
      controlsRef.current.targetRotY = rotY;
      controlsRef.current.hasCustomZoom = true;
    };

    const focusMiddleEast = () => {
      setCurrentFocus('middle-east');
      const w = stageRef.current?.clientWidth || 1200;
      glideTo(0, 10.5, getResponsiveMiddleEastZoom(w), -0.44, 0.04);
      selectedCountryIdRef.current = null;
      selectedGovIdRef.current = null;
      if (updateMeshStylesRef.current) updateMeshStylesRef.current();
    };

    const focusSaudi = () => {
      setCurrentFocus('saudi');
      setActiveRegionId('saudi');
      glideTo(-1.5, 12.0, 25.0, -0.40, 0.05);
      selectedCountryIdRef.current = 'SAU';
      selectedGovIdRef.current = null;
      if (updateMeshStylesRef.current) updateMeshStylesRef.current();
    };

    const focusYemen = (shouldScroll = false) => {
      setCurrentFocus('yemen');
      setActiveRegionId('yemen');
      const w = stageRef.current?.clientWidth || 1200;
      glideTo(-1.5, -1.8, getResponsiveBaseZoom(w), -0.45, 0.0);
      selectedCountryIdRef.current = null;
      selectedGovIdRef.current = projects[currentIdx]?.govId || 'YE-AD';
      if (updateMeshStylesRef.current) updateMeshStylesRef.current();

      if (shouldScroll && detailsAreaRef.current) {
        detailsAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const focusChina = () => {
      setCurrentFocus('china');
      setActiveRegionId('china');
      glideTo(22.0, 14.0, 30.0, -0.38, -0.15);
      selectedCountryIdRef.current = null;
      selectedGovIdRef.current = null;
      if (updateMeshStylesRef.current) updateMeshStylesRef.current();
    };

    const focusUSA = () => {
      setCurrentFocus('usa');
      setActiveRegionId('usa');
      glideTo(-26.0, 17.0, 30.0, -0.38, 0.18);
      selectedCountryIdRef.current = null;
      selectedGovIdRef.current = null;
      if (updateMeshStylesRef.current) updateMeshStylesRef.current();
    };

    // Project Selection
    const selectProject = (id: string, shouldScroll = false) => {
      const idx = projects.findIndex((p) => p.id === id);
      if (idx === -1) return;

      setCardFade(true);
      setTimeout(() => {
        setCurrentIdx(idx);
        setCardFade(false);
      }, 180);

      const proj = projects[idx];
      selectedGovIdRef.current = proj.govId;
      selectedCountryIdRef.current = null;
      setCurrentFocus('yemen');

      // Pan slightly to project
      glideTo(proj.projected[0], proj.projected[1], 18.0, -0.45, 0.0);

      if (updateMeshStylesRef.current) updateMeshStylesRef.current();

      if (shouldScroll && detailsAreaRef.current) {
        detailsAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    const handleSelectRegion = (id: string) => {
      setActiveRegionId(id);
      setSelectedBranchId(null);
      if (id === 'saudi') focusSaudi();
      else if (id === 'yemen') focusYemen();
      else if (id === 'china') focusChina();
      else if (id === 'usa') focusUSA();
    };

    useImperativeHandle(ref, () => ({
      focusMiddleEast,
      focusSaudi,
      focusYemen,
      focusChina,
      focusUSA,
      selectProjectById: (id: string) => selectProject(id, true),
    }));

    // Three.js Main Setup
    useEffect(() => {
      const canvas = canvasRef.current;
      const stage = stageRef.current;
      if (!canvas || !stage) return;

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        });
      } catch (err) {
        console.error('WebGL Renderer init failed:', err);
        return;
      }

      renderer.setSize(stage.clientWidth, stage.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(45, stage.clientWidth / stage.clientHeight, 0.1, 1000);

      // Set initial zoom based on screen width
      const initialW = stage.clientWidth || 1200;
      controlsRef.current.targetZoom = getResponsiveMiddleEastZoom(initialW);
      controlsRef.current.currentZoom = controlsRef.current.targetZoom;

      // Lights Setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xfff5ea, 1.45);
      dirLight1.position.set(18, -25, 35);
      scene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0xff8c42, 0.75);
      dirLight2.position.set(-20, 20, 25);
      scene.add(dirLight2);

      const groundLight = new THREE.PointLight(0xe85b1a, 1.2, 70);
      groundLight.position.set(0, 8, 12);
      scene.add(groundLight);

      const mapGroup = new THREE.Group();
      scene.add(mapGroup);

      // Pedestal & Coordinate Rings
      const pedestalGroup = new THREE.Group();
      pedestalGroup.position.set(0, 10.0, -0.04);

      const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xc74a10, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
      pedestalGroup.add(new THREE.Mesh(new THREE.RingGeometry(24.0, 24.1, 80), ringMat1));

      const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xe85b1a, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
      pedestalGroup.add(new THREE.Mesh(new THREE.RingGeometry(32.0, 32.12, 80), ringMat2));

      const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x943206, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
      pedestalGroup.add(new THREE.Mesh(new THREE.RingGeometry(40.0, 40.15, 80), ringMat3));

      // Ground Reflection Shadow
      const shadowGeo = new THREE.PlaneGeometry(65, 52);
      const canvasShadow = document.createElement('canvas');
      canvasShadow.width = 256;
      canvasShadow.height = 256;
      const sctx = canvasShadow.getContext('2d');
      if (sctx) {
        const sgrad = sctx.createRadialGradient(128, 128, 20, 128, 128, 125);
        sgrad.addColorStop(0, 'rgba(232, 91, 26, 0.2)');
        sgrad.addColorStop(0.5, 'rgba(148, 50, 6, 0.12)');
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

      // Standard Materials (3-State System)
      const matDefaultFront = new THREE.MeshStandardMaterial({
        color: 0xffa26b,
        roughness: 0.32,
        metalness: 0.15,
        emissive: 0xe85b1a,
        emissiveIntensity: 0.18,
      });
      const matDefaultSide = new THREE.MeshStandardMaterial({
        color: 0xd96628,
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

      // Helper function to build 3D extruded shapes from polygon arrays
      const buildPolygonsMesh = (
        polys: number[][][][],
        userData: any,
        meshStore: Map<string, THREE.Mesh[]>,
        lineStore: Map<string, THREE.LineSegments[]>
      ) => {
        const meshes: THREE.Mesh[] = [];
        const lines: THREE.LineSegments[] = [];

        polys.forEach((poly) => {
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
              for (let k = 1; k < holeRing.length; k++) {
                holePath.lineTo(holeRing[k][0], holeRing[k][1]);
              }
              shape.holes.push(holePath);
            }
          }

          try {
            const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const mesh = new THREE.Mesh(geom, [matDefaultFront.clone(), matDefaultSide.clone()]);
            mesh.userData = userData;
            mapGroup.add(mesh);
            meshes.push(mesh);
            interactiveMeshes.push(mesh);

            const edges = new THREE.EdgesGeometry(geom, 25);
            const line = new THREE.LineSegments(
              edges,
              new THREE.LineBasicMaterial({ color: 0xc24a0e, transparent: true, opacity: 0.75 })
            );
            mapGroup.add(line);
            lines.push(line);
          } catch (e) {
            console.warn('Extrude error for', userData.nameEn, e);
          }
        });

        meshStore.set(userData.id, meshes);
        lineStore.set(userData.id, lines);
      };

      // 1. Build Middle East Countries
      countries.forEach((country) => {
        buildPolygonsMesh(
          country.polygons,
          {
            id: country.id,
            countryCode: country.countryCode,
            nameAr: country.nameAr,
            nameEn: country.nameEn,
            centroid: country.centroid,
            type: 'country',
          },
          countryMeshMapRef.current,
          countryLinesMapRef.current
        );
      });

      // 2. Build Yemen 22 Governorates right inside the southern Arabian Peninsula
      governorates.forEach((gov) => {
        buildPolygonsMesh(
          gov.polygons,
          {
            id: gov.id,
            nameAr: gov.nameAr,
            nameEn: gov.nameEn,
            centroid: gov.centroid,
            type: 'governorate',
          },
          govMeshMapRef.current,
          govLinesMapRef.current
        );
      });

      // Function to dynamically update 3-state materials
      const updateMeshStyles = () => {
        const curGovSel = selectedGovIdRef.current;
        const curGovHov = hoveredGovIdRef.current;
        const curCountrySel = selectedCountryIdRef.current;
        const curCountryHov = hoveredCountryIdRef.current;

        // Update Yemen Governorates
        govMeshMapRef.current.forEach((meshList, govId) => {
          const isSelected = govId === curGovSel;
          const isHovered = govId === curGovHov && !isSelected;
          const lineList = govLinesMapRef.current.get(govId) || [];

          meshList.forEach((mesh) => {
            const mats = mesh.material as THREE.MeshStandardMaterial[];
            if (isSelected) {
              mats[0].color.setHex(0xe85b1a);
              mats[0].emissive.setHex(0xc74a10);
              mats[0].emissiveIntensity = 0.75;
              mats[1].color.setHex(0xb8420e);
              mesh.position.z = 0.14;
            } else if (isHovered) {
              mats[0].color.setHex(0xffd034);
              mats[0].emissive.setHex(0xffaa00);
              mats[0].emissiveIntensity = 0.62;
              mats[1].color.setHex(0xd49b10);
              mesh.position.z = 0.08;
            } else {
              mats[0].color.setHex(0xffa26b);
              mats[0].emissive.setHex(0xe85b1a);
              mats[0].emissiveIntensity = 0.18;
              mats[1].color.setHex(0xd96628);
              mesh.position.z = 0.0;
            }
          });

          lineList.forEach((line) => {
            const lmat = line.material as THREE.LineBasicMaterial;
            if (isSelected) {
              lmat.color.setHex(0xffffff);
              lmat.opacity = 1.0;
              line.position.z = 0.14;
            } else if (isHovered) {
              lmat.color.setHex(0xffffff);
              lmat.opacity = 0.95;
              line.position.z = 0.08;
            } else {
              lmat.color.setHex(0xc24a0e);
              lmat.opacity = 0.75;
              line.position.z = 0.0;
            }
          });
        });

        // Update Middle East Countries
        countryMeshMapRef.current.forEach((meshList, countryId) => {
          const isSelected = countryId === curCountrySel;
          const isHovered = countryId === curCountryHov && !isSelected;
          const lineList = countryLinesMapRef.current.get(countryId) || [];

          meshList.forEach((mesh) => {
            const mats = mesh.material as THREE.MeshStandardMaterial[];
            if (isSelected) {
              mats[0].color.setHex(0xe85b1a);
              mats[0].emissive.setHex(0xc74a10);
              mats[0].emissiveIntensity = 0.75;
              mats[1].color.setHex(0xb8420e);
              mesh.position.z = 0.14;
            } else if (isHovered) {
              mats[0].color.setHex(0xffd034);
              mats[0].emissive.setHex(0xffaa00);
              mats[0].emissiveIntensity = 0.62;
              mats[1].color.setHex(0xd49b10);
              mesh.position.z = 0.08;
            } else {
              mats[0].color.setHex(0xffa26b);
              mats[0].emissive.setHex(0xe85b1a);
              mats[0].emissiveIntensity = 0.18;
              mats[1].color.setHex(0xd96628);
              mesh.position.z = 0.0;
            }
          });

          lineList.forEach((line) => {
            const lmat = line.material as THREE.LineBasicMaterial;
            if (isSelected) {
              lmat.color.setHex(0xffffff);
              lmat.opacity = 1.0;
              line.position.z = 0.14;
            } else if (isHovered) {
              lmat.color.setHex(0xffffff);
              lmat.opacity = 0.95;
              line.position.z = 0.08;
            } else {
              lmat.color.setHex(0xc24a0e);
              lmat.opacity = 0.75;
              line.position.z = 0.0;
            }
          });
        });
      };
      updateMeshStylesRef.current = updateMeshStyles;

      // 3. 3D Beacons for Yemen Projects
      const markers: MarkerItem[] = [];

      projects.forEach((proj) => {
        const mGroup = new THREE.Group();
        mGroup.position.set(proj.projected[0], proj.projected[1], 0.42);

        // Floating Diamond Beacon (OctahedronGeometry)
        const beaconGeo = new THREE.OctahedronGeometry(0.22, 0);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xe85b1a,
          emissiveIntensity: 0.9,
          roughness: 0.2,
          metalness: 0.8,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.z = 0.35;
        mGroup.add(beaconMesh);

        // Pulsing Ring
        const pRingGeo = new THREE.RingGeometry(0.25, 0.32, 24);
        const pRingMat = new THREE.MeshBasicMaterial({
          color: 0xe85b1a,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide,
        });
        const pRingMesh = new THREE.Mesh(pRingGeo, pRingMat);
        pRingMesh.position.z = 0.02;
        mGroup.add(pRingMesh);

        // Light Pillar
        const pillarGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.65, 8);
        pillarGeo.rotateX(Math.PI / 2);
        const pillarMat = new THREE.MeshBasicMaterial({ color: 0xffd034, transparent: true, opacity: 0.65 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.z = 0.18;
        mGroup.add(pillar);

        mapGroup.add(mGroup);
        markers.push({ id: proj.id, type: 'project', group: mGroup, beacon: beaconMesh, pulseRing: pRingMesh, baseZ: 0.35 });
      });

      // 4. 3D Beacons for KSA Regional Hubs
      KSA_HUBS.forEach((hub) => {
        const mGroup = new THREE.Group();
        mGroup.position.set(hub.projected[0], hub.projected[1], 0.42);

        const beaconGeo = new THREE.OctahedronGeometry(0.3, 0);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0xfff5ea,
          emissive: 0xff6b2b,
          emissiveIntensity: 1.0,
          roughness: 0.18,
          metalness: 0.85,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.z = 0.45;
        mGroup.add(beaconMesh);

        const pRingGeo = new THREE.RingGeometry(0.35, 0.45, 32);
        const pRingMat = new THREE.MeshBasicMaterial({
          color: 0xffd034,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        });
        const pRingMesh = new THREE.Mesh(pRingGeo, pRingMat);
        pRingMesh.position.z = 0.02;
        mGroup.add(pRingMesh);

        const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.85, 8);
        pillarGeo.rotateX(Math.PI / 2);
        const pillarMat = new THREE.MeshBasicMaterial({ color: 0xfff5ea, transparent: true, opacity: 0.75 });
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.z = 0.25;
        mGroup.add(pillar);

        mapGroup.add(mGroup);
        markers.push({ id: hub.id, type: 'ksa-hub', group: mGroup, beacon: beaconMesh, pulseRing: pRingMesh, baseZ: 0.45 });
      });

      // 5. 3D Beacons for International Gateways (China & USA)
      GATEWAYS.forEach((gw) => {
        const mGroup = new THREE.Group();
        mGroup.position.set(gw.projected[0], gw.projected[1], 0.42);

        // Circular Floating Base Platform
        const platGeo = new THREE.CylinderGeometry(1.6, 1.8, 0.15, 32);
        platGeo.rotateX(Math.PI / 2);
        const platMat = new THREE.MeshStandardMaterial({
          color: 0x222a36,
          roughness: 0.4,
          metalness: 0.6,
          emissive: 0xe85b1a,
          emissiveIntensity: 0.25,
        });
        const platMesh = new THREE.Mesh(platGeo, platMat);
        mGroup.add(platMesh);

        const beaconGeo = new THREE.OctahedronGeometry(0.42, 0);
        const beaconMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xe85b1a,
          emissiveIntensity: 1.2,
          roughness: 0.1,
          metalness: 0.9,
        });
        const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
        beaconMesh.position.z = 0.7;
        mGroup.add(beaconMesh);

        const pRingGeo = new THREE.RingGeometry(1.8, 2.05, 36);
        const pRingMat = new THREE.MeshBasicMaterial({
          color: 0xffd034,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });
        const pRingMesh = new THREE.Mesh(pRingGeo, pRingMat);
        pRingMesh.position.z = 0.02;
        mGroup.add(pRingMesh);

        mapGroup.add(mGroup);
        markers.push({ id: gw.id, type: 'gateway', group: mGroup, beacon: beaconMesh, pulseRing: pRingMesh, baseZ: 0.7 });
      });

      markerObjectsRef.current = markers;

      // 6. 3D Supply-Chain Glowing Arcs (Quadratic Bézier 3D Corridors)
      const buildCorridorArc = (
        start: [number, number],
        end: [number, number],
        archHeight: number,
        colorHex: number,
        dashed = false
      ) => {
        const midX = (start[0] + end[0]) / 2;
        const midY = (start[1] + end[1]) / 2;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(start[0], start[1], 0.45),
          new THREE.Vector3(midX, midY, archHeight),
          new THREE.Vector3(end[0], end[1], 0.45)
        );

        const points = curve.getPoints(40);
        const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
        let curveMat: THREE.Material;

        if (dashed) {
          curveMat = new THREE.LineDashedMaterial({
            color: colorHex,
            dashSize: 0.8,
            gapSize: 0.4,
            transparent: true,
            opacity: 0.75,
          });
        } else {
          curveMat = new THREE.LineBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.85,
          });
        }

        const arcLine = new THREE.Line(curveGeo, curveMat);
        if (dashed) arcLine.computeLineDistances();
        mapGroup.add(arcLine);
      };

      // KSA Internal Corridors
      buildCorridorArc([-1.463, 12.303], [-11.192, 7.946], 2.2, 0xffd034, false); // Riyadh <-> Jeddah
      buildCorridorArc([-1.463, 12.303], [2.995, 14.608], 1.8, 0xffd034, false); // Riyadh <-> Dammam

      // KSA <-> Yemen Direct Corridor
      buildCorridorArc([-1.463, 12.303], [-3.601, -3.807], 3.2, 0xe85b1a, false); // Riyadh <-> Aden

      // Maritime Silk Road: Jeddah/Aden <-> China Gateway
      buildCorridorArc([-11.192, 7.946], [26.0, 14.0], 6.0, 0xff6b2b, true); // Jeddah <-> China
      buildCorridorArc([-3.601, -3.807], [26.0, 14.0], 5.5, 0xe85b1a, true); // Aden <-> China

      // Trans-Atlantic Hub: Jeddah/Riyadh <-> USA Gateway
      buildCorridorArc([-1.463, 12.303], [-32.0, 18.0], 6.5, 0xffd034, true); // Riyadh <-> USA

      // Mouse & Raycasting Setup
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onPointerDown = (e: PointerEvent) => {
        if (e.button !== 0) return;
        controlsRef.current.isPointerDown = true;
        controlsRef.current.lastX = e.clientX;
        controlsRef.current.lastY = e.clientY;
        controlsRef.current.autoRotatePaused = true;
        if (controlsRef.current.autoRotateResumeTimer) {
          clearTimeout(controlsRef.current.autoRotateResumeTimer);
        }
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!controlsRef.current.isPointerDown) return;
        const dx = e.clientX - controlsRef.current.lastX;
        const dy = e.clientY - controlsRef.current.lastY;
        controlsRef.current.lastX = e.clientX;
        controlsRef.current.lastY = e.clientY;

        controlsRef.current.targetRotY += dx * 0.005;
        controlsRef.current.targetRotX += dy * 0.005;

        // Clamp vertical pitch to prevent flipping
        controlsRef.current.targetRotX = Math.max(-1.1, Math.min(-0.15, controlsRef.current.targetRotX));
      };

      const onPointerUp = () => {
        controlsRef.current.isPointerDown = false;
        controlsRef.current.autoRotateResumeTimer = setTimeout(() => {
          controlsRef.current.autoRotatePaused = false;
        }, 3000);
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        controlsRef.current.hasCustomZoom = true;
        controlsRef.current.autoRotatePaused = true;
        if (controlsRef.current.autoRotateResumeTimer) clearTimeout(controlsRef.current.autoRotateResumeTimer);
        controlsRef.current.autoRotateResumeTimer = setTimeout(() => {
          controlsRef.current.autoRotatePaused = false;
        }, 3000);

        controlsRef.current.targetZoom += e.deltaY * 0.035;
        controlsRef.current.targetZoom = Math.max(12.0, Math.min(75.0, controlsRef.current.targetZoom));
      };

      const onHoverMove = (e: MouseEvent) => {
        const rect = stage.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const udata = hit.userData;

          if (udata.type === 'governorate') {
            hoveredGovIdRef.current = udata.id;
            hoveredCountryIdRef.current = null;
          } else if (udata.type === 'country') {
            hoveredCountryIdRef.current = udata.id;
            hoveredGovIdRef.current = null;
          }

          if (tooltipRef.current) {
            tooltipRef.current.style.display = 'block';
            tooltipRef.current.style.left = `${e.clientX - rect.left + 15}px`;
            tooltipRef.current.style.top = `${e.clientY - rect.top - 35}px`;
            tooltipRef.current.innerHTML = `<strong>${udata.nameAr}</strong><span style="opacity:0.75; font-size:11px; margin-right:4px;">${udata.nameEn}</span>`;
          }
        } else {
          hoveredGovIdRef.current = null;
          hoveredCountryIdRef.current = null;
          if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        }

        updateMeshStyles();
      };

      const onHoverLeave = () => {
        hoveredGovIdRef.current = null;
        hoveredCountryIdRef.current = null;
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
        updateMeshStyles();
      };

      const onClickStage = (e: MouseEvent) => {
        const rect = stage.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const udata = hit.userData;

          if (udata.type === 'governorate') {
            // Find if there is a project in this governorate
            const p = projects.find((item) => item.govId === udata.id);
            if (p) {
              selectProject(p.id, false);
            } else {
              selectedGovIdRef.current = udata.id;
              selectedCountryIdRef.current = null;
              updateMeshStyles();
            }
          } else if (udata.type === 'country') {
            selectedCountryIdRef.current = udata.id;
            selectedGovIdRef.current = null;
            if (udata.countryCode === 'KSA' || udata.id === 'SAU') {
              focusSaudi();
            } else {
              // Pan to country centroid
              glideTo(udata.centroid[0], udata.centroid[1], 24.0);
            }
            updateMeshStyles();
          }
        }
      };

      stage.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      stage.addEventListener('wheel', onWheel, { passive: false });
      stage.addEventListener('pointermove', onHoverMove);
      stage.addEventListener('pointerleave', onHoverLeave);
      stage.addEventListener('click', onClickStage);

      const resizeCanvas = () => {
        if (!stage || !renderer) return;
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);

        if (!controlsRef.current.hasCustomZoom) {
          if (currentFocus === 'yemen') {
            controlsRef.current.targetZoom = getResponsiveBaseZoom(w);
          } else {
            controlsRef.current.targetZoom = getResponsiveMiddleEastZoom(w);
          }
        }
      };

      window.addEventListener('resize', resizeCanvas);

      // Render Loop
      let animId: number;
      let lastTime = performance.now();

      const animate = (time: number) => {
        animId = requestAnimationFrame(animate);
        const dt = (time - lastTime) * 0.001;
        lastTime = time;

        const ctrl = controlsRef.current;

        // Auto-rotation when active
        if (isAutoRotateRef.current && !ctrl.autoRotatePaused) {
          ctrl.targetRotY += 0.22 * dt;
        }

        // Smooth Lerp
        const lerpFactor = 0.08;
        ctrl.currentPanX += (ctrl.targetPanX - ctrl.currentPanX) * lerpFactor;
        ctrl.currentPanY += (ctrl.targetPanY - ctrl.currentPanY) * lerpFactor;
        ctrl.currentZoom += (ctrl.targetZoom - ctrl.currentZoom) * lerpFactor;
        ctrl.currentRotX += (ctrl.targetRotX - ctrl.currentRotX) * lerpFactor;
        ctrl.currentRotY += (ctrl.targetRotY - ctrl.currentRotY) * lerpFactor;

        // Spherical Camera Positioning around currentPan
        camera.position.x = ctrl.currentPanX + ctrl.currentZoom * Math.sin(ctrl.currentRotY) * Math.cos(ctrl.currentRotX);
        camera.position.y = ctrl.currentPanY - ctrl.currentZoom * Math.sin(ctrl.currentRotX);
        camera.position.z = ctrl.currentZoom * Math.cos(ctrl.currentRotY) * Math.cos(ctrl.currentRotX);
        camera.lookAt(ctrl.currentPanX, ctrl.currentPanY, 0.2);

        // Animate Floating Diamond Beacons and Rings
        markers.forEach((m, idx) => {
          const t = time * 0.002 + idx * 0.7;
          m.beacon.rotation.z += 0.015;
          m.beacon.rotation.y += 0.012;
          m.beacon.position.z = m.baseZ + Math.sin(t) * 0.06;

          const pScale = 1.0 + Math.sin(t * 1.5) * 0.22;
          m.pulseRing.scale.set(pScale, pScale, pScale);
          (m.pulseRing.material as THREE.MeshBasicMaterial).opacity = 0.85 - (pScale - 0.78) * 0.8;
        });

        renderer.render(scene, camera);

        // Project 3D Beacon Positions to 2D HTML Pins
        const stageW = stage.clientWidth;
        const stageH = stage.clientHeight;
        const tempV = new THREE.Vector3();

        // 1. Projects
        projects.forEach((proj) => {
          const el = pinElementsRef.current[proj.id];
          if (!el) return;
          tempV.set(proj.projected[0], proj.projected[1], 0.8);
          tempV.project(camera);

          if (tempV.z > 1.0) {
            el.style.display = 'none';
          } else {
            el.style.display = 'block';
            const x = (tempV.x * 0.5 + 0.5) * stageW;
            const y = (-tempV.y * 0.5 + 0.5) * stageH;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
          }
        });

        // 2. KSA Hubs
        KSA_HUBS.forEach((hub) => {
          const el = pinElementsRef.current[hub.id];
          if (!el) return;
          tempV.set(hub.projected[0], hub.projected[1], 0.9);
          tempV.project(camera);

          if (tempV.z > 1.0) {
            el.style.display = 'none';
          } else {
            el.style.display = 'block';
            const x = (tempV.x * 0.5 + 0.5) * stageW;
            const y = (-tempV.y * 0.5 + 0.5) * stageH;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
          }
        });

        // 3. Gateways
        GATEWAYS.forEach((gw) => {
          const el = pinElementsRef.current[gw.id];
          if (!el) return;
          tempV.set(gw.projected[0], gw.projected[1], 1.2);
          tempV.project(camera);

          if (tempV.z > 1.0) {
            el.style.display = 'none';
          } else {
            el.style.display = 'block';
            const x = (tempV.x * 0.5 + 0.5) * stageW;
            const y = (-tempV.y * 0.5 + 0.5) * stageH;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
          }
        });
      };

      animId = requestAnimationFrame(animate);

      return () => {
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

    const handleReset = () => {
      focusMiddleEast();
    };

    const handleZoomIn = () => {
      controlsRef.current.hasCustomZoom = true;
      controlsRef.current.targetZoom = Math.max(12.0, controlsRef.current.targetZoom - 3.5);
    };

    const handleZoomOut = () => {
      controlsRef.current.hasCustomZoom = true;
      controlsRef.current.targetZoom = Math.min(75.0, controlsRef.current.targetZoom + 3.5);
    };

    const handlePrev = () => {
      const prevIdx = (currentIdx - 1 + projects.length) % projects.length;
      selectProject(projects[prevIdx].id, false);
    };

    const handleNext = () => {
      const nextIdx = (currentIdx + 1) % projects.length;
      selectProject(projects[nextIdx].id, false);
    };

    return (
      <section id="regions" className="regions-section unified-map-section" data-ambient="#F4F6F9" data-glow=".25">
        {/* Experience Anchor for Navigation Links */}
        <div id="experience" style={{ position: 'relative', top: '-100px' }} aria-hidden="true" />

        <div className="wrap">
          {/* Section Header */}
          <div className="section-head text-center reveal">
            <span className="idx">٠٤ — شبكة الأقاليم ومشاريع ميون الموحدة (3D)</span>
            <h2>
              منظومة أقاليم ومشاريع ميون 3D<br />
              <span className="orange-text">حضور استراتيجي وبصمة ميدانية متكاملة</span>
            </h2>
            <p>
              تعتمد ميون على منظومة متصلة تربط عواصم التوريد والصناعة العالمية بمحاور القيادة في المملكة العربية
              السعودية والمشاريع الميدانية الكبرى في الجمهورية اليمنية. استكشف الخريطة التفاعلية ثلاثية الأبعاد
              وتعرف على فروعنا، ممراتنا اللوجستية، ومشاريعنا الميدانية.
            </p>
          </div>

          {/* Quick Region View Switcher Pills */}
          <div className="unified-view-pills reveal" role="tablist" aria-label="عدسة التركيز ثلاثية الأبعاد">
            <button
              type="button"
              className={`view-pill-btn ${currentFocus === 'middle-east' ? 'active' : ''}`}
              onClick={focusMiddleEast}
            >
              <span className="view-pill-icon">🌍</span>
              <span className="view-pill-title">كامل الإقليم والشرق الأوسط</span>
            </button>

            <button
              type="button"
              className={`view-pill-btn ${currentFocus === 'saudi' ? 'active' : ''}`}
              onClick={focusSaudi}
            >
              <span className="view-pill-icon">🇸🇦</span>
              <span className="view-pill-title">المملكة العربية السعودية (المقر)</span>
            </button>

            <button
              type="button"
              className={`view-pill-btn ${currentFocus === 'yemen' ? 'active' : ''}`}
              onClick={() => focusYemen(false)}
            >
              <span className="view-pill-icon">🇾🇪</span>
              <span className="view-pill-title">مشاريع الجمهورية اليمنية (٨ محطات)</span>
            </button>

            <button
              type="button"
              className={`view-pill-btn ${currentFocus === 'china' ? 'active' : ''}`}
              onClick={focusChina}
            >
              <span className="view-pill-icon">🇨🇳</span>
              <span className="view-pill-title">بوابة الصين (كوانزو / ييوو)</span>
            </button>

            <button
              type="button"
              className={`view-pill-btn ${currentFocus === 'usa' ? 'active' : ''}`}
              onClick={focusUSA}
            >
              <span className="view-pill-icon">🇺🇸</span>
              <span className="view-pill-title">بوابة أمريكا (هيوستن)</span>
            </button>
          </div>

          {/* 3D Interactive Map Card */}
          <div className="yemen-map-card unified-3d-card reveal" id="unified3DCard">
            {/* HUD Top Bar */}
            <div className="map-hud-top">
              <div className="map-hud-meta">
                <div className="map-hud-badge">
                  <span className="hud-pulse"></span> خريطة تفاعلية ثلاثية الأبعاد (3D Interactive Mesh)
                </div>
                <div className="map-hud-title">
                  {currentFocus === 'middle-east' && 'منظومة الشرق الأوسط وشبكة الإمداد الدولية — ميون'}
                  {currentFocus === 'saudi' && 'المقر الإقليمي ومحور الخليج العربي — المملكة العربية السعودية'}
                  {currentFocus === 'yemen' && 'الانتشار الميداني ومشاريع المحافظات — الجمهورية اليمنية'}
                  {currentFocus === 'china' && 'بوابة التوريد والاستيراد المباشر — جمهورية الصين الشعبية'}
                  {currentFocus === 'usa' && 'مركز لوجستيات الطاقة والمعدات — الولايات المتحدة الأمريكية'}
                </div>
                <div className="map-legend-pills" aria-label="دليل ألوان الخارطة">
                  <span className="legend-item" title="البرتقالي الهادئ: التغطية الميدانية الشاملة">
                    <span className="legend-dot default"></span>
                    <span>تغطية شاملة</span>
                  </span>
                  <span className="legend-item" title="الذهبي المشع: المعاينة عند التحويم">
                    <span className="legend-dot hover"></span>
                    <span>معاينة تفاعلية</span>
                  </span>
                  <span className="legend-item" title="البرتقالي الأساسي لميون: الإقليم أو الموقع المختار">
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
            <div className="yemen-map-stage unified-canvas-stage" ref={stageRef} id="unifiedMapStage">
              <canvas id="unifiedMapCanvas" ref={canvasRef} aria-label="خريطة الشرق الأوسط واليمن ثلاثية الأبعاد"></canvas>

              {/* Screen Projected Pins Overlay */}
              <div id="unifiedPinsOverlay" ref={overlayRef} className="yemen-pins-overlay" aria-hidden="true">
                {/* 1. Yemen Projects Pins */}
                {projects.map((proj) => {
                  const isActive = activeProject.id === proj.id && currentFocus === 'yemen';
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

                {/* 2. KSA Hub Pins */}
                {KSA_HUBS.map((hub) => (
                  <div
                    key={hub.id}
                    ref={(el) => {
                      if (el) pinElementsRef.current[hub.id] = el;
                    }}
                    className={`yemen-map-pin ksa-hub-pin ${currentFocus === 'saudi' ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      focusSaudi();
                    }}
                  >
                    <div className="pin-badge ksa-badge">
                      <span className="pin-tag">🇸🇦</span>
                      <span className="pin-name">{hub.nameAr}</span>
                    </div>
                    <div className="pin-beacon-core">
                      <div className="pin-dot ksa-dot"></div>
                      <div className="pin-pulse-ring"></div>
                    </div>
                  </div>
                ))}

                {/* 3. Global Gateway Pins */}
                {GATEWAYS.map((gw) => (
                  <div
                    key={gw.id}
                    ref={(el) => {
                      if (el) pinElementsRef.current[gw.id] = el;
                    }}
                    className={`yemen-map-pin gateway-pin ${
                      (gw.country === 'CHN' && currentFocus === 'china') ||
                      (gw.country === 'USA' && currentFocus === 'usa')
                        ? 'active'
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (gw.country === 'CHN') focusChina();
                      else focusUSA();
                    }}
                  >
                    <div className="pin-badge gateway-badge">
                      <span className="pin-name">{gw.nameAr}</span>
                    </div>
                    <div className="pin-beacon-core">
                      <div className="pin-dot gw-dot"></div>
                      <div className="pin-pulse-ring"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hover Tooltip */}
              <div id="mapTooltip" ref={tooltipRef} className="map-hover-tooltip" style={{ display: 'none' }}></div>

              <div className="map-watermark latin" aria-hidden="true">
                <span>REGIONAL NETWORK &bull; MIDDLE EAST &bull; ARABIAN PENINSULA &bull; KSA ⇄ YEMEN ⇄ CHINA ⇄ USA</span>
              </div>

              <div className="map-hint-bar">
                <span>
                  <svg viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                  </svg>{' '}
                  <span className="hint-desktop">
                    اسحب للتدوير ثلاثي الأبعاد • عجلة الفأرة للتقريب والتكبير • انقر على أي دولة أو موقع لاستكشاف تفاصيل الإقليم والمشاريع
                  </span>
                  <span className="hint-mobile">اسحب للتدوير 3D • انقر على أي موقع للاطلاع</span>
                </span>
              </div>
            </div>

            {/* Quick Location & Projects Bar */}
            <div className="map-locations-bar">
              <div className="locations-bar-header">
                <span className="locations-bar-title">المواقع والمشاريع النشطة:</span>
                <span className="locations-count-tag">١١ محطة إقليمية</span>
              </div>
              <div className="locations-pills" id="locationsPills" role="tablist">
                {/* KSA Quick Hubs */}
                <button
                  type="button"
                  className={`loc-pill ksa-pill ${currentFocus === 'saudi' ? 'active' : ''}`}
                  onClick={focusSaudi}
                >
                  <span className="loc-icon">🇸🇦</span>
                  <span>الرياض / المقر</span>
                </button>

                {/* Yemen 8 Projects */}
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    className={`loc-pill ${activeProject.id === proj.id && currentFocus === 'yemen' ? 'active' : ''}`}
                    type="button"
                    onClick={() => selectProject(proj.id, false)}
                  >
                    <span className="loc-icon">◆</span>
                    <span>{proj.city}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dedicated Project Details Area (Yemen Portfolio Case Studies) */}
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

                  <h3 className="project-title" id="projectTitle">
                    {activeProject.title}
                  </h3>
                  <p className="project-tagline" id="projectTagline">
                    {activeProject.tagline}
                  </p>

                  <div className="project-location-meta">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span id="projectLocationText">{activeProject.location}</span>
                  </div>

                  <p className="project-desc" id="projectDesc">
                    {activeProject.overview}
                  </p>

                  <div className="project-columns-grid">
                    <div className="project-col">
                      <div className="col-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                        </svg>
                        <span>نطاق الأعمال والخدمات المقدمة:</span>
                      </div>
                      <ul className="project-features-list" id="projectServicesList">
                        {activeProject.services.map((item, i) => (
                          <li key={i}>
                            <span className="bullet">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="project-col">
                      <div className="col-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <span>الأسطول والأنظمة والتقنيات المشغلة:</span>
                      </div>
                      <ul className="project-features-list" id="projectTechList">
                        {activeProject.technologies.map((item, i) => (
                          <li key={i}>
                            <span className="bullet">⚡</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="project-action-row">
                    <a
                      href="#cta"
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        if (onNavigate) onNavigate('cta');
                      }}
                    >
                      طلب دراسة المشروع والتنفيذ الميداني
                    </a>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => focusYemen(true)}
                    >
                      إعادة توجيه الكاميرا للموقع 3D
                    </button>
                  </div>
                </div>

                <div className="project-side">
                  <div className="project-image-box">
                    <img id="projectImage" src={activeProject.image} alt={activeProject.title} loading="lazy" />
                    <div className="project-image-overlay">
                      <span className="overlay-city">{activeProject.city}</span>
                      <span className="overlay-label latin">MYON OPERATIONAL SITE</span>
                    </div>
                  </div>

                  <div className="project-stats-grid" id="projectStatsGrid">
                    {activeProject.stats.map((st, i) => (
                      <div key={i} className="proj-stat-cell">
                        <div className="proj-stat-val">{st.val}</div>
                        <div className="proj-stat-lbl">{st.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Territories & Operational Network Showcase */}
          <div className="regions-nav-pills reveal" role="tablist" style={{ marginTop: '3.5rem' }}>
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
                <h4>الفروع والمكاتب المعتمدة في {activeRegion.nameAr}</h4>
                <span className="branches-count-pill">{activeRegion.branches.length} مكاتب ومحطات رئيسية</span>
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
          </div>

          {/* All Regions Quick Summary Matrix */}
          <div className="regions-matrix-wrap reveal">
            <div className="matrix-head">
              <span className="matrix-title">دليل الأقاليم والفروع الأربعة بميون — نظرة سريعة</span>
              <span className="matrix-subtitle latin">FOUR STRATEGIC TERRITORIES &bull; ONE UNIFIED EXCELLENCE</span>
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
  }
);

