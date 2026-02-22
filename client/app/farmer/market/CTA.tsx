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
  const startItem = (currentPage - 1) * 4 + 1;
  const endItem = Math.min(currentPage * 4, totalItems);

  return (
    <div className="flex justify-between items-center mt-5">
      <div>
        <h1 className="text-xs text-black/60">
          Showing {startItem} to {endItem} of {totalItems} items
        </h1>
      </div>
      <div className="flex space-x-2">
        <Button 
          className={`bg-transparent text-black hover:bg-[#2A5A2A] hover:text-white ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onPrev}
          disabled={currentPage === 1}
        >
          <ChevronLeft />
        </Button>
        <Button 
          className={`bg-transparent text-black hover:bg-[#2A5A2A] hover:text-white ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={onNext}
          disabled={currentPage === totalPages}
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default CTA;