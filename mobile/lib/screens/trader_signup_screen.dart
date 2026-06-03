import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/common/auth_shell.dart';
import '../widgets/common/section_title.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/custom_button.dart';
import '../widgets/location_picker.dart';
import '../utils/ethiopian_phone.dart';
import '../widgets/registration_location_capture.dart';
import '../widgets/app_locale_scope.dart';

class TraderSignupScreen extends StatefulWidget {
  const TraderSignupScreen({super.key});

  @override
  State<TraderSignupScreen> createState() => _TraderSignupScreenState();
}

class _TraderSignupScreenState extends State<TraderSignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _tinNumberController = TextEditingController();

  String? _selectedRegion;
  String? _selectedWoreda;
  bool _isLoading = false;
  String? _errorMessage;
  double? _latitude;
  double? _longitude;

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

    final formattedPhone = EthiopianPhone.formatForStorage(_phoneController.text);
    if (formattedPhone == null) {
      setState(() => _errorMessage = EthiopianPhone.message);
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
      'role': 'TRADER',
      'phone': formattedPhone,
      'region': _selectedRegion,
      'woreda': _selectedWoreda,
      if (_latitude != null) 'latitude': _latitude,
      if (_longitude != null) 'longitude': _longitude,
    });

    if (!mounted) return;

    if (result.success) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            result.message ??
                'Registration submitted! Verify your email, then wait for admin approval.',
          ),
          backgroundColor: AppColors.traderAccent,
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
      title: l10n.traderRegistration,
      subtitle: l10n.traderRegistrationSubtitle,
      heroGradient: AppColors.traderGradient,
      heroIcon: Icons.storefront_rounded,
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
                const SizedBox(height: 16),
              ],
              SectionTitle(
                title: l10n.businessInformation,
                subtitle: l10n.businessInformationSubtitle,
                icon: Icons.business_outlined,
              ),
              CustomTextField(
                label: l10n.fullNameBusinessName,
                hint: l10n.enterBusinessName,
                controller: _nameController,
                prefixIcon: Icons.business_outlined,
              ),
              CustomTextField(
                label: l10n.emailAddress,
                hint: l10n.enterEmailAddress,
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
              ),
              CustomTextField(
                label: 'Phone Number',
                hint: '912345678',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone_outlined,
                validator: (v) => EthiopianPhone.validate(v),
              ),
              CustomTextField(
                label: l10n.tinNumber,
                hint: l10n.tinNumberHint,
                controller: _tinNumberController,
                keyboardType: TextInputType.number,
                prefixIcon: Icons.numbers_outlined,
              ),
              SectionTitle(
                title: l10n.businessLocation,
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
              RegistrationLocationCapture(
                onLocationChanged: (latitude, longitude) {
                  setState(() {
                    _latitude = latitude;
                    _longitude = longitude;
                  });
                },
              ),
              SectionTitle(
                title: l10n.accountSecurity,
                icon: Icons.shield_outlined,
              ),
              CustomTextField(
                label: l10n.password,
                hint: l10n.createPassword,
                controller: _passwordController,
                obscureText: true,
                prefixIcon: Icons.lock_outline,
              ),
              CustomTextField(
                label: l10n.confirmPassword,
                hint: l10n.confirmYourPassword,
                controller: _confirmPasswordController,
                obscureText: true,
                prefixIcon: Icons.lock_outline,
              ),
              Container(
                padding: const EdgeInsets.all(16),
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: AppColors.traderAccent.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: AppColors.traderAccent.withValues(alpha: 0.25),
                  ),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.verified_user_outlined,
                      color: AppColors.traderAccent.withValues(alpha: 0.9),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.approvalRequired,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: AppColors.traderAccent.withValues(alpha: 0.95),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            l10n.approvalRequiredDesc,
                            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  fontSize: 12,
                                ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              CustomButton(
                text: l10n.registerAsTrader,
                backgroundColor: AppColors.traderAccent,
                isLoading: _isLoading,
                onPressed: _register,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    l10n.alreadyHaveAccount,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  GestureDetector(
                    onTap: () =>
                        Navigator.pushReplacementNamed(context, '/login'),
                    child: Text(
                      l10n.login,
                      style: const TextStyle(
                        color: AppColors.traderAccent,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
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
    _tinNumberController.dispose();
    super.dispose();
  }
}
