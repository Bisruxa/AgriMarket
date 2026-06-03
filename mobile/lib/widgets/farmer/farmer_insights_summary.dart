import 'package:flutter/material.dart';

import '../../constants/app_assets.dart';
import '../../models/agriai_model.dart';
import '../../theme/app_theme.dart';

/// Compact home summary: top crop recommendation + next-month price forecast.
class FarmerInsightsSummaryCard extends StatelessWidget {
  final bool isLoading;
  final String? recommendedCrop;
  final double? recommendConfidencePercent;
  final CropPriceForecast? forecast;
  final String? errorMessage;
  final VoidCallback? onViewDetails;

  const FarmerInsightsSummaryCard({
    super.key,
    this.isLoading = false,
    this.recommendedCrop,
    this.recommendConfidencePercent,
    this.forecast,
    this.errorMessage,
    this.onViewDetails,
  });

  static const _months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  String _monthLabel(int month) =>
      month >= 1 && month <= 12 ? _months[month - 1] : '';

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 8, 10),
            child: Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.asset(
                    AppAssets.insights,
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(
                      Icons.insights_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Crop & price insights',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontSize: 17,
                            ),
                      ),
                      Text(
                        'AI recommendation for your region',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
                if (onViewDetails != null)
                  TextButton(
                    onPressed: onViewDetails,
                    child: const Text('Details'),
                  ),
              ],
            ),
          ),
          const Divider(height: 1),
          if (isLoading)
            const Padding(
              padding: EdgeInsets.all(28),
              child: Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
            )
          else if (errorMessage != null &&
              recommendedCrop == null &&
              forecast == null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(
                errorMessage!,
                style: const TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.4,
                ),
              ),
            )
          else
            IntrinsicHeight(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Expanded(child: _RecommendPanel(
                    crop: recommendedCrop,
                    confidencePercent: recommendConfidencePercent,
                  )),
                  VerticalDivider(
                    width: 1,
                    thickness: 1,
                    color: AppColors.border.withValues(alpha: 0.8),
                  ),
                  Expanded(child: _ForecastPanel(
                    forecast: forecast,
                    monthLabel: forecast != null
                        ? _monthLabel(forecast!.month)
                        : '',
                  )),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _RecommendPanel extends StatelessWidget {
  final String? crop;
  final double? confidencePercent;

  const _RecommendPanel({this.crop, this.confidencePercent});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 14, 10, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.eco_rounded,
                size: 18,
                color: AppColors.primary.withValues(alpha: 0.85),
              ),
              const SizedBox(width: 6),
              const Text(
                'Recommend',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            crop ?? '—',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
              height: 1.2,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            confidencePercent != null
                ? '${confidencePercent!.round()}% suitability'
                : 'Run AgriAI for a match',
            style: const TextStyle(
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _ForecastPanel extends StatelessWidget {
  final CropPriceForecast? forecast;
  final String monthLabel;

  const _ForecastPanel({this.forecast, required this.monthLabel});

  @override
  Widget build(BuildContext context) {
    final trendUp = forecast != null &&
        (forecast!.trend.toLowerCase().contains('up') ||
            forecast!.trendPercentage > 0);
    final trendDown = forecast != null &&
        (forecast!.trend.toLowerCase().contains('down') ||
            forecast!.trendPercentage < 0);

    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 14, 14, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.trending_up_rounded,
                size: 18,
                color: AppColors.primary.withValues(alpha: 0.85),
              ),
              const SizedBox(width: 6),
              const Text(
                'Price forecast',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          if (forecast != null) ...[
            Text(
              'ETB ${forecast!.predictedPrice.toStringAsFixed(0)}',
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              forecast!.cropName,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                Icon(
                  trendUp
                      ? Icons.arrow_upward_rounded
                      : trendDown
                          ? Icons.arrow_downward_rounded
                          : Icons.remove_rounded,
                  size: 16,
                  color: trendUp
                      ? Colors.green.shade700
                      : trendDown
                          ? Colors.red.shade700
                          : AppColors.textSecondary,
                ),
                const SizedBox(width: 2),
                Flexible(
                  child: Text(
                    monthLabel.isNotEmpty
                        ? '$monthLabel · ${forecast!.trendPercentage.abs().toStringAsFixed(1)}%'
                        : forecast!.trend,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: trendUp
                          ? Colors.green.shade700
                          : trendDown
                              ? Colors.red.shade700
                              : AppColors.textSecondary,
                    ),
                  ),
                ),
              ],
            ),
          ] else
            const Text(
              'No forecast yet',
              style: TextStyle(
                fontSize: 14,
                color: AppColors.textSecondary,
              ),
            ),
        ],
      ),
    );
  }
}
