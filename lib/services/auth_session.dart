import 'token_storage.dart';

class AuthSession {
  AuthSession._();

  static String? extractToken(Map<String, dynamic> data) {
    final direct = data['token'] ??
        data['accessToken'] ??
        data['access_token'] ??
        data['jwt'];

    if (direct != null && direct.toString().isNotEmpty) {
      return direct.toString();
    }

    final nested = data['data'];
    if (nested is Map<String, dynamic>) {
      return extractToken(nested);
    }

    return null;
  }

  static String? extractRole(Map<String, dynamic> data) {
    final user = data['user'];
    if (user is Map<String, dynamic> && user['role'] != null) {
      return user['role'].toString();
    }
    if (data['role'] != null) {
      return data['role'].toString();
    }
    return null;
  }

  static Future<void> saveFromLoginResponse(Map<String, dynamic> data) async {
    final token = extractToken(data);
    if (token != null) {
      await TokenStorage.saveToken(token);
    }

    final role = extractRole(data);
    if (role != null) {
      await TokenStorage.saveRole(role);
    }
  }
}
