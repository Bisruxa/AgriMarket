import 'package:flutter/material.dart';

import '../models/product_model.dart';
import '../theme/app_theme.dart';

/// Trader view: crop listing + farmer who posted it.
class FarmerInfoPopup extends StatelessWidget {
  final Product product;

  const FarmerInfoPopup({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    final farmer = product.farmer;
    final farmerName = farmer?.name ?? 'Unknown farmer';
    final phone = (farmer?.phone?.trim().isNotEmpty ?? false)
        ? farmer!.phone!.trim()
        : 'Not provided';
    final location = farmer?.locationLabel.isNotEmpty == true
        ? farmer!.locationLabel
        : (product.location.isNotEmpty ? product.location : 'Not provided');

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: AppColors.primary.withValues(alpha: 0.12),
            backgroundImage:
                farmer?.avatar != null && farmer!.avatar!.startsWith('http')
                    ? NetworkImage(farmer.avatar!)
                    : null,
            child: farmer?.avatar == null || !farmer!.avatar!.startsWith('http')
                ? const Icon(Icons.person_rounded, color: AppColors.primary)
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  farmerName,
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700),
                ),
                if (farmer?.isVerified == true)
                  Row(
                    children: [
                      Icon(
                        Icons.verified_rounded,
                        size: 16,
                        color: Colors.green.shade700,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Verified farmer',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.green.shade700,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 340),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _sectionTitle('Listing'),
              _infoTile('Crop', product.name),
              if (product.description?.trim().isNotEmpty == true)
                _infoTile('Description', product.description!.trim()),
              _infoTile(
                'Price',
                'ETB ${product.price.toStringAsFixed(0)} / ${product.unit}',
              ),
              _infoTile('Stock', '${product.stock} ${product.unit}'),
              _infoTile('Pickup / market', product.location),
              if (product.isOrganic) _infoTile('Quality', 'Organic'),
              const SizedBox(height: 12),
              _sectionTitle('Farmer details'),
              _infoTile('Phone', phone),
              _infoTile('Region', location),
              if (farmer?.farmSize?.trim().isNotEmpty == true)
                _infoTile('Farm size', farmer!.farmSize!.trim()),
              if (farmer?.crops?.trim().isNotEmpty == true)
                _infoTile('Crops grown', farmer!.crops!.trim()),
              if (farmer?.experience?.trim().isNotEmpty == true)
                _infoTile('Experience', farmer!.experience!.trim()),
              if (farmer != null && farmer.farmCount > 0)
                _infoTile('Registered farms', '${farmer.farmCount}'),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.textPrimary,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
