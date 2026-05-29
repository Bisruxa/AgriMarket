import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/token_storage.dart';
import '../utils/ethiopian_phone_validator.dart';
import '../utils/password_strength.dart';
import '../widgets/common/auth_shell.dart';
import '../widgets/common/section_title.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/custom_dropdown.dart';
import '../widgets/custom_button.dart';
import '../widgets/crop_selector_field.dart';
import '../widgets/password_strength_indicator.dart';
import '../theme/app_theme.dart';

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
  final _farmSizeController = TextEditingController();

  String? _selectedExperience;
  PasswordStrength _passwordStrength = PasswordStrength.none;
  Set<String> _selectedCrops = {};
  String? _cropsError;

  final List<String> _experienceLevels = [
    'Beginner (0-2 years)',
    'Intermediate (3-5 years)',
    'Advanced (6-10 years)',
    'Expert (10+ years)',
  ];

  @override
  void initState() {
    super.initState();
    _passwordController.addListener(_onPasswordChanged);
  }

  void _onPasswordChanged() {
    setState(() {
      _passwordStrength =
          PasswordStrengthEvaluator.evaluate(_passwordController.text);
    });
  }

  Future<void> _register() async {
    final cropsError = CropSelectorField.validateSelection(_selectedCrops);
    setState(() => _cropsError = cropsError);

    if (!_formKey.currentState!.validate() || cropsError != null) return;

    final name = _nameController.text.trim();
    final crops = _selectedCrops.toList()..sort();

    await TokenStorage.saveUserName(name);
    await TokenStorage.saveRole('farmer');
    await TokenStorage.savePlantedCrops(crops);
    if (crops.isNotEmpty) {
      await TokenStorage.saveFarmSubtitle(crops.join(', '));
    }

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Registration successful! Pending approval.'),
      ),
    );
    Navigator.pushNamedAndRemoveUntil(
      context,
      '/farmer-dashboard',
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AuthShell(
      title: 'Farmer Registration',
      subtitle: 'Tell us about yourself and your farm',
      imagePath: 'assets/images/welcome.png',
      heroIcon: Icons.agriculture_rounded,
      child: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SectionTitle(
                title: 'Personal Information',
                subtitle: 'Your account details',
                icon: Icons.person_outline,
              ),
              CustomTextField(
                label: 'Full Name',
                hint: 'Enter your full name',
                controller: _nameController,
                prefixIcon: Icons.person_outline,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Full name is required';
                  }
                  return null;
                },
              ),
              CustomTextField(
                label: 'Email Address',
                hint: 'Enter your email',
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                prefixIcon: Icons.email_outlined,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Email is required';
                  }
                  if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value.trim())) {
                    return 'Enter a valid email';
                  }
                  return null;
                },
              ),
              CustomTextField(
                label: 'Phone Number',
                hint: '912345678',
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                prefixIcon: Icons.phone_outlined,
                prefixText: '+251 ',
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(9),
                ],
                validator: EthiopianPhoneValidator.validate,
              ),
              CustomTextField(
                label: 'Password',
                hint: 'Create a password',
                controller: _passwordController,
                obscureText: true,
                prefixIcon: Icons.lock_outline,
                onChanged: (_) => _onPasswordChanged(),
                validator: (value) =>
                    PasswordStrengthEvaluator.validationMessage(value ?? ''),
              ),
              if (_passwordController.text.isNotEmpty) ...[
                PasswordStrengthIndicator(strength: _passwordStrength),
                const SizedBox(height: 8),
              ],
              CustomTextField(
                label: 'Confirm Password',
                hint: 'Confirm your password',
                controller: _confirmPasswordController,
                obscureText: true,
                prefixIcon: Icons.lock_outline,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please confirm your password';
                  }
                  if (value != _passwordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              const SectionTitle(
                title: 'Farm Information',
                subtitle: 'Help us personalize recommendations',
                icon: Icons.grass_rounded,
              ),
              CustomTextField(
                label: 'Farm Size (hectares)',
                hint: 'e.g. 5.5',
                controller: _farmSizeController,
                keyboardType: TextInputType.number,
                prefixIcon: Icons.square_foot_outlined,
              ),
              CropSelectorField(
                selectedCrops: _selectedCrops,
                onSelectionChanged: (crops) {
                  setState(() {
                    _selectedCrops = Set<String>.from(crops);
                    _cropsError =
                        CropSelectorField.validateSelection(_selectedCrops);
                  });
                },
              ),
              if (_cropsError != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    _cropsError!,
                    style: const TextStyle(
                      color: AppColors.error,
                      fontSize: 12,
                    ),
                  ),
                ),
              CustomDropdown<String>(
                label: 'Farming Experience',
                value: _selectedExperience,
                items: _experienceLevels,
                itemLabel: (item) => item,
                onChanged: (value) {
                  setState(() => _selectedExperience = value);
                },
                hint: 'Select your experience level',
              ),
              const SizedBox(height: 8),
              CustomButton(
                text: 'Register as Farmer',
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
    _passwordController.removeListener(_onPasswordChanged);
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _farmSizeController.dispose();
    super.dispose();
  }
}
