// screens/user/my_offers_home_screen.dart
import 'package:flutter/material.dart';
import '../../widgets/navbar.dart';
import '../../widgets/sidebar.dart';
import '../../models/mission.dart';
import '../../models/freelancer.dart';
import '../../services/mission_service.dart';
import '../../services/freelancer_service.dart';

class MyOffersScreen extends StatefulWidget {
  const MyOffersScreen({Key? key}) : super(key: key);

  @override
  State<MyOffersScreen> createState() => _MyOffersScreenState();
}

class _MyOffersScreenState extends State<MyOffersScreen> {
  bool isDarkMode = false;
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  
  // Variables pour MyOffersScreen
  Mission? selectedOffer;
  List<Mission> offers = [];
  Map<String, Freelancer> freelancers = {};
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    loadOffers();
  }

  Future<void> loadOffers() async {
    setState(() {
      isLoading = true;
      error = null;
    });

    try {
      final response = await fetchMissions();
      final filteredOffers = response.where((mission) =>
          mission.client == '663c0a5b5f1c2f7b2d765456'
        ).toList();

      setState(() {
        offers = filteredOffers;
        isLoading = false;
      });
      debugPrint('Missions chargées: ${offers.length}');
    } catch (e) {
      debugPrint("Erreur lors du chargement des missions: $e");
      setState(() {
        error = "Impossible de charger les missions: $e";
        isLoading = false;
      });
    }
  }

  Future<void> fetchFreelancers() async {
    if (selectedOffer == null) return;

    Map<String, Freelancer> result = {};
    for (final applicant in selectedOffer!.applications) {
      final freelancerId = applicant.freelancerId;
      if (freelancerId.isNotEmpty && !result.containsKey(freelancerId)) {
        try {
          final data = await getFreelancer(freelancerId);
          setState(() {
            result[freelancerId] = data;
          });
          debugPrint('Freelancer data: $freelancerId loaded');
        } catch (e) {
          debugPrint('Erreur lors de la récupération du freelancer $freelancerId: $e');
        }
      }
    }

    setState(() {
      freelancers = result;
    });
  }

  void handleOfferClick(Mission offer) {
    setState(() {
      selectedOffer = offer;
    });
    fetchFreelancers();
  }

  void handleBackClick() {
    setState(() {
      selectedOffer = null;
      freelancers = {};
    });
  }

  // Fonctions pour la navbar et la sidebar
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
    return Scaffold(
      key: scaffoldKey,
      backgroundColor: isDarkMode ? const Color(0xFF0B1437) : const Color(0xFFF5F7F8),
      drawer: Sidebar(
        isDarkMode: isDarkMode,
        currentRoute: '/user/my-offers',
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Navbar fixe en haut
            Navbar(
              isDarkMode: isDarkMode,
              toggleDarkMode: toggleDarkMode,
              toggleMenu: toggleMenu,
            ),
            
            // Contenu principal
            Expanded(
              child: _buildContent(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              error!,
              style: TextStyle(
                color: isDarkMode ? Colors.white : Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: loadOffers,
              child: const Text('Réessayer'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E424C),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    return selectedOffer != null
        ? _buildOfferDetailsView()
        : _buildOffersListView();
  }

  Widget _buildOffersListView() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Titre et bouton d'ajout
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Mes Offres',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: isDarkMode ? Colors.white : const Color(0xFF2E424C),
                ),
              ),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, '/user/add-offre');
                },
                icon: const Icon(Icons.add),
                label: const Text('Ajouter une offre'),
                style: ElevatedButton.styleFrom(
                  foregroundColor: Colors.white,
                  backgroundColor: const Color(0xFF2E424C),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Liste des offres
          Expanded(
            child: offers.isEmpty
                ? Center(
                    child: Text(
                      'Aucune offre disponible',
                      style: TextStyle(
                        color: isDarkMode ? Colors.white : Colors.black87,
                      ),
                    ),
                  )
                : ListView.builder(
                    itemCount: offers.length,
                    itemBuilder: (context, index) {
                      final offer = offers[index];
                      return _buildOfferCard(offer);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildOfferCard(Mission offer) {
    return GestureDetector(
      onTap: () => handleOfferClick(offer),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: isDarkMode ? const Color(0xFF0F1849) : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0x5A424242)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 5,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status and timestamp
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          offer.status,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ),
                      Text(
                        _formatDate(offer.timestamps),
                        style: TextStyle(
                          fontSize: 12,
                          color: isDarkMode ? Colors.white70 : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Title
                  Text(
                    offer.title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? Colors.white : const Color(0xFF2E424C),
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Description
                  Text(
                    offer.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDarkMode ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Tags/Skills
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: offer.tags.map((skill) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isDarkMode ? Colors.white30 : Colors.grey.shade300,
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          skill,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDarkMode ? Colors.white : Colors.black87,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  
                  // Offer details
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    childAspectRatio: 5,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 2,
                    children: [
                      _buildDetailItem('Budget', offer.getBudgetString()),
                      _buildDetailItem('Type', offer.type),
                      _buildDetailItem('Duration', _formatDate(offer.deadline)),
                      _buildDetailItem('Experience', offer.experience),
                    ],
                  ),
                ],
              ),
            ),
            
            // Footer
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isDarkMode ? const Color(0xFF162052) : const Color(0x0E2E424C),
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(16),
                  bottomRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.people,
                        color: isDarkMode ? Colors.white : const Color(0xFF2E424C),
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${offer.applications.length} applicants',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: isDarkMode ? Colors.white : const Color(0xFF2E424C),
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: isDarkMode ? const Color(0xFF0F1849) : Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isDarkMode ? Colors.white24 : Colors.indigo.withOpacity(0.2),
                      ),
                    ),
                    child: Text(
                      'View Details',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isDarkMode ? Colors.white : const Color(0xFF2E424C),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: isDarkMode ? Colors.white60 : Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isDarkMode ? Colors.white : Colors.black87,
          ),
        ),
      ],
    );
  }

  Widget _buildOfferDetailsView() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Back button
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 16),
            child: GestureDetector(
              onTap: handleBackClick,
              child: Row(
                children: [
                  Icon(
                    Icons.chevron_left,
                    color: isDarkMode ? Colors.white : const Color(0xFF356E8C),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Back to My Offers',
                    style: TextStyle(
                      color: isDarkMode ? Colors.white : const Color(0xFF356E8C),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Offer details card
          Padding(
            padding: const EdgeInsets.all(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDarkMode ? const Color(0xFF0F1849) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 5,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    selectedOffer!.title,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: isDarkMode ? Colors.white : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    selectedOffer!.description,
                    style: TextStyle(
                      fontSize: 14,
                      color: isDarkMode ? Colors.white70 : Colors.black54,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Tags/Skills
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: selectedOffer!.tags.map((skill) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: isDarkMode ? Colors.white30 : Colors.grey.shade400,
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          skill,
                          style: TextStyle(
                            fontSize: 12,
                            color: isDarkMode ? Colors.white : Colors.black87,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 16),
                  
                  // Details grid
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isDarkMode ? const Color(0xFF162052) : Colors.grey.shade50,
                      border: Border.all(
                        color: isDarkMode ? Colors.white24 : const Color(0x5A424242),
                      ),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Expanded(child: _buildDetailWithIcon(Icons.attach_money, 'Budget', selectedOffer!.getBudgetString())),
                        Expanded(child: _buildDetailWithIcon(Icons.access_time, 'Duration', _formatDate(selectedOffer!.deadline))),
                        Expanded(child: _buildDetailWithIcon(Icons.work, 'Type', selectedOffer!.type)),
                        Expanded(child: _buildDetailWithIcon(Icons.people, 'Applications', '${selectedOffer!.applications.length}')),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Applicants section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Applicants (${selectedOffer!.applications.length})',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isDarkMode ? Colors.white : Colors.black87,
                  ),
                ),
                ElevatedButton.icon(
                  onPressed: () {
                    // Action to invite freelancers
                  },
                  icon: const Icon(Icons.person, size: 16),
                  label: const Text('Invite Freelancers'),
                  style: ElevatedButton.styleFrom(
                    foregroundColor: Colors.white,
                    backgroundColor: const Color(0xFF2E424C),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Applicants list
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: selectedOffer!.applications.isEmpty
                  ? [
                      Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Text(
                            'Aucune candidature pour cette offre',
                            style: TextStyle(
                              color: isDarkMode ? Colors.white70 : Colors.black54,
                              fontSize: 16,
                            ),
                          ),
                        ),
                      )
                    ]
                  : selectedOffer!.applications.map((applicant) {
                      final freelancer = freelancers[applicant.freelancerId];
                      return _buildApplicantCard(applicant, freelancer);
                    }).toList(),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildDetailWithIcon(IconData icon, String label, String value) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: isDarkMode ? Colors.white.withOpacity(0.1) : const Color(0x2D2E424C),
            borderRadius: BorderRadius.circular(50),
          ),
          child: Icon(
            icon,
            size: 18,
            color: isDarkMode ? Colors.white : const Color(0xFF2E424C),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: isDarkMode ? Colors.white60 : Colors.grey.shade600,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: isDarkMode ? Colors.white : Colors.black87,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildApplicantCard(Application applicant, Freelancer? freelancer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF0F1849) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Freelancer header
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Profile image with online indicator
                        Stack(
                          children: [
                            Container(
                              width: 48,
                              height: 48,
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.1),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.indigo.withOpacity(0.1),
                                  width: 2,
                                ),
                              ),
                              child: freelancer?.avatar != null && freelancer!.avatar.isNotEmpty
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(50),
                                      child: Image.network(
                                        freelancer.avatar,
                                        fit: BoxFit.cover,
                                        errorBuilder: (context, error, stackTrace) {
                                          return const Icon(
                                            Icons.person,
                                            color: Colors.blue,
                                            size: 24,
                                          );
                                        },
                                      ),
                                    )
                                  : const Icon(
                                      Icons.person,
                                      color: Colors.blue,
                                      size: 24,
                                    ),
                            ),
                            Positioned(
                              right: 0,
                              bottom: 0,
                              child: Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: Colors.green,
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isDarkMode ? const Color(0xFF0F1849) : Colors.white,
                                    width: 2,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(width: 12),
                        
                        // Freelancer info
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              freelancer?.name ?? 'Freelancer',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: isDarkMode ? Colors.white : Colors.black87,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.yellow.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Row(
                                    children: [
                                      const Icon(
                                        Icons.star,
                                        color: Colors.amber,
                                        size: 14,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${freelancer?.rating ?? 0}',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.amber,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '•',
                                  style: TextStyle(
                                    color: isDarkMode ? Colors.white30 : Colors.grey.shade400,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  '${freelancer?.completedJobs ?? 0} jobs completed',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDarkMode ? Colors.white60 : Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ],
                    ),
                    
                    // Action buttons
                    Row(
                      children: [
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: isDarkMode ? Colors.white.withOpacity(0.1) : Colors.grey.shade100,
                            shape: BoxShape.circle,
                          ),
                          child: IconButton(
                            icon: Icon(
                              Icons.message,
                              size: 18,
                              color: isDarkMode ? Colors.white70 : Colors.black54,
                            ),
                            onPressed: () {
                              // Action to message freelancer
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        ElevatedButton(
                          onPressed: () {
                            // Action to hire freelancer
                          },
                          style: ElevatedButton.styleFrom(
                            foregroundColor: Colors.white,
                            backgroundColor: const Color(0xFF86C1A3),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: const Text(
                            'Hire Now',
                            style: TextStyle(fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                
                // Application message
                Text(
                  applicant.message,
                  style: TextStyle(
                    color: isDarkMode ? Colors.white70 : Colors.black54,
                  ),
                ),
                const SizedBox(height: 16),
                
                // Proposed terms
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDarkMode ? Colors.white.withOpacity(0.05) : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.attach_money,
                            size: 16,
                            color: isDarkMode ? Colors.white70 : Colors.black54,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            applicant.getProposedPriceString(),
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isDarkMode ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDarkMode ? Colors.white.withOpacity(0.05) : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.calendar_today,
                            size: 16,
                            color: isDarkMode ? Colors.white70 : Colors.black54,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatDate(applicant.proposedDuration),
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              color: isDarkMode ? Colors.white : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Accept/Reject actions
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
            decoration: BoxDecoration(
              color: isDarkMode ? const Color(0xFF162052) : Colors.grey.shade50,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
              border: Border(
                top: BorderSide(
                  color: isDarkMode ? Colors.white10 : Colors.grey.shade200,
                ),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  margin: const EdgeInsets.only(right: 8),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.close,
                      size: 16,
                      color: Colors.red,
                    ),
                    onPressed: () {
                      // Action to reject application
                    },
                  ),
                ),
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(
                      Icons.check,
                      size: 16,
                      color: Colors.green,
                    ),
                    onPressed: () {
                      // Action to accept application
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

  // Méthode utilitaire pour formater les dates
  String _formatDate(String isoDate) {
    try {
      final date = DateTime.parse(isoDate);
      return '${date.day}/${date.month}/${date.year}';
    } catch (e) {
      return isoDate;
    }
  }
}