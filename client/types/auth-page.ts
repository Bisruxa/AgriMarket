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
  role?: 'FARMER' | 'BUYER';
  onRoleChange?: (role: 'FARMER' | 'BUYER') => void;
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
  role?: 'FARMER' | 'BUYER';
  onRoleChange?: (role: 'FARMER' | 'BUYER') => void;
}

export interface LogoComponentProps {
  isImageOnLeft: boolean;
}
export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: 'FARMER' | 'BUYER';
  region?: string;  
  woreda?: string;  
  farmSize?: string;
  crops?:  string;  
  experience?: string;
}