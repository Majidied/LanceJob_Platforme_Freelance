// models/freelancer.dart
class Freelancer {
  final String id;
  final String name;
  final String email;
  final String role;
  final List<String> phone;
  final double rating;
  final String bio;
  final List<String> skills;
  final List<String> address;
  final List<String> history;
  final String title;
  final int success;
  final int earned;
  final String avatar;
  final int completedJobs;

  Freelancer({
    required this.id,
    required this.name,
    required this.email,
    this.role = '',
    this.phone = const [],
    this.rating = 0,
    this.bio = '',
    this.skills = const [],
    this.address = const [],
    this.history = const [],
    this.title = '',
    this.success = 0,
    this.earned = 0,
    this.avatar = '',
    this.completedJobs = 0,
  });

  factory Freelancer.fromMap(Map<String, dynamic> map) {
    final data = map['data'] ?? map;
    
    // Handle potential list or single values for these fields
    String extractFirstStringOrEmpty(dynamic field) {
      if (field == null) return '';
      if (field is List && field.isNotEmpty) return field[0].toString();
      return field.toString();
    }

    int extractFirstIntOrZero(dynamic field) {
      if (field == null) return 0;
      if (field is List && field.isNotEmpty) {
        var value = field[0];
        return value is int ? value : int.tryParse(value.toString()) ?? 0;
      }
      if (field is int) return field;
      return int.tryParse(field.toString()) ?? 0;
    }

    double extractRating(dynamic field) {
      if (field == null) return 0.0;
      if (field is List && field.isNotEmpty) {
        var value = field[0];
        return value is double 
            ? value 
            : (value is int 
                ? value.toDouble() 
                : double.tryParse(value.toString()) ?? 0.0);
      }
      if (field is double) return field;
      if (field is int) return field.toDouble();
      return double.tryParse(field.toString()) ?? 0.0;
    }

    List<String> extractStringList(dynamic field) {
      if (field == null) return [];
      if (field is List) {
        return field.map((item) => item.toString()).toList();
      }
      return [field.toString()];
    }

    return Freelancer(
      id: data['_id'] ?? '',
      name: data['name'] ?? '',
      email: data['email'] ?? '',
      role: data['role'] ?? '',
      phone: extractStringList(data['phone']),
      rating: extractRating(data['rating']),
      bio: extractFirstStringOrEmpty(data['bio']),
      skills: data['skills'] != null ? List<String>.from(data['skills']) : [],
      address: extractStringList(data['address']),
      history: extractStringList(data['history']),
      title: extractFirstStringOrEmpty(data['title']),
      success: extractFirstIntOrZero(data['success']),
      earned: extractFirstIntOrZero(data['earned']),
      avatar: data['avatar'] ?? '',
      completedJobs: data['history'] != null 
          ? (data['history'] is List ? data['history'].length : 0) 
          : 0,
    );
  }
}