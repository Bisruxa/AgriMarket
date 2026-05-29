import 'package:flutter/material.dart';
import '../screens/auth/login_screen.dart';
import '../services/api_service.dart';
import '../services/token_storage.dart';

Future<bool> hasAuthToken() async {
  final token = await TokenStorage.getToken();
  return token != null && token.isNotEmpty;
}

/// Only sends the user to login when they had a real session (token) that expired.
Future<void> logoutAndRedirectIfAuthenticated(BuildContext context) async {
  if (!await hasAuthToken()) return;
  await logoutAndRedirect(context);
}

Future<void> logoutAndRedirect(BuildContext context) async {
  await ApiService().logout();

  if (context.mounted) {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }
}
