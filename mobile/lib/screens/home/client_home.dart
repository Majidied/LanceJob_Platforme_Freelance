import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../models/user.dart';
import '../../providers/data_provider.dart';
import '../../widgets/freelancer_card.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/quick_actions.dart';

class ClientHome extends StatefulWidget {
  const ClientHome({super.key});

  @override
  State<ClientHome> createState() => _ClientHomeState();
}

class _ClientHomeState extends State<ClientHome>
    with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  final List<User> _freelancers = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadFreelancers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadFreelancers() async {
    setState(() => _isLoading = true);
    
    try {
      final dataProvider = context.read<DataProvider>();
      await dataProvider.loadFreelancers();
      
      // Convert Map data to User objects
      final freelancerMaps = dataProvider.freelancers.take(10).toList();
      final freelancerUsers = freelancerMaps.map((map) {
        try {
          return User.fromJson(map);
        } catch (e) {
          // If conversion fails, return a placeholder
          return User(
            id: map['id'] ?? 'unknown',
            name: map['name'] ?? 'Unknown User',
            email: map['email'] ?? 'unknown@email.com',
            role: 'freelancer',
          );
        }
      }).toList();
      
      setState(() {
        _freelancers.clear();
        _freelancers.addAll(freelancerUsers);
        _isLoading = false;
      });
    } catch (e) {
      // Fallback to sample data if API fails
      final sampleFreelancers = _generateSampleFreelancers();
      setState(() {
        _freelancers.clear();
        _freelancers.addAll(sampleFreelancers);
        _isLoading = false;
      });
    }
  }

  List<User> _generateSampleFreelancers() {
    return [
      User(
        id: '1',
        name: 'Ahmed Benali',
        email: 'ahmed.benali@email.com',
        role: 'freelancer',
        title: 'Développeur Flutter Senior',
        bio: 'Développeur mobile passionné avec 5 ans d\'expérience en Flutter et React Native.',
        location: 'Casablanca, Maroc',
        skills: ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'GraphQL'],
        languages: ['Français', 'Arabe', 'Anglais'],
        rating: 4.9,
        reviewCount: 47,
        hourlyRate: 250,
        currency: 'MAD',
        isOnline: true,
        stats: UserStats(
          totalJobs: 52,
          completedJobs: 48,
          totalEarned: 125000,
          successRate: 96.2,
        ),
      ),
      User(
        id: '2',
        name: 'Fatima Zahra',
        email: 'fatima.zahra@email.com',
        role: 'freelancer',
        title: 'UI/UX Designer',
        bio: 'Designer créative spécialisée dans l\'expérience utilisateur mobile et web.',
        location: 'Rabat, Maroc',
        skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
        languages: ['Français', 'Arabe', 'Anglais'],
        rating: 4.8,
        reviewCount: 35,
        hourlyRate: 200,
        currency: 'MAD',
        isOnline: false,
        lastSeen: DateTime.now().subtract(const Duration(hours: 2)),
        stats: UserStats(
          totalJobs: 38,
          completedJobs: 36,
          totalEarned: 89000,
          successRate: 94.7,
        ),
      ),
      User(
        id: '3',
        name: 'Youssef Alami',
        email: 'youssef.alami@email.com',
        role: 'freelancer',
        title: 'Développeur Full Stack',
        bio: 'Expert en développement web full stack avec une solide expérience en Node.js et React.',
        location: 'Marrakech, Maroc',
        skills: ['Node.js', 'React', 'TypeScript', 'MongoDB', 'AWS'],
        languages: ['Français', 'Arabe', 'Anglais'],
        rating: 4.7,
        reviewCount: 28,
        hourlyRate: 300,
        currency: 'MAD',
        isOnline: true,
        stats: UserStats(
          totalJobs: 31,
          completedJobs: 29,
          totalEarned: 95000,
          successRate: 93.5,
        ),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadFreelancers,
      color: AppTheme.primary,
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Stats Cards
            _buildStatsSection(),
            
            const SizedBox(height: 24),
            
            // Quick Actions
            _buildQuickActions(),
            
            const SizedBox(height: 24),
            
            // Freelancers Section
            _buildFreelancersSection(),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsSection() {
    return AnimationLimiter(
      child: Row(
        children: AnimationConfiguration.toStaggeredList(
          duration: const Duration(milliseconds: 600),
          childAnimationBuilder: (widget) => SlideAnimation(
            horizontalOffset: 50.0,
            child: FadeInAnimation(child: widget),
          ),
          children: [
            Expanded(
              child: StatsCard(
                title: 'Jobs actifs',
                value: '12',
                subtitle: 'En cours',
                icon: Icons.work_outline,
                color: AppTheme.info,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatsCard(
                title: 'Candidatures',
                value: '47',
                subtitle: 'Reçues',
                icon: Icons.people_outline,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatsCard(
                title: 'Budget',
                value: '85K',
                subtitle: 'MAD utilisé',
                icon: Icons.account_balance_wallet,
                color: AppTheme.success,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Actions rapides',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          QuickActions(
            actions: [
              QuickAction(
                icon: Icons.add,
                label: 'Publier un job',
                onTap: () {},
              ),
              QuickAction(
                icon: Icons.search,
                label: 'Chercher des talents',
                onTap: () {},
              ),
              QuickAction(
                icon: Icons.message_outlined,
                label: 'Messages',
                onTap: () {},
              ),
              QuickAction(
                icon: Icons.analytics_outlined,
                label: 'Rapports',
                onTap: () {},
              ),
            ],
          ),
        ],
      ),
    ).animate()
      .fadeIn(delay: 400.ms, duration: 600.ms)
      .slideY(begin: 0.3, end: 0);
  }

  Widget _buildFreelancersSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Talents recommandés',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {
                // Navigate to all freelancers
              },
              child: const Text('Voir tout'),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // Tabs
        Container(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(25),
            border: Border.all(
              color: AppTheme.grey200,
              width: 1,
            ),
          ),
          child: TabBar(
            controller: _tabController,
            tabs: const [
              Tab(text: 'Recommandés'),
              Tab(text: 'Top rated'),
              Tab(text: 'Nouveaux'),
              Tab(text: 'En ligne'),
            ],
            indicator: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(25),
            ),
            indicatorSize: TabBarIndicatorSize.tab,
            indicatorPadding: const EdgeInsets.all(4),
            labelColor: AppTheme.white,
            unselectedLabelColor: AppTheme.textSecondary,
            labelStyle: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
            unselectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.normal,
              fontSize: 12,
            ),
          ),
        ),
        
        const SizedBox(height: 20),
        
        // Freelancers List
        if (_isLoading)
          _buildLoadingFreelancers()
        else if (_freelancers.isEmpty)
          _buildEmptyFreelancers()
        else
          _buildFreelancersList(),
      ],
    ).animate()
      .fadeIn(delay: 600.ms, duration: 600.ms);
  }

  Widget _buildLoadingFreelancers() {
    return Column(
      children: List.generate(
        3,
        (index) => Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: AppTheme.grey200,
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          height: 16,
                          width: 150,
                          decoration: BoxDecoration(
                            color: AppTheme.grey200,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          height: 12,
                          width: 100,
                          decoration: BoxDecoration(
                            color: AppTheme.grey200,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                      ],
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

  Widget _buildEmptyFreelancers() {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(
            Icons.people_outline,
            size: 64,
            color: AppTheme.grey400,
          ),
          const SizedBox(height: 16),
          Text(
            'Aucun freelancer disponible',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppTheme.grey600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Revenez plus tard pour découvrir de nouveaux talents',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppTheme.grey500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildFreelancersList() {
    return AnimationLimiter(
      child: Column(
        children: AnimationConfiguration.toStaggeredList(
          duration: const Duration(milliseconds: 600),
          childAnimationBuilder: (widget) => SlideAnimation(
            verticalOffset: 50.0,
            child: FadeInAnimation(child: widget),
          ),
          children: _freelancers.map((freelancer) => FreelancerCard(
            freelancer: freelancer,
            onTap: () {
              // Navigate to freelancer details
            },
            onMessage: () {
              // Send message
            },
            onHire: () {
              // Hire freelancer
            },
          )).toList(),
        ),
      ),
    );
  }
}
