class EthiopianPhoneValidator {
  EthiopianPhoneValidator._();

  /// National mobile: 9 digits starting with 9 (e.g. 912345678).
  /// Also accepts 251 prefix or leading 0.
  static String? validate(String? input) {
    if (input == null || input.trim().isEmpty) {
      return 'Phone number is required';
    }

    final digits = input.replaceAll(RegExp(r'\D'), '');
    final national = _nationalDigits(digits);

    if (national == null) {
      return 'Use Ethiopian format: +251 then 9 digits starting with 9';
    }

    if (!RegExp(r'^9\d{8}$').hasMatch(national)) {
      return 'Number must start with 9 and be 9 digits (e.g. 912345678)';
    }

    return null;
  }

  static String? _nationalDigits(String digits) {
    if (digits.startsWith('251')) {
      final national = digits.substring(3);
      return national.length == 9 ? national : null;
    }
    if (digits.startsWith('0') && digits.length == 10) {
      return digits.substring(1);
    }
    if (digits.length == 9) {
      return digits;
    }
    return null;
  }

  /// Stored form: 2519XXXXXXXX
  static String normalize(String input) {
    final digits = input.replaceAll(RegExp(r'\D'), '');
    final national = _nationalDigits(digits);
    if (national != null) return '251$national';
    return digits;
  }
}
