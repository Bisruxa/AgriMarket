import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../theme/app_theme.dart';
import 'custom_button.dart';
import 'app_locale_scope.dart';
import '../l10n/app_localizations.dart';

class AddProductDialog extends StatefulWidget {
  final Product? product;
  final Future<void> Function(Product) onSubmit;

  const AddProductDialog({
    super.key,
    this.product,
    required this.onSubmit,
  });

  bool get isEditing => product != null;

  @override
  State<AddProductDialog> createState() => _AddProductDialogState();
}

class _AddProductDialogState extends State<AddProductDialog> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nameController;
  late final TextEditingController _descriptionController;
  late final TextEditingController _priceController;
  late final TextEditingController _stockController;
  late final TextEditingController _locationController;
  late final TextEditingController _harvestDateController;
  late final TextEditingController _expiryDateController;

  late String _unit;
  late String _category;
  late bool _isOrganic;
  bool _isLoading = false;

  static const _units = ['KG', 'G', 'TON', 'PIECE', 'BUNCH', 'BOX'];
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
    final p = widget.product;
    _nameController = TextEditingController(text: p?.name ?? '');
    _descriptionController = TextEditingController(text: p?.description ?? '');
    _priceController = TextEditingController(
      text: p != null ? p.price.toString() : '',
    );
    _stockController = TextEditingController(
      text: p != null ? p.stock.toString() : '',
    );
    _locationController = TextEditingController(text: p?.location ?? '');
    _harvestDateController = TextEditingController(
      text: p != null ? _formatDateForField(p.harvestDate) : '',
    );
    _expiryDateController = TextEditingController(
      text: p?.expiryDate != null ? _formatDateForField(p!.expiryDate!) : '',
    );
    _unit = p?.unit ?? 'KG';
    _category = p?.category.isNotEmpty == true ? p!.category : 'VEGETABLES';
    if (p != null && _categories.contains(p.category)) {
      _category = p.category;
    }
    _isOrganic = p?.isOrganic ?? false;
  }

  static String _formatDateForField(String value) {
    if (value.isEmpty) return '';
    if (value.length >= 10) return value.substring(0, 10);
    return value;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        constraints: BoxConstraints(
          maxHeight: MediaQuery.of(context).size.height * 0.85,
          maxWidth: 520,
        ),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        widget.isEditing
                            ? Icons.edit_outlined
                            : Icons.add_box_outlined,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        widget.isEditing ? l10n.editProduct : l10n.addNewProduct,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildTextField(_nameController, l10n.productName, true, l10n),
                _buildTextField(
                  _descriptionController,
                  l10n.description,
                  false,
                  l10n,
                  maxLines: 2,
                ),
                _buildPriceUnitRow(l10n),
                _buildCategoryStockRow(l10n),
                _buildTextField(_locationController, l10n.location, true, l10n),
                _buildDateField(_harvestDateController, l10n.harvestDate, true, l10n),
                _buildDateField(
                  _expiryDateController,
                  l10n.expiryDateOptional,
                  false,
                  l10n,
                ),
                SwitchListTile(
                  title: Text(l10n.organicProduct),
                  value: _isOrganic,
                  onChanged: (v) => setState(() => _isOrganic = v),
                  activeThumbColor: AppColors.primary,
                  contentPadding: EdgeInsets.zero,
                ),
                const SizedBox(height: 8),
                CustomButton(
                  text: widget.isEditing ? l10n.saveChanges : l10n.addProduct,
                  isLoading: _isLoading,
                  onPressed: _submitForm,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    bool required,
    AppLocalizations l10n, {
    int maxLines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label),
        validator: required
            ? (v) => v?.isEmpty == true ? l10n.fieldIsRequired(label) : null
            : null,
      ),
    );
  }

  Widget _buildDateField(
    TextEditingController controller,
    String label,
    bool required,
    AppLocalizations l10n,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextFormField(
        controller: controller,
        decoration: InputDecoration(
          labelText: label,
          hintText: 'YYYY-MM-DD',
          suffixIcon: const Icon(Icons.calendar_today_outlined),
        ),
        readOnly: true,
        onTap: () => _selectDate(controller),
        validator: required
            ? (v) => v?.isEmpty == true ? l10n.fieldIsRequired(label) : null
            : null,
      ),
    );
  }

  Future<void> _selectDate(TextEditingController controller) async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) => Theme(
        data: Theme.of(context).copyWith(
          colorScheme: const ColorScheme.light(
            primary: AppColors.primary,
            onPrimary: Colors.white,
          ),
        ),
        child: child!,
      ),
    );
    if (date != null) {
      controller.text =
          '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
    }
  }

  Widget _buildPriceUnitRow(AppLocalizations l10n) {
    final priceField = TextFormField(
      controller: _priceController,
      decoration: InputDecoration(
        labelText: l10n.price,
        prefixText: 'ETB ',
      ),
      keyboardType: TextInputType.number,
      validator: (v) {
        if (v?.isEmpty == true) return l10n.priceRequired;
        if (double.tryParse(v!) == null) return l10n.invalidPrice;
        return null;
      },
    );
    final unitField = DropdownButtonFormField(
      isExpanded: true,
      value: _unit,
      decoration: InputDecoration(labelText: l10n.unit),
      items: _units
          .map(
            (u) => DropdownMenuItem(
              value: u,
              child: Text(u, overflow: TextOverflow.ellipsis),
            ),
          )
          .toList(),
      onChanged: (v) => setState(() => _unit = v!),
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth < 340) {
            return Column(
              children: [
                priceField,
                const SizedBox(height: 12),
                unitField,
              ],
            );
          }
          return Row(
            children: [
              Expanded(child: priceField),
              const SizedBox(width: 12),
              Expanded(child: unitField),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCategoryStockRow(AppLocalizations l10n) {
    final categoryField = DropdownButtonFormField(
      isExpanded: true,
      value: _categories.contains(_category) ? _category : 'VEGETABLES',
      decoration: InputDecoration(labelText: l10n.category),
      items: _categories
          .map(
            (c) => DropdownMenuItem(
              value: c,
              child: Text(c, overflow: TextOverflow.ellipsis),
            ),
          )
          .toList(),
      onChanged: (v) => setState(() => _category = v!),
    );
    final stockField = TextFormField(
      controller: _stockController,
      decoration: InputDecoration(labelText: l10n.stock),
      keyboardType: TextInputType.number,
      validator: (v) {
        if (v?.isEmpty == true) return l10n.stockRequired;
        if (int.tryParse(v!) == null) return l10n.invalidStock;
        return null;
      },
    );

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth < 340) {
            return Column(
              children: [
                categoryField,
                const SizedBox(height: 12),
                stockField,
              ],
            );
          }
          return Row(
            children: [
              Expanded(child: categoryField),
              const SizedBox(width: 12),
              Expanded(child: stockField),
            ],
          );
        },
      ),
    );
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final product = Product(
      id: widget.product?.id ?? '',
      name: _nameController.text.trim(),
      description: _descriptionController.text.trim().isEmpty
          ? null
          : _descriptionController.text.trim(),
      price: double.parse(_priceController.text),
      unit: _unit,
      category: _category,
      stock: int.parse(_stockController.text),
      images: widget.product?.images ?? [],
      location: _locationController.text.trim(),
      isOrganic: _isOrganic,
      harvestDate: _harvestDateController.text,
      expiryDate: _expiryDateController.text.isEmpty
          ? null
          : _expiryDateController.text,
      farmerId: widget.product?.farmerId ?? '',
      isAvailable: widget.product?.isAvailable ?? true,
    );

    await widget.onSubmit(product);
    if (mounted) setState(() => _isLoading = false);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _stockController.dispose();
    _locationController.dispose();
    _harvestDateController.dispose();
    _expiryDateController.dispose();
    super.dispose();
  }
}
