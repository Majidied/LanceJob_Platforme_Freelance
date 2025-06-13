// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) => User(
  id: json['id'] as String,
  name: json['name'] as String,
  email: json['email'] as String,
  phone: json['phone'] as String?,
  avatar: json['avatar'] as String?,
  role: json['role'] as String,
  title: json['title'] as String?,
  bio: json['bio'] as String?,
  location: json['location'] as String?,
  country: json['country'] as String?,
  skills:
      (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  languages:
      (json['languages'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  rating: (json['rating'] as num?)?.toDouble(),
  reviewCount: (json['reviewCount'] as num?)?.toInt(),
  hourlyRate: (json['hourlyRate'] as num?)?.toDouble(),
  currency: json['currency'] as String?,
  isOnline: json['isOnline'] as bool? ?? false,
  lastSeen:
      json['lastSeen'] == null
          ? null
          : DateTime.parse(json['lastSeen'] as String),
  education:
      (json['education'] as List<dynamic>?)
          ?.map((e) => Education.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  experience:
      (json['experience'] as List<dynamic>?)
          ?.map((e) => Experience.fromJson(e as Map<String, dynamic>))
          .toList() ??
      const [],
  stats:
      json['stats'] == null
          ? null
          : UserStats.fromJson(json['stats'] as Map<String, dynamic>),
);

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
  'id': instance.id,
  'name': instance.name,
  'email': instance.email,
  'phone': instance.phone,
  'avatar': instance.avatar,
  'role': instance.role,
  'title': instance.title,
  'bio': instance.bio,
  'location': instance.location,
  'country': instance.country,
  'skills': instance.skills,
  'languages': instance.languages,
  'rating': instance.rating,
  'reviewCount': instance.reviewCount,
  'hourlyRate': instance.hourlyRate,
  'currency': instance.currency,
  'isOnline': instance.isOnline,
  'lastSeen': instance.lastSeen?.toIso8601String(),
  'education': instance.education,
  'experience': instance.experience,
  'stats': instance.stats,
};

Education _$EducationFromJson(Map<String, dynamic> json) => Education(
  school: json['school'] as String,
  degree: json['degree'] as String,
  field: json['field'] as String?,
  from: json['from'] as String?,
  to: json['to'] as String?,
  description: json['description'] as String?,
);

Map<String, dynamic> _$EducationToJson(Education instance) => <String, dynamic>{
  'school': instance.school,
  'degree': instance.degree,
  'field': instance.field,
  'from': instance.from,
  'to': instance.to,
  'description': instance.description,
};

Experience _$ExperienceFromJson(Map<String, dynamic> json) => Experience(
  title: json['title'] as String,
  company: json['company'] as String,
  location: json['location'] as String?,
  from: json['from'] as String?,
  to: json['to'] as String?,
  description: json['description'] as String?,
  isCurrent: json['isCurrent'] as bool? ?? false,
);

Map<String, dynamic> _$ExperienceToJson(Experience instance) =>
    <String, dynamic>{
      'title': instance.title,
      'company': instance.company,
      'location': instance.location,
      'from': instance.from,
      'to': instance.to,
      'description': instance.description,
      'isCurrent': instance.isCurrent,
    };

UserStats _$UserStatsFromJson(Map<String, dynamic> json) => UserStats(
  totalJobs: (json['totalJobs'] as num?)?.toInt() ?? 0,
  completedJobs: (json['completedJobs'] as num?)?.toInt() ?? 0,
  activeApplications: (json['activeApplications'] as num?)?.toInt() ?? 0,
  totalEarned: (json['totalEarned'] as num?)?.toDouble() ?? 0.0,
  successRate: (json['successRate'] as num?)?.toDouble() ?? 0.0,
);

Map<String, dynamic> _$UserStatsToJson(UserStats instance) => <String, dynamic>{
  'totalJobs': instance.totalJobs,
  'completedJobs': instance.completedJobs,
  'activeApplications': instance.activeApplications,
  'totalEarned': instance.totalEarned,
  'successRate': instance.successRate,
};
