"use client"
import { useState, useCallback, useEffect, useRef } from 'react'; // Add these imports
import { FormData } from '@/types/FormTypes';
import { useFormValidation } from './useFormValidation';
import { formStepsConfig } from '@/lib/formStepsConfig';
import { authApi} from '@/lib/api';
import { useRouter } from 'next/navigation';
import { RegistrationData } from '@/types/auth-page';
// Define API error response type
interface ApiError {
  message: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // Add this

export const useSignupForm = () => {
  const router = useRouter();
  const [role, setRole] = useState<'FARMER' | 'BUYER'>('FARMER');
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Add email status state here
  const [emailStatus, setEmailStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const debounceTimeout = useRef<NodeJS.Timeout>(null); // Add debounce ref here
  
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

  // Add checkEmailAvailability function here
  const checkEmailAvailability = useCallback(async (email: string) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    
    setEmailStatus('checking');
    try {
      const response = await fetch(`${API_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      setEmailStatus(data.available ? 'available' : 'unavailable');
    } catch (error) {
      setEmailStatus('idle');
    }
  }, []);

  // Add useEffect for debounced email check here
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    if (formData.email) {
      debounceTimeout.current = setTimeout(() => {
        checkEmailAvailability(formData.email);
      }, 500); // Wait 500ms after user stops typing
    }
    
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [formData.email, checkEmailAvailability]);

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

      if (response.token) {
        localStorage.setItem('token', response.token);
      }

      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      const redirectPath = role === 'FARMER' ? '/farmer/dashboard' : '/buyer/dashboard';
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

  // Add emailStatus to the returned object
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