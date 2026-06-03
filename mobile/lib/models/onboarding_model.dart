import '../l10n/app_localizations.dart';

class OnboardingPageData {
  final String title;
  final String description;
  final String imagePath;
  final bool isLastPage;
  final bool isLottie;

  OnboardingPageData({
    required this.title,
    required this.description,
    required this.imagePath,
    this.isLastPage = false,
    this.isLottie = false,
  });
}

List<OnboardingPageData> onboardingPages(AppLocalizations l10n) => [
  OnboardingPageData(
    title: l10n.onboardingWelcomeTitle,
    description: l10n.onboardingWelcomeDescription,
    imagePath: 'assets/lotties/welcome.json',
    isLottie: true,
  ),
  OnboardingPageData(
    title: l10n.onboardingAiTitle,
    description: l10n.onboardingAiDescription,
    imagePath: 'assets/lotties/Farmers.json',
    isLottie: true,
  ),
  OnboardingPageData(
    title: l10n.onboardingConnectTitle,
    description: l10n.onboardingConnectDescription,
    imagePath: 'assets/images/connect.png',
    isLastPage: true,
  ),
];