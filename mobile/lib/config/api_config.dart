class ApiConfig {
  ApiConfig._();

  static const baseUrl = 'http://localhost:5000/api';

  // Auth
  static const login = '/auth/login';
  static const logout = '/auth/logout';

  // User
  static const profile = '/user/profile';
  static const me = '/auth/me';
  static const updatePassword = '/user/password';

  // Products
  static const products = '/products';
  static const myProducts = '/products/my-products';

  // Farms
  static const farms = '/farms';

  // AgriAI
  static const cropRecommend = '/agriai/recommend/crop';
  static const pricePredict = '/agriai/predict/price';
  static const priceForecasterMetadata = '/agriai/price-forecaster/metadata';

  // Chat
  static const chat = '/chat';
  static String chatMessages(String chatId) => '/chat/$chatId/messages';
}
