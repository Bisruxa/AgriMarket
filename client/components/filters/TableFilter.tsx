'use client';

import { Search, ChevronDown, X } from 'lucide-react';
import { useDebounce } from '@/components/hooks/useDebounce';
import { TableFilterProps } from '@/types/Filters';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useState, useEffect, useRef } from 'react';

export default function TableFilter({
  searchPlaceholder,
  onSearch,
  filterValue,
  onFilterChange,
  filterOptions = [],
  showFilter = true,
  translateOptions = false, 
}: TableFilterProps & { translateOptions?: boolean }) {
  const t = useTranslations();
  const [searchInput, setSearchInput] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  
  const debouncedSearch = useDebounce(onSearch, 300);

  const placeholder = searchPlaceholder || t.common?.search || "Search...";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  const getOptionLabel = (option: { value: string; label: string }) => {
    if (!translateOptions) return option.label;
    return t.filters?.status?.[option.value as keyof typeof t.filters.status] || option.label;
  };

  const currentFilterLabel = filterOptions.find(opt => opt.value === filterValue)?.label || 'Filter';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#5B8C51] transition-colors duration-200" />
          <input
            type="text"
            value={searchInput}
            placeholder={placeholder}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#5B8C51]/20 focus:border-[#5B8C51] outline-none transition-all duration-200 bg-white hover:border-gray-300"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {showFilter && filterOptions.length > 0 && (
          <div className="relative sm:w-48" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-[#5B8C51]/20 focus:border-[#5B8C51] outline-none transition-all duration-200 bg-white"
            >
              <span className="text-sm font-medium text-gray-700 truncate">
                {currentFilterLabel}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isFilterOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu with lower z-index and pointer-events auto */}
            {isFilterOpen && (
              <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                <div className="py-1">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onFilterChange?.(option.value);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                        filterValue === option.value 
                          ? 'bg-[#5B8C51]/10 text-[#5B8C51] font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {getOptionLabel(option)}
                      {filterValue === option.value && (
                        <span className="float-right text-[#5B8C51]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Filters Indicator */}
      {searchInput && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-500">Active filter:</span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#5B8C51]/10 text-[#5B8C51] rounded-full text-xs font-medium">
            <Search className="w-3 h-3" />
           {`"${searchInput}"`}
          </span>
        </div>
      )}
    </div>
  );
}