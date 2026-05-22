'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthPage from '@/components/common/AuthForm/AuthForm';
import { useTranslations } from '../../../components/hooks/useTranlations';
import { Translations } from '@/lib/translations';
import { authApi } from '@/lib/api';
import {useRouter} from 'next/navigation';
import { useAuth } from '@/app/context/UserContext';
export default function SignInPage() {

  const t = useTranslations() as Translations;
  const { login } = useAuth();
  const [role, setRole] = useState<'FARMER' | 'TRADER'>('FARMER');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
 const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(t.signin.validation.required);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t.signin.validation.emailInvalid);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.login({email,password});
      if(!response.success){
        if(response.message){
          setError(response.message);
        }
        else{
          setError(t.signin.errors.invalidCredentials);
        }
        return;
      }
      if(response.token){
        localStorage.setItem('token',response.token);
      }
      if(response.user){
        login(response.user);
        localStorage.setItem('user',JSON.stringify(response.user));
        
        // Redirect based on actual user role from API response
        const userRole = response.user.role;
        let redirectPath = '/';
        
        if (userRole === 'FARMER') {
          redirectPath = '/farmer/dashboard';
        } else if (userRole === 'TRADER') {
          redirectPath = '/trader/dashboard';
        } else if (userRole === 'ADMIN') {
          redirectPath = '/admin/dashboard';
        }
        
        router.push(redirectPath);
      }
    } catch {
      setError(t.signin.errors.invalidCredentials);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      title={t.signin.title}
      subtitle={t.signin.subtitle}
      errors={error ? [error] : []}
      step={1}
      totalSteps={1}
      isSignUp={false}
      showStepIndicator={false}
      role={role}
      onRoleChange={setRole}
      // showRoleTabs={true}
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 pb-30 md:pb-0">
        <div className="space-y-1.5 sm:space-y-2">
          <Label htmlFor="email" className="text-xs sm:text-sm">
            {t.signin.fields.email}
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.signin.placeholders.email}
            className={`text-sm py-5 sm:py-2 ${error?.toLowerCase().includes('email') ? 'border-red-500' : ''}`}
            required
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs sm:text-sm">
              {t.signin.fields.password}
            </Label>
            <Link 
              href="/forgot-password" 
              className="text-xs sm:text-sm text-[#166831] hover:text-green-500 transition-colors"
            >
              {t.signin.links.forgotPassword}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.signin.placeholders.password}
            className={`text-sm py-5 sm:py-2 ${error?.toLowerCase().includes('password') ? 'border-red-500' : ''}`}
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-[#5B8C51] rounded-xl sm:rounded-2xl py-5 sm:py-2 text-sm mt-4 sm:mt-6 hover:bg-[#668B57] transition-colors" 
          disabled={isLoading}
        >
          {isLoading ? t.signin.buttons.processing : t.signin.buttons.signin}
        </Button>
      </form>

      <div className="text-center mt-3 sm:mt-4">
        <p className="text-xs sm:text-sm text-gray-600">
          {t.signin.links.noAccount}{' '}
          <Link 
            href="/signup" 
            className="font-semibold text-[#166831] hover:text-green-500 transition-colors"
          >
            {t.signin.links.signup}
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}