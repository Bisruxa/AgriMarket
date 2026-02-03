'use client';

import { FormData, ValidationRule } from '@/types/FormTypes';

export const useFormValidation = (formData: FormData) => {
  const validationRules = {
    step1: {
      checkAllEmpty: () => {
        const requiredFields: (keyof FormData)[] = ['fullName', 'email', 'password', 'confirmPassword'];
        const allEmpty = requiredFields.every(field => !formData[field]?.toString().trim());
        return allEmpty ? ['All fields are required'] : [];
      },
      validations: [
        { 
          field: 'fullName' as keyof FormData, 
          message: 'Full name is required', 
        },
        { 
          field: 'email' as keyof FormData, 
          message: 'Email is required', 
          validate: (val: string) => /\S+@\S+\.\S+/.test(val) || 'Please enter a valid email' 
        },
        { 
          field: 'password' as keyof FormData, 
          message: 'Password is required', 
          validate: (val: string) => val.length >= 6 || 'Password must be at least 6 characters' 
        },
        { 
          field: 'confirmPassword' as keyof FormData, 
          message: 'Confirm password is required', 
        },
        { 
          custom: () => formData.password === formData.confirmPassword || 'Passwords do not match' 
        }
      ] as ValidationRule[]
    },
    step2: {
      checkAllEmpty: () => {
        const requiredFields: (keyof FormData)[] = ['region', 'woreda'];
        const allEmpty = requiredFields.every(field => !formData[field]?.toString().trim());
        return allEmpty ? ['All fields are required'] : [];
      },
      validations: [
        { 
          field: 'region' as keyof FormData, 
          message: 'Region is required', 
        },
        { 
          field: 'woreda' as keyof FormData, 
          message: 'Woreda is required', 
        },
      ] as ValidationRule[]
    },
    step3: {
      checkAllEmpty: () => {
        const requiredFields: (keyof FormData)[] = ['farmName'];
        const allEmpty = requiredFields.every(field => !formData[field]?.toString().trim());
        return allEmpty ? ['All fields are required'] : [];
      },
      validations: [
        { 
          field: 'farmName' as keyof FormData, 
          message: 'Farm name is required', 
        },
      ] as ValidationRule[]
    }
  };

  const validateStep = (stepNum: number) => {
    const rules = validationRules[`step${stepNum}` as keyof typeof validationRules];
    const newErrors: string[] = [];
    
    const allEmptyError = rules.checkAllEmpty();
    if (allEmptyError.length > 0) {
      return allEmptyError; 
    }
    
    rules.validations.forEach(rule => {
      if ('field' in rule) {
        const value = formData[rule.field];
        const stringValue = value?.toString() || '';
        
        if (!stringValue.trim()) {
          newErrors.push(rule.message);
        } else if (rule.validate) {
          const error = rule.validate(stringValue);
          if (typeof error === 'string') newErrors.push(error);
        }
      } else if ('custom' in rule) {
        const error = rule.custom();
        if (typeof error === 'string') newErrors.push(error);
      }
    });
    
    return newErrors;
  };

  return { validateStep };
};