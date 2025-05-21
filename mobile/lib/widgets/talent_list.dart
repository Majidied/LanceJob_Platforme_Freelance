// widgets/freelancer_list.dart
import 'package:flutter/material.dart';
import '../models/freelancer.dart';
import '../services/freelancer_service.dart';

class FreelancerList extends StatefulWidget {
  final bool isDarkMode;

  const FreelancerList({
    Key? key,
    required this.isDarkMode,
  }) : super(key: key);

  @override
  State<FreelancerList> createState() => _FreelancerListState();
}

class _FreelancerListState extends State<FreelancerList> {
  List<Freelancer> freelancers = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _loadFreelancers();
  }

  Future<void> _loadFreelancers() async {
    try {
      setState(() {
        isLoading = true;
        error = null;
      });

      final loadedFreelancers = await fetchFreelancers();
      
      setState(() {
        freelancers = loadedFreelancers;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Erreur lors du chargement des freelancers: $e';
        isLoading = false;
      });
      debugPrint('Erreur: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
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
            Text(error!),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadFreelancers,
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    }

    if (freelancers.isEmpty) {
      return const Center(
        child: Text('Aucun freelancer disponible'),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadFreelancers,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: freelancers.length,
        itemBuilder: (context, index) {
          final freelancer = freelancers[index];
          return _buildFreelancerCard(freelancer);
        },
      ),
    );
  }

  Widget _buildFreelancerCard(Freelancer freelancer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: widget.isDarkMode ? const Color(0xFF0F1849) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
        border: Border.all(
          color: Colors.grey.withOpacity(0.2),
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Profile Image and Online Status
            Stack(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: freelancer.avatar.isNotEmpty
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(32),
                          child: Image.network(
                            freelancer.avatar,
                            fit: BoxFit.cover,
                            width: 64,
                            height: 64,
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(
                                Icons.person,
                                color: Colors.blue,
                                size: 32,
                              );
                            },
                          ),
                        )
                      : const Icon(
                          Icons.person,
                          color: Colors.blue,
                          size: 32,
                        ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: widget.isDarkMode ? const Color(0xFF0F1849) : Colors.white,
                        width: 2,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Name and Title
                  Text(
                    freelancer.name,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: widget.isDarkMode ? Colors.white : Colors.black,
                    ),
                  ),
                  Text(
                    freelancer.title,
                    style: TextStyle(
                      fontSize: 14,
                      color: widget.isDarkMode ? Colors.white70 : Colors.black87,
                    ),
                  ),
                  const SizedBox(height: 12),

                  // Stats Row
                  Row(
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.verified,
                            color: Color(0xFF1DC2FB),
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            '${freelancer.success}% Job Success',
                            style: TextStyle(
                              color: widget.isDarkMode ? Colors.white70 : Colors.black87,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(width: 16),
                      Text(
                        '${freelancer.earned}k€ gagné',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: widget.isDarkMode ? Colors.white : Colors.black,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Description
                  Text(
                    freelancer.bio,
                    style: TextStyle(
                      fontSize: 14,
                      color: widget.isDarkMode ? Colors.white60 : Colors.grey[700],
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),

                  // Skills
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: freelancer.skills.map((skill) {
                      return Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: widget.isDarkMode ? Colors.white30 : Colors.grey.shade400,
                          ),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          skill,
                          style: TextStyle(
                            fontSize: 12,
                            color: widget.isDarkMode ? Colors.white : Colors.black87,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}