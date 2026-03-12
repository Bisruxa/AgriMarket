'use client';
import { ReactNode } from 'react';
import { Tabs } from '@/components/ui/tabs';
import { Leaf, SproutIcon } from 'lucide-react';
import { Translations } from '@/lib/translations';

interface FormContentProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  errors: string[];
  showRoleTabs?: boolean;
  role?: 'FARMER' | 'BUYER';
  onRoleChange?: (role: 'FARMER' | 'BUYER') => void;
  t: Translations;
  language: string;
}

export function FormContent({
  children,
  title,
  subtitle,
  errors,
  showRoleTabs,
  role,
  onRoleChange,
  t,
  language
}: FormContentProps) {

  const roleButtons = [
    { role: 'FARMER' as const, icon: Leaf, label: language === 'en' ? 'FARMER' : 'ገበሬ' },
    { role: 'BUYER' as const, icon: SproutIcon, label: language === 'en' ? 'BUYER' : 'ነጋዴ' },
  ];

  return (
    <div className="w-full max-w-md">
      {/* Role Tabs - Above title */}
      {showRoleTabs && onRoleChange && role && (
        <div className="mb-3 mt-20 md:mt-4">
          <Tabs
            value={role}
            onValueChange={(value) => onRoleChange(value as 'FARMER' | 'BUYER')}
            className=""
          >
            <div className="flex gap-4 justify-center text-center">
              {roleButtons.map(({ role: btnRole, icon: Icon, label }) => (
                <button
                  key={btnRole}
                  onClick={() => onRoleChange(btnRole)}
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