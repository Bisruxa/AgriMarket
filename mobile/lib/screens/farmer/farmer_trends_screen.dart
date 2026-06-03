import 'package:flutter/material.dart';

import '../../models/price_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_locale_scope.dart';
import '../../widgets/language_toggle.dart';

class FarmerTrendsScreen extends StatefulWidget {
  const FarmerTrendsScreen({super.key});

  @override
  State<FarmerTrendsScreen> createState() => _FarmerTrendsScreenState();
}

class _FarmerTrendsScreenState extends State<FarmerTrendsScreen> {
  final _api = ApiService();

  List<String> _crops = [];
  List<String> _regions = [];
  String _selectedCrop = 'Teff';
  String _selectedRegion = 'Oromia';
  List<PriceRecord> _trends = [];
  SalesTimingResult? _salesTiming;
  MultiCropProfitabilityResult? _multiCrop;
  bool _loading = true;
  bool _noPriceData = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _noPriceData = false;
    });

    final crops = await _api.getPriceCrops();
    final regions = await _api.getPriceRegions();
    if (crops.isNotEmpty) _selectedCrop = crops.first;
    if (regions.isNotEmpty && !regions.contains(_selectedRegion)) {
      _selectedRegion = regions.contains('Oromia') ? 'Oromia' : regions.first;
    }

    final trends = await _api.getPriceTrends(
      cropName: _selectedCrop,
      region: _selectedRegion,
      limit: 24,
    );
    final timing = await _api.getSalesTiming(
      cropName: _selectedCrop,
      region: _selectedRegion,
    );
    final multi = await _api.getMultiCropProfitability();

    if (!mounted) return;
    setState(() {
      _crops = crops.isNotEmpty ? crops : [_selectedCrop];
      _regions = regions.isNotEmpty
          ? regions
          : ['Oromia', 'Amhara', 'Addis Ababa', 'SNNP'];
      _trends = trends;
      _salesTiming = timing;
      _multiCrop = multi;
      _loading = false;
      _noPriceData =
          trends.isEmpty && (timing == null || !timing.hasData);
    });
  }

  Future<void> _reloadTrends() async {
    setState(() => _loading = true);
    final trends = await _api.getPriceTrends(
      cropName: _selectedCrop,
      region: _selectedRegion,
      limit: 24,
    );
    final timing = await _api.getSalesTiming(
      cropName: _selectedCrop,
      region: _selectedRegion,
    );
    if (!mounted) return;
    setState(() {
      _trends = trends;
      _salesTiming = timing;
      _loading = false;
    });
  }

  Widget _buildDropdown({
    required String label,
    required String value,
    required List<String> options,
    required ValueChanged<String?> onChanged,
  }) {
    return DropdownButtonFormField<String>(
      isExpanded: true,
      value: value,
      decoration: InputDecoration(
        labelText: label,
        isDense: true,
      ),
      items: options
          .map(
            (item) => DropdownMenuItem(
              value: item,
              child: Text(
                item,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          )
          .toList(),
      onChanged: onChanged,
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeService = AppLocaleScope.serviceOf(context);

    return ListenableBuilder(
      listenable: localeService,
      builder: (context, _) {
        final l10n = localeService.l10n;
        return _buildContent(context, l10n);
      },
    );
  }

  Widget _buildContent(BuildContext context, AppLocalizations l10n) {
    return ColoredBox(
      color: AppColors.surface,
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _load,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        l10n.marketInsights,
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontSize: 26,
                              fontWeight: FontWeight.w700,
                            ),
                      ),
                    ),
                    const LanguageToggle(),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: LayoutBuilder(
                  builder: (context, constraints) {
                    final cropField = _buildDropdown(
                      label: l10n.crop,
                      value: _selectedCrop,
                      options: _crops,
                      onChanged: (v) {
                        if (v == null) return;
                        setState(() => _selectedCrop = v);
                        _reloadTrends();
                      },
                    );
                    final regionField = _buildDropdown(
                      label: l10n.region,
                      value: _selectedRegion,
                      options: _regions,
                      onChanged: (v) {
                        if (v == null) return;
                        setState(() => _selectedRegion = v);
                        _reloadTrends();
                      },
                    );

                    if (constraints.maxWidth < 360) {
                      return Column(
                        children: [
                          cropField,
                          const SizedBox(height: 12),
                          regionField,
                        ],
                      );
                    }

                    return Row(
                      children: [
                        Expanded(child: cropField),
                        const SizedBox(width: 12),
                        Expanded(child: regionField),
                      ],
                    );
                  },
                ),
              ),
            ),
            if (_loading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            else ...[
              if (_noPriceData)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Text(
                      l10n.noPriceData,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ),
                ),
              if (_salesTiming?.hasData == true &&
                  _salesTiming!.recommendation != null)
                SliverToBoxAdapter(
                  child: _SalesTimingCard(timing: _salesTiming!),
                ),
              if (_multiCrop?.hasData == true)
                SliverToBoxAdapter(child: _MultiCropCard(result: _multiCrop!)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Text(
                    l10n.priceHistoryCount(_trends.length),
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              if (_trends.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Text(l10n.noTrendData),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final r = _trends[index];
                      return ListTile(
                        title: Text(
                          '${r.cropName} · ${r.region}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        subtitle: Text(
                          '${r.year}-${r.month.toString().padLeft(2, '0')}',
                        ),
                        trailing: Text(
                          'ETB ${r.avgPrice.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                      );
                    },
                    childCount: _trends.length,
                  ),
                ),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ],
        ),
      ),
    );
  }
}

class _SalesTimingCard extends StatelessWidget {
  final SalesTimingResult timing;

  const _SalesTimingCard({required this.timing});

  @override
  Widget build(BuildContext context) {
    final localeService = AppLocaleScope.serviceOf(context);

    return ListenableBuilder(
      listenable: localeService,
      builder: (context, _) {
        final l10n = localeService.l10n;
        final rec = timing.recommendation!;

        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.schedule_rounded, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          l10n.bestTimeToSell,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${l10n.bestMonth}: ${rec['bestSellMonthName'] ?? rec['bestSellMonth']}',
                  ),
                  Text(
                    '${l10n.expectedGain}: ${rec['expectedGainPercent']?.toString() ?? '—'}%',
                  ),
                  Text(
                    '${l10n.latestPrice}: ETB ${rec['latestKnownPrice']?.toString() ?? '—'}',
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}

class _MultiCropCard extends StatelessWidget {
  final MultiCropProfitabilityResult result;

  const _MultiCropCard({required this.result});

  @override
  Widget build(BuildContext context) {
    final localeService = AppLocaleScope.serviceOf(context);

    return ListenableBuilder(
      listenable: localeService,
      builder: (context, _) {
        final l10n = localeService.l10n;
        final summary = result.summary;

        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
          child: Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.pie_chart_rounded, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          l10n.farmProfitability,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (summary != null) ...[
                    Text('${l10n.farmsAnalyzed}: ${summary['farmsAnalyzed'] ?? '—'}'),
                    Text('${l10n.cropsAnalyzed}: ${summary['cropsAnalyzed'] ?? '—'}'),
                    if (summary['topRecommendation'] != null)
                      Text('${l10n.topPick}: ${summary['topRecommendation']}'),
                  ],
                  if (result.items.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    ...result.items.take(3).map(
                          (item) => Text(
                            '• ${item['cropName']}: ${l10n.score} ${item['score']?.toString() ?? '—'}',
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                  ],
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
