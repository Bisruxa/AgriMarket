export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  stock: number;
  unit: string;
  description?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  location?: string;
  harvestDate?: string;
  isOrganic?: boolean;
  farmer: {
    id: string;
    name: string;
    email?: string;
    region?: string;
    woreda?: string;
  };
}