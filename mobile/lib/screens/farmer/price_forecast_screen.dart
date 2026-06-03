import 'package:flutter/material.dart';

import '../../models/agriai_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_dropdown.dart';

class PriceForecastScreen extends StatefulWidget {
  final String? defaultRegion;

  const PriceForecastScreen({super.key, this.defaultRegion});

  @override
  State<PriceForecastScreen> createState() => _PriceForecastScreenState();
}

class _PriceForecastScreenState extends State<PriceForecastScreen> {
  final _api = ApiService();

  static const _months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  List<String> _crops = [];
  List<String> _regions = [];
  List<int> _years = [];

  String? _selectedCrop;
  String? _selectedRegion;
  int? _selectedYear;
  int? _selectedMonth;

  bool _loadingMeta = true;
  bool _isPredicting = false;
  CropPriceForecast? _result;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMetadata();
  }

  Future<void> _loadMetadata() async {
    setState(() {
      _loadingMeta = true;
      _error = null;
    });

    try {
      final meta = await _api.getPriceForecasterMetadata();
      final crops = _parseStringList(meta['crops']);
      final regions = _parseStringList(meta['regions']);
      final now = DateTime.now();

      if (!mounted) return;
      setState(() {
        _crops = crops.isNotEmpty ? crops : ['Teff', 'Wheat', 'Maize', 'Barley'];
        _regions = regions.isNotEmpty
            ? regions
            : ['Oromia', 'Amhara', 'Addis Ababa', 'SNNP', 'Sidama'];
        _years = List.generate(5, (i) => now.year + i);
        _selectedCrop = _crops.first;
        final defaultRegion = widget.defaultRegion?.trim();
        _selectedRegion = defaultRegion != null &&
                defaultRegion.isNotEmpty &&
                _regions.contains(defaultRegion)
            ? defaultRegion
            : (_regions.contains('Oromia') ? 'Oromia' : _regions.first);
        _selectedYear = now.year;
        _selectedMonth = now.month;
        _loadingMeta = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loadingMeta = false;
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    }
  }

  List<String> _parseStringList(dynamic raw) {
    if (raw is! List) return [];
    return raw.map((e) => e.toString()).where((s) => s.isNotEmpty).toList();
  }

  Future<void> _predict() async {
    final crop = _selectedCrop;
    final region = _selectedRegion;
    final year = _selectedYear;
    final month = _selectedMonth;
    if (crop == null || region == null || year == null || month == null) return;

    setState(() {
      _isPredicting = true;
      _error = null;
      _result = null;
    });

    final response = await _api.predictCropPrice(
      cropName: crop,
      region: region,
      year: year,
      month: month,
    );

    if (!mounted) return;
    setState(() {
      _isPredicting = false;
      if (response.success && response.forecast != null) {
        _result = response.forecast;
      } else {
        _error = response.message ?? 'Failed to get price forecast';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Price forecast'),
      ),
      body: _loadingMeta
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : SafeArea(
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                      child: Text(
                        'Predict crop prices for your region using AgriAI.',
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.textSecondary.withValues(alpha: 0.95),
                          height: 1.45,
                        ),
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          CustomDropdown<String>(
                            label: 'Crop',
                            value: _selectedCrop,
                            items: _crops,
                            itemLabel: (c) => c,
                            onChanged: (v) => setState(() => _selectedCrop = v),
                          ),
                          CustomDropdown<String>(
                            label: 'Region',
                            value: _selectedRegion,
                            items: _regions,
                            itemLabel: (r) => r,
                            onChanged: (v) => setState(() => _selectedRegion = v),
                          ),
                          CustomDropdown<int>(
                            label: 'Year',
                            value: _selectedYear,
                            items: _years,
                            itemLabel: (y) => y.toString(),
                            onChanged: (v) => setState(() => _selectedYear = v),
                          ),
                          CustomDropdown<int>(
                            label: 'Month',
                            value: _selectedMonth,
                            items: List.generate(12, (i) => i + 1),
                            itemLabel: (m) => _months[m - 1],
                            onChanged: (v) => setState(() => _selectedMonth = v),
                          ),
                          CustomButton(
                            text: 'Get forecast',
                            isLoading: _isPredicting,
                            onPressed: _predict,
                          ),
                          if (_error != null) ...[
                            const SizedBox(height: 8),
                            Text(
                              _error!,
                              style: const TextStyle(color: AppColors.error, fontSize: 13),
                            ),
                          ],
                          if (_result != null) ...[
                            const SizedBox(height: 20),
                            _ForecastResultCard(forecast: _result!),
                          ],
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

class _ForecastResultCard extends StatelessWidget {
  final CropPriceForecast forecast;

  const _ForecastResultCard({required this.forecast});

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

  @override
  Widget build(BuildContext context) {
    final trendUp = forecast.trend.toLowerCase().contains('up') ||
        forecast.trend.toLowerCase().contains('increas') ||
        forecast.trendPercentage > 0;
    final trendDown = forecast.trend.toLowerCase().contains('down') ||
        forecast.trend.toLowerCase().contains('decreas') ||
        forecast.trendPercentage < 0;
    final monthLabel = forecast.month >= 1 && forecast.month <= 12
        ? _months[forecast.month - 1]
        : '';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            forecast.cropName,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          Text(
            '${forecast.region} · $monthLabel ${forecast.year}',
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 16),
          Text(
            'ETB ${forecast.predictedPrice.toStringAsFixed(0)}',
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          const Text(
            'predicted price per unit',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: trendUp
                  ? Colors.green.shade50
                  : trendDown
                      ? Colors.red.shade50
                      : AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: trendUp
                    ? Colors.green.shade200
                    : trendDown
                        ? Colors.red.shade200
                        : AppColors.border,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  trendUp
                      ? Icons.trending_up_rounded
                      : trendDown
                          ? Icons.trending_down_rounded
                          : Icons.trending_flat_rounded,
                  size: 18,
                  color: trendUp
                      ? Colors.green.shade700
                      : trendDown
                          ? Colors.red.shade700
                          : AppColors.textSecondary,
                ),
                const SizedBox(width: 6),
                Text(
                  '${forecast.trend} · ${forecast.trendPercentage.abs().toStringAsFixed(1)}%',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: trendUp
                        ? Colors.green.shade800
                        : trendDown
                            ? Colors.red.shade800
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
