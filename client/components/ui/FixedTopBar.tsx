'use client';

import TopActionControls from './topActionControls';

/** Language + notifications — sticky, blends with page background. */
export default function FixedTopBar({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      className={`sticky z-[100] -mx-3 flex h-12 shrink-0 items-center justify-end overflow-visible bg-black/[0.015] px-3 sm:-mx-0 sm:px-4 ${
        isMobile ? 'top-16' : 'top-0'
      }`}
    >
      <TopActionControls />
    </div>
  );
}
