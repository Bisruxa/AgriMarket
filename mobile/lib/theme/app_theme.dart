import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppColors {
  static const primary = Color(0xFF2A5A2A);
  static const primaryLight = Color(0xFF4CAF50);
  static const primaryDark = Color(0xFF1B3D1B);
  static const accent = Color(0xFF8BC34A);
  static const surface = Color(0xFFF4F7F4);
  static const card = Colors.white;
  static const textPrimary = Color(0xFF1A2E1A);
  static const textSecondary = Color(0xFF6B7B6B);
  static const border = Color(0xFFE2E8E2);
  static const error = Color(0xFFD32F2F);
  static const traderAccent = Color(0xFF1565C0);
  static const traderLight = Color(0xFF42A5F5);

  static const primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryLight],
  );

  static const traderGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1565C0), traderLight],
  );
}

class AppTheme {
  static TextStyle _heading({double size = 18, FontWeight weight = FontWeight.w600}) {
    if (kIsWeb) {
      return TextStyle(fontSize: size, fontWeight: weight, color: AppColors.textPrimary);
    }
    return GoogleFonts.poppins(fontSize: size, fontWeight: weight, color: AppColors.textPrimary);
  }

  static TextStyle _body({double size = 14, Color? color}) {
    if (kIsWeb) {
      return TextStyle(fontSize: size, color: color ?? AppColors.textSecondary);
    }
    return GoogleFonts.poppins(fontSize: size, color: color ?? AppColors.textSecondary);
  }

  static ThemeData get light {
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.surface,
      primaryColor: AppColors.primary,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.primary,
        primary: AppColors.primary,
        secondary: AppColors.primaryLight,
        surface: AppColors.surface,
        error: AppColors.error,
      ),
    );

    final textTheme = kIsWeb ? base.textTheme : GoogleFonts.poppinsTextTheme(base.textTheme);

    return base.copyWith(
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: AppColors.surface,
        foregroundColor: AppColors.textPrimary,
        titleTextStyle: _heading(),
      ),
      cardTheme: CardThemeData(
        color: AppColors.card,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AppColors.border, width: 1),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        hintStyle: textTheme.bodyMedium?.copyWith(color: AppColors.textSecondary),
        labelStyle: textTheme.bodyMedium?.copyWith(
          color: AppColors.textSecondary,
          fontWeight: FontWeight.w500,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: _body(size: 16, color: Colors.white).copyWith(fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.primary,
          textStyle: _body(size: 14, color: AppColors.primary).copyWith(fontWeight: FontWeight.w600),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: AppColors.primary,
        unselectedItemColor: AppColors.textSecondary,
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      textTheme: textTheme.copyWith(
        headlineMedium: _heading(size: 24, weight: FontWeight.w700),
        titleLarge: _heading(size: 18),
        bodyMedium: _body(),
      ),
    );
  }
}
