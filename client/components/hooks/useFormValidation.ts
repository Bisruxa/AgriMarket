'use client';

import { FormData, ValidationRule } from '@/types/FormTypes';
import { validateEthiopianPhone } from '@/lib/phone';
import { validatePasswordStrength } from '@/lib/password-strength';

export const useFormValidation = (formData: FormData) => {
  // Helper validation functions
  const validateFullName = (name: string): string | true => {
    if (!name.trim()) return 'Full name is required';
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    return nameRegex.test(name.trim()) || 'Full name should only contain letters and spaces (2-50 characters)';
  };

  const validateCrops = (crops: string): string | true => {
    if (!crops.trim()) return 'Crops are required';
    
    const cropList = crops.split(',').map(crop => crop.trim());
    
    if (cropList.some(crop => crop.length === 0)) {
      return 'Invalid format. Use commas to separate crops (e.g., Corn, Wheat)';
    }
    
    const cropRegex = /^[A-Za-z\s]+$/;
    const invalidCrops = cropList.filter(crop => !cropRegex.test(crop));
    
    return invalidCrops.length === 0 || 'Crops should only contain letters (no numbers or special characters)';
  };

  const validateFarmSize = (size: string): string | true => {
    if (!size.trim()) return 'Farm size is required';
    
    const num = Number(size);
    if (isNaN(num)) return 'Farm size must be a valid number';
    if (num <= 0) return 'Farm size must be greater than 0';
    if (num > 10000) return 'Farm size seems too large (max 10000 hectares)';
    
    return true;
  };

  const validateExperience = (exp: string): string | true => {
    if (!exp.trim()) return 'Experience is required';
    
    const num = Number(exp);
    if (isNaN(num)) return 'Experience must be a valid number';
    if (num < 0) return 'Experience cannot be negative';
    if (num > 100) return 'Experience seems too high (max 100 years)';
    if (!Number.isInteger(num)) return 'Experience should be a whole number (years)';
    
    return true;
  };

  const validationRules = {
    step1: {
      checkAllEmpty: () => {
        const requiredFields: (keyof FormData)[] = ['fullName', 'email', 'phone', 'password', 'confirmPassword'];
        const allEmpty = requiredFields.every(field => !formData[field]?.toString().trim());
        return allEmpty ? ['All fields are required'] : [];
      },
      validations: [
        { 
          field: 'fullName' as keyof FormData, 
          message: 'Full name is required',
          validate: (val: string) => validateFullName(val)
        },
        { 
          field: 'email' as keyof FormData, 
          message: 'Email is required', 
          validate: (val: string) => /\S+@\S+\.\S+/.test(val) || 'Please enter a valid email' 
        },
        {
          field: 'phone' as keyof FormData,
          message: 'Phone number is required',
          validate: (val: string) => validateEthiopianPhone(val),
        },
        { 
          field: 'password' as keyof FormData, 
          message: 'Password is required', 
          validate: (val: string) => validatePasswordStrength(val),
        },
        { 
          field: 'confirmPassword' as keyof FormData, 
          message: 'Confirm password is required',
          validate: (val: string) => val === formData.password || 'Passwords do not match'
        },
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
        const requiredFields: (keyof FormData)[] = ['farmSize', 'crops', 'experience'];
        const allEmpty = requiredFields.every(field => !formData[field]?.toString().trim());
        return allEmpty ? ['All fields are required'] : [];
      },
      validations: [
        { 
          field: 'farmSize' as keyof FormData, 
          message: 'Farm size is required',
          validate: (val: string) => validateFarmSize(val)
        },
        { 
          field: 'crops' as keyof FormData, 
          message: 'Crops are required',
          validate: (val: string) => validateCrops(val)
        },
        { 
          field: 'experience' as keyof FormData, 
          message: 'Experience is required',
          validate: (val: string) => validateExperience(val)
        },
      ] as ValidationRule[]
    }
  };

  const validateStep = (stepNum: number) => {
    const rules = validationRules[`step${stepNum}` as keyof typeof validationRules];
    if (!rules) return [];
    
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
          const result = rule.validate(stringValue);
          if (typeof result === 'string') newErrors.push(result);
        }
      } else if ('custom' in rule) {
        const result = rule.custom();
        if (typeof result === 'string') newErrors.push(result);
      }
    });
    
    return newErrors;
  };

  return { validateStep };
};