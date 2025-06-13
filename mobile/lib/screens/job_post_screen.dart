import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/custom_button.dart';
import '../widgets/custom_text_field.dart';

class JobPostScreen extends StatefulWidget {
  const JobPostScreen({Key? key}) : super(key: key);

  @override
  State<JobPostScreen> createState() => _JobPostScreenState();
}

class _JobPostScreenState extends State<JobPostScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _budgetController = TextEditingController();
  final _skillsController = TextEditingController();
  
  String _selectedType = 'fixed';
  String _selectedExperience = 'intermediate';
  bool _isRemote = true;
  DateTime _deadline = DateTime.now().add(const Duration(days: 30));

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _budgetController.dispose();
    _skillsController.dispose();
    super.dispose();
  }

  Future<void> _selectDeadline() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _deadline,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (date != null) {
      setState(() {
        _deadline = date;
      });
    }
  }

  Future<void> _postJob() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final user = authProvider.user;

    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please login first')),
      );
      return;
    }

    final jobData = {
      'title': _titleController.text.trim(),
      'description': _descriptionController.text.trim(),
      'budget': double.tryParse(_budgetController.text.trim()) ?? 0,
      'clientId': user.id,
      'clientName': user.name,
      'type': _selectedType,
      'skills': _skillsController.text.trim().split(',').map((s) => s.trim()).toList(),
      'experienceLevel': _selectedExperience,
      'deadline': _deadline.toIso8601String(),
      'isRemote': _isRemote,
    };

    try {
      // This would call the API to post the job
      // For now, just show success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Job posted successfully!'),
          backgroundColor: AppTheme.success,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to post job: $e'),
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
        title: const Text('Post a Job'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Job Title
              CustomTextField(
                controller: _titleController,
                label: 'Job Title',
                hintText: 'Enter job title',
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Job title is required';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),
              
              // Job Description
              CustomTextField(
                controller: _descriptionController,
                label: 'Job Description',
                hintText: 'Describe the job requirements and details',
                maxLines: 5,
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'Job description is required';
                  }
                  return null;
                },
              ),
              
              const SizedBox(height: 20),
              
              // Budget and Type
              Row(
                children: [
                  Expanded(
                    child: CustomTextField(
                      controller: _budgetController,
                      label: 'Budget (MAD)',
                      hintText: '0',
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value?.isEmpty ?? true) {
                          return 'Budget is required';
                        }
                        if (double.tryParse(value!) == null) {
                          return 'Invalid budget amount';
                        }
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _selectedType,
                      decoration: const InputDecoration(
                        labelText: 'Job Type',
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'fixed', child: Text('Fixed Price')),
                        DropdownMenuItem(value: 'hourly', child: Text('Hourly Rate')),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedType = value!;
                        });
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 20),
              
              // Skills
              CustomTextField(
                controller: _skillsController,
                label: 'Required Skills',
                hintText: 'Flutter, Dart, Firebase (comma separated)',
                validator: (value) {
                  if (value?.isEmpty ?? true) {
                    return 'At least one skill is required';
                  }
                  return null;
                },
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
                  DropdownMenuItem(value: 'beginner', child: Text('Beginner')),
                  DropdownMenuItem(value: 'intermediate', child: Text('Intermediate')),
                  DropdownMenuItem(value: 'expert', child: Text('Expert')),
                ],
                onChanged: (value) {
                  setState(() {
                    _selectedExperience = value!;
                  });
                },
              ),
              
              const SizedBox(height: 20),
              
              // Deadline
              InkWell(
                onTap: _selectDeadline,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTheme.grey300),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Deadline',
                            style: TextStyle(
                              color: AppTheme.grey600,
                              fontSize: 12,
                            ),
                          ),
                          Text(
                            '${_deadline.day}/${_deadline.month}/${_deadline.year}',
                            style: const TextStyle(fontSize: 16),
                          ),
                        ],
                      ),
                      Icon(Icons.calendar_today, color: AppTheme.grey400),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 20),
              
              // Remote Work Toggle
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Remote Work Available',
                    style: TextStyle(fontSize: 16),
                  ),
                  Switch(
                    value: _isRemote,
                    onChanged: (value) {
                      setState(() {
                        _isRemote = value;
                      });
                    },
                    activeColor: AppTheme.primary,
                  ),
                ],
              ),
              
              const SizedBox(height: 40),
              
              // Post Job Button
              CustomButton(
                text: 'Post Job',
                onPressed: _postJob,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
