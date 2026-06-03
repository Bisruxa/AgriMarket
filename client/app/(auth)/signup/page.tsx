'use client';
import { useSignupForm } from '@/components/hooks/useSIgnupForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthPage from '@/components/common/AuthForm/AuthForm';
import { MapPin, Globe, Info } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/components/hooks/useTranlations';
import { useEthiopianGeoOptions } from '@/components/hooks/useEthiopianGeoOptions';
import { EthiopianPhoneInput } from '@/components/auth/EthiopianPhoneInput';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrengthIndicator';


export default function SignUpPage() {
  const t = useTranslations();
  const { regions, getWoredasForRegion } = useEthiopianGeoOptions();

  const {
    role,
    setRole,
    step,
    setStep,
    errors,
    isLoading,
    formData,
    formSteps,
    totalSteps,
    handleInputChange,
    handleNextStep,
    handlePrevStep,
  } = useSignupForm();
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const availableWoredas = selectedRegion ? getWoredasForRegion(selectedRegion) : [];

  const createEvent = (name: string, value: string) => 
    ({ target: { name, value } }) as React.ChangeEvent<HTMLInputElement>;

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    handleInputChange(createEvent('region', value));
    handleInputChange(createEvent('woreda', ''));
  };

  const handleWoredaChange = (value: string) => {
    handleInputChange(createEvent('woreda', value));
  };

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
                  {regions.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[#5B8C51] shrink-0" />
                <Label htmlFor="woreda" className="text-xs sm:text-sm">
                  {t.signup.fields.woreda}<span className="text-red-700">*</span>
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
           if (field.id === 'phone') {
          return (
            <div key={field.id} className="space-y-1.5 sm:space-y-2">
              <Label htmlFor={field.id} className="text-xs sm:text-sm">
                {t.signup.fields.phone}
                {field.required && <span className="text-red-700">*</span>}
              </Label>
              <EthiopianPhoneInput
                id={field.id}
                name={field.id}
                value={formData.phone}
                onChange={(digits) =>
                  handleInputChange({
                    target: { name: 'phone', value: digits },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                hasError={errors.some((e) => e.toLowerCase().includes('phone'))}
              />
            </div>
          );
        }

          if (field.id === 'password') {
            return (
              <div key={field.id} className="space-y-1.5 sm:space-y-2">
                <Label htmlFor={field.id} className="text-xs sm:text-sm">
                  {t.signup.fields.password}
                  {field.required && <span className="text-red-700">*</span>}
                </Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t.signup.placeholders.password}
                  className={`text-sm ${
                    errors.some((e) => e.toLowerCase().includes('password'))
                      ? 'border-red-500'
                      : ''
                  }`}
                />
                <PasswordStrengthIndicator password={formData.password} />
              </div>
            );
          }

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

  const handleRoleChange = (newRole: 'FARMER' | 'TRADER') => {
    setRole(newRole);
    setStep(1);
    setSelectedRegion('');
  };

  return (
    <AuthPage
      // title={step === 1 ? t.signup.title: " "}
    title={step === 1 ? " ": " "}
      subtitle={step === 1 ? t.signup.subtitle:" "}
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
          } text-sm hover:bg-green-900`}
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