import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/user.dart';
import '../providers/theme_provider.dart';
import '../theme/app_theme.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final User user;
  final VoidCallback? onProfileTap;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onSearchTap;

  const CustomAppBar({
    Key? key,
    required this.title,
    required this.user,
    this.onProfileTap,
    this.onNotificationTap,
    this.onSearchTap,
  }) : super(key: key);

  @override
  Size get preferredSize => const Size.fromHeight(70);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primary, AppTheme.primary.withOpacity(0.8)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: AppTheme.primary.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              // Logo and Title
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppTheme.white,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(
                        Icons.work_outline,
                        size: 24,
                        color: AppTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            color: AppTheme.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Bonjour ${user.name.split(' ').first}!',
                          style: TextStyle(
                            color: AppTheme.white.withOpacity(0.8),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              
              // Actions
              Row(
                children: [
                  // Search Button
                  if (onSearchTap != null)
                    IconButton(
                      onPressed: onSearchTap,
                      icon: const Icon(
                        Icons.search,
                        color: AppTheme.white,
                        size: 24,
                      ),
                    ),
                  
                  // Theme Toggle
                  Consumer<ThemeProvider>(
                    builder: (context, themeProvider, child) {
                      return IconButton(
                        onPressed: () => themeProvider.toggleTheme(),
                        icon: Icon(
                          themeProvider.isDarkMode 
                              ? Icons.light_mode 
                              : Icons.dark_mode,
                          color: AppTheme.white,
                          size: 24,
                        ),
                      );
                    },
                  ),
                  
                  // Notifications
                  Stack(
                    children: [
                      IconButton(
                        onPressed: onNotificationTap,
                        icon: const Icon(
                          Icons.notifications_outlined,
                          color: AppTheme.white,
                          size: 24,
                        ),
                      ),
                      Positioned(
                        right: 8,
                        top: 8,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppTheme.error,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(width: 8),
                  
                  // Profile Avatar
                  GestureDetector(
                    onTap: onProfileTap,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: AppTheme.white,
                          width: 2,
                        ),
                      ),
                      child: ClipOval(
                        child: user.avatar != null
                            ? CachedNetworkImage(
                                imageUrl: user.avatar!,
                                fit: BoxFit.cover,
                                placeholder: (context, url) => Container(
                                  color: AppTheme.grey200,
                                  child: const Icon(
                                    Icons.person,
                                    color: AppTheme.grey500,
                                    size: 20,
                                  ),
                                ),
                                errorWidget: (context, url, error) => Container(
                                  color: AppTheme.secondary,
                                  child: Text(
                                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                                    style: const TextStyle(
                                      color: AppTheme.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              )
                            : Container(
                                color: AppTheme.secondary,
                                child: Center(
                                  child: Text(
                                    user.name.isNotEmpty ? user.name[0].toUpperCase() : 'U',
                                    style: const TextStyle(
                                      color: AppTheme.white,
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
