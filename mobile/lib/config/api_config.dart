import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

class ApiConfig {
  ApiConfig._();

  /// Override at build time: `--dart-define=API_BASE_URL=http://192.168.x.x:5000/api`
  static String get baseUrl {
    const fromEnv = String.fromEnvironment('API_BASE_URL');
    if (fromEnv.isNotEmpty) return fromEnv;
    if (!kIsWeb && defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  }

  // Auth
  static const login = '/auth/login';
  static const register = '/auth/register';
  static const checkEmail = '/auth/check-email';
  static const logout = '/auth/logout';
  static const me = '/auth/me';

  // User
  static const profile = '/user/profile';
  static const updatePassword = '/user/password';
  static const deleteAccount = '/user/me';

  // Products
  static const products = '/products';
  static const myProducts = '/products/my-products';
  static String productById(String id) => '/products/$id';
  static String farmerProducts(String farmerId) => '/products/farmer/$farmerId';

  // Farms
  static const farms = '/farms';
  static String farmById(String id) => '/farms/$id';

  // AgriAI (Express proxy)
  static const recommendCrop = '/agriai/recommend/crop';
  static const predictPrice = '/agriai/predict/price';
  static const priceForecasterMetadata = '/agriai/price-forecaster/metadata';
  static const agriaiHealth = '/agriai/health';
  static const agriaiTools = '/agriai/tools';
  static const agriaiToolsExecute = '/agriai/tools/execute';

  // Chat
  static const chat = '/chat';
  static String chatMessages(String chatId) => '/chat/$chatId/messages';
  static String chatAppend(String chatId) => '/chat/$chatId/messages/append';

  // Prices
  static const pricesTrends = '/prices/trends';
  static const pricesCrops = '/prices/crops';
  static const pricesRegions = '/prices/regions';
  static const pricesYearRange = '/prices/year-range';
  static const pricesSalesTiming = '/prices/sales-timing';
  static const pricesMultiCrop = '/prices/multi-crop-profitability';

  // Notifications & weather
  static const notifications = '/notifications';
  static const weatherForecast = '/weather/forecast';
  static String weatherFarm(String farmId) => '/weather/farm/$farmId';

  // Market
  static const marketTrends = '/market/trends';
}
