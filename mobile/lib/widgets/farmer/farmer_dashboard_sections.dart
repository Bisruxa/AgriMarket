import 'package:flutter/material.dart';

import '../../constants/app_assets.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

class FarmerVerificationBanner extends StatelessWidget {
  final bool isVerified;
  final String? email;

  const FarmerVerificationBanner({
    super.key,
    required this.isVerified,
    this.email,
  });

  @override
  Widget build(BuildContext context) {
    if (isVerified) {
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
              'Verified',
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

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.orange.shade50,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.orange.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.mark_email_unread_outlined, color: Colors.orange.shade800),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Verify your email',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Colors.orange.shade900,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Check your inbox for the verification link. You need a verified email to sign in on other devices.',
            style: TextStyle(fontSize: 12, color: Colors.orange.shade900.withValues(alpha: 0.85)),
          ),
          if (email != null && email!.isNotEmpty) ...[
            const SizedBox(height: 12),
            _ResendVerificationButton(email: email!),
          ],
        ],
      ),
    );
  }
}

class _ResendVerificationButton extends StatefulWidget {
  final String email;

  const _ResendVerificationButton({required this.email});

  @override
  State<_ResendVerificationButton> createState() => _ResendVerificationButtonState();
}

class _ResendVerificationButtonState extends State<_ResendVerificationButton> {
  bool _loading = false;

  Future<void> _resend() async {
    setState(() => _loading = true);
    final result = await ApiService().resendVerification(widget.email);
    if (!mounted) return;
    setState(() => _loading = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result.success
              ? (result.message ?? 'Verification email sent.')
              : (result.message ?? 'Could not resend email'),
        ),
        backgroundColor: result.success ? AppColors.primary : AppColors.error,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return TextButton.icon(
      onPressed: _loading ? null : _resend,
      icon: _loading
          ? const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.refresh_rounded, size: 18),
      label: const Text('Resend verification email'),
      style: TextButton.styleFrom(foregroundColor: AppColors.primary),
    );
  }
}

class MarketplaceAnalyticsCard extends StatelessWidget {
  final int activeListings;
  final int soldOut;
  final int totalProducts;

