export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  section?: string;
  isButton?: boolean;
  onClick?: () => void;
}