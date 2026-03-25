'use client';
interface LogoProps {
  isImageOnLeft: boolean;
}

export function Logo({ isImageOnLeft }: LogoProps) {
  return (
    <div className="absolute top-6 left-0 right-0 z-10 flex justify-center md:left-8 md:right-auto md:justify-start">
      <h1 className={`
        text-[25px] font-extrabold
        text-[#2F5632]
        md:${isImageOnLeft ? 'text-white' : 'text-[#2F5632]'}
      `}>
        AgriMarket
      </h1>
    </div>
  );
}