import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../theme/app_theme.dart';
import '../models/job.dart';
import '../widgets/job_card.dart';

class JobSearchScreen extends StatefulWidget {
  const JobSearchScreen({super.key});

  @override
  State<JobSearchScreen> createState() => _JobSearchScreenState();
}

class _JobSearchScreenState extends State<JobSearchScreen> {
  final _searchController = TextEditingController();
  String _selectedExperience = 'all';
  String _selectedType = 'all';
  double _minBudget = 0;
  double _maxBudget = 10000;
  bool _remoteOnly = false;
  List<Job> _filteredJobs = [];

  @override
  void initState() {
    super.initState();
    _loadJobs();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadJobs() async {
    final dataProvider = context.read<DataProvider>();
    await dataProvider.loadJobs();
    _applyFilters();
  }

  void _applyFilters() {
    final dataProvider = context.read<DataProvider>();
    List<Job> jobs = List.from(dataProvider.jobs);

    // Search filter
    if (_searchController.text.isNotEmpty) {
      final query = _searchController.text.toLowerCase();
      jobs = jobs.where((job) =>
        job.title.toLowerCase().contains(query) ||
        job.description.toLowerCase().contains(query) ||
        job.skills.any((skill) => skill.toLowerCase().contains(query))
      ).toList();
    }

    // Experience filter
    if (_selectedExperience != 'all') {
      jobs = jobs.where((job) => job.experienceLevel == _selectedExperience).toList();
    }

    // Type filter
    if (_selectedType != 'all') {
      jobs = jobs.where((job) => job.type == _selectedType).toList();
    }

    // Budget filter
    jobs = jobs.where((job) => 
      job.budget >= _minBudget && job.budget <= _maxBudget
    ).toList();

    // Remote filter
    if (_remoteOnly) {
      jobs = jobs.where((job) => job.isRemote).toList();
    }

    setState(() {
      _filteredJobs = jobs;
    });
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.grey300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text(
                      'Filter Jobs',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Experience Level
                    Text(
                      'Experience Level',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _selectedExperience,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All Levels')),
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

                    // Job Type
                    Text(
                      'Job Type',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _selectedType,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'all', child: Text('All Types')),
                        DropdownMenuItem(value: 'fixed', child: Text('Fixed Price')),
                        DropdownMenuItem(value: 'hourly', child: Text('Hourly Rate')),
                      ],
                      onChanged: (value) {
                        setState(() {
                          _selectedType = value!;
                        });
                      },
                    ),

                    const SizedBox(height: 20),

                    // Budget Range
                    Text(
                      'Budget Range (MAD)',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    RangeSlider(
                      values: RangeValues(_minBudget, _maxBudget),
                      min: 0,
                      max: 20000,
                      divisions: 40,
                      labels: RangeLabels(
                        '${_minBudget.toInt()} MAD',
                        '${_maxBudget.toInt()} MAD',
                      ),
                      onChanged: (values) {
                        setState(() {
                          _minBudget = values.start;
                          _maxBudget = values.end;
                        });
                      },
                    ),
                    Text(
                      '${_minBudget.toInt()} MAD - ${_maxBudget.toInt()} MAD',
                      style: TextStyle(color: AppTheme.grey600),
                      textAlign: TextAlign.center,
                    ),

                    const SizedBox(height: 20),

                    // Remote Work
                    CheckboxListTile(
                      title: const Text('Remote Work Only'),
                      value: _remoteOnly,
                      onChanged: (value) {
                        setState(() {
                          _remoteOnly = value ?? false;
                        });
                      },
                      activeColor: AppTheme.primary,
                    ),

                    const SizedBox(height: 40),

                    // Apply Button
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _applyFilters();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: AppTheme.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Apply Filters'),
                    ),

                    const SizedBox(height: 12),

                    // Clear Button
                    TextButton(
                      onPressed: () {
                        setState(() {
                          _selectedExperience = 'all';
                          _selectedType = 'all';
                          _minBudget = 0;
                          _maxBudget = 10000;
                          _remoteOnly = false;
                        });
                        Navigator.pop(context);
                        _applyFilters();
                      },
                      child: const Text('Clear All Filters'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      appBar: AppBar(
        title: const Text('Search Jobs'),
        backgroundColor: AppTheme.primary,
        foregroundColor: AppTheme.white,
        elevation: 0,
      ),
      body: Consumer<DataProvider>(
        builder: (context, dataProvider, child) {
          return Column(
            children: [
              // Search and Filter Bar
              Container(
                padding: const EdgeInsets.all(16),
                color: AppTheme.white,
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _searchController,
                            decoration: InputDecoration(
                              hintText: 'Search jobs, skills, or keywords...',
                              prefixIcon: Icon(Icons.search, color: AppTheme.grey400),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: AppTheme.grey200),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: AppTheme.grey200),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: AppTheme.primary),
                              ),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            ),
                            onChanged: (value) => _applyFilters(),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          decoration: BoxDecoration(
                            color: AppTheme.primary,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.tune, color: AppTheme.white),
                            onPressed: _showFilterDialog,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    
                    // Active Filters
                    if (_selectedExperience != 'all' || 
                        _selectedType != 'all' || 
                        _remoteOnly ||
                        _minBudget > 0 ||
                        _maxBudget < 10000)
                      Container(
                        width: double.infinity,
                        child: Wrap(
                          spacing: 8,
                          children: [
                            if (_selectedExperience != 'all')
                              Chip(
                                label: Text(_selectedExperience),
                                onDeleted: () {
                                  setState(() {
                                    _selectedExperience = 'all';
                                  });
                                  _applyFilters();
                                },
                                deleteIconColor: AppTheme.primary,
                              ),
                            if (_selectedType != 'all')
                              Chip(
                                label: Text(_selectedType),
                                onDeleted: () {
                                  setState(() {
                                    _selectedType = 'all';
                                  });
                                  _applyFilters();
                                },
                                deleteIconColor: AppTheme.primary,
                              ),
                            if (_remoteOnly)
                              Chip(
                                label: const Text('Remote'),
                                onDeleted: () {
                                  setState(() {
                                    _remoteOnly = false;
                                  });
                                  _applyFilters();
                                },
                                deleteIconColor: AppTheme.primary,
                              ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
              
              // Results Count
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: AppTheme.grey100,
                child: Text(
                  '${_filteredJobs.length} jobs found',
                  style: TextStyle(
                    color: AppTheme.grey600,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              
              // Jobs List
              Expanded(
                child: dataProvider.isLoading
                    ? const Center(child: CircularProgressIndicator())
                    : _filteredJobs.isEmpty
                        ? _buildEmptyState()
                        : RefreshIndicator(
                            onRefresh: _loadJobs,
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _filteredJobs.length,
                              itemBuilder: (context, index) {
                                final job = _filteredJobs[index];
                                return Container(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: JobCard(
                                    job: job,
                                    onTap: () {
                                      // Navigate to job details
                                      _showJobDetails(job);
                                    },
                                  ),
                                );
                              },
                            ),
                          ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: AppTheme.grey400,
          ),
          const SizedBox(height: 16),
          Text(
            'No jobs found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.grey600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search criteria or filters',
            style: TextStyle(
              color: AppTheme.grey500,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _searchController.clear();
                _selectedExperience = 'all';
                _selectedType = 'all';
                _minBudget = 0;
                _maxBudget = 10000;
                _remoteOnly = false;
              });
              _applyFilters();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: AppTheme.white,
            ),
            child: const Text('Clear All Filters'),
          ),
        ],
      ),
    );
  }

  void _showJobDetails(Job job) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        builder: (context, scrollController) => Container(
          decoration: const BoxDecoration(
            color: AppTheme.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppTheme.grey300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(20),
                  children: [
                    Text(
                      job.title,
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Posted by ${job.clientName}',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      job.description,
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 24),
                    _buildJobDetailRow('Budget', '${job.budget} ${job.currency}'),
                    _buildJobDetailRow('Type', job.type),
                    _buildJobDetailRow('Experience', job.experienceLevel),
                    _buildJobDetailRow('Location', job.location ?? (job.isRemote ? 'Remote' : 'Not specified')),
                    _buildJobDetailRow('Deadline', '${job.deadline.day}/${job.deadline.month}/${job.deadline.year}'),
                    const SizedBox(height: 16),
                    Text(
                      'Skills Required',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: job.skills.map((skill) => Chip(
                        label: Text(skill),
                        backgroundColor: AppTheme.primary.withOpacity(0.1),
                        labelStyle: TextStyle(color: AppTheme.primary),
                      )).toList(),
                    ),
                    const SizedBox(height: 32),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        _applyToJob(job);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.primary,
                        foregroundColor: AppTheme.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Apply to This Job'),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildJobDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(
                fontWeight: FontWeight.w600,
                color: AppTheme.grey600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16),
            ),
          ),
        ],
      ),
    );
  }

  void _applyToJob(Job job) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Applied to ${job.title}'),
        backgroundColor: AppTheme.success,
      ),
    );
  }
}
