'use client';
import { useSignupForm } from '@/components/hooks/useSIgnupForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthPage from '@/components/common/AuthForm';
import { MapPin, Globe, Info, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ETHIOPIAN_REGIONS } from '@/lib/regon_n_woreda';
import { WOREDAS_BY_REGION } from '@/lib/regon_n_woreda';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';

export default function SignUpPage() {
  const t = useTranslations(); 
  const {language } = useLanguage();
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
    handlePrevStep,
    emailStatus
  } = useSignupForm();
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [availableWoredas, setAvailableWoredas] = useState<{ value: string; label: string }[]>([]);

  const createEvent = (name: string, value: string) => 
    ({ target: { name, value } }) as React.ChangeEvent<HTMLInputElement>;

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setAvailableWoredas(WOREDAS_BY_REGION[value] || []);
    
    handleInputChange(createEvent('region', value));
    handleInputChange(createEvent('woreda', ''));
  };

  const handleWoredaChange = (value: string) => {
    handleInputChange(createEvent('woreda', value));
  };

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
                  {t.faq.questions[0] ? 'Region' : 'Region'}<span className="text-red-700">*</span>
                </Label>
              </div>
              <Select 
                onValueChange={handleRegionChange} 
                value={selectedRegion || formData.region}
              >
                <SelectTrigger className={`rounded-xl h-11 ${
                  errors.some(e => e.toLowerCase().includes('region')) ? 'border-red-500' : ''
                }`}>
                  <SelectValue placeholder="Select your region" />
                </SelectTrigger>
                <SelectContent>
                  {ETHIOPIAN_REGIONS.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#5B8C51]" />
                <Label htmlFor="woreda" className="text-xs">
                  Woreda<span className="text-red-700">*</span>
                </Label>
              </div>
              <Select 
                onValueChange={handleWoredaChange}
                value={formData.woreda}
                disabled={!selectedRegion || availableWoredas.length === 0}
              >
                <SelectTrigger className={`rounded-xl h-11 ${
                  errors.some(e => e.toLowerCase().includes('woreda')) ? 'border-red-500' : ''
                } ${!selectedRegion ? 'opacity-50' : ''}`}>
                  <SelectValue placeholder={
                    !selectedRegion 
                      ? 'Select a region first' 
                      : availableWoredas.length === 0 
                      ? 'No woredas available' 
                      : 'Select your woreda'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {availableWoredas.map(woreda => (
                    <SelectItem key={woreda.value} value={woreda.value}>
                      {woreda.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Why we need location information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
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
              className={errors.some(e => e.toLowerCase().includes(field.label.toLowerCase())) ? 'border-red-500' : field.id === 'email' && emailStatus === 'unavailable' ? 'border-red-500' : ''}
            />
            {/* Email status indicator - uncomment if needed */}
          </div>
        ))}
      </div>
    );
  };

  const handleRoleChange = (newRole: 'FARMER' | 'BUYER') => {
    setRole(newRole);
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
      onRoleChange={handleRoleChange}
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
          className={step > 1 ? 'flex-2 bg-[#5B8C51] rounded-2xl hover:bg-green-900' : 'w-full bg-[#5B8C51] rounded-2xl hover:bg-green-900'}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (step === totalSteps ? 'Complete Registration' : 'Continue')
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