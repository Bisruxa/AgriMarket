'use client';

import { useSignupForm } from '@/components/hooks/useSIgnupForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthPage from '@/components/common/AuthForm';
import { MapPin, Globe, Info } from 'lucide-react';
import { useTranslations } from '../../../components/hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import { Translations } from '@/lib/translations';

export default function SignUpPage() {
  const { language } = useLanguage();
  const t = useTranslations() as Translations; 
  
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
        <div className="space-y-4 sm:space-y-6">
          {/* Location Fields with Icons */}
          <div className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-[#5B8C51] shrink-0" />
                <Label htmlFor="region" className="text-xs sm:text-sm">
                  {t.signup.fields.region}<span className="text-red-700">*</span>
                </Label>
              </div>
              <Input
                id="region"
                name="region"
                value={formData.region}
                onChange={handleInputChange}
                placeholder={t.signup.placeholders.region}
                className={`text-sm ${errors.some(e => e.toLowerCase().includes('region')) ? 'border-red-500' : ''}`}
              />
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#5B8C51] shrink-0" />
                <Label htmlFor="woreda" className="text-xs sm:text-sm">
                  {t.signup.fields.woreda}<span className="text-red-700">*</span>
                </Label>
              </div>
              <Input
                id="woreda"
                name="woreda"
                value={formData.woreda}
                onChange={handleInputChange}
                placeholder={t.signup.placeholders.woreda}
                className={`text-sm ${errors.some(e => e.toLowerCase().includes('woreda')) ? 'border-red-500' : ''}`}
              />
            </div>
          </div>
          
          {/* Why we need location information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4 sm:mt-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
                  {t.signup.locationInfo.title}
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-xs">
                      {t.signup.locationInfo.benefits.weather}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-xs">
                      {t.signup.locationInfo.benefits.crops}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className="text-xs">
                      {t.signup.locationInfo.benefits.market}
                    </span>
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
      <div className="space-y-3 sm:space-y-4">
        {stepConfig.fields.map(field => {
          // Type-safe field access
          type FieldKey = keyof typeof t.signup.fields;
          type PlaceholderKey = keyof typeof t.signup.placeholders;
          
          const fieldKey = field.id as FieldKey;
          const placeholderKey = field.id as PlaceholderKey;
          
          return (
            <div key={field.id} className="space-y-1.5 sm:space-y-2">
              <Label htmlFor={field.id} className="text-xs sm:text-sm">
                {t.signup.fields[fieldKey]}
                {field.required && <span className="text-red-700">*</span>}
              </Label>
              <Input
                id={field.id}
                name={field.id}
                type={field.type}
                value={formData[field.id as keyof typeof formData]}
                onChange={handleInputChange}
                placeholder={t.signup.placeholders[placeholderKey]}
                className={`text-sm ${errors.some(e => e.toLowerCase().includes(field.label.toLowerCase())) ? 'border-red-500' : ''}`}
              />
            </div>
          );
        })}
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
      <div className="px-1 sm:px-0">
        {renderStep(step)}
      </div>

      {/* Navigation Buttons */}
      <div className={`mt-4 sm:mt-6 ${step > 1 ? 'flex flex-col sm:flex-row gap-3 sm:gap-6' : ''}`}>
        {step > 1 && (
          <Button 
            type="button"
            variant="outline" 
            onClick={handlePrevStep}
            className="w-full sm:flex-1 rounded-xl sm:rounded-2xl py-5 sm:py-2 text-sm"
            disabled={isLoading}
          >
            {t.signup.buttons.back}
          </Button>
        )}
        
        <Button 
          type="button"
          onClick={handleNextStep}
          className={`${
            step > 1 
              ? 'w-full sm:flex-2 bg-[#5B8C51] rounded-xl sm:rounded-2xl py-5 sm:py-2' 
              : 'w-full bg-[#5B8C51] rounded-xl sm:rounded-2xl py-5 sm:py-2'
          } text-sm`}
          disabled={isLoading}
        >
          {isLoading 
            ? t.signup.buttons.processing
            : step === totalSteps 
              ? t.signup.buttons.complete
              : t.signup.buttons.continue
          }
        </Button>
      </div>

      {/* Sign In Link */}
      <div className="text-center mt-4 sm:mt-6">
        <p className="text-xs sm:text-sm text-gray-600">
          {t.signup.links.haveAccount}{' '}
          <Link 
            href="/signin" 
            className="font-semibold text-[#166831] hover:text-green-500 transition-colors"
          >
            {t.signup.links.signin}
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}