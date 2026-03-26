import 'package:flutter/material.dart';
import '../widgets/custom_text_field.dart';
import '../widgets/location_picker.dart';

class TraderSignupScreen extends StatefulWidget {
  const TraderSignupScreen({super.key});

  @override
  State<TraderSignupScreen> createState() => _TraderSignupScreenState();
}

class _TraderSignupScreenState extends State<TraderSignupScreen> {
  // Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  final _tinNumberController = TextEditingController();

  // Dropdown values
  String? _selectedRegion;
  String? _selectedWoreda;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trader Registration'),
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
                  'Trader Information',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2A5A2A),
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Please fill in your details for approval',
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 24),

                // Business Information
                const Text(
                  'Business Information',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),

                CustomTextField(
                  label: 'Full Name / Business Name',
                  hint: 'Enter your full name or business name',
                  controller: _nameController,
                  prefixIcon: Icons.business,
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
                  label: 'TIN Number',
                  hint: 'Enter your Tax Identification Number',
                  controller: _tinNumberController,
                  keyboardType: TextInputType.number,
                  prefixIcon: Icons.numbers,
                ),

                const SizedBox(height: 16),

                // Location
                const Text(
                  'Business Location',
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

                // Account Security
                const Text(
                  'Account Security',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 12),

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

                // Approval Notice
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.blue.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, color: Colors.blue.shade700),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Approval Required',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: Colors.blue.shade700,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'Your TIN number will be verified by admin. You will be notified once approved.',
                              style: TextStyle(fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
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
                          content: Text('Registration submitted! Awaiting admin approval.'),
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
                      'Register as Trader',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Login Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Already have an account? ',
                      style: TextStyle(color: Colors.grey),
                    ),
                    GestureDetector(
                      onTap: () {
                        Navigator.pushReplacementNamed(context, '/login');
                      },
                      child: const Text(
                        'Login',
                        style: TextStyle(
                          color: Color(0xFF2A5A2A),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
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
    _tinNumberController.dispose();
    super.dispose();
  }
}