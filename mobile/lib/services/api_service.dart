import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../models/job.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';
  late final Dio _dio;
  String? _token;

  // Singleton pattern
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  static ApiService get instance => _instance;

  ApiService._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        if (_token != null) {
          options.headers['Authorization'] = 'Bearer $_token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          _handleUnauthorized();
        }
        handler.next(error);
      },
    ));

    _loadToken();
  }

  Future<void> _loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('auth_token');
  }

  Future<void> _saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    _token = token;
  }

  Future<void> _clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    _token = null;
  }

  void _handleUnauthorized() {
    _clearToken();
    // Navigate to login screen
  }

  Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
        case DioExceptionType.sendTimeout:
          return Exception('Connection timeout. Please try again.');
        case DioExceptionType.connectionError:
          return Exception('No internet connection. Please check your network.');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = error.response?.data?['message'] ?? 'Unknown error occurred';
          return Exception('Server error ($statusCode): $message');
        default:
          return Exception('Network error: ${error.message}');
      }
    }
    return Exception('Unexpected error: $error');
  }

  dynamic _handleResponse(Response response) {
    if (response.statusCode != null && response.statusCode! >= 200 && response.statusCode! < 300) {
      return response.data;
    }
    throw Exception('HTTP ${response.statusCode}: ${response.statusMessage}');
  }

  // Auth methods
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      if (response.data['token'] != null) {
        await _saveToken(response.data['token']);
      }

      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String role,
  }) async {
    try {
      final response = await _dio.post('/auth/register', data: {
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'password': password,
        'role': role,
      });

      if (response.data['token'] != null) {
        await _saveToken(response.data['token']);
      }

      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (e) {
      // Continue with logout even if API call fails
    } finally {
      await _clearToken();
    }
  }

  // User methods
  Future<User> getCurrentUser() async {
    try {
      final response = await _dio.get('/user/profile');
      
      // Check if response.data exists and has user data
      if (response.data != null) {
        // Handle different response formats
        if (response.data is Map<String, dynamic>) {
          final data = response.data as Map<String, dynamic>;
          if (data.containsKey('user') && data['user'] != null) {
            return User.fromJson(data['user'] as Map<String, dynamic>);
          } else if (data.containsKey('id')) {
            // Direct user object
            return User.fromJson(data);
          }
        }
      }
      
      throw Exception('Invalid user data format');
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateProfile(String userId, Map<String, dynamic> updates) async {
    try {
      final response = await _dio.put('/user/profile/$userId', data: updates);
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<User>> getFreelancers({
    String? search,
    List<String>? skills,
    String? location,
    double? minRating,
    double? maxHourlyRate,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (search != null) queryParams['search'] = search;
      if (skills != null && skills.isNotEmpty) queryParams['skills'] = skills.join(',');
      if (location != null) queryParams['location'] = location;
      if (minRating != null) queryParams['minRating'] = minRating;
      if (maxHourlyRate != null) queryParams['maxHourlyRate'] = maxHourlyRate;

      final response = await _dio.get('/users/freelancers', queryParameters: queryParams);
      
      final List<dynamic> data = response.data['freelancers'] ?? [];
      return data.map((json) => User.fromJson(json)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> getFreelancerById(String id) async {
    try {
      final response = await _dio.get('/users/freelancer/$id');
      return User.fromJson(response.data['freelancer']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Job methods
  Future<List<Job>> getJobs({
    String? search,
    List<String>? skills,
    String? type,
    double? minBudget,
    double? maxBudget,
    String? experienceLevel,
    bool? isRemote,
    int page = 1,
    int limit = 10,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };

      if (search != null) queryParams['search'] = search;
      if (skills != null && skills.isNotEmpty) queryParams['skills'] = skills.join(',');
      if (type != null) queryParams['type'] = type;
      if (minBudget != null) queryParams['minBudget'] = minBudget;
      if (maxBudget != null) queryParams['maxBudget'] = maxBudget;
      if (experienceLevel != null) queryParams['experienceLevel'] = experienceLevel;
      if (isRemote != null) queryParams['isRemote'] = isRemote;

      final response = await _dio.get('/jobs', queryParameters: queryParams);
      
      final List<dynamic> data = response.data['jobs'] ?? [];
      return data.map((json) => Job.fromJson(json)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Job> getJobById(String id) async {
    try {
      final response = await _dio.get('/missions/$id');
      return Job.fromJson(response.data['mission']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<JobApplication>> getMyApplications() async {
    try {
      final response = await _dio.get('/applications/my');
      final List<dynamic> data = response.data['applications'] ?? [];
      return data.map((json) => JobApplication.fromJson(json)).toList();
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<JobApplication> submitApplication({
    required String jobId,
    required double proposedPrice,
    required String coverLetter,
    required DateTime deliveryDate,
    String currency = 'MAD',
    List<String>? attachments,
  }) async {
    try {
      final response = await _dio.post('/applications', data: {
        'jobId': jobId,
        'proposedPrice': proposedPrice,
        'coverLetter': coverLetter,
        'deliveryDate': deliveryDate.toIso8601String(),
        'currency': currency,
        'attachments': attachments ?? [],
      });

      return JobApplication.fromJson(response.data['application']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Mission/Job methods for DataProvider (simplified API)
  Future<List<Map<String, dynamic>>> getMissions() async {
    try {
      final response = await _dio.get('/mission');
      return List<Map<String, dynamic>>.from(response.data['missions'] ?? []);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getFeaturedMissions() async {
    try {
      final response = await _dio.get('/mission/featured');
      return List<Map<String, dynamic>>.from(response.data['missions'] ?? []);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> searchMissions(String query) async {
    try {
      final response = await _dio.get('/mission/search', queryParameters: {
        'q': query,
      });
      return List<Map<String, dynamic>>.from(response.data['missions'] ?? []);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getAllFreelancers() async {
    try {
      final response = await _dio.get('/freelancer');
      return List<Map<String, dynamic>>.from(response.data['freelancers'] ?? []);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Saved Jobs Management
  Future<Map<String, dynamic>> getSavedJobs(String freelancerId) async {
    try {
      final response = await _dio.get('/freelancer/$freelancerId/saved-jobs');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> toggleSaveJob(String freelancerId, String missionId) async {
    try {
      final response = await _dio.post('/freelancer/save-job', data: {
        'freelancerId': freelancerId,
        'missionId': missionId,
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Job Applications
  Future<Map<String, dynamic>> applyForJob(String freelancerId, String missionId, Map<String, dynamic> proposal) async {
    try {
      final response = await _dio.post('/freelancer/apply', data: {
        'freelancerId': freelancerId,
        'missionId': missionId,
        'proposal': proposal,
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getApplications(String freelancerId) async {
    try {
      final response = await _dio.get('/freelancer/$freelancerId/applications');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getOffers(String freelancerId) async {
    try {
      final response = await _dio.get('/freelancer/$freelancerId/offers');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> respondToOffer(String freelancerId, String offerId, String status) async {
    try {
      final response = await _dio.post('/freelancer/respond-offer', data: {
        'freelancerId': freelancerId,
        'offerId': offerId,
        'status': status,
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Client Features
  Future<Map<String, dynamic>> getMyPostedJobs(String clientId) async {
    try {
      final response = await _dio.get('/client/$clientId/missions');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getJobApplications(String missionId) async {
    try {
      final response = await _dio.get('/mission/$missionId/applications');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> hireFreelancer(String missionId, String freelancerId, String applicationId) async {
    try {
      final response = await _dio.post('/mission/$missionId/hire', data: {
        'freelancerId': freelancerId,
        'applicationId': applicationId,
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateApplicationStatus(String missionId, String applicationId, String status) async {
    try {
      final response = await _dio.patch('/mission/$missionId/application/$applicationId', data: {
        'status': status,
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Job Management
  Future<Map<String, dynamic>> updateJob(String jobId, Map<String, dynamic> jobData) async {
    try {
      final response = await _dio.put('/mission/$jobId', data: jobData);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> deleteJob(String jobId) async {
    try {
      final response = await _dio.delete('/mission/$jobId');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Enhanced Search
  Future<Map<String, dynamic>> searchJobsAdvanced({
    String? query,
    double? minBudget,
    double? maxBudget,
    String? experienceLevel,
    String? jobType,
    List<String>? skills,
    bool? isRemote,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      
      if (query != null && query.isNotEmpty) queryParams['q'] = query;
      if (minBudget != null) queryParams['minBudget'] = minBudget;
      if (maxBudget != null) queryParams['maxBudget'] = maxBudget;
      if (experienceLevel != null) queryParams['experience'] = experienceLevel;
      if (jobType != null) queryParams['type'] = jobType;
      if (skills != null && skills.isNotEmpty) queryParams['skills'] = skills.join(',');
      if (isRemote != null) queryParams['remote'] = isRemote;
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;

      final response = await _dio.get('/mission/search', queryParameters: queryParams);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> searchFreelancers({
    String? query,
    List<String>? skills,
    double? minRating,
    String? experienceLevel,
    int? page,
    int? limit,
  }) async {
    try {
      final queryParams = <String, dynamic>{};
      
      if (query != null && query.isNotEmpty) queryParams['q'] = query;
      if (skills != null && skills.isNotEmpty) queryParams['skills'] = skills.join(',');
      if (minRating != null) queryParams['minRating'] = minRating;
      if (experienceLevel != null) queryParams['experience'] = experienceLevel;
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;

      final response = await _dio.get('/freelancer/search', queryParameters: queryParams);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Recommendations
  Future<Map<String, dynamic>> getRecommendations(String freelancerId, {int? limit, double? minConfidence}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (limit != null) queryParams['limit'] = limit;
      if (minConfidence != null) queryParams['min_confidence'] = minConfidence;

      final response = await _dio.get('/recommendations/$freelancerId', queryParameters: queryParams);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> trackInteraction(String freelancerId, String missionId, String interactionType, {Map<String, dynamic>? metadata}) async {
    try {
      final response = await _dio.post('/recommendations/interactions', data: {
        'freelancer_id': freelancerId,
        'mission_id': missionId,
        'interaction_type': interactionType,
        'metadata': metadata ?? {},
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Messages
  Future<Map<String, dynamic>> getConversations(String userId) async {
    try {
      final response = await _dio.get('/messages/conversations/$userId');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getMessages(String conversationId, {int? page, int? limit}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;

      final response = await _dio.get('/messages/conversation/$conversationId', queryParameters: queryParams);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> sendMessage(String conversationId, String content, {String? type, List<String>? attachments}) async {
    try {
      final response = await _dio.post('/messages/send', data: {
        'conversationId': conversationId,
        'content': content,
        'type': type ?? 'text',
        'attachments': attachments ?? [],
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> createConversation(String participant1Id, String participant2Id, {String? projectId}) async {
    try {
      final response = await _dio.post('/messages/conversations', data: {
        'participant1': participant1Id,
        'participant2': participant2Id,
        'projectId': projectId,
      });
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // File Upload
  Future<Map<String, dynamic>> uploadFile(String filePath, String type) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'file': await MultipartFile.fromFile(filePath, filename: fileName),
        'type': type,
      });

      final response = await _dio.post('/upload', data: formData);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> uploadProfileImage(String userId, String filePath) async {
    try {
      final fileName = filePath.split('/').last;
      final formData = FormData.fromMap({
        'profileImage': await MultipartFile.fromFile(filePath, filename: fileName),
        'userId': userId,
      });

      final response = await _dio.post('/upload/profile-image', data: formData);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Statistics and Analytics
  Future<Map<String, dynamic>> getUserStats(String userId) async {
    try {
      final response = await _dio.get('/users/$userId/stats');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getFreelancerAnalytics(String freelancerId) async {
    try {
      final response = await _dio.get('/recommendations/analytics/$freelancerId');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Notifications
  Future<Map<String, dynamic>> getNotifications(String userId, {int? page, int? limit}) async {
    try {
      final queryParams = <String, dynamic>{};
      if (page != null) queryParams['page'] = page;
      if (limit != null) queryParams['limit'] = limit;

      final response = await _dio.get('/notifications/$userId', queryParameters: queryParams);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> markNotificationAsRead(String notificationId) async {
    try {
      final response = await _dio.patch('/notifications/$notificationId/read');
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> updateNotificationSettings(String userId, Map<String, dynamic> settings) async {
    try {
      final response = await _dio.put('/notifications/$userId/settings', data: settings);
      return _handleResponse(response);
    } catch (e) {
      throw _handleError(e);
    }
  }

    // Getters
  bool get isAuthenticated => _token != null;
  String? get token => _token;
  Dio get dio => _dio;

  // Convenience static methods for backward compatibility
  static Future<dynamic> get(String path) async {
    try {
      final response = await _instance._dio.get(path);
      return response.data;
    } catch (e) {
      throw _instance._handleError(e);
    }
  }

  static Future<dynamic> post(String path, {dynamic data}) async {
    try {
      final response = await _instance._dio.post(path, data: data);
      return response.data;
    } catch (e) {
      throw _instance._handleError(e);
    }
  }

  static Future<dynamic> put(String path, {dynamic data}) async {
    try {
      final response = await _instance._dio.put(path, data: data);
      return response.data;
    } catch (e) {
      throw _instance._handleError(e);
    }
  }

  static Future<dynamic> delete(String path) async {
    try {
      final response = await _instance._dio.delete(path);
      return response.data;
    } catch (e) {
      throw _instance._handleError(e);
    }
  }
}
