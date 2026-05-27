'use client'
import { Sprout } from 'lucide-react';
import Link from "next/link";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full py-4 mt-8 mb-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        
          <div className="flex items-center gap-2">
            <Sprout size={18} className="text-[#5B8C51]" />
            <span className="text-gray-800 text-sm">AgriMarket</span>
            <span className="text-gray-400 text-xs">© {currentYear}</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link href="/marketplace" className="text-gray-600 hover:text-[#5B8C51]">
              Marketplace
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/privacy" className="text-gray-600 hover:text-[#5B8C51]">
              Privacy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms" className="text-gray-600 hover:text-[#5B8C51]">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;