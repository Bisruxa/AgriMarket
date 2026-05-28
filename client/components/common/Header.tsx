'use client'
import  { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTranslations } from '../hooks/useTranlations'
import { Button } from '../ui/button'
import { Bell } from 'lucide-react'
function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
const pathname = usePathname()
const t= useTranslations();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
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
    <header 
      className={` top-0 z-50 transition-all duration-300 `
      //   ${
      //   isScrolled 
      //     ? 'bg-white shadow-md -ml-6 -mr-6' 
      //     : 'bg-transparent'
      // }`
    }
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          <div className="flex items-center gap-4">
            <span 
              className={`hidden sm:inline text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-gray-600 -ml-6'
              }`}
            >
                {t.header?.pages || 'Pages'} / {pageName}
            </span>
          </div>

          <div className="flex items-center">
            <Button className='bg-white text-black hover:bg-[#2A5A2A] hover:text-white'>
              <Bell size={20} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header