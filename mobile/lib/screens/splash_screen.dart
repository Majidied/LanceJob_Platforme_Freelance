import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import 'auth/login_screen.dart';
import 'home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({Key? key}) : super(key: key);

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    await Future.delayed(const Duration(seconds: 2)); // Show splash for 2 seconds
    
    if (mounted) {
      final authProvider = context.read<AuthProvider>();
      
      if (authProvider.isAuthenticated) {
        _navigateToHome();
      } else {
        _navigateToLogin();
      }
    }
  }

  void _navigateToHome() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const HomeScreen()),
    );
  }

  void _navigateToLogin() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: AppTheme.white,
                borderRadius: BorderRadius.circular(30),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: const Icon(
                Icons.work_outline,
                size: 60,
                color: AppTheme.primary,
              ),
            ).animate()
              .scale(duration: 800.ms, curve: Curves.elasticOut)
              .fadeIn(duration: 600.ms),
            
            const SizedBox(height: 30),
            
            // App Name
            Text(
              'LanceJob',
              style: Theme.of(context).textTheme.displayMedium?.copyWith(
                color: AppTheme.white,
                fontWeight: FontWeight.bold,
                letterSpacing: 2,
              ),
            ).animate()
              .fadeIn(delay: 300.ms, duration: 600.ms)
              .slideY(begin: 0.3, end: 0),
            
            const SizedBox(height: 10),
            
            // Tagline
            Text(
              'Connectez-vous avec les meilleurs talents',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: AppTheme.white.withOpacity(0.8),
                fontSize: 16,
              ),
              textAlign: TextAlign.center,
            ).animate()
              .fadeIn(delay: 600.ms, duration: 600.ms)
              .slideY(begin: 0.3, end: 0),
            
            const SizedBox(height: 50),
            
            // Loading indicator
            const CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppTheme.white),
              strokeWidth: 3,
            ).animate()
              .fadeIn(delay: 900.ms, duration: 600.ms),
          ],
        ),
      ),
    );
  }
}
