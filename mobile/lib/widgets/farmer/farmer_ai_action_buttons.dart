import 'package:flutter/material.dart';

import '../../theme/app_theme.dart';

/// Quick access to AgriAI crop recommendation and price forecast tools.
class FarmerAiActionButtons extends StatelessWidget {
  final VoidCallback onCropRecommend;
  final VoidCallback onPriceForecast;

  const FarmerAiActionButtons({
    super.key,
    required this.onCropRecommend,
    required this.onPriceForecast,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _AiActionTile(
            icon: Icons.eco_rounded,
            title: 'Crop recommendation',
            subtitle: 'Best crops for your farm',
            onTap: onCropRecommend,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _AiActionTile(
            icon: Icons.trending_up_rounded,
            title: 'Price forecast',
            subtitle: 'Predict market prices',
            onTap: onPriceForecast,
          ),
        ),
      ],
    );
  }
}

class _AiActionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _AiActionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Ink(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.primary.withValues(alpha: 0.06),
                Colors.white,
              ],
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 14, 12, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(icon, size: 22, color: AppColors.primary),
                ),
                const SizedBox(height: 10),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                    height: 1.25,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 11,
                    color: AppColors.textSecondary,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
