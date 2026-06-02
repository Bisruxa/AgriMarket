'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Redirect legacy add URL to farms page with add modal open */
export default function AddFarmRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/farmer/farms?add=1');
  }, [router]);

  return null;
}
