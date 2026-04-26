import 'package:flutter/material.dart';
import '../models/product_model.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onDelete;
  final VoidCallback? onTap;

  const ProductCard({
    super.key,
    required this.product,
    required this.onDelete,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildImagePlaceholder(),
              const SizedBox(width: 16),
              Expanded(child: _buildProductInfo()),
              _buildDeleteButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImagePlaceholder() {
    return Container(
      width: 80,
      height: 80,
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(Icons.agriculture_outlined, size: 40, color: Colors.green),
    );
  }

  Widget _buildProductInfo() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                product.name,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
            if (product.isOrganic) _buildOrganicBadge(),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          product.description ?? 'No description',
          style: TextStyle(fontSize: 14, color: Colors.grey.shade600),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        const SizedBox(height: 8),
        _buildPriceAndMeta(),
        const SizedBox(height: 4),
        _buildStockAndDate(),
      ],
    );
  }

  Widget _buildOrganicBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.green.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Text('Organic', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.green)),
    );
  }

  Widget _buildPriceAndMeta() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.green.shade700,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text(
            'ETB ${product.price.toStringAsFixed(2)}/${product.unit}',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
          ),
        ),
        const SizedBox(width: 8),
        Icon(Icons.location_on, size: 14, color: Colors.grey.shade500),
        const SizedBox(width: 4),
        Text(product.location, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        const SizedBox(width: 8),
        // Icon(Icons.category, size: 14, color: Colors.grey.shade500),
        const SizedBox(width: 4),
        // Text(product.category, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
      ],
    );
  }

  Widget _buildStockAndDate() {
    return Row(
      children: [
        Icon(Icons.inventory, size: 14, color: Colors.grey.shade500),
        const SizedBox(width: 4),
        Text('Stock: ${product.stock} ${product.unit}s', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        const SizedBox(width: 16),
        // Icon(Icons.calendar_today, size: 14, color: Colors.grey.shade500),
        // const SizedBox(width: 4),
        // Text('Harvest: ${product.harvestDate.split('T')[0]}', style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
      ],
    );
  }

  Widget _buildDeleteButton() {
    return IconButton(
      icon: const Icon(Icons.delete_outline, color: Colors.red),
      onPressed: onDelete,
      tooltip: 'Delete Product',
    );
  }
}