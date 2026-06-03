/// Local image paths under [assets/images/] (see pubspec.yaml).
abstract final class AppAssets {
  static const images = 'assets/images';

  static const welcome = '$images/welcome.png';
  static const connect = '$images/connect.png';
  static const insights = '$images/insights.png';

  static const crop1 = '$images/Crop1.jpg';
  static const crop2 = '$images/Crop2.jpg';
  static const crop3 = '$images/Crop3.jpg';
  static const crop4 = '$images/Crop4.jpg';
  static const crop5 = '$images/Crop5.jpg';
  static const crop6 = '$images/Crop6.jpg';

  static const crops = [crop1, crop2, crop3, crop4, crop5, crop6];

  /// Maps dashboard crop keys to commodity ticker photos.
  static const commodityByKey = {
    'teff': crop1,
    'wheat': crop2,
    'maize': crop3,
    'barley': crop4,
  };

  static String cropForIndex(int index) => crops[index % crops.length];
}
