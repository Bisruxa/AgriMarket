// hooks/useTraderProducts.ts
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { Product } from '@/types/product';

interface UseTraderProductsProps {
  page: number;
  limit: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export const useTraderProducts = ({
  page,
  limit,
  category,
  minPrice,
  maxPrice,
  search,
}: UseTraderProductsProps) => {
  return useQuery({
    queryKey: ['trader-products', page, limit, category, minPrice, maxPrice, search],
    queryFn: async () => {
      const response = await productsApi.getAllProducts(page, limit, {
        category,
        minPrice,
        maxPrice,
        search,
      });
      
      if (response.success && response.data) {
        return {
          products: response.data,
          total: response.total || 0,
          pages: response.pages || 1,
          currentPage: page,
        };
      }
      throw new Error(response.message || 'Failed to fetch products');
    },
  });
};