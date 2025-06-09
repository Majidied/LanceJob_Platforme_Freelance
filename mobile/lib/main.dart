// main.dart (updated)
import 'package:flutter/material.dart';
import 'routes/routes.dart';
import 'screens/main_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LanceJob',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        fontFamily: 'Roboto',
      ),
      darkTheme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF0B1437),
        primaryColor: Colors.blue,
        cardColor: const Color(0xFF0F1849),
      ),
      initialRoute: '/user/home', // Route initiale
      routes: getAppRoutes(),
      onGenerateRoute: (settings) {
        // Gestion des routes non définies
        return MaterialPageRoute(
          builder: (context) => const MainScreen(), 
        );
      },
    );
  }
}