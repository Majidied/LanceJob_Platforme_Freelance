// screens/user/add_offer_screen.dart
import 'package:flutter/material.dart';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:intl/intl.dart';
import '../../widgets/navbar.dart';
import '../../widgets/sidebar.dart';
import '../../models/mission.dart';
import '../../services/mission_service.dart';

class AddOfferScreen extends StatefulWidget {
  const AddOfferScreen({Key? key}) : super(key: key);

  @override
  State<AddOfferScreen> createState() => _AddOfferScreenState();
}

class _AddOfferScreenState extends State<AddOfferScreen> {
  bool isDarkMode = false;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  int currentStep = 1;
  final int totalSteps = 4;
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _budgetController = TextEditingController();
  final TextEditingController _additionalRequirementsController = TextEditingController();
  final TextEditingController _preferredQualificationsController = TextEditingController();
  final TextEditingController _newSkillController = TextEditingController();
  DateTime? _deadline;
  
  // Form data
  Map<String, dynamic> formData = {
    'title': '',
    'description': '',
    'tags': <String>[],
    'type': 'fixe',
    'budget': '',
    'deadline': '',
    'experience': 'intermediaire',
    'client': '682bb996ee9d07f9a96d0aef',
    'status': 'published',
    'attachments': <Map<String, dynamic>>[],
    'applications': <dynamic>[],
    'assignedTo': null,
  };
  
  // File attachment
  String? fileName;
  String? filePath;
  File? selectedFile;

  // Suggested skills
  final List<String> suggestedSkills = [
    'JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Python', 
    'WordPress', 'Figma', 'Adobe Photoshop', 'Copywriting',
    'SEO', 'Social Media', 'Video Production'
  ];

  @override
  void initState() {
    super.initState();
    // Set up listeners for text controllers
    _titleController.addListener(() {
      formData['title'] = _titleController.text;
    });
    _descriptionController.addListener(() {
      formData['description'] = _descriptionController.text;
    });
    _budgetController.addListener(() {
      formData['budget'] = _budgetController.text;
    });
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _budgetController.dispose();
    _additionalRequirementsController.dispose();
    _preferredQualificationsController.dispose();
    _newSkillController.dispose();
    super.dispose();
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

  void nextStep() {
    if (currentStep < totalSteps) {
      setState(() {
        currentStep++;
      });
    }
  }

  void prevStep() {
    if (currentStep > 1) {
      setState(() {
        currentStep--;
      });
    }
  }

  void handleExpertiseChange(String level) {
    setState(() {
      formData['experience'] = level;
    });
  }

  void addSkill(String skill) {
    if (skill.isNotEmpty && !(formData['tags'] as List<String>).contains(skill)) {
      setState(() {
        formData['tags'] = [...(formData['tags'] as List<String>), skill];
        _newSkillController.clear();
      });
    }
  }

  void removeSkill(String skill) {
    setState(() {
      formData['tags'] = (formData['tags'] as List<String>).where((item) => item != skill).toList();
    });
  }

  Future<void> pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    );

    if (result != null) {
      File file = File(result.files.single.path!);
      setState(() {
        selectedFile = file;
        fileName = result.files.single.name;
        filePath = result.files.single.path;
        
        formData['attachments'] = [
          {
            'fileName': fileName,
            'filePath': filePath,
          }
        ];
      });
    }
  }

Future<void> handleSubmit() async {
    try {
      // Show loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(const Color(0xFF417b9a)),
            ),
          );
        },
      );
      
      // Format date properly if needed
      if (_deadline != null && formData['deadline'] != null) {
        formData['deadline'] = DateFormat('yyyy-MM-dd').format(_deadline!);
      }
      
      // Call the API to create the mission
      final Mission createdMission = await createMission(formData);
      // Close loading dialog
      Navigator.of(context).pop();
      
      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Offre ajoutée avec succès !'),
          backgroundColor: Colors.green,
        )
      );
      
      // Navigate to missions list or home
      Navigator.pushReplacementNamed(context, '/user/missions');
    } catch (error) {
      // Close loading dialog if open
      if (Navigator.of(context).canPop()) {
        Navigator.of(context).pop();
      }
      
      // Show error message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la création de la mission: ${error.toString()}'),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 5),
        )
      );
      
      debugPrint('Erreur détaillée: $error');
    }
  }

  Widget buildStepContent() {
    switch (currentStep) {
      case 1:
        return buildStep1();
      case 2:
        return buildStep2();
      case 3:
        return buildStep3();
      case 4:
        return buildStep4();
      default:
        return Container();
    }
  }

  Widget buildStep1() {
    Color textColor = isDarkMode ? Colors.white : Colors.black87;
    Color labelColor = isDarkMode ? Colors.white70 : Colors.black54;
    Color cardColor = isDarkMode ? const Color(0xFF1E2746) : Colors.white;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Détails de l\'offre d\'emploi',
            style: TextStyle(
              fontSize: 20, 
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 24),
          
          // Job Title
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'Titre de l\'offre ',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: labelColor,
                        ),
                      ),
                      const TextSpan(
                        text: '*',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _titleController,
                  decoration: InputDecoration(
                    hintText: 'Ex: Développeur Web Front-end pour projet e-commerce',
                    filled: true,
                    fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: const Color(0xFF417b9a),
                        width: 2,
                      ),
                    ),
                  ),
                  style: TextStyle(color: textColor),
                ),
              ],
            ),
          ),
          
          // Job Description
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'Description du projet ',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: labelColor,
                        ),
                      ),
                      const TextSpan(
                        text: '*',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _descriptionController,
                  maxLines: 6,
                  decoration: InputDecoration(
                    hintText: 'Décrivez le projet, les responsabilités et les livrables attendus...',
                    filled: true,
                    fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: const Color(0xFF417b9a),
                        width: 2,
                      ),
                    ),
                  ),
                  style: TextStyle(color: textColor),
                ),
              ],
            ),
          ),
          
          // Skills Required
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'Compétences requises ',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: labelColor,
                        ),
                      ),
                      const TextSpan(
                        text: '*',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                
                // Selected skills
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (String skill in (formData['tags'] as List<String>))
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[100],
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              skill,
                              style: TextStyle(
                                fontSize: 13,
                                color: textColor,
                              ),
                            ),
                            const SizedBox(width: 4),
                            InkWell(
                              onTap: () => removeSkill(skill),
                              child: Icon(
                                Icons.close,
                                size: 16,
                                color: isDarkMode ? Colors.white70 : Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Add skill input
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _newSkillController,
                        decoration: InputDecoration(
                          hintText: 'Ajouter une compétence',
                          filled: true,
                          fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                          border: OutlineInputBorder(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(8),
                              bottomLeft: Radius.circular(8),
                            ),
                            borderSide: BorderSide(
                              color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(8),
                              bottomLeft: Radius.circular(8),
                            ),
                            borderSide: BorderSide(
                              color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(8),
                              bottomLeft: Radius.circular(8),
                            ),
                            borderSide: BorderSide(
                              color: const Color(0xFF417b9a),
                              width: 2,
                            ),
                          ),
                        ),
                        style: TextStyle(color: textColor),
                        onFieldSubmitted: (value) {
                          if (value.isNotEmpty) {
                            addSkill(value);
                          }
                        },
                      ),
                    ),
                    InkWell(
                      onTap: () {
                        if (_newSkillController.text.isNotEmpty) {
                          addSkill(_newSkillController.text);
                        }
                      },
                      child: Container(
                        height: 59, // Match TextFormField height
                        decoration: const BoxDecoration(
                          color: Color(0xFF417b9a),
                          borderRadius: BorderRadius.only(
                            topRight: Radius.circular(8),
                            bottomRight: Radius.circular(8),
                          ),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: const Icon(
                          Icons.add,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // Suggested skills
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Compétences suggérées',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: labelColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: suggestedSkills.map((skill) => GestureDetector(
                        onTap: () => addSkill(skill),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[100],
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            '+ $skill',
                            style: TextStyle(
                              fontSize: 13,
                              color: textColor,
                            ),
                          ),
                        ),
                      )).toList(),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildStep2() {
    Color textColor = isDarkMode ? Colors.white : Colors.black87;
    Color labelColor = isDarkMode ? Colors.white70 : Colors.black54;
    Color cardColor = isDarkMode ? const Color(0xFF1E2746) : Colors.white;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Type et budget du projet',
            style: TextStyle(
              fontSize: 20, 
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 24),
          
          // Project Type
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Type de projet',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                    ),
                  ),
                  child: DropdownButtonFormField<String>(
                    value: formData['type'] as String,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                      border: InputBorder.none,
                      filled: true,
                      fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    ),
                    dropdownColor: isDarkMode ? const Color(0xFF2D3748) : Colors.white,
                    style: TextStyle(color: textColor),
                    items: const [
                      DropdownMenuItem(
                        value: 'fixe',
                        child: Text('Prix fixe'),
                      ),
                      DropdownMenuItem(
                        value: 'Taux horaire',
                        child: Text('Taux horaire'),
                      ),
                      DropdownMenuItem(
                        value: 'long terme',
                        child: Text('Long terme'),
                      ),
                    ],
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          formData['type'] = value;
                        });
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
          
          // Budget
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'Budget (MAD) ',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: labelColor,
                        ),
                      ),
                      const TextSpan(
                        text: '*',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _budgetController,
                  keyboardType: TextInputType.number,
                  decoration: InputDecoration(
                    hintText: 'Ex: 5000',
                    filled: true,
                    fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: const Color(0xFF417b9a),
                        width: 2,
                      ),
                    ),
                    prefixIcon: Icon(
                      Icons.attach_money,
                      color: isDarkMode ? Colors.white70 : Colors.grey[600],
                    ),
                  ),
                  style: TextStyle(color: textColor),
                ),
              ],
            ),
          ),
          
          // Deadline
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                RichText(
                  text: TextSpan(
                    children: [
                      TextSpan(
                        text: 'Durée estimée (jours) ',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: labelColor,
                        ),
                      ),
                      const TextSpan(
                        text: '*',
                        style: TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                InkWell(
                  onTap: () async {
                    final DateTime? picked = await showDatePicker(
                      context: context,
                      initialDate: _deadline ?? DateTime.now(),
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                      builder: (context, child) {
                        return Theme(
                          data: ThemeData.light().copyWith(
                            colorScheme: const ColorScheme.light(
                              primary: Color(0xFF417b9a),
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (picked != null) {
                      setState(() {
                        _deadline = picked;
                        formData['deadline'] = DateFormat('yyyy-MM-dd').format(picked);
                      });
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                      color: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.calendar_today,
                          color: isDarkMode ? Colors.white70 : Colors.grey[600],
                          size: 20,
                        ),
                        const SizedBox(width: 12),
                        Text(
                          _deadline != null 
                              ? DateFormat('dd/MM/yyyy').format(_deadline!)
                              : 'Sélectionner une date',
                          style: TextStyle(
                            color: _deadline != null ? textColor : Colors.grey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          // Expertise Level
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Niveau d\'expertise requis',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                    ),
                    color: isDarkMode ? const Color(0xFF2D3748) : Colors.white,
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => handleExpertiseChange('debutant'),
                          child: Container(
                            alignment: Alignment.center,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: formData['experience'] == 'debutant'
                                  ? const Color(0xFF417b9a)
                                  : Colors.transparent,
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(7),
                                bottomLeft: Radius.circular(7),
                              ),
                            ),
                            child: Text(
                              'Débutant',
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                color: formData['experience'] == 'debutant'
                                    ? Colors.white
                                    : textColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: InkWell(
                          onTap: () => handleExpertiseChange('intermediaire'),
                          child: Container(
                            alignment: Alignment.center,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            color: formData['experience'] == 'intermediaire'
                                ? const Color(0xFF417b9a)
                                : Colors.transparent,
                            child: Text(
                              'Intermédiaire',
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                color: formData['experience'] == 'intermediaire'
                                    ? Colors.white
                                    : textColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: InkWell(
                          onTap: () => handleExpertiseChange('expert'),
                          child: Container(
                            alignment: Alignment.center,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: formData['experience'] == 'expert'
                                  ? const Color(0xFF417b9a)
                                  : Colors.transparent,
                              borderRadius: const BorderRadius.only(
                                topRight: Radius.circular(7),
                                bottomRight: Radius.circular(7),
                              ),
                            ),
                            child: Text(
                              'Expert',
                              style: TextStyle(
                                fontWeight: FontWeight.w500,
                                color: formData['experience'] == 'expert'
                                    ? Colors.white
                                    : textColor,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildStep3() {
    Color textColor = isDarkMode ? Colors.white : Colors.black87;
    Color labelColor = isDarkMode ? Colors.white70 : Colors.black54;
    Color cardColor = isDarkMode ? const Color(0xFF1E2746) : Colors.white;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Exigences spécifiques',
            style: TextStyle(
              fontSize: 20, 
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 24),
          
          // Additional Requirements
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Exigences supplémentaires',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _additionalRequirementsController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Précisez les exigences spécifiques pour cette offre...',
                    filled: true,
                    fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: const Color(0xFF417b9a),
                        width: 2,
                      ),
                    ),
                  ),
                  style: TextStyle(color: textColor),
                ),
              ],
            ),
          ),
          
          // Preferred Qualifications
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Qualifications préférées',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                TextFormField(
                  controller: _preferredQualificationsController,
                  maxLines: 4,
                  decoration: InputDecoration(
                    hintText: 'Décrivez les qualifications que vous préférez voir chez les candidats...',
                    filled: true,
                    fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide(
                        color: const Color(0xFF417b9a),
                        width: 2,
                      ),
                    ),
                  ),
                  style: TextStyle(color: textColor),
                ),
              ],
            ),
          ),
          
          // File Upload
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Pièces jointes (optionnel)',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                      width: 2,
                    ),
                    // For dashed border, use a package like 'dotted_border'
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.cloud_upload_outlined,
                        size: 48,
                        color: isDarkMode ? Colors.white70 : Colors.grey[400],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Glissez-déposez vos fichiers ici ou',
                        style: TextStyle(
                          fontSize: 14,
                          color: isDarkMode ? Colors.white70 : Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: pickFile,
                        child: Text(
                          'Parcourir les fichiers',
                          style: TextStyle(
                            color: const Color(0xFF417b9a),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Formats acceptés: PDF, DOC, DOCX, JPG, PNG (max 5 MB)',
                        style: TextStyle(
                          fontSize: 12,
                          color: isDarkMode ? Colors.white60 : Colors.grey[500],
                        ),
                      ),
                      if (fileName != null) ...[
                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[100],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Nom du fichier: $fileName',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: textColor,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Chemin (temporaire): $filePath',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: textColor,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget buildStep4() {
    Color textColor = isDarkMode ? Colors.white : Colors.black87;
    Color labelColor = isDarkMode ? Colors.white70 : Colors.black54;
    Color cardColor = isDarkMode ? const Color(0xFF1E2746) : Colors.white;
    Color bgColor = isDarkMode ? const Color(0xFF2D3748) : Colors.grey[100]!;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Révision et publication',
            style: TextStyle(
              fontSize: 20, 
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 24),
          
          // Summary
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Résumé de l\'offre',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Title & Category
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Titre',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: labelColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formData['title'] != '' ? formData['title'] : 'Non spécifié',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Catégorie',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: labelColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formData['category'] != null && formData['category'] != '' 
                                ? formData['category'] 
                                : 'Non spécifiée',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Type & Budget
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Type de projet',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: labelColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formData['type'] == 'fixe' 
                                ? 'Prix fixe' 
                                : formData['type'] == 'Taux horaire'
                                    ? 'Taux horaire'
                                    : 'Long terme',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Budget',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: labelColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formData['budget'] != '' 
                                ? '${formData['budget']} MAD' 
                                : 'Non spécifié',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Duration & Expertise
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Durée',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: labelColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formData['deadline'] != '' 
                                ? formData['deadline'] 
                                : 'Non spécifiée',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Niveau d\'expertise',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: labelColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            formData['experience'] == 'debutant'
                                ? 'Débutant'
                                : formData['experience'] == 'intermediaire'
                                    ? 'Intermédiaire'
                                    : 'Expert',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Skills
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Compétences requises',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: labelColor,
                      ),
                    ),
                    const SizedBox(height: 8),
                    (formData['tags'] as List<String>).isNotEmpty
                        ? Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              for (String skill in (formData['tags'] as List<String>))
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: isDarkMode ? const Color(0xFF1E2746) : Colors.grey[200],
                                    borderRadius: BorderRadius.circular(16),
                                  ),
                                  child: Text(
                                    skill,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: textColor,
                                    ),
                                  ),
                                ),
                            ],
                          )
                        : Text(
                            'Aucune compétence spécifiée',
                            style: TextStyle(
                              color: textColor,
                            ),
                          ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Visibility
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Visibilité de l\'offre',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                    ),
                  ),
                  child: DropdownButtonFormField<String>(
                    value: 'Public',
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                      border: InputBorder.none,
                      filled: true,
                      fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    ),
                    dropdownColor: isDarkMode ? const Color(0xFF2D3748) : Colors.white,
                    style: TextStyle(color: textColor),
                    items: const [
                      DropdownMenuItem(
                        value: 'Public',
                        child: Text('Publique (visible par tous)'),
                      ),
                      DropdownMenuItem(
                        value: 'Private',
                        child: Text('Privée (sur invitation uniquement)'),
                      ),
                    ],
                    onChanged: (value) {
                      // Handle visibility change
                    },
                  ),
                ),
              ],
            ),
          ),
          
          // Urgency
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Urgence',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: labelColor,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isDarkMode ? Colors.grey[700]! : Colors.grey[300]!,
                    ),
                  ),
                  child: DropdownButtonFormField<String>(
                    value: 'Normal',
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
                      border: InputBorder.none,
                      filled: true,
                      fillColor: isDarkMode ? const Color(0xFF2D3748) : Colors.grey[50],
                    ),
                    dropdownColor: isDarkMode ? const Color(0xFF2D3748) : Colors.white,
                    style: TextStyle(color: textColor),
                    items: const [
                      DropdownMenuItem(
                        value: 'Low',
                        child: Text('Basse'),
                      ),
                      DropdownMenuItem(
                        value: 'Normal',
                        child: Text('Normale'),
                      ),
                      DropdownMenuItem(
                        value: 'High',
                        child: Text('Haute'),
                      ),
                      DropdownMenuItem(
                        value: 'Urgent',
                        child: Text('Urgente'),
                      ),
                    ],
                    onChanged: (value) {
                      // Handle urgency change
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  double get progressPercentage => ((currentStep - 1) / (totalSteps - 1)) * 100;

  @override
  Widget build(BuildContext context) {
    Color textColor = isDarkMode ? Colors.white : Colors.black87;
    
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
      drawer: Sidebar(
        isDarkMode: isDarkMode,
        currentRoute: '/user/add-offre',
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
              child: Container(
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDarkMode ? const Color(0xFF1E2746) : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      spreadRadius: 0,
                      blurRadius: 10,
                      offset: const Offset(0, 5),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Text(
                        'Ajouter une offre',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: textColor,
                        ),
                      ),
                    ),
                    Expanded(child: buildStepContent()),
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          // Progress bar
                          Container(
                            height: 6,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: isDarkMode ? Colors.grey[800] : Colors.grey[200],
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: progressPercentage / 100,
                              child: Container(
                                decoration: BoxDecoration(
                                  color: const Color(0xFF417b9a),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Navigation buttons
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              TextButton(
                                onPressed: currentStep > 1 ? prevStep : null,
                                style: TextButton.styleFrom(
                                  foregroundColor: currentStep > 1 
                                      ? (isDarkMode ? Colors.white70 : Colors.grey[700]) 
                                      : Colors.grey[400],
                                ),
                                child: const Text('Retour'),
                              ),
                              Text(
                                '$currentStep/$totalSteps',
                                style: TextStyle(
                                  color: isDarkMode ? Colors.white70 : Colors.grey[600],
                                  fontSize: 14,
                                ),
                              ),
                              ElevatedButton(
                                onPressed: currentStep == totalSteps ? handleSubmit : nextStep,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF417b9a),
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: Text(
                                  currentStep == totalSteps ? 'Publier' : 'Suivant',
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}