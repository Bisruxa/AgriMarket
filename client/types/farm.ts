export interface Farm {
  id: string;
  name: string;
  description?: string | null;
  size?: string | null;
  sizeUnit?: string | null;
  region?: string | null;
  woreda?: string | null;
  kebele?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  soilType?: string | null;
  soilColor?: string | null;
  waterSource?: string | null;
  crops: string[];
  isActive: boolean;
  nitrogen?: number | null;
  phosphorus?: number | null;
  potassium?: number | null;
  ph?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  rainfall?: number | null;
  farmerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFarmData {
  name: string;
  description?: string;
  size?: string;
  sizeUnit?: string;
  region?: string;
  woreda?: string;
  kebele?: string;
  soilType?: string;
  soilColor?: string;
  waterSource?: string;
}

export interface UpdateFarmData {
  name?: string;
  description?: string;
  size?: string;
  sizeUnit?: string;
  region?: string;
  woreda?: string;
  kebele?: string;
  soilType?: string;
  soilColor?: string;
  waterSource?: string;
}
