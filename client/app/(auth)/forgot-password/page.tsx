'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthPage from '@/components/common/AuthForm/AuthForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword({ email: email.trim() });
      if (response.success) {
        setSuccess(
          response.message ||
            'If an account exists with that email, a password reset link has been sent.',
        );
      } else {
        setError(response.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      title="Forgot password"
      subtitle="Enter your email and we will send you a reset link"
      errors={error ? [error] : success ? [success] : []}
      step={1}
      totalSteps={1}
      isSignUp={false}
      showStepIndicator={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-30 md:pb-0">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="text-sm py-5 sm:py-2"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#5B8C51] rounded-xl sm:rounded-2xl py-5 sm:py-2 text-sm mt-4 hover:bg-[#668B57]"
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>

      <div className="text-center mt-4">
        <Link
          href="/signin"
          className="text-sm text-[#166831] hover:text-green-500 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </AuthPage>
  );
}
