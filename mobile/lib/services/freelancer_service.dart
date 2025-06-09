// services/freelancer_service.dart
import 'package:flutter/material.dart';
import '../models/freelancer.dart';
import 'api_service.dart';

/// Récupère un freelancer spécifique par son ID
Future<Freelancer> getFreelancer(String id) async {
  try {
    final response = await Api.get('/freelancer/$id');
    return Freelancer.fromMap(response);
  } catch (e) {
    debugPrint('Erreur lors de la récupération du freelancer $id: $e');
    rethrow;
  }
}

/// Récupère tous les freelancers disponibles
Future<List<Freelancer>> fetchFreelancers() async {
  try {
    final response = await Api.get('/freelancer');
    
    debugPrint('Type de réponse: ${response.runtimeType}');
    debugPrint('Contenu de la réponse: $response');
    
    List<dynamic> freelancersData;
    
    if (response is List) {
      freelancersData = response;
    } else if (response is Map && response.containsKey('data')) {
      freelancersData = response['data'] as List<dynamic>;
    } else {
      throw Exception("Format de réponse incompatible. Attendu: Liste ou {data: Liste}, Reçu: $response");
    }
    
    return freelancersData
        .map((data) => Freelancer.fromMap(data as Map<String, dynamic>))
        .toList();
  } catch (e) {
    debugPrint('Erreur lors de la récupération des freelancers: $e');
    rethrow;
  }
}

/// Met à jour les informations d'un freelancer
Future<Freelancer> updateFreelancer(String id, Map<String, dynamic> updatedData) async {
  try {
    final response = await Api.put('/freelancer/$id', updatedData);
    return Freelancer.fromMap(response);
  } catch (e) {
    debugPrint('Erreur lors de la mise à jour du freelancer $id: $e');
    rethrow;
  }
}

/// Crée un nouveau freelancer
Future<Freelancer> createFreelancer(Map<String, dynamic> freelancerData) async {
  try {
    final response = await Api.post('/freelancer', freelancerData);
    return Freelancer.fromMap(response);
  } catch (e) {
    debugPrint('Erreur lors de la création du freelancer: $e');
    rethrow;
  }
}

/// Supprime un freelancer
Future<void> deleteFreelancer(String id) async {
  try {
    await Api.delete('/freelancer/$id');
  } catch (e) {
    debugPrint('Erreur lors de la suppression du freelancer $id: $e');
    rethrow;
  }
}