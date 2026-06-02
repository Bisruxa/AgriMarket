class AppNotification {
  final String id;
  final String type;
  final String href;
  final String createdAt;
  final int? count;
  final String? note;

  const AppNotification({
    required this.id,
    required this.type,
    required this.href,
    required this.createdAt,
    this.count,
    this.note,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id']?.toString() ?? '',
      type: json['type']?.toString() ?? 'info',
      href: json['href']?.toString() ?? '',
      createdAt: json['createdAt']?.toString() ?? '',
      count: json['count'] is num ? (json['count'] as num).toInt() : null,
      note: json['note']?.toString(),
    );
  }
}

class NotificationsResult {
  final bool success;
  final List<AppNotification> notifications;
  final int unreadCount;
  final String? message;

  const NotificationsResult({
    required this.success,
    this.notifications = const [],
    this.unreadCount = 0,
    this.message,
  });
}
