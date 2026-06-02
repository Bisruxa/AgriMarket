/** Ethiopian regions and woredas for location selects (values stored in DB). */

export const ETHIOPIAN_REGIONS = [
  { value: 'addis_ababa', label: 'Addis Ababa' },
  { value: 'afar', label: 'Afar' },
  { value: 'amhara', label: 'Amhara' },
  { value: 'benishangul_gumuz', label: 'Benishangul-Gumuz' },
  { value: 'dire_dawa', label: 'Dire Dawa' },
  { value: 'gambela', label: 'Gambela' },
  { value: 'harari', label: 'Harari' },
  { value: 'oromia', label: 'Oromia' },
  { value: 'sidama', label: 'Sidama' },
  { value: 'somali', label: 'Somali' },
  { value: 'south_ethiopia', label: 'South Ethiopia Regional State' },
  { value: 'south_west', label: 'South West Ethiopia Peoples\' Region' },
  { value: 'tigray', label: 'Tigray' },
] as const;

export type RegionValue = (typeof ETHIOPIAN_REGIONS)[number]['value'];

export const WOREDAS_BY_REGION: Record<RegionValue, { value: string; label: string }[]> = {
  addis_ababa: [
    { value: 'addis_ketema', label: 'Addis Ketema' },
    { value: 'akaki_kality', label: 'Akaki Kality' },
    { value: 'arada', label: 'Arada' },
    { value: 'bole', label: 'Bole' },
    { value: 'gulele', label: 'Gulele' },
    { value: 'kirkos', label: 'Kirkos' },
    { value: 'kolfe_keranio', label: 'Kolfe Keranio' },
    { value: 'lideta', label: 'Lideta' },
    { value: 'nefas_silk', label: 'Nifas Silk-Lafto' },
    { value: 'yeka', label: 'Yeka' },
  ],
  afar: [
    { value: 'semera', label: 'Semera' },
    { value: 'asayita', label: 'Asayita' },
    { value: 'awash', label: 'Awash' },
    { value: 'dubti', label: 'Dubti' },
    { value: 'erbti', label: 'Erebti' },
    { value: 'mile', label: 'Mile' },
  ],
  amhara: [
    { value: 'bahir_dar', label: 'Bahir Dar' },
    { value: 'gondar', label: 'Gondar' },
    { value: 'dessie', label: 'Dessie' },
    { value: 'debre_markos', label: 'Debre Markos' },
    { value: 'debre_birhan', label: 'Debre Birhan' },
    { value: 'weldiya', label: 'Weldiya' },
    { value: 'kombolcha', label: 'Kombolcha' },
    { value: 'finote_selam', label: 'Finote Selam' },
  ],
  benishangul_gumuz: [
    { value: 'asosa', label: 'Asosa' },
    { value: 'bambasi', label: 'Bambasi' },
    { value: 'menge', label: 'Menge' },
    { value: 'kemashi', label: 'Kemashi' },
    { value: 'sherkole', label: 'Sherkole' },
  ],
  dire_dawa: [
    { value: 'dire_dawa_city', label: 'Dire Dawa' },
    { value: 'gurgura', label: 'Gurgura' },
    { value: 'shinile', label: 'Shinile' },
  ],
  gambela: [
    { value: 'gambela_town', label: 'Gambella' },
    { value: 'itang', label: 'Itang' },
    { value: 'abobo', label: 'Abobo' },
    { value: 'gog', label: 'Gog' },
    { value: 'jor', label: 'Jor' },
  ],
  harari: [
    { value: 'harar', label: 'Harar' },
    { value: 'dire_teyara', label: 'Dire Teyara' },
    { value: 'amir_nur', label: 'Amir Nur' },
  ],
  oromia: [
    { value: 'adama', label: 'Adama' },
    { value: 'jimma', label: 'Jimma' },
    { value: 'bishoftu', label: 'Bishoftu' },
    { value: 'shashamane', label: 'Shashamane' },
    { value: 'ambo', label: 'Ambo' },
    { value: 'nekemte', label: 'Nekemte' },
    { value: 'bale_robe', label: 'Bale Robe' },
    { value: 'assela', label: 'Assela' },
    { value: 'adaa', label: 'Adaa' },
    { value: 'bako_tibe', label: 'Bako Tibe' },
    { value: 'batu', label: 'Batu' },
  ],
  sidama: [
    { value: 'hawassa', label: 'Hawassa' },
    { value: 'yirgalem', label: 'Yirgalem' },
    { value: 'aleta_wondo', label: 'Aleta Wondo' },
    { value: 'bensa', label: 'Bensa' },
    { value: 'chuko', label: 'Chuko' },
  ],
  somali: [
    { value: 'jijiga', label: 'Jijiga' },
    { value: 'gode', label: 'Gode' },
    { value: 'kelafo', label: 'Kelafo' },
    { value: 'degehabur', label: 'Degehabur' },
    { value: 'warder', label: 'Warder' },
  ],
  south_ethiopia: [
    { value: 'arba_minch', label: 'Arba Minch' },
    { value: 'sodo', label: 'Sodo' },
    { value: 'dilla', label: 'Dilla' },
    { value: 'hossana', label: 'Hossana' },
    { value: 'wolaita_sodo', label: 'Wolaita Sodo' },
    { value: 'jinka', label: 'Jinka' },
  ],
  south_west: [
    { value: 'bonga', label: 'Bonga' },
    { value: 'mizan_aman', label: 'Mizan Aman' },
    { value: 'tepi', label: 'Tepi' },
    { value: 'bench_maji', label: 'Bench Maji' },
    { value: 'maji', label: 'Maji' },
  ],
  tigray: [
    { value: 'mekelle', label: 'Mekelle' },
    { value: 'adigrat', label: 'Adigrat' },
    { value: 'axum', label: 'Axum' },
    { value: 'shire', label: 'Shire' },
    { value: 'adwa', label: 'Adwa' },
    { value: 'humera', label: 'Humera' },
  ],
};

/** All region keys that have at least one woreda */
export function getWoredasForRegionKey(region: string): { value: string; label: string }[] {
  if (!region) return [];
  return WOREDAS_BY_REGION[region as RegionValue] ?? [];
}
