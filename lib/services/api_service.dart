import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:path_provider/path_provider.dart';
import 'package:flutter/foundation.dart' show kIsWeb;

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  late Dio dio;
  late CookieJar? cookieJar;
  bool _isInitialized = false;

  ApiService._internal() {
    _init();
  }

  Future<void> _init() async {
    if (_isInitialized) return;
    
    // Web-compatible base URL configuration
    String baseUrl;
    
    if (kIsWeb) {
      // For web - use localhost or your backend URL
      // If your backend is running on port 5000
      baseUrl = 'http://localhost:5000/api';
      // If you're accessing from a different IP, change accordingly
      // baseUrl = 'http://192.168.1.100:5000/api';
    } else {
      // For mobile - we can use Platform check here since it's safe
      // But since we're debugging web, let's keep it simple
      baseUrl = 'http://10.0.2.2:5000/api';
    }
    
    print('🌐 Platform: ${kIsWeb ? "Web" : "Mobile"}');
    print('🌐 API Base URL: $baseUrl');
    
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      validateStatus: (status) => status != null && status < 500,
    ));
    
    // Initialize cookie handling based on platform
    if (!kIsWeb) {
      await _initCookieJar();
    } else {
      print('⚠️ Running on Web - cookies will be managed by browser');
      // For web, we need to send credentials with requests
      dio.options.extra['withCredentials'] = true;
    }
    
    // Add logging interceptor for debugging
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        print('📤 REQUEST: ${options.method} ${options.uri}');
        print('📤 Headers: ${options.headers}');
        if (options.data != null) {
          print('📤 Body: ${options.data}');
        }
        return handler.next(options);
      },
      onResponse: (response, handler) {
        print('📥 RESPONSE: ${response.statusCode} ${response.requestOptions.uri}');
        print('📥 Data: ${response.data}');
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return handler.next(response);
      },
      onError: (error, handler) {
        print('❌ ERROR: ${error.message}');
        if (error.response != null) {
          print('❌ Status: ${error.response?.statusCode}');
          print('❌ Data: ${error.response?.data}');
        }
        print('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return handler.next(error);
      },
    ));
    
    _isInitialized = true;
  }

  Future<void> _initCookieJar() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      cookieJar = PersistCookieJar(
        storage: FileStorage('${directory.path}/.cookies/'),
      );
      dio.interceptors.add(CookieManager(cookieJar!));
    } catch (e) {
      print('❌ Error initializing cookie jar: $e');
    }
  }

  Future<Dio> _getDio() async {
    if (!_isInitialized) {
      await _init();
    }
    return dio;
  }

  Future<Response> post(String endpoint, dynamic data) async {
    try {
      final client = await _getDio();
      return await client.post(endpoint, data: data);
    } catch (e) {
      print('❌ POST Error: $e');
      rethrow;
    }
  }

  Future<Response> get(String endpoint) async {
    try {
      final client = await _getDio();
      return await client.get(endpoint);
    } catch (e) {
      print('❌ GET Error: $e');
      rethrow;
    }
  }

  Future<Response> put(String endpoint, dynamic data) async {
    try {
      final client = await _getDio();
      return await client.put(endpoint, data: data);
    } catch (e) {
      print('❌ PUT Error: $e');
      rethrow;
    }
  }

  Future<Response> delete(String endpoint) async {
    try {
      final client = await _getDio();
      return await client.delete(endpoint);
    } catch (e) {
      print('❌ DELETE Error: $e');
      rethrow;
    }
  }

  Future<void> logout() async {
    try {
      final client = await _getDio();
      await client.post('/auth/logout');
      if (cookieJar != null) {
        await cookieJar!.deleteAll();
      }
      print('✅ Logged out and cookies cleared');
    } catch (e) {
      print('Logout error: $e');
    }
  }
  
  Future<bool> isAuthenticated() async {
    try {
      final client = await _getDio();
      final response = await client.get('/auth/me');
      return response.statusCode == 200 && response.data['success'] == true;
    } catch (e) {
      return false;
    }
  }
}