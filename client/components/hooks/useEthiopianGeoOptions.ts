'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import { ETHIOPIAN_REGIONS, getWoredasForRegionKey } from '@/lib/regon_n_woreda';
import { REGION_LABELS_AM, WOREDA_LABELS_AM } from '@/lib/geoLabels.am';

export function useEthiopianGeoOptions() {
  const { language } = useLanguage();
  const isAm = language === 'am';

  const regions = useMemo(
    () =>
      ETHIOPIAN_REGIONS.map((r) => ({
        value: r.value,
        label: isAm ? REGION_LABELS_AM[r.value] ?? r.label : r.label,
      })),
    [isAm]
  );

  const getWoredasForRegion = (regionValue: string) => {
    const list = getWoredasForRegionKey(regionValue);
    return list.map((w) => ({
      value: w.value,
      label: isAm ? WOREDA_LABELS_AM[w.value] ?? w.label : w.label,
    }));
  };

  const labelForRegion = (value: string | undefined | null) => {
    if (!value) return '';
    const en = ETHIOPIAN_REGIONS.find((r) => r.value === value)?.label ?? value;
    return isAm ? REGION_LABELS_AM[value] ?? en : en;
  };

  const labelForWoreda = (value: string | undefined | null) => {
    if (!value) return '';
    if (isAm && WOREDA_LABELS_AM[value]) return WOREDA_LABELS_AM[value];
    for (const region of ETHIOPIAN_REGIONS) {
      const match = getWoredasForRegionKey(region.value).find((w) => w.value === value);
      if (match) return isAm ? WOREDA_LABELS_AM[value] ?? match.label : match.label;
    }
    return value;
  };

  return { regions, getWoredasForRegion, labelForRegion, labelForWoreda };
}
