import '../models/notification_model.dart';

class NotificationLabels {
  NotificationLabels._();

  static ({String title, String body}) label(AppNotification n) {
    final count = n.count;
    switch (n.id) {
      case 'farmer-no-farms':
        return (
          title: 'Register a farm',
          body: 'Add your first farm to unlock crop and weather insights.',
        );
      case 'farmer-sold-out':
        return (
          title: 'Sold out listings',
          body: count != null
              ? '$count product(s) are out of stock. Restock in Market.'
              : 'Some products are out of stock.',
        );
      case 'farmer-low-stock':
        return (
          title: 'Low stock',
          body: count != null
              ? '$count listing(s) have 5 units or fewer.'
              : 'Some listings are running low.',
        );
      case 'farmer-crop-tip':
        return (
          title: 'Crop recommendation',
          body: 'Get AI crop suggestions based on your soil data.',
        );
      case 'farmer-price-up':
        return (
          title: 'Price rising',
          body: count != null
              ? 'Market prices for your crops rose about $count%.'
              : 'Market prices for your crops are rising.',
        );
      case 'farmer-price-down':
        return (
          title: 'Price falling',
          body: count != null
              ? 'Prices dropped about $count% — review your listings.'
              : 'Market prices for your crops are falling.',
        );
      case 'farmer-sell-window':
        return (
          title: 'Good time to sell',
          body: count != null
              ? 'Expected gain up to $count% if you sell in the best month.'
              : 'Sales timing looks favorable this season.',
        );
      case 'farmer-weather-rain':
        return (
          title: 'Heavy rain expected',
          body: 'Plan field work around heavy rainfall in the next week.',
        );
      case 'farmer-weather-heat':
        return (
          title: 'Heat advisory',
          body: 'High temperatures expected — protect crops and workers.',
        );
      case 'trader-pending':
        return (
          title: 'Account pending',
          body: 'Your trader account is awaiting admin approval.',
        );
      case 'trader-rejected':
        return (
          title: 'Application rejected',
          body: n.note?.isNotEmpty == true
              ? n.note!
              : 'Contact support for more information.',
        );
      case 'trader-welcome':
        return (
          title: 'Account approved',
          body: 'You can browse and connect with farmers on the market.',
        );
      case 'admin-pending-traders':
        return (
          title: 'Trader approvals',
          body: count != null
              ? '$count trader(s) waiting for review.'
              : 'Traders waiting for review.',
        );
      default:
        return (
          title: 'Notification',
          body: n.href.isNotEmpty ? n.href : 'Tap for details',
        );
    }
  }

  static String timeAgo(String iso) {
    final dt = DateTime.tryParse(iso);
    if (dt == null) return '';
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
