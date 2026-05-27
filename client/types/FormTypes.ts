export type Role = 'farmer' | 'trader';

export type FormData = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  region: string;
  woreda: string;
  farmName: string;
  farmSize: string;
  crops: string;
  experience: string;
  phone:string;
};

export type ValidationRule =  | { field: keyof FormData; message: string; validate?: (val: string) => string | boolean }
  | { custom: () => string | boolean };

export type StepConfig = {
  title: string;
  subtitle: string;
  fields: FormField[];
};

export type FormField = {
  id: keyof FormData;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  icon?: string; 
};