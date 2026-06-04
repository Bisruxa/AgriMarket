enum PasswordStrength { none, weak, medium, strong }

class PasswordStrengthEvaluator {
  PasswordStrengthEvaluator._();

  static final _letter = RegExp(r'[a-zA-Z]');
  static final _number = RegExp(r'\d');
  static final _special = RegExp(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/`~]');

  static PasswordStrength evaluate(String password) {
    if (password.isEmpty) return PasswordStrength.none;

    final hasLetter = _letter.hasMatch(password);
    final hasNumber = _number.hasMatch(password);
    final hasSpecial = _special.hasMatch(password);
    final categories = [hasLetter, hasNumber, hasSpecial].where((x) => x).length;

    if (categories >= 3) return PasswordStrength.strong;
    if (categories == 2) return PasswordStrength.medium;
    return PasswordStrength.weak;
  }

  static String label(PasswordStrength strength) {
    switch (strength) {
      case PasswordStrength.none:
        return '';
      case PasswordStrength.weak:
        return 'Weak - add letters, numbers, and symbols';
      case PasswordStrength.medium:
        return 'Fair - add a missing character type';
      case PasswordStrength.strong:
        return 'Strong password';
    }
  }

  static bool isStrong(String password) =>
      evaluate(password) == PasswordStrength.strong;
}
