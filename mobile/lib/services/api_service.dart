import 'package:agrimatketapp/config/api_config.dart';

import 'package:agrimatketapp/models/farm_model.dart';
import 'package:agrimatketapp/models/profile_model.dart';

import 'package:agrimatketapp/services/token_storage.dart';

import 'package:dio/dio.dart';

import 'package:flutter/foundation.dart' show kDebugMode, kIsWeb;



class ApiService {

  static final ApiService _instance = ApiService._internal();

  factory ApiService() => _instance;



  late Dio dio;

  bool _isInitialized = false;



  ApiService._internal() {

    _init();

  }



  Future<void> _init() async {

    if (_isInitialized) return;



    dio = Dio(BaseOptions(

      baseUrl: ApiConfig.baseUrl,

      connectTimeout: const Duration(seconds: 30),

      receiveTimeout: const Duration(seconds: 30),

      headers: {

        'Content-Type': 'application/json',

        'Accept': 'application/json',

      },

      validateStatus: (status) => status != null && status < 500,

    ));



    if (kIsWeb) {

      dio.options.extra['withCredentials'] = true;

    }



    dio.interceptors.add(InterceptorsWrapper(

      onRequest: (options, handler) async {

        if (await _shouldAttachToken(options.path)) {

          final token = await TokenStorage.getToken();

          if (token != null && token.isNotEmpty) {

            options.headers['Authorization'] = 'Bearer $token';

          }

        }



        if (kDebugMode) {

          // ignore: avoid_print

          print('REQUEST: ${options.method} ${options.uri}');

        }



        return handler.next(options);

      },

    ));



    _isInitialized = true;

  }



  Future<bool> _shouldAttachToken(String path) async {

    if (path.contains(ApiConfig.login)) return false;



    final token = await TokenStorage.getToken();

    if (token == null || token.isEmpty) return false;



    // Farmers always send the token on authenticated requests.

    if (await TokenStorage.isFarmer()) return true;



    // Traders send token for profile/logout only.

    return path.contains(ApiConfig.profile) ||
        path.contains(ApiConfig.me) ||
        path.contains(ApiConfig.updatePassword) ||
        path.contains(ApiConfig.logout);

  }



  Future<Dio> _getDio() async {

    if (!_isInitialized) {

      await _init();

    }

    return dio;

  }



  Future<Response> post(String endpoint, dynamic data) async {

    final client = await _getDio();

    return client.post(endpoint, data: data);

  }



  Future<Response> get(String endpoint) async {

    final client = await _getDio();

    return client.get(endpoint);

  }



  Future<Response> getMyProducts({

    String? category,

    bool? available,

    int page = 1,

    int limit = 10,

  }) async {

    final params = <String, String>{

      'page': page.toString(),

      'limit': limit.toString(),

    };



    if (category != null && category.isNotEmpty) {

      params['category'] = category;

    }

    if (available != null) {

      params['available'] = available.toString();

    }



    final query = params.entries

        .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')

        .join('&');



    return get('${ApiConfig.myProducts}?$query');

  }



  Future<Response> getProducts({

    String? category,

    bool? available,

    int page = 1,

    int limit = 10,

  }) async {

    final params = <String, String>{

      'page': page.toString(),

      'limit': limit.toString(),

    };



    if (category != null && category.isNotEmpty) {

      params['category'] = category;

    }

    if (available != null) {

      params['available'] = available.toString();

    }



    final query = params.entries

        .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')

        .join('&');



    return get('${ApiConfig.products}?$query');

  }



  Future<Response> put(String endpoint, dynamic data) async {

    final client = await _getDio();

    return client.put(endpoint, data: data);

  }



  Future<Response> delete(String endpoint) async {

    final client = await _getDio();

    return client.delete(endpoint);

  }



  Future<Response> createProduct(Map<String, dynamic> data) async {

    return post(ApiConfig.products, data);

  }



