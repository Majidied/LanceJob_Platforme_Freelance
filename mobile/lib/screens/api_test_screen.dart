import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';

class ApiTestScreen extends StatefulWidget {
  const ApiTestScreen({Key? key}) : super(key: key);

  @override
  State<ApiTestScreen> createState() => _ApiTestScreenState();
}

class _ApiTestScreenState extends State<ApiTestScreen> {
  String _testResults = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('API Connection Test'),
        backgroundColor: Colors.blue,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Backend API Connection Test',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            
            ElevatedButton(
              onPressed: _testBackendHealth,
              child: const Text('Test Backend Health'),
            ),
            const SizedBox(height: 10),
            
            ElevatedButton(
              onPressed: _testAuthStatus,
              child: const Text('Test Auth Status'),
            ),
            const SizedBox(height: 10),
            
            ElevatedButton(
              onPressed: _testLoadJobs,
              child: const Text('Test Load Jobs/Missions'),
            ),
            const SizedBox(height: 10),
            
            ElevatedButton(
              onPressed: _testLoadFreelancers,
              child: const Text('Test Load Freelancers'),
            ),
            const SizedBox(height: 20),
            
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    _testResults.isEmpty ? 'Test results will appear here...' : _testResults,
                    style: const TextStyle(fontFamily: 'monospace'),
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.grey),
              child: const Text('Back to App'),
            ),
          ],
        ),
      ),
    );
  }

  void _addTestResult(String message) {
    setState(() {
      _testResults += '${DateTime.now()}: $message\n\n';
    });
  }

  Future<void> _testBackendHealth() async {
    _addTestResult('Testing backend health...');
    try {
      final dataProvider = context.read<DataProvider>();
      final response = await dataProvider.apiService.dio.get('/health');
      _addTestResult('✅ Backend health: ${response.data}');
    } catch (e) {
      _addTestResult('❌ Backend health failed: $e');
    }
  }

  Future<void> _testAuthStatus() async {
    _addTestResult('Testing auth status...');
    try {
      final authProvider = context.read<AuthProvider>();
      if (authProvider.isAuthenticated) {
        _addTestResult('✅ User is authenticated: ${authProvider.user?.email}');
        _addTestResult('✅ User role: ${authProvider.user?.role}');
      } else {
        _addTestResult('⚠️ User is not authenticated');
      }
    } catch (e) {
      _addTestResult('❌ Auth status check failed: $e');
    }
  }

  Future<void> _testLoadJobs() async {
    _addTestResult('Testing jobs/missions loading...');
    try {
      final dataProvider = context.read<DataProvider>();
      await dataProvider.loadJobs();
      
      if (dataProvider.error != null) {
        _addTestResult('❌ Jobs loading failed: ${dataProvider.error}');
      } else {
        _addTestResult('✅ Jobs loaded successfully: ${dataProvider.jobs.length} jobs');
        if (dataProvider.jobs.isNotEmpty) {
          final firstJob = dataProvider.jobs.first;
          _addTestResult('First job: ${firstJob.title} - ${firstJob.description}');
        }
      }
    } catch (e) {
      _addTestResult('❌ Jobs loading failed: $e');
    }
  }

  Future<void> _testLoadFreelancers() async {
    _addTestResult('Testing freelancers loading...');
    try {
      final dataProvider = context.read<DataProvider>();
      await dataProvider.loadFreelancers();
      
      if (dataProvider.error != null) {
        _addTestResult('❌ Freelancers loading failed: ${dataProvider.error}');
      } else {
        _addTestResult('✅ Freelancers loaded successfully: ${dataProvider.freelancers.length} freelancers');
        if (dataProvider.freelancers.isNotEmpty) {
          final firstFreelancer = dataProvider.freelancers.first;
          _addTestResult('First freelancer: ${firstFreelancer['firstName'] ?? 'No name'} ${firstFreelancer['lastName'] ?? ''}');
        }
      }
    } catch (e) {
      _addTestResult('❌ Freelancers loading failed: $e');
    }
  }
}
