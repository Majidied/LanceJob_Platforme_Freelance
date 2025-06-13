import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../models/job.dart';
import '../theme/app_theme.dart';
import 'package:provider/provider.dart';

enum ApplicationStatus { pending, accepted, rejected, completed }

class JobApplication {
  final String id;
  final Job job;
  final String coverLetter;
  final double proposedPrice;
  final int deliveryTime;
  final ApplicationStatus status;
  final DateTime appliedAt;
  final String? clientFeedback;

  JobApplication({
    required this.id,
    required this.job,
    required this.coverLetter,
    required this.proposedPrice,
    required this.deliveryTime,
    required this.status,
    required this.appliedAt,
    this.clientFeedback,
  });

  factory JobApplication.fromJson(Map<String, dynamic> json) {
    return JobApplication(
      id: json['id'] ?? '',
      job: Job.fromJson(json['job'] ?? {}),
      coverLetter: json['coverLetter'] ?? '',
      proposedPrice: (json['proposedPrice'] ?? 0).toDouble(),
      deliveryTime: json['deliveryTime'] ?? 0,
      status: _parseStatus(json['status']),
      appliedAt: DateTime.parse(json['appliedAt'] ?? DateTime.now().toIso8601String()),
      clientFeedback: json['clientFeedback'],
    );
  }

  static ApplicationStatus _parseStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'accepted':
        return ApplicationStatus.accepted;
      case 'rejected':
        return ApplicationStatus.rejected;
      case 'completed':
        return ApplicationStatus.completed;
      default:
        return ApplicationStatus.pending;
    }
  }
}

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({Key? key}) : super(key: key);

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  
  List<JobApplication> _applications = [];
  List<dynamic> _offers = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Load applications
      final applicationsResponse = await _apiService.getApplications(user.id);
      if (applicationsResponse['success'] == true) {
        final applicationsData = applicationsResponse['data'] as List<dynamic>;
        _applications = applicationsData.map((data) => JobApplication.fromJson(data)).toList();
      }

      // Load offers
      final offersResponse = await _apiService.getOffers(user.id);
      if (offersResponse['success'] == true) {
        _offers = offersResponse['data'] as List<dynamic>;
      }

    } catch (e) {
      _error = e.toString();
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _respondToOffer(String offerId, bool accept) async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null) return;

      final response = await _apiService.respondToOffer(
        user.id, 
        offerId, 
        accept ? 'accepted' : 'rejected'
      );
      
      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(accept ? 'Offer accepted!' : 'Offer declined'),
            backgroundColor: accept ? AppTheme.success : AppTheme.warning,
          ),
        );
        _loadData(); // Refresh data
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('My Applications'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadData,
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.white,
          unselectedLabelColor: AppTheme.white.withOpacity(0.7),
          indicatorColor: AppTheme.white,
          tabs: const [
            Tab(text: 'Applications'),
            Tab(text: 'Offers'),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadData,
        child: TabBarView(
          controller: _tabController,
          children: [
            _buildApplicationsTab(),
            _buildOffersTab(),
          ],
        ),
      ),
    );
  }

  Widget _buildApplicationsTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primary),
      );
    }

    if (_error != null) {
      return _buildErrorState();
    }

    if (_applications.isEmpty) {
      return _buildEmptyState(
        icon: Icons.assignment_outlined,
        title: 'No Applications Yet',
        subtitle: 'Applications you submit will appear here.\nStart applying to jobs to build your portfolio!',
        buttonText: 'Browse Jobs',
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _applications.length,
      itemBuilder: (context, index) {
        final application = _applications[index];
        return _buildApplicationCard(application);
      },
    );
  }

  Widget _buildOffersTab() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primary),
      );
    }

    if (_error != null) {
      return _buildErrorState();
    }

    if (_offers.isEmpty) {
      return _buildEmptyState(
        icon: Icons.handshake_outlined,
        title: 'No Offers Yet',
        subtitle: 'Job offers from clients will appear here.\nKeep applying to receive offers!',
        buttonText: 'View Applications',
        onButtonPressed: () => _tabController.animateTo(0),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _offers.length,
      itemBuilder: (context, index) {
        final offer = _offers[index];
        return _buildOfferCard(offer);
      },
    );
  }

  Widget _buildApplicationCard(JobApplication application) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status badge and job title
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    application.job.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                _buildStatusBadge(application.status),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Application details
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.backgroundLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildDetailItem('Proposed Price', '\$${application.proposedPrice.toStringAsFixed(0)}'),
                      ),
                      Expanded(
                        child: _buildDetailItem('Delivery', '${application.deliveryTime} days'),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: _buildDetailItem('Applied', _formatDate(application.appliedAt)),
                      ),
                      Expanded(
                        child: _buildDetailItem('Budget', '\$${application.job.budget.toStringAsFixed(0)}'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Cover letter preview
            Text(
              'Cover Letter:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 4),
            Text(
              application.coverLetter,
              style: TextStyle(
                color: Colors.grey[600],
                height: 1.4,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            
            // Client feedback if rejected
            if (application.status == ApplicationStatus.rejected && application.clientFeedback != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppTheme.error.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.error.withOpacity(0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Client Feedback:',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.error,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      application.clientFeedback!,
                      style: TextStyle(
                        color: Colors.grey[700],
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildOfferCard(Map<String, dynamic> offer) {
    final status = offer['status'] ?? 'pending';
    final isPending = status == 'pending';
    
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Offer details
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    offer['jobTitle'] ?? 'Job Offer',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: isPending ? AppTheme.warning.withOpacity(0.1) : AppTheme.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isPending ? AppTheme.warning : AppTheme.success,
                    ),
                  ),
                  child: Text(
                    status.toUpperCase(),
                    style: TextStyle(
                      color: isPending ? AppTheme.warning : AppTheme.success,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Offer details
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.success.withOpacity(0.05),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppTheme.success.withOpacity(0.2)),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: _buildDetailItem('Offered Price', '\$${offer['offeredPrice']?.toStringAsFixed(0) ?? '0'}'),
                      ),
                      Expanded(
                        child: _buildDetailItem('Deadline', '${offer['deadline'] ?? 'Not specified'}'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Message from client
            if (offer['message'] != null) ...[
              Text(
                'Message from Client:',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
              const SizedBox(height: 4),
              Text(
                offer['message'],
                style: TextStyle(
                  color: Colors.grey[600],
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 12),
            ],
            
            // Action buttons for pending offers
            if (isPending)
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _respondToOffer(offer['id'], false),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.error,
                        side: const BorderSide(color: AppTheme.error),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Decline'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _respondToOffer(offer['id'], true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.success,
                        foregroundColor: AppTheme.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Accept'),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(ApplicationStatus status) {
    Color color;
    String text;
    
    switch (status) {
      case ApplicationStatus.pending:
        color = AppTheme.warning;
        text = 'PENDING';
        break;
      case ApplicationStatus.accepted:
        color = AppTheme.success;
        text = 'ACCEPTED';
        break;
      case ApplicationStatus.rejected:
        color = AppTheme.error;
        text = 'REJECTED';
        break;
      case ApplicationStatus.completed:
        color = AppTheme.primary;
        text = 'COMPLETED';
        break;
    }
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            color: Colors.grey[500],
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            color: AppTheme.textPrimary,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyState({
    required IconData icon,
    required String title,
    required String subtitle,
    required String buttonText,
    VoidCallback? onButtonPressed,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            title,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            subtitle,
            style: TextStyle(color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: onButtonPressed ?? () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.white,
            ),
            child: Text(buttonText),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Error loading data',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _error!,
            style: TextStyle(color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadData,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.white,
            ),
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hours ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minutes ago';
    } else {
      return 'just now';
    }
  }
}
