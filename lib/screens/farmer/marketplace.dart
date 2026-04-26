import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/product_model.dart';
import '../../widgets/product_card.dart';
import '../../widgets/add_product.dart';
import '../auth/login_screen.dart';

class MarketplaceScreen extends StatefulWidget {
  const MarketplaceScreen({super.key});

  @override
  State<MarketplaceScreen> createState() => _MarketplaceScreenState();
}

class _MarketplaceScreenState extends State<MarketplaceScreen> {
  final ApiService _apiService = ApiService();
  List<Product> products = [];
  bool isLoading = true;
  String? errorMessage;
  int currentPage = 1;
  int totalPages = 1;
  bool isLoadingMore = false;

  @override
  void initState() {
    super.initState();
    fetchProducts();
  }

  Future<void> fetchProducts({bool loadMore = false}) async {
    if (loadMore && (isLoadingMore || currentPage >= totalPages)) return;
    
    setState(() {
      if (loadMore) isLoadingMore = true;
      else isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await _apiService.get('/products/my-products?page=$currentPage&limit=10');
      
      if (response.statusCode == 200 && response.data['success']) {
        final newProducts = (response.data['data'] as List)
            .map((json) => Product.fromJson(json))
            .toList();
        
        setState(() {
          if (loadMore) products.addAll(newProducts);
          else products = newProducts;
          totalPages = response.data['pagination']?['pages'] ?? 1;
          currentPage = response.data['pagination']?['page'] ?? 1;
          isLoading = isLoadingMore = false;
        });
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to load products');
      }
    } catch (e) {
      setState(() => errorMessage = e.toString());
      _showSnackBar('Error: $e', Colors.red);
    } finally {
      if (mounted) setState(() => isLoading = isLoadingMore = false);
    }
  }

  Future<void> addProduct(Product product) async {
    setState(() => isLoading = true);
    try {
      final response = await _apiService.post('/products', product.toJson());
      
      if (response.statusCode == 201 && response.data['success']) {
        currentPage = 1;
        await fetchProducts();
        Navigator.pop(context);
        _showSnackBar('✅ Product added successfully', Colors.green);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to add product');
      }
    } catch (e) {
      _showSnackBar('Error: $e', Colors.red);
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      final response = await _apiService.delete('/products/$id');
      if (response.statusCode == 200 && response.data['success']) {
        await fetchProducts();
        _showSnackBar('✅ Product deleted', Colors.green);
      }
    } catch (e) {
      _showSnackBar('Error deleting: $e', Colors.red);
    }
  }

  Future<void> _handleUnauthorized() async {
    await _apiService.logout();
    if (mounted) {
      Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => const LoginScreen()), (route) => false);
    }
  }

  void _showSnackBar(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: color, behavior: SnackBarBehavior.floating, duration: const Duration(seconds: 2)),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Product'),
        content: const Text('Are you sure?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          TextButton(onPressed: () { Navigator.pop(context); deleteProduct(id); }, style: TextButton.styleFrom(foregroundColor: Colors.red), child: const Text('Delete')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Products'),
        backgroundColor: Colors.green.shade700,
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: () => showDialog(context: context, builder: (_) => AddProductDialog(onAdd: addProduct))),
          IconButton(icon: const Icon(Icons.refresh), onPressed: () { currentPage = 1; fetchProducts(); }),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async { currentPage = 1; await fetchProducts(); },
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (isLoading && products.isEmpty) {
      return const Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [CircularProgressIndicator(), SizedBox(height: 16), Text('Loading...')]));
    }
    
    if (errorMessage != null && products.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.error_outline, size: 64, color: Colors.grey.shade400),
        const SizedBox(height: 16),
        Text(errorMessage!, style: TextStyle(color: Colors.grey.shade600)),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: () { currentPage = 1; fetchProducts(); }, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2A5A2A)), child: const Text('Retry')),
      ]));
    }
    
    if (products.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.inventory_2_outlined, size: 80, color: Colors.grey.shade400),
        const SizedBox(height: 16),
        Text('No products found', style: TextStyle(fontSize: 18, color: Colors.grey.shade600)),
        const SizedBox(height: 8),
        Text('Tap + to add your first product', style: TextStyle(fontSize: 14, color: Colors.grey.shade500)),
      ]));
    }
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: products.length + (isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == products.length) return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
        return ProductCard(product: products[index], onDelete: () => _confirmDelete(products[index].id));
      },
    );
  }
}