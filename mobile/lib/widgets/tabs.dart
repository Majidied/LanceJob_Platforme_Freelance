// widgets/tabs.dart
import 'package:flutter/material.dart';

class TabsWidget extends StatelessWidget {
  final bool isDarkMode;
  final String activeTab;
  final Function setActiveTab;

  const TabsWidget({
    Key? key,
    required this.isDarkMode,
    required this.activeTab,
    required this.setActiveTab,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDarkMode ? const Color(0xFF0B1437) : Colors.white,
        border: Border(
          bottom: BorderSide(
            color: Colors.grey.withOpacity(0.2),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: InkWell(
              onTap: () => setActiveTab('bestMatches'),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      'Best Matches',
                      style: TextStyle(
                        fontWeight: activeTab == 'bestMatches' ? FontWeight.bold : FontWeight.normal,
                        color: activeTab == 'bestMatches'
                            ? const Color(0xFF518394)
                            : isDarkMode
                                ? Colors.grey
                                : Colors.grey[600],
                      ),
                    ),
                  ),
                  if (activeTab == 'bestMatches')
                    Container(
                      height: 2,
                      color: const Color(0xFF518394),
                    )
                  else
                    const SizedBox(height: 2),
                ],
              ),
            ),
          ),
          Expanded(
            child: InkWell(
              onTap: () => setActiveTab('mostRecent'),
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    child: Text(
                      'Most Recent',
                      style: TextStyle(
                        fontWeight: activeTab == 'mostRecent' ? FontWeight.bold : FontWeight.normal,
                        color: activeTab == 'mostRecent'
                            ? const Color(0xFF518394)
                            : isDarkMode
                                ? Colors.grey
                                : Colors.grey[600],
                      ),
                    ),
                  ),
                  if (activeTab == 'mostRecent')
                    Container(
                      height: 2,
                      color: const Color(0xFF518394),
                    )
                  else
                    const SizedBox(height: 2),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}