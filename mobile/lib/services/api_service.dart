import 'package:agrimatketapp/config/api_config.dart';
import 'package:agrimatketapp/models/agriai_model.dart';
import 'package:agrimatketapp/models/farm_model.dart';
import 'package:agrimatketapp/models/notification_model.dart';
import 'package:agrimatketapp/models/price_model.dart';
import 'package:agrimatketapp/models/profile_model.dart';
import 'package:agrimatketapp/models/weather_model.dart';
import 'package:agrimatketapp/utils/crop_price_utils.dart';
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
    if (path.contains(ApiConfig.login) ||
        path.contains(ApiConfig.register) ||
        path.contains(ApiConfig.checkEmail) ||
        path.contains(ApiConfig.forgotPassword) ||
        path.contains(ApiConfig.resetPassword) ||
        path.contains(ApiConfig.verifyEmail) ||
        path.contains(ApiConfig.resendVerification)) {
      return false;
    }
    final token = await TokenStorage.getToken();
    return token != null && token.isNotEmpty;
  }

  Future<Dio> _getDio() async {
    if (!_isInitialized) await _init();
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

  Future<Response> put(String endpoint, dynamic data) async {
    final client = await _getDio();
    return client.put(endpoint, data: data);
  }

  Future<Response> patch(String endpoint, [dynamic data]) async {
    final client = await _getDio();
    return client.patch(endpoint, data: data);
  }

  Future<Response> delete(String endpoint) async {
    final client = await _getDio();
    return client.delete(endpoint);
  }

  // ── Auth ────────────────────────────────────────────────────────────────

  Future<AuthResult> register(Map<String, dynamic> payload) async {
    try {
      final response = await post(ApiConfig.register, payload);
      return _parseAuthResponse(response);
    } on DioException catch (e) {
      return AuthResult(
        success: false,
        message: _messageFromDio(e) ?? 'Registration failed',
        statusCode: e.response?.statusCode,
      );
    } catch (_) {
      return const AuthResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  AuthResult _parseAuthResponse(Response response) {
    final data = response.data;
    if ((response.statusCode == 200 || response.statusCode == 201) &&
        data is Map<String, dynamic> &&
        data['success'] == true) {
      return AuthResult(
        success: true,
        statusCode: response.statusCode,
        message: data['message']?.toString(),
        raw: data,
      );
    }
    return AuthResult(
      success: false,
      statusCode: response.statusCode,
      message: _messageFromBody(data) ?? 'Request failed',
      raw: data is Map<String, dynamic> ? data : null,
    );
  }

  Future<void> logout() async {
    try {
      final client = await _getDio();
      await client.post(ApiConfig.logout);
    } catch (_) {
      // Clear local session even if logout fails.
    } finally {
      await TokenStorage.clear();
    }
  }

  Future<AuthResult> forgotPassword(String email) async {
    try {
      final response = await post(ApiConfig.forgotPassword, {'email': email.trim()});
      return _parseAuthResponse(response);
    } on DioException catch (e) {
      return AuthResult(
        success: false,
        message: _messageFromDio(e) ?? 'Failed to send reset email',
        statusCode: e.response?.statusCode,
      );
    } catch (_) {
      return const AuthResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<AuthResult> verifyEmail(String token) async {
    try {
      final response = await post(ApiConfig.verifyEmail, {'token': token});
      return _parseAuthResponse(response);
    } on DioException catch (e) {
      return AuthResult(
        success: false,
        message: _messageFromDio(e) ?? 'Email verification failed',
        statusCode: e.response?.statusCode,
      );
    } catch (_) {
      return const AuthResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<AuthResult> resendVerification(String email) async {
    try {
      final response = await post(ApiConfig.resendVerification, {
        'email': email.trim(),
      });
      return _parseAuthResponse(response);
    } on DioException catch (e) {
      return AuthResult(
        success: false,
        message: _messageFromDio(e) ?? 'Failed to resend verification email',
        statusCode: e.response?.statusCode,
      );
    } catch (_) {
      return const AuthResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<AuthResult> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await post(ApiConfig.resetPassword, {
        'token': token,
        'newPassword': newPassword,
      });
      return _parseAuthResponse(response);
    } on DioException catch (e) {
      return AuthResult(
        success: false,
        message: _messageFromDio(e) ?? 'Failed to reset password',
        statusCode: e.response?.statusCode,
      );
    } catch (_) {
      return const AuthResult(
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

  // ── Profile ─────────────────────────────────────────────────────────────

  Future<UserProfile?> getProfile() async {
    try {
      final client = await _getDio();
      for (final endpoint in [ApiConfig.profile, ApiConfig.me]) {
        final response = await client.get(endpoint);
        final profile = _parseProfileResponse(response.data);
        if (profile != null) return profile;
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

  // ── Products ────────────────────────────────────────────────────────────

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
    String? search,
    double? minPrice,
    double? maxPrice,
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
    if (search != null && search.trim().isNotEmpty) {
      params['search'] = search.trim();
    }
    if (minPrice != null) {
      params['minPrice'] = minPrice.toString();
    }
    if (maxPrice != null) {
      params['maxPrice'] = maxPrice.toString();
    }
    final query = params.entries
        .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
        .join('&');
    return get('${ApiConfig.products}?$query');
  }

  Future<Response> getProductById(String id) async {
    return get(ApiConfig.productById(id));
  }

  Future<Response> getFarmerProducts(String farmerId, {int page = 1, int limit = 10}) async {
    return get(
      '${ApiConfig.farmerProducts(farmerId)}?page=$page&limit=$limit',
    );
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

  List<Farm> _extractFarmsFromResponse(dynamic data) {
    final farms = <Farm>[];
    dynamic raw = data;
    if (data is Map<String, dynamic>) {
      raw = data['data'] ?? data['farms'];
    }
    if (raw is List) {
      for (final item in raw) {
        if (item is Map<String, dynamic>) {
          farms.add(Farm.fromJson(item));
        }
      }
    }
    return farms;
  }

  Future<FarmsListResult> getFarms() async {
    try {
      final response = await get(ApiConfig.farms);
      final status = response.statusCode ?? 0;

      if (status == 200) {
        return FarmsListResult(
          success: true,
          farms: _extractFarmsFromResponse(response.data),
        );
      }

      if (status == 404) {
        return FarmsListResult(success: true, farms: []);
      }

      return FarmsListResult(
        success: false,
        message: _messageFromBody(response.data) ?? 'Failed to load farms',
      );
    } catch (_) {
      return FarmsListResult(
        success: false,
        message: 'Could not connect. Pull to refresh.',
      );
    }
  }

  Future<CropRecommendResult> getCropRecommendations({
    required double nitrogen,
    required double phosphorus,
    required double potassium,
    required double temperature,
    required double humidity,
    required double ph,
    required double rainfall,
    String? soilColor,
  }) async {
    try {
      final response = await post(ApiConfig.recommendCrop, {
        'nitrogen': nitrogen,
        'phosphorus': phosphorus,
        'potassium': potassium,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall,
        if (soilColor != null && soilColor.isNotEmpty) 'soil_color': soilColor,
      });
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        final payload = data['data'];
        final recommendations = <CropRecommendationItem>[];
        if (payload is Map<String, dynamic>) {
          final raw = payload['recommendations'];
          if (raw is List) {
            for (final item in raw) {
              if (item is Map<String, dynamic>) {
                recommendations.add(CropRecommendationItem.fromJson(item));
              }
            }
          }
        }
        return CropRecommendResult(success: true, recommendations: recommendations);
      }
      return CropRecommendResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to get recommendations',
      );
    } catch (_) {
      return const CropRecommendResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<Farm?> getFarmById(String id) async {
    try {
      final response = await get(ApiConfig.farmById(id));
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        final farm = data['data'];
        if (farm is Map<String, dynamic>) {
          return Farm.fromJson(farm);
        }
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<FarmMutationResult> updateFarm(String id, Map<String, dynamic> payload) async {
    try {
      final response = await put(ApiConfig.farmById(id), payload);
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        return FarmMutationResult(
          success: true,
          message: data['message']?.toString() ?? 'Farm updated',
        );
      }
      return FarmMutationResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to update farm',
      );
    } catch (_) {
      return FarmMutationResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<FarmMutationResult> deleteFarm(String id) async {
    try {
      final response = await delete(ApiConfig.farmById(id));
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        return FarmMutationResult(
          success: true,
          message: data['message']?.toString() ?? 'Farm deleted',
        );
      }
      return FarmMutationResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to delete farm',
      );
    } catch (_) {
      return FarmMutationResult(
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

  // ── AgriAI ────────────────────────────────────────────────────────────

  /// Used by chat screen — returns raw `data` map from backend.
  Future<Map<String, dynamic>> recommendCrop(Map<String, dynamic> payload) async {
    final response = await post(ApiConfig.recommendCrop, payload);
    final data = _unwrapData(response);
    if (data != null) return data;
    throw Exception(_errorMessage(response, 'Failed to get crop recommendation'));
  }

  /// Used by crop insights screen — default soil/weather values.
  Future<AgriAIRecommendResult> recommendCropWithDefaults({
    int nitrogen = 50,
    int phosphorus = 30,
    int potassium = 20,
    double temperature = 25,
    double humidity = 60,
    double ph = 6.5,
    double rainfall = 100,
    String soilColor = 'brown',
  }) async {
    try {
      final data = await recommendCrop({
        'nitrogen': nitrogen,
        'phosphorus': phosphorus,
        'potassium': potassium,
        'temperature': temperature,
        'humidity': humidity,
        'ph': ph,
        'rainfall': rainfall,
        'soil_color': soilColor,
      });
      final list = <CropRecommendationItem>[];
      final recs = data['recommendations'];
      if (recs is List) {
        for (final item in recs) {
          if (item is Map<String, dynamic>) {
            list.add(CropRecommendationItem.fromJson(item));
          }
        }
      }
      return AgriAIRecommendResult(success: true, recommendations: list);
    } catch (e) {
      return AgriAIRecommendResult(
        success: false,
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<Map<String, dynamic>> predictPrice(Map<String, dynamic> payload) async {
    final response = await post(ApiConfig.predictPrice, payload);
    final data = _unwrapData(response);
    if (data != null) return data;
    throw Exception(_errorMessage(response, 'Failed to get price forecast'));
  }

  Future<AgriAIPriceResult> predictCropPrice({
    required String cropName,
    required String region,
    int? year,
    int? month,
  }) async {
    final now = DateTime.now();
    try {
      final data = await predictPrice({
        'crop_name': cropName,
        'region': region,
        'year': year ?? now.year,
        'month': month ?? now.month,
      });
      return AgriAIPriceResult(
        success: true,
        forecast: CropPriceForecast.fromJson(data),
      );
    } catch (e) {
      return AgriAIPriceResult(
        success: false,
        message: e.toString().replaceFirst('Exception: ', ''),
      );
    }
  }

  Future<Map<String, dynamic>> getPriceForecasterMetadata() async {
    final response = await get(ApiConfig.priceForecasterMetadata);
    final data = _unwrapData(response);
    if (data != null) return data;
    throw Exception(_errorMessage(response, 'Failed to load forecast options'));
  }

  // ── Chat ──────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> getChats() async {
    final response = await get(ApiConfig.chat);
    return response.data is Map<String, dynamic>
        ? response.data as Map<String, dynamic>
        : {};
  }

  Future<Map<String, dynamic>> getChat(String chatId) async {
    final response = await get('${ApiConfig.chat}/$chatId');
    return response.data is Map<String, dynamic>
        ? response.data as Map<String, dynamic>
        : {};
  }

  Future<Map<String, dynamic>> createChat({String? title}) async {
    final response = await post(ApiConfig.chat, {
      'title': title ?? 'New Chat',
    });
    return response.data is Map<String, dynamic>
        ? response.data as Map<String, dynamic>
        : {};
  }

  Future<Map<String, dynamic>> sendMessage(String chatId, String content) async {
    final response = await post(
      '${ApiConfig.chat}/$chatId/messages',
      {'content': content},
    );
    return response.data is Map<String, dynamic>
        ? response.data as Map<String, dynamic>
        : {};
  }

  Future<bool> deleteChat(String chatId) async {
    try {
      final response = await delete('${ApiConfig.chat}/$chatId');
      final data = response.data;
      return response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true;
    } catch (_) {
      return false;
    }
  }

  Future<bool> appendChatMessage(
    String chatId, {
    required String role,
    required String content,
  }) async {
    try {
      final response = await post(ApiConfig.chatAppend(chatId), {
        'role': role,
        'content': content,
      });
      final data = response.data;
      return response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true;
    } catch (_) {
      return false;
    }
  }

  // ── Notifications ───────────────────────────────────────────────────────

  Future<NotificationsResult> getNotifications() async {
    try {
      final response = await get(ApiConfig.notifications);
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        final payload = data['data'];
        final list = <AppNotification>[];
        var unread = 0;
        if (payload is Map<String, dynamic>) {
          unread = payload['unreadCount'] is num
              ? (payload['unreadCount'] as num).toInt()
              : 0;
          final raw = payload['notifications'];
          if (raw is List) {
            for (final item in raw) {
              if (item is Map<String, dynamic>) {
                list.add(AppNotification.fromJson(item));
              }
            }
          }
        }
        return NotificationsResult(
          success: true,
          notifications: list,
          unreadCount: unread,
        );
      }
      return NotificationsResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to load notifications',
      );
    } catch (_) {
      return const NotificationsResult(
        success: false,
        message: 'Network error',
      );
    }
  }

  Future<NotificationsResult> markNotificationRead(String key) async {
    try {
      final response = await patch('${ApiConfig.notifications}/$key/read');
      return _notificationsFromResponse(response);
    } catch (_) {
      return const NotificationsResult(success: false, message: 'Network error');
    }
  }

  Future<NotificationsResult> markAllNotificationsRead() async {
    try {
      final response = await patch('${ApiConfig.notifications}/read-all');
      return _notificationsFromResponse(response);
    } catch (_) {
      return const NotificationsResult(success: false, message: 'Network error');
    }
  }

  Future<NotificationsResult> dismissNotification(String key) async {
    try {
      final response = await delete('${ApiConfig.notifications}/$key');
      return _notificationsFromResponse(response);
    } catch (_) {
      return const NotificationsResult(success: false, message: 'Network error');
    }
  }

  NotificationsResult _notificationsFromResponse(Response response) {
    final data = response.data;
    if (response.statusCode == 200 &&
        data is Map<String, dynamic> &&
        data['success'] == true) {
      final payload = data['data'];
      final list = <AppNotification>[];
      var unread = 0;
      if (payload is Map<String, dynamic>) {
        unread = payload['unreadCount'] is num
            ? (payload['unreadCount'] as num).toInt()
            : 0;
        final raw = payload['notifications'];
        if (raw is List) {
          for (final item in raw) {
            if (item is Map<String, dynamic>) {
              list.add(AppNotification.fromJson(item));
            }
          }
        }
      }
      return NotificationsResult(
        success: true,
        notifications: list,
        unreadCount: unread,
      );
    }
    return NotificationsResult(
      success: false,
      message: _messageFromBody(data) ?? 'Failed to update notifications',
    );
  }

  // ── Weather ─────────────────────────────────────────────────────────────

  Future<WeatherForecast?> getWeatherForecast({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final response = await get(
        '${ApiConfig.weatherForecast}?latitude=$latitude&longitude=$longitude',
      );
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is Map<String, dynamic>) {
        return WeatherForecast.fromJson(data['data'] as Map<String, dynamic>);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<WeatherForecast?> getWeatherForFarm(String farmId) async {
    try {
      final response = await get(ApiConfig.weatherFarm(farmId));
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is Map<String, dynamic>) {
        return WeatherForecast.fromJson(data['data'] as Map<String, dynamic>);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // ── Prices ──────────────────────────────────────────────────────────────

  /// Tries multiple DB crop names (e.g. Teff → "Teff (white)") like the web app.
  Future<List<PriceRecord>> getPriceTrendsForCropKey({
    required String cropKey,
    String? region,
    int limit = 200,
  }) async {
    final names = CropPriceUtils.dbNamesForKey(cropKey);
    final seen = <String>{};
    final all = <PriceRecord>[];

    for (final name in names) {
      final batch = await getPriceTrends(
        cropName: name,
        region: region,
        limit: limit,
      );
      for (final r in batch) {
        final k = '${r.year}-${r.month}-${r.region}-${r.cropName}';
        if (seen.add(k)) all.add(r);
      }
      if (all.isNotEmpty) break;
    }

    if (all.isEmpty) {
      for (final name in names) {
        final batch = await getPriceTrends(cropName: name, limit: limit);
        for (final r in batch) {
          final k = '${r.year}-${r.month}-${r.region}-${r.cropName}';
          if (seen.add(k)) all.add(r);
        }
        if (all.isNotEmpty) break;
      }
    }

    all.sort((a, b) {
      if (a.year != b.year) return a.year.compareTo(b.year);
      return a.month.compareTo(b.month);
    });
    return all;
  }

  Future<SalesTimingResult?> getSalesTimingForCropKey({
    required String cropKey,
    String? region,
  }) async {
    for (final name in CropPriceUtils.dbNamesForKey(cropKey)) {
      final result = await getSalesTiming(cropName: name, region: region);
      if (result != null && result.hasData) return result;
    }
    return getSalesTiming(cropName: CropPriceUtils.dbNamesForKey(cropKey).first, region: region);
  }

  Future<List<PriceRecord>> getPriceTrends({
    String? cropName,
    String? region,
    int limit = 100,
  }) async {
    try {
      final params = <String, String>{'limit': limit.toString()};
      if (cropName != null && cropName.isNotEmpty) {
        params['cropName'] = cropName;
      }
      if (region != null && region.isNotEmpty) {
        params['region'] = region;
      }
      final query = params.entries
          .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
          .join('&');
      final response = await get('${ApiConfig.pricesTrends}?$query');
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is List) {
        return (data['data'] as List)
            .whereType<Map<String, dynamic>>()
            .map(PriceRecord.fromJson)
            .toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<String>> getPriceCrops() async {
    try {
      final response = await get(ApiConfig.pricesCrops);
      final data = response.data;
      if (data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is List) {
        return (data['data'] as List).map((e) => e.toString()).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<List<String>> getPriceRegions() async {
    try {
      final response = await get(ApiConfig.pricesRegions);
      final data = response.data;
      if (data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is List) {
        return (data['data'] as List).map((e) => e.toString()).toList();
      }
      return [];
    } catch (_) {
      return [];
    }
  }

  Future<SalesTimingResult?> getSalesTiming({
    required String cropName,
    String? region,
  }) async {
    try {
      var path = '${ApiConfig.pricesSalesTiming}?cropName=${Uri.encodeComponent(cropName)}';
      if (region != null && region.isNotEmpty) {
        path += '&region=${Uri.encodeComponent(region)}';
      }
      final response = await get(path);
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is Map<String, dynamic>) {
        return SalesTimingResult.fromJson(data['data'] as Map<String, dynamic>);
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<MultiCropProfitabilityResult?> getMultiCropProfitability({String? farmId}) async {
    try {
      var path = ApiConfig.pricesMultiCrop;
      if (farmId != null && farmId.isNotEmpty) {
        path += '?farmId=${Uri.encodeComponent(farmId)}';
      }
      final response = await get(path);
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true &&
          data['data'] is Map<String, dynamic>) {
        return MultiCropProfitabilityResult.fromJson(
          data['data'] as Map<String, dynamic>,
        );
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  // ── Auth extras ─────────────────────────────────────────────────────────

  Future<bool> checkEmailAvailable(String email) async {
    try {
      final response = await post(ApiConfig.checkEmail, {'email': email.trim()});
      final data = response.data;
      if (data is Map<String, dynamic> && data['success'] == true) {
        return data['available'] == true;
      }
      return false;
    } catch (_) {
      return false;
    }
  }

  Future<ProfileMutationResult> deleteMyAccount() async {
    try {
      final response = await delete(ApiConfig.deleteAccount);
      final data = response.data;
      if (response.statusCode == 200 &&
          data is Map<String, dynamic> &&
          data['success'] == true) {
        await TokenStorage.clear();
        return ProfileMutationResult(
          success: true,
          message: data['message']?.toString() ?? 'Account deleted',
        );
      }
      return ProfileMutationResult(
        success: false,
        message: _messageFromBody(data) ?? 'Failed to delete account',
      );
    } catch (_) {
      return const ProfileMutationResult(
        success: false,
        message: 'Network error. Please try again.',
      );
    }
  }

  Future<Map<String, dynamic>> executeAgriAiTool({
    required String name,
    Map<String, dynamic>? args,
  }) async {
    final response = await post(ApiConfig.agriaiToolsExecute, {
      'name': name,
      'args': args ?? {},
    });
    return response.data is Map<String, dynamic>
        ? response.data as Map<String, dynamic>
        : {};
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  Map<String, dynamic>? _unwrapData(Response response) {
    if (response.statusCode != 200) return null;
    final body = response.data;
    if (body is! Map<String, dynamic>) return null;
    if (body['success'] != true) return null;
    final data = body['data'];
    return data is Map<String, dynamic> ? data : null;
  }

  String _errorMessage(Response response, String fallback) {
    return _messageFromBody(response.data) ?? fallback;
  }

  String? _messageFromBody(dynamic data) {
    if (data is Map<String, dynamic>) {
      return data['message']?.toString();
    }
    return null;
  }

  String? _messageFromDio(DioException e) {
    return _messageFromBody(e.response?.data);
  }
}

class AuthResult {
  final bool success;
  final String? message;
  final int? statusCode;
  final Map<String, dynamic>? raw;

  const AuthResult({
    required this.success,
    this.message,
    this.statusCode,
    this.raw,
  });
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

class CropRecommendationItem {
  final String crop;
  final double confidence;

  const CropRecommendationItem({required this.crop, required this.confidence});

  factory CropRecommendationItem.fromJson(Map<String, dynamic> json) {
    final confRaw = json['confidence'];
    final confidence = confRaw is num
        ? confRaw.toDouble()
        : double.tryParse(confRaw?.toString() ?? '') ?? 0;
    return CropRecommendationItem(
      crop: json['crop']?.toString() ?? '',
      confidence: confidence,
    );
  }
}

class CropRecommendResult {
  final bool success;
  final List<CropRecommendationItem> recommendations;
  final String? message;

  const CropRecommendResult({
    required this.success,
    this.recommendations = const [],
    this.message,
  });
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

class AgriAIRecommendResult {
  final bool success;
  final String? message;
  final List<CropRecommendationItem> recommendations;

  const AgriAIRecommendResult({
    required this.success,
    this.message,
    this.recommendations = const [],
  });
}

class AgriAIPriceResult {
  final bool success;
  final String? message;
  final CropPriceForecast? forecast;

  const AgriAIPriceResult({
    required this.success,
    this.message,
    this.forecast,
  });
}
