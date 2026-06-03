import 'package:agrimatketapp/screens/auth/login_screen.dart';
import 'package:flutter/material.dart';
import '../models/onboarding_model.dart';
import '../widgets/onboarding_page.dart';
import '../widgets/page_indicator.dart';
import '../widgets/custom_button.dart';
import '../widgets/app_locale_scope.dart';
import '../widgets/language_toggle.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  Widget build(BuildContext context) {
    final localeService = AppLocaleScope.serviceOf(context);
    final l10n = localeService.l10n;
    final pages = onboardingPages(l10n);

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 8, 24, 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const LanguageToggle(),
                  if (_currentPage < pages.length - 1)
                    TextButton(
                      onPressed: () {
                        _pageController.jumpToPage(pages.length - 1);
                      },
                      child: Text(
                        l10n.skip,
                        style: const TextStyle(
                          color: Color(0xFF2A5A2A),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (page) {
                  setState(() {
                    _currentPage = page;
                  });
                },
                itemCount: pages.length,
                itemBuilder: (context, index) {
                  final page = pages[index];
                  return OnboardingPage(
                    title: page.title,
                    description: page.description,
                    imagePath: page.imagePath,
                    isLastPage: page.isLastPage,
                    isLottie: page.isLottie,
                  );
                },
              ),
            ),
            PageIndicator(
              currentPage: _currentPage,
              totalPages: pages.length,
            ),
            const SizedBox(height: 16),
            if (_currentPage == pages.length - 1)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  children: [
                    CustomButton(
                      text: l10n.getStarted,
                      textColor: Colors.black,
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const LoginScreen(),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    CustomButton(
                      text: l10n.createAccount,
                      textColor: Colors.black,
                      onPressed: () {
                        Navigator.pushNamed(context, '/signup');
                      },
                      isOutlined: true,
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}
