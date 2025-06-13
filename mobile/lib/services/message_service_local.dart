import '../services/api_service.dart';

class MessageService {
  final ApiService _apiService = ApiService();

  // Message operations using backend API (placeholders for future implementation)
  Future<Map<String, dynamic>?> sendMessage(int senderId, int receiverId, String content) async {
    // TODO: Implement API call to send message
    // For now, return a mock response
    return {
      'id': DateTime.now().millisecondsSinceEpoch,
      'senderId': senderId,
      'receiverId': receiverId,
      'content': content,
      'type': 'text',
      'isRead': false,
      'createdAt': DateTime.now().toIso8601String(),
    };
  }

  Future<List<Map<String, dynamic>>> getConversation(int user1Id, int user2Id) async {
    // TODO: Implement API call to get conversation
    // For now, return sample messages
    return getSampleMessages(user1Id, user2Id);
  }

  // Get all conversations for a user (simplified version)
  Future<List<Map<String, dynamic>>> getUserConversations(int userId) async {
    // This is a simplified implementation
    // In a real app, you'd have a more sophisticated way to get conversations
    
    final sampleConversations = [
      {
        'id': 1,
        'otherUser': {
          'id': 2,
          'firstName': 'Sarah',
          'lastName': 'Johnson',
          'avatar': 'https://images.unsplash.com/photo-1494790108755-2616b9a27a4d?w=150',
          'role': 'freelancer',
        },
        'lastMessage': {
          'content': 'Thanks for considering my proposal. I\'d love to discuss the project further.',
          'timestamp': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
          'isRead': false,
        },
        'unreadCount': 2,
      },
      {
        'id': 2,
        'otherUser': {
          'id': 3,
          'firstName': 'Mike',
          'lastName': 'Wilson',
          'avatar': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
          'role': 'freelancer',
        },
        'lastMessage': {
          'content': 'I can start working on your logo design right away.',
          'timestamp': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
          'isRead': true,
        },
        'unreadCount': 0,
      },
      {
        'id': 3,
        'otherUser': {
          'id': 4,
          'firstName': 'Emma',
          'lastName': 'Davis',
          'avatar': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
          'role': 'freelancer',
        },
        'lastMessage': {
          'content': 'I\'ve completed the first draft of your content. Please review.',
          'timestamp': DateTime.now().subtract(const Duration(days: 2)).toIso8601String(),
          'isRead': true,
        },
        'unreadCount': 0,
      },
    ];

    return sampleConversations;
  }

  // Get unread message count for a user
  Future<int> getUnreadMessageCount(int userId) async {
    // This is a simplified implementation
    final conversations = await getUserConversations(userId);
    int total = 0;
    for (var conv in conversations) {
      total += (conv['unreadCount'] as int);
    }
    return total;
  }

  // Mark messages as read
  Future<bool> markMessagesAsRead(int conversationId) async {
    // In a real implementation, you'd update the database
    // For now, just return true
    return true;
  }

  // Get sample messages for demo purposes
  List<Map<String, dynamic>> getSampleMessages(int user1Id, int user2Id) {
    return [
      {
        'id': 1,
        'senderId': user2Id,
        'receiverId': user1Id,
        'content': 'Hi! I saw your job posting and I\'m very interested in working on this project.',
        'type': 'text',
        'isRead': true,
        'createdAt': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
      },
      {
        'id': 2,
        'senderId': user1Id,
        'receiverId': user2Id,
        'content': 'Great! I\'d love to learn more about your experience with similar projects.',
        'type': 'text',
        'isRead': true,
        'createdAt': DateTime.now().subtract(const Duration(days: 3, hours: 2)).toIso8601String(),
      },
      {
        'id': 3,
        'senderId': user2Id,
        'receiverId': user1Id,
        'content': 'I have over 5 years of experience in mobile app development, specifically with Flutter. I\'ve worked on several e-commerce apps similar to what you\'re looking for.',
        'type': 'text',
        'isRead': true,
        'createdAt': DateTime.now().subtract(const Duration(days: 3, hours: 1)).toIso8601String(),
      },
      {
        'id': 4,
        'senderId': user1Id,
        'receiverId': user2Id,
        'content': 'That sounds perfect! Can you share some examples of your previous work?',
        'type': 'text',
        'isRead': true,
        'createdAt': DateTime.now().subtract(const Duration(days: 2, hours: 22)).toIso8601String(),
      },
      {
        'id': 5,
        'senderId': user2Id,
        'receiverId': user1Id,
        'content': 'Absolutely! I\'ll send you my portfolio link. You can check out the ShopEasy app I developed last year.',
        'type': 'text',
        'isRead': true,
        'createdAt': DateTime.now().subtract(const Duration(days: 2, hours: 20)).toIso8601String(),
      },
      {
        'id': 6,
        'senderId': user2Id,
        'receiverId': user1Id,
        'content': 'Thanks for considering my proposal. I\'d love to discuss the project timeline and requirements in more detail.',
        'type': 'text',
        'isRead': false,
        'createdAt': DateTime.now().subtract(const Duration(hours: 2)).toIso8601String(),
      },
    ];
  }

  // Message types
  List<String> getMessageTypes() {
    return ['text', 'file', 'image', 'link'];
  }
}
