import 'package:flutter/material.dart';

import '../../models/profile_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/logout_helper.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../../widgets/profile_details_card.dart';
import '../../widgets/app_locale_scope.dart';
import '../../widgets/language_toggle.dart';
import 'crop_recommendation.dart';
import 'farms_screen.dart';
import 'price_forecast_screen.dart';
import '../../utils/ethiopian_phone.dart';

class FarmerProfileScreen extends StatefulWidget {
  const FarmerProfileScreen({super.key});

  @override
  State<FarmerProfileScreen> createState() => _FarmerProfileScreenState();
}

class _FarmerProfileScreenState extends State<FarmerProfileScreen>
    with SingleTickerProviderStateMixin {
  final _api = ApiService();
  final _nameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _currentPasswordController = TextEditingController();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _profileFormKey = GlobalKey<FormState>();
  final _passwordFormKey = GlobalKey<FormState>();

  late final TabController _tabController;

  UserProfile? _profile;
  bool _isLoading = true;
  bool _isSavingProfile = false;
  bool _isSavingPassword = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadProfile();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _nameController.dispose();
    _phoneController.dispose();
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    final profile = await _api.getProfile();
    if (!mounted) return;
    setState(() {
      _profile = profile;
      _isLoading = false;
    });
    if (profile != null) {
      _nameController.text = profile.name;
      _phoneController.text = EthiopianPhone.displayLocal(profile.phone);
    }
  }

  Future<void> _saveProfile() async {
    if (!_profileFormKey.currentState!.validate()) return;

    setState(() => _isSavingProfile = true);
    final result = await _api.updateProfile({
      'name': _nameController.text.trim(),
      'phone': EthiopianPhone.formatForStorage(_phoneController.text) ??
          _phoneController.text.trim(),
    });
    if (!mounted) return;
    setState(() => _isSavingProfile = false);

    if (result.success) {
      setState(() => _profile = result.profile ?? _profile);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message ?? 'Profile updated'),
          backgroundColor: AppColors.primary,
        ),
      );
      if (result.profile != null) {
        Navigator.pop(context, true);
      }
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message ?? 'Failed to update profile'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  Future<void> _changePassword() async {
    if (!_passwordFormKey.currentState!.validate()) return;

    setState(() => _isSavingPassword = true);
    final result = await _api.updatePassword(
      currentPassword: _currentPasswordController.text,
      newPassword: _newPasswordController.text,
    );
    if (!mounted) return;
    setState(() => _isSavingPassword = false);

    if (result.success) {
      _currentPasswordController.clear();
      _newPasswordController.clear();
      _confirmPasswordController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message ?? 'Password updated'),
          backgroundColor: AppColors.primary,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message ?? 'Failed to update password'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);

    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(l10n.profile),
        backgroundColor: AppColors.surface,
        elevation: 0,
        foregroundColor: AppColors.textPrimary,
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 8),
            child: LanguageToggle(),
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: [
            Tab(text: l10n.account),
            Tab(text: l10n.password),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : _profile == null
              ? _buildErrorState()
              : TabBarView(
                  controller: _tabController,
                  children: [
                    _buildAccountTab(),
                    _buildPasswordTab(),
                  ],
                ),
    );
  }

  Widget _buildErrorState() {
    final l10n = AppLocaleScope.l10nOf(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.textSecondary),
            const SizedBox(height: 16),
            Text(
              l10n.couldNotLoadProfile,
              style: Theme.of(context).textTheme.titleMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            CustomButton(
              text: l10n.tryAgain,
              onPressed: _loadProfile,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAccountTab() {
    final l10n = AppLocaleScope.l10nOf(context);
    final profile = _profile!;

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: _loadProfile,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        children: [
          Center(
            child: CircleAvatar(
              radius: 44,
              backgroundColor: AppColors.primary.withValues(alpha: 0.1),
              backgroundImage:
                  profile.avatarUrl != null ? NetworkImage(profile.avatarUrl!) : null,
              child: profile.avatarUrl == null
                  ? const Icon(Icons.person_rounded, size: 44, color: AppColors.primary)
                  : null,
            ),
          ),
          const SizedBox(height: 12),
          Center(
            child: Text(
              profile.name,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 20),
            ),
          ),
          if (profile.displaySubtitle.isNotEmpty) ...[
            const SizedBox(height: 4),
            Center(
              child: Text(
                profile.displaySubtitle,
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                profile.role.toUpperCase(),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 24),
          ProfileDetailsCard(profile: profile),
          const SizedBox(height: 24),
          Text(
            l10n.editDetails,
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 12),
          Form(
            key: _profileFormKey,
            child: Column(
              children: [
                CustomTextField(
                  label: l10n.fullName,
                  hint: l10n.fullName,
                  controller: _nameController,
                  prefixIcon: Icons.person_outline_rounded,
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Name is required';
                    }
                    return null;
                  },
                ),
                CustomTextField(
                  label: 'Phone number',
                  hint: '912345678',
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  prefixIcon: Icons.phone_outlined,
                  validator: (v) => EthiopianPhone.validate(v, required: false),
                ),
                const SizedBox(height: 8),
                CustomButton(
                  text: l10n.saveChanges,
                  isLoading: _isSavingProfile,
                  onPressed: _saveProfile,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPasswordTab() {
    final l10n = AppLocaleScope.l10nOf(context);

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.lock_outline_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      l10n.password,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '••••••••',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            letterSpacing: 2,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Text(
          l10n.updatePasswordHint,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: AppColors.textSecondary,
              ),
        ),
        const SizedBox(height: 20),
        Form(
          key: _passwordFormKey,
          child: Column(
            children: [
              CustomTextField(
                label: l10n.currentPassword,
                hint: l10n.currentPassword,
                controller: _currentPasswordController,
                obscureText: true,
                prefixIcon: Icons.lock_outline_rounded,
                validator: (v) {
                  if (v == null || v.isEmpty) {
                    return 'Current password is required';
                  }
                  return null;
                },
              ),
              CustomTextField(
                label: l10n.newPassword,
                hint: l10n.newPassword,
                controller: _newPasswordController,
                obscureText: true,
                prefixIcon: Icons.lock_rounded,
                validator: (v) {
                  if (v == null || v.length < 6) {
                    return 'Password must be at least 6 characters';
                  }
                  return null;
                },
              ),
              CustomTextField(
                label: l10n.confirmNewPassword,
                hint: l10n.confirmNewPassword,
                controller: _confirmPasswordController,
                obscureText: true,
                prefixIcon: Icons.lock_rounded,
                validator: (v) {
                  if (v != _newPasswordController.text) {
                    return 'Passwords do not match';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 8),
              CustomButton(
                text: l10n.updatePassword,
                isLoading: _isSavingPassword,
                onPressed: _changePassword,
              ),
              const SizedBox(height: 24),
              ListTile(
                leading: const Icon(Icons.agriculture_rounded, color: AppColors.primary),
                title: Text(l10n.myFarms),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FarmsScreen()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.eco_rounded, color: AppColors.primary),
                title: Text(l10n.cropRecommendation),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const CropRecommendation()),
                  );
                },
              ),
              ListTile(
                leading: const Icon(Icons.trending_up_rounded, color: AppColors.primary),
                title: const Text('Price forecast'),
                trailing: const Icon(Icons.chevron_right_rounded),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => PriceForecastScreen(
                        defaultRegion: _profile?.region,
                      ),
                    ),
                  );
                },
              ),
              const Divider(),
              ListTile(
                leading: const Icon(Icons.delete_forever_rounded, color: Colors.red),
                title: Text(l10n.deleteAccount, style: const TextStyle(color: Colors.red)),
                onTap: _confirmDeleteAccount,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Future<void> _confirmDeleteAccount() async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete account?'),
        content: const Text(
          'Your profile and data will be removed. This cannot be undone.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;

    final result = await _api.deleteMyAccount();
    if (!mounted) return;
    if (result.success) {
      await logoutAndRedirect(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message ?? 'Failed to delete account'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }
}
