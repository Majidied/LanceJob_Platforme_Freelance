// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'job.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Job _$JobFromJson(Map<String, dynamic> json) => Job(
  id: json['id'] as String,
  title: json['title'] as String,
  description: json['description'] as String,
  clientId: json['clientId'] as String,
  clientName: json['clientName'] as String,
  clientAvatar: json['clientAvatar'] as String?,
  budget: (json['budget'] as num).toDouble(),
  currency: json['currency'] as String? ?? 'MAD',
  type: json['type'] as String,
  skills:
      (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  experienceLevel: json['experienceLevel'] as String? ?? 'intermediate',
  deadline: DateTime.parse(json['deadline'] as String),
  createdAt: DateTime.parse(json['createdAt'] as String),
  status:
      $enumDecodeNullable(_$JobStatusEnumMap, json['status']) ?? JobStatus.open,
  location: json['location'] as String?,
  isRemote: json['isRemote'] as bool? ?? false,
  applicationsCount: (json['applicationsCount'] as num?)?.toInt() ?? 0,
  attachments:
      (json['attachments'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList() ??
      const [],
  isFeatured: json['isFeatured'] as bool? ?? false,
  isUrgent: json['isUrgent'] as bool? ?? false,
);

Map<String, dynamic> _$JobToJson(Job instance) => <String, dynamic>{
  'id': instance.id,
  'title': instance.title,
  'description': instance.description,
  'clientId': instance.clientId,
  'clientName': instance.clientName,
  'clientAvatar': instance.clientAvatar,
  'budget': instance.budget,
  'currency': instance.currency,
  'type': instance.type,
  'skills': instance.skills,
  'experienceLevel': instance.experienceLevel,
  'deadline': instance.deadline.toIso8601String(),
  'createdAt': instance.createdAt.toIso8601String(),
  'status': _$JobStatusEnumMap[instance.status]!,
  'location': instance.location,
  'isRemote': instance.isRemote,
  'applicationsCount': instance.applicationsCount,
  'attachments': instance.attachments,
  'isFeatured': instance.isFeatured,
  'isUrgent': instance.isUrgent,
};

const _$JobStatusEnumMap = {
  JobStatus.open: 'open',
  JobStatus.inProgress: 'in_progress',
  JobStatus.completed: 'completed',
  JobStatus.cancelled: 'cancelled',
  JobStatus.closed: 'closed',
};

JobApplication _$JobApplicationFromJson(Map<String, dynamic> json) =>
    JobApplication(
      id: json['id'] as String,
      jobId: json['jobId'] as String,
      freelancerId: json['freelancerId'] as String,
      freelancerName: json['freelancerName'] as String,
      freelancerAvatar: json['freelancerAvatar'] as String?,
      proposedPrice: (json['proposedPrice'] as num).toDouble(),
      currency: json['currency'] as String? ?? 'MAD',
      coverLetter: json['coverLetter'] as String,
      deliveryDate: DateTime.parse(json['deliveryDate'] as String),
      submittedAt: DateTime.parse(json['submittedAt'] as String),
      status:
          $enumDecodeNullable(_$ApplicationStatusEnumMap, json['status']) ??
          ApplicationStatus.pending,
      attachments:
          (json['attachments'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          const [],
    );

Map<String, dynamic> _$JobApplicationToJson(JobApplication instance) =>
    <String, dynamic>{
      'id': instance.id,
      'jobId': instance.jobId,
      'freelancerId': instance.freelancerId,
      'freelancerName': instance.freelancerName,
      'freelancerAvatar': instance.freelancerAvatar,
      'proposedPrice': instance.proposedPrice,
      'currency': instance.currency,
      'coverLetter': instance.coverLetter,
      'deliveryDate': instance.deliveryDate.toIso8601String(),
      'submittedAt': instance.submittedAt.toIso8601String(),
      'status': _$ApplicationStatusEnumMap[instance.status]!,
      'attachments': instance.attachments,
    };

const _$ApplicationStatusEnumMap = {
  ApplicationStatus.pending: 'pending',
  ApplicationStatus.accepted: 'accepted',
  ApplicationStatus.rejected: 'rejected',
  ApplicationStatus.withdrawn: 'withdrawn',
};
