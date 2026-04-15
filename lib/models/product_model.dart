class Product {
  final String id;
  final String cropName;
  final double quantity; // in quintals
  final double pricePerQuintal;
  final String quality; // Grade 1, Grade 2, etc.
  final String harvestDate;
  final String location;
  // final String farmerName;
  final String farmerId;
  final bool isAvailable;
  final String imageUrl;
  final List<String> images;

  Product({
    required this.id,
    required this.cropName,
    required this.quantity,
    required this.pricePerQuintal,
    required this.quality,
    required this.harvestDate,
    required this.location,
    // required this.farmerName,
    required this.farmerId,
    this.isAvailable = true,
    required this.imageUrl,
    required this.images,
  });
}

// Mock products for marketplace
final List<Product> mockProducts = [
  Product(
    id: '1',
    cropName: 'White Teff',
    quantity: 25.5,
    pricePerQuintal: 4800,
    quality: 'Grade 1',
    harvestDate: '2024-12-15',
    location: 'Ada\'a, Oromia',
    // farmerName: 'Tesfaye K.',
    farmerId: 'f1',
    imageUrl: 'assets/images/teff_product.jpg',
    images: ['assets/images/teff_product.jpg'],
  ),
  Product(
    id: '2',
    cropName: 'Arabica Coffee',
    quantity: 12.0,
    pricePerQuintal: 12500,
    quality: 'Grade 1',
    harvestDate: '2024-11-20',
    location: 'Yirgacheffe, SNNPR',
    // farmerName: 'Almaz W.',
    farmerId: 'f2',
    imageUrl: 'assets/images/coffee_product.jpg',
    images: ['assets/images/coffee_product.jpg'],
  ),
  Product(
    id: '3',
    cropName: 'Maize',
    quantity: 50.0,
    pricePerQuintal: 2900,
    quality: 'Grade 2',
    harvestDate: '2024-10-10',
    location: 'Bako, Oromia',
    // farmerName: 'Girma A.',
    farmerId: 'f3',
    imageUrl: 'assets/images/maize_product.jpg',
    images: ['assets/images/maize_product.jpg'],
  ),
];