// app/trader/products/page.tsx or components/Trader/ProductsTable.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Sparkles,
  Users,
  Sprout,
  Loader2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Package
} from "lucide-react";
import { useTraderProducts } from '@/components/hooks/useTraderProducts';
import Header from "@/components/common/Header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from '@/types/product';
import { formatFarmerLocation } from '@/types/traderProduct';

const ProductsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFarmersPanel, setShowFarmersPanel] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: 0,
    max: 10000,
  });
  const limit = 10;

  const { data, isLoading, error, refetch } = useTraderProducts({
    page: currentPage,
    limit,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    search: searchTerm || undefined,
    minPrice: priceRange.min || undefined,
    maxPrice: priceRange.max || undefined,
  });

  const products: Product[] = data?.products || [];
  const totalPages = data?.pages || 1;
  const totalItems = data?.total || 0;
  const farmerSummaries = React.useMemo(() => {
    const grouped = new Map<string, { id: string; name: string; email?: string; count: number }>();
    for (const product of products) {
      const farmer = product.farmer;
      if (!farmer?.id) continue;
      const existing = grouped.get(farmer.id);
      if (existing) {
        existing.count += 1;
      } else {
        grouped.set(farmer.id, {
          id: farmer.id,
          name: farmer.name,
          email: farmer.email,
          count: 1,
        });
      }
    }
    return Array.from(grouped.values()).sort((a, b) => b.count - a.count);
  }, [products]);

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2,
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = [
    'all',
    'VEGETABLES',
    'FRUITS',
    'GRAINS',
    'SEEDS',
    'DAIRY',
    'MEAT',
  ];

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700">
                Try Again
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="font-bold text-3xl text-[#2A5A2A] mb-2">
            Available Agricultural Products
          </h1>
          <p className="text-sm text-gray-600">
            Browse products from farmers
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <Link href="/trader/price-forecast">
            <Button className="bg-[#2A5A2A] hover:bg-[#1f4f1f]">
              <Sparkles className="mr-1.5 h-4 w-4" />
              Forecast (AI)
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => setShowFarmersPanel((prev) => !prev)}
            disabled={farmerSummaries.length === 0}
          >
            <Users className="mr-1.5 h-4 w-4" />
            Farmers
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setCurrentPage(1);
            }}
          >
            <Sprout className="mr-1.5 h-4 w-4" />
            Crops
          </Button>
        </div>

        {showFarmersPanel && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-[#2A5A2A]">Farmers in current listings</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {farmerSummaries.map((farmer) => (
                <Link
                  key={farmer.id}
                  href={`/trader/farmers/${farmer.id}`}
                  className="rounded-md border border-gray-200 px-3 py-2 hover:bg-gray-50"
                >
                  <p className="text-sm font-medium text-gray-900">{farmer.name}</p>
                  <p className="text-xs text-gray-500">{farmer.email || 'No email'}</p>
                  <p className="text-xs text-[#2A5A2A] mt-1">{farmer.count} listing(s)</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range - Min */}
            <Input
              type="number"
              placeholder="Min Price (ETB)"
              value={priceRange.min || ''}
              onChange={(e) => {
                setPriceRange({ ...priceRange, min: Number(e.target.value) });
                setCurrentPage(1);
              }}
            />

            {/* Price Range - Max */}
            <Input
              type="number"
              placeholder="Max Price (ETB)"
              value={priceRange.max || ''}
              onChange={(e) => {
                setPriceRange({ ...priceRange, max: Number(e.target.value) });
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="md:hidden space-y-3">
          {isLoading && products.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-5 text-center">
              <Loader2 className="h-7 w-7 animate-spin text-[#2A5A2A] mx-auto" />
              <p className="mt-2 text-sm text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-5 text-center text-gray-500">
              <Package className="h-10 w-10 mx-auto mb-2 text-gray-400" />
              No products found.
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category}</p>
                  </div>
                  <p className="font-semibold text-[#2A5A2A]">{formatPrice(product.price)}</p>
                </div>
                <p className="mt-1 text-xs text-gray-600">Stock: {product.stock} {product.unit}</p>
                <p className="mt-1 text-xs text-gray-600">{formatFarmerLocation(product)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">{product.farmer?.name || 'Unknown farmer'}</span>
                  {product.farmer?.id && (
                    <Link
                      href={`/trader/farmers/${product.farmer.id}`}
                      className="text-xs font-medium text-[#2A5A2A] underline"
                    >
                      View farmer profile
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="px-5 py-4">Product</TableHead>
                <TableHead className="px-5 py-4">Farmer</TableHead>
                <TableHead className="px-5 py-4">Category</TableHead>
                <TableHead className="px-5 py-4">Stock</TableHead>
                <TableHead className="px-5 py-4">Price</TableHead>
                <TableHead className="px-5 py-4">Unit</TableHead>
                <TableHead className="px-5 py-4">Location</TableHead>
                <TableHead className="px-5 py-4">Harvest Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-[#2A5A2A] mx-auto" />
                    <p className="mt-2 text-gray-600">Loading products...</p>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    No products found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell className="py-4 text-sm px-5">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {product.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <div>
                        {product.farmer?.id ? (
                          <Link
                            href={`/trader/farmers/${product.farmer.id}`}
                            className="font-medium text-[#2A5A2A] hover:underline"
                          >
                            {product.farmer?.name}
                          </Link>
                        ) : (
                          <p className="font-medium">{product.farmer?.name}</p>
                        )}
                        <p className="text-xs text-gray-500">{product.farmer?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {product.category}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className={`font-medium ${
                        product.stock > 50 ? 'text-green-600' : 
                        product.stock > 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.stock.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {product.unit}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 text-gray-600">
                      {formatFarmerLocation(product)}
                    </TableCell>
                    <TableCell className="py-4 text-sm px-5 text-gray-600">
                      {product.harvestDate ? formatDate(product.harvestDate) : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {products.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {products.length} of {totalItems} products
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center px-3 text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsTable;