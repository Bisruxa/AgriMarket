import { useEffect, useState } from "react";

export const useCurrentDateTime = () => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (): string => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return currentDateTime.toLocaleDateString('en-US', options);
  };

  const getDayName = (): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
    return currentDateTime.toLocaleDateString('en-US', options);
  };

  const getFormattedDate = (): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return currentDateTime.toLocaleDateString('en-US', options);
  };

  const getCurrentTime = (): string => {
    const options: Intl.DateTimeFormatOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    };
    return currentDateTime.toLocaleTimeString('en-US', options);
  };

  return {
    currentDateTime,
    formatDate: formatDate(),
    dayName: getDayName(),
    formattedDate: getFormattedDate(),
    currentTime: getCurrentTime()
  };
};