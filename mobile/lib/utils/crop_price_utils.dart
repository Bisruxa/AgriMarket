/// Maps UI crop keys to database crop names (same logic as web farmer/trends).
class CropPriceUtils {
  CropPriceUtils._();

  static const cropKeywords = <String, List<String>>{
    'teff': ['Teff (white)', 'Teff (mixed)', 'Teff (black)'],
    'barley': ['Barley (white)', 'Barley (mixed)'],
    'wheat': ['Wheat (white)', 'Wheat (mixed)'],
    'sorghum': ['Sorghum (white)', 'Sorghum (red)', 'Sorghum (yellow)'],
    'maize': ['Maize'],
    'potato': ['Potato'],
    'onion': ['Onion'],
    'tomato': ['Tomato'],
    'coffee': ['Coffee (beans)', 'Coffee (whole)'],
  };

  static const cropLabels = <String, String>{
    'teff': 'Teff',
    'barley': 'Barley',
    'wheat': 'Wheat',
    'sorghum': 'Sorghum',
    'maize': 'Maize',
    'potato': 'Potato',
    'onion': 'Onion',
    'tomato': 'Tomato',
    'coffee': 'Coffee',
  };

  static List<String> get commonCropKeys => cropKeywords.keys.toList();

  static String labelForKey(String key) =>
      cropLabels[key.toLowerCase()] ?? _titleCase(key);

  static List<String> dbNamesForKey(String key) {
    final k = key.toLowerCase();
    return cropKeywords[k] ?? [key];
  }

  /// Pick best key when API returns full DB name e.g. "Teff (white)".
  static String? keyForDbName(String dbName) {
    final lower = dbName.toLowerCase();
    for (final entry in cropKeywords.entries) {
      if (entry.value.any((n) => n.toLowerCase() == lower)) {
        return entry.key;
      }
    }
    return null;
  }

  static List<String> groupedKeysFromDbCrops(List<String> dbCrops) {
    final keys = <String>{};
    for (final name in dbCrops) {
      final k = keyForDbName(name);
      if (k != null) {
        keys.add(k);
      }
    }
    if (keys.isEmpty) return commonCropKeys;
    return keys.toList()..sort();
  }

  static String _titleCase(String s) {
    if (s.isEmpty) return s;
    return s[0].toUpperCase() + s.substring(1);
  }

  /// Maps AgriAI / ML crop label to a DB crop name for price prediction.
  static String dbNameForMlCrop(String mlCrop, {String fallbackKey = 'teff'}) {
    final lower = mlCrop.toLowerCase().trim();
    if (lower.isEmpty) return dbNamesForKey(fallbackKey).first;

    for (final entry in cropKeywords.entries) {
      if (lower.contains(entry.key)) return entry.value.first;
      for (final name in entry.value) {
        final nameLower = name.toLowerCase();
        if (nameLower.contains(lower) || lower.contains(entry.key)) {
          return name;
        }
      }
    }
    return dbNamesForKey(fallbackKey).first;
  }
}
