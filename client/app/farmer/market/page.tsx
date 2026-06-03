'use client';
import React, { useContext, useState } from "react";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CirclePlus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import CTA from "./CTA";
import { Context } from "@/app/context/Context";
import Header from "@/components/common/Header";
import { useProducts, useProductMutations } from "@/components/hooks/useProducts";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from 'sonner';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  unit: string;
  category: string;
  isAvailable: boolean;
}

const Page = () => {
  const t = useTranslations();
  const m = t.dashboard.market;
  const { language } = useLanguage();
  const { setShow, setSelectedProductId } = useContext(Context)!;
  const [currentPage, setCurrentPage] = useState(1);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  
  const { data, isLoading, error, refetch } = useProducts(currentPage);
  const { deleteMutation } = useProductMutations();
  
  const products: Product[] = data?.products || [];
  const totalPages: number = data?.pages || 1;
  const totalItems: number = data?.total || 0;

  const handleCreateNew = () => {
    setSelectedProductId(null);
    setShow(true);
  };

  const handleEdit = (productId: string) => {
    setSelectedProductId(productId);
    setShow(true);
  };

  const handleDeleteConfirm = async () => {
    if (productToDelete) {
      await deleteMutation.mutateAsync(productToDelete);
      setProductToDelete(null);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'ETB', minimumFractionDigits: 2
    }).format(numPrice);
  };

  if (error && products.length === 0) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700">
                {m.tryAgain}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      
      <div className={`container mx-auto px-4 py-8 ${language === 'am' ? 'amharic' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="font-bold text-3xl text-[#0B3D2E] mb-2">{m.title}</h1>
            <p className="text-sm text-gray-600">{m.subtitle}</p>
          </div>
          <Button onClick={handleCreateNew} className="bg-[#0B3D2E] hover:bg-[#082F24] cursor-pointer rounded-lg">
            <CirclePlus className="mr-2 h-4 w-4" />
            {m.createNew}
          </Button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-5 py-4">{m.headers.name}</TableHead>
                <TableHead className="px-5 py-4">{m.headers.stock}</TableHead>
                <TableHead className="px-5 py-4">{m.headers.price}</TableHead>
                <TableHead className="px-5 py-4">{m.headers.unit}</TableHead>
                <TableHead className="px-5 py-4">{m.headers.category}</TableHead>
                <TableHead className="px-5 py-4">{m.headers.status}</TableHead>
                <TableHead className="px-5 py-4">{m.headers.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#0B3D2E] mx-auto" />
                    <p className="mt-2 text-gray-600">{m.loadingProducts}</p>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {m.noProducts}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell className="py-4 text-sm px-5 font-medium">{product.name}</TableCell>
                    <TableCell className="py-4 text-sm px-5">{product.stock.toLocaleString()}</TableCell>
                    <TableCell className="py-4 text-sm px-5">{formatPrice(product.price)}</TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{product.unit}</span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">{product.category}</span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {product.isAvailable ? m.available : m.soldOut}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(product.id)} 
                          className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-blue-600">
                          <Pencil className="h-3.5 w-3.5 mr-1" /> {m.edit}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setProductToDelete(product.id)}
                          disabled={deleteMutation.isPending}
                          className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-red-600">
                          {deleteMutation.isPending && deleteMutation.variables === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          {m.delete}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {products.length > 0 && totalPages > 1 && (
          <CTA
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            onNext={() => setCurrentPage(p => p + 1)}
            onPrev={() => setCurrentPage(p => p - 1)}
          />
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!productToDelete}
        onOpenChange={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title={m.deleteTitle}
        description={m.deleteDescription}
      />
    </>
  );
};

export default Page;