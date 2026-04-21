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
  role?: 'FARMER' | 'TRADER';
  onRoleChange?: (role: 'FARMER' | 'TRADER') => void;
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
  role?: 'FARMER' | 'TRADER';
  onRoleChange?: (role: 'FARMER' | 'TRADER') => void;
}

export interface LogoComponentProps {
  isImageOnLeft: boolean;
}
export interface RegistrationData {
  name: string;
  email: string;
  password: string;
  role: 'FARMER' | 'TRADER';
  region?: string;  
  woreda?: string;  
  farmSize?: string;
  crops?:  string;  
  experience?: string;
  phone:string;
}
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
  farmSize?: string;
  crops?: string[];
  company?: string;
  phone?:string;
  registrationDate?:string;
  region?: string;
  woreda?: string;
  experience?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  loading: boolean;
}
export interface Trader {
  id: string;
  businessName: string;
  businessType?: string;
  businessRegNumber?: string;
  taxId?: string;
  description?: string;
  ownerName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  registrationDate: string; 
  region: string; 
  woreda: string; 

  isVerified?: boolean;
  approvalNote?: string | null;
}