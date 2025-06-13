import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/job.dart';
import '../../widgets/job_card.dart';

class MyApplicationsScreen extends StatefulWidget {
  const MyApplicationsScreen({Key? key}) : super(key: key);

  @override
  State<MyApplicationsScreen> createState() => _MyApplicationsScreenState();
}

class _MyApplicationsScreenState extends State<MyApplicationsScreen>
    with TickerProviderStateMixin {
  late TabController _tabController;
  final ApiService _apiService = ApiService();

  List<Map<String, dynamic>> _applications = [];
  List<Map<String, dynamic>> _offers = [];
  bool _isLoadingApplications = true;
  bool _isLoadingOffers = true;
  String? _errorApplications;
  String? _errorOffers;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadApplications();
    _loadOffers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadApplications() async {
    try {
      setState(() {
        _isLoadingApplications = true;
        _errorApplications = null;
      });

      final response = await _apiService.getApplications('current_user_id'); // TODO: Get actual user ID
      setState(() {
        _applications = List<Map<String, dynamic>>.from(response['applications'] ?? []);
        _isLoadingApplications = false;
      });
    } catch (e) {
      setState(() {
        _errorApplications = e.toString();
        _isLoadingApplications = false;
      });
    }
  }

  Future<void> _loadOffers() async {
    try {
      setState(() {
        _isLoadingOffers = true;
        _errorOffers = null;
      });

      final response = await _apiService.getOffers('current_user_id'); // TODO: Get actual user ID
      setState(() {
        _offers = List<Map<String, dynamic>>.from(response['offers'] ?? []);
        _isLoadingOffers = false;
      });
    } catch (e) {
      setState(() {
        _errorOffers = e.toString();
        _isLoadingOffers = false;
      });
    }
  }

  Future<void> _respondToOffer(String offerId, String response, {String? message}) async {
    try {
      await _apiService.respondToOffer('current_user_id', offerId, response); // Fixed parameters
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Offer ${response == 'accepted' ? 'accepted' : 'declined'} successfully'),
          backgroundColor: response == 'accepted' ? Colors.green : Colors.orange,
        ),
      );
      
      _loadOffers(); // Refresh offers
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error responding to offer: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showOfferResponseDialog(Map<String, dynamic> offer) {
    final TextEditingController messageController = TextEditingController();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Respond to Offer'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Job: ${offer['mission']?['title'] ?? 'Unknown'}'),
            const SizedBox(height: 8),
            Text('Budget: \$${offer['budget'] ?? 'Not specified'}'),
            const SizedBox(height: 16),
            TextField(
              controller: messageController,
              decoration: const InputDecoration(
                labelText: 'Response message (optional)',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _respondToOffer(offer['_id'], 'declined', message: messageController.text);
            },
            child: const Text('Decline', style: TextStyle(color: Colors.red)),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _respondToOffer(offer['_id'], 'accepted', message: messageController.text);
            },
            child: const Text('Accept'),
          ),
        ],
      ),
    );
  }

  Widget _buildApplicationCard(Map<String, dynamic> application) {
    final mission = application['mission'] as Map<String, dynamic>?;
    final status = application['status'] as String? ?? 'pending';
    
    Color statusColor;
    IconData statusIcon;
    
    switch (status.toLowerCase()) {
      case 'accepted':
        statusColor = Colors.green;
        statusIcon = Icons.check_circle;
        break;
      case 'rejected':
        statusColor = Colors.red;
        statusIcon = Icons.cancel;
        break;
      case 'under_review':
        statusColor = Colors.orange;
        statusIcon = Icons.hourglass_empty;
        break;
      default:
        statusColor = Colors.blue;
        statusIcon = Icons.pending;
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
                    mission?['title'] ?? 'Unknown Job',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
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
              ],
            ),
            const SizedBox(height: 8),
            if (mission?['description'] != null)
              Text(
                mission!['description'],
                style: TextStyle(color: Colors.grey[600]),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.attach_money, size: 16, color: Colors.grey[600]),
                Text('Bid: \$${application['proposedPrice'] ?? 'Not specified'}'),
                const Spacer(),
                Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                Text('${application['deliveryTime'] ?? 'Not specified'} days'),
              ],
            ),
            if (application['coverLetter'] != null) ...[
              const SizedBox(height: 8),
              const Divider(),
              const Text(
                'Cover Letter:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                application['coverLetter'],
                style: TextStyle(color: Colors.grey[700]),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 8),
            Text(
              'Applied: ${_formatDate(application['createdAt'])}',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOfferCard(Map<String, dynamic> offer) {
    final mission = offer['mission'] as Map<String, dynamic>?;
    final status = offer['status'] as String? ?? 'pending';
    final isExpired = _isOfferExpired(offer['expiresAt']);

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
                    mission?['title'] ?? 'Unknown Job',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                if (isExpired)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'EXPIRED',
                      style: TextStyle(
                        color: Colors.red,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Icon(Icons.attach_money, size: 20, color: Colors.green[600]),
                Text(
                  '\$${offer['budget'] ?? 'Not specified'}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.green[600],
                  ),
                ),
                const Spacer(),
                Icon(Icons.schedule, size: 16, color: Colors.grey[600]),
                Text('${offer['deliveryTime'] ?? 'Not specified'} days'),
              ],
            ),
            if (offer['message'] != null) ...[
              const SizedBox(height: 8),
              const Divider(),
              const Text(
                'Client Message:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(
                offer['message'],
                style: TextStyle(color: Colors.grey[700]),
              ),
            ],
            const SizedBox(height: 12),
            if (status == 'pending' && !isExpired) ...[
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _respondToOffer(offer['_id'], 'declined'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.red,
                        side: const BorderSide(color: Colors.red),
                      ),
                      child: const Text('Decline'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => _showOfferResponseDialog(offer),
                      child: const Text('Review Offer'),
                    ),
                  ),
                ],
              ),
            ] else ...[
              Text(
                'Status: ${status.toUpperCase()}',
                style: TextStyle(
                  color: status == 'accepted' ? Colors.green : Colors.grey,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
            const SizedBox(height: 8),
            Text(
              'Received: ${_formatDate(offer['createdAt'])}',
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
              ),
            ),
            if (offer['expiresAt'] != null)
              Text(
                'Expires: ${_formatDate(offer['expiresAt'])}',
                style: TextStyle(
                  color: isExpired ? Colors.red : Colors.grey[500],
                  fontSize: 12,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle, IconData icon) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
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
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              subtitle,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String error, VoidCallback onRetry) {
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
              'Error Loading Data',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: onRetry,
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

  bool _isOfferExpired(dynamic expiresAt) {
    if (expiresAt == null) return false;
    
    try {
      final DateTime expiry = expiresAt is String ? DateTime.parse(expiresAt) : expiresAt;
      return DateTime.now().isAfter(expiry);
    } catch (e) {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Applications'),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(
              text: 'Applications',
              icon: Badge(
                isLabelVisible: _applications.isNotEmpty,
                label: Text('${_applications.length}'),
                child: const Icon(Icons.work_outline),
              ),
            ),
            Tab(
              text: 'Offers',
              icon: Badge(
                isLabelVisible: _offers.isNotEmpty,
                label: Text('${_offers.length}'),
                child: const Icon(Icons.local_offer),
              ),
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // Applications Tab
          RefreshIndicator(
            onRefresh: _loadApplications,
            child: _isLoadingApplications
                ? const Center(child: CircularProgressIndicator())
                : _errorApplications != null
                    ? _buildErrorState(_errorApplications!, _loadApplications)
                    : _applications.isEmpty
                        ? _buildEmptyState(
                            'No Applications Yet',
                            'Your job applications will appear here once you start applying to jobs.',
                            Icons.work_outline,
                          )
                        : ListView.builder(
                            itemCount: _applications.length,
                            itemBuilder: (context, index) {
                              return _buildApplicationCard(_applications[index]);
                            },
                          ),
          ),
          // Offers Tab
          RefreshIndicator(
            onRefresh: _loadOffers,
            child: _isLoadingOffers
                ? const Center(child: CircularProgressIndicator())
                : _errorOffers != null
                    ? _buildErrorState(_errorOffers!, _loadOffers)
                    : _offers.isEmpty
                        ? _buildEmptyState(
                            'No Offers Yet',
                            'Job offers from clients will appear here when they invite you to work on their projects.',
                            Icons.local_offer,
                          )
                        : ListView.builder(
                            itemCount: _offers.length,
                            itemBuilder: (context, index) {
                              return _buildOfferCard(_offers[index]);
                            },
                          ),
          ),
        ],
      ),
    );
  }
}
