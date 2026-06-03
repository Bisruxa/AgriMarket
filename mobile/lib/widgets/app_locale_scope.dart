import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import '../services/locale_service.dart';

class AppLocaleScope extends InheritedNotifier<LocaleService> {
  const AppLocaleScope({
    super.key,
    required LocaleService localeService,
    required super.child,
  }) : super(notifier: localeService);

  static LocaleService serviceOf(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<AppLocaleScope>();
    assert(scope != null, 'AppLocaleScope not found in widget tree');
    return scope!.notifier!;
  }

  static AppLocalizations l10nOf(BuildContext context) {
    return serviceOf(context).l10n;
  }
}
