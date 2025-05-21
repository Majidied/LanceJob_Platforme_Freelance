import 'api_service.dart';
import '../models/client.dart';

// Get client by ID
Future<ProfileModel> getClient(String id) async {
  final response = await Api.get('/client/$id');
  
  // Debug log
  print('Response type: ${response.runtimeType}');
  print('Response content: $response');
  
  // Handle different response formats
  try {
    // If response has a 'data' field which is a list
    if (response is Map && response.containsKey('data')) {
      var data = response['data'];
      if (data is List && data.isNotEmpty) {
        return ProfileModel.fromJson(data[0]);
      } else if (data is Map<String, dynamic>) {
        return ProfileModel.fromJson(data);
      }
    } 
    // If response is a direct list
    else if (response is List && response.isNotEmpty) {
      return ProfileModel.fromJson(response[0]);
    } 
    // If response is a direct object
    else if (response is Map<String, dynamic>) {
      return ProfileModel.fromJson(response);
    }
    
    throw Exception("Unexpected response format: $response");
  } catch (e) {
    print("Error parsing response: $e");
    print("Response was: $response");
    rethrow; // Re-throw the exception after logging
  }
}

// Get all clients
Future<List<ProfileModel>> fetchClients() async {
  final response = await Api.get('/client');
  
  try {
    List<dynamic> clientsData;
    
    // Handle different response formats
    if (response is List) {
      clientsData = response;
    } else if (response is Map && response.containsKey('data') && response['data'] is List) {
      clientsData = response['data'];
    } else {
      throw Exception("Unexpected response format: $response");
    }
    
    return clientsData
        .map((clientData) => ProfileModel.fromJson(clientData))
        .toList();
  } catch (e) {
    print("Error parsing clients list: $e");
    print("Response was: $response");
    rethrow;
  }
}

// Update client
Future<ProfileModel> updateClient(String id, Map<String, dynamic> updatedData) async {
  final response = await Api.put('/client/$id', updatedData);
  
  try {
    if (response is Map<String, dynamic>) {
      return ProfileModel.fromJson(response);
    } else if (response is Map && response.containsKey('data')) {
      var data = response['data'];
      if (data is Map<String, dynamic>) {
        return ProfileModel.fromJson(data);
      } else if (data is List && data.isNotEmpty) {
        return ProfileModel.fromJson(data[0]);
      }
    }
    
    throw Exception("Unexpected response format after update: $response");
  } catch (e) {
    print("Error parsing update response: $e");
    print("Response was: $response");
    rethrow;
  }
}

// Create client
Future<ProfileModel> createClient(Map<String, dynamic> clientData) async {
  final response = await Api.post('/client', clientData);
  
  try {
    if (response is Map<String, dynamic>) {
      return ProfileModel.fromJson(response);
    } else if (response is Map && response.containsKey('data')) {
      var data = response['data'];
      if (data is Map<String, dynamic>) {
        return ProfileModel.fromJson(data);
      } else if (data is List && data.isNotEmpty) {
        return ProfileModel.fromJson(data[0]);
      }
    }
    
    throw Exception("Unexpected response format after create: $response");
  } catch (e) {
    print("Error parsing create response: $e");
    print("Response was: $response");
    rethrow;
  }
}

// Delete client
Future<bool> deleteClient(String id) async {
  try {
    final response = await Api.delete('/client/$id');
    return response != null; // Assuming success if response is not null
  } catch (e) {
    print("Error deleting client: $e");
    rethrow;
  }
}