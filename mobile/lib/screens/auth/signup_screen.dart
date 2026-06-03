import 'package:flutter/material.dart';
import '../../models/user_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common/auth_shell.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/role_selector.dart';
import '../../widgets/app_locale_scope.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  UserRole _selectedRole = UserRole.farmer;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);

    return AuthShell(
      title: l10n.joinAgriMarket,
      subtitle: l10n.chooseRoleSubtitle,
      imagePath: 'assets/images/welcome.png',
      heroIcon: Icons.eco_rounded,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              l10n.howWillYouUse,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 6),
            Text(
              l10n.selectAccountType,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            Expanded(
              child: RoleSelector(
                selectedRole: _selectedRole,
                onRoleSelected: (role) => setState(() => _selectedRole = role),
              ),
            ),
            CustomButton(
              text: l10n.continueBtn,
              onPressed: () {
                if (_selectedRole == UserRole.farmer) {
                  Navigator.pushNamed(context, '/farmer-signup');
                } else {
                  Navigator.pushNamed(context, '/trader-signup');
                }
              },
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
                  onTap: () => Navigator.pushNamed(context, '/login'),
                  child: Text(
                    l10n.login,
                    style: const TextStyle(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
