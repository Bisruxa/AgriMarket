import 'package:flutter/material.dart';

import '../../models/price_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';

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
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
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
      if (trends.isEmpty && (timing == null || !timing.hasData)) {
        _error = 'No price data yet. Sync prices on the server.';
      }
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

  @override
  Widget build(BuildContext context) {
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
                child: Text(
                  'Market Insights',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedCrop,
                        decoration: const InputDecoration(
                          labelText: 'Crop',
                          isDense: true,
                        ),
                        items: _crops
                            .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                            .toList(),
                        onChanged: (v) {
                          if (v == null) return;
                          setState(() => _selectedCrop = v);
                          _reloadTrends();
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedRegion,
                        decoration: const InputDecoration(
                          labelText: 'Region',
                          isDense: true,
                        ),
                        items: _regions
                            .map((r) => DropdownMenuItem(value: r, child: Text(r)))
                            .toList(),
                        onChanged: (v) {
                          if (v == null) return;
                          setState(() => _selectedRegion = v);
                          _reloadTrends();
                        },
                      ),
                    ),
                  ],
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
              if (_error != null)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Text(
                      _error!,
                      style: const TextStyle(color: AppColors.textSecondary),
                    ),
                  ),
                ),
              if (_salesTiming?.hasData == true && _salesTiming!.recommendation != null)
                SliverToBoxAdapter(child: _SalesTimingCard(timing: _salesTiming!)),
              if (_multiCrop?.hasData == true)
                SliverToBoxAdapter(child: _MultiCropCard(result: _multiCrop!)),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Text(
                    'Price history (${_trends.length} records)',
                    style: const TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              if (_trends.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('No trend data for this crop and region.'),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final r = _trends[index];
                      return ListTile(
                        title: Text('${r.cropName} · ${r.region}'),
                        subtitle: Text('${r.year}-${r.month.toString().padLeft(2, '0')}'),
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
    final rec = timing.recommendation!;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.schedule_rounded, color: AppColors.primary),
                  SizedBox(width: 8),
                  Text('Best time to sell', style: TextStyle(fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Best month: ${rec['bestSellMonthName'] ?? rec['bestSellMonth']}',
              ),
              Text(
                'Expected gain: ${rec['expectedGainPercent']?.toString() ?? '—'}%',
              ),
              Text(
                'Latest price: ETB ${rec['latestKnownPrice']?.toString() ?? '—'}',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MultiCropCard extends StatelessWidget {
  final MultiCropProfitabilityResult result;

  const _MultiCropCard({required this.result});

  @override
  Widget build(BuildContext context) {
    final summary = result.summary;
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 0),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.pie_chart_rounded, color: AppColors.primary),
                  SizedBox(width: 8),
                  Text('Farm profitability', style: TextStyle(fontWeight: FontWeight.w700)),
                ],
              ),
              const SizedBox(height: 8),
              if (summary != null) ...[
                Text('Farms analyzed: ${summary['farmsAnalyzed'] ?? '—'}'),
                Text('Crops analyzed: ${summary['cropsAnalyzed'] ?? '—'}'),
                if (summary['topRecommendation'] != null)
                  Text('Top pick: ${summary['topRecommendation']}'),
              ],
              if (result.items.isNotEmpty) ...[
                const SizedBox(height: 8),
                ...result.items.take(3).map(
                      (item) => Text(
                        '• ${item['cropName']}: score ${item['score']?.toString() ?? '—'}',
                      ),
                    ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
