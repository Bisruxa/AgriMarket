'use client';
import { ReactNode } from 'react';
import Image, { StaticImageData } from 'next/image';
import firstpage from '@/public/images/firstpage.png';
import secondpage from '@/public/images/secondpage.png';
import thirdpage from '@/public/images/thirdpage.png';
import { Tabs } from '@/components/ui/tabs';
import { Leaf, SproutIcon } from 'lucide-react';
import { AuthPageProps, FormContentProps } from '@/types/auth-page';
import { useTranslations } from '../hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import { Translations } from '@/lib/translations';

const LogoComponent = ({ isImageOnLeft }: { isImageOnLeft: boolean }) => (
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

export default function AuthPage({
  children,
  title,
  subtitle,
  errors = [],
  step = 1,
  isSignUp = false,
  role = 'FARMER',  
  onRoleChange,
  showRoleTabs = false,
}: AuthPageProps) {
  const { language } = useLanguage();
  const t = useTranslations() as Translations;
  
  const imageSide = isSignUp && step > 1 ? 'right' : 'left';
  const isImageOnLeft = imageSide === 'left';
  const currentImage = !isSignUp ? firstpage : 
    step === 1 ? firstpage : 
    step === 2 ? secondpage : 
    thirdpage;

  return (
    <div className="h-screen flex overflow-hidden">
      {isImageOnLeft ? (
        <>
          <div className='hidden md:block md:flex-1'>
            <ImageSection image={currentImage} step={step} t={t} />
          </div>
          <FormSection>
            <LogoComponent isImageOnLeft={isImageOnLeft} />
            <FormContent
              title={title}
              subtitle={subtitle}
              errors={errors}
              showRoleTabs={showRoleTabs}
              role={role}
              onRoleChange={onRoleChange}
              t={t}
              language={language}
            >
              {children}
            </FormContent>
          </FormSection>
        </>
      ) : (
        <>
          <FormSection>
            <LogoComponent isImageOnLeft={isImageOnLeft} />
            <FormContent
              title={title}
              subtitle={subtitle}
              errors={errors}
              showRoleTabs={showRoleTabs}
              role={role}
              onRoleChange={onRoleChange}
              t={t}
              language={language}
            >
              {children}
            </FormContent>
          </FormSection>
          <div className='hidden md:block md:flex-1'>
            <ImageSection image={currentImage} t={t} />
          </div>
        </>
      )}
    </div>
  );
}

function ImageSection({ image, step, t }: { image: StaticImageData; step?: number; t: Translations}) {
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

function FormSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white overflow-y-auto">
      {children}
    </div>
  );
}

function FormContent({
  children,
  title,
  subtitle,
  errors,
  showRoleTabs,
  role,
  onRoleChange,
  t,
  language
}: FormContentProps & { t:Translations, language: string }) {

  const roleButtons = [
    { role: 'farmer' as const, icon: Leaf, label: language === 'en' ? 'Farmer' : 'ገበሬ' },
    { role: 'trader' as const, icon: SproutIcon, label: language === 'en' ? 'Trader' : 'ነጋዴ' },
  ];

  return (
    <div className="w-full max-w-md">
      {/* Role Tabs - Above title */}
      {showRoleTabs && onRoleChange && (
        <div className="mb-3 mt-20 md:mt-4">
          <Tabs
            value={role}
            onValueChange={(value) => onRoleChange(value as 'farmer' | 'trader')}
            className=""
          >
            <div className="flex gap-4 justify-center text-center">
              {roleButtons.map(({ role: btnRole, icon: Icon, label }) => (
                <button
                  key={btnRole}
                  onClick={() => onRoleChange!(btnRole)}
                  className={`rounded-2xl text-xs font-medium transition-all w-32 h-6 text-center flex 
                    ${role === btnRole
                      ? 'bg-[#5B8C51]/50 text-[#404A3D]'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  <div className='flex align-center justify-center gap-1 ml-8 mt-1'>
                    <Icon size={16} />
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </Tabs>
        </div>
      )}
      
      {/* Title */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-[#404A3D] mb-2">{title}</h2>
        {subtitle && <p className="text-2xl mt-1 font-bold text-[#404A3D] mb-4">{subtitle}</p>}
      </div>

      {/* Error Display - Compact design */}
      {errors.length > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
          <ul className="text-xs text-red-700">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start py-0.5 ml-2">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div>
        {children}
      </div>
    </div>
  );
}