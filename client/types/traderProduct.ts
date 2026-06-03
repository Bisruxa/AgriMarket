export interface TraderProductFarmer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  region?: string;
  woreda?: string;
}

export interface TraderProduct {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  unit: string;
  category: string;
  stock: number;
  location?: string;
  harvestDate?: string;
  farmer?: TraderProductFarmer;
}

export function formatTraderPrice(price: string | number) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numPrice);
}

export function formatFarmerLocation(product: {
  farmer?: TraderProductFarmer;
  location?: string;
}) {
  const region = product.farmer?.region;
  const woreda = product.farmer?.woreda;
  if (woreda && region) return `${woreda}, ${region}`;
  if (region) return region;
  if (woreda) return woreda;
  return product.location ?? '—';
}
