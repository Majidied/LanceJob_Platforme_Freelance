// widgets/navbar.dart
import 'package:flutter/material.dart';
import '../screens/user/profile_screen.dart';

class Navbar extends StatefulWidget {
  final bool isDarkMode;
  final Function toggleDarkMode;
  final Function toggleMenu;

  const Navbar({
    Key? key,
    required this.isDarkMode,
    required this.toggleDarkMode,
    required this.toggleMenu,
  }) : super(key: key);

  @override
  State<Navbar> createState() => _NavbarState();
}

class _NavbarState extends State<Navbar> {
  String _selected = 'Jobs';
  
  // Utiliser un overlay pour afficher le dropdown
  OverlayEntry? _overlayEntry;
  final LayerLink _layerLink = LayerLink();
  
  void _showDropdownMenu() {
    // Fermer le menu s'il est déjà ouvert
    _removeOverlay();
    
    // Créer un nouveau menu
    _overlayEntry = _createOverlayEntry();
    
    // Insérer le menu dans l'overlay
    Overlay.of(context).insert(_overlayEntry!);
  }
  
  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }
  
  void _handleSelect(String value) {
    setState(() {
      _selected = value;
    });
    _removeOverlay();
  }
  
  OverlayEntry _createOverlayEntry() {
    // Obtenir la position et la taille du widget de référence (le bouton dropdown)
    final RenderBox renderBox = context.findRenderObject() as RenderBox;
    final size = renderBox.size;
    
    return OverlayEntry(
      builder: (context) => Positioned(
        width: 120,
        child: CompositedTransformFollower(
          link: _layerLink,
          // Position du dropdown par rapport au bouton
          offset: Offset(size.width - 300, 50),
          child: Material(
            elevation: 4.0,
            borderRadius: BorderRadius.circular(10),
            color: widget.isDarkMode ? const Color(0xFF2D3748) : Colors.white,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  dense: true,
                  title: Text(
                    'Talents',
                    style: TextStyle(
                      color: widget.isDarkMode ? Colors.white : Colors.black,
                      fontSize: 14,
                    ),
                  ),
                  onTap: () => _handleSelect('Talents'),
                ),
                ListTile(
                  dense: true,
                  title: Text(
                    'Jobs',
                    style: TextStyle(
                      color: widget.isDarkMode ? Colors.white : Colors.black,
                      fontSize: 14,
                    ),
                  ),
                  onTap: () => _handleSelect('Jobs'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    // Supprimer l'overlay lors de la destruction du widget
    _removeOverlay();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: widget.isDarkMode ? const Color(0xFF0B1437).withOpacity(0.3) : Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(15),
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: SingleChildScrollView(
          child: Column(
            children: [
              // Main row with search bar and buttons
              Row(
                children: [
                  // Search bar with dropdown
                  Expanded(
                    child: CompositedTransformTarget(
                      link: _layerLink,
                      child: Container(
                        height: 50,
                        decoration: BoxDecoration(
                          color: widget.isDarkMode ? const Color(0xFF2D3748) : const Color(0xFFF0F4F8),
                          borderRadius: BorderRadius.circular(25),
                        ),
                        child: Row(
                          children: [
                            const SizedBox(width: 16),
                            Icon(
                              Icons.search,
                              color: widget.isDarkMode ? Colors.white : Colors.grey,
                              size: 20,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                decoration: InputDecoration(
                                  hintText: 'Search...',
                                  hintStyle: TextStyle(
                                    color: widget.isDarkMode ? Colors.white60 : Colors.grey,
                                    fontSize: 14,
                                  ),
                                  border: InputBorder.none,
                                ),
                                style: TextStyle(
                                  color: widget.isDarkMode ? Colors.white : Colors.black,
                                ),
                              ),
                            ),
                            // Dropdown button
                            Material(
                              color: Colors.transparent,
                              child: InkWell(
                                borderRadius: BorderRadius.circular(20),
                                onTap: _showDropdownMenu,
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 12),
                                  child: Row(
                                    children: [
                                      Text(
                                        _selected,
                                        style: TextStyle(
                                          color: widget.isDarkMode ? Colors.white : Colors.black,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      Icon(
                                        Icons.arrow_drop_down,
                                        color: widget.isDarkMode ? Colors.white : Colors.black,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  // Menu Button
                  IconButton(
                    icon: Icon(
                      Icons.menu,
                      color: widget.isDarkMode ? Colors.white : Colors.grey[600],
                    ),
                    onPressed: () => widget.toggleMenu(),
                  ),
                  // Notification Button
                  IconButton(
                    icon: Icon(
                      Icons.notifications_outlined,
                      color: widget.isDarkMode ? Colors.white : Colors.grey[600],
                    ),
                    onPressed: () {},
                  ),
                  // Dark Mode Toggle
                  IconButton(
                    icon: Icon(
                      widget.isDarkMode ? Icons.wb_sunny_outlined : Icons.nightlight_round,
                      color: widget.isDarkMode ? Colors.white : Colors.grey[600],
                    ),
                    onPressed: () => widget.toggleDarkMode(),
                  ),
                  // Profile Avatar
                  // Avec GestureDetector
                // Envelopper le Container dans un InkWell pour détecter les clics
                InkWell(
                  onTap: () {
                    // Navigation vers la page de profil
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (context) => ProfilScreen()),
                    );
                  },
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Colors.orange, Colors.purple],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                    ),
                  ),
                )
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}