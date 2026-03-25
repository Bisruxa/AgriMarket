'use client'
import React, { useState } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/app/context/LanguageContext'


export function LanguageButton() {
  // const [currentLang, setCurrentLang] = useState(language || 'en')
   const { language, toggleLanguage } = useLanguage()
  // const toggleLanguage = () => {
  //   const newLang = currentLang === 'en' ? 'am' : 'en'
  //   setCurrentLang(newLang)
    
    // Call the callback if provided
    // if (onLanguageChange) {
    //   onLanguageChange(newLang)
    // }
    
    // console.log('Language changed to:', newLang)
  

  const getButtonStyles = () => {
    const baseStyles = "flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-300"
    return `${baseStyles} bg-white/10 hover:bg-white/20 text-black`
  }

  return (
    <button
      onClick={toggleLanguage}
      className={getButtonStyles()}
      aria-label={language === 'en' ? 'Switch to Amharic' : 'Switch to English'}
    >
      <Globe size={18} />
      <span className="text-sm font-medium">
        {language === 'en' ? 'አማ' : 'ENG'}
      </span>
    </button>
  )
}