// lib/services/api_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;

// Classe principale pour configurer le client HTTP
class Api {
  static const String baseUrl = "http://localhost:3000/api";
  
  // En-têtes communs pour les requêtes
  static final Map<String, String> _headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Pour les appareils physiques ou émulateurs, ajustez l'URL selon vos besoins
  // Émulateur Android: "http://10.0.2.2:3000/api"
  // Émulateur iOS: "http://localhost:3000/api"
  // Appareil physique: utilisez l'adresse IP de votre machine

  // Pour les cookies de session (équivalent à withCredentials: true)
  static http.Client client = http.Client();

  // Méthode GET générique
  static Future<dynamic> get(String endpoint) async {
    try {
      final response = await client.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: _headers,
      );
      
      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  // Méthode POST générique
  static Future<dynamic> post(String endpoint, dynamic data) async {
    try {
      final response = await client.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: _headers,
        body: jsonEncode(data),
      );
      
      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  // Méthode PUT générique
  static Future<dynamic> put(String endpoint, dynamic data) async {
    try {
      final response = await client.put(
        Uri.parse('$baseUrl$endpoint'),
        headers: _headers,
        body: jsonEncode(data),
      );
      
      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  // Méthode DELETE générique
  static Future<dynamic> delete(String endpoint) async {
    try {
      final response = await client.delete(
        Uri.parse('$baseUrl$endpoint'),
        headers: _headers,
      );
      
      return _handleResponse(response);
    } catch (e) {
      _handleError(e);
    }
  }

  // Traiter la réponse HTTP
  // Dans votre classe Api, modifiez la méthode _handleResponse
static dynamic _handleResponse(http.Response response) {
  if (response.statusCode >= 200 && response.statusCode < 300) {
    // Si la réponse est vide, retourne un objet vide
    if (response.body.isEmpty) return {};
    
    // Décode la réponse JSON
    final decodedResponse = jsonDecode(response.body);
    
    // Vous pouvez choisir d'extraire automatiquement 'data' si présent
    // si votre API suit toujours ce format
    if (decodedResponse is Map && decodedResponse.containsKey('data')) {
      return decodedResponse['data'];
    }
    
    return decodedResponse;
  } else {
    throw HttpException(
      statusCode: response.statusCode, 
      data: response.body
    );
  }
}

  // Gérer les erreurs
  static dynamic _handleError(dynamic error) {
    print('Erreur API: $error');
    throw error;
  }
}

// Classe personnalisée pour les erreurs HTTP
class HttpException implements Exception {
  final int statusCode;
  final dynamic data;

  HttpException({required this.statusCode, this.data});

  @override
  String toString() {
    return 'HttpException: Status code $statusCode, Data: $data';
  }
}
