import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../models/price_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/crop_price_utils.dart';
import '../../widgets/farmer/farmer_ai_action_buttons.dart';
import 'crop_recommendation.dart';
import 'price_forecast_screen.dart';

class FarmerTrendsScreen extends StatefulWidget {
  const FarmerTrendsScreen({super.key});

  @override
  State<FarmerTrendsScreen> createState() => _FarmerTrendsScreenState();
}

class _FarmerTrendsScreenState extends State<FarmerTrendsScreen> {
  final _api = ApiService();

  List<String> _cropKeys = CropPriceUtils.commonCropKeys;
  List<String> _regions = [];
  String _selectedCropKey = 'teff';
  String _selectedRegion = 'Oromia';
  List<PriceRecord> _trends = [];
  SalesTimingResult? _salesTiming;
  MultiCropProfitabilityResult? _multiCrop;
  bool _loading = true;
  String? _error;
  String? _matchedCropName;

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

    final dbCrops = await _api.getPriceCrops();
    final regions = await _api.getPriceRegions();

    final keys = CropPriceUtils.groupedKeysFromDbCrops(dbCrops);
    final cropKey = keys.contains(_selectedCropKey) ? _selectedCropKey : keys.first;

    var region = _selectedRegion;
    if (regions.isNotEmpty && !regions.contains(region)) {
      region = regions.contains('Oromia') ? 'Oromia' : regions.first;
    }

    final trends = await _api.getPriceTrendsForCropKey(
      cropKey: cropKey,
      region: region,
      limit: 200,
    );
    final timing = await _api.getSalesTimingForCropKey(
      cropKey: cropKey,
      region: region,
    );
    final multi = await _api.getMultiCropProfitability();

    if (!mounted) return;
    setState(() {
      _cropKeys = keys;
      _regions = regions.isNotEmpty
          ? regions
          : ['Oromia', 'Amhara', 'Addis Ababa', 'SNNP', 'Sidama'];
      _selectedCropKey = cropKey;
      _selectedRegion = region;
      _trends = trends;
      _matchedCropName = trends.isNotEmpty ? trends.first.cropName : null;
      _salesTiming = timing;
      _multiCrop = multi;
      _loading = false;
      if (trends.isEmpty && (timing == null || !timing.hasData)) {
        _error =
            'No price records for ${CropPriceUtils.labelForKey(cropKey)} in $region. Run price sync on the server.';
      }
    });
  }

  Future<void> _reloadTrends() async {
    setState(() => _loading = true);
    final trends = await _api.getPriceTrendsForCropKey(
      cropKey: _selectedCropKey,
      region: _selectedRegion,
      limit: 200,
    );
    final timing = await _api.getSalesTimingForCropKey(
      cropKey: _selectedCropKey,
      region: _selectedRegion,
    );
    if (!mounted) return;
    setState(() {
      _trends = trends;
      _matchedCropName = trends.isNotEmpty ? trends.first.cropName : null;
      _salesTiming = timing;
      _loading = false;
      _error = trends.isEmpty && (timing == null || !timing.hasData)
          ? 'No data for this crop and region.'
          : null;
    });
  }

  List<FlSpot> get _chartSpots {
    if (_trends.length < 2) return [];
    return List.generate(_trends.length, (i) {
      return FlSpot(i.toDouble(), _trends[i].avgPrice);
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
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: FarmerAiActionButtons(
                  onCropRecommend: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const CropRecommendation()),
                    );
                  },
                  onPriceForecast: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => PriceForecastScreen(
                          defaultRegion: _selectedRegion,
                        ),
                      ),
                    );
                  },
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
                        value: _selectedCropKey,
                        decoration: const InputDecoration(
                          labelText: 'Crop',
                          isDense: true,
                        ),
                        items: _cropKeys
                            .map(
                              (k) => DropdownMenuItem(
                                value: k,
                                child: Text(CropPriceUtils.labelForKey(k)),
                              ),
                            )
                            .toList(),
                        onChanged: (v) {
                          if (v == null) return;
                          setState(() => _selectedCropKey = v);
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
            if (_matchedCropName != null)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                  child: Text(
                    'Showing data for: $_matchedCropName',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
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
                    child: Text(_error!, style: const TextStyle(color: AppColors.textSecondary)),
                  ),
                ),
              if (_salesTiming?.hasData == true && _salesTiming!.recommendation != null)
                SliverToBoxAdapter(child: _SalesTimingCard(timing: _salesTiming!)),
              if (_multiCrop?.hasData == true)
                SliverToBoxAdapter(child: _MultiCropCard(result: _multiCrop!)),
              if (_chartSpots.length >= 2)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                    child: Card(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(12, 16, 16, 12),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Price trend (ETB)',
                              style: TextStyle(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 12),
                            SizedBox(
                              height: 200,
                              child: LineChart(
                                LineChartData(
                                  gridData: FlGridData(
                                    show: true,
                                    drawVerticalLine: false,
                                    getDrawingHorizontalLine: (v) => FlLine(
                                      color: AppColors.border,
                                      strokeWidth: 1,
                                    ),
                                  ),
                                  titlesData: FlTitlesData(
                                    leftTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        reservedSize: 44,
                                        getTitlesWidget: (v, _) => Text(
                                          v.toInt().toString(),
                                          style: const TextStyle(fontSize: 10),
                                        ),
                                      ),
                                    ),
                                    bottomTitles: AxisTitles(
                                      sideTitles: SideTitles(
                                        showTitles: true,
                                        reservedSize: 28,
                                        interval: (_trends.length / 4).clamp(1, 12).toDouble(),
                                        getTitlesWidget: (v, _) {
                                          final i = v.toInt();
                                          if (i < 0 || i >= _trends.length) {
                                            return const SizedBox.shrink();
                                          }
                                          final r = _trends[i];
                                          return Text(
                                            '${r.month}/${r.year % 100}',
                                            style: const TextStyle(fontSize: 9),
                                          );
                                        },
                                      ),
                                    ),
                                    rightTitles: const AxisTitles(),
                                    topTitles: const AxisTitles(),
                                  ),
                                  borderData: FlBorderData(show: false),
                                  lineBarsData: [
                                    LineChartBarData(
                                      spots: _chartSpots,
                                      isCurved: true,
                                      color: AppColors.primary,
                                      barWidth: 3,
                                      dotData: const FlDotData(show: false),
                                      belowBarData: BarAreaData(
                                        show: true,
                                        color: AppColors.primary.withValues(alpha: 0.12),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: Text(
                    'Price history (${_trends.length})',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
                ),
              ),
              if (_trends.isEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(20),
                    child: Text('No records to list.'),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final r = _trends[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                          child: Text(
                            r.month.toString(),
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                        title: Text('${r.cropName} · ${r.region}'),
                        subtitle: Text('${r.year}'),
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
              Text('Best month: ${rec['bestSellMonthName'] ?? rec['bestSellMonth']}'),
              Text('Expected gain: ${rec['expectedGainPercent']?.toString() ?? '—'}%'),
              Text('Latest price: ETB ${rec['latestKnownPrice']?.toString() ?? '—'}'),
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
