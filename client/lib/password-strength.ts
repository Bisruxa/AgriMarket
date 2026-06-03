export type PasswordStrength = 'none' | 'weak' | 'medium' | 'strong';

export const PASSWORD_STRONG_MESSAGE =
  'Use letters, numbers, and a special character';

const LETTER = /[a-zA-Z]/;
const NUMBER = /\d/;
const SPECIAL = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\;/`~]/;

export function evaluatePasswordStrength(password: string): PasswordStrength {
  if (!password) return 'none';

  const hasLetter = LETTER.test(password);
  const hasNumber = NUMBER.test(password);
  const hasSpecial = SPECIAL.test(password);
  const categories = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length;

  if (categories >= 3) return 'strong';
  if (categories === 2) return 'medium';
  return 'weak';
}

export function passwordStrengthLabel(strength: PasswordStrength): string {
  switch (strength) {
    case 'none':
      return '';
    case 'weak':
      return 'Weak — add letters, numbers, and symbols';
    case 'medium':
      return 'Fair — add a missing character type';
    case 'strong':
      return 'Strong password';
  }
}

export function isStrongPassword(password: string): boolean {
  return evaluatePasswordStrength(password) === 'strong';
}

export function validatePasswordStrength(value: string): string | true {
  if (!value.trim()) return 'Password is required';
  return isStrongPassword(value) || PASSWORD_STRONG_MESSAGE;
}
