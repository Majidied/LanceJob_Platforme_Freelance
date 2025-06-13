import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../models/job.dart';

class DataProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  bool _isLoading = false;
  String? _error;
  List<Job> _jobs = [];
  List<Job> _featuredJobs = [];
  List<Map<String, dynamic>> _freelancers = [];
  List<Map<String, dynamic>> _myApplications = [];
  List<Map<String, dynamic>> _conversations = [];
  Map<String, dynamic>? _dashboardStats;

  // Getters
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<Job> get jobs => _jobs;
  List<Job> get featuredJobs => _featuredJobs;
  List<Map<String, dynamic>> get freelancers => _freelancers;
  List<Map<String, dynamic>> get myApplications => _myApplications;
  List<Map<String, dynamic>> get conversations => _conversations;
  Map<String, dynamic>? get dashboardStats => _dashboardStats;

  // Services getters  
  ApiService get apiService => _api;

  // Initialize data
  Future<void> initializeData() async {
    _setLoading(true);
    _clearError();

    try {
      // Load initial data from API
      await Future.wait([
        loadJobs(),
        loadFeaturedJobs(), 
        loadFreelancers(),
      ]);
    } catch (e) {
      _setError('Failed to initialize data: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Job operations - Now using actual API calls
  Future<void> loadJobs() async {
    try {
      _setLoading(true);
      final jobsData = await _api.getMissions();
      _jobs = jobsData.map((jobMap) => _mapToJob(jobMap)).toList();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load jobs: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> loadFeaturedJobs() async {
    try {
      _setLoading(true);
      final featuredJobsData = await _api.getFeaturedMissions();
      _featuredJobs = featuredJobsData.map((jobMap) => _mapToJob(jobMap)).toList();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load featured jobs: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Helper method to convert Map to Job object
  Job _mapToJob(Map<String, dynamic> jobMap) {
    return Job(
      id: jobMap['_id']?.toString() ?? jobMap['id']?.toString() ?? '',
      title: jobMap['title']?.toString() ?? 'Untitled Job',
      description: jobMap['description']?.toString() ?? 'No description available',
      budget: (jobMap['budget'] is num) ? (jobMap['budget'] as num).toDouble() : 1000.0,
      clientId: jobMap['clientId']?.toString() ?? jobMap['userId']?.toString() ?? '',
      clientName: jobMap['clientName']?.toString() ?? 'Anonymous Client',
      clientAvatar: jobMap['clientAvatar']?.toString(),
      currency: jobMap['currency']?.toString() ?? 'MAD',
      type: jobMap['type']?.toString() ?? 'fixed',
      skills: (jobMap['skills'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? ['General'],
      experienceLevel: jobMap['experienceLevel']?.toString() ?? jobMap['experience']?.toString() ?? 'intermediate',
      deadline: DateTime.tryParse(jobMap['deadline']?.toString() ?? '') ?? DateTime.now().add(const Duration(days: 30)),
      createdAt: DateTime.tryParse(jobMap['createdAt']?.toString() ?? '') ?? DateTime.now(),
      status: _parseJobStatus(jobMap['status']?.toString() ?? 'open'),
      location: jobMap['location']?.toString(),
      isRemote: jobMap['isRemote'] == true,
      applicationsCount: (jobMap['applicationsCount'] is num) ? (jobMap['applicationsCount'] as num).toInt() : 0,
      attachments: (jobMap['attachments'] as List<dynamic>?)?.map((e) => e.toString()).toList() ?? [],
      isFeatured: jobMap['isFeatured'] == true,
      isUrgent: jobMap['isUrgent'] == true,
    );
  }

  JobStatus _parseJobStatus(String status) {
    switch (status.toLowerCase()) {
      case 'open':
        return JobStatus.open;
      case 'closed':
        return JobStatus.closed;
      case 'in_progress':
        return JobStatus.inProgress;
      case 'completed':
        return JobStatus.completed;
      default:
        return JobStatus.open;
    }
  }

  Future<List<Map<String, dynamic>>> searchJobs(String query) async {
    try {
      return await _api.searchMissions(query);
    } catch (e) {
      _setError('Failed to search jobs: $e');
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getJobsByCategory(String category) async {
    try {
      // For now, return empty list since this endpoint might not exist
      // TODO: Add this endpoint to backend
      return [];
    } catch (e) {
      _setError('Failed to get jobs by category: $e');
      return [];
    }
  }

  Future<Map<String, dynamic>?> getJobDetails(String jobId) async {
    try {
      // For now, return null since this endpoint might not exist
      // TODO: Add this endpoint to backend
      return null;
    } catch (e) {
      _setError('Failed to get job details: $e');
      return null;
    }
  }

  Future<bool> createJob(Map<String, dynamic> jobData) async {
    try {
      // For now, return false since this endpoint might not exist  
      // TODO: Add this endpoint to backend
      return false;
    } catch (e) {
      _setError('Failed to create job: $e');
      return false;
    }
  }

  Future<bool> applyToJob(String jobId, String freelancerId, String proposal, double bidAmount, String deliveryTime) async {
    try {
      // TODO: Replace with actual API call when job endpoints are ready
      // final result = await _api.applyToJob(jobId, freelancerId, proposal, bidAmount, deliveryTime);
      // if (result['success'] == true) {
      //   await loadMyApplications(freelancerId); // Refresh applications
      //   return true;
      // }
      return false; // Placeholder
    } catch (e) {
      _setError('Failed to apply to job: $e');
      return false;
    }
  }

  // Freelancer operations - Now using actual API calls
  Future<void> loadFreelancers() async {
    try {
      _setLoading(true);
      _freelancers = await _api.getAllFreelancers();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load freelancers: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<List<Map<String, dynamic>>> searchFreelancers(String query) async {
    try {
      // For now, return empty list since this endpoint might not exist
      // TODO: Add this endpoint to backend
      return [];
    } catch (e) {
      _setError('Failed to search freelancers: $e');
      return [];
    }
  }

  Future<List<Map<String, dynamic>>> getTopRatedFreelancers({int limit = 10}) async {
    try {
      // For now, return empty list since this endpoint might not exist
      // TODO: Add this endpoint to backend
      return [];
    } catch (e) {
      _setError('Failed to get top rated freelancers: $e');
      return [];
    }
  }

  // Application operations - Placeholder methods for future API integration
  Future<void> loadMyApplications(String freelancerId) async {
    try {
      _setLoading(true);
      // TODO: Replace with actual API call when application endpoints are ready
      // _myApplications = await _api.getMyApplications(freelancerId);
      _myApplications = []; // Placeholder
      notifyListeners();
    } catch (e) {
      _setError('Failed to load applications: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Message operations - Placeholder methods for future API integration
  Future<void> loadConversations(String userId) async {
    try {
      _setLoading(true);
      // TODO: Replace with actual API call when message endpoints are ready
      // _conversations = await _api.getUserConversations(userId);
      _conversations = []; // Placeholder
      notifyListeners();
    } catch (e) {
      _setError('Failed to load conversations: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> sendMessage(String senderId, String receiverId, String content) async {
    try {
      // TODO: Replace with actual API call when message endpoints are ready
      // final result = await _api.sendMessage(senderId, receiverId, content);
      // if (result['success'] == true) {
      //   await loadConversations(senderId); // Refresh conversations
      //   return true;
      // }
      return false; // Placeholder
    } catch (e) {
      _setError('Failed to send message: $e');
      return false;
    }
  }

  Future<List<Map<String, dynamic>>> getConversation(String user1Id, String user2Id) async {
    try {
      // TODO: Replace with actual API call when message endpoints are ready
      // return await _api.getConversation(user1Id, user2Id);
      return []; // Placeholder
    } catch (e) {
      _setError('Failed to get conversation: $e');
      return [];
    }
  }

  // Dashboard operations - Placeholder methods for future API integration
  Future<void> loadDashboardStats(String userId, String role) async {
    try {
      _setLoading(true);
      // TODO: Replace with actual API call when dashboard endpoints are ready
      // _dashboardStats = await _api.getDashboardStats(userId, role);
      _dashboardStats = {}; // Placeholder
      notifyListeners();
    } catch (e) {
      _setError('Failed to load dashboard stats: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Utility methods
  Future<void> resetAllData() async {
    try {
      _jobs.clear();
      _featuredJobs.clear();
      _freelancers.clear();
      _myApplications.clear();
      _conversations.clear();
      _dashboardStats = null;
      notifyListeners();
      await initializeData();
    } catch (e) {
      _setError('Failed to reset data: $e');
    }
  }

  // Filter and sort utilities
  List<Map<String, dynamic>> filterJobsByBudget(List<Map<String, dynamic>> jobs, double minBudget, double maxBudget) {
    return jobs.where((job) {
      final budget = (job['budget'] ?? 0.0) as double;
      return budget >= minBudget && budget <= maxBudget;
    }).toList();
  }

  List<Map<String, dynamic>> filterJobsByDifficulty(List<Map<String, dynamic>> jobs, String difficulty) {
    return jobs.where((job) => job['difficulty'] == difficulty).toList();
  }

  List<Map<String, dynamic>> filterJobsByRemote(List<Map<String, dynamic>> jobs, bool remoteOnly) {
    if (!remoteOnly) return jobs;
    return jobs.where((job) => job['remote'] == true).toList();
  }

  List<Map<String, dynamic>> sortJobsByDate(List<Map<String, dynamic>> jobs, {bool ascending = false}) {
    jobs.sort((a, b) {
      final dateA = DateTime.parse(a['createdAt'] ?? DateTime.now().toIso8601String());
      final dateB = DateTime.parse(b['createdAt'] ?? DateTime.now().toIso8601String());
      return ascending ? dateA.compareTo(dateB) : dateB.compareTo(dateA);
    });
    return jobs;
  }

  List<Map<String, dynamic>> sortJobsByBudget(List<Map<String, dynamic>> jobs, {bool ascending = false}) {
    jobs.sort((a, b) {
      final budgetA = (a['budget'] ?? 0.0) as double;
      final budgetB = (b['budget'] ?? 0.0) as double;
      return ascending ? budgetA.compareTo(budgetB) : budgetB.compareTo(budgetA);
    });
    return jobs;
  }

  List<Map<String, dynamic>> filterFreelancersByRating(List<Map<String, dynamic>> freelancers, double minRating) {
    return freelancers.where((freelancer) {
      final rating = (freelancer['rating'] ?? 0.0) as double;
      return rating >= minRating;
    }).toList();
  }

  List<Map<String, dynamic>> sortFreelancersByRating(List<Map<String, dynamic>> freelancers, {bool ascending = false}) {
    freelancers.sort((a, b) {
      final ratingA = (a['rating'] ?? 0.0) as double;
      final ratingB = (b['rating'] ?? 0.0) as double;
      return ascending ? ratingA.compareTo(ratingB) : ratingB.compareTo(ratingA);
    });
    return freelancers;
  }

  // Private methods
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }
}
