import 'dart:async';

import 'package:flutter/material.dart';
import '../../models/product_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../utils/logout_helper.dart';
import '../../widgets/farmer_info_popup.dart';

class TraderProductsScreen extends StatefulWidget {
  const TraderProductsScreen({super.key});

  @override
  State<TraderProductsScreen> createState() => _TraderProductsScreenState();
}

class _TraderProductsScreenState extends State<TraderProductsScreen> {
  final ApiService _apiService = ApiService();
  final _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  List<Product> products = [];
  bool isLoading = true;
  String? errorMessage;
  int currentPage = 1;
  int totalPages = 1;
  static const int _pageLimit = 10;

  String? _selectedCategory;
  bool? _availableOnly = true;
  Timer? _searchDebounce;

  static const _categories = [
    'VEGETABLES',
    'FRUITS',
    'GRAINS',
    'DAIRY',
    'MEAT',
    'OTHER',
  ];

  @override
  void initState() {
    super.initState();
    fetchProducts();
    _searchController.addListener(_onSearchChanged);
  }

  void _onSearchChanged() {
    setState(() {});
    _searchDebounce?.cancel();
    _searchDebounce = Timer(const Duration(milliseconds: 450), () {
      if (mounted) fetchProducts(resetPage: true);
    });
  }

  @override
  void dispose() {
    _searchDebounce?.cancel();
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  List<Product> get _filteredProducts => products;

  void _showFarmerInfoDialog(Product product) {
    showDialog<void>(
      context: context,
      builder: (_) => FarmerInfoPopup(product: product),
    );
  }

  Future<void> fetchProducts({bool resetPage = false}) async {
    if (resetPage) currentPage = 1;
    setState(() {
      isLoading = true;
      errorMessage = null;
    });

    try {
      final response = await _apiService.getProducts(
        category: _selectedCategory,
        available: _availableOnly,
        search: _searchController.text.trim().isEmpty
            ? null
            : _searchController.text.trim(),
        page: currentPage,
        limit: _pageLimit,
      );

      if (response.statusCode == 200 && response.data['success'] == true) {
        final list = response.data['data'] as List? ?? [];
        setState(() {
          products = list.map((json) => Product.fromJson(json)).toList();
          totalPages = response.data['pagination']?['totalPages'] ?? 1;
          currentPage = response.data['pagination']?['page'] ?? 1;
          isLoading = false;
        });
      } else if (response.statusCode == 401) {
        if (mounted) await logoutAndRedirect(context);
      } else {
        throw Exception(response.data['message'] ?? 'Failed to load products');
      }
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
        isLoading = false;
      });
    }
  }

  void _openForecast() {
    Navigator.of(context).pushNamed('/farmer-price-forecast');
  }

  void _focusCropSearch() {
    if (!mounted) return;
    // Avoid direct FocusNode.requestFocus on Flutter web interop path.
    FocusScope.of(context).requestFocus(_searchFocusNode);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Search by crop name (e.g., teff, coffee, maize).')),
    );
  }

  void _showFarmersQuickSheet() {
    final farmersById = <String, Product>{};
    for (final product in products) {
      final farmer = product.farmer;
      if (farmer == null || farmer.id.isEmpty) continue;
      farmersById.putIfAbsent(farmer.id, () => product);
    }
    final farmerProducts = farmersById.values.toList();

    if (farmerProducts.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No farmer profiles available in current listings.')),
      );
      return;
    }

    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return SafeArea(
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
            itemCount: farmerProducts.length,
            separatorBuilder: (context, index) => const Divider(height: 1),
            itemBuilder: (context, index) {
              final product = farmerProducts[index];
              final farmer = product.farmer!;
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const CircleAvatar(
                  backgroundColor: AppColors.surface,
                  child: Icon(Icons.person_outline_rounded),
                ),
                title: Text(farmer.name),
                subtitle: Text(
                  farmer.locationLabel.isNotEmpty ? farmer.locationLabel : product.location,
                ),
                trailing: farmer.isVerified
                    ? const Icon(Icons.verified_rounded, color: Colors.green, size: 18)
                    : null,
                onTap: () {
                  Navigator.of(context).pop();
                  _showFarmerInfoDialog(product);
                },
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Browse Market',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontSize: 24,
                    ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  OutlinedButton.icon(
                    onPressed: _openForecast,
                    icon: const Icon(Icons.auto_awesome_rounded, size: 18),
                    label: const Text('Forecast (AI)'),
                  ),
                  OutlinedButton.icon(
                    onPressed: _showFarmersQuickSheet,
                    icon: const Icon(Icons.groups_rounded, size: 18),
                    label: const Text('Farmers'),
                  ),
                  OutlinedButton.icon(
                    onPressed: _focusCropSearch,
                    icon: const Icon(Icons.eco_rounded, size: 18),
                    label: const Text('Crops'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _searchController,
                focusNode: _searchFocusNode,
                decoration: InputDecoration(
                  hintText: 'Search crops, regions...',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: const BorderSide(color: AppColors.border),
                  ),
                ),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
          child: Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<String?>(
                  initialValue: _selectedCategory,
                  decoration: const InputDecoration(
                    labelText: 'Category',
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: [
                    const DropdownMenuItem(
                      value: null,
                      child: Text('All categories'),
                    ),
                    ..._categories.map(
                      (c) => DropdownMenuItem(value: c, child: Text(c)),
                    ),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedCategory = value);
                    currentPage = 1;
                    fetchProducts();
                  },
                ),
              ),
              const SizedBox(width: 12),
              FilterChip(
                label: const Text('Available'),
                selected: _availableOnly == true,
                onSelected: (selected) {
                  setState(() => _availableOnly = selected ? true : null);
                  currentPage = 1;
                  fetchProducts();
                },
                selectedColor: AppColors.traderAccent.withValues(alpha: 0.15),
                checkmarkColor: AppColors.traderAccent,
              ),
            ],
          ),
        ),
        Expanded(child: _buildProductList()),
      ],
    );
  }

  Widget _buildProductList() {
    if (isLoading && products.isEmpty) {
      return const Center(
        child: CircularProgressIndicator(color: AppColors.traderAccent),
      );
    }

    if (errorMessage != null && products.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.cloud_off_outlined, size: 48),
              const SizedBox(height: 12),
              Text(errorMessage!, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: fetchProducts,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.traderAccent,
                ),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    final items = _filteredProducts;

    if (items.isEmpty) {
      return Center(
        child: Text(
          isLoading ? 'Loading products...' : 'No products found',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        currentPage = 1;
        await fetchProducts();
      },
      color: AppColors.traderAccent,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
        itemCount: items.length,
        itemBuilder: (context, index) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: TraderProductRow(
              product: items[index],
              onTap: () => _showFarmerInfoDialog(items[index]),
              showFarmerHint: true,
            ),
          );
        },
      ),
    );
  }
}

