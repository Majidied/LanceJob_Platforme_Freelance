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

  // Job operations - Using static data for testing
  Future<void> loadJobs() async {
    try {
      _setLoading(true);
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 500));
      
      _jobs = _getStaticJobs();
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
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));
      
      _featuredJobs = _getStaticFeaturedJobs();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load featured jobs: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Static data methods for testing
  List<Job> _getStaticJobs() {
    return [
      Job(
        id: '1',
        title: 'Développement d\'une application mobile Flutter',
        description: 'Nous recherchons un développeur Flutter expérimenté pour créer une application mobile moderne et intuitive. L\'application doit inclure l\'authentification, la géolocalisation, et l\'intégration avec des APIs REST.',
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
        description: 'Conception d\'une interface utilisateur moderne et intuitive pour notre plateforme e-commerce. Besoin d\'expertise en design responsive et en expérience utilisateur.',
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
        description: 'Développement d\'une API robuste et scalable pour notre application web. L\'API doit gérer l\'authentification, les données utilisateur et les transactions.',
        clientId: 'client3',
        clientName: 'StartupTech',
        budget: 12000,
        type: 'fixed',
        skills: ['Node.js', 'Express', 'MongoDB', 'JWT'],
        experienceLevel: 'expert',
        deadline: DateTime.now().add(const Duration(days: 45)),
        createdAt: DateTime.now().subtract(const Duration(hours: 8)),
        isRemote: true,
        applicationsCount: 15,
      ),
      Job(
        id: '4',
        title: 'Intégration système de paiement',
        description: 'Intégration d\'un système de paiement sécurisé dans une application existante. Connaissance des APIs de paiement requise.',
        clientId: 'client4',
        clientName: 'PayTech Solutions',
        budget: 6500,
        type: 'fixed',
        skills: ['Stripe', 'PayPal', 'API Integration', 'Security'],
        experienceLevel: 'intermediate',
        deadline: DateTime.now().add(const Duration(days: 15)),
        createdAt: DateTime.now().subtract(const Duration(hours: 12)),
        isRemote: true,
        isFeatured: true,
        applicationsCount: 6,
      ),
      Job(
        id: '5',
        title: 'Optimisation SEO site web',
        description: 'Optimisation SEO complète d\'un site web corporatif. Analyse des mots-clés, optimisation technique et création de contenu.',
        clientId: 'client5',
        clientName: 'Marketing Pro',
        budget: 3500,
        type: 'hourly',
        skills: ['SEO', 'Google Analytics', 'Content Marketing', 'HTML/CSS'],
        experienceLevel: 'intermediate',
        deadline: DateTime.now().add(const Duration(days: 25)),
        createdAt: DateTime.now().subtract(const Duration(days: 1)),
        isRemote: true,
        applicationsCount: 4,
      ),
    ];
  }

  List<Job> _getStaticFeaturedJobs() {
    final allJobs = _getStaticJobs();
    return allJobs.where((job) => job.isFeatured).toList();
  }

  List<Map<String, dynamic>> _getStaticFreelancers() {
    return [
      {
        '_id': 'freelancer1',
        'firstName': 'Ahmed',
        'lastName': 'Benali',
        'email': 'ahmed.benali@email.com',
        'skills': ['Flutter', 'Dart', 'Firebase', 'API Development'],
        'experience': 'expert',
        'hourlyRate': 45,
        'rating': 4.8,
        'completedProjects': 24,
        'description': 'Développeur mobile expérimenté spécialisé en Flutter avec 5+ années d\'expérience.',
        'location': 'Casablanca, Maroc',
        'profilePicture': null,
        'isAvailable': true,
      },
      {
        '_id': 'freelancer2',
        'firstName': 'Fatima',
        'lastName': 'Zahra',
        'email': 'fatima.zahra@email.com',
        'skills': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping'],
        'experience': 'expert',
        'hourlyRate': 40,
        'rating': 4.9,
        'completedProjects': 32,
        'description': 'Designer UI/UX créative avec expertise en design d\'applications mobiles et web.',
        'location': 'Rabat, Maroc',
        'profilePicture': null,
        'isAvailable': true,
      },
      {
        '_id': 'freelancer3',
        'firstName': 'Youssef',
        'lastName': 'Alami',
        'email': 'youssef.alami@email.com',
        'skills': ['Node.js', 'Express', 'MongoDB', 'React'],
        'experience': 'intermediate',
        'hourlyRate': 35,
        'rating': 4.6,
        'completedProjects': 18,
        'description': 'Développeur full-stack passionné par les technologies web modernes.',
        'location': 'Marrakech, Maroc',
        'profilePicture': null,
        'isAvailable': true,
      },
    ];
  }

  List<Map<String, dynamic>> _getStaticApplications() {
    return [
      {
        '_id': 'app1',
        'jobId': '1',
        'jobTitle': 'Développement d\'une application mobile Flutter',
        'freelancerId': 'current_user_id',
        'status': 'pending',
        'appliedAt': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
        'proposedBudget': 15000,
        'deliveryTime': '30 jours',
        'proposal': 'Je suis très intéressé par ce projet...',
      },
      {
        '_id': 'app2',
        'jobId': '3',
        'jobTitle': 'Développement API Backend Node.js',
        'freelancerId': 'current_user_id',
        'status': 'accepted',
        'appliedAt': DateTime.now().subtract(const Duration(days: 5)).toIso8601String(),
        'proposedBudget': 12000,
        'deliveryTime': '45 jours',
        'proposal': 'Avec mon expérience en Node.js...',
      },
    ];
  }

  List<Map<String, dynamic>> _getStaticConversations() {
    return [
      {
        '_id': 'conv1',
        'participants': ['current_user_id', 'client1'],
        'otherParticipant': {
          'id': 'client1',
          'name': 'TechCorp SA',
          'avatar': null,
        },
        'lastMessage': {
          'content': 'Merci pour votre proposition, pouvons-nous programmer un appel?',
          'timestamp': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
          'senderId': 'client1',
        },
        'unreadCount': 1,
      },
      {
        '_id': 'conv2',
        'participants': ['current_user_id', 'client3'],
        'otherParticipant': {
          'id': 'client3',
          'name': 'StartupTech',
          'avatar': null,
        },
        'lastMessage': {
          'content': 'Le projet a été accepté, félicitations!',
          'timestamp': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
          'senderId': 'client3',
        },
        'unreadCount': 0,
      },
    ];
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

  // Freelancer operations - Using static data for testing
  Future<void> loadFreelancers() async {
    try {
      _setLoading(true);
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 400));
      
      _freelancers = _getStaticFreelancers();
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

  // Application operations - Using static data for testing
  Future<void> loadMyApplications(String freelancerId) async {
    try {
      _setLoading(true);
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 350));
      
      _myApplications = _getStaticApplications();
      notifyListeners();
    } catch (e) {
      _setError('Failed to load applications: $e');
    } finally {
      _setLoading(false);
    }
  }

  // Message operations - Using static data for testing
  Future<void> loadConversations(String userId) async {
    try {
      _setLoading(true);
      // Simulate network delay
      await Future.delayed(const Duration(milliseconds: 300));
      
      _conversations = _getStaticConversations();
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
