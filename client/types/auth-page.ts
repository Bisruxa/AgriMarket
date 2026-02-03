import { ReactNode } from 'react';
import { StaticImageData } from 'next/image';

export interface AuthPageProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  errors?: string[];
  step?: number;
  totalSteps?: number;
  isSignUp?: boolean;
  showStepIndicator?: boolean;
  role?: 'farmer' | 'trader';
  onRoleChange?: (role: 'farmer' | 'trader') => void;
  showRoleTabs?: boolean;
}

export interface ImageSectionProps {
  image: StaticImageData;
}

export interface FormSectionProps {
  children: ReactNode;
}

export interface FormContentProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  errors: string[];
  showRoleTabs?: boolean;
  role?: 'farmer' | 'trader';
  onRoleChange?: (role: 'farmer' | 'trader') => void;
}

export interface LogoComponentProps {
  isImageOnLeft: boolean;
}