// widgets/sidebar.dart (updated)
import 'package:flutter/material.dart';
import '../routes/routes.dart';

class Sidebar extends StatelessWidget {
  final bool isDarkMode;
  final String currentRoute;

  const Sidebar({
    Key? key,
    required this.isDarkMode,
    required this.currentRoute,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Détermine si l'utilisateur est sur une route freelancer ou utilisateur
    final bool isFreelancer = currentRoute.contains('/freelancer');
    final List<RouteInfo> routes = isFreelancer ? freelancerRoutes : userRoutes;

    return Drawer(
      backgroundColor: const Color(0xFF2E424C),
      child: Column(
        children: [
          const SizedBox(height: 50),
          // Logo
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 20),
            child: Column(
              children: [
                // Placeholder for logo
                Container(
                  width: 180,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Center(
                    child: Text(
                      'LANCEJOB',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'GET WORK',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          
          const Divider(color: Colors.white30),
          const SizedBox(height: 20),
          // Menu Items with Routes
          Expanded(
            child: ListView.builder(
              itemCount: routes.length,
              itemBuilder: (context, index) {
                final route = routes[index];
                final String fullPath = '${route.layout}/${route.path}';
                final bool isActive = currentRoute == fullPath;

                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: isActive ? const Color(0xFF417B9A) : Colors.transparent,
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: ListTile(
                    leading: Icon(
                      route.icon,
                      color: Colors.white,
                    ),
                    title: Text(
                      route.name,
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                    trailing: route.badge != null
                        ? Container(
                            width: 20,
                            height: 20,
                            decoration: const BoxDecoration(
                              color: Color(0xFF55A5CF),
                              shape: BoxShape.circle,
                            ),
                            child: Center(
                              child: Text(
                                '${route.badge}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                          )
                        : null,
                    onTap: () {
                      // Navigation vers la route
                      Navigator.pushReplacementNamed(context, fullPath);
                    },
                  ),
                );
              },
            ),
          ),
          // Logout icon in the bottom center
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Align(
              alignment: Alignment.bottomCenter,
              child: IconButton(
                icon: const Icon(
                  Icons.logout,
                  color: Colors.white,
                ),
                onPressed: () {
                  Navigator.pushReplacementNamed(context, '/login');
                },
                tooltip: 'Déconnexion',
              ),
            ),
          ),
        ],
      ),
    );
  }
}