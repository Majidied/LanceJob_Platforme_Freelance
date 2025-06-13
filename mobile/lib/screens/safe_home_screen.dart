import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../theme/app_theme.dart';
import '../models/job.dart';
import '../widgets/job_card.dart';
import 'job_post_screen.dart';
import 'job_search_screen.dart';

class SafeHomeScreen extends StatefulWidget {
  const SafeHomeScreen({Key? key}) : super(key: key);

  @override
  State<SafeHomeScreen> createState() => _SafeHomeScreenState();
}

class _SafeHomeScreenState extends State<SafeHomeScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    // Initialize data after the widget is built
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initializeData();
    });
  }

  Future<void> _initializeData() async {
    final dataProvider = context.read<DataProvider>();
    await dataProvider.initializeData();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;
        if (user == null) {
          return const Scaffold(
            body: Center(
              child: Text('Please log in'),
            ),
          );
        }

        return Scaffold(
          backgroundColor: AppTheme.backgroundLight,
          appBar: AppBar(
            title: Text('Welcome ${user.name}'),
            backgroundColor: AppTheme.primary,
            foregroundColor: AppTheme.white,
            elevation: 0,
          ),
          body: SafeArea(
            child: _buildContent(user.role),
          ),
          floatingActionButton: _currentIndex == 1 ? _buildFloatingActionButton(user.role) : null,
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _currentIndex,
            onTap: (index) {
              setState(() {
                _currentIndex = index;
              });
            },
            type: BottomNavigationBarType.fixed,
            selectedItemColor: AppTheme.primary,
            unselectedItemColor: AppTheme.grey400,
            items: const [
              BottomNavigationBarItem(
                icon: Icon(Icons.home),
                label: 'Home',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.work),
                label: 'Jobs',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.message),
                label: 'Messages',
              ),
              BottomNavigationBarItem(
                icon: Icon(Icons.person),
                label: 'Profile',
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildContent(String role) {
    switch (_currentIndex) {
      case 0:
        return _buildHomeTab(role);
      case 1:
        return _buildJobsTab(role);
      case 2:
        return _buildMessagesTab();
      case 3:
        return _buildProfileTab();
      default:
        return _buildHomeTab(role);
    }
  }

  Widget _buildHomeTab(String role) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome card
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primary, AppTheme.primary.withOpacity(0.8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  role == 'freelancer' ? 'Find Your Next Project' : 'Find Great Talent',
                  style: const TextStyle(
                    color: AppTheme.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  role == 'freelancer' 
                      ? 'Browse available jobs and showcase your skills'
                      : 'Connect with skilled freelancers for your projects',
                  style: const TextStyle(
                    color: AppTheme.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Stats section
          Text(
            'Overview',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  icon: Icons.work,
                  title: role == 'freelancer' ? 'Active Bids' : 'Active Jobs',
                  value: '3',
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  icon: Icons.star,
                  title: 'Rating',
                  value: '4.9',
                  color: AppTheme.warning,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  icon: Icons.attach_money,
                  title: role == 'freelancer' ? 'Earned' : 'Spent',
                  value: '\$2,340',
                  color: AppTheme.success,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildStatCard(
                  icon: Icons.people,
                  title: role == 'freelancer' ? 'Clients' : 'Freelancers',
                  value: '12',
                  color: AppTheme.info,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Quick Actions
          Text(
            'Quick Actions',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            childAspectRatio: 1.5,
            children: role == 'freelancer' 
                ? [
                    _buildQuickActionCard(
                      icon: Icons.search,
                      title: 'Browse Jobs',
                      subtitle: 'Find new opportunities',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const JobSearchScreen(),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.person,
                      title: 'Edit Profile',
                      subtitle: 'Update your skills',
                      onTap: () {
                        setState(() {
                          _currentIndex = 3; // Go to profile tab
                        });
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.message,
                      title: 'Messages',
                      subtitle: 'Chat with clients',
                      onTap: () {
                        setState(() {
                          _currentIndex = 2; // Go to messages tab
                        });
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.analytics,
                      title: 'My Applications',
                      subtitle: 'Track your bids',
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Applications tracking coming soon!')),
                        );
                      },
                    ),
                  ]
                : [
                    _buildQuickActionCard(
                      icon: Icons.add_circle,
                      title: 'Post Job',
                      subtitle: 'Find talent fast',
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const JobPostScreen(),
                          ),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.people_alt,
                      title: 'Find Freelancers',
                      subtitle: 'Browse profiles',
                      onTap: () {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Freelancer browsing coming soon!')),
                        );
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.message,
                      title: 'Messages',
                      subtitle: 'Chat with freelancers',
                      onTap: () {
                        setState(() {
                          _currentIndex = 2; // Go to messages tab
                        });
                      },
                    ),
                    _buildQuickActionCard(
                      icon: Icons.work,
                      title: 'My Jobs',
                      subtitle: 'Manage projects',
                      onTap: () {
                        setState(() {
                          _currentIndex = 1; // Go to jobs tab
                        });
                      },
                    ),
                  ],
          ),

          const SizedBox(height: 24),

          // Recent activity
          Text(
            'Recent Activity',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),

          _buildRecentActivity(),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.grey200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: AppTheme.grey600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppTheme.grey200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(
              icon,
              color: AppTheme.primary,
              size: 32,
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            Text(
              subtitle,
              style: TextStyle(
                color: AppTheme.grey600,
                fontSize: 12,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityItem({
    required String title,
    required String subtitle,
    required String time,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.grey200),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppTheme.grey200,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(Icons.notifications, color: AppTheme.grey600),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  subtitle,
                  style: TextStyle(
                    color: AppTheme.grey600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Text(
            time,
            style: TextStyle(
              color: AppTheme.grey500,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJobsTab(String role) {
    return Consumer<DataProvider>(
      builder: (context, dataProvider, child) {
        return RefreshIndicator(
          onRefresh: () async {
            await dataProvider.loadJobs();
          },
          child: Column(
            children: [
              // Search and Filter Bar
              Container(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppTheme.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTheme.grey200),
                        ),
                        child: TextField(
                          decoration: InputDecoration(
                            hintText: 'Search jobs...',
                            prefixIcon: Icon(Icons.search, color: AppTheme.grey400),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          ),
                          onChanged: (query) {
                            // TODO: Implement search
                          },
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      decoration: BoxDecoration(
                        color: AppTheme.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.filter_list, color: AppTheme.white),
                        onPressed: () {
                          // TODO: Show filter dialog
                        },
                      ),
                    ),
                  ],
                ),
              ),
              
              // Jobs List
              Expanded(
                child: dataProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : dataProvider.jobs.isEmpty
                        ? _buildEmptyState('No jobs available', Icons.work_off)
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            itemCount: dataProvider.jobs.length,
                            itemBuilder: (context, index) {
                              final job = dataProvider.jobs[index];
                              return Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: JobCard(
                                  job: job,
                                  onTap: () {
                                    // Navigate to job details
                                    _showJobDetails(job);
                                  },
                                ),
                              );
                            },
                          ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMessagesTab() {
    return Consumer<DataProvider>(
      builder: (context, dataProvider, child) {
        return Column(
          children: [
            // Search and compose bar
            Container(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppTheme.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.grey200),
                      ),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search conversations...',
                          prefixIcon: Icon(Icons.search, color: AppTheme.grey400),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.edit, color: AppTheme.white),
                      onPressed: () {
                        _showNewMessageDialog();
                      },
                    ),
                  ),
                ],
              ),
            ),
            
            // Messages list
            Expanded(
              child: dataProvider.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : dataProvider.conversations.isEmpty
                      ? _buildEmptyState('No messages yet', Icons.message_outlined)
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: _getDemoConversations().length,
                          itemBuilder: (context, index) {
                            final conversation = _getDemoConversations()[index];
                            return _buildConversationItem(conversation);
                          },
                        ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildConversationItem(Map<String, dynamic> conversation) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.grey200),
      ),
      child: InkWell(
        onTap: () => _openConversation(conversation),
        child: Row(
          children: [
            // Avatar
            CircleAvatar(
              radius: 24,
              backgroundColor: AppTheme.primary,
              child: Text(
                conversation['name'][0].toUpperCase(),
                style: const TextStyle(
                  color: AppTheme.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),
            
            // Message content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        conversation['name'],
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        conversation['time'],
                        style: TextStyle(
                          color: AppTheme.grey500,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    conversation['lastMessage'],
                    style: TextStyle(
                      color: AppTheme.grey600,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            
            // Unread indicator
            if (conversation['unread'] > 0)
              Container(
                margin: const EdgeInsets.only(left: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${conversation['unread']}',
                  style: const TextStyle(
                    color: AppTheme.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileTab() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        final user = authProvider.user;
        if (user == null) return const SizedBox.shrink();

        return SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primary, AppTheme.primary.withOpacity(0.8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  children: [
                    CircleAvatar(
                      radius: 40,
                      backgroundColor: AppTheme.white,
                      child: user.avatar != null
                          ? ClipOval(
                              child: Image.network(
                                user.avatar!,
                                width: 80,
                                height: 80,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    Text(user.name[0].toUpperCase(),
                                        style: TextStyle(
                                          fontSize: 32,
                                          fontWeight: FontWeight.bold,
                                          color: AppTheme.primary,
                                        )),
                              ),
                            )
                          : Text(
                              user.name[0].toUpperCase(),
                              style: TextStyle(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.primary,
                              ),
                            ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user.name,
                      style: const TextStyle(
                        color: AppTheme.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      user.email,
                      style: const TextStyle(
                        color: AppTheme.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w400,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        user.role.toUpperCase(),
                        style: const TextStyle(
                          color: AppTheme.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Profile Stats
              Row(
                children: [
                  Expanded(
                    child: _buildStatCard(
                      icon: Icons.star,
                      title: 'Rating',
                      value: '${user.rating?.toStringAsFixed(1) ?? "N/A"}',
                      color: AppTheme.warning,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildStatCard(
                      icon: Icons.work,
                      title: user.role == 'freelancer' ? 'Completed' : 'Posted',
                      value: '${user.stats.completedJobs}',
                      color: AppTheme.success,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 24),

              // Profile Actions
              Text(
                'Profile Actions',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),

              _buildProfileAction(
                icon: Icons.person,
                title: 'Edit Profile',
                subtitle: 'Update your personal information',
                onTap: () => _editProfile(),
              ),
              _buildProfileAction(
                icon: Icons.security,
                title: 'Security Settings',
                subtitle: 'Change password and security options',
                onTap: () => _openSecuritySettings(),
              ),
              _buildProfileAction(
                icon: Icons.notifications,
                title: 'Notifications',
                subtitle: 'Manage your notification preferences',
                onTap: () => _openNotificationSettings(),
              ),
              _buildProfileAction(
                icon: Icons.help,
                title: 'Help & Support',
                subtitle: 'Get help or contact support',
                onTap: () => _openSupport(),
              ),
              _buildProfileAction(
                icon: Icons.logout,
                title: 'Logout',
                subtitle: 'Sign out of your account',
                onTap: () => _logout(),
                isDestructive: true,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildProfileAction({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.grey200),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isDestructive 
                      ? AppTheme.error.withOpacity(0.1)
                      : AppTheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: isDestructive ? AppTheme.error : AppTheme.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                        color: isDestructive ? AppTheme.error : AppTheme.textPrimary,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        color: AppTheme.grey600,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.chevron_right,
                color: AppTheme.grey400,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(String message, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(icon, size: 64, color: AppTheme.grey400),
          const SizedBox(height: 16),
          Text(
            message,
            style: TextStyle(
              color: AppTheme.grey600,
              fontSize: 16,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  void _showJobDetails(Job job) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.grey300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text(
                      job.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      job.description,
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.grey600,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _buildJobDetailRow('Budget', '\$${job.budget}'),
                    _buildJobDetailRow('Type', job.type),
                    _buildJobDetailRow('Skills', job.skills.join(', ')),
                    _buildJobDetailRow('Deadline', job.deadline.toString().split(' ')[0]),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _applyToJob(job);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: AppTheme.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Apply Now'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildJobDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: AppTheme.grey600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  void _applyToJob(Job job) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Applied to ${job.title}'),
        backgroundColor: AppTheme.success,
      ),
    );
  }

  Widget _buildRecentActivity() {
    return Column(
      children: [
        _buildActivityItem(
          title: 'New job posted',
          subtitle: 'Mobile App Development - Flutter',
          time: '2h ago',
        ),
        _buildActivityItem(
          title: 'Application submitted',
          subtitle: 'Your application was sent successfully',
          time: '1d ago',
        ),
        _buildActivityItem(
          title: 'Profile viewed',
          subtitle: 'Tech Solutions Inc. viewed your profile',
          time: '2d ago',
        ),
      ],
    );
  }

  // Demo data for conversations
  List<Map<String, dynamic>> _getDemoConversations() {
    return [
      {
        'id': '1',
        'name': 'Tech Solutions Inc.',
        'lastMessage': 'Thank you for your application. We would like to discuss the project details.',
        'time': '2h ago',
        'unread': 2,
      },
      {
        'id': '2',
        'name': 'Sarah Johnson',
        'lastMessage': 'When can we schedule a call to discuss the requirements?',
        'time': '1d ago',
        'unread': 0,
      },
      {
        'id': '3',
        'name': 'Digital Marketing Pro',
        'lastMessage': 'Your proposal looks great. Let\'s move forward.',
        'time': '2d ago',
        'unread': 1,
      },
    ];
  }

  // Message dialog methods
  void _showNewMessageDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('New Message'),
        content: const Text('Message composition feature coming soon!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _openConversation(Map<String, dynamic> conversation) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: Text(conversation['name']),
            backgroundColor: AppTheme.primary,
            foregroundColor: AppTheme.white,
          ),
          body: const Center(
            child: Text('Chat interface coming soon!'),
          ),
        ),
      ),
    );
  }

  // Profile action methods
  void _editProfile() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Edit profile feature coming soon!')),
    );
  }

  void _openSecuritySettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Security settings coming soon!')),
    );
  }

  void _openNotificationSettings() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Notification settings coming soon!')),
    );
  }

  void _openSupport() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Support feature coming soon!')),
    );
  }

  void _logout() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              await context.read<AuthProvider>().logout();
              if (mounted) {
                Navigator.of(context).pushReplacementNamed('/login');
              }
            },
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  Widget? _buildFloatingActionButton(String role) {
    if (role == 'client') {
      return FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const JobPostScreen(),
            ),
          );
        },
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        icon: const Icon(Icons.add),
        label: const Text('Post Job'),
      );
    } else {
      return FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Apply to jobs by tapping on them!')),
          );
        },
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        child: const Icon(Icons.work),
      );
    }
  }
}
