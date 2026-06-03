/**
 * Ethiopian mobile: 9 digits after stripping +251 / leading 0, must start with 7 or 9.
 * e.g. 912345678, 0712345678, +251912345678
 */
const normalizeEthiopianPhone = (phone) => {
  if (phone == null || phone === '') return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('251')) digits = digits.slice(3);
  if (digits.startsWith('0')) digits = digits.slice(1);
  return digits;
};

const isValidEthiopianPhone = (phone) => {
  const digits = normalizeEthiopianPhone(phone);
  return /^[79]\d{8}$/.test(digits);
};

const formatEthiopianPhoneForStorage = (phone) => {
  const digits = normalizeEthiopianPhone(phone);
  if (!isValidEthiopianPhone(phone)) return null;
  return `+251${digits}`;
};

const ETHIOPIAN_PHONE_MESSAGE =
  'Enter a valid Ethiopian mobile number (9 digits, starting with 7 or 9, e.g. 912345678)';

module.exports = {
  normalizeEthiopianPhone,
  isValidEthiopianPhone,
  formatEthiopianPhoneForStorage,
  ETHIOPIAN_PHONE_MESSAGE,
};
