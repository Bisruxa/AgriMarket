import 'package:flutter/material.dart';

import '../../models/farm_model.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/farmer/farm_card.dart';
import 'add_farm_screen.dart';

class FarmsScreen extends StatefulWidget {
  const FarmsScreen({super.key});

  @override
  State<FarmsScreen> createState() => _FarmsScreenState();
}

class _FarmsScreenState extends State<FarmsScreen> {
  final _api = ApiService();
  List<Farm> _farms = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadFarms();
  }

  Future<void> _loadFarms() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    final result = await _api.getFarms();

    if (!mounted) return;
    setState(() {
      _isLoading = false;
      if (result.success) {
        _farms = result.farms;
      } else {
        _error = result.message ?? 'Failed to load farms';
        _farms = [];
      }
    });
  }

  Future<void> _openAddFarm() async {
    final created = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const AddFarmScreen()),
    );
    if (created == true) {
      _loadFarms();
    }
  }

  Future<void> _openEditFarm(Farm farm) async {
    final updated = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => AddFarmScreen(existingFarm: farm)),
    );
    if (updated == true) _loadFarms();
  }

  Future<void> _confirmDeleteFarm(Farm farm) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete farm?'),
        content: Text('Remove "${farm.name}"? This cannot be undone.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (ok != true) return;

    final result = await _api.deleteFarm(farm.id);
    if (!mounted) return;
    if (result.success) {
      _loadFarms();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result.message ?? 'Farm deleted')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message ?? 'Failed to delete'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: _loadFarms,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        'My Farms',
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontSize: 26,
                            ),
                      ),
                    ),
                    FilledButton.icon(
                      onPressed: _openAddFarm,
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      icon: const Icon(Icons.add_rounded, size: 20),
                      label: const Text('Add Farm'),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Text(
                  'Register and manage your farm land.',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
              ),
            ),
            if (_isLoading)
              const SliverFillRemaining(
                hasScrollBody: false,
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
              )
            else if (_error != null)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptyState(
                  icon: Icons.error_outline_rounded,
                  message: _error!,
                  actionLabel: 'Retry',
                  onAction: _loadFarms,
                ),
              )
            else if (_farms.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _EmptyState(
                  icon: Icons.agriculture_outlined,
                  message: 'No farms have been registered.',
                  actionLabel: 'Add Farm',
                  onAction: _openAddFarm,
                ),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.all(20),
                sliver: SliverList.separated(
                  itemCount: _farms.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final farm = _farms[index];
                    return FarmCard(
                      farm: farm,
                      onEdit: () => _openEditFarm(farm),
                      onDelete: () => _confirmDeleteFarm(farm),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String actionLabel;
  final VoidCallback onAction;

  const _EmptyState({
    required this.icon,
    required this.message,
    required this.actionLabel,
    required this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: AppColors.textSecondary.withValues(alpha: 0.5)),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppColors.textSecondary),
            ),
            const SizedBox(height: 20),
            OutlinedButton(
              onPressed: onAction,
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
              ),
              child: Text(actionLabel),
            ),
          ],
        ),
      ),
    );
  }
}
