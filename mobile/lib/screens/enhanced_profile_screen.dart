import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import 'package:provider/provider.dart';

class Skill {
  final String id;
  final String name;
  final int level; // 1-5 proficiency level

  Skill({
    required this.id,
    required this.name,
    required this.level,
  });

  factory Skill.fromJson(Map<String, dynamic> json) {
    return Skill(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      level: json['level'] ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'level': level,
    };
  }
}

class PortfolioItem {
  final String id;
  final String title;
  final String description;
  final String? imageUrl;
  final String? projectUrl;
  final List<String> technologies;
  final DateTime createdAt;

  PortfolioItem({
    required this.id,
    required this.title,
    required this.description,
    this.imageUrl,
    this.projectUrl,
    required this.technologies,
    required this.createdAt,
  });

  factory PortfolioItem.fromJson(Map<String, dynamic> json) {
    return PortfolioItem(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      imageUrl: json['imageUrl'],
      projectUrl: json['projectUrl'],
      technologies: List<String>.from(json['technologies'] ?? []),
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'projectUrl': projectUrl,
      'technologies': technologies,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class EnhancedProfileScreen extends StatefulWidget {
  const EnhancedProfileScreen({Key? key}) : super(key: key);

  @override
  State<EnhancedProfileScreen> createState() => _EnhancedProfileScreenState();
}

class _EnhancedProfileScreenState extends State<EnhancedProfileScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  late TabController _tabController;
  
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _bioController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _experienceController = TextEditingController();
  
  List<Skill> _skills = [];
  List<PortfolioItem> _portfolio = [];
  bool _isLoading = false;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProfileData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _titleController.dispose();
    _bioController.dispose();
    _hourlyRateController.dispose();
    _experienceController.dispose();
    super.dispose();
  }

  Future<void> _loadProfileData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null) {
        throw Exception('User not authenticated');
      }

      // Load current user profile
      final currentUser = await _apiService.getCurrentUser();
      
      // Populate form fields
      _titleController.text = currentUser.title ?? '';
      _bioController.text = currentUser.bio ?? '';
      _hourlyRateController.text = currentUser.hourlyRate.toString();
      _experienceController.text = currentUser.experience.length.toString();

      // Load skills and portfolio (these would need to be added to the API)
      // For now, using mock data
      _skills = [
        Skill(id: '1', name: 'Flutter', level: 4),
        Skill(id: '2', name: 'React', level: 5),
        Skill(id: '3', name: 'Node.js', level: 3),
      ];

      _portfolio = [
        PortfolioItem(
          id: '1',
          title: 'E-commerce Mobile App',
          description: 'A full-featured e-commerce app built with Flutter',
          technologies: ['Flutter', 'Firebase', 'Stripe'],
          createdAt: DateTime.now().subtract(const Duration(days: 30)),
        ),
        PortfolioItem(
          id: '2',
          title: 'Social Media Dashboard',
          description: 'React-based dashboard for social media analytics',
          technologies: ['React', 'Node.js', 'MongoDB'],
          createdAt: DateTime.now().subtract(const Duration(days: 60)),
        ),
      ];

    } catch (e) {
      // Handle error silently for demo
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final user = authProvider.user;
      
      if (user == null) return;

      final updates = {
        'title': _titleController.text,
        'bio': _bioController.text,
        'hourlyRate': double.tryParse(_hourlyRateController.text),
        'experience': int.tryParse(_experienceController.text),
        'skills': _skills.map((skill) => skill.toJson()).toList(),
        'portfolio': _portfolio.map((item) => item.toJson()).toList(),
      };

      await _apiService.updateProfile(user.id, updates);
      
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: AppTheme.success,
        ),
      );

    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: AppTheme.error,
        ),
      );
    } finally {
      setState(() {
        _isSaving = false;
      });
    }
  }

  void _showAddSkillDialog() {
    final nameController = TextEditingController();
    int selectedLevel = 1;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          title: const Text('Add Skill'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(
                  labelText: 'Skill Name',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Proficiency Level: $selectedLevel/5',
                style: const TextStyle(fontWeight: FontWeight.w600),
              ),
              Slider(
                value: selectedLevel.toDouble(),
                min: 1,
                max: 5,
                divisions: 4,
                onChanged: (value) {
                  setDialogState(() {
                    selectedLevel = value.round();
                  });
                },
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text('Beginner', style: TextStyle(fontSize: 12)),
                  Text('Expert', style: TextStyle(fontSize: 12)),
                ],
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                if (nameController.text.isNotEmpty) {
                  setState(() {
                    _skills.add(Skill(
                      id: DateTime.now().millisecondsSinceEpoch.toString(),
                      name: nameController.text,
                      level: selectedLevel,
                    ));
                  });
                  Navigator.pop(context);
                }
              },
              child: const Text('Add'),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddPortfolioDialog() {
    final titleController = TextEditingController();
    final descriptionController = TextEditingController();
    final projectUrlController = TextEditingController();
    final technologiesController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Portfolio Item'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleController,
                decoration: const InputDecoration(
                  labelText: 'Project Title',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Description',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: projectUrlController,
                decoration: const InputDecoration(
                  labelText: 'Project URL (optional)',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: technologiesController,
                decoration: const InputDecoration(
                  labelText: 'Technologies (comma-separated)',
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              if (titleController.text.isNotEmpty && descriptionController.text.isNotEmpty) {
                final technologies = technologiesController.text
                    .split(',')
                    .map((tech) => tech.trim())
                    .where((tech) => tech.isNotEmpty)
                    .toList();

                setState(() {
                  _portfolio.add(PortfolioItem(
                    id: DateTime.now().millisecondsSinceEpoch.toString(),
                    title: titleController.text,
                    description: descriptionController.text,
                    projectUrl: projectUrlController.text.isNotEmpty ? projectUrlController.text : null,
                    technologies: technologies,
                    createdAt: DateTime.now(),
                  ));
                });
                Navigator.pop(context);
              }
            },
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Enhanced Profile'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.white),
                ),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.save),
              onPressed: _saveProfile,
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.white,
          unselectedLabelColor: AppTheme.white.withOpacity(0.7),
          indicatorColor: AppTheme.white,
          tabs: const [
            Tab(text: 'Profile'),
            Tab(text: 'Skills'),
            Tab(text: 'Portfolio'),
          ],
        ),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
        : TabBarView(
            controller: _tabController,
            children: [
              _buildProfileTab(),
              _buildSkillsTab(),
              _buildPortfolioTab(),
            ],
          ),
    );
  }

  Widget _buildProfileTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile image section
            Center(
              child: Stack(
                children: [
                  CircleAvatar(
                    radius: 50,
                    backgroundColor: AppTheme.primary,
                    child: Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        final user = authProvider.user;
                        return Text(
                          user != null ? user.name.substring(0, 1) : 'U',
                          style: const TextStyle(
                            color: AppTheme.white,
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      },
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    right: 0,
                    child: Container(
                      decoration: const BoxDecoration(
                        color: AppTheme.primary,
                        shape: BoxShape.circle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.camera_alt, color: AppTheme.white, size: 20),
                        onPressed: () {
                          // TODO: Implement image picker
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Image upload coming soon!')),
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Professional title
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(
                labelText: 'Professional Title',
                hintText: 'e.g., Full Stack Developer',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.work_outline),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your professional title';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 16),
            
            // Bio
            TextFormField(
              controller: _bioController,
              decoration: const InputDecoration(
                labelText: 'Professional Bio',
                hintText: 'Tell clients about your experience and expertise...',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.description_outlined),
              ),
              maxLines: 4,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your bio';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 16),
            
            // Hourly rate
            TextFormField(
              controller: _hourlyRateController,
              decoration: const InputDecoration(
                labelText: 'Hourly Rate (\$)',
                hintText: '50.00',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.attach_money),
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your hourly rate';
                }
                if (double.tryParse(value) == null) {
                  return 'Please enter a valid number';
                }
                return null;
              },
            ),
            
            const SizedBox(height: 16),
            
            // Years of experience
            TextFormField(
              controller: _experienceController,
              decoration: const InputDecoration(
                labelText: 'Years of Experience',
                hintText: '5',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.timeline),
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter your years of experience';
                }
                if (int.tryParse(value) == null) {
                  return 'Please enter a valid number';
                }
                return null;
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkillsTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Add skill button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showAddSkillDialog,
              icon: const Icon(Icons.add),
              label: const Text('Add Skill'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.white,
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Skills list
          Expanded(
            child: _skills.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.build_outlined,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No skills added yet',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Add your skills to showcase your expertise to clients',
                        style: TextStyle(color: Colors.grey[500]),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _skills.length,
                  itemBuilder: (context, index) {
                    final skill = _skills[index];
                    return _buildSkillCard(skill, index);
                  },
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildSkillCard(Skill skill, int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(
          skill.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                Expanded(
                  child: LinearProgressIndicator(
                    value: skill.level / 5,
                    backgroundColor: Colors.grey[300],
                    valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                  ),
                ),
                const SizedBox(width: 8),
                Text('${skill.level}/5'),
              ],
            ),
          ],
        ),
        trailing: IconButton(
          icon: const Icon(Icons.delete, color: AppTheme.error),
          onPressed: () {
            setState(() {
              _skills.removeAt(index);
            });
          },
        ),
      ),
    );
  }

  Widget _buildPortfolioTab() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Add portfolio button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showAddPortfolioDialog,
              icon: const Icon(Icons.add),
              label: const Text('Add Portfolio Item'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: AppTheme.white,
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Portfolio list
          Expanded(
            child: _portfolio.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.folder_outlined,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No portfolio items yet',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Showcase your best work to attract more clients',
                        style: TextStyle(color: Colors.grey[500]),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  itemCount: _portfolio.length,
                  itemBuilder: (context, index) {
                    final item = _portfolio[index];
                    return _buildPortfolioCard(item, index);
                  },
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildPortfolioCard(PortfolioItem item, int index) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header with title and delete button
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: AppTheme.error),
                  onPressed: () {
                    setState(() {
                      _portfolio.removeAt(index);
                    });
                  },
                ),
              ],
            ),
            
            const SizedBox(height: 8),
            
            // Description
            Text(
              item.description,
              style: TextStyle(
                color: Colors.grey[600],
                height: 1.4,
              ),
            ),
            
            const SizedBox(height: 12),
            
            // Technologies
            if (item.technologies.isNotEmpty)
              Wrap(
                spacing: 8,
                runSpacing: 4,
                children: item.technologies.map((tech) {
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppTheme.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Text(
                      tech,
                      style: const TextStyle(
                        color: AppTheme.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  );
                }).toList(),
              ),
            
            const SizedBox(height: 12),
            
            // Project URL and date
            Row(
              children: [
                if (item.projectUrl != null) ...[
                  Icon(
                    Icons.link,
                    size: 16,
                    color: Colors.grey[600],
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'View Project',
                      style: TextStyle(
                        color: AppTheme.primary,
                        fontSize: 12,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ),
                ] else
                  const Spacer(),
                
                Text(
                  _formatDate(item.createdAt),
                  style: TextStyle(
                    color: Colors.grey[500],
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);
    
    if (difference.inDays > 30) {
      return '${(difference.inDays / 30).floor()} months ago';
    } else if (difference.inDays > 0) {
      return '${difference.inDays} days ago';
    } else {
      return 'Today';
    }
  }
}
