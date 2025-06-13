import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/job.dart';

class MyPostedJobsScreen extends StatefulWidget {
  const MyPostedJobsScreen({Key? key}) : super(key: key);

  @override
  State<MyPostedJobsScreen> createState() => _MyPostedJobsScreenState();
}

class _MyPostedJobsScreenState extends State<MyPostedJobsScreen> {
  final ApiService _apiService = ApiService();

  List<Map<String, dynamic>> _jobs = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadMyJobs();
  }

  Future<void> _loadMyJobs() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final response = await _apiService.getMyPostedJobs('current_user_id'); // TODO: Get actual client ID
      setState(() {
        _jobs = List<Map<String, dynamic>>.from(response['jobs'] ?? []);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _deleteJob(String jobId) async {
    try {
      await _apiService.deleteJob(jobId);
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Job deleted successfully'),
          backgroundColor: Colors.green,
        ),
      );
      
      _loadMyJobs(); // Refresh jobs list
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error deleting job: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _confirmDeleteJob(Map<String, dynamic> job) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Job'),
        content: Text('Are you sure you want to delete "${job['title']}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _deleteJob(job['_id']);
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _viewApplications(Map<String, dynamic> job) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => JobApplicationsScreen(
          jobId: job['_id'],
          jobTitle: job['title'],
        ),
      ),
    );
  }

  Widget _buildJobCard(Map<String, dynamic> job) {
    final applicationsCount = job['applicationsCount'] ?? 0;
    final status = job['status'] ?? 'active';
    final createdAt = job['createdAt'];
    
    Color statusColor;
    IconData statusIcon;
    
    switch (status.toLowerCase()) {
      case 'completed':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'in_progress':
        statusColor = Colors.blue;
        statusIcon = Icons.work;
        break;
      case 'paused':
        statusColor = Colors.orange;
        statusIcon = Icons.pause_circle;
        break;
      case 'closed':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      default:
        statusColor = Colors.green;
        statusIcon = Icons.radio_button_checked;
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    job['title'] ?? 'Untitled Job',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                PopupMenuButton<String>(
                  onSelected: (value) {
                    switch (value) {
                      case 'applications':
                        _viewApplications(job);
                        break;
                      case 'edit':
                        // TODO: Navigate to edit job screen
                        break;
                      case 'delete':
                        _confirmDeleteJob(job);
                        break;
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'applications',
                      child: Row(
                        children: [
                          Icon(Icons.people),
                          SizedBox(width: 8),
                          Text('View Applications'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit),
                          SizedBox(width: 8),
                          Text('Edit Job'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, color: Colors.red),
                          SizedBox(width: 8),
                          Text('Delete Job', style: TextStyle(color: Colors.red)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: statusColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(statusIcon, size: 16, color: statusColor),
                  const SizedBox(width: 4),
                  Text(
                    status.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            if (job['description'] != null)
              Text(
                job['description'],
                style: TextStyle(color: Colors.grey[700]),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            const SizedBox(height: 12),
            Row(
              children: [
                Icon(Icons.attach_money, size: 18, color: Colors.green[600]),
                Text(
                  '\$${job['budget'] ?? 'Not specified'}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.green[600],
                  ),
                ),
                const Spacer(),
                Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                Text('${job['duration'] ?? 'Not specified'}'),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.people, size: 16, color: Colors.blue[600]),
                Text(
                  '$applicationsCount application${applicationsCount != 1 ? 's' : ''}',
                  style: TextStyle(
                    color: Colors.blue[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const Spacer(),
                if (createdAt != null)
                  Text(
                    'Posted ${_formatDate(createdAt)}',
                    style: TextStyle(
                      color: Colors.grey[500],
                      fontSize: 12,
                    ),
                  ),
              ],
            ),
            if (job['skills'] != null && (job['skills'] as List).isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: (job['skills'] as List)
                    .take(3)
                    .map<Widget>((skill) => Chip(
                          label: Text(
                            skill.toString(),
                            style: const TextStyle(fontSize: 12),
                          ),
                          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ))
                    .toList(),
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => _viewApplications(job),
                    icon: const Icon(Icons.people),
                    label: Text('View Applications ($applicationsCount)'),
                  ),
                ),
                const SizedBox(width: 8),
                if (status == 'active')
                  IconButton(
                    onPressed: () {
                      // TODO: Toggle job status (pause/unpause)
                    },
                    icon: const Icon(Icons.pause),
                    tooltip: 'Pause Job',
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.work_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            const Text(
              'No Posted Jobs',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Your posted jobs will appear here once you start hiring freelancers.',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                // TODO: Navigate to post job screen
              },
              icon: const Icon(Icons.add),
              label: const Text('Post a Job'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[400],
            ),
            const SizedBox(height: 16),
            const Text(
              'Error Loading Jobs',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error ?? 'Unknown error occurred',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadMyJobs,
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'Unknown';
    
    try {
      final DateTime dateTime = date is String ? DateTime.parse(date) : date;
      final now = DateTime.now();
      final difference = now.difference(dateTime);
      
      if (difference.inDays > 0) {
        return '${difference.inDays} day${difference.inDays > 1 ? 's' : ''} ago';
      } else if (difference.inHours > 0) {
        return '${difference.inHours} hour${difference.inHours > 1 ? 's' : ''} ago';
      } else {
        return '${difference.inMinutes} minute${difference.inMinutes > 1 ? 's' : ''} ago';
      }
    } catch (e) {
      return 'Unknown';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Posted Jobs'),
        actions: [
          IconButton(
            onPressed: () {
              // TODO: Navigate to post new job screen
            },
            icon: const Icon(Icons.add),
            tooltip: 'Post New Job',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadMyJobs,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? _buildErrorState()
                : _jobs.isEmpty
                    ? _buildEmptyState()
                    : ListView.builder(
                        itemCount: _jobs.length,
                        itemBuilder: (context, index) {
                          return _buildJobCard(_jobs[index]);
                        },
                      ),
      ),
    );
  }
}

// Job Applications Screen for viewing applications to a specific job
class JobApplicationsScreen extends StatefulWidget {
  final String jobId;
  final String jobTitle;

  const JobApplicationsScreen({
    Key? key,
    required this.jobId,
    required this.jobTitle,
  }) : super(key: key);

  @override
  State<JobApplicationsScreen> createState() => _JobApplicationsScreenState();
}

class _JobApplicationsScreenState extends State<JobApplicationsScreen> {
  final ApiService _apiService = ApiService();

  List<Map<String, dynamic>> _applications = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadApplications();
  }

  Future<void> _loadApplications() async {
    try {
      setState(() {
        _isLoading = true;
        _error = null;
      });

      final response = await _apiService.getJobApplications(widget.jobId);
      setState(() {
        _applications = List<Map<String, dynamic>>.from(response['applications'] ?? []);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _updateApplicationStatus(String applicationId, String status) async {
    try {
      await _apiService.updateApplicationStatus(widget.jobId, applicationId, status); // Fixed parameters
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Application ${status.toLowerCase()} successfully'),
          backgroundColor: Colors.green,
        ),
      );
      
      _loadApplications(); // Refresh applications
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error updating application: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _hireFreelancer(String freelancerId, String applicationId) async {
    try {
      await _apiService.hireFreelancer(widget.jobId, freelancerId, applicationId);
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Freelancer hired successfully!'),
          backgroundColor: Colors.green,
        ),
      );
      
      _loadApplications(); // Refresh applications
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error hiring freelancer: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showApplicationDetails(Map<String, dynamic> application) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      'Application Details',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const Divider(),
              const SizedBox(height: 8),
              Text(
                'Freelancer: ${application['freelancer']?['firstName'] ?? ''} ${application['freelancer']?['lastName'] ?? ''}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text('Proposed Price: \$${application['proposedPrice'] ?? 'Not specified'}'),
              Text('Delivery Time: ${application['deliveryTime'] ?? 'Not specified'} days'),
              const SizedBox(height: 16),
              if (application['coverLetter'] != null) ...[
                const Text(
                  'Cover Letter:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(application['coverLetter']),
                ),
                const SizedBox(height: 16),
              ],
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _updateApplicationStatus(application['_id'], 'rejected');
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Text('Reject'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _hireFreelancer(
                          application['freelancer']['_id'],
                          application['_id'],
                        );
                      },
                      child: const Text('Hire'),
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

  Widget _buildApplicationCard(Map<String, dynamic> application) {
    final freelancer = application['freelancer'] as Map<String, dynamic>?;
    final status = application['status'] ?? 'pending';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: ListTile(
        leading: CircleAvatar(
          child: Text(
            ((freelancer?['firstName'] ?? 'U')[0] + (freelancer?['lastName'] ?? '')[0]).toUpperCase(),
          ),
        ),
        title: Text('${freelancer?['firstName'] ?? 'Unknown'} ${freelancer?['lastName'] ?? ''}'),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Bid: \$${application['proposedPrice'] ?? 'Not specified'}'),
            Text('Delivery: ${application['deliveryTime'] ?? 'Not specified'} days'),
            Text('Status: ${status.toUpperCase()}'),
          ],
        ),
        trailing: status == 'pending'
            ? PopupMenuButton<String>(
                onSelected: (value) {
                  switch (value) {
                    case 'view':
                      _showApplicationDetails(application);
                      break;
                    case 'accept':
                      _updateApplicationStatus(application['_id'], 'accepted');
                      break;
                    case 'reject':
                      _updateApplicationStatus(application['_id'], 'rejected');
                      break;
                    case 'hire':
                      _hireFreelancer(
                        freelancer?['_id'],
                        application['_id'],
                      );
                      break;
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'view',
                    child: Text('View Details'),
                  ),
                  const PopupMenuItem(
                    value: 'accept',
                    child: Text('Accept'),
                  ),
                  const PopupMenuItem(
                    value: 'reject',
                    child: Text('Reject'),
                  ),
                  const PopupMenuItem(
                    value: 'hire',
                    child: Text('Hire Freelancer'),
                  ),
                ],
              )
            : Text(status.toUpperCase()),
        onTap: () => _showApplicationDetails(application),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Applications: ${widget.jobTitle}'),
      ),
      body: RefreshIndicator(
        onRefresh: _loadApplications,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator())
            : _error != null
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Error: $_error'),
                        ElevatedButton(
                          onPressed: _loadApplications,
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  )
                : _applications.isEmpty
                    ? const Center(
                        child: Text('No applications yet'),
                      )
                    : ListView.builder(
                        itemCount: _applications.length,
                        itemBuilder: (context, index) {
                          return _buildApplicationCard(_applications[index]);
                        },
                      ),
      ),
    );
  }
}
