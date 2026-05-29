enum PasswordStrength {
  none,
  weak,
  medium,
  strong,
}

class PasswordStrengthEvaluator {
  PasswordStrengthEvaluator._();

  static PasswordStrength evaluate(String password) {
    if (password.isEmpty) return PasswordStrength.none;

    final hasLetter = RegExp(r'[a-zA-Z]').hasMatch(password);
    final hasNumber = RegExp(r'[0-9]').hasMatch(password);
    final hasSpecial = RegExp(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;/~`]').hasMatch(
      password,
    );

    final isStrong =
        password.length >= 8 && hasLetter && hasNumber && hasSpecial;
    final isMedium = password.length >= 6 && hasLetter && hasNumber;

    if (isStrong) return PasswordStrength.strong;
    if (isMedium) return PasswordStrength.medium;
    return PasswordStrength.weak;
  }

  static bool isAcceptable(PasswordStrength strength) =>
      strength == PasswordStrength.medium || strength == PasswordStrength.strong;

  static String? validationMessage(String password) {
    final strength = evaluate(password);
    if (password.isEmpty) return 'Password is required';
    if (!isAcceptable(strength)) {
      return 'Use at least 6 characters with letters and numbers (yellow strength or higher)';
    }
    return null;
  }
}
