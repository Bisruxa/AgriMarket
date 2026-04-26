import 'package:flutter/material.dart';
import '../models/product_model.dart';

class AddProductDialog extends StatefulWidget {
  final Function(Product) onAdd;

  const AddProductDialog({super.key, required this.onAdd});

  @override
  State<AddProductDialog> createState() => _AddProductDialogState();
}

class _AddProductDialogState extends State<AddProductDialog> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _stockController = TextEditingController();
  final _locationController = TextEditingController();
  final _harvestDateController = TextEditingController();
  final _expiryDateController = TextEditingController();
  
  String _unit = 'KG';
  String _category = 'VEGETABLES';
  bool _isOrganic = false;
  bool _isLoading = false;

  static const _units = ['KG', 'G', 'TON', 'PIECE', 'BUNCH', 'BOX'];
  static const _categories = ['VEGETABLES', 'FRUITS', 'GRAINS', 'DAIRY', 'MEAT', 'OTHER'];

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Container(
        padding: const EdgeInsets.all(24),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Add New Product', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                _buildTextField(_nameController, 'Product Name', true),
                const SizedBox(height: 12),
                _buildTextField(_descriptionController, 'Description', false, maxLines: 2),
                const SizedBox(height: 12),
                _buildPriceUnitRow(),
                const SizedBox(height: 12),
                _buildCategoryStockRow(),
                const SizedBox(height: 12),
                _buildTextField(_locationController, 'Location', true),
                const SizedBox(height: 12),
                _buildDateField(_harvestDateController, 'Harvest Date', true),
                const SizedBox(height: 12),
                _buildDateField(_expiryDateController, 'Expiry Date (optional)', false),
                const SizedBox(height: 12),
                // SwitchListTile(
                //   title: const Text('Organic Product'),
                //   value: _isOrganic,
                //   onChanged: (v) => setState(() => _isOrganic = v),
                //   activeColor: Colors.green,
                //   contentPadding: EdgeInsets.zero,
                // ),
                const SizedBox(height: 16),
                _buildButtons(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(TextEditingController controller, String label, bool required, {int maxLines = 1}) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label, border: const OutlineInputBorder()),
      maxLines: maxLines,
      validator: required ? (v) => v?.isEmpty == true ? '$label is required' : null : null,
    );
  }

  Widget _buildDateField(TextEditingController controller, String label, bool required) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: 'YYYY-MM-DD',
        border: const OutlineInputBorder(),
        suffixIcon: const Icon(Icons.calendar_today),
      ),
      readOnly: true,
      onTap: () async => await _selectDate(controller),
      validator: required ? (v) => v?.isEmpty == true ? '$label is required' : null : null,
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
          colorScheme: const ColorScheme.light(primary: Color(0xFF2A5A2A), onPrimary: Colors.white),
        ),
        child: child!,
      ),
    );
    if (date != null) {
      controller.text = date.toIso8601String();
    }
  }

  Widget _buildPriceUnitRow() {
    return Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _priceController,
            decoration: const InputDecoration(labelText: 'Price', border: OutlineInputBorder(), prefixText: 'ETB '),
            keyboardType: TextInputType.number,
            validator: (v) {
              if (v?.isEmpty == true) return 'Price required';
              if (double.tryParse(v!) == null) return 'Invalid price';
              return null;
            },
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: DropdownButtonFormField(
            value: _unit,
            decoration: const InputDecoration(labelText: 'Unit', border: OutlineInputBorder()),
            items: _units.map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
            onChanged: (v) => setState(() => _unit = v!),
          ),
        ),
      ],
    );
  }

  Widget _buildCategoryStockRow() {
    return Row(
      children: [
        Expanded(
          child: DropdownButtonFormField(
            value: _category,
            decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
            items: _categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
            onChanged: (v) => setState(() => _category = v!),
          ),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: TextFormField(
            controller: _stockController,
            decoration: const InputDecoration(labelText: 'Stock', border: OutlineInputBorder()),
            keyboardType: TextInputType.number,
            validator: (v) {
              if (v?.isEmpty == true) return 'Stock required';
              if (int.tryParse(v!) == null) return 'Invalid stock';
              return null;
            },
          ),
        ),
      ],
    );
  }

  Widget _buildButtons() {
    return Row(
      children: [
        Expanded(
          child: TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton(
            onPressed: _isLoading ? null : _submitForm,
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF2A5A2A)),
            child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('Add Product'),
          ),
        ),
      ],
    );
  }

  void _submitForm() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final product = Product(
      id: '',
      name: _nameController.text,
      description: _descriptionController.text.isEmpty ? null : _descriptionController.text,
      price: double.parse(_priceController.text),
      unit: _unit,
      category: _category,
      stock: int.parse(_stockController.text),
      images: [],
      location: _locationController.text,
      isOrganic: _isOrganic,
      harvestDate: _harvestDateController.text,
      expiryDate: _expiryDateController.text.isEmpty ? null : _expiryDateController.text,
      farmerId: '',
      // createdAt: DateTime.now(),
      // updatedAt: DateTime.now(),
    );

    await widget.onAdd(product);
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