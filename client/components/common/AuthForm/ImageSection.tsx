'use client';
import Image from 'next/image';
import { StaticImageData } from 'next/image';
import { Translations } from '@/lib/translations';

interface ImageSectionProps {
  image: StaticImageData;
  step?: number;
  t: Translations;
}

export function ImageSection({ image, step, t }: ImageSectionProps) {
  return (
    <div className="relative h-full w-full">
      <Image
        src={image}
        alt="Agricultural picture"
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 0vw, 50vw"
      />
      {step === 1 && (
        <>
          <div className="absolute inset-0 bg-linear-to-r from-black/30 via-black/20 to-transparent" />
          <div className="absolute inset-0 items-center p-12 flex">
            <div className='flex flex-col pl-18'>
              <h1 className="text-5xl font-bold text-white mb-4">
                {t?.authForm?.quote || 'Grow Smarter, Trade Better'}
              </h1>
              <p className="text-xl text-white/90 max-w-md">
                {t?.authForm?.subtitle || 'Get AI-powered insights on crops, prices and markets - all in one place.'}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}