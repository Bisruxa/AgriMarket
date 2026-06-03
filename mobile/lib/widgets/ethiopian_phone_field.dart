import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../theme/app_theme.dart';
import '../utils/ethiopian_phone.dart';

/// Signup phone input: fixed +251 prefix, 9 digits starting with 9.
class EthiopianPhoneField extends StatelessWidget {
  final TextEditingController controller;
  final String? label;

  const EthiopianPhoneField({
    super.key,
    required this.controller,
    this.label = 'Phone Number',
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (label != null) ...[
            Text(
              label!,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
          ],
          TextFormField(
            controller: controller,
            keyboardType: TextInputType.phone,
            maxLength: 9,
            inputFormatters: const [_EthiopianSignupPhoneFormatter()],
            validator: (v) => EthiopianPhone.validateSignup(v),
            decoration: const InputDecoration(
              counterText: '',
              hintText: '912345678',
              prefixIcon: Icon(Icons.phone_outlined, size: 20, color: AppColors.primary),
              prefixText: '+251 ',
              prefixStyle: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.only(left: 4, top: 2),
            child: Text(
              '9 digits starting with 9',
              style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

class _EthiopianSignupPhoneFormatter extends TextInputFormatter {
  const _EthiopianSignupPhoneFormatter();

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    var digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.length > 9) {
      digits = digits.substring(0, 9);
    }
    if (digits.isNotEmpty && !digits.startsWith('9')) {
      return oldValue;
    }
    return TextEditingValue(
      text: digits,
      selection: TextSelection.collapsed(offset: digits.length),
    );
  }
}
