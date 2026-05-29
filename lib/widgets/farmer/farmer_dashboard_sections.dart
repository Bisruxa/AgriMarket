import 'package:flutter/material.dart';
import '../../models/crop_model.dart';
import '../../theme/app_theme.dart';

class FarmerVerificationBanner extends StatelessWidget {
  const FarmerVerificationBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Account Verification Status',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.95),
                fontSize: 13,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          const Text(
            'Status: Verified Account',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(width: 6),
          Icon(
            Icons.verified_rounded,
            color: Colors.lightGreenAccent.shade400,
            size: 20,
          ),
        ],
      ),
    );
  }
}

class MarketplaceAnalyticsCard extends StatelessWidget {
  const MarketplaceAnalyticsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      title: 'Marketplace Analytics',
      subtitle: 'My Sales Summary',
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _AnalyticsTile(
                  value: 'ETB 28,500.00',
                  label: 'this month',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _AnalyticsTile(
                  value: '6',
                  label: 'Sold items',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _AnalyticsTile(
                  value: '12',
                  label: 'Active Listings',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _AnalyticsTile(
                  value: '3',
                  label: 'Unread Offers',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class CommodityTickerCard extends StatelessWidget {
  const CommodityTickerCard({super.key});

  static const _items = [
    _Commodity(name: 'Teff', price: 'ETB 6,100', change: '+3%', up: true),
    _Commodity(name: 'Wheat', price: 'ETB 3,500', change: '-1%', up: false),
    _Commodity(name: 'Maize', price: 'ETB 2,950', change: '+2%', up: true),
    _Commodity(name: 'Barley', price: 'ETB 3,200', change: '+1%', up: true),
  ];

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      title: 'Real-Time Commodity Ticker',
      trailing: const Text(
        '(ETB/qtl)',
        style: TextStyle(
          fontSize: 12,
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
      child: SizedBox(
        height: 88,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: _items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (context, index) {
            final item = _items[index];
            return Container(
              width: 88,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.grain_rounded,
                    color: AppColors.primary.withValues(alpha: 0.8),
                    size: 22,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.name,
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                  Text(
                    item.price,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        item.up
                            ? Icons.arrow_drop_up_rounded
                            : Icons.arrow_drop_down_rounded,
                        size: 18,
                        color: item.up ? Colors.green : Colors.red,
                      ),
                      Text(
                        item.change,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: item.up ? Colors.green.shade700 : Colors.red.shade700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

class AiCropRecommendationsCard extends StatelessWidget {
  final String region;
  final Crop featuredCrop;

  const AiCropRecommendationsCard({
    super.key,
    required this.region,
    required this.featuredCrop,
  });

  @override
  Widget build(BuildContext context) {
    final cropName = featuredCrop.name.split(' ').first;
    return _DashboardCard(
      title: 'AI Crop Recommendations',
      subtitle: 'Top for $region',
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '• ',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.primary,
            ),
          ),
          Expanded(
            child: RichText(
              text: TextSpan(
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textPrimary,
                  height: 1.45,
                ),
                children: [
                  const TextSpan(text: 'Featured Crop: '),
                  TextSpan(
                    text: cropName,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  TextSpan(
                    text:
                        ' (High Demand, ${featuredCrop.season}, ${featuredCrop.profitMargin.toStringAsFixed(0)}% Margin)',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class ActiveListingItem {
  final String name;
  final String priceLine;
  final String statusLine;
  final bool statusHighlight;

  const ActiveListingItem({
    required this.name,
    required this.priceLine,
    required this.statusLine,
    this.statusHighlight = false,
  });
}

class ActiveListingsSection extends StatelessWidget {
  final List<ActiveListingItem> listings;
  final VoidCallback? onViewAll;

  const ActiveListingsSection({
    super.key,
    required this.listings,
    this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'My Active Listings',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            if (onViewAll != null)
              TextButton(onPressed: onViewAll, child: const Text('View All')),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 168,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: listings.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (context, index) {
              final item = listings[index];
              return Container(
                width: 130,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.08),
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(15),
                          ),
                        ),
                        child: Icon(
                          Icons.eco_rounded,
                          color: AppColors.primary.withValues(alpha: 0.7),
                          size: 44,
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            item.priceLine,
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            item.statusLine,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: item.statusHighlight
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget child;
  final Widget? trailing;

  const _DashboardCard({
    required this.title,
    this.subtitle,
    required this.child,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(18),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontSize: 17,
                          ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (trailing != null) trailing!,
            ],
          ),
          const SizedBox(height: 14),
          child,
        ],
      ),
    );
  }
}

class _AnalyticsTile extends StatelessWidget {
  final String value;
  final String label;

  const _AnalyticsTile({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 14,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
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

class _Commodity {
  final String name;
  final String price;
  final String change;
  final bool up;

  const _Commodity({
    required this.name,
    required this.price,
    required this.change,
    required this.up,
  });
}