  const MarketplaceAnalyticsCard({
    super.key,
    this.activeListings = 0,
    this.soldOut = 0,
    this.totalProducts = 0,
  });

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      title: 'Marketplace Analytics',
      subtitle: 'My listings',
      headerImage: AppAssets.connect,
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _AnalyticsTile(
                  value: '$totalProducts',
                  label: 'Total products',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _AnalyticsTile(
                  value: '$soldOut',
                  label: 'Sold out',
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: _AnalyticsTile(
                  value: '$activeListings',
                  label: 'Active listings',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _AnalyticsTile(
                  value:
                      '${(totalProducts - activeListings - soldOut).clamp(0, 999)}',
                  label: 'Other',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class CommodityTickerItem {
  final String name;
  final String price;
  final String change;
  final bool up;
  final String? imageAsset;

  const CommodityTickerItem({
    required this.name,
    required this.price,
    required this.change,
    required this.up,
    this.imageAsset,
  });
}

class CommodityTickerCard extends StatelessWidget {
  final List<CommodityTickerItem> items;

  const CommodityTickerCard({super.key, this.items = const []});

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) {
      return const SizedBox.shrink();
    }

    final tickerItems = items
        .map(
          (e) => _Commodity(
            name: e.name,
            price: e.price,
            change: e.change,
            up: e.up,
            imageAsset: e.imageAsset,
          ),
        )
        .toList();

    return _DashboardCard(
      title: 'Commodity Ticker',
      trailing: const Text(
        '(market avg)',
        style: TextStyle(
          fontSize: 12,
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          const gap = 10.0;
          final count = tickerItems.length.clamp(1, 4);
          final visible = tickerItems.take(count).toList();
          final cardWidth =
              (constraints.maxWidth - gap * (count - 1)) / count;
          final cardHeight = (cardWidth * 1.05).clamp(96.0, 128.0);

          return SizedBox(
            height: cardHeight,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                for (var i = 0; i < visible.length; i++) ...[
                  if (i > 0) const SizedBox(width: gap),
                  Expanded(child: _CommodityTile(item: visible[i])),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class AiCropRecommendationsCard extends StatelessWidget {
  final String region;
  final String cropName;
  final double? score;

  const AiCropRecommendationsCard({
    super.key,
    required this.region,
    required this.cropName,
    this.score,
  });

  @override
  Widget build(BuildContext context) {
    return _DashboardCard(
      title: 'AI Crop Recommendations',
      subtitle: 'Top for $region',
      headerImage: AppAssets.insights,
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
                  const TextSpan(text: 'Featured crop: '),
                  TextSpan(
                    text: cropName,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  if (score != null)
                    TextSpan(
                      text: ' (profitability score ${score!.toStringAsFixed(0)})',
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
  final String imageAsset;
  final bool statusHighlight;

  const ActiveListingItem({
    required this.name,
    required this.priceLine,
    required this.statusLine,
    required this.imageAsset,
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
        LayoutBuilder(
          builder: (context, constraints) {
            const gap = 12.0;
            final count = listings.length;
            if (count == 0) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  'No active listings. Add products in Market.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
              );
            }

            return Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (var i = 0; i < count; i++) ...[
                  if (i > 0) const SizedBox(width: gap),
                  Expanded(child: _ActiveListingCard(item: listings[i])),
                ],
              ],
            );
          },
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
  final String? headerImage;

  const _DashboardCard({
    required this.title,
    this.subtitle,
    required this.child,
    this.trailing,
    this.headerImage,
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
          if (headerImage != null) ...[
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: AspectRatio(
                aspectRatio: 16 / 7,
                child: Image.asset(
                  headerImage!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  errorBuilder: (_, __, ___) => const SizedBox.shrink(),
                ),
              ),
            ),
          ],
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
  final String? imageAsset;

  const _Commodity({
    required this.name,
    required this.price,
    required this.change,
    required this.up,
    this.imageAsset,
  });
}

class _CommodityTile extends StatelessWidget {
  final _Commodity item;

  const _CommodityTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (item.imageAsset != null)
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: SizedBox(
                height: 46,
                width: double.infinity,
                child: Image.asset(
                  item.imageAsset!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Icon(
                    Icons.grain_rounded,
                    color: AppColors.primary.withValues(alpha: 0.8),
                    size: 20,
                  ),
                ),
              ),
            )
          else
            Icon(
              Icons.grain_rounded,
              color: AppColors.primary.withValues(alpha: 0.8),
              size: 20,
            ),
          const SizedBox(height: 4),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              item.name,
              style: const TextStyle(
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(
              item.price,
              style: const TextStyle(
                fontSize: 10,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  item.up
                      ? Icons.arrow_drop_up_rounded
                      : Icons.arrow_drop_down_rounded,
                  size: 16,
                  color: item.up ? Colors.green : Colors.red,
                ),
                Text(
                  item.change,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: item.up ? Colors.green.shade700 : Colors.red.shade700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActiveListingCard extends StatelessWidget {
  final ActiveListingItem item;

  const _ActiveListingCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          AspectRatio(
            aspectRatio: 1.05,
            child: _DashboardImage(
              path: item.imageAsset,
              fit: BoxFit.cover,
              width: double.infinity,
              fallback: ColoredBox(
                color: AppColors.primary.withValues(alpha: 0.08),
                child: Icon(
                  Icons.eco_rounded,
                  color: AppColors.primary.withValues(alpha: 0.7),
                  size: 36,
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(8, 8, 8, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  item.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  item.priceLine,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 9,
                    color: AppColors.textSecondary,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item.statusLine,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                    height: 1.2,
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
  }
}

class _DashboardImage extends StatelessWidget {
  final String path;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget fallback;

  const _DashboardImage({
    required this.path,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    required this.fallback,
  });

  @override
  Widget build(BuildContext context) {
    if (path.startsWith('http')) {
      return Image.network(
        path,
        fit: fit,
        width: width,
        height: height,
        errorBuilder: (_, __, ___) => fallback,
      );
    }
    return Image.asset(
      path,
      fit: fit,
      width: width,
      height: height,
      errorBuilder: (_, __, ___) => fallback,
    );
  }
}
