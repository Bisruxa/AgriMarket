import 'package:flutter/material.dart';
import '../services/location_service.dart';
import '../theme/app_theme.dart';
import 'app_locale_scope.dart';

typedef LocationCapturedCallback = void Function(double? latitude, double? longitude);

class RegistrationLocationCapture extends StatefulWidget {
  final LocationCapturedCallback onLocationChanged;

  const RegistrationLocationCapture({
    super.key,
    required this.onLocationChanged,
  });

  @override
  State<RegistrationLocationCapture> createState() =>
      _RegistrationLocationCaptureState();
}

class _RegistrationLocationCaptureState extends State<RegistrationLocationCapture> {
  bool _promptShown = false;
  bool _isLoading = false;
  double? _latitude;
  double? _longitude;
  String? _statusMessage;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _askToTrackLocation());
  }

  Future<void> _askToTrackLocation() async {
    if (!mounted || _promptShown) return;
    _promptShown = true;
    final l10n = AppLocaleScope.l10nOf(context);

    final allowed = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.allowLocationAccess),
        content: Text(l10n.allowLocationAccessDesc),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.no),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.yes),
          ),
        ],
      ),
    );

    if (!mounted) return;

    if (allowed == true) {
      await _captureLocation();
    } else {
      setState(() {
        _statusMessage = l10n.locationNotAllowed;
      });
      widget.onLocationChanged(null, null);
    }
  }

  Future<void> _captureLocation() async {
    final l10n = AppLocaleScope.l10nOf(context);
    setState(() {
      _isLoading = true;
      _statusMessage = null;
    });

    try {
      final result = await LocationService.captureCurrentPosition();
      if (!mounted) return;

      if (result == null) {
        setState(() {
          _isLoading = false;
          _latitude = null;
          _longitude = null;
          _statusMessage = l10n.couldNotGetLocation;
        });
        widget.onLocationChanged(null, null);
        return;
      }

      setState(() {
        _isLoading = false;
        _latitude = result.latitude;
        _longitude = result.longitude;
        _statusMessage = null;
      });
      widget.onLocationChanged(result.latitude, result.longitude);
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isLoading = false;
        _statusMessage = l10n.failedToReadLocation;
      });
      widget.onLocationChanged(null, null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.my_location, color: AppColors.primary, size: 22),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  l10n.deviceLocation,
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontSize: 16,
                      ),
                ),
              ),
              if (!_isLoading && (_latitude == null || _longitude == null))
                TextButton(
                  onPressed: _captureLocation,
                  child: Text(l10n.tryAgain),
                ),
            ],
          ),
          const SizedBox(height: 8),
          if (_isLoading)
            Row(
              children: [
                const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
                const SizedBox(width: 10),
                Text(l10n.gettingLocation),
              ],
            )
          else if (_latitude != null && _longitude != null)
            Text(
              l10n.coordinatesText(_latitude!, _longitude!),
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
                height: 1.45,
              ),
            )
          else if (_statusMessage != null)
            Text(
              _statusMessage!,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            )
          else
            Text(
              l10n.waitingLocationPermission,
              style: const TextStyle(
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),
        ],
      ),
    );
  }
}
