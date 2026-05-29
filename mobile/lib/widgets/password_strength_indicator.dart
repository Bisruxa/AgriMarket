import 'package:flutter/material.dart';
import '../utils/password_strength.dart';

class PasswordStrengthIndicator extends StatelessWidget {
  final PasswordStrength strength;

  const PasswordStrengthIndicator({super.key, required this.strength});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: List.generate(3, (index) {
            final isActive = _isBarActive(index);
            return Expanded(
              child: Padding(
                padding: EdgeInsets.only(left: index == 0 ? 0 : 6),
                child: _StrengthBar(
                  color: _barColor(index),
                  isActive: isActive,
                ),
              ),
            );
          }),
        ),
        const SizedBox(height: 6),
        Text(
          _hintText,
          style: TextStyle(
            fontSize: 12,
            color: _hintColor,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  bool _isBarActive(int index) {
    switch (strength) {
      case PasswordStrength.none:
        return false;
      case PasswordStrength.weak:
        return index == 0;
      case PasswordStrength.medium:
        return index <= 1;
      case PasswordStrength.strong:
        return true;
    }
  }

  Color _barColor(int index) {
    switch (strength) {
      case PasswordStrength.weak:
        return Colors.red;
      case PasswordStrength.medium:
        return Colors.amber.shade700;
      case PasswordStrength.strong:
        return Colors.green;
      case PasswordStrength.none:
        return Colors.grey.shade300;
    }
  }

  Color get _hintColor {
    switch (strength) {
      case PasswordStrength.weak:
        return Colors.red.shade700;
      case PasswordStrength.medium:
        return Colors.amber.shade800;
      case PasswordStrength.strong:
        return Colors.green.shade700;
      case PasswordStrength.none:
        return Colors.grey.shade600;
    }
  }

  String get _hintText {
    switch (strength) {
      case PasswordStrength.none:
        return 'Use letters, numbers, and a special character for a strong password';
      case PasswordStrength.weak:
        return 'Weak — add letters and numbers (6+ characters)';
      case PasswordStrength.medium:
        return 'Good — you can register with this password';
      case PasswordStrength.strong:
        return 'Strong password';
    }
  }
}

class _StrengthBar extends StatelessWidget {
  final Color color;
  final bool isActive;

  const _StrengthBar({required this.color, required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 4,
        decoration: BoxDecoration(
          color: isActive ? color : Colors.grey.shade300,
          borderRadius: BorderRadius.circular(2),
        ),
      ),
    );
  }
}
