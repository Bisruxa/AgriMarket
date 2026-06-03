import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';

class OnboardingPage extends StatelessWidget {
  final String title;
  final String description;
  final String imagePath;
  final bool isLastPage;
  final bool isLottie;

  const OnboardingPage({
    super.key,
    required this.title,
    required this.description,
    required this.imagePath,
    this.isLastPage = false,
    this.isLottie = false,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxHeight < 320;

        return Padding(
          padding: EdgeInsets.all(isCompact ? 12 : 24),
          child: Column(
            children: [
              Expanded(
                flex: 3,
                child: isLottie
                    ? Lottie.asset(
                        imagePath,
                        fit: BoxFit.contain,
                        width: double.infinity,
                      )
                    : Image.asset(
                        imagePath,
                        fit: BoxFit.contain,
                        width: double.infinity,
                      ),
              ),
              Flexible(
                flex: 2,
                child: SingleChildScrollView(
                  physics: const ClampingScrollPhysics(),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(height: isCompact ? 8 : 16),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: isCompact ? 20 : 28,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF2A5A2A),
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: isCompact ? 8 : 16),
                      Text(
                        description,
                        style: TextStyle(
                          fontSize: isCompact ? 14 : 16,
                          color: Colors.grey,
                          height: 1.5,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
