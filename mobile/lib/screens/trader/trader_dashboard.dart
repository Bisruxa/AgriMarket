import 'package:flutter/material.dart';
import '../../models/notification_model.dart';
import '../../models/product_model.dart';
import '../../models/profile_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/notification_labels.dart';
import '../../widgets/common/app_bottom_nav.dart';
import '../../widgets/app_locale_scope.dart';
import '../../widgets/language_toggle.dart';
import '../../widgets/profile_details_card.dart';
import '../../widgets/welcome_card.dart';
import '../../widgets/farmer_info_popup.dart';
import 'trader_products_screen.dart';
import 'trader_profile.dart';
class TraderDashboard extends StatefulWidget {
  const TraderDashboard({super.key});

  @override
  State<TraderDashboard> createState() => _TraderDashboardState();
}

class _TraderDashboardState extends State<TraderDashboard> {
  int _selectedIndex = 0;
  final ApiService _apiService = ApiService();
  UserProfile? _profile;
  List<Product> _previewProducts = [];
  bool _isLoadingPreview = true;
  List<AppNotification> _notifications = [];
  int _unreadCount = 0;

  static const _defaultImage = 'assets/images/welcome.png';

  static const _navItems = [
    AppNavItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: 'Home',
    ),
    AppNavItem(
      icon: Icons.search_outlined,
      activeIcon: Icons.search_rounded,
      label: 'Market Place',
    ),
    AppNavItem(
      icon: Icons.person_outline,
      activeIcon: Icons.person_rounded,
      label: 'Profile',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadProfile();
    _loadPreviewProducts();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    final result = await _apiService.getNotifications();
    if (mounted && result.success) {
      setState(() {
        _notifications = result.notifications;
        _unreadCount = result.unreadCount;
      });
    }
  }

  void _showNotifications() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Notifications', style: Theme.of(ctx).textTheme.titleLarge),
                const SizedBox(height: 12),
                if (_notifications.isEmpty)
                  const Text('No notifications', style: TextStyle(color: AppColors.textSecondary))
                else
                  ..._notifications.map((n) {
                    final labels = NotificationLabels.label(n);
                    return ListTile(
                      title: Text(labels.title),
                      subtitle: Text(labels.body),
                      trailing: Text(
                        NotificationLabels.timeAgo(n.createdAt),
                        style: const TextStyle(fontSize: 11),
                      ),
                    );
                  }),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _loadPreviewProducts() async {
    try {
      final response = await _apiService.getProducts(
        available: true,
        page: 1,
        limit: 3,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final list = response.data['data'] as List? ?? [];
        if (mounted) {
          setState(() {
            _previewProducts =
                list.map((json) => Product.fromJson(json)).toList();
            _isLoadingPreview = false;
          });
        }
      } else if (mounted) {
        setState(() => _isLoadingPreview = false);
      }
    } catch (_) {
      if (mounted) setState(() => _isLoadingPreview = false);
    }
  }

  Future<void> _loadProfile() async {
    final profile = await _apiService.getProfile();
    if (mounted) {
      setState(() {
        _profile = profile;
      });
    }
  }

  int get _safeSelectedIndex {
    final max = _navItems.length - 1;
    if (_selectedIndex < 0) return 0;
    if (_selectedIndex > max) return max;
    return _selectedIndex;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: IndexedStack(
        index: _safeSelectedIndex,
        children: [
          _buildHomeTab(),
          const SafeArea(child: TraderProductsScreen()),
          const TraderProfileScreen(),
        ],
      ),
      bottomNavigationBar: AppBottomNav(
        currentIndex: _safeSelectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: _navItems,
        selectedColor: AppColors.traderAccent,
      ),
    );
  }

  Widget _buildHomeTab() {
    final l10n = AppLocaleScope.l10nOf(context);

    return SafeArea(
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      l10n.traderHub,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontSize: 26,
                          ),
                    ),
                  ),
                  const LanguageToggle(),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _showNotifications,
                    style: IconButton.styleFrom(
                      backgroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                        side: const BorderSide(color: AppColors.border),
                      ),
                    ),
                    icon: Badge(
                      isLabelVisible: _unreadCount > 0,
                      label: Text('$_unreadCount'),
                      child: const Icon(Icons.notifications_outlined),
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  WelcomeCard(
                    farmerName: _profile?.name ?? 'Trader',
                    farmName: _profile?.displaySubtitle.isNotEmpty == true
                        ? _profile!.displaySubtitle
                        : 'Your business',
                    profileImageUrl: _profile?.avatarUrl ?? _defaultImage,
                    gradient: AppColors.traderGradient,
                    onViewProfile: () => setState(() => _selectedIndex = 2),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: _StatCard(
                          label: 'Alerts',
                          value: '$_unreadCount',
                          icon: Icons.notifications_active_outlined,
                          color: AppColors.traderAccent,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _StatCard(
                          label: 'Listings',
                          value: '${_previewProducts.length}',
                          icon: Icons.storefront_outlined,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Fresh Listings',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Discover produce from verified farmers',
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  if (_isLoadingPreview)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 24),
                        child: CircularProgressIndicator(
                          color: AppColors.traderAccent,
                        ),
                      ),
                    )
                  else if (_previewProducts.isEmpty)
                    Text(
                      'No listings available right now',
                      style: Theme.of(context).textTheme.bodyMedium,
                    )
                  else
                    ..._previewProducts.map(
                      (p) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: TraderProductRow(
                          product: p,
                          showFarmerHint: true,
                          onTap: () {
                            showDialog<void>(
                              context: context,
                              builder: (_) => FarmerInfoPopup(product: p),
                            );
                          },
                        ),
                      ),
                    ),
                  const SizedBox(height: 8),                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () => setState(() => _selectedIndex = 1),
                      icon: const Icon(Icons.arrow_forward_rounded),
                      label: const Text('Browse All Products'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.traderAccent,
                        side: const BorderSide(color: AppColors.traderAccent),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
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

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 26),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ),
    );
  }
}
