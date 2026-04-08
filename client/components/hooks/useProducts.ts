// components/hooks/useProducts.ts
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ApiResponse } from '@/lib/api';
import { Product } from '@/types/product';
import { toast } from 'sonner';

export const useProducts = (page: number) => {
  return useQuery({
    queryKey: ['products', page],
    queryFn: () => productsApi.getMyProducts(page, 10),
    select: (response: ApiResponse<Product[]>) => {
      if (!response) {
        return { products: [], total: 0, pages: 1 };
      }
      return {
        products: response.data || [],
        total: response.total || 0,
        pages: response.pages || 1
      };
    }
  });
};

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: (response: ApiResponse<unknown>) => {
      if (response?.success) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        toast.success('Product deleted successfully');
      } else {
        toast.error(response?.message || 'Failed to delete product');
      }
    },
    onError: () => {
      toast.error('Network error. Please try again.');
    }
  });

  return { deleteMutation };
};