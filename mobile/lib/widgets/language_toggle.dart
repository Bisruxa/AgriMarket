import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/app_locale_scope.dart';

class LanguageToggle extends StatelessWidget {
  final bool light;

  const LanguageToggle({super.key, this.light = false});

  @override
  Widget build(BuildContext context) {
    final localeService = AppLocaleScope.serviceOf(context);
    final fg = light ? Colors.white : AppColors.textPrimary;
    final bg = light
        ? Colors.white.withValues(alpha: 0.2)
        : AppColors.surface;

    return ListenableBuilder(
      listenable: localeService,
      builder: (context, _) {
        final l10n = localeService.l10n;
        return Material(
          color: bg,
          borderRadius: BorderRadius.circular(20),
          child: InkWell(
            onTap: localeService.toggleLanguage,
            borderRadius: BorderRadius.circular(20),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.translate, size: 18, color: fg),
                  const SizedBox(width: 4),
                  Text(
                    l10n.languageLabel,
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 13,
                      color: fg,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class LanguageAppBarActions extends StatelessWidget {
  final bool light;

  const LanguageAppBarActions({super.key, this.light = false});

  @override
  Widget build(BuildContext context) {
    AppLocaleScope.serviceOf(context);
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: Center(child: LanguageToggle(light: light)),
    );
  }
}
