"use client"
import { useState, useCallback, useEffect } from 'react';
import { FormData } from '@/types/FormTypes';
import { useFormValidation } from './useFormValidation';
import { formStepsConfig } from '@/lib/formStepsConfig';
import { authApi, API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { RegistrationData } from '@/types/auth-page';
import { useDebounce } from './useDebounce';
import { useAuth } from '@/app/context/UserContext';

interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useSignupForm = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<'FARMER' | 'TRADER'>('FARMER');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone:'',
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

  // Email check function
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    
    setEmailStatus('checking');
    try {
      const response = await fetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setEmailStatus(data.available ? 'available' : 'unavailable');
    } catch {
      setEmailStatus('idle');
    }
  }, []);

  // Create debounced version of email check
  const debouncedCheckEmail = useDebounce(checkEmailAvailability, 500);

  // Use effect to trigger debounced check when email changes
  useEffect(() => {
    if (formData.email) {
      debouncedCheckEmail(formData.email);
    }
  }, [formData.email, debouncedCheckEmail]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length) setErrors([]);
    
    // Reset email status when email changes
    if (name === 'email') {
      setEmailStatus('idle');
    }
  };

  const handleNextStep = () => {
    const validationErrors = validateStep(step);
    
    if (validationErrors.length) {
      setErrors(validationErrors);
      return;
    }
    
    // Add email availability check when moving from step 1
    if (step === 1 && emailStatus === 'unavailable') {
      setErrors(['This email is already registered. Please sign in or use a different email.']);
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
    setErrors([]);
    
    try {
      const registrationData: RegistrationData = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone:formData.phone,
        role: role,
      };

      if (formData.region?.trim()) {
        registrationData.region = formData.region;
      }
      
      if (formData.woreda?.trim()) {
        registrationData.woreda = formData.woreda;
      }

      if (role === 'FARMER') {
        if (formData.farmSize?.trim()) {
          registrationData.farmSize = formData.farmSize;
        }
        
        if (formData.crops?.trim()) {
          registrationData.crops = formData.crops;
        }
        
        if (formData.experience?.trim()) {
          registrationData.experience = formData.experience;
        }
      }
  
      const response = await authApi.register(registrationData);

      if (!response.success) {
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map(err => err.message);
          setErrors(errorMessages);
        } else if (response.message) {
          setErrors([response.message]);
        } else {
          setErrors(['Registration failed. Please try again.']);
        }
        
        window.scrollTo(0, 0);
        return;
      }

      if (response.user && response.token) {
        login(response.user, response.token);
      } else if (response.user) {
        login(response.user);
      }

      const redirectPath = role === 'FARMER' ? '/farmer/dashboard' : '/trader/dashboard';
      router.push(redirectPath);
      
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Registration error:', apiError);
      
      if (apiError.message) {
        setErrors([apiError.message]);
      } else if (apiError.response?.data?.message) {
        setErrors([apiError.response.data.message]);
      } else {
        setErrors(['Signup failed. Please check your connection and try again.']);
      }
      
      window.scrollTo(0, 0);
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
    validateStep,
    emailStatus, 
  };
};