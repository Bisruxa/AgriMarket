'use client';

import { useSignupForm } from '@/components/hooks/useSIgnupForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthPage from '@/components/common/AuthForm';
import { MapPin, Globe, Info } from 'lucide-react';

export default function SignUpPage() {
  const {
    role,
    setRole,
    step,
    errors,
    isLoading,
    formData,
    formSteps,
    totalSteps,
    currentStep,
    handleInputChange,
    handleNextStep,
    handlePrevStep
  } = useSignupForm();

  const renderStep = (stepNum: number) => {
    if (stepNum === 2) {
      return (
        <div className="space-y-6">
          {/* Location Fields with Icons */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-[#5B8C51]" />
                <Label htmlFor="region" className="text-xs">
                  Region<span className="text-red-700">*</span>
                </Label>
              </div>
              <Input
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder="Enter your region"
                className={errors.some(e => e.toLowerCase().includes('region')) ? 'border-red-500' : ''}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#5B8C51]" />
                <Label htmlFor="woreda" className="text-xs">
                  Woreda<span className="text-red-700">*</span>
                </Label>
              </div>
              <Input
                id="woreda"
                name="woreda"
                value={formData.woreda}
                onChange={handleInputChange}
                placeholder="Enter your woreda"
                className={errors.some(e => e.toLowerCase().includes('woreda')) ? 'border-red-500' : ''}
              />
            </div>
          </div>
          
          {/* Why we need location information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800 mb-1">Why we need your location?</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Weather prediction for your specific area</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Crop recommendations based on local climate</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Market insights specific to your region</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const stepConfig = formSteps[stepNum - 1];
    
    return (
      <div className="space-y-4">
        {stepConfig.fields.map(field => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-xs">
              {field.label}
              {field.required && <span className="text-red-700">*</span>}
            </Label>
            <Input
              id={field.id}
              name={field.id}
              type={field.type}
              value={formData[field.id as keyof typeof formData]}
              onChange={handleInputChange}
              placeholder={field.placeholder || `Enter your ${field.label.toLowerCase()}`}
              className={errors.some(e => e.toLowerCase().includes(field.label.toLowerCase())) ? 'border-red-500' : ''}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <AuthPage
      title={currentStep.title}
      subtitle={currentStep.subtitle}
      errors={errors}
      step={step}
      totalSteps={totalSteps}
      isSignUp={true}
      showStepIndicator={false}
      role={role}
      onRoleChange={setRole}
      showRoleTabs={step === 1}
    >
      {/* Form Content */}
      {renderStep(step)}

      {/* Navigation Buttons */}
      <div className={`mt-6 ${step > 1 ? 'flex gap-6' : ''}`}>
        {step > 1 && (
          <Button 
            type="button"
            variant="outline" 
            onClick={handlePrevStep}
            className="flex-1 rounded-2xl"
            disabled={isLoading}
          >
             Back
          </Button>
        )}
        
        <Button 
          type="button"
          onClick={handleNextStep}
          className={step > 1 ? 'flex-2 bg-[#5B8C51] rounded-2xl' : 'w-full bg-[#5B8C51] rounded-2xl'}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 
            step === totalSteps ? 'Complete Registration' : 'Continue'
          }
        </Button>
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <p className="text-sm text-gray-600 mt-2">
          Already have an account?{' '}
          <Link 
            href="/signin" 
            className="font-semibold text-[#166831] hover:text-green-500 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}