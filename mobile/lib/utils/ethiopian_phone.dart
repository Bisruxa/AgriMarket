/// Ethiopian mobile: 9 digits, starts with 7 or 9 (after optional +251 / leading 0).
class EthiopianPhone {
  EthiopianPhone._();

  static const message =
      'Enter a valid Ethiopian number (9 digits, starting with 7 or 9, e.g. 912345678)';

  static const signupMessage =
      'Enter 9 digits starting with 9 (e.g. 912345678)';

  static String normalize(String phone) {
    var digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('251')) digits = digits.substring(3);
    if (digits.startsWith('0')) digits = digits.substring(1);
    return digits;
  }

  static bool isValid(String phone) {
    final digits = normalize(phone);
    return RegExp(r'^[79]\d{8}$').hasMatch(digits);
  }

  static bool isValidSignupInput(String phone) {
    final digits = normalize(phone);
    return RegExp(r'^9\d{8}$').hasMatch(digits);
  }

  static String? formatSignupForStorage(String phone) {
    if (!isValidSignupInput(phone)) return null;
    return '+251${normalize(phone)}';
  }

  static String? validateSignup(String? phone, {bool required = true}) {
    if (phone == null || phone.trim().isEmpty) {
      return required ? 'Phone number is required' : null;
    }
    return isValidSignupInput(phone) ? null : signupMessage;
  }

  static String? formatForStorage(String phone) {
    if (!isValid(phone)) return null;
    return '+251${normalize(phone)}';
  }

  static String? validate(String? phone, {bool required = true}) {
    if (phone == null || phone.trim().isEmpty) {
      return required ? 'Phone number is required' : null;
    }
    return isValid(phone) ? null : message;
  }

  /// Strip +251 for display in input fields.
  static String displayLocal(String? stored) {
    if (stored == null || stored.isEmpty) return '';
    return normalize(stored);
  }
}
