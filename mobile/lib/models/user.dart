import 'package:json_annotation/json_annotation.dart';

part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String name;
  final String email;
  final String? phone;
  final String? avatar;
  final String role; // 'freelancer' or 'client'
  final String? title;
  final String? bio;
  final String? location;
  final String? country;
  final List<String> skills;
  final List<String> languages;
  final double? rating;
  final int? reviewCount;
  final double? hourlyRate;
  final String? currency;
  final bool isOnline;
  final DateTime? lastSeen;
  final List<Education> education;
  final List<Experience> experience;
  final UserStats stats;

  User({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    this.avatar,
    required this.role,
    this.title,
    this.bio,
    this.location,
    this.country,
    this.skills = const [],
    this.languages = const [],
    this.rating,
    this.reviewCount,
    this.hourlyRate,
    this.currency,
    this.isOnline = false,
    this.lastSeen,
    this.education = const [],
    this.experience = const [],
    UserStats? stats,
  }) : stats = stats ?? UserStats();

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

@JsonSerializable()
class Education {
  final String school;
  final String degree;
  final String? field;
  final String? from;
  final String? to;
  final String? description;

  Education({
    required this.school,
    required this.degree,
    this.field,
    this.from,
    this.to,
    this.description,
  });

  factory Education.fromJson(Map<String, dynamic> json) => _$EducationFromJson(json);
  Map<String, dynamic> toJson() => _$EducationToJson(this);
}

@JsonSerializable()
class Experience {
  final String title;
  final String company;
  final String? location;
  final String? from;
  final String? to;
  final String? description;
  final bool isCurrent;

  Experience({
    required this.title,
    required this.company,
    this.location,
    this.from,
    this.to,
    this.description,
    this.isCurrent = false,
  });

  factory Experience.fromJson(Map<String, dynamic> json) => _$ExperienceFromJson(json);
  Map<String, dynamic> toJson() => _$ExperienceToJson(this);
}

@JsonSerializable()
class UserStats {
  final int totalJobs;
  final int completedJobs;
  final int activeApplications;
  final double totalEarned;
  final double successRate;

  UserStats({
    this.totalJobs = 0,
    this.completedJobs = 0,
    this.activeApplications = 0,
    this.totalEarned = 0.0,
    this.successRate = 0.0,
  });

  factory UserStats.fromJson(Map<String, dynamic> json) => _$UserStatsFromJson(json);
  Map<String, dynamic> toJson() => _$UserStatsToJson(this);
}
