import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../l10n/app_localizations.dart';

class LocaleService extends ChangeNotifier {
  static const _languageKey = 'app_language';

  AppLanguage _language = AppLanguage.en;

  AppLanguage get language => _language;

  AppLocalizations get l10n => AppLocalizations(_language);

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final code = prefs.getString(_languageKey);
    if (code == 'am') {
      _language = AppLanguage.am;
    } else {
      _language = AppLanguage.en;
    }
    notifyListeners();
  }

  Future<void> toggleLanguage() async {
    _language =
        _language == AppLanguage.en ? AppLanguage.am : AppLanguage.en;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _languageKey,
      _language == AppLanguage.am ? 'am' : 'en',
    );
    notifyListeners();
  }
}
