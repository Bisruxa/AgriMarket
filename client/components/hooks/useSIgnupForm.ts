// hooks/useSignupForm.ts
import { useState } from 'react';
import { FormData } from '@/types/FormTypes';
import { useFormValidation } from './useFormValidation';
import { formStepsConfig } from '@/lib/formStepsConfig';
import { authApi } from '@/lib/api';

export const useSignupForm = () => {
  const [role, setRole] = useState<'farmer' | 'trader'>('farmer');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    region: '',
    woreda: '',
    farmName: '',
    farmSize: '',
    crops: '',
    experience: ''
  });

  const { validateStep } = useFormValidation(formData);
  const formSteps = formStepsConfig[role];
  const totalSteps = formSteps.length;
  const currentStep = formSteps[step - 1];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length) setErrors([]);
  };

  const handleNextStep = () => {
    const validationErrors = validateStep(step);
    
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    
    if (step === totalSteps) {
      handleSubmit();
    } else {
      setStep(prev => prev + 1);
      setErrors([]);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      setErrors([]);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Map frontend role to backend role
      const backendRole = role === 'farmer' ? 'FARMER' : 'BUYER';
      
      // Send registration request to backend
      const response = await authApi.register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: backendRole,
        region: formData.region,
        woreda: formData.woreda,
        farmSize: formData.farmSize,
        crops: formData.crops,
        experience: formData.experience,
      });

      if (!response.success) {
        // Handle validation errors from backend
        if (response.errors) {
          setErrors(response.errors.map(err => err.message));
        } else {
          setErrors([response.message || 'Registration failed. Please try again.']);
        }
        return;
      }

      // Store token in localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      // Store user info
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // Redirect to dashboard
      const redirectPath = role === 'farmer' ? '/farmer/dashboard' : '/trader/dashboard';
      window.location.href = redirectPath;
    } catch (error) {
      setErrors(['Signup failed. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    role,
    setRole,
    step,
    setStep,
    errors,
    setErrors,
    isLoading,
    formData,
    setFormData,
    formSteps,
    totalSteps,
    currentStep,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
    validateStep
  };
};