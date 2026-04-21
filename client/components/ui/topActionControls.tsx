"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageButton } from "@/components/ui/languageButton";

const TopActionControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center gap-2">
      <LanguageButton />
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Notifications"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-9 w-9 border-[#2A5A2A]/30 text-[#2A5A2A] hover:bg-[#2A5A2A] hover:text-white"
      >
        <Bell size={18} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-40 w-64 rounded-xl border border-black/10 bg-white p-3 shadow-lg">
          <h3 className="text-sm font-semibold text-black/80">Notifications</h3>
          <div className="mt-2 rounded-md border border-dashed border-black/10 bg-gray-50 p-3 text-sm text-black/60">
            No messages yet.
          </div>
        </div>
      )}
    </div>
  );
};

export default TopActionControls;
