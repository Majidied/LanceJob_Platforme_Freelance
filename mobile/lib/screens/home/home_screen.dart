import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/custom_app_bar.dart';
import '../../widgets/custom_bottom_nav.dart';
import '../job_search_screen.dart';
import '../my_applications_screen.dart';
import '../enhanced_profile_screen.dart';
import '../my_posted_jobs_screen.dart';
import 'freelancer_home.dart';
import 'client_home.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onTabSelected(int index) {
    setState(() {
      _currentIndex = index;
    });
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;
        if (user == null) return const SizedBox.shrink();

        final isFreelancer = user.role == 'freelancer';

        return Scaffold(
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          appBar: CustomAppBar(
            title: 'LanceJob',
            user: user,
            onProfileTap: () {
              // Navigate to profile
            },
            onNotificationTap: () {
              // Navigate to notifications
            },
          ),
          body: PageView(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            children: isFreelancer
                ? [
                    const FreelancerHomeTab(),
                    const FreelancerJobsTab(),
                    const FreelancerApplicationsTab(),
                    const FreelancerProfileTab(),
                  ]
                : [
                    const ClientHomeTab(),
                    const ClientTalentsTab(),
                    const ClientJobsTab(),
                    const ClientProfileTab(),
                  ],
          ),
          bottomNavigationBar: CustomBottomNav(
            currentIndex: _currentIndex,
            onTap: _onTabSelected,
            isFreelancer: isFreelancer,
          ),
        );
      },
    );
  }
}

// Freelancer Tabs
class FreelancerHomeTab extends StatelessWidget {
  const FreelancerHomeTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const FreelancerHome();
  }
}

class FreelancerJobsTab extends StatelessWidget {
  const FreelancerJobsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const JobSearchScreen();
  }
}

class FreelancerApplicationsTab extends StatelessWidget {
  const FreelancerApplicationsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const MyApplicationsScreen();
  }
}

class FreelancerProfileTab extends StatelessWidget {
  const FreelancerProfileTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const EnhancedProfileScreen();
  }
}

// Client Tabs
class ClientHomeTab extends StatelessWidget {
  const ClientHomeTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const ClientHome();
  }
}

class ClientTalentsTab extends StatelessWidget {
  const ClientTalentsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text('Talents Tab - Coming Soon'),
    );
  }
}

class ClientJobsTab extends StatelessWidget {
  const ClientJobsTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const MyPostedJobsScreen();
  }
}

class ClientProfileTab extends StatelessWidget {
  const ClientProfileTab({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return const EnhancedProfileScreen();
  }
}