  Future<Response> updateProduct(String id, Map<String, dynamic> data) async {

    return put('${ApiConfig.products}/$id', data);

  }



  Future<Response> deleteProduct(String id) async {

    return delete('${ApiConfig.products}/$id');

  }



  Future<void> logout() async {

    try {

      final client = await _getDio();

      await client.post(ApiConfig.logout);

    } catch (_) {

      // Still clear local session even if logout request fails.

    } finally {

      await TokenStorage.clear();

    }

  }



  Future<UserProfile?> getProfile() async {
    try {
      final client = await _getDio();
      for (final endpoint in [ApiConfig.profile, ApiConfig.me]) {
        final response = await client.get(endpoint);
        if (response.statusCode == 200) {
          final profile = _parseProfileResponse(response.data);
          if (profile != null) return profile;
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  UserProfile? _parseProfileResponse(dynamic data) {
    if (data is! Map<String, dynamic> || data['success'] != true) {
      return null;
    }
    final user = data['user'] ?? data['data'];
    if (user is Map<String, dynamic>) {
      return UserProfile.fromJson(user);
    }
    return null;
  }

  Future<ProfileMutationResult> updateProfile(Map<String, dynamic> payload) async {
    try {
      final response = await put(ApiConfig.profile, payload);
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        final user = data['data'];
        if (user is Map<String, dynamic>) {
          return ProfileMutationResult(
            success: true,
            profile: UserProfile.fromJson(user),
            message: 'Profile updated',
          );
        }
        return const ProfileMutationResult(success: true, message: 'Profile updated');
      }
      return ProfileMutationResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to update profile',
      );
    } catch (_) {
      return const ProfileMutationResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<ProfileMutationResult> updatePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final response = await put(ApiConfig.updatePassword, {
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      });
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        return ProfileMutationResult(
          success: true,
          message: data['message']?.toString() ?? 'Password updated',
        );
      }
      return ProfileMutationResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to update password',
      );
    } catch (_) {
      return const ProfileMutationResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }



  Future<bool> isAuthenticated() async {

    final token = await TokenStorage.getToken();

    if (token == null || token.isEmpty) return false;

    return getProfile() != null;

  }

  Future<FarmsListResult> getFarms() async {
    try {
      final response = await get(ApiConfig.farms);
      if (response.statusCode == 200) {
        final data = response.data;
        if (data is Map<String, dynamic> && data['success'] == true) {
          final raw = data['data'];
          final farms = <Farm>[];
          if (raw is List) {
            for (final item in raw) {
              if (item is Map<String, dynamic>) {
                farms.add(Farm.fromJson(item));
              }
            }
          }
          return FarmsListResult(success: true, farms: farms);
        }
        return FarmsListResult(
          success: false,
          message: _messageFromBody(data),
        );
      }
      return FarmsListResult(
        success: false,
        message: _messageFromBody(response.data),
      );
    } catch (_) {
      return FarmsListResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<FarmMutationResult> createFarm(Map<String, dynamic> payload) async {
    try {
      final response = await post(ApiConfig.farms, payload);
      final data = response.data;
      if (response.statusCode == 201 || response.statusCode == 200) {
        if (data is Map<String, dynamic> && data['success'] == true) {
          return FarmMutationResult(
            success: true,
            message: data['message']?.toString(),
          );
        }
      }
      return FarmMutationResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to create farm',
      );
    } catch (_) {
      return FarmMutationResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  String? _messageFromBody(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data['message']?.toString();
    }
    return null;
  }

}

class FarmsListResult {
  final bool success;
  final List<Farm> farms;
  final String? message;

  FarmsListResult({
    required this.success,
    this.farms = const [],
    this.message,
  });
}

class FarmMutationResult {
  final bool success;
  final String? message;

  FarmMutationResult({required this.success, this.message});
}

class ProfileMutationResult {
  final bool success;
  final String? message;
  final UserProfile? profile;

  const ProfileMutationResult({
    required this.success,
    this.message,
    this.profile,
  });
}


