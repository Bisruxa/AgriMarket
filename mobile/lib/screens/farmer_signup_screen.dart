import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/auth_session.dart';
import '../theme/app_theme.dart';
import '../widgets/common/auth_shell.dart';
import '../widgets/common/section_title.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/custom_dropdown.dart';
import '../widgets/custom_button.dart';
import '../widgets/location_picker.dart';
import '../widgets/registration_location_capture.dart';
import '../widgets/app_locale_scope.dart';

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
  final _farmLocationController = TextEditingController();
  final _farmSizeController = TextEditingController();
  final _cropsController = TextEditingController();

  String? _selectedRegion;
  String? _selectedWoreda;
  String? _selectedExperience;
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
      setState(() => _errorMessage = l10n.pleaseSelectRegion);
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
      'phone': _phoneController.text.trim(),
      'region': _selectedRegion,
      'woreda': _selectedWoreda,
      if (_latitude != null) 'latitude': _latitude,
      if (_longitude != null) 'longitude': _longitude,
      'farmSize': _farmSizeController.text.trim().isNotEmpty
          ? '${_farmSizeController.text.trim()} hectares'
          : null,
      'crops': _cropsController.text.trim(),
      'experience': _selectedExperience,
    });

    if (!mounted) return;

    if (result.success && result.raw != null) {
      await AuthSession.saveFromLoginResponse(result.raw!);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.registrationSuccessful),
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
      title: l10n.farmerRegistration,
      subtitle: l10n.farmerRegistrationSubtitle,
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
              CustomTextField(
                label: l10n.phoneNumber,
                hint: l10n.enterPhoneNumber,
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone_outlined,
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
              RegistrationLocationCapture(
                onLocationChanged: (latitude, longitude) {
                  setState(() {
                    _latitude = latitude;
                    _longitude = longitude;
                  });
                },
              ),
              SectionTitle(
                title: l10n.farmInformation,
                subtitle: l10n.personalizeRecommendations,
                icon: Icons.grass_rounded,
              ),
              CustomTextField(
                label: l10n.farmLocation,
                hint: l10n.farmLocationHint,
                controller: _farmLocationController,
                prefixIcon: Icons.map_outlined,
              ),
              CustomTextField(
                label: l10n.farmSizeHectares,
                hint: l10n.farmSizeHint,
                controller: _farmSizeController,
                keyboardType: TextInputType.number,
                prefixIcon: Icons.square_foot_outlined,
              ),
              CustomTextField(
                label: l10n.cropsYouPlant,
                hint: l10n.cropsHint,
                controller: _cropsController,
                prefixIcon: Icons.eco_outlined,
              ),
              CustomDropdown<String>(
                label: l10n.farmingExperience,
                value: _selectedExperience,
                items: l10n.experienceValues,
                itemLabel: l10n.experienceLabel,
                onChanged: (value) {
                  setState(() => _selectedExperience = value);
                },
                hint: l10n.selectExperienceLevel,
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
    _farmLocationController.dispose();
    _farmSizeController.dispose();
    _cropsController.dispose();
    super.dispose();
  }
}
