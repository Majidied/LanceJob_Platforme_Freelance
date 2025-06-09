// widgets/overlay_portal.dart
import 'package:flutter/material.dart';

/// Un widget personnalisé qui agit comme un portail pour afficher des overlays
/// comme les menus déroulants et notifications
class OverlayPortal extends StatefulWidget {
  final Widget child;
  final Widget Function(BuildContext, LayerLink) overlay;
  final LayerLink layerLink;
  final bool isOpen;
  final Offset offset;

  const OverlayPortal({
    Key? key,
    required this.child,
    required this.overlay,
    required this.layerLink,
    required this.isOpen,
    this.offset = const Offset(0, 0),
  }) : super(key: key);

  @override
  State<OverlayPortal> createState() => _OverlayPortalState();
}

class _OverlayPortalState extends State<OverlayPortal> {
  OverlayEntry? _overlayEntry;

  @override
  void didUpdateWidget(OverlayPortal oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    // Mettre à jour l'overlay quand isOpen change
    if (widget.isOpen != oldWidget.isOpen) {
      if (widget.isOpen) {
        _showOverlay();
      } else {
        _removeOverlay();
      }
    }
  }

  @override
  void dispose() {
    _removeOverlay();
    super.dispose();
  }

  void _showOverlay() {
    _removeOverlay();
    
    // Créer un nouvel overlay
    _overlayEntry = OverlayEntry(
      builder: (context) => widget.overlay(context, widget.layerLink),
    );
    
    // Ajouter l'overlay à l'Overlay global
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_overlayEntry != null) {
        Overlay.of(context).insert(_overlayEntry!);
      }
    });
  }

  void _removeOverlay() {
    if (_overlayEntry != null) {
      _overlayEntry!.remove();
      _overlayEntry = null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: widget.layerLink,
      child: widget.child,
    );
  }
}