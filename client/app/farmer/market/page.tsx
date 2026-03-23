"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CirclePlus, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import CTA from "./CTA";
import { api } from "@/lib/api";
import { Context } from "@/app/context/Context";

interface Product {
  _id: string;
  name: string;
  amount: number;
  pricePerQuantal: number;
  soldAmount: number;
  soldPercentage?: number;
  category: string;
  available: boolean;
  description?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const router = useRouter();
  const { setShow } = useContext(Context)!;
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const fetchProducts = async (page: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        category: "VEGITABLES",
        available: "true",
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString()
      };
      
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/products/my-products?${queryString}`);
      
      if (response.success && response.data) {
        if (typeof response.data === 'object' && response.data !== null && 'products' in response.data) {
          const paginatedData = response.data as { products: Product[], total: number, totalPages?: number };
          setProducts(paginatedData.products || []);
          setTotalItems(paginatedData.total || paginatedData.products.length);
          setTotalPages(paginatedData.totalPages || Math.ceil((paginatedData.total || paginatedData.products.length) / ITEMS_PER_PAGE));
        } 
        else if (Array.isArray(response.data)) {
          setProducts(response.data);
          setTotalItems(response.data.length);
          setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
        } 
        else {
          console.error("Unexpected data format:", response.data);
          setError("Received data in unexpected format");
        }
      } else {
        setError(response.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleCreateNew = () => {
    setSelectedProductId(null);
    setShow(true); 
  };

  const handleEdit = (productId: string) => {
    setSelectedProductId(productId);
    setShow(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }
    
    setIsDeleting(productId);
    
    try {
      const response = await api.delete(`/api/products/${productId}`);
      
      if (response.success) {
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));
        setTotalItems(prev => prev - 1);
        
        const newTotalPages = Math.ceil((totalItems - 1) / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
        
        alert("Product deleted successfully!");
      } else {
        alert(response.message || "Failed to delete product");
      }
    } catch (err) {
      alert("Network error. Please try again.");
      console.error("Error deleting product:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const calculateSoldPercentage = (product: Product) => {
    if (product.soldPercentage) return product.soldPercentage;
    if (product.amount > 0) {
      return ((product.soldAmount || 0) / product.amount) * 100;
    }
    return 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <Loader2 className="h-8 w-8 animate-spin text-[#2A5A2A]" />
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Products</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            onClick={() => fetchProducts(currentPage)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between mt-8">
       
        <div>
          <h1 className="font-bold text-2xl mb-2">Agricultural Products</h1>
          <p className="text-sm text-black/60">
            View, create and manage agricultural products
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-[#2A5A2A] hover:bg-[#2A5A2A]/90 cursor-pointer"
        >
          <CirclePlus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      <div className="border border-[rgba(0,0,0,0.2)] mt-15 rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Name</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Amount (Quintal)</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Price Per Quintal</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Sold Amount (%)</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Status</TableHead>
              <TableHead className="px-5 py-4 font-extrabold uppercase text-black/60">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No products found. Click &quot;Create New&quot; to add your first product.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const soldPercentage = calculateSoldPercentage(product);
                
                return (
                  <TableRow key={product._id} className="hover:bg-gray-50">
                    <TableCell className="py-5 text-sm px-7 text-black/80 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="py-5 text-sm px-7 text-black/80">
                      {formatNumber(product.amount)}
                    </TableCell>
                    <TableCell className="py-5 text-sm px-7 text-black/80">
                      {formatPrice(product.pricePerQuantal)}
                    </TableCell>
                    <TableCell className="py-5 text-sm px-7 text-black/80">
                      <div className="flex items-center gap-2">
                        <span>{soldPercentage.toFixed(1)}%</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#2A5A2A] rounded-full"
                            style={{ width: `${Math.min(soldPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5 text-sm px-7">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.available 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {product.available ? "Available" : "Sold Out"}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 text-sm px-7 text-black/80">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product._id)}
                          disabled={isDeleting === product._id}
                          className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          disabled={isDeleting === product._id}
                          className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-red-600"
                        >
                          {isDeleting === product._id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {products.length > 0 && (
        <CTA
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onNext={handleNextPage}
          onPrev={handlePrevPage}
        />
      )}
    </>
  );
};

export default Page;