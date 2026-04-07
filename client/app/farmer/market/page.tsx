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
import Header from "@/components/common/Header"

// Updated Product interface to match backend response
interface Product {
  id: string;           // Changed from _id to id
  name: string;
  description: string;
  price: string | number;
  unit: string;
  category: string;
  stock: number;        // Changed from amount
  location: string;
  isOrganic: boolean;
  harvestDate?: string;
  expiryDate?: string;
  isAvailable: boolean; // Changed from available
  ratingsAverage: number;
  ratingsCount: number;
  farmerId: string;
  createdAt: string;
  updatedAt: string;
  farmer?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PaginatedResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
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
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString()
      };
      
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/products/my-products?${queryString}`);
      
      if (response.success && response.data) {
        // Handle paginated response with products array
        if (response.data && Array.isArray(response.data)) {
          setProducts(response.data);
          // setTotalItems(response.total || response.data.length);
          // setTotalPages(response.pages || Math.ceil((response.total || response.data.length) / ITEMS_PER_PAGE));
        } 
        // Handle array response
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
      const response = await api.delete(`/products/${productId}`);
      
      if (response.success) {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        setTotalItems(prev => prev - 1);
        
        const newTotalPages = Math.ceil((totalItems - 1) / ITEMS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(Math.max(1, newTotalPages));
        }
        
        // Refresh the current page to get updated data
        fetchProducts(currentPage);
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

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numPrice);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading && products.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-[#2A5A2A]" />
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </>
    );
  }

  if (error && products.length === 0) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
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
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mt-8 mb-6">
          <div>
            <h1 className="font-bold text-3xl text-[#2A5A2A] mb-2">My Agricultural Products</h1>
            <p className="text-sm text-gray-600">
              View, create and manage your agricultural products
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            className="bg-[#2A5A2A] hover:bg-[#1E431E] cursor-pointer rounded-lg"
          >
            <CirclePlus className="mr-2 h-4 w-4" />
            Create New
          </Button>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Name</TableHead>
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Stock</TableHead>
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Price</TableHead>
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Unit</TableHead>
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Category</TableHead>
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Status</TableHead>
                <TableHead className="px-5 py-4 font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No products found. Click "Create New" to add your first product.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell className="py-4 text-sm px-5 text-gray-800 font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 text-gray-600">
                      {formatNumber(product.stock)}
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 text-gray-600">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 text-gray-600">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {product.unit}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {product.isAvailable ? "Available" : "Sold Out"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product.id)}
                          disabled={isDeleting === product.id}
                          className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-blue-600"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          disabled={isDeleting === product.id}
                          className="h-8 px-3 text-xs border-gray-200 hover:bg-gray-50 hover:text-red-600"
                        >
                          {isDeleting === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Delete
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
            onNext={handleNextPage}
            onPrev={handlePrevPage}
          />
        )}
      </div>
    </>
  );
};

export default Page;