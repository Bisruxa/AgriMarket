class PriceRecord {
  final String id;
  final String cropName;
  final String region;
  final int year;
  final int month;
  final double avgPrice;

  const PriceRecord({
    required this.id,
    required this.cropName,
    required this.region,
    required this.year,
    required this.month,
    required this.avgPrice,
  });

  factory PriceRecord.fromJson(Map<String, dynamic> json) {
    return PriceRecord(
      id: json['id']?.toString() ?? '',
      cropName: json['cropName']?.toString() ?? '',
      region: json['region']?.toString() ?? '',
      year: json['year'] is num ? (json['year'] as num).toInt() : 0,
      month: json['month'] is num ? (json['month'] as num).toInt() : 0,
      avgPrice: json['avgPrice'] is num
          ? (json['avgPrice'] as num).toDouble()
          : double.tryParse(json['avgPrice']?.toString() ?? '') ?? 0,
    );
  }
}

class SalesTimingResult {
  final bool hasData;
  final String cropName;
  final Map<String, dynamic>? recommendation;

  const SalesTimingResult({
    required this.hasData,
    required this.cropName,
    this.recommendation,
  });

  factory SalesTimingResult.fromJson(Map<String, dynamic> json) {
    return SalesTimingResult(
      hasData: json['hasData'] == true,
      cropName: json['cropName']?.toString() ?? '',
      recommendation: json['recommendation'] is Map<String, dynamic>
          ? json['recommendation'] as Map<String, dynamic>
          : null,
    );
  }
}

class MultiCropProfitabilityResult {
  final bool hasData;
  final Map<String, dynamic>? summary;
  final List<Map<String, dynamic>> items;

  const MultiCropProfitabilityResult({
    required this.hasData,
    this.summary,
    this.items = const [],
  });

  factory MultiCropProfitabilityResult.fromJson(Map<String, dynamic> json) {
    final items = <Map<String, dynamic>>[];
    final raw = json['items'] ?? json['topRecommendations'];
    if (raw is List) {
      for (final e in raw) {
        if (e is Map<String, dynamic>) items.add(e);
      }
    }
    return MultiCropProfitabilityResult(
      hasData: json['hasData'] == true,
      summary: json['summary'] is Map<String, dynamic>
          ? json['summary'] as Map<String, dynamic>
          : null,
      items: items,
    );
  }
}
