// screens/freelancer/freelancer_home_screen.dart
import 'package:flutter/material.dart';
import '../../widgets/navbar.dart';
import '../../widgets/sidebar.dart';

class FreelancerHomeScreen extends StatefulWidget {
  const FreelancerHomeScreen({Key? key}) : super(key: key);

  @override
  State<FreelancerHomeScreen> createState() => _FreelancerHomeScreenState();
}

class _FreelancerHomeScreenState extends State<FreelancerHomeScreen> {
  bool isDarkMode = false;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();

  void toggleDarkMode() {
    setState(() {
      isDarkMode = !isDarkMode;
    });
  }

  void toggleMenu() {
    if (scaffoldKey.currentState?.isDrawerOpen ?? false) {
      scaffoldKey.currentState?.closeDrawer();
    } else {
      scaffoldKey.currentState?.openDrawer();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
      drawer: Sidebar(
        isDarkMode: isDarkMode,
        currentRoute: '/freelancer/home',
      ),
      body: SafeArea(
        child: Column(
          children: [
            Navbar(
              isDarkMode: isDarkMode,
              toggleDarkMode: toggleDarkMode,
              toggleMenu: toggleMenu,
            ),
            Expanded(
              child: Center(
                child: Text(
                  'Freelancer Home Screen',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}