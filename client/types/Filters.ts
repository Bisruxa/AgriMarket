export interface FilterOption {
  value: string;
  label: string ;
}

export interface TableFilterProps {
  searchPlaceholder?: string;
  onSearch: (value: string) => void;
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  showFilter?: boolean;
  additionalFilters?: React.ReactNode;
}