import 'package:flutter/material.dart';

import '../../models/weather_model.dart';

String _formatCurrentDate(DateTime date) {
  const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  const months = [
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
  return '${weekdays[date.weekday - 1]}, ${months[date.month - 1]} ${date.day}, ${date.year}';
}

List<String> _forecastDayLabels(DateTime today) {
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return [
    'Today',
    shortDays[today.add(const Duration(days: 1)).weekday - 1],
    shortDays[today.add(const Duration(days: 2)).weekday - 1],
  ];
}

class FarmerWeatherCard extends StatelessWidget {
  final String greetingName;
  final WeatherForecast? forecast;
  final bool isLoading;

  const FarmerWeatherCard({
    super.key,
    required this.greetingName,
    this.forecast,
    this.isLoading = false,
  });

  String _weatherDetail(int? code) {
    if (code == null) return '—';
    if (code == 0) return 'Clear';
    if (code <= 3) return 'Cloudy';
    if (code <= 67) return 'Rain';
    return 'Storm';
  }

  IconData _weatherIcon(int? code) {
    if (code == null) return Icons.wb_cloudy_rounded;
    if (code == 0) return Icons.wb_sunny_rounded;
    if (code <= 3) return Icons.wb_cloudy_rounded;
    if (code <= 67) return Icons.grain_rounded;
    return Icons.thunderstorm_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final dayLabels = _forecastDayLabels(DateTime.now());
    final daily = forecast?.daily ?? [];
    final currentTemp = forecast?.currentTempC;

    if (isLoading) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1E88E5), Color(0xFF43A047)],
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Center(
          child: CircularProgressIndicator(color: Colors.white),
        ),
      );
    }

    String seasonalAlert = 'Check field conditions for the week ahead.';
    if (daily.isNotEmpty) {
      final maxRain = daily
          .map((d) => (d['precipitationSumMm'] as num?)?.toDouble() ?? 0)
          .fold<double>(0, (a, b) => a > b ? a : b);
      if (maxRain >= 40) {
        seasonalAlert = 'Heavy rain expected — plan field work accordingly.';
      }
    }
    if (forecast?.farmName != null) {
      seasonalAlert = '${forecast!.farmName}: $seasonalAlert';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1E88E5), Color(0xFF43A047)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1E88E5).withValues(alpha: 0.25),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Hello, $greetingName!',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _formatCurrentDate(DateTime.now()),
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: List.generate(3, (i) {
              if (i < daily.length) {
                final d = daily[i];
                final code = d['weatherCode'] is num
                    ? (d['weatherCode'] as num).toInt()
                    : null;
                final maxT = d['tempMaxC'];
                final tempStr = maxT is num
                    ? '${maxT.round()}°C'
                    : (currentTemp != null && i == 0
                        ? '${currentTemp.round()}°C'
                        : '—');
                return Expanded(
                  child: _ForecastDay(
                    label: dayLabels[i],
                    temp: tempStr,
                    detail: _weatherDetail(code),
                    icon: _weatherIcon(code),
                  ),
                );
              }
              return Expanded(
                child: _ForecastDay(
                  label: dayLabels[i],
                  temp: i == 0 && currentTemp != null
                      ? '${currentTemp.round()}°C'
                      : '—',
                  detail: '—',
                  icon: Icons.wb_cloudy_rounded,
                ),
              );
            }),
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              seasonalAlert,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.95),
                fontSize: 12,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ForecastDay extends StatelessWidget {
  final String label;
  final String temp;
  final String detail;
  final IconData icon;

  const _ForecastDay({
    required this.label,
    required this.temp,
    required this.detail,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.85),
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 6),
        Icon(icon, color: Colors.white, size: 26),
        const SizedBox(height: 4),
        Text(
          temp,
          style: const TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w700,
            fontSize: 15,
          ),
        ),
        Text(
          detail,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.85),
            fontSize: 11,
          ),
        ),
      ],
    );
  }
}
