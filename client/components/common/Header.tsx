'use client'
import  { useState, useEffect } from 'react'
import { LanguageButton } from '@/components/ui/languageButton'

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
          
          {/* Left - Page Indicator */}
          <div className="flex items-center gap-4">
            <span 
              className={`hidden sm:inline text-sm font-medium transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-gray-600 -ml-6'
              }`}
            >
              Pages / Dashboard
            </span>
          </div>

          {/* Right - Language */}
          <div className="flex items-center">
            <LanguageButton />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header