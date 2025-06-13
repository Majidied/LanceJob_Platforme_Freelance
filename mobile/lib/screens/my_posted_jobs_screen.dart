import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../theme/app_theme.dart';
import 'package:provider/provider.dart';

enum JobStatus { active, completed, cancelled }

class PostedJob {
  final String id;
  final String title;
  final String description;
  final double budget;
  final String type;
  final String experienceLevel;
  final List<String> skills;
  final JobStatus status;
  final DateTime createdAt;
  final int applicationsCount;
  final bool isHired;

  PostedJob({
    required this.id,
    required this.title,
    required this.description,
    required this.budget,
    required this.type,
    required this.experienceLevel,
    required this.skills,
    required this.status,
    required this.createdAt,
    required this.applicationsCount,
    required this.isHired,
  });

  factory PostedJob.fromJson(Map<String, dynamic> json) {
    return PostedJob(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      budget: (json['budget'] ?? 0).toDouble(),
      type: _parseJobType(json['type']),
      experienceLevel: _parseExperienceLevel(json['experienceLevel']),
      skills: List<String>.from(json['skills'] ?? []),
      status: _parseJobStatus(json['status']),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      applicationsCount: json['applicationsCount'] ?? 0,
      isHired: json['isHired'] ?? false,
    );
  }

  static String _parseJobType(String? type) {
    return type ?? 'project';
  }

  static String _parseExperienceLevel(String? level) {
    return level ?? 'intermediate';
  }

  static JobStatus _parseJobStatus(String? status) {
    switch (status?.toLowerCase()) {
      case 'completed':
        return JobStatus.completed;
      case 'cancelled':
        return JobStatus.cancelled;
      default:
        return JobStatus.active;
    }
  }
}

class JobApplicant {
  final String id;
  final User freelancer;
  final String coverLetter;
  final double proposedPrice;
  final int deliveryTime;
  final DateTime appliedAt;
  final String status;

  JobApplicant({
    required this.id,
    required this.freelancer,
    required this.coverLetter,
    required this.proposedPrice,
    required this.deliveryTime,
    required this.appliedAt,
    required this.status,
  });

  factory JobApplicant.fromJson(Map<String, dynamic> json) {
    return JobApplicant(
      id: json['id'] ?? '',
      freelancer: User.fromJson(json['freelancer'] ?? {}),
      coverLetter: json['coverLetter'] ?? '',
      proposedPrice: (json['proposedPrice'] ?? 0).toDouble(),
      deliveryTime: json['deliveryTime'] ?? 0,
      appliedAt: DateTime.parse(json['appliedAt'] ?? DateTime.now().toIso8601String()),
      status: json['status'] ?? 'pending',
    );
  }
}

class MyPostedJobsScreen extends StatefulWidget {
  const MyPostedJobsScreen({Key? key}) : super(key: key);

  @override
  State<MyPostedJobsScreen> createState() => _MyPostedJobsScreenState();
}

class _MyPostedJobsScreenState extends State<MyPostedJobsScreen> {
  final ApiService _apiService = ApiService();
  List<PostedJob> _postedJobs = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPostedJobs();
  }

  Future<void> _loadPostedJobs() async {
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

      final response = await _apiService.getMyPostedJobs(user.id);
      
      if (response['success'] == true) {
        final jobsData = response['data'] as List<dynamic>;
        _postedJobs = jobsData.map((jobData) => PostedJob.fromJson(jobData)).toList();
      } else {
        throw Exception(response['message'] ?? 'Failed to load posted jobs');
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _viewApplications(PostedJob job) async {
    try {
      final response = await _apiService.getJobApplications(job.id);
      
      if (response['success'] == true) {
        final applicantsData = response['data'] as List<dynamic>;
        final applicants = applicantsData.map((data) => JobApplicant.fromJson(data)).toList();
        
        if (mounted) {
          _showApplicationsBottomSheet(job, applicants);
        }
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading applications: ${e.toString()}'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  void _showApplicationsBottomSheet(PostedJob job, List<JobApplicant> applicants) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) => _buildApplicationsSheet(
          job, 
          applicants, 
          scrollController,
        ),
      ),
    );
  }

  Widget _buildApplicationsSheet(PostedJob job, List<JobApplicant> applicants, ScrollController scrollController) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle bar
          Center(
            child: Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          
          // Header
          Text(
            'Applications for "${job.title}"',
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${applicants.length} applications received',
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: 14,
            ),
          ),
          const SizedBox(height: 16),
          
          // Applications list
          Expanded(
            child: applicants.isEmpty 
              ? _buildNoApplicationsState()
              : ListView.builder(
                  controller: scrollController,
                  itemCount: applicants.length,
                  itemBuilder: (context, index) {
                    final applicant = applicants[index];
                    return _buildApplicantCard(job, applicant);
                  },
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildApplicantCard(PostedJob job, JobApplicant applicant) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Freelancer info
            Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppTheme.primary,
                  child: Text(
                    '${applicant.freelancer.name[0]}',
                    style: const TextStyle(
                      color: AppTheme.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        applicant.freelancer.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        applicant.freelancer.email,
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getStatusColor(applicant.status).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _getStatusColor(applicant.status)),
                  ),
                  child: Text(
                    applicant.status.toUpperCase(),
                    style: TextStyle(
                      color: _getStatusColor(applicant.status),
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
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
              child: Row(
                children: [
                  Expanded(
                    child: _buildDetailItem('Proposed Price', '\$${applicant.proposedPrice.toStringAsFixed(0)}'),
                  ),
                  Expanded(
                    child: _buildDetailItem('Delivery', '${applicant.deliveryTime} days'),
                  ),
                  Expanded(
                    child: _buildDetailItem('Applied', _formatDate(applicant.appliedAt)),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Cover letter
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
              applicant.coverLetter,
              style: TextStyle(
                color: Colors.grey[600],
                height: 1.4,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            
            const SizedBox(height: 12),
            
            // Action buttons
            if (applicant.status == 'pending')
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _updateApplicationStatus(job.id, applicant.id, 'rejected'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppTheme.error,
                        side: const BorderSide(color: AppTheme.error),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Reject'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _hireFreelancer(job.id, applicant.id),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.success,
                        foregroundColor: AppTheme.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('Hire'),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }

  Future<void> _updateApplicationStatus(String jobId, String applicationId, String status) async {
    try {
      final response = await _apiService.updateApplicationStatus(jobId, applicationId, status);
      
      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Application ${status}'),
            backgroundColor: status == 'rejected' ? AppTheme.error : AppTheme.success,
          ),
        );
        Navigator.pop(context); // Close bottom sheet
        _loadPostedJobs(); // Refresh data
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

  Future<void> _hireFreelancer(String jobId, String applicationId) async {
    try {
      final response = await _apiService.hireFreelancer(jobId, 'freelancerId', applicationId);
      
      if (response['success'] == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Freelancer hired successfully!'),
            backgroundColor: AppTheme.success,
          ),
        );
        Navigator.pop(context); // Close bottom sheet
        _loadPostedJobs(); // Refresh data
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

  Color _getStatusColor(String status) {
    switch (status.toLowerCase()) {
      case 'accepted':
      case 'hired':
        return AppTheme.success;
      case 'rejected':
        return AppTheme.error;
      default:
        return AppTheme.warning;
    }
  }

  Widget _buildNoApplicationsState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.inbox_outlined,
            size: 48,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'No applications yet',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Applications will appear here when freelancers apply to this job.',
            style: TextStyle(color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('My Posted Jobs'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadPostedJobs,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadPostedJobs,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primary),
      );
    }

    if (_error != null) {
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
              'Error loading jobs',
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
              onPressed: _loadPostedJobs,
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

    if (_postedJobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.work_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No posted jobs',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Jobs you post will appear here.\nStart posting to find talented freelancers!',
              style: TextStyle(color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                // Navigate to post job screen
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.white,
              ),
              child: const Text('Post a Job'),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _postedJobs.length,
      itemBuilder: (context, index) {
        final job = _postedJobs[index];
        return _buildJobCard(job);
      },
    );
  }

  Widget _buildJobCard(PostedJob job) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with title and status
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    job.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                _buildJobStatusBadge(job.status, job.isHired),
              ],
            ),
            
            const SizedBox(height: 8),
            
            // Description
            Text(
              job.description,
              style: TextStyle(
                color: Colors.grey[600],
                height: 1.4,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            
            const SizedBox(height: 12),
            
            // Skills
            if (job.skills.isNotEmpty)
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: job.skills.take(4).map((skill) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppTheme.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      skill,
                      style: const TextStyle(
                        color: AppTheme.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                }).toList(),
              ),
            
            const SizedBox(height: 12),
            
            // Job details
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.backgroundLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _buildDetailItem('Budget', '\$${job.budget.toStringAsFixed(0)}'),
                  ),
                  Expanded(
                    child: _buildDetailItem('Type', job.type),
                  ),
                  Expanded(
                    child: _buildDetailItem('Experience', job.experienceLevel),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Applications and actions
            Row(
              children: [
                // Applications count
                Expanded(
                  child: Row(
                    children: [
                      Icon(
                        Icons.people_outline,
                        size: 16,
                        color: Colors.grey[600],
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '${job.applicationsCount} applications',
                        style: TextStyle(
                          color: Colors.grey[600],
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'Posted ${_formatDate(job.createdAt)}',
                        style: TextStyle(
                          color: Colors.grey[500],
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // View applications button
                if (job.applicationsCount > 0)
                  ElevatedButton(
                    onPressed: () => _viewApplications(job),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: AppTheme.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text('View Applications'),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildJobStatusBadge(JobStatus status, bool isHired) {
    Color color;
    String text;
    
    if (isHired) {
      color = AppTheme.success;
      text = 'HIRED';
    } else {
      switch (status) {
        case JobStatus.active:
          color = AppTheme.success;
          text = 'ACTIVE';
          break;
        case JobStatus.completed:
          color = AppTheme.primary;
          text = 'COMPLETED';
          break;
        case JobStatus.cancelled:
          color = AppTheme.error;
          text = 'CANCELLED';
          break;
      }
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
