import 'package:flutter/material.dart';
import 'services/api_service.dart';

class ConnectionTest extends StatefulWidget {
  const ConnectionTest({Key? key}) : super(key: key);

  @override
  State<ConnectionTest> createState() => _ConnectionTestState();
}

class _ConnectionTestState extends State<ConnectionTest> {
  String _status = 'Testing connection...';
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _testConnection();
  }

  Future<void> _testConnection() async {
    try {
      final response = await ApiService.get('/health');
      setState(() {
        _status = 'Connected! Response: $response';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _status = 'Connection failed: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Backend Connection Test')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isLoading)
                const CircularProgressIndicator()
              else
                Text(
                  _status,
                  style: const TextStyle(fontSize: 16),
                  textAlign: TextAlign.center,
                ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _status = 'Testing connection...';
                  });
                  _testConnection();
                },
                child: const Text('Test Again'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
