import 'package:flutter/material.dart';
import '../data/common_crops.dart';
import '../theme/app_theme.dart';

class CropSelectorField extends StatefulWidget {
  final Set<String> selectedCrops;
  final ValueChanged<Set<String>> onSelectionChanged;

  const CropSelectorField({
    super.key,
    required this.selectedCrops,
    required this.onSelectionChanged,
  });

  static String? validateSelection(Set<String> crops) {
    if (crops.isEmpty) {
      return 'Select at least one crop you plant';
    }
    return null;
  }

  @override
  State<CropSelectorField> createState() => CropSelectorFieldState();
}

class CropSelectorFieldState extends State<CropSelectorField> {
  final _searchController = TextEditingController();
  final _focusNode = FocusNode();
  bool _showSuggestions = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(_onFocusChange);
    _searchController.addListener(_onSearchChanged);
  }

  void _onFocusChange() {
    setState(() => _showSuggestions = _focusNode.hasFocus);
  }

  void _onSearchChanged() => setState(() => _showSuggestions = true);

  List<String> get _suggestions {
    final query = _searchController.text.trim();
    if (query.isEmpty) return [];
    return filterCrops(query);
  }

  void _notifyParent(Set<String> updated) {
    widget.onSelectionChanged(updated);
  }

  void _addCrop(String crop) {
    final updated = Set<String>.from(widget.selectedCrops)..add(crop);
    setState(() {
      _searchController.clear();
    });
    _notifyParent(updated);
    _focusNode.requestFocus();
  }

  void _removeCrop(String crop) {
    final updated = Set<String>.from(widget.selectedCrops)..remove(crop);
    setState(() {});
    _notifyParent(updated);
    _focusNode.requestFocus();
  }

  void _toggleCrop(String crop) {
    if (widget.selectedCrops.contains(crop)) {
      _removeCrop(crop);
    } else {
      _addCrop(crop);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _searchController.removeListener(_onSearchChanged);
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final suggestions = _suggestions;
    final hasQuery = _searchController.text.trim().isNotEmpty;
    final showList = _showSuggestions && hasQuery && suggestions.isNotEmpty;
    final sortedSelected = widget.selectedCrops.toList()..sort();

    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Crops You Plant',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: () => _focusNode.requestFocus(),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 150),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: _focusNode.hasFocus
                      ? AppColors.primary
                      : AppColors.border,
                  width: _focusNode.hasFocus ? 2 : 1,
                ),
              ),
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: Icon(
                      Icons.eco_outlined,
                      size: 20,
                      color: AppColors.primary.withValues(alpha: 0.9),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        ...sortedSelected.map(_buildInlineChip),
                        ConstrainedBox(
                          constraints: BoxConstraints(
                            minWidth: sortedSelected.isEmpty ? 160 : 72,
                            maxWidth: MediaQuery.sizeOf(context).width - 120,
                          ),
                          child: TextField(
                            controller: _searchController,
                            focusNode: _focusNode,
                            onTap: () =>
                                setState(() => _showSuggestions = true),
                            style: const TextStyle(
                              fontSize: 14,
                              color: AppColors.textPrimary,
                            ),
                            decoration: InputDecoration(
                              isDense: true,
                              border: InputBorder.none,
                              enabledBorder: InputBorder.none,
                              focusedBorder: InputBorder.none,
                              hintText: sortedSelected.isEmpty
                                  ? 'Type to search crops...'
                                  : 'Add more...',
                              hintStyle: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 14,
                              ),
                              contentPadding: const EdgeInsets.symmetric(
                                vertical: 6,
                                horizontal: 0,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (showList) ...[
            const SizedBox(height: 8),
            Container(
              constraints: const BoxConstraints(maxHeight: 220),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const ClampingScrollPhysics(),
                padding: const EdgeInsets.symmetric(vertical: 4),
                itemCount: suggestions.length,
                separatorBuilder: (_, _) => Divider(
                  height: 1,
                  color: AppColors.border.withValues(alpha: 0.6),
                ),
                itemBuilder: (context, index) {
                  final crop = suggestions[index];
                  final isSelected = widget.selectedCrops.contains(crop);
                  return _CropOptionTile(
                    crop: crop,
                    isSelected: isSelected,
                    onTap: () => _toggleCrop(crop),
                  );
                },
              ),
            ),
          ],
          if (_showSuggestions && hasQuery && suggestions.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 8),
              child: Text(
                'No matching crops. Try another name.',
                style: TextStyle(
                  fontSize: 12,
                  color: AppColors.textSecondary,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildInlineChip(String crop) {
    return Container(
      padding: const EdgeInsets.only(left: 10, right: 4, top: 5, bottom: 5),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            crop,
            style: const TextStyle(
              color: AppColors.primaryDark,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
          const SizedBox(width: 2),
          InkWell(
            onTap: () => _removeCrop(crop),
            borderRadius: BorderRadius.circular(12),
            child: const Padding(
              padding: EdgeInsets.all(2),
              child: Icon(
                Icons.close,
                size: 16,
                color: AppColors.primaryDark,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CropOptionTile extends StatelessWidget {
  final String crop;
  final bool isSelected;
  final VoidCallback onTap;

  const _CropOptionTile({
    required this.crop,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSelected
          ? AppColors.primary.withValues(alpha: 0.12)
          : Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          child: Row(
            children: [
              IgnorePointer(
                child: Checkbox(
                  value: isSelected,
                  onChanged: null,
                  fillColor: WidgetStateProperty.resolveWith((states) {
                    if (states.contains(WidgetState.selected)) {
                      return AppColors.primary;
                    }
                    return Colors.white;
                  }),
                  checkColor: Colors.white,
                  side: const BorderSide(color: AppColors.primary, width: 2),
                ),
              ),
              Expanded(
                child: Text(
                  crop,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? AppColors.primaryDark
                        : AppColors.textPrimary,
                  ),
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check_circle_rounded,
                  color: AppColors.primary,
                  size: 22,
                ),
            ],
          ),
        ),
      ),
    );
  }
}
