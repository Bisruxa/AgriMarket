"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface CTAProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onNext: () => void;
  onPrev: () => void;
}

const CTA = ({ currentPage, totalPages, totalItems, onNext, onPrev }: CTAProps) => {
  // Items per page - you can make this dynamic if needed
  const ITEMS_PER_PAGE = 10;
  
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  // Don't show pagination if there's only one page or no items
  if (totalPages <= 1 && totalItems <= ITEMS_PER_PAGE) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-4 border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Showing <span className="font-semibold text-[#2A5A2A]">{startItem}</span> to{' '}
        <span className="font-semibold text-[#2A5A2A]">{endItem}</span> of{' '}
        <span className="font-semibold text-[#2A5A2A]">{totalItems}</span> items
      </div>
      
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button 
          variant="outline"
          size="sm"
          className={`border-gray-300 hover:bg-[#2A5A2A] hover:text-white hover:border-[#2A5A2A] ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onPrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        
        {/* Page Numbers */}
        <div className="hidden md:flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-gray-400">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 p-0 ${
                    currentPage === page 
                      ? 'bg-[#2A5A2A] hover:bg-[#1E431E]' 
                      : 'border-gray-300 hover:bg-[#2A5A2A] hover:text-white hover:border-[#2A5A2A]'
                  }`}
                  onClick={() => {
                    if (typeof page === 'number' && page !== currentPage) {
                      const diff = page - currentPage;
                      if (diff > 0) {
                        for (let i = 0; i < diff; i++) onNext();
                      } else {
                        for (let i = 0; i < Math.abs(diff); i++) onPrev();
                      }
                    }
                  }}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Next Button */}
        <Button 
          variant="outline"
          size="sm"
          className={`border-gray-300 hover:bg-[#2A5A2A] hover:text-white hover:border-[#2A5A2A] ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Mobile Page Indicator */}
      <div className="md:hidden text-sm text-gray-500">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default CTA;