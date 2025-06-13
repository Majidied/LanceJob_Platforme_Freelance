import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  final ApiService _api = ApiService();
  
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null && _api.isAuthenticated;

  AuthProvider() {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    if (_api.isAuthenticated) {
      try {
        _user = await _api.getCurrentUser();
        notifyListeners();
      } catch (e) {
        // Token might be invalid or user endpoint not available, clear auth
        await logout();
      }
    }
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _api.login(email, password);
      
      if (response != null && response['user'] != null) {
        _user = User.fromJson(response['user'] as Map<String, dynamic>);
        
        // Save user data locally
        await _saveUserData();
        
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        throw Exception('Invalid response format');
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    required String role,
  }) async {
    _setLoading(true);
    _clearError();

    try {
      final response = await _api.register(
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: role,
      );
      
      if (response != null && response['user'] != null) {
        _user = User.fromJson(response['user'] as Map<String, dynamic>);
        
        // Save user data locally
        await _saveUserData();
        
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        throw Exception('Invalid response format');
      }
    } catch (e) {
      _setError(e.toString());
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _api.logout();
    } catch (e) {
      // Continue with logout even if API call fails
    }
    
    _user = null;
    await _clearUserData();
    notifyListeners();
  }

  Future<bool> updateProfile(Map<String, dynamic> updates) async {
    if (_user == null) return false;
    
    _setLoading(true);
    _clearError();

    try {
      final response = await _api.updateProfile(_user!.id, updates);
      
      if (response != null && response['user'] != null) {
        _user = User.fromJson(response['user'] as Map<String, dynamic>);
        await _saveUserData();
        _setLoading(false);
        notifyListeners();
        return true;
      } else {
        _setError('Update failed');
        _setLoading(false);
        return false;
      }
    } catch (e) {
      _setError('Update failed: $e');
      _setLoading(false);
      return false;
    }
  }

  Future<void> _saveUserData() async {
    if (_user != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_data', _user!.toJson().toString());
    }
  }

  Future<void> _clearUserData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_data');
  }

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
