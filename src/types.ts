export interface ProjectStat {
  label: string;
  val: string;
}

export interface Project {
  id: string;
  city: string;
  govId: string;
  title: string;
  tagline: string;
  location: string;
  coords: [number, number];
  projected: [number, number];
  category: string;
  year: string;
  status: string;
  overview: string;
  services: string[];
  technologies: string[];
  stats: ProjectStat[];
  image: string;
}

export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  centroid: [number, number];
  polygons: number[][][][];
}

export interface MapData {
  bounds: {
    centerLon: number;
    centerLat: number;
    scale: number;
    cosLat: number;
  };
  governorates: Governorate[];
  projects: Project[];
}

export interface SpecDetail {
  badge: string;
  title: string;
  desc: string;
  specs: { label: string; val: string }[];
  features: string[];
}

export interface BranchInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  city: string;
  type: string;
  address: string;
  highlight: string;
  phone?: string;
  email?: string;
  services: string[];
}

export interface RegionInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  countryCode: string;
  flagEmoji: string;
  roleBadge: string;
  tagline: string;
  overview: string;
  strategicImportance: string;
  branches: BranchInfo[];
  services: string[];
  stats: { label: string; val: string }[];
  corridors: string[];
  hubCity: string;
  badgeColor?: string;
}

