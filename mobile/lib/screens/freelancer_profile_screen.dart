import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class FreelancerProfileScreen extends StatefulWidget {
  const FreelancerProfileScreen({Key? key}) : super(key: key);

  @override
  State<FreelancerProfileScreen> createState() => _FreelancerProfileScreenState();
}

class _FreelancerProfileScreenState extends State<FreelancerProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _bioController = TextEditingController();
  final _skillsController = TextEditingController();
  final _hourlyRateController = TextEditingController();
  final _locationController = TextEditingController();
  
  bool _isAvailable = true;
  String _selectedExperience = 'intermediate';
  List<String> _languages = ['French', 'Arabic'];

  @override
  void initState() {
    super.initState();
    _loadUserProfile();
  }

  void _loadUserProfile() {
    final user = context.read<AuthProvider>().user;
    if (user != null) {
      _titleController.text = user.title ?? '';
      _bioController.text = user.bio ?? '';
      _skillsController.text = user.skills.join(', ');
      _hourlyRateController.text = user.hourlyRate?.toString() ?? '';
      _locationController.text = user.location ?? '';
      _languages = user.languages.isNotEmpty ? user.languages : ['French', 'Arabic'];
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _bioController.dispose();
    _skillsController.dispose();
    _hourlyRateController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final profileData = {
      'title': _titleController.text.trim(),
      'bio': _bioController.text.trim(),
      'skills': _skillsController.text.trim().split(',').map((s) => s.trim()).toList(),
      'hourlyRate': double.tryParse(_hourlyRateController.text.trim()),
      'location': _locationController.text.trim(),
      'languages': _languages,
      'isAvailable': _isAvailable,
    };

    try {
      // This would update the profile via API
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: AppTheme.success,
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to update profile: $e'),
          backgroundColor: AppTheme.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Edit Profile'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _saveProfile,
            child: const Text(
              'Save',
              style: TextStyle(
                color: AppTheme.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Header
              Center(
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: AppTheme.primary,
                          child: Consumer<AuthProvider>(
                            builder: (context, authProvider, child) {
                              final user = authProvider.user;
                              return Text(
                                user?.name[0].toUpperCase() ?? 'U',
                                style: const TextStyle(
                                  fontSize: 36,
                                  fontWeight: FontWeight.bold,
                                  color: AppTheme.white,
                                ),
                              );
                            },
                          ),
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppTheme.white,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: AppTheme.grey200, width: 2),
                            ),
                            child: IconButton(
                              onPressed: () {
                                // TODO: Add image picker
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Photo upload coming soon!')),
                                );
                              },
                              icon: Icon(Icons.camera_alt, color: AppTheme.grey600),
                              iconSize: 20,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Consumer<AuthProvider>(
                      builder: (context, authProvider, child) {
                        return Text(
                          authProvider.user?.name ?? 'User Name',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Professional Title
              CustomTextField(
                controller: _titleController,
                label: 'Professional Title',
                hintText: 'e.g., Flutter Developer, UI/UX Designer',
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Professional title is required';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),
              
              // Bio
              CustomTextField(
                controller: _bioController,
                label: 'Professional Bio',
                hintText: 'Tell clients about your experience and expertise',
                maxLines: 4,
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Bio is required';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),
              
              // Skills
              CustomTextField(
                controller: _skillsController,
                label: 'Skills',
                hintText: 'Flutter, Dart, Firebase, UI/UX (comma separated)',
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'At least one skill is required';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),
              
              // Hourly Rate and Location
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _hourlyRateController,
                      label: 'Hourly Rate (MAD)',
                      hintText: '100',
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isNotEmpty == true && double.tryParse(value!) == null) {
                          return 'Invalid rate';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: CustomTextField(
                      controller: _locationController,
                      label: 'Location',
                      hintText: 'Casablanca, Morocco',
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 20),
              
              // Experience Level
              DropdownButtonFormField<String>(
                value: _selectedExperience,
                decoration: const InputDecoration(
                  labelText: 'Experience Level',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'beginner', child: Text('Beginner (0-2 years)')),
                  DropdownMenuItem(value: 'intermediate', child: Text('Intermediate (2-5 years)')),
                  DropdownMenuItem(value: 'expert', child: Text('Expert (5+ years)')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedExperience = value!;
                  });
                },
              ),
              
              const SizedBox(height: 20),
              
              // Languages
              Text(
                'Languages',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: ['French', 'Arabic', 'English', 'Spanish'].map((language) {
                  final isSelected = _languages.contains(language);
                  return FilterChip(
                    label: Text(language),
                    selected: isSelected,
                    onSelected: (selected) {
                      setState(() {
                        if (selected) {
                          _languages.add(language);
                        } else {
                          _languages.remove(language);
                        }
                      });
                    },
                    selectedColor: AppTheme.primary.withOpacity(0.2),
                    checkmarkColor: AppTheme.primary,
                  );
                }).toList(),
              ),
              
              const SizedBox(height: 20),
              
              // Availability Toggle
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Available for Work',
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Let clients know you\'re available for new projects',
                            style: TextStyle(
                              color: AppTheme.grey600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                      Switch(
                        value: _isAvailable,
                        onChanged: (value) {
                          setState(() {
                            _isAvailable = value;
                          });
                        },
                        activeColor: AppTheme.success,
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Save Button
              CustomButton(
                text: 'Save Profile',
                onPressed: _saveProfile,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
