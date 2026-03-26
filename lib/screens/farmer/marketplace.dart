import 'package:flutter/material.dart';
import '../../models/product_model.dart';
import '../../widgets/product_card.dart';

class Marketplace extends StatefulWidget {
  const Marketplace({super.key});

  @override
  State<Marketplace> createState() => _MarketplaceState();
}

class _MarketplaceState extends State<Marketplace> {
  final List<Product> _myProducts = [
    Product(
      id: '101',
      cropName: 'White Teff',
      quantity: 15.5,
      pricePerQuintal: 4700,
      quality: 'Grade 1',
      harvestDate: '2024-12-10',
      location: 'Ada\'a, Oromia',
      farmerName: 'Bisrat A.',
      farmerId: 'f1',
      imageUrl: 'assets/images/teff_product.jpg',
      images: ['assets/images/teff_product.jpg'],
    ),
    Product(
      id: '102',
      cropName: 'Maize',
      quantity: 30.0,
      pricePerQuintal: 2850,
      quality: 'Grade 2',
      harvestDate: '2024-11-05',
      location: 'Ada\'a, Oromia',
      farmerName: 'Bisrat A.',
      farmerId: 'f1',
      imageUrl: 'assets/images/maize_product.jpg',
      images: ['assets/images/maize_product.jpg'],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Marketplace'),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: const Color(0xFF2A5A2A),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle),
            onPressed: _showAddProductDialog,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // My Products Section
            const Text(
              'My Products',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            if (_myProducts.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                child: const Center(
                  child: Text(
                    'No products listed yet. Tap + to add your first product.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
              )
            else
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  childAspectRatio: 0.75,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemCount: _myProducts.length,
                itemBuilder: (context, index) {
                  return Stack(
                    children: [
                      ProductCard(
                        product: _myProducts[index],
                        onTap: () {},
                      ),
                      Positioned(
                        top: 8,
                        right: 8,
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.2),
                                blurRadius: 4,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              IconButton(
                                icon: const Icon(Icons.edit, size: 16),
                                onPressed: () {},
                                color: Colors.blue,
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete, size: 16),
                                onPressed: () {
                                  setState(() {
                                    _myProducts.removeAt(index);
                                  });
                                },
                                color: Colors.red,
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),

            const SizedBox(height: 24),

            // All Listings Section
            const Text(
              'All Listings',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),

            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: mockProducts.length,
              itemBuilder: (context, index) {
                return ProductCard(
                  product: mockProducts[index],
                  onTap: () {},
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAddProductDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => const AddProductSheet(),
    );
  }
}

// Add Product Bottom Sheet
class AddProductSheet extends StatefulWidget {
  const AddProductSheet({super.key});

  @override
  State<AddProductSheet> createState() => _AddProductSheetState();
}

class _AddProductSheetState extends State<AddProductSheet> {
  final _formKey = GlobalKey<FormState>();
  final _cropController = TextEditingController();
  final _quantityController = TextEditingController();
  final _priceController = TextEditingController();
  String? _selectedQuality;

  final List<String> _qualities = ['Grade 1', 'Grade 2', 'Grade 3'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 20,
        right: 20,
        top: 20,
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Add New Product',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),

            // Crop Name
            TextFormField(
              controller: _cropController,
              decoration: const InputDecoration(
                labelText: 'Crop Name',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter crop name';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Quantity
            TextFormField(
              controller: _quantityController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Quantity (in quintals)',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter quantity';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Price
            TextFormField(
              controller: _priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Price per Quintal (ETB)',
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter price';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Quality
            DropdownButtonFormField<String>(
              value: _selectedQuality,
              hint: const Text('Select Quality'),
              items: _qualities.map((quality) {
                return DropdownMenuItem(
                  value: quality,
                  child: Text(quality),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  _selectedQuality = value;
                });
              },
              decoration: const InputDecoration(
                border: OutlineInputBorder(),
              ),
              validator: (value) {
                if (value == null) {
                  return 'Please select quality';
                }
                return null;
              },
            ),
            const SizedBox(height: 20),

            // Buttons
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Cancel'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        // Save product
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('Product added successfully!'),
                            backgroundColor: Color(0xFF2A5A2A),
                          ),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2A5A2A),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text('Add Product'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _cropController.dispose();
    _quantityController.dispose();
    _priceController.dispose();
    super.dispose();
  }
}