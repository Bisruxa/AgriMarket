import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/product_model.dart';
import '../../theme/app_theme.dart';
import '../../widgets/product_card.dart';
import '../../widgets/add_product.dart';
import '../../l10n/app_localizations.dart';
import '../../widgets/app_locale_scope.dart';
import '../../widgets/language_toggle.dart';
import '../../utils/logout_helper.dart';

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
  static const int _pageLimit = 10;

  String? _selectedCategory;
  bool? _availableOnly;

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
  }

  Future<void> fetchProducts({bool loadMore = false}) async {
    if (loadMore && (isLoadingMore || currentPage >= totalPages)) return;

    setState(() {
      if (loadMore) {
        isLoadingMore = true;
      } else {
        isLoading = true;
      }
      errorMessage = null;
    });

    try {
      final response = await _apiService.getMyProducts(
        category: _selectedCategory,
        available: _availableOnly,
        page: currentPage,
        limit: _pageLimit,
      );

      if (response.statusCode == 200 && response.data['success']) {
        final newProducts = (response.data['data'] as List)
            .map((json) => Product.fromJson(json))
            .toList();

        setState(() {
          if (loadMore) {
            products.addAll(newProducts);
          } else {
            products = newProducts;
          }
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
      _showSnackBar('Error: $e', AppColors.error);
    } finally {
      if (mounted) setState(() => isLoading = isLoadingMore = false);
    }
  }

  Future<void> addProduct(Product product) async {
    final l10n = AppLocaleScope.l10nOf(context);
    setState(() => isLoading = true);
    try {
      final response = await _apiService.createProduct(product.toCreateJson());

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          response.data['success'] == true) {
        currentPage = 1;
        await fetchProducts();
        if (mounted) Navigator.pop(context);
        _showSnackBar(l10n.productAdded, AppColors.primary);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to add product');
      }
    } catch (e) {
      _showSnackBar('Error: $e', AppColors.error);
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  Future<void> updateProduct(Product product) async {
    final l10n = AppLocaleScope.l10nOf(context);
    if (product.id.isEmpty) {
      _showSnackBar('Invalid product id', AppColors.error);
      return;
    }

    setState(() => isLoading = true);
    try {
      final response = await _apiService.updateProduct(
        product.id,
        product.toUpdateJson(),
      );

      if ((response.statusCode == 200 || response.statusCode == 201) &&
          response.data['success'] == true) {
        await fetchProducts();
        if (mounted) Navigator.pop(context);
        _showSnackBar(l10n.productUpdated, AppColors.primary);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
      } else {
        throw Exception(response.data['message'] ?? 'Failed to update product');
      }
    } catch (e) {
      _showSnackBar('Error: $e', AppColors.error);
    } finally {
      if (mounted) setState(() => isLoading = false);
    }
  }

  void _openEditDialog(Product product) {
    showDialog(
      context: context,
      builder: (_) => AddProductDialog(
        product: product,
        onSubmit: updateProduct,
      ),
    );
  }

  Future<void> deleteProduct(String id) async {
    final l10n = AppLocaleScope.l10nOf(context);
    if (id.isEmpty) {
      _showSnackBar('Invalid product id', AppColors.error);
      return;
    }

    try {
      final response = await _apiService.deleteProduct(id);

      if ((response.statusCode == 200 || response.statusCode == 204) &&
          (response.data == null ||
              response.data is! Map ||
              response.data['success'] != false)) {
        await fetchProducts();
        _showSnackBar(l10n.productDeleted, AppColors.primary);
      } else if (response.statusCode == 401) {
        await _handleUnauthorized();
      } else {
        final message = response.data is Map
            ? response.data['message'] ?? 'Failed to delete product'
            : 'Failed to delete product';
        throw Exception(message);
      }
    } catch (e) {
      _showSnackBar('Error deleting: $e', AppColors.error);
    }
  }

  Future<void> _handleUnauthorized() async {
    if (mounted) await logoutAndRedirect(context);
  }

  void _showSnackBar(String msg, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(msg),
        backgroundColor: color,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _confirmDelete(String id) {
    final l10n = AppLocaleScope.l10nOf(context);
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(l10n.deleteProduct),
        content: Text(l10n.deleteProductConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              deleteProduct(id);
            },
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeService = AppLocaleScope.serviceOf(context);

    return ListenableBuilder(
      listenable: localeService,
      builder: (context, _) {
        final l10n = localeService.l10n;
        return _buildScaffold(context, l10n);
      },
    );
  }

  Widget _buildScaffold(BuildContext context, AppLocalizations l10n) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 12, 8),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          l10n.myMarketplace,
                          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                                fontSize: 24,
                              ),
                        ),
                        Text(
                          l10n.manageListings,
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ],
                    ),
                  ),
                  const LanguageToggle(),
                  const SizedBox(width: 4),
                  FloatingActionButton.small(
                    heroTag: 'add_product',
                    backgroundColor: AppColors.primary,
                    onPressed: () => showDialog(
                      context: context,
                      builder: (_) => AddProductDialog(onSubmit: addProduct),
                    ),
                    child: const Icon(Icons.add, color: Colors.white),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final categoryField = DropdownButtonFormField<String?>(
                    isExpanded: true,
                    value: _selectedCategory,
                    decoration: InputDecoration(
                      labelText: l10n.category,
                      contentPadding:
                          const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: [
                      DropdownMenuItem(
                        value: null,
                        child: Text(
                          l10n.allCategories,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      ..._categories.map(
                        (c) => DropdownMenuItem(
                          value: c,
                          child: Text(
                            l10n.categoryLabel(c),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ],
                    onChanged: (value) {
                      setState(() => _selectedCategory = value);
                      currentPage = 1;
                      fetchProducts();
                    },
                  );
                  final availableChip = FilterChip(
                    label: Text(l10n.available),
                    selected: _availableOnly == true,
                    onSelected: (selected) {
                      setState(() {
                        _availableOnly = selected ? true : null;
                      });
                      currentPage = 1;
                      fetchProducts();
                    },
                    selectedColor: AppColors.primary.withValues(alpha: 0.15),
                    checkmarkColor: AppColors.primary,
                  );

                  if (constraints.maxWidth < 360) {
                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        categoryField,
                        const SizedBox(height: 8),
                        Align(
                          alignment: Alignment.centerLeft,
                          child: availableChip,
                        ),
                      ],
                    );
                  }

                  return Row(
                    children: [
                      Expanded(child: categoryField),
                      const SizedBox(width: 12),
                      availableChip,
                    ],
                  );
                },
              ),
            ),
            Expanded(
              child: RefreshIndicator(
                onRefresh: () async {
                  currentPage = 1;
                  await fetchProducts();
                },
                color: AppColors.primary,
                child: _buildBody(l10n),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(AppLocalizations l10n) {
    if (isLoading && products.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: AppColors.primary),
            const SizedBox(height: 16),
            Text(l10n.loadingProducts),
          ],
        ),
      );
    }

    if (errorMessage != null && products.isEmpty) {
      return _EmptyState(
        icon: Icons.cloud_off_outlined,
        title: l10n.couldNotLoadProducts,
        subtitle: errorMessage!,
        actionLabel: l10n.retry,
        onAction: () {
          currentPage = 1;
          fetchProducts();
        },
      );
    }

    if (products.isEmpty) {
      return _EmptyState(
        icon: Icons.inventory_2_outlined,
        title: l10n.noProductsYet,
        subtitle: l10n.tapToAddFirst,
        actionLabel: l10n.addProduct,
        onAction: () => showDialog(
          context: context,
          builder: (_) => AddProductDialog(onSubmit: addProduct),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
      itemCount: products.length + (isLoadingMore ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == products.length) {
          return const Center(
            child: Padding(
              padding: EdgeInsets.all(16),
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        }
        return ProductCard(
          product: products[index],
          onEdit: () => _openEditDialog(products[index]),
          onDelete: () => _confirmDelete(products[index].id),
        );
      },
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String actionLabel;
  final VoidCallback onAction;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.actionLabel,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        SizedBox(height: MediaQuery.of(context).size.height * 0.2),
        Icon(icon, size: 72, color: AppColors.textSecondary.withValues(alpha: 0.5)),
        const SizedBox(height: 16),
        Text(
          title,
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Text(
            subtitle,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
        ),
        const SizedBox(height: 24),
        Center(
          child: ElevatedButton(
            onPressed: onAction,
            child: Text(actionLabel),
          ),
        ),
      ],
    );
  }
}
