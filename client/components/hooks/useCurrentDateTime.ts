import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";
import {
  type AppLanguage,
  formatAppDate,
  formatAppDateTime,
  formatAppTime,
  formatAppWeekday,
} from "@/lib/formatDate";

export const useCurrentDateTime = () => {
  const { language } = useLanguage();
  const lang = (language === "am" ? "am" : "en") as AppLanguage;
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    currentDateTime,
    formatDate: formatAppDateTime(currentDateTime, lang),
    dayName: formatAppWeekday(currentDateTime, lang),
    formattedDate: formatAppDate(currentDateTime, lang, "short"),
    currentTime: formatAppTime(currentDateTime, lang),
  };
};
