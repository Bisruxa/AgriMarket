'use client'
import { usePathname } from 'next/navigation'
import { useTranslations } from '../hooks/useTranlations'
function Header() {
const pathname = usePathname()
const t= useTranslations();
const getPageTranslationKey = (path: string): string => {
    const pathMap: Record<string, string> = {
      '/': 'home',
      '/dashboard': 'dashboard',
      '/admin/traderApproval': 'traderApproval',
      '/farmer': 'farmer',
      '/admin': 'admin',
      '/farmer/portfolio': 'portfolio',
      '/farmer/chat': 'chat',
      '/admin/chat': 'chat',
      '/farmer/market': 'market',
    };

    return pathMap[path] || path.split('/').pop() || 'home';
  };

  const pageKey = getPageTranslationKey(pathname);
  const pageName = t.header?.[pageKey as keyof typeof t.header] || pageKey
  return (
    <header className="top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm font-medium text-gray-600">
              {t.header?.pages || 'Pages'} / {pageName}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header