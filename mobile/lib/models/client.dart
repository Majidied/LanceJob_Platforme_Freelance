// models/client.dart
class ProfileModel {
  String name;
  String email;
  String phone;
  String description;
  int rating;
  String status;
  String role;
  String clientId;

  // Constructor
  ProfileModel({
    required this.name,
    required this.email,
    required this.phone,
    required this.description,
    required this.rating,
    required this.status,
    required this.role,
    required this.clientId,
  });

  // Copy constructor method
  static ProfileModel copy(ProfileModel source) {
    return ProfileModel(
      name: source.name,
      email: source.email,
      phone: source.phone,
      description: source.description,
      rating: source.rating,
      status: source.status,
      role: source.role,
      clientId: source.clientId,
    );
  }

  // Factory method to create ProfileModel from JSON
  factory ProfileModel.fromJson(Map<String, dynamic> json) {
    // Handle description field which can be a string or a list
    String descriptionValue = '';
    if (json['description'] is String) {
      descriptionValue = json['description'];
    } else if (json['description'] is List && json['description'].isNotEmpty) {
      descriptionValue = json['description'][0].toString();
    }

    // Handle phone field which can be a string or a list
    String phoneValue = '';
    if (json['phone'] is String) {
      phoneValue = json['phone'];
    } else if (json['phone'] is List && json['phone'].isNotEmpty) {
      phoneValue = json['phone'][0].toString();
    }

    // Handle rating field which can be an int or a list
    int ratingValue = 0;
    if (json['rating'] is int) {
      ratingValue = json['rating'];
    } else if (json['rating'] is List && json['rating'].isNotEmpty) {
      // Try to parse to int if it's a string in the list
      if (json['rating'][0] is int) {
        ratingValue = json['rating'][0];
      } else if (json['rating'][0] is String) {
        ratingValue = int.tryParse(json['rating'][0]) ?? 0;
      }
    }

    return ProfileModel(
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: phoneValue,
      description: descriptionValue,
      rating: ratingValue,
      status: json['status'] ?? '',
      role: json['role'] ?? '',
      clientId: json['_id'] ?? json['id'] ?? '',
    );
  }

  // Convert ProfileModel to JSON
  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'email': email,
      'phone': phone,
      'description': description,
      'rating': rating,
      'status': status,
      'role': role,
      '_id': clientId,
    };
  }
}