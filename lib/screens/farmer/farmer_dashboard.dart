import 'package:flutter/material.dart';
import '../../models/crop_model.dart';
import '../../models/product_model.dart';
import '../../widgets/welcome_card.dart';
import '../../widgets/profitable_crops_card.dart';
import '../../widgets/product_card.dart';
import './farmer_profile.dart';
import 'crop_recommendation.dart';
import './farmer.chat.dart';
import 'marketplace.dart';
// import 'my_products.dart'; 

class FarmerDashboard extends StatefulWidget {
  const FarmerDashboard({super.key});

  @override
  State<FarmerDashboard> createState() => _FarmerDashboardState();
}

class _FarmerDashboardState extends State<FarmerDashboard> {
  int _selectedIndex = 0;
  
  // Mock farmer data
  final String farmerName = 'Bisrat Alemayehu';
  final String farmName = 'Green Valley Farm';
  final String profileImage = 'assets/images/welcome.jpg';

  // Screens for bottom navigation
  late final List<Widget> _screens = [
    // Home/Dashboard Screen
    _buildHomeScreen(),
    // Crop Recommendations Screen
    const CropRecommendation(),
    // Marketplace Screen
    const Marketplace(),
    // Chats Screen
    // const FarmerChat(), // Uncomment this when you create the chat screen
    // // Profile Screen
    // const FarmerProfile(),
  ];

  // Navigation bar items
  final List<BottomNavigationBarItem> _navItems = const [
    BottomNavigationBarItem(
      icon: Icon(Icons.home),
      label: 'Home',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.auto_awesome),
      label: 'Crops',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.store),
      label: 'Market',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.chat),
      label: 'Chats',
    ),
    BottomNavigationBarItem(
      icon: Icon(Icons.person),
      label: 'Profile',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: _screens[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 10,
              offset: const Offset(0, -3),
            ),
          ],
        ),
        child: BottomNavigationBar(
          type: BottomNavigationBarType.fixed,
          backgroundColor: Colors.white,
          selectedItemColor: const Color(0xFF2A5A2A),
          unselectedItemColor: Colors.grey.shade500,
          selectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 12,
          ),
          unselectedLabelStyle: const TextStyle(
            fontSize: 12,
          ),
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          items: _navItems,
        ),
      ),
    );
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  // Home Screen Widget (your original dashboard content)
  Widget _buildHomeScreen() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Card
            WelcomeCard(
              farmerName: farmerName,
              farmName: farmName,
              profileImageUrl: profileImage,
              onViewProfile: () {
                // Switch to profile tab
                setState(() {
                  _selectedIndex = 4; // Profile tab index
                });
              },
            ),

            const SizedBox(height: 20),

            // Top Profitable Crops
            ProfitableCropsCard(
              crops: topProfitableCrops,
              onViewAll: () {
                // Switch to crops tab
                setState(() {
                  _selectedIndex = 1; // Crops tab index
                });
              },
            ),

            const SizedBox(height: 20),
           const SizedBox(height: 20),

            // Recent Marketplace Listings
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Listings',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _selectedIndex = 2; // Market tab index
                    });
                  },
                  child: const Text(
                    'View All',
                    style: TextStyle(
                      color: Color(0xFF2A5A2A),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Product Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: mockProducts.length > 4 ? 4 : mockProducts.length,
              itemBuilder: (context, index) {
                return ProductCard(
                  product: mockProducts[index],
                  onTap: () {
                    // Navigate to product detail or switch to market tab
                    setState(() {
                      _selectedIndex = 2;
                    });
                  },
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}