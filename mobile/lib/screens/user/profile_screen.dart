// screens/user/profil_screen.dart
import 'package:flutter/material.dart';
import '../../widgets/navbar.dart';
import '../../widgets/sidebar.dart';
import '../../models/client.dart';
import '../../services/client_service.dart';
import 'dart:convert';

class ProfilScreen extends StatefulWidget {
  const ProfilScreen({Key? key}) : super(key: key);

  @override
  State<ProfilScreen> createState() => _ProfilScreenState();
}

class _ProfilScreenState extends State<ProfilScreen> {
  bool isDarkMode = false;
  bool isLoading = true;
  String? error;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  
  // Profile data state
  ProfileModel profileData = ProfileModel(
    name: "",
    email: "",
    phone: "",
    description: "",
    rating: 0,
    status: "",
    role: "",
    clientId: "",
  );
  
  // Temporary data for editing
  late ProfileModel tempData;
  
  // Editing sections state
  Map<String, bool> editingSections = {
    'profile': false,
    'personal': false,
    'description': false,
  };

  @override
  void initState() {
    super.initState();
    tempData = profileData;
    fetchClientData();
  }

  // Fetch client data from API
  Future<void> fetchClientData() async {
    try {
      setState(() {
        isLoading = true;
      });
      
      // Mock client ID (in a real app, you might get this from a route parameter or storage)
      String clientId = '682bb6d5799bb3e67ea05392';
      
      // Fetch data from API
      final data = await getClient(clientId);
      
      // Update profile data
      setState(() {
        profileData = data;
        tempData = ProfileModel.copy(data);
        error = null;
      });
    } catch (err) {
      print("Error loading client data: $err");
      setState(() {
        error = "Impossible de charger les données du profil. Veuillez réessayer plus tard.";
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  // Start editing a section
  void startEditing(String section) {
    setState(() {
      tempData = ProfileModel.copy(profileData);
      editingSections[section] = true;
    });
  }

  // Cancel editing
  void cancelEditing(String section) {
    setState(() {
      tempData = ProfileModel.copy(profileData);
      editingSections[section] = false;
    });
  }

  // Save changes to a section
  Future<void> saveChanges(String section) async {
    try {
      setState(() {
        isLoading = true;
      });
      
      // Create object with only the modified data
      Map<String, dynamic> updatedData = {};
      
      // Update appropriate fields based on section
      if (section == 'profile') {
        updatedData['name'] = tempData.name;
      } else if (section == 'personal') {
        updatedData['name'] = tempData.name;
        updatedData['email'] = tempData.email;
        updatedData['phone'] = tempData.phone;
      } else if (section == 'description') {
        updatedData['description'] = tempData.description;
      }
      
      print("Data to update: $updatedData");
      
      // Send changes to API
      await updateClient(profileData.clientId, updatedData);
      
      // Update local state with new data
      setState(() {
        if (section == 'profile') {
          profileData.name = tempData.name;
        } else if (section == 'personal') {
          profileData.name = tempData.name;
          profileData.email = tempData.email;
          profileData.phone = tempData.phone;
        } else if (section == 'description') {
          profileData.description = tempData.description;
        }
        
        editingSections[section] = false;
      });
      
      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Modifications enregistrées avec succès!"),
          backgroundColor: Colors.green,
        ),
      );
    } catch (err) {
      print("Error saving changes: $err");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text("Erreur lors de la sauvegarde des modifications. Veuillez réessayer."),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  // Handle changes in form fields
  void handleChange(String name, String value) {
    setState(() {
      switch (name) {
        case 'name':
          tempData.name = value;
          break;
        case 'email':
          tempData.email = value;
          break;
        case 'phone':
          tempData.phone = value;
          break;
        case 'description':
          tempData.description = value;
          break;
      }
    });
  }

  void toggleDarkMode() {
    setState(() {
      isDarkMode = !isDarkMode;
    });
  }

  void toggleMenu() {
    if (scaffoldKey.currentState?.isDrawerOpen ?? false) {
      scaffoldKey.currentState?.closeDrawer();
    } else {
      scaffoldKey.currentState?.openDrawer();
    }
  }

  @override
  Widget build(BuildContext context) {
    // Show loading indicator while loading
    if (isLoading) {
      return Scaffold(
        backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const CircularProgressIndicator(),
              const SizedBox(height: 16),
              Text(
                "Chargement des données du profil...",
                style: TextStyle(
                  color: isDarkMode ? Colors.white : Colors.black,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Show error message if loading failed
    if (error != null) {
      return Scaffold(
        backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
        body: Center(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.red[500],
              borderRadius: BorderRadius.circular(8),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 10,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  "Erreur",
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  error!,
                  style: const TextStyle(color: Colors.white),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: fetchClientData,
                  child: const Text("Réessayer"),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red[700],
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      key: scaffoldKey,
      backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
      drawer: Sidebar(
        isDarkMode: isDarkMode,
        currentRoute: '/user/profil',
      ),
      body: SafeArea(
        child: Column(
          children: [
            Navbar(
              isDarkMode: isDarkMode,
              toggleDarkMode: toggleDarkMode,
              toggleMenu: toggleMenu,
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Main Profile Section
                    _buildMainProfile(),
                    
                    // Account Status Section
                    _buildAccountStatus(),
                    
                    // Personal Information Section
                    _buildPersonalInfo(),
                    
                    // Description Section
                    _buildDescription(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Build stars for rating display
  List<Widget> _buildRatingStars() {
    List<Widget> stars = [];
    int maxStars = 5;
    
    for (int i = 1; i <= maxStars; i++) {
      stars.add(
        Icon(
          Icons.star,
          size: 16,
          color: i <= profileData.rating 
            ? Colors.amber 
            : Colors.grey[300],
        ),
      );
    }
    
    return stars;
  }

  // Main Profile Widget
  Widget _buildMainProfile() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF1B2559) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0x4242425A),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Profile Image
              Container(
                width: 80,
                height: 80,
                margin: const EdgeInsets.only(right: 16),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Colors.blue,
                    width: 2,
                  ),
                  image: const DecorationImage(
                    image: AssetImage('assets/img/profile/banner.png'),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              
              // Profile Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    editingSections['profile']!
                        ? TextFormField(
                            initialValue: tempData.name,
                            onChanged: (value) => handleChange('name', value),
                            decoration: InputDecoration(
                              hintText: "Name",
                              filled: true,
                              fillColor: isDarkMode ? Colors.grey[800] : Colors.grey[200],
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8),
                                borderSide: BorderSide.none,
                              ),
                            ),
                            style: TextStyle(
                              color: isDarkMode ? Colors.white : Colors.black,
                            ),
                          )
                        : Row(
                            children: [
                              Text(
                                profileData.name,
                                style: TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: isDarkMode ? Colors.white : Colors.black,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Row(children: _buildRatingStars()),
                            ],
                          ),
                  ],
                ),
              ),
              
              // Edit/Save Buttons
              Column(
                children: [
                  if (!editingSections['profile']!)
                    TextButton.icon(
                      onPressed: () => startEditing('profile'),
                      icon: const Icon(Icons.edit, size: 16),
                      label: const Text("Edit"),
                      style: TextButton.styleFrom(
                        foregroundColor: isDarkMode ? Colors.white : Colors.black87,
                        side: BorderSide(
                          color: isDarkMode ? Colors.grey[600]! : Colors.grey[400]!,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    )
                  else
                    Row(
                      children: [
                        ElevatedButton(
                          onPressed: () => saveChanges('profile'),
                          child: const Text("Save"),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green[600],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        TextButton(
                          onPressed: () => cancelEditing('profile'),
                          child: const Text("Cancel"),
                          style: TextButton.styleFrom(
                            foregroundColor: isDarkMode ? Colors.white : Colors.black,
                            side: BorderSide(
                              color: isDarkMode ? Colors.grey[600]! : Colors.grey[400]!,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        ),
                      ],
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Account Status Widget
  Widget _buildAccountStatus() {
    Color statusColor;
    String statusText;
    
    switch (profileData.status) {
      case 'ACTIVE':
        statusColor = Colors.green;
        statusText = 'Compte actif';
        break;
      case 'SUSPENDED':
        statusColor = Colors.red;
        statusText = 'Compte suspendu';
        break;
      case 'PENDING':
        statusColor = Colors.amber;
        statusText = 'Compte en attente de validation';
        break;
      default:
        statusColor = Colors.grey;
        statusText = profileData.status;
    }
    
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF1B2559) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0x4242425A),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            "Statut du compte",
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isDarkMode ? Colors.white : Colors.black,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                width: 12,
                height: 12,
                margin: const EdgeInsets.only(right: 8),
                decoration: BoxDecoration(
                  color: statusColor,
                  shape: BoxShape.circle,
                ),
              ),
              Text(
                statusText,
                style: TextStyle(
                  color: isDarkMode ? Colors.white : Colors.black,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Personal Information Widget
  Widget _buildPersonalInfo() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF1B2559) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0x4242425A),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Personal Information",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDarkMode ? Colors.white : Colors.black,
                ),
              ),
              
              // Edit/Save Buttons
              if (!editingSections['personal']!)
                TextButton.icon(
                  onPressed: () => startEditing('personal'),
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text("Edit"),
                  style: TextButton.styleFrom(
                    foregroundColor: isDarkMode ? Colors.white : Colors.black87,
                    side: BorderSide(
                      color: isDarkMode ? Colors.grey[600]! : Colors.grey[400]!,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                )
              else
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: () => saveChanges('personal'),
                      child: const Text("Save"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[600],
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => cancelEditing('personal'),
                      child: const Text("Cancel"),
                      style: TextButton.styleFrom(
                        foregroundColor: isDarkMode ? Colors.white : Colors.black,
                        side: BorderSide(
                          color: isDarkMode ? Colors.grey[600]! : Colors.grey[400]!,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Personal Info Fields
          if (!editingSections['personal']!)
            // Display Mode
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width > 600 
                      ? (MediaQuery.of(context).size.width - 80) / 2 
                      : MediaQuery.of(context).size.width - 64,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Name",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        profileData.name,
                        style: TextStyle(
                          color: isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width > 600 
                      ? (MediaQuery.of(context).size.width - 80) / 2 
                      : MediaQuery.of(context).size.width - 64,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Email address",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        profileData.email,
                        style: TextStyle(
                          color: isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width > 600 
                      ? (MediaQuery.of(context).size.width - 80) / 2 
                      : MediaQuery.of(context).size.width - 64,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Phone",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        profileData.phone,
                        style: TextStyle(
                          color: isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            )
          else
            // Edit Mode
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                SizedBox(
                  width: MediaQuery.of(context).size.width > 600 
                      ? (MediaQuery.of(context).size.width - 80) / 2 
                      : MediaQuery.of(context).size.width - 64,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Name",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: tempData.name,
                        onChanged: (value) => handleChange('name', value),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: isDarkMode ? Colors.grey[800] : Colors.grey[200],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: TextStyle(
                          color: isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width > 600 
                      ? (MediaQuery.of(context).size.width - 80) / 2 
                      : MediaQuery.of(context).size.width - 64,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Email address",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: tempData.email,
                        onChanged: (value) => handleChange('email', value),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: isDarkMode ? Colors.grey[800] : Colors.grey[200],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: TextStyle(
                          color: isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(
                  width: MediaQuery.of(context).size.width > 600 
                      ? (MediaQuery.of(context).size.width - 80) / 2 
                      : MediaQuery.of(context).size.width - 64,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        "Phone",
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[400],
                        ),
                      ),
                      const SizedBox(height: 4),
                      TextFormField(
                        initialValue: tempData.phone,
                        onChanged: (value) => handleChange('phone', value),
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: isDarkMode ? Colors.grey[800] : Colors.grey[200],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: TextStyle(
                          color: isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  // Description Widget
  Widget _buildDescription() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF1B2559) : Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: const Color(0x4242425A),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Description",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDarkMode ? Colors.white : Colors.black,
                ),
              ),
              
              // Edit/Save Buttons
              if (!editingSections['description']!)
                TextButton.icon(
                  onPressed: () => startEditing('description'),
                  icon: const Icon(Icons.edit, size: 16),
                  label: const Text("Edit"),
                  style: TextButton.styleFrom(
                    foregroundColor: isDarkMode ? Colors.white : Colors.black87,
                    side: BorderSide(
                      color: isDarkMode ? Colors.grey[600]! : Colors.grey[400]!,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                )
              else
                Row(
                  children: [
                    ElevatedButton(
                      onPressed: () => saveChanges('description'),
                      child: const Text("Save"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[600],
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    TextButton(
                      onPressed: () => cancelEditing('description'),
                      child: const Text("Cancel"),
                      style: TextButton.styleFrom(
                        foregroundColor: isDarkMode ? Colors.white : Colors.black,
                        side: BorderSide(
                          color: isDarkMode ? Colors.grey[600]! : Colors.grey[400]!,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Description Content
          if (!editingSections['description']!)
            Text(
              profileData.description,
              style: TextStyle(
                color: isDarkMode ? Colors.grey[300] : Colors.grey[600],
              ),
            )
          else
            TextFormField(
              initialValue: tempData.description,
              onChanged: (value) => handleChange('description', value),
              maxLines: 5,
              decoration: InputDecoration(
                hintText: "Décrivez votre expérience, vos compétences et votre expertise...",
                filled: true,
                fillColor: isDarkMode ? Colors.grey[800] : Colors.grey[200],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: BorderSide.none,
                ),
              ),
              style: TextStyle(
                color: isDarkMode ? Colors.white : Colors.black,
              ),
            ),
        ],
      ),
    );
  }
}