import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_staggered_animations/flutter_staggered_animations.dart';
import 'package:provider/provider.dart';
import '../../theme/app_theme.dart';
import '../../models/job.dart';
import '../../providers/data_provider.dart';
import '../../widgets/job_card.dart';
import '../../widgets/stats_card.dart';
import '../../widgets/quick_actions.dart';
import '../job_application_screen.dart';

class FreelancerHome extends StatefulWidget {
  const FreelancerHome({Key? key}) : super(key: key);

  @override
  State<FreelancerHome> createState() => _FreelancerHomeState();
}

class _FreelancerHomeState extends State<FreelancerHome>
    with TickerProviderStateMixin {
  late TabController _tabController;
  bool _isLoading = false;
  final List<Job> _jobs = [];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadJobs();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadJobs() async {
    setState(() => _isLoading = true);
    
    try {
      final dataProvider = context.read<DataProvider>();
      await dataProvider.loadJobs();
      
      setState(() {
        _jobs.clear();
        _jobs.addAll(dataProvider.jobs.take(10)); // Show first 10 jobs
        _isLoading = false;
      });
    } catch (e) {
      // Fallback to sample data if API fails
      final sampleJobs = _generateSampleJobs();
      setState(() {
        _jobs.clear();
        _jobs.addAll(sampleJobs);
        _isLoading = false;
      });
    }
  }

  List<Job> _generateSampleJobs() {
    return [
      Job(
        id: '1',
        title: 'Développement d\'une application mobile Flutter',
        description: 'Nous recherchons un développeur Flutter expérimenté pour créer une application mobile...',
        clientId: 'client1',
        clientName: 'TechCorp SA',
        budget: 15000,
        type: 'fixed',
        skills: ['Flutter', 'Dart', 'Firebase', 'API REST'],
        experienceLevel: 'expert',
        deadline: DateTime.now().add(const Duration(days: 30)),
        createdAt: DateTime.now().subtract(const Duration(hours: 2)),
        isRemote: true,
        isFeatured: true,
        applicationsCount: 12,
      ),
      Job(
        id: '2',
        title: 'Design UI/UX pour plateforme e-commerce',
        description: 'Conception d\'une interface utilisateur moderne et intuitive pour notre plateforme...',
        clientId: 'client2',
        clientName: 'E-Shop Plus',
        budget: 8000,
        type: 'fixed',
        skills: ['UI/UX Design', 'Figma', 'Adobe XD', 'Prototyping'],
        experienceLevel: 'intermediate',
        deadline: DateTime.now().add(const Duration(days: 20)),
        createdAt: DateTime.now().subtract(const Duration(hours: 5)),
        isRemote: true,
        applicationsCount: 8,
      ),
      Job(
        id: '3',
        title: 'Développement API Backend Node.js',
        description: 'Développement d\'une API robuste et scalable pour notre application web...',
        clientId: 'client3',
        clientName: 'StartupTech',
        budget: 12000,
        type: 'fixed',
        skills: ['Node.js', 'Express', 'MongoDB', 'TypeScript'],
        experienceLevel: 'expert',
        deadline: DateTime.now().add(const Duration(days: 25)),
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        isRemote: true,
        applicationsCount: 15,
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadJobs,
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
            
            // Jobs Section
            _buildJobsSection(),
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
                title: 'Candidatures',
                value: '24',
                subtitle: 'En attente',
                icon: Icons.assignment_outlined,
                color: AppTheme.info,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatsCard(
                title: 'Projets',
                value: '8',
                subtitle: 'Terminés',
                icon: Icons.check_circle_outline,
                color: AppTheme.success,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: StatsCard(
                title: 'Revenus',
                value: '45K',
                subtitle: 'MAD ce mois',
                icon: Icons.trending_up,
                color: AppTheme.warning,
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
                icon: Icons.search,
                label: 'Rechercher des jobs',
                onTap: () {
                  Navigator.of(context).pushNamed('/job-search');
                },
              ),
              QuickAction(
                icon: Icons.favorite_outline,
                label: 'Jobs sauvegardés',
                onTap: () {
                  Navigator.of(context).pushNamed('/saved-jobs');
                },
              ),
              QuickAction(
                icon: Icons.message_outlined,
                label: 'Messages',
                onTap: () {
                  Navigator.of(context).pushNamed('/messages');
                },
              ),
              QuickAction(
                icon: Icons.person_outline,
                label: 'Mon profil',
                onTap: () {
                  Navigator.of(context).pushNamed('/profile');
                },
              ),
            ],
          ),
        ],
      ),
    ).animate()
      .fadeIn(delay: 400.ms, duration: 600.ms)
      .slideY(begin: 0.3, end: 0);
  }

  Widget _buildJobsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Jobs recommandés',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            TextButton(
              onPressed: () {
                // Navigate to all jobs
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
              Tab(text: 'Nouveaux'),
              Tab(text: 'Urgents'),
              Tab(text: 'Bien payés'),
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
        
        // Jobs List
        if (_isLoading)
          _buildLoadingJobs()
        else if (_jobs.isEmpty)
          _buildEmptyJobs()
        else
          _buildJobsList(),
      ],
    ).animate()
      .fadeIn(delay: 600.ms, duration: 600.ms);
  }

  Widget _buildLoadingJobs() {
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
              Container(
                height: 20,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppTheme.grey200,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 12),
              Container(
                height: 14,
                width: 200,
                decoration: BoxDecoration(
                  color: AppTheme.grey200,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 8),
              Container(
                height: 14,
                width: 150,
                decoration: BoxDecoration(
                  color: AppTheme.grey200,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyJobs() {
    return Container(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(
            Icons.work_outline,
            size: 64,
            color: AppTheme.grey400,
          ),
          const SizedBox(height: 16),
          Text(
            'Aucun job disponible',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppTheme.grey600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Revenez plus tard pour découvrir de nouvelles opportunités',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppTheme.grey500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildJobsList() {
    return AnimationLimiter(
      child: Column(
        children: AnimationConfiguration.toStaggeredList(
          duration: const Duration(milliseconds: 600),
          childAnimationBuilder: (widget) => SlideAnimation(
            verticalOffset: 50.0,
            child: FadeInAnimation(child: widget),
          ),
          children: _jobs.map((job) => JobCard(
            job: job,
            onTap: () {
              // Navigate to job details
              _showJobDetails(job);
            },
            onSave: () {
              // Save job
              _saveJob(job);
            },
            onApply: () {
              // Apply to job
              _applyToJob(job);
            },
          )).toList(),
        ),
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
                      'Posted by ${job.clientName}',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      job.description,
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 24),
                    _buildJobDetailRow('Budget', '${job.budget} ${job.currency}'),
                    _buildJobDetailRow('Type', job.type),
                    _buildJobDetailRow('Experience', job.experienceLevel),
                    _buildJobDetailRow('Location', job.location ?? (job.isRemote ? 'Remote' : 'Not specified')),
                    _buildJobDetailRow('Deadline', '${job.deadline.day}/${job.deadline.month}/${job.deadline.year}'),
                    const SizedBox(height: 16),
                    Text(
                      'Skills Required',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: job.skills.map((skill) => Chip(
                        label: Text(skill),
                        backgroundColor: AppTheme.primary.withOpacity(0.1),
                        labelStyle: TextStyle(color: AppTheme.primary),
                      )).toList(),
                    ),
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
                      child: const Text(
                        'Apply to this Job',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
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
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: AppTheme.grey600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
        ],
      ),
    );
  }

  void _saveJob(Job job) {
    // TODO: Implement save job functionality
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Job "${job.title}" saved!'),
        backgroundColor: AppTheme.success,
      ),
    );
  }

  void _applyToJob(Job job) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => JobApplicationScreen(job: job),
      ),
    );
  }
}
