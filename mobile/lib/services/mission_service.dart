// services/mission_service.dart
import 'package:flutter/material.dart';
import '../models/mission.dart';
import 'api_service.dart';

/// Récupère toutes les missions disponibles
Future<List<Mission>> fetchMissions() async {
  try {
    final response = await Api.get('/mission');
    
    debugPrint('Type de réponse: ${response.runtimeType}');
    
    List<dynamic> missionsData;
    
    if (response is List) {
      missionsData = response;
    } else if (response is Map) {
      if (response.containsKey('data')) {
        missionsData = response['data'] as List<dynamic>;
      } else if (response.containsKey('missions')) {
        missionsData = response['missions'] as List<dynamic>;
      } else {
        // Si aucune structure reconnue, on tente d'utiliser les valeurs
        final values = response.values.where((v) => v is List || v is Map).toList();
        if (values.isNotEmpty && values.first is List) {
          missionsData = values.first as List<dynamic>;
        } else {
          missionsData = values.where((v) => v is Map).toList();
        }
      }
    } else {
      throw Exception("Format de réponse incompatible: $response");
    }
    
    // Vérification des données avant conversion
    debugPrint('Nombre de missions trouvées: ${missionsData.length}');
    
    // Traitement sécurisé des missions
    List<Mission> missions = [];
    for (var data in missionsData) {
      try {
        if (data is Map<String, dynamic>) {
          missions.add(Mission.fromMap(data));
        } else if (data is Map) {
          // Conversion Map en Map<String, dynamic>
          Map<String, dynamic> convertedMap = {};
          data.forEach((key, value) {
            convertedMap[key.toString()] = value;
          });
          missions.add(Mission.fromMap(convertedMap));
        }
      } catch (e) {
        debugPrint('Erreur lors de la conversion d\'une mission: $e');
        debugPrint('Données problématiques: $data');
      }
    }
    
    return missions;
  } catch (e) {
    debugPrint('Erreur lors de la récupération des missions: $e');
    rethrow;
  }
}

/// Récupère une mission spécifique par son ID
Future<Mission> getMission(String id) async {
  try {
    final response = await Api.get('/mission/$id');
    return Mission.fromMap(response is Map<String, dynamic> 
        ? response 
        : Map<String, dynamic>.from(response as Map));
  } catch (e) {
    debugPrint('Erreur lors de la récupération de la mission $id: $e');
    rethrow;
  }
}

/// Crée une nouvelle mission
Future<Mission> createMission(Map<String, dynamic> missionData) async {
  try {
    final response = await Api.post('/mission', missionData);
    return Mission.fromMap(response is Map<String, dynamic> 
        ? response 
        : Map<String, dynamic>.from(response as Map));
  } catch (e) {
    debugPrint('Erreur lors de la création de la mission: $e');
    rethrow;
  }
}

/// Met à jour une mission existante
Future<Mission> updateMission(String id, Map<String, dynamic> missionData) async {
  try {
    final response = await Api.put('/mission/$id', missionData);
    return Mission.fromMap(response is Map<String, dynamic> 
        ? response 
        : Map<String, dynamic>.from(response as Map));
  } catch (e) {
    debugPrint('Erreur lors de la mise à jour de la mission $id: $e');
    rethrow;
  }
}

/// Supprime une mission
Future<void> deleteMission(String id) async {
  try {
    await Api.delete('/mission/$id');
  } catch (e) {
    debugPrint('Erreur lors de la suppression de la mission $id: $e');
    rethrow;
  }
}