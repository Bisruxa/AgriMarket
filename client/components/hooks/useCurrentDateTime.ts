import { useEffect, useState } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

export const useCurrentDateTime = () => {
  const { language } = useLanguage();
  const locale = language === "am" ? "am-ET" : "en-US";
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return currentDateTime.toLocaleDateString(locale, options);
  };

  const getDayName = (): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long" };
    return currentDateTime.toLocaleDateString(locale, options);
  };

  const getFormattedDate = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return currentDateTime.toLocaleDateString(locale, options);
  };

  const getCurrentTime = (): string => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hour12: language !== "am",
    };
    return currentDateTime.toLocaleTimeString(locale, options);
  };

  return {
    currentDateTime,
    formatDate: formatDate(),
    dayName: getDayName(),
    formattedDate: getFormattedDate(),
    currentTime: getCurrentTime(),
  };
};
