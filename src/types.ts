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
