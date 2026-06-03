import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/password_strength.dart';

class PasswordFieldWithStrength extends StatefulWidget {
  final String label;
  final String hint;
  final TextEditingController controller;
  final String? Function(String?)? validator;
  final bool showStrength;

  const PasswordFieldWithStrength({
    super.key,
    required this.label,
    required this.hint,
    required this.controller,
    this.validator,
    this.showStrength = true,
  });

  @override
  State<PasswordFieldWithStrength> createState() =>
      _PasswordFieldWithStrengthState();
}

class _PasswordFieldWithStrengthState extends State<PasswordFieldWithStrength> {
  bool _obscure = true;
  PasswordStrength _strength = PasswordStrength.none;

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onPasswordChanged);
    _strength = PasswordStrengthEvaluator.evaluate(widget.controller.text);
  }

  @override
  void dispose() {
    widget.controller.removeListener(_onPasswordChanged);
    super.dispose();
  }

  void _onPasswordChanged() {
    final next = PasswordStrengthEvaluator.evaluate(widget.controller.text);
    if (next != _strength) {
      setState(() => _strength = next);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            widget.label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          TextFormField(
            controller: widget.controller,
            obscureText: _obscure,
            validator: widget.validator,
            decoration: InputDecoration(
              hintText: widget.hint,
              prefixIcon: const Icon(Icons.lock_outline, size: 20, color: AppColors.primary),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  size: 20,
                ),
                onPressed: () => setState(() => _obscure = !_obscure),
              ),
            ),
          ),
          if (widget.showStrength) ...[
            const SizedBox(height: 8),
            _StrengthBars(strength: _strength),
            if (_strength != PasswordStrength.none) ...[
              const SizedBox(height: 6),
              Text(
                PasswordStrengthEvaluator.label(_strength),
                style: TextStyle(
                  fontSize: 11,
                  color: _StrengthBars.labelColor(_strength),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ],
        ],
      ),
    );
  }
}

class _StrengthBars extends StatelessWidget {
  final PasswordStrength strength;

  const _StrengthBars({required this.strength});

  static Color labelColor(PasswordStrength strength) {
    switch (strength) {
      case PasswordStrength.strong:
        return Colors.green.shade700;
      case PasswordStrength.medium:
        return Colors.amber.shade800;
      case PasswordStrength.weak:
        return AppColors.error;
      case PasswordStrength.none:
        return AppColors.textSecondary;
    }
  }

  Color _barColor(int index) {
    switch (strength) {
      case PasswordStrength.none:
        return AppColors.border;
      case PasswordStrength.weak:
        return index == 0 ? AppColors.error : AppColors.border;
      case PasswordStrength.medium:
        return index <= 1 ? Colors.amber.shade600 : AppColors.border;
      case PasswordStrength.strong:
        return Colors.green.shade600;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(3, (index) {
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(right: index < 2 ? 6 : 0),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 4,
              decoration: BoxDecoration(
                color: _barColor(index),
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
        );
      }),
    );
  }
}