class TraderProductRow extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;
  final bool showFarmerHint;

  const TraderProductRow({
    super.key,
    required this.product,
    this.onTap,
    this.showFarmerHint = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  color: AppColors.primary.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.eco_rounded, color: AppColors.primary),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (product.farmer != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(
                            Icons.person_outline_rounded,
                            size: 14,
                            color: AppColors.traderAccent.withValues(alpha: 0.9),
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              product.farmer!.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.traderAccent.withValues(alpha: 0.95),
                              ),
                            ),
                          ),
                          if (product.farmer!.isVerified)
                            Icon(
                              Icons.verified_rounded,
                              size: 14,
                              color: Colors.green.shade700,
                            ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 2),
                    Text(
                      product.farmer?.locationLabel.isNotEmpty == true
                          ? product.farmer!.locationLabel
                          : product.location,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontSize: 12,
                          ),
                    ),
                    if (product.category.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        product.category,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize: 11,
                            ),
                      ),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'ETB ${product.price.toStringAsFixed(0)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.traderAccent,
                    ),
                  ),
                  Text(
                    '/${product.unit}',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontSize: 11,
                        ),
                  ),
                  if (product.isOrganic)
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'Organic',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ),
                  if (showFarmerHint && onTap != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      'Tap for farmer details',
                      style: TextStyle(
                        fontSize: 10,
                        color: AppColors.textSecondary.withValues(alpha: 0.9),
                      ),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
