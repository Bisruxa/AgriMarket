import 'package:flutter/material.dart';

import '../../models/agriai_model.dart';
import '../../models/product_model.dart';
import '../../models/profile_model.dart';
import '../../models/weather_model.dart';
import '../../services/api_service.dart';
import '../../services/token_storage.dart';
import '../../theme/app_theme.dart';
import '../../utils/logout_helper.dart';
import '../../utils/notification_labels.dart';
import '../../widgets/common/app_bottom_nav.dart';
import '../../widgets/farmer/farmer_ai_action_buttons.dart';
import '../../widgets/app_locale_scope.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/farmer/farmer_dashboard_header.dart';
import '../../widgets/farmer/farmer_dashboard_sections.dart';
import '../../widgets/farmer/farmer_farms_banner.dart';
import '../../widgets/farmer/farmer_insights_summary.dart';
import '../../widgets/farmer/farmer_weather_card.dart';
import '../../constants/app_assets.dart';
import '../../utils/crop_price_utils.dart';
import 'agri_chat_screen.dart';
import 'crop_recommendation.dart';
import 'price_forecast_screen.dart';
import 'farmer_profile.dart';
import 'farmer_trends_screen.dart';
import 'add_farm_screen.dart';
import 'farms_screen.dart';
import 'marketplace.dart';

class FarmerDashboard extends StatefulWidget {
  const FarmerDashboard({super.key});

  @override
  State<FarmerDashboard> createState() => _FarmerDashboardState();
}

class _FarmerDashboardState extends State<FarmerDashboard> {
  int _selectedIndex = 0;
  final ApiService _apiService = ApiService();
  UserProfile? _profile;
  bool _isLoadingProfile = true;

  List<FarmerInboxMessage> _inboxMessages = [];
  WeatherForecast? _weather;
  bool _weatherLoading = true;
  List<Product> _myProducts = [];
  List<CommodityTickerItem> _commodities = [];
  int _farmCount = 0;
  bool _insightsLoading = true;
  String? _recommendedCrop;
  double? _recommendConfidence;
  CropPriceForecast? _priceForecast;
  String? _insightsError;

  static const _defaultImage = AppAssets.welcome;

  List<AppNavItem> _navItems(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);
    return [
      AppNavItem(
        icon: Icons.home_outlined,
        activeIcon: Icons.home_rounded,
        label: l10n.navHome,
      ),
      AppNavItem(
        icon: Icons.chat_bubble_outline_rounded,
        activeIcon: Icons.chat_bubble_rounded,
        label: l10n.navChat,
      ),
      AppNavItem(
        icon: Icons.store_outlined,
        activeIcon: Icons.store_rounded,
        label: l10n.navMarket,
      ),
      AppNavItem(
        icon: Icons.insights_outlined,
        activeIcon: Icons.insights_rounded,
        label: l10n.navInsights,
      ),
      AppNavItem(
        icon: Icons.person_outline_rounded,
        activeIcon: Icons.person_rounded,
        label: l10n.navProfile,
      ),
    ];
  }

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    await _loadProfile();
    await Future.wait([
      _loadNotifications(),
      _loadWeatherAndFarms(),
      _loadProducts(),
      _loadCommodities(),
      _loadInsightsSummary(),
    ]);
  }

  Future<void> _loadProfile() async {
    final profile = await _apiService.getProfile();
    final storedName = await TokenStorage.getUserName();
    final storedFarm = await TokenStorage.getFarmSubtitle();

    if (mounted) {
      setState(() {
        final resolvedName = (profile?.name.isNotEmpty == true)
            ? profile!.name
            : (storedName?.isNotEmpty == true ? storedName! : 'Farmer');

        if (profile != null) {
          _profile = UserProfile(
            id: profile.id,
            name: resolvedName,
            email: profile.email,
            role: profile.role,
            phone: profile.phone,
            region: profile.region,
            woreda: profile.woreda,
            farmLocation: profile.farmLocation ?? storedFarm,
            farmSize: profile.farmSize,
            tinNumber: profile.tinNumber,
            avatarUrl: profile.avatarUrl,
            isVerified: profile.isVerified,
          );
        } else if (storedName != null && storedName.isNotEmpty) {
          _profile = UserProfile(
            name: storedName,
            email: '',
            role: 'farmer',
            farmLocation: storedFarm,
          );
        }
        _isLoadingProfile = false;
      });
    }
  }

  Future<void> _loadNotifications() async {
    final result = await _apiService.getNotifications();
    if (!mounted || !result.success) return;
    setState(() {
      _inboxMessages = result.notifications.map((n) {
        final labels = NotificationLabels.label(n);
        return FarmerInboxMessage(
          id: n.id,
          title: labels.title,
          body: labels.body,
          timeAgo: NotificationLabels.timeAgo(n.createdAt),
          isRead: n.isRead,
        );
      }).toList();
    });
  }

  Future<void> _loadWeatherAndFarms() async {
    setState(() => _weatherLoading = true);
    final farmsResult = await _apiService.getFarms();
    WeatherForecast? forecast;

    if (farmsResult.success) {
      _farmCount = farmsResult.farms.length;
      final withCoords = farmsResult.farms.where(
        (f) => f.latitude != null && f.longitude != null,
      );
      if (withCoords.isNotEmpty) {
        forecast = await _apiService.getWeatherForFarm(withCoords.first.id);
      }
    }

    forecast ??= await _apiService.getWeatherForecast(
      latitude: 9.03,
      longitude: 38.74,
    );

    if (!mounted) return;
    setState(() {
      _weather = forecast;
      _weatherLoading = false;
      if (farmsResult.success) _farmCount = farmsResult.farms.length;
    });
  }

  Future<void> _loadProducts() async {
    try {
      final response = await _apiService.getMyProducts(page: 1, limit: 20);
      if (response.statusCode == 200 && response.data['success'] == true) {
        final list = response.data['data'] as List? ?? [];
        if (!mounted) return;
        setState(() {
          _myProducts = list.map((j) => Product.fromJson(j)).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _loadCommodities() async {
    const cropKeys = ['teff', 'wheat', 'maize', 'barley'];
    final items = <CommodityTickerItem>[];

    for (final key in cropKeys) {
      final records = await _apiService.getPriceTrendsForCropKey(
        cropKey: key,
        limit: 2,
      );
      if (records.length >= 2) {
        final latest = records.first.avgPrice;
        final prev = records[1].avgPrice;
        final pct = prev > 0 ? ((latest - prev) / prev) * 100 : 0.0;
        items.add(CommodityTickerItem(
          name: CropPriceUtils.labelForKey(key),
          price: 'ETB ${latest.toStringAsFixed(0)}',
          change: '${pct >= 0 ? '+' : ''}${pct.toStringAsFixed(0)}%',
          up: pct >= 0,
          imageAsset: AppAssets.commodityByKey[key] ?? AppAssets.crop1,
        ));
      } else if (records.length == 1) {
        items.add(CommodityTickerItem(
          name: CropPriceUtils.labelForKey(key),
          price: 'ETB ${records.first.avgPrice.toStringAsFixed(0)}',
          change: '—',
          up: true,
          imageAsset: AppAssets.commodityByKey[key] ?? AppAssets.crop1,
        ));
      }
    }

    if (!mounted) return;
    setState(() => _commodities = items);
  }

  Future<void> _loadInsightsSummary() async {
    if (mounted) {
      setState(() {
        _insightsLoading = true;
        _insightsError = null;
      });
    }

    final region = _cropRegion;
    var recommendedCrop = 'Teff';
    double? confidence;
    CropPriceForecast? forecast;
    String? error;

    final rec = await _apiService.recommendCropWithDefaults();
    if (rec.success && rec.recommendations.isNotEmpty) {
      final top = rec.recommendations.first;
      recommendedCrop = top.crop;
      confidence = top.confidence <= 1
          ? top.confidence * 100
          : top.confidence;
    } else if (!rec.success) {
      error = rec.message;
    }

    final dbCrop = CropPriceUtils.dbNameForMlCrop(recommendedCrop);
    final price = await _apiService.predictCropPrice(
      cropName: dbCrop,
      region: region,
    );
    if (price.success && price.forecast != null) {
      forecast = price.forecast;
    } else if (error == null && !price.success) {
      error = price.message;
    }

    if (!mounted) return;
    setState(() {
      _recommendedCrop = recommendedCrop;
      _recommendConfidence = confidence;
      _priceForecast = forecast;
      _insightsError = error;
      _insightsLoading = false;
    });
  }

  String get _farmerName => _profile?.name ?? 'Farmer';

  String get _cropRegion => _profile?.region?.trim() ?? 'Oromia';

  void _openCropRecommendation() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const CropRecommendation()),
    );
  }

  void _openPriceForecast() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PriceForecastScreen(defaultRegion: _cropRegion),
      ),
    );
  }

  String get _firstName {
    final parts = _farmerName.trim().split(RegExp(r'\s+'));
    return parts.isNotEmpty ? parts.first : 'Farmer';
  }

  int get _activeListingsCount =>
      _myProducts.where((p) => p.isAvailable && p.stock > 0).length;

  int get _soldOutCount =>
      _myProducts.where((p) => !p.isAvailable || p.stock == 0).length;

  List<ActiveListingItem> _activeListings(AppLocalizations l10n) => _myProducts
      .where((p) => p.isAvailable && p.stock > 0)
      .take(4)
      .toList()
      .asMap()
      .entries
      .map(
        (e) => ActiveListingItem(
          name: e.value.name,
          priceLine: 'ETB ${e.value.price.toStringAsFixed(0)}/${e.value.unit}',
          statusLine: '${e.value.stock} in stock',
          imageAsset: e.value.images.isNotEmpty
              ? e.value.images.first
              : AppAssets.cropForIndex(e.key),
          statusHighlight: e.value.stock <= 5,
        ),
      )
      .toList();

  List<Widget> _screens(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);
    return [
      _buildHomeScreen(l10n),
      AgriChatScreen(defaultRegion: _cropRegion, showAppBar: false),
      MarketplaceScreen(),
      FarmerTrendsScreen(),
      FarmerProfileScreen(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    AppLocaleScope.l10nOf(context);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: IndexedStack(
        index: _selectedIndex,
        children: _screens(context),
      ),
      bottomNavigationBar: AppBottomNav(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        items: _navItems(context),
      ),
      floatingActionButton: _selectedIndex == 1
          ? null
          : FloatingActionButton(
              onPressed: () => setState(() => _selectedIndex = 1),
              backgroundColor: AppColors.primary,
              child: const Icon(Icons.auto_awesome_rounded, color: Colors.white),
            ),
    );
  }

  Widget _buildHomeScreen(AppLocalizations l10n) {
    if (_isLoadingProfile) {
      return const ColoredBox(
        color: AppColors.surface,
        child: Center(
          child: CircularProgressIndicator(color: AppColors.primary),
        ),
      );
    }

    return ColoredBox(
      color: AppColors.surface,
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadAll,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: FarmerDashboardHeader(
                farmerName: _farmerName,
                profileImageUrl: _profile?.avatarUrl ?? _defaultImage,
                messages: _inboxMessages,
                onLogout: () => logoutAndRedirect(context),
                onOpenFarms: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const FarmsScreen()),
                  );
                },
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    FarmerWeatherCard(
                      greetingName: _firstName,
                      forecast: _weather,
                      isLoading: _weatherLoading,
                    ),
                    const SizedBox(height: 16),
                    FarmerInsightsSummaryCard(
                      isLoading: _insightsLoading,
                      recommendedCrop: _recommendedCrop,
                      recommendConfidencePercent: _recommendConfidence,
                      forecast: _priceForecast,
                      errorMessage: _insightsError,
                      onViewDetails: () => setState(() => _selectedIndex = 3),
                    ),
                    const SizedBox(height: 12),
                    FarmerAiActionButtons(
                      onCropRecommend: _openCropRecommendation,
                      onPriceForecast: _openPriceForecast,
                    ),
                    const SizedBox(height: 16),
                    FarmerFarmsBanner(
                      farmCount: _farmCount,
                      onViewFarms: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => const FarmsScreen()),
                        ).then((_) => _loadWeatherAndFarms());
                      },
                      onAddFarm: () async {
                        final created = await Navigator.push<bool>(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const AddFarmScreen(),
                          ),
                        );
                        if (created == true) _loadWeatherAndFarms();
                      },
                    ),
                    const SizedBox(height: 16),
                    FarmerVerificationBanner(
                      isVerified: _profile?.isVerified ?? true,
                      email: _profile?.email,
                    ),
                    const SizedBox(height: 16),
                    MarketplaceAnalyticsCard(
                      activeListings: _activeListingsCount,
                      soldOut: _soldOutCount,
                      totalProducts: _myProducts.length,
                    ),
                    CommodityTickerCard(items: _commodities),
                    ActiveListingsSection(
                      listings: _activeListings(l10n),
                      onViewAll: () => setState(() => _selectedIndex = 2),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
