import 'package:geolocator/geolocator.dart';

class LocationCaptureResult {
  final double latitude;
  final double longitude;

  const LocationCaptureResult({
    required this.latitude,
    required this.longitude,
  });
}

class LocationService {
  LocationService._();

  static Future<bool> isLocationServiceEnabled() {
    return Geolocator.isLocationServiceEnabled();
  }

  static Future<LocationPermission> checkPermission() {
    return Geolocator.checkPermission();
  }

  static Future<LocationPermission> requestPermission() {
    return Geolocator.requestPermission();
  }

  static Future<LocationCaptureResult?> captureCurrentPosition() async {
    final serviceEnabled = await isLocationServiceEnabled();
    if (!serviceEnabled) return null;

    var permission = await checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await requestPermission();
    }
    if (permission == LocationPermission.denied ||
        permission == LocationPermission.deniedForever) {
      return null;
    }

    final position = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: 15),
      ),
    );

    return LocationCaptureResult(
      latitude: position.latitude,
      longitude: position.longitude,
    );
  }
}
