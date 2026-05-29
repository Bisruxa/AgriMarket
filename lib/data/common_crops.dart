/// Common crops grown in Ethiopia for farmer registration.
const List<String> commonEthiopianCrops = [
  'Teff',
  'Wheat',
  'Barley',
  'Maize',
  'Sorghum',
  'Millet',
  'Rice',
  'Oats',
  'Coffee',
  'Sesame',
  'Niger Seed',
  'Sunflower',
  'Soybean',
  'Chickpea',
  'Haricot Beans',
  'Faba Beans',
  'Lentils',
  'Peas',
  'Potato',
  'Sweet Potato',
  'Enset',
  'Cotton',
  'Sugarcane',
  'Tobacco',
  'Chat',
  'Tomato',
  'Onion',
  'Garlic',
  'Cabbage',
  'Pepper',
  'Avocado',
  'Mango',
  'Banana',
  'Orange',
  'Papaya',
];

List<String> filterCrops(String query, {Set<String>? exclude}) {
  final q = query.trim().toLowerCase();
  Iterable<String> list = commonEthiopianCrops;
  if (exclude != null && exclude.isNotEmpty) {
    list = list.where((c) => !exclude.contains(c));
  }
  if (q.isEmpty) return list.toList();
  return list.where((c) => c.toLowerCase().contains(q)).toList();
}
