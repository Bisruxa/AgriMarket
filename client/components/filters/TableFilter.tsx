'use client';

import { Search } from 'lucide-react';
import { useDebounce } from '@/components/hooks/useDebounce';
import { TableFilterProps } from '@/types/Filters';
import { useTranslations } from '@/components/hooks/useTranlations';

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
  const debouncedSearch = useDebounce(onSearch, 300);

  const placeholder = searchPlaceholder || t.common?.search || "Search...";

  const getOptionLabel = (option: { value: string; label: string }) => {
    if (!translateOptions) return option.label;
    
    return t.filters?.status?.[option.value as keyof typeof t.filters.status] || option.label;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5B8C51] focus:border-transparent outline-none"
          />
        </div>

        {/* Filter Dropdown */}
        {showFilter && filterOptions.length > 0 && (
          <select
            value={filterValue}
            onChange={(e) => onFilterChange?.(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#5B8C51] focus:border-transparent outline-none min-w-[150px]"
          >
            {filterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {getOptionLabel(option)}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}