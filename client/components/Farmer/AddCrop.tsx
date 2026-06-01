'use client';
import React, { useEffect, useState, useContext } from 'react';
import { CropForm, CropFormData } from './CropForm';
import { productsApi } from '@/lib/api';
import { Context } from '@/app/context/Context';
import { useAuth } from "@/app/context/UserContext";
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

interface AddCropProps {
  productId?: string | null;
  onSuccess?: () => void;
}

const AddCrop = ({ productId, onSuccess }: AddCropProps) => {
  const t = useTranslations();
  const pf = t.dashboard.market.productForm;
  const { language } = useLanguage();
  const { user } = useAuth();
  const { setShow, setSelectedProductId } = useContext(Context)!;

  const closeModal = () => {
    setShow(false);
    setSelectedProductId(null);
  };
  const queryClient = useQueryClient();
  const [initialData, setInitialData] = useState<CropFormData | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setInitialData(undefined);
      return;
    }

    const fetchProductData = async () => {
      if (productId) {
        setIsFetching(true);
        try {
          const response = await productsApi.getMyProducts(1, 1000); 
          if (response.success && response.data && Array.isArray(response.data)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const product = response.data.find((p: any) => p.id === productId);
            if (product) {
              setInitialData({
                name: product.name,
                stock: product.stock?.toString() || "",
                price: product.price?.toString() || "",
                unit: product.unit || "KG",
                description: product.description || "",
                harvestDate: "",
                category: product.category || "VEGETABLES",
                location: "",
              });
            } else {
              console.error('Product not found');
            }
          }
        } catch (error) {
          console.error('Error fetching product:', error);
        } finally {
          setIsFetching(false);
        }
      }
    };
    fetchProductData();
  }, [productId]);

  const handleSubmit = async (data: CropFormData) => {
    setIsLoading(true);
    setSubmitError(null);
    
    try {
      const payload = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        unit: data.unit,
        category: data.category || 'VEGETABLES',
        stock: parseInt(data.stock),
        location: `${user?.region || 'Unknown'}, ${user?.woreda || 'Unknown'}`,
        isOrganic: true,
        harvestDate: data.harvestDate,
        images: []
      };
      
      let response;
      let successMessage = '';
      
      if (productId) {
        response = await productsApi.update(productId, payload);
        successMessage = pf.toastUpdated;
      } else {
        response = await productsApi.create(payload);
        successMessage = pf.toastAdded;
      }

      if (response.success) {
        // Show success toast
        toast.success(successMessage, {
          duration: 3000,
          position: 'top-right',
        });
        
        // Invalidate and refetch products
        await queryClient.invalidateQueries({ queryKey: ['products'] });
        await queryClient.refetchQueries({ queryKey: ['products'] });
        
        // Call onSuccess callback
        onSuccess?.();
        
        // Close modal
        closeModal();
      } else {
        const errorMsg = response.message || pf.toastFailed;
        setSubmitError(errorMsg);
        toast.error(errorMsg, {
          duration: 3000,
          position: 'top-right',
        });
      }
    } catch (error) {
      const errorMsg = pf.toastNetworkError;
      setSubmitError(errorMsg);
      toast.error(errorMsg, {
        duration: 3000,
        position: 'top-right',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className={`fixed inset-0 z-[111] flex items-center justify-center bg-black/50 ${language === 'am' ? 'amharic' : ''}`}>
        <div className="rounded-lg bg-white p-8">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#0B3D2E]" />
          <p className="mt-4 text-sm text-gray-700">{pf.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <CropForm
      initialData={initialData}
      productId={productId || undefined}
      onSubmit={handleSubmit}
      onClose={closeModal}
      isLoading={isLoading}
      errorMessage={submitError}
    />
  );
};

export default AddCrop;