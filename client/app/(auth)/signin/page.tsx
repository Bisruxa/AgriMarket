'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import AuthPage from '@/components/common/AuthForm';

export default function SignInPage() {
  const [role, setRole] = useState<'farmer' | 'trader'>('farmer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Sign in logic here
      const redirectPath = role === 'farmer' ? '/farmer/dashboard' : '/trader/dashboard';
      window.location.href = redirectPath;
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      title="Welcome Back"
      subtitle="Sign In to Your Account"
      errors={error ? [error] : []}
      step={1}
      totalSteps={1}
      isSignUp={false}
      showStepIndicator={false}
      role={role}
      onRoleChange={setRole}
      // showRoleTabs={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Link href="/forgot-password" className="text-xs text-[#166831] hover:text-green-500">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <Button type="submit" className="w-full bg-[#5B8C51] rounded-2xl mt-6" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-[#166831] hover:text-green-500">
            Sign up
          </Link>
        </p>
      </div>
    </AuthPage>
  );
}