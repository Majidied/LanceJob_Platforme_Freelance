import 'package:json_annotation/json_annotation.dart';

part 'job.g.dart';

@JsonSerializable()
class Job {
  final String id;
  final String title;
  final String description;
  final String clientId;
  final String clientName;
  final String? clientAvatar;
  final double budget;
  final String currency;
  final String type; // 'fixed' or 'hourly'
  final List<String> skills;
  final String experienceLevel; // 'beginner', 'intermediate', 'expert'
  final DateTime deadline;
  final DateTime createdAt;
  final JobStatus status;
  final String? location;
  final bool isRemote;
  final int applicationsCount;
  final List<String> attachments;
  final bool isFeatured;
  final bool isUrgent;

  Job({
    required this.id,
    required this.title,
    required this.description,
    required this.clientId,
    required this.clientName,
    this.clientAvatar,
    required this.budget,
    this.currency = 'MAD',
    required this.type,
    this.skills = const [],
    this.experienceLevel = 'intermediate',
    required this.deadline,
    required this.createdAt,
    this.status = JobStatus.open,
    this.location,
    this.isRemote = false,
    this.applicationsCount = 0,
    this.attachments = const [],
    this.isFeatured = false,
    this.isUrgent = false,
  });

  factory Job.fromJson(Map<String, dynamic> json) => _$JobFromJson(json);
  Map<String, dynamic> toJson() => _$JobToJson(this);

  bool get isNew {
    final difference = DateTime.now().difference(createdAt);
    return difference.inHours < 24;
  }

  String get timeAgo {
    final difference = DateTime.now().difference(createdAt);
    if (difference.inDays > 0) {
      return '${difference.inDays} jour${difference.inDays > 1 ? 's' : ''}';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}min';
    } else {
      return 'À l\'instant';
    }
  }
}

enum JobStatus {
  @JsonValue('open')
  open,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('completed')
  completed,
  @JsonValue('cancelled')
  cancelled,
  @JsonValue('closed')
  closed,
}

@JsonSerializable()
class JobApplication {
  final String id;
  final String jobId;
  final String freelancerId;
  final String freelancerName;
  final String? freelancerAvatar;
  final double proposedPrice;
  final String currency;
  final String coverLetter;
  final DateTime deliveryDate;
  final DateTime submittedAt;
  final ApplicationStatus status;
  final List<String> attachments;

  JobApplication({
    required this.id,
    required this.jobId,
    required this.freelancerId,
    required this.freelancerName,
    this.freelancerAvatar,
    required this.proposedPrice,
    this.currency = 'MAD',
    required this.coverLetter,
    required this.deliveryDate,
    required this.submittedAt,
    this.status = ApplicationStatus.pending,
    this.attachments = const [],
  });

  factory JobApplication.fromJson(Map<String, dynamic> json) => _$JobApplicationFromJson(json);
  Map<String, dynamic> toJson() => _$JobApplicationToJson(this);
}

enum ApplicationStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('accepted')
  accepted,
  @JsonValue('rejected')
  rejected,
  @JsonValue('withdrawn')
  withdrawn,
}
