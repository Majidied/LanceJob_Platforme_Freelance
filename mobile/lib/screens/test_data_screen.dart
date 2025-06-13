import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';
import '../providers/auth_provider.dart';

class TestDataScreen extends StatefulWidget {
  const TestDataScreen({super.key});

  @override
  State<TestDataScreen> createState() => _TestDataScreenState();
}

class _TestDataScreenState extends State<TestDataScreen> {
  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  Future<void> _initializeData() async {
    final dataProvider = context.read<DataProvider>();
    await dataProvider.initializeData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Local Data Test'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<DataProvider>().initializeData();
            },
          ),
        ],
      ),
      body: Consumer2<DataProvider, AuthProvider>(
        builder: (context, dataProvider, authProvider, child) {
          if (dataProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (dataProvider.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error, size: 64, color: Colors.red),
                  SizedBox(height: 16),
                  Text('Error: ${dataProvider.error}'),
                  ElevatedButton(
                    onPressed: () => dataProvider.initializeData(),
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Authentication Status
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Authentication Status', style: Theme.of(context).textTheme.titleLarge),
                        SizedBox(height: 8),
                        Text('Authenticated: ${authProvider.isAuthenticated}'),
                        if (authProvider.user != null) ...[
                          Text('User: ${authProvider.user!.name}'),
                          Text('Email: ${authProvider.user!.email}'),
                          Text('Role: ${authProvider.user!.role}'),
                        ],
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 16),

                // Jobs Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Jobs (${dataProvider.jobs.length})', style: Theme.of(context).textTheme.titleLarge),
                        SizedBox(height: 8),
                        ...dataProvider.jobs.take(5).map((job) => ListTile(
                          title: Text(job.title),
                          subtitle: Text('\$${job.budget} • ${job.skills.join(', ')}'),
                          trailing: Text(job.status.toString().split('.').last),
                        )),
                        if (dataProvider.jobs.length > 5)
                          Text('... and ${dataProvider.jobs.length - 5} more'),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 16),

                // Featured Jobs Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Featured Jobs (${dataProvider.featuredJobs.length})', style: Theme.of(context).textTheme.titleLarge),
                        SizedBox(height: 8),
                        ...dataProvider.featuredJobs.map((job) => ListTile(
                          title: Text(job.title),
                          subtitle: Text('\$${job.budget} • ${job.skills.join(', ')}'),
                          trailing: Icon(Icons.star, color: Colors.orange),
                        )),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 16),

                // Freelancers Section
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Freelancers (${dataProvider.freelancers.length})', style: Theme.of(context).textTheme.titleLarge),
                        SizedBox(height: 8),
                        ...dataProvider.freelancers.map((freelancer) => ListTile(
                          leading: CircleAvatar(
                            backgroundImage: freelancer['avatar'] != null 
                              ? NetworkImage(freelancer['avatar']) 
                              : null,
                            child: freelancer['avatar'] == null 
                              ? Text(freelancer['firstName']?[0] ?? '?') 
                              : null,
                          ),
                          title: Text('${freelancer['firstName']} ${freelancer['lastName']}'),
                          subtitle: Text('${freelancer['rating']?.toStringAsFixed(1) ?? '0.0'} ⭐ • ${freelancer['completedJobs']} jobs'),
                          trailing: Text(freelancer['role'] ?? 'Unknown'),
                        )),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: 16),

                // Test Actions
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Test Actions', style: Theme.of(context).textTheme.titleLarge),
                        SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _testLogin(),
                                child: Text('Test Login'),
                              ),
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _testSearch(),
                                child: Text('Test Search'),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () => _resetDatabase(),
                            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                            child: Text('Reset Database'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Future<void> _testLogin() async {
    final authProvider = context.read<AuthProvider>();
    final success = await authProvider.login('sarah.freelancer@example.com', 'password');
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Login successful!' : 'Login failed: ${authProvider.error}'),
        backgroundColor: success ? Colors.green : Colors.red,
      ),
    );
  }

  Future<void> _testSearch() async {
    final dataProvider = context.read<DataProvider>();
    final results = await dataProvider.searchJobs('flutter');
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Found ${results.length} jobs with "flutter"'),
      ),
    );
  }

  Future<void> _resetDatabase() async {
    final dataProvider = context.read<DataProvider>();
    await dataProvider.resetAllData();
    
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Database reset successfully!'),
        backgroundColor: Colors.green,
      ),
    );
  }
}
