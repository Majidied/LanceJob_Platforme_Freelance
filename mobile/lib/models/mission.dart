// models/mission.dart
class Mission {
  final String id;
  final String title;
  final String description;
  final dynamic budget; // Peut être int ou String
  final String deadline;
  final List<String> tags;
  final String client;
  final String status;
  final String type;
  final String experience;
  final List<Attachment> attachments;
  final List<Application> applications;
  final String? assignedTo;
  final String timestamps;

  Mission({
    required this.id,
    required this.title,
    required this.description,
    required this.budget,
    required this.deadline,
    required this.tags,
    required this.client,
    required this.status,
    required this.type,
    required this.experience,
    required this.attachments,
    required this.applications,
    this.assignedTo,
    required this.timestamps,
  });

  // Conversion d'un objet Map en objet Mission
  factory Mission.fromMap(Map<String, dynamic> map) {
    // Transformation des applications en objets Application
    List<Application> applicationsList = [];
    if (map['applications'] != null) {
      applicationsList = List<Application>.from(
        (map['applications'] as List).map(
          (item) => Application.fromMap(item),
        ),
      );
    }

    // Transformation des pièces jointes en objets Attachment
    List<Attachment> attachmentsList = [];
    if (map['attachments'] != null) {
      attachmentsList = List<Attachment>.from(
        (map['attachments'] as List).map(
          (item) => Attachment.fromMap(item),
        ),
      );
    }

    return Mission(
      id: map['_id'] ?? '',
      title: map['title'] ?? '',
      description: map['description'] ?? '',
      budget: map['budget'] ?? 0, // Accepte à la fois int et String
      deadline: map['deadline'] ?? '',
      tags: List<String>.from(map['tags'] ?? []),
      client: map['client'] ?? '',
      status: map['status'] ?? 'published',
      type: map['type'] ?? '',
      experience: map['experience'] ?? '',
      attachments: attachmentsList,
      applications: applicationsList,
      assignedTo: map['assignedTo'],
      timestamps: map['createdAt'] ?? '',
    );
  }

  // Getter pour obtenir le budget formaté en tant que chaîne
  String getBudgetString() {
    if (budget is int) {
      return '$budget €';
    } else if (budget is double) {
      return '${budget.toStringAsFixed(2)} €';
    } else {
      return budget.toString();
    }
  }
}

class Application {
  final String freelancerId;
  final String applicationDate;
  final String status;
  final String message;
  final dynamic proposedPrice; // Peut être int ou String
  final String proposedDuration;
  final String id;

  Application({
    required this.freelancerId,
    required this.applicationDate,
    required this.status,
    required this.message,
    required this.proposedPrice,
    required this.proposedDuration,
    required this.id,
  });

  factory Application.fromMap(Map<String, dynamic> map) {
    return Application(
      freelancerId: map['freelancer'] ?? '',
      applicationDate: map['applicationDate'] ?? '',
      status: map['status'] ?? 'pending',
      message: map['message'] ?? '',
      proposedPrice: map['proposedPrice'] ?? 0, // Accepte int ou String
      proposedDuration: map['proposedDuration'] ?? '',
      id: map['_id'] ?? '',
    );
  }

  // Getter pour obtenir le prix proposé formaté en tant que chaîne
  String getProposedPriceString() {
    if (proposedPrice is int) {
      return '$proposedPrice €';
    } else if (proposedPrice is double) {
      return '${proposedPrice.toStringAsFixed(2)} €';
    } else {
      return proposedPrice.toString();
    }
  }
}

class Attachment {
  final String fileName;
  final String filePath;
  final String id;
  final String uploadDate;

  Attachment({
    required this.fileName,
    required this.filePath,
    required this.id,
    required this.uploadDate,
  });

  factory Attachment.fromMap(Map<String, dynamic> map) {
    return Attachment(
      fileName: map['fileName'] ?? '',
      filePath: map['filePath'] ?? '',
      id: map['_id'] ?? '',
      uploadDate: map['uploadDate'] ?? '',
    );
  }
}