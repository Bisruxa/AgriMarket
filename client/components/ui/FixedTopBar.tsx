'use client';

import TopActionControls from './topActionControls';

/** Language + notifications — fixed to viewport, no scroll jitter. */
export default function FixedTopBar({ isMobile }: { isMobile: boolean }) {
  return (
    <>
      <div
        className={`fixed z-[100] flex h-14 items-center justify-end overflow-visible border-b border-gray-200 bg-white px-4 shadow-sm ${
          isMobile ? 'top-16 left-0 right-0' : 'top-0 left-60 right-0'
        }`}
      >
        <TopActionControls />
      </div>
      <div className="h-14 shrink-0" aria-hidden />
    </>
  );
}
