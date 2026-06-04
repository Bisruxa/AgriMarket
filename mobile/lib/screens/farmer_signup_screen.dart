import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/common/auth_shell.dart';
import '../widgets/common/section_title.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/custom_button.dart';
import '../widgets/ethiopian_phone_field.dart';
import '../widgets/password_field_with_strength.dart';
import '../widgets/location_picker.dart';
import '../widgets/app_locale_scope.dart';
import '../utils/ethiopian_phone.dart';
import '../utils/password_strength.dart';

class FarmerSignupScreen extends StatefulWidget {
  const FarmerSignupScreen({super.key});

  @override
  State<FarmerSignupScreen> createState() => _FarmerSignupScreenState();
}

class _FarmerSignupScreenState extends State<FarmerSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _selectedRegion;
  String? _selectedWoreda;
  bool _isLoading = false;
  bool _isResending = false;
  String? _errorMessage;

  Future<void> _resendVerificationEmail() async {
    final email = _emailController.text.trim();
    if (!email.contains('@')) {
      setState(() => _errorMessage = 'Enter your email, then tap resend verification.');
      return;
    }

    setState(() => _isResending = true);
    final result = await ApiService().resendVerification(email);
    if (!mounted) return;
    setState(() => _isResending = false);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result.message ??
              (result.success
                  ? 'Verification email sent. Please check your inbox.'
                  : 'Unable to resend verification email right now.'),
        ),
        backgroundColor: result.success ? AppColors.primary : AppColors.error,
      ),
    );

    if (result.success) {
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  Future<void> _register() async {
    final l10n = AppLocaleScope.l10nOf(context);
    if (!_formKey.currentState!.validate()) return;

    if (_passwordController.text != _confirmPasswordController.text) {
      setState(() => _errorMessage = l10n.passwordsDoNotMatch);
      return;
    }

    if (_selectedRegion == null || _selectedRegion!.isEmpty) {
      setState(() => _errorMessage = 'Please select your region');
      return;
    }

    final formattedPhone = EthiopianPhone.formatSignupForStorage(_phoneController.text);
    if (formattedPhone == null) {
      setState(() => _errorMessage = EthiopianPhone.signupMessage);
      return;
    }

    if (!PasswordStrengthEvaluator.isStrong(_passwordController.text)) {
      setState(() => _errorMessage =
          'Choose a strong password with letters, numbers, and a special character.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final result = await ApiService().register({
      'name': _nameController.text.trim(),
      'email': _emailController.text.trim(),
      'password': _passwordController.text,
      'role': 'FARMER',
      'phone': formattedPhone,
      'region': _selectedRegion,
      'woreda': _selectedWoreda,
    });

    if (!mounted) return;

    if (result.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.message ??
                'Registration successful! Check your email to verify your account.',
          ),
          backgroundColor: AppColors.primary,
        ),
      );
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    setState(() {
      _isLoading = false;
      _errorMessage = result.message ?? l10n.registrationFailed;
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);

    return AuthShell(
      title: 'Farmer Registration',
      subtitle: 'Create your account - you can add farms later from the dashboard',
      imagePath: 'assets/images/welcome.png',
      heroIcon: Icons.agriculture_rounded,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: AppColors.error, fontSize: 13),
                  ),
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    onPressed: (_isLoading || _isResending)
                        ? null
                        : _resendVerificationEmail,
                    icon: _isResending
                        ? const SizedBox(
                            width: 14,
                            height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.mark_email_unread_outlined, size: 18),
                    label: const Text('Resend verification email'),
                  ),
                ),
                const SizedBox(height: 16),
              ],
              SectionTitle(
                title: l10n.personalInformation,
                subtitle: l10n.accountDetails,
                icon: Icons.person_outline,
              ),
              CustomTextField(
                label: l10n.fullName,
                hint: l10n.enterFullName,
                controller: _nameController,
                prefixIcon: Icons.person_outline,
              ),
              CustomTextField(
                label: l10n.emailAddress,
                hint: l10n.enterEmailAddress,
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
              ),
              EthiopianPhoneField(controller: _phoneController),
              PasswordFieldWithStrength(
                label: l10n.password,
                hint: l10n.createPassword,
                controller: _passwordController,
                validator: (v) {
                  if (v == null || v.isEmpty) return 'Password is required';
                  if (!PasswordStrengthEvaluator.isStrong(v)) {
                    return 'Use letters, numbers, and a special character';
                  }
                  return null;
                },
              ),
              CustomTextField(
                label: l10n.confirmPassword,
                hint: l10n.confirmYourPassword,
                controller: _confirmPasswordController,
                obscureText: true,
                prefixIcon: Icons.lock_outline,
              ),
              SectionTitle(
                title: l10n.yourLocation,
                subtitle: l10n.regionWoreda,
                icon: Icons.location_on_outlined,
              ),
              LocationPicker(
                selectedRegion: _selectedRegion,
                selectedWoreda: _selectedWoreda,
                onRegionChanged: (value) {
                  setState(() {
                    _selectedRegion = value;
                    _selectedWoreda = null;
                  });
                },
                onWoredaChanged: (value) {
                  setState(() => _selectedWoreda = value);
                },
              ),
              const SizedBox(height: 8),
              CustomButton(
                text: l10n.registerAsFarmer,
                isLoading: _isLoading,
                onPressed: _register,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }
}
