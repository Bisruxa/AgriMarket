export const ETHIOPIAN_PHONE_MESSAGE =
  'Enter a valid Ethiopian mobile number (9 digits, starting with 7 or 9, e.g. 912345678)';

export function normalizeEthiopianPhone(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('251')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
}

export function isValidEthiopianPhone(phone: string): boolean {
  const digits = normalizeEthiopianPhone(phone.trim());
  return /^[79]\d{8}$/.test(digits);
}

export function formatEthiopianPhoneForStorage(phone: string): string | null {
  if (!isValidEthiopianPhone(phone)) return null;
  return `+251${normalizeEthiopianPhone(phone)}`;
}

export function validateEthiopianPhone(phone: string): string | true {
  if (!phone.trim()) return 'Phone number is required';
  return isValidEthiopianPhone(phone) || ETHIOPIAN_PHONE_MESSAGE;
}
