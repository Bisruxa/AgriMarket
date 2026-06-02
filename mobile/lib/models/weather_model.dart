class WeatherForecast {
  final Map<String, dynamic>? current;
  final List<Map<String, dynamic>> daily;
  final String? timezone;
  final String? farmName;

  const WeatherForecast({
    this.current,
    this.daily = const [],
    this.timezone,
    this.farmName,
  });

  factory WeatherForecast.fromJson(Map<String, dynamic> json) {
    final dailyRaw = json['daily'];
    final daily = <Map<String, dynamic>>[];
    if (dailyRaw is List) {
      for (final item in dailyRaw) {
        if (item is Map<String, dynamic>) daily.add(item);
      }
    }
    return WeatherForecast(
      current: json['current'] is Map<String, dynamic>
          ? json['current'] as Map<String, dynamic>
          : null,
      daily: daily,
      timezone: json['timezone']?.toString(),
      farmName: json['farmName']?.toString(),
    );
  }

  double? get currentTempC {
    final t = current?['temperatureC'];
    if (t is num) return t.toDouble();
    return double.tryParse(t?.toString() ?? '');
  }
}
