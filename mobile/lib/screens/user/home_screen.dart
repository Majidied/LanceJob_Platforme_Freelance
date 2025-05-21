// screens/user/home_screen.dart
import 'package:flutter/material.dart';
import '../../widgets/navbar.dart';
import '../../widgets/sidebar.dart';
import '../../widgets/tabs.dart';
import '../../widgets/talent_list.dart';


class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool isDarkMode = false;
  String activeTab = 'bestMatches';
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

  void setActiveTab(String tab) {
    setState(() {
      activeTab = tab;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
      drawer: Sidebar(
        isDarkMode: isDarkMode,
        currentRoute: '/user/home',
      ),
      body: SafeArea(
        child: Column(
          children: [
            Navbar(
              isDarkMode: isDarkMode,
              toggleDarkMode: toggleDarkMode,
              toggleMenu: toggleMenu,
            ),
            TabsWidget(
              isDarkMode: isDarkMode,
              activeTab: activeTab,
              setActiveTab: setActiveTab,
            ),
            Expanded(
              child: FreelancerList(isDarkMode: isDarkMode),
            ),
          ],
        ),
      ),
    );
  }
}