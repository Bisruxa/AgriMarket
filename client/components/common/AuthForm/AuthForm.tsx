'use client';
import { ReactNode } from 'react';
import firstpage from '@/public/images/firstpage.png';
import secondpage from '@/public/images/secondpage.png';
import thirdpage from '@/public/images/thirdpage.png';
import { AuthPageProps } from '@/types/auth-page';
import { useTranslations } from '../../hooks/useTranlations';
import { useLanguage } from '@/app/context/LanguageContext';
import { Translations } from '@/lib/translations';
import { Logo } from '../../logo/Logo';
import { ImageSection } from './ImageSection';
import { FormContent } from './FormContent';
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
            <Logo isImageOnLeft={isImageOnLeft} />
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
            <Logo isImageOnLeft={isImageOnLeft} />
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



function FormSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-white overflow-y-auto">
      {children}
    </div>
  );
}

