'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthPage from '@/components/common/AuthForm/AuthForm';
import { authApi } from '@/lib/api';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link. Request a new one from the sign-in page.');
      setIsError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      const response = await authApi.verifyEmail(token);
      if (cancelled) return;
      setLoading(false);
      if (response.success) {
        setMessage(response.message || 'Email verified successfully.');
        setIsError(false);
        window.history.replaceState(null, '', '/signin?verified=1');
      } else {
        setMessage(response.message || 'Verification failed.');
        setIsError(true);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthPage
      title="Verify email"
      subtitle={loading ? 'Confirming your email...' : 'Email verification'}
      errors={message ? [message] : []}
      step={1}
      totalSteps={1}
      isSignUp={false}
      showStepIndicator={false}
    >
      <div className="text-center space-y-4 pb-30 md:pb-0">
        {loading ? (
          <p className="text-sm text-gray-600">Please wait...</p>
        ) : (
          <>
            <p className={`text-sm ${isError ? 'text-red-600' : 'text-green-700'}`}>
              {message}
            </p>
            <Link
              href="/signin"
              className="inline-block text-sm text-[#166831] hover:text-green-500 transition-colors"
            >
              Go to sign in
            </Link>
          </>
        )}
      </div>
    </AuthPage>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
