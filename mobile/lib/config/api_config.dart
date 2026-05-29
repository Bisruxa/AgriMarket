class ApiConfig {
  ApiConfig._();

  static const baseUrl = 'https://agrimarket-gc00.onrender.com/api';

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
}
