// routes/routes.dart
import 'package:flutter/material.dart';

// Screens imports
import '../screens/user/home_screen.dart';
import '../screens/user/my_offers_screen.dart';
import '../screens/user/add_offer_screen.dart';
import '../screens/user/messages_screen.dart';
import '../screens/freelancer/freelancer_home_screen.dart';

class RouteInfo {
  final String name;
  final String layout;
  final String path;
  final IconData icon;
  final Widget screen;
  final bool secondary;
  final int? badge;

  RouteInfo({
    required this.name,
    required this.layout,
    required this.path,
    required this.icon,
    required this.screen,
    this.secondary = false,
    this.badge,
  });
}

// Routes utilisateur
final List<RouteInfo> userRoutes = [
  RouteInfo(
    name: "Home",
    layout: "/user",
    path: "home",
    icon: Icons.home,
    screen: const HomeScreen(),
  ),
  RouteInfo(
    name: "My Offers",
    layout: "/user",
    path: "my-offers",
    icon: Icons.work_outline,
    screen: const MyOffersScreen(),
    secondary: true,
  ),
  RouteInfo(
    name: "Add Offre",
    layout: "/user",
    path: "add-offre",
    icon: Icons.add,
    screen: const AddOfferScreen(),
    secondary: true,
  ),
  RouteInfo(
    name: "Messages",
    layout: "/user",
    path: "messages",
    icon: Icons.message,
    screen: const MessagesScreen(),
    secondary: true,
    badge: 5,
  ),
];

// Routes freelancer
final List<RouteInfo> freelancerRoutes = [
  RouteInfo(
    name: "Home",
    layout: "/freelancer",
    path: "home",
    icon: Icons.home,
    screen: const FreelancerHomeScreen(),
  ),
  // Ajoutez d'autres routes pour les freelancers ici
];

// Tous les routes combinés
final List<RouteInfo> allRoutes = [...userRoutes, ...freelancerRoutes];

// Fonction pour générer les routes nommées
Map<String, Widget Function(BuildContext)> getAppRoutes() {
  final Map<String, Widget Function(BuildContext)> routes = {};
  
  for (var route in allRoutes) {
    String fullPath = '${route.layout}/${route.path}';
    routes[fullPath] = (context) => route.screen;
  }
  
  return routes;
}