import 'package:flutter/material.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/custom_dropdown.dart';
import '../widgets/location_picker.dart';

class FarmerSignupScreen extends StatefulWidget {
  const FarmerSignupScreen({super.key});

  @override
  State<FarmerSignupScreen> createState() => _FarmerSignupScreenState();
}

class _FarmerSignupScreenState extends State<FarmerSignupScreen> {
  // Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _farmLocationController = TextEditingController();
  final _farmSizeController = TextEditingController();
  final _cropsController = TextEditingController();

  // Dropdown values
  String? _selectedRegion;
  String? _selectedWoreda;
  String? _selectedExperience;

  final List<String> _experienceLevels = [
    'Beginner (0-2 years)',
    'Intermediate (3-5 years)',
    'Advanced (6-10 years)',
    'Expert (10+ years)',
  ];

  final List<String> _commonCrops = [
    'Teff',
    'Wheat',
    'Maize',
    'Barley',
    'Coffee',
    'Sorghum',
    'Millet',
    'Finger Millet',
    'Oats',
    'Sesame',
    'Niger Seed',
    'Chickpea',
    'Lentils',
    'Faba Beans',
    'Field Peas',
    'Grass Peas',
    'Haricot Beans',
    'Soybeans',
    'Sunflower',
    'Groundnuts',
    'Enset',
    'Khat',
    'Sugar Cane',
    'Cotton',
    'Fruits',
    'Vegetables',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Farmer Registration'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                const Text(
                  'Farmer Information',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2A5A2A),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Please fill in your details',
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),

                // Personal Information
                const Text(
                  'Personal Information',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  label: 'Full Name',
                  hint: 'Enter your full name',
                  controller: _nameController,
                  prefixIcon: Icons.person,
                ),

                CustomTextField(
                  label: 'Email Address',
                  hint: 'Enter your email',
                  controller: _emailController,
                  keyboardType: TextInputType.emailAddress,
                  prefixIcon: Icons.email,
                ),

                CustomTextField(
                  label: 'Phone Number',
                  hint: 'Enter your phone number',
                  controller: _phoneController,
                  keyboardType: TextInputType.phone,
                  prefixIcon: Icons.phone,
                ),

                CustomTextField(
                  label: 'Password',
                  hint: 'Create a password',
                  controller: _passwordController,
                  obscureText: true,
                  prefixIcon: Icons.lock,
                ),

                CustomTextField(
                  label: 'Confirm Password',
                  hint: 'Confirm your password',
                  controller: _confirmPasswordController,
                  obscureText: true,
                  prefixIcon: Icons.lock_outline,
                ),

                const SizedBox(height: 16),

                // Location
                const Text(
                  'Your Location',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),

                LocationPicker(
                  selectedRegion: _selectedRegion,
                  selectedWoreda: _selectedWoreda,
                  onRegionChanged: (value) {
                    setState(() {
                      _selectedRegion = value;
                      _selectedWoreda = null;
                    });
                  },
                  onWoredaChanged: (value) {
                    setState(() {
                      _selectedWoreda = value;
                    });
                  },
                ),

                const SizedBox(height: 16),

                // Farm Information
                const Text(
                  'Farm Information',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  label: 'Farm Location',
                  hint: 'Enter your farm location (specific area)',
                  controller: _farmLocationController,
                  prefixIcon: Icons.location_on,
                ),

                CustomTextField(
                  label: 'Farm Size (in hectares)',
                  hint: 'e.g., 5.5',
                  controller: _farmSizeController,
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.square_foot,
                ),

                // Crops Multi-select (simplified with TextField for now)
                CustomTextField(
                  label: 'Crops You Plant',
                  hint: 'e.g., Teff, Wheat, Maize',
                  controller: _cropsController,
                  prefixIcon: Icons.grass,
                ),

                // Experience Dropdown
                CustomDropdown<String>(
                  label: 'Farming Experience',
                  value: _selectedExperience,
                  items: _experienceLevels,
                  itemLabel: (item) => item,
                  onChanged: (value) {
                    setState(() {
                      _selectedExperience = value;
                    });
                  },
                  hint: 'Select your experience level',
                ),

                const SizedBox(height: 24),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  height: 54,
                  child: ElevatedButton(
                    onPressed: () {
                      // Handle registration
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Registration successful! Pending approval.'),
                          backgroundColor: Color(0xFF2A5A2A),
                        ),
                      );
                      Navigator.pushReplacementNamed(context, '/login');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF2A5A2A),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Register as Farmer',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _farmLocationController.dispose();
    _farmSizeController.dispose();
    _cropsController.dispose();
    super.dispose();
  }
}