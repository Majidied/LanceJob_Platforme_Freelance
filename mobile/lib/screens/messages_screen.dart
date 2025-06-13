import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../models/user.dart';
import '../theme/app_theme.dart';
import 'package:provider/provider.dart';

class Conversation {
  final String id;
  final User otherUser;
  final String lastMessage;
  final DateTime lastMessageTime;
  final bool isRead;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.otherUser,
    required this.lastMessage,
    required this.lastMessageTime,
    required this.isRead,
    required this.unreadCount,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    return Conversation(
      id: json['id'] ?? '',
      otherUser: User.fromJson(json['otherUser'] ?? {}),
      lastMessage: json['lastMessage'] ?? '',
      lastMessageTime: DateTime.parse(json['lastMessageTime'] ?? DateTime.now().toIso8601String()),
      isRead: json['isRead'] ?? false,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}

class Message {
  final String id;
  final String content;
  final User sender;
  final DateTime sentAt;
  final bool isRead;
  final String? type;
  final List<String> attachments;

  Message({
    required this.id,
    required this.content,
    required this.sender,
    required this.sentAt,
    required this.isRead,
    this.type,
    required this.attachments,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] ?? '',
      content: json['content'] ?? '',
      sender: User.fromJson(json['sender'] ?? {}),
      sentAt: DateTime.parse(json['sentAt'] ?? DateTime.now().toIso8601String()),
      isRead: json['isRead'] ?? false,
      type: json['type'],
      attachments: List<String>.from(json['attachments'] ?? []),
    );
  }
}

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({Key? key}) : super(key: key);

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final ApiService _apiService = ApiService();
  List<Conversation> _conversations = [];
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadConversations();
  }

  Future<void> _loadConversations() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null) {
        throw Exception('User not authenticated');
      }

      final response = await _apiService.getConversations(user.id);
      
      if (response['success'] == true) {
        final conversationsData = response['data'] as List<dynamic>;
        _conversations = conversationsData.map((data) => Conversation.fromJson(data)).toList();
      } else {
        throw Exception(response['message'] ?? 'Failed to load conversations');
      }
    } catch (e) {
      _error = e.toString();
      // For demo purposes, add some mock conversations
      _conversations = [
        Conversation(
          id: '1',
          otherUser: User(
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'client',
          ),
          lastMessage: 'Hi, I\'m interested in your Flutter development services.',
          lastMessageTime: DateTime.now().subtract(const Duration(hours: 2)),
          isRead: false,
          unreadCount: 2,
        ),
        Conversation(
          id: '2',
          otherUser: User(
            id: '2',
            name: 'Sarah Smith',
            email: 'sarah@example.com',
            role: 'client',
          ),
          lastMessage: 'Thank you for the quick delivery!',
          lastMessageTime: DateTime.now().subtract(const Duration(days: 1)),
          isRead: true,
          unreadCount: 0,
        ),
      ];
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _openConversation(Conversation conversation) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ChatScreen(conversation: conversation),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Messages'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadConversations,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadConversations,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: AppTheme.primary),
      );
    }

    if (_error != null && _conversations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'Error loading messages',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _error!,
              style: TextStyle(color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadConversations,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.white,
              ),
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_conversations.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.chat_bubble_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              'No conversations yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Start applying to jobs or posting projects\nto begin conversations with other users.',
              style: TextStyle(color: Colors.grey[500]),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _conversations.length,
      itemBuilder: (context, index) {
        final conversation = _conversations[index];
        return _buildConversationCard(conversation);
      },
    );
  }

  Widget _buildConversationCard(Conversation conversation) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: () => _openConversation(conversation),
        leading: Stack(
          children: [
            CircleAvatar(
              radius: 24,
              backgroundColor: AppTheme.primary,
              child: Text(
                '${conversation.otherUser.name.substring(0, 2)}',
                style: const TextStyle(
                  color: AppTheme.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            if (conversation.unreadCount > 0)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: AppTheme.error,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 16,
                  ),
                  child: Text(
                    conversation.unreadCount.toString(),
                    style: const TextStyle(
                      color: AppTheme.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
        title: Text(
          'conversation.otherUser.name',
          style: TextStyle(
            fontWeight: conversation.unreadCount > 0 ? FontWeight.bold : FontWeight.w600,
            color: AppTheme.textPrimary,
          ),
        ),
        subtitle: Text(
          conversation.lastMessage,
          style: TextStyle(
            color: Colors.grey[600],
            fontWeight: conversation.unreadCount > 0 ? FontWeight.w500 : FontWeight.normal,
          ),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              _formatTime(conversation.lastMessageTime),
              style: TextStyle(
                color: Colors.grey[500],
                fontSize: 12,
              ),
            ),
            if (conversation.unreadCount > 0) ...[
              const SizedBox(height: 4),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: AppTheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);
    
    if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'now';
    }
  }
}

class ChatScreen extends StatefulWidget {
  final Conversation conversation;

  const ChatScreen({Key? key, required this.conversation}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final ApiService _apiService = ApiService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  List<Message> _messages = [];
  bool _isLoading = false;
  bool _isSending = false;

  @override
  void initState() {
    super.initState();
    _loadMessages();
  }

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadMessages() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final response = await _apiService.getMessages(widget.conversation.id);
      
      if (response['success'] == true) {
        final messagesData = response['data'] as List<dynamic>;
        _messages = messagesData.map((data) => Message.fromJson(data)).toList();
      } else {
        // For demo purposes, add some mock messages
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        final currentUser = authProvider.user!;
        
        _messages = [
          Message(
            id: '1',
            content: 'Hi, I saw your job posting and I\'m very interested!',
            sender: currentUser,
            sentAt: DateTime.now().subtract(const Duration(hours: 3)),
            isRead: true,
            attachments: [],
          ),
          Message(
            id: '2',
            content: 'Hi! Thanks for your interest. Could you tell me more about your experience with Flutter?',
            sender: widget.conversation.otherUser,
            sentAt: DateTime.now().subtract(const Duration(hours: 2, minutes: 30)),
            isRead: true,
            attachments: [],
          ),
          Message(
            id: '3',
            content: 'I have 5+ years of experience with Flutter and have built several production apps. I can show you my portfolio.',
            sender: currentUser,
            sentAt: DateTime.now().subtract(const Duration(hours: 2)),
            isRead: false,
            attachments: [],
          ),
        ];
      }
      
      _scrollToBottom();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading messages: ${e.toString()}'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _sendMessage() async {
    final content = _messageController.text.trim();
    if (content.isEmpty) return;

    setState(() {
      _isSending = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final currentUser = authProvider.user!;

      // Add message locally first for immediate feedback
      final tempMessage = Message(
        id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
        content: content,
        sender: currentUser,
        sentAt: DateTime.now(),
        isRead: false,
        attachments: [],
      );

      setState(() {
        _messages.add(tempMessage);
        _messageController.clear();
      });

      _scrollToBottom();

      // Send to server
      final response = await _apiService.sendMessage(
        widget.conversation.id, 
        content,
      );
      
      if (response['success'] == true) {
        // Update with server response
        final serverMessage = Message.fromJson(response['data']);
        setState(() {
          final tempIndex = _messages.indexWhere((msg) => msg.id == tempMessage.id);
          if (tempIndex != -1) {
            _messages[tempIndex] = serverMessage;
          }
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to send message: ${e.toString()}'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      setState(() {
        _isSending = false;
      });
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppTheme.primary,
              child: Text(
                widget.conversation.otherUser.name.substring(0, 2).toUpperCase(),
                style: const TextStyle(
                  color: AppTheme.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                widget.conversation.otherUser.name,
                style: const TextStyle(fontSize: 16),
              ),
            ),
          ],
        ),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          // Messages list
          Expanded(
            child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final message = _messages[index];
                    return _buildMessageBubble(message);
                  },
                ),
          ),
          
          // Message input
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.white,
              border: Border(
                top: BorderSide(color: Colors.grey[300]!),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                    ),
                    maxLines: null,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  decoration: const BoxDecoration(
                    color: AppTheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: _isSending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(AppTheme.white),
                          ),
                        )
                      : const Icon(Icons.send, color: AppTheme.white),
                    onPressed: _isSending ? null : _sendMessage,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(Message message) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final currentUser = authProvider.user!;
    final isMe = message.sender.id == currentUser.id;

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isMe) ...[
            CircleAvatar(
              radius: 12,
              backgroundColor: AppTheme.primary,
              child: Text(
                '${message.sender.name.substring(0, 1).toUpperCase()}',
                style: const TextStyle(
                  color: AppTheme.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isMe ? AppTheme.primary : AppTheme.white,
                borderRadius: BorderRadius.circular(18).copyWith(
                  bottomLeft: isMe ? const Radius.circular(18) : const Radius.circular(4),
                  bottomRight: isMe ? const Radius.circular(4) : const Radius.circular(18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    message.content,
                    style: TextStyle(
                      color: isMe ? AppTheme.white : AppTheme.textPrimary,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatMessageTime(message.sentAt),
                    style: TextStyle(
                      color: isMe ? AppTheme.white.withOpacity(0.7) : Colors.grey[500],
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isMe) ...[
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 12,
              backgroundColor: AppTheme.primary,
              child: Text(
                '${message.sender.name.substring(0, 1).toUpperCase()}',
                style: const TextStyle(
                  color: AppTheme.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatMessageTime(DateTime time) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final messageDate = DateTime(time.year, time.month, time.day);
    
    if (messageDate == today) {
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    } else {
      return '${time.day}/${time.month} ${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
    }
  }
}
