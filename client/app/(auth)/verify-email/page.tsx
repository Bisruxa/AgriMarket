'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AuthPage from '@/components/common/AuthForm/AuthForm';
import { authApi } from '@/lib/api';

function sanitizeToken(raw: string | null): string {
  if (!raw) return '';
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = sanitizeToken(searchParams.get('token'));
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(!!token);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid verification link. Request a new one from the sign-in page.');
      setIsError(true);
      setLoading(false);
      return;
    }

    const storageKey = `agrimarket-verify-${token.slice(0, 16)}`;
    const cached = typeof window !== 'undefined' ? sessionStorage.getItem(storageKey) : null;
    if (cached) {
      setMessage(cached);
      setIsError(false);
      setLoading(false);
      return;
    }

    if (ranRef.current) return;
    ranRef.current = true;

    let cancelled = false;

    const run = async () => {
      const response = await authApi.verifyEmail(token);
      if (cancelled) return;
      setLoading(false);

      if (response.success) {
        const text =
          response.message ||
          'Email verified successfully. You can now sign in.';
        setMessage(text);
        setIsError(false);
        sessionStorage.setItem(storageKey, text);
      } else {
        setMessage(response.message || 'Verification failed.');
        setIsError(true);
        ranRef.current = false;
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
      errors={isError && message ? [message] : []}
      successMessages={!isError && message ? [message] : []}
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
            {!isError && (
            <Link
              href="/signin?verified=1"
              className="inline-block text-sm text-[#166831] hover:text-green-500 transition-colors"
            >
              Go to sign in
            </Link>
            )}
            {isError && (
              <p className="text-xs text-gray-500">
                Use the <strong>latest</strong> email if you requested verification more than once.
              </p>
            )}
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
