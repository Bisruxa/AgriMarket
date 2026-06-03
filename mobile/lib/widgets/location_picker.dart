import 'package:flutter/material.dart';
import '../models/location_model.dart';
import '../widgets/app_locale_scope.dart';

class LocationPicker extends StatelessWidget {
  final String? selectedRegion;
  final String? selectedWoreda;
  final Function(String?) onRegionChanged;
  final Function(String?) onWoredaChanged;

  const LocationPicker({
    super.key,
    required this.selectedRegion,
    required this.selectedWoreda,
    required this.onRegionChanged,
    required this.onWoredaChanged,
  });

  List<String> get woredasForSelectedRegion {
    if (selectedRegion == null) return [];
    final region = ethiopianRegions.firstWhere(
      (r) => r.name == selectedRegion,
      orElse: () => Region(name: '', woredas: []),
    );
    return region.woredas;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocaleScope.l10nOf(context);

    return Column(
      children: [
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: selectedRegion,
          hint: Text(l10n.selectRegion),
          items: ethiopianRegions.map((region) {
            return DropdownMenuItem(
              value: region.name,
              child: Text(
                region.name,
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          onChanged: onRegionChanged,
          decoration: InputDecoration(
            labelText: l10n.region,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: selectedWoreda,
          hint: Text(l10n.selectWoreda),
          items: woredasForSelectedRegion.map((woreda) {
            return DropdownMenuItem(
              value: woreda,
              child: Text(
                woreda,
                overflow: TextOverflow.ellipsis,
              ),
            );
          }).toList(),
          onChanged: selectedRegion != null ? onWoredaChanged : null,
          decoration: InputDecoration(
            labelText: l10n.woreda,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }
}
