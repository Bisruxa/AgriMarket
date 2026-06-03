'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthPage from '@/components/common/AuthForm/AuthForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authApi } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset email.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.resetPassword({ token, newPassword });
      if (response.success) {
        setSuccess(response.message || 'Password reset successfully.');
        setTimeout(() => router.push('/signin'), 2500);
      } else {
        setError(response.message || 'Failed to reset password.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthPage
      title="Reset password"
      subtitle="Choose a new password for your account"
      errors={error ? [error] : success ? [success] : []}
      step={1}
      totalSteps={1}
      isSignUp={false}
      showStepIndicator={false}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pb-30 md:pb-0">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="text-sm py-5 sm:py-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="text-sm py-5 sm:py-2"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-[#5B8C51] rounded-xl sm:rounded-2xl py-5 sm:py-2 text-sm mt-4 hover:bg-[#668B57]"
          disabled={isLoading || !token}
        >
          {isLoading ? 'Updating...' : 'Update password'}
        </Button>
      </form>

      <div className="text-center mt-4 space-y-2">
        {!token && (
          <p className="text-sm text-red-600">
            Missing reset token.{' '}
            <Link href="/forgot-password" className="underline text-[#166831]">
              Request a new link
            </Link>
          </p>
        )}
        <Link
          href="/signin"
          className="text-sm text-[#166831] hover:text-green-500 transition-colors block"
        >
          Back to sign in
        </Link>
      </div>
    </AuthPage>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
