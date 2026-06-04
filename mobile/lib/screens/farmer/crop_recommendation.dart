import 'package:flutter/material.dart';

import '../../models/agriai_model.dart';
import '../../models/farm_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_dropdown.dart';

class CropRecommendation extends StatefulWidget {
  const CropRecommendation({super.key});

  @override
  State<CropRecommendation> createState() => _CropRecommendationState();
}

class _CropRecommendationState extends State<CropRecommendation> {
  final _api = ApiService();

  List<Farm> _farms = [];
  bool _loadingFarms = true;
  bool _isLoading = false;
  Farm? _selectedFarm;
  List<CropRecommendationItem> _recommendations = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFarms();
  }

  Future<void> _loadFarms() async {
    setState(() {
      _loadingFarms = true;
      _error = null;
    });
    final result = await _api.getFarms();
    if (!mounted) return;
    setState(() {
      _loadingFarms = false;
      _farms = result.success ? result.farms : [];
    });
  }

  bool get _hasValidInput => _selectedFarm != null;

  bool get _canPressButton => !_isLoading && !_loadingFarms && _hasValidInput;

  void _onGetRecommendation() {
    if (!_hasValidInput) return;
    _fetchRecommendations();
  }

  Future<void> _fetchRecommendations() async {
    final farm = _selectedFarm!;
    setState(() {
      _isLoading = true;
      _error = null;
      _recommendations = [];
    });

    final result = await _api.getCropRecommendations(
      nitrogen: farm.nitrogen ?? 60,
      phosphorus: farm.phosphorus ?? 20,
      potassium: farm.potassium ?? 30,
      temperature: farm.temperature ?? 25,
      humidity: farm.humidity ?? 60,
      ph: farm.ph ?? 6.5,
      rainfall: farm.rainfall ?? 100,
      soilColor: farm.soilColor ?? 'brown',
    );

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      if (result.success) {
        _recommendations = result.recommendations;
        if (result.recommendations.isEmpty) {
          _error = 'No suitable crops found for this farm profile.';
        }
      } else {
        _error = result.message ?? 'Failed to get recommendations';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        title: const Text('Crop Insights'),
      ),
      body: SafeArea(
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (_loadingFarms)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: CircularProgressIndicator(color: AppColors.primary),
                        ),
                      )
                    else if (_farms.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        child: Column(
                          children: [
                            Icon(
                              Icons.agriculture_outlined,
                              size: 48,
                              color: AppColors.textSecondary.withValues(alpha: 0.5),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'No farms registered yet',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.titleLarge,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Add a farm under My Farms first to get recommendations.',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                          ],
                        ),
                      )
                    else
                      CustomDropdown<Farm>(
                        label: 'Select your farm',
                        hint: 'Choose a registered farm',
                        value: _selectedFarm,
                        items: _farms,
                        itemLabel: (f) => f.name,
                        onChanged: (farm) {
                          setState(() {
                            _selectedFarm = farm;
                            _recommendations = [];
                            _error = null;
                          });
                        },
                      ),
                    if (_selectedFarm != null) ...[
                      const SizedBox(height: 12),
                      _FarmSummaryCard(farm: _selectedFarm!),
                    ],
                    const SizedBox(height: 20),
                    CustomButton(
                      text: _isLoading ? 'Analyzing...' : 'Get Recommendation',
                      isLoading: _isLoading,
                      onPressed: _canPressButton ? _onGetRecommendation : null,
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: 16),
                      Text(
                        _error!,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.error, fontSize: 13),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            if (_recommendations.isNotEmpty)
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                sliver: SliverList.separated(
                  itemCount: _recommendations.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    return _RecommendationResultCard(
                      recommendation: _recommendations[index],
                      rank: index + 1,
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _FarmSummaryCard extends StatelessWidget {
  final Farm farm;

  const _FarmSummaryCard({required this.farm});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          _SummaryRow(
            icon: Icons.eco_outlined,
            label: farm.soilType != null ? '${farm.soilType} soil' : 'Soil type not set',
          ),
          const SizedBox(height: 8),
          _SummaryRow(icon: Icons.location_on_outlined, label: farm.locationLabel),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final IconData icon;
  final String label;

  const _SummaryRow({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }
}

class _RecommendationResultCard extends StatelessWidget {
  final CropRecommendationItem recommendation;
  final int rank;

  const _RecommendationResultCard({
    required this.recommendation,
    required this.rank,
  });

  @override
  Widget build(BuildContext context) {
    final pct = (recommendation.confidence <= 1
            ? recommendation.confidence * 100
            : recommendation.confidence)
        .round()
        .clamp(0, 100);
    final suitability = _suitabilityLabel(recommendation.confidence);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: rank == 1
              ? AppColors.primary.withValues(alpha: 0.3)
              : AppColors.border,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            child: Text(
              '$rank',
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  recommendation.crop,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  suitability.label,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: suitability.color,
                  ),
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: pct / 100,
                    minHeight: 6,
                    backgroundColor: AppColors.border,
                    color: suitability.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '$pct% match',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  _Suitability _suitabilityLabel(double confidence) {
    final value = confidence <= 1 ? confidence : confidence / 100;
    if (value >= 0.7) {
      return _Suitability('Highly suitable', AppColors.primary);
    }
    if (value >= 0.4) {
      return const _Suitability('Moderately suitable', Color(0xFFF57C00));
    }
    if (value >= 0.1) {
      return const _Suitability('Low suitability', Color(0xFFE65100));
    }
    return const _Suitability('Not recommended', AppColors.error);
  }
}

class _Suitability {
  final String label;
  final Color color;

  const _Suitability(this.label, this.color);
}
