export interface Product {
  location: string;
  harvestDate: string;
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
  farmer: {
    id: string;
    name: string;
  };
}