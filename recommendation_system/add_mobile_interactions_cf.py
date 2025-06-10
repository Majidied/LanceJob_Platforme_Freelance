#!/usr/bin/env python3
"""
Add sample interactions for mobile missions
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.core.database_manager import DatabaseManager
from datetime import datetime, timedelta
import random

def add_mobile_interactions():
    print("=== ADDING MOBILE MISSION INTERACTIONS ===")
    
    db_manager = DatabaseManager()
    
    # Mobile mission IDs (the ones I added)
    mobile_mission_ids = [
        '684852c96c28354bc1d99756',  # iOS Mobile App for E-commerce Platform
        '684852c96c28354bc1d99757',  # Cross-Platform Chat Application
        '684852c96c28354bc1d99758',  # Flutter Restaurant Booking App
        '684852c96c28354bc1d99759',  # Android Fitness Tracking App Development
        '684852c96c28354bc1d9975a'   # Mobile UI/UX Design for Travel App
    ]
    
    # Get existing freelancers
    freelancers = db_manager.get_all_freelancers()
    freelancer_ids = [f['_id'] for f in freelancers]
    
    print(f"Found {len(freelancer_ids)} freelancers")
    print(f"Adding interactions for {len(mobile_mission_ids)} mobile missions")
    
    interaction_types = ['view', 'click', 'apply', 'save', 'contact']
    interaction_weights = [0.5, 0.2, 0.15, 0.1, 0.05]  # view is most common
    
    interactions_added = 0
    
    # Add interactions for each mobile mission
    for mission_id in mobile_mission_ids:
        # Add interactions from multiple freelancers
        num_interactions = random.randint(5, 15)  # Each mission gets 5-15 interactions
        
        selected_freelancers = random.sample(freelancer_ids, min(num_interactions, len(freelancer_ids)))
        
        for freelancer_id in selected_freelancers:
            # Each freelancer can have multiple interactions with a mission
            num_user_interactions = random.randint(1, 3)
            
            for _ in range(num_user_interactions):
                interaction_type = random.choices(interaction_types, weights=interaction_weights)[0]
                
                # Create interaction
                interaction_data = {
                    'freelancer_id': freelancer_id,
                    'mission_id': mission_id,
                    'interaction_type': interaction_type,
                    'timestamp': datetime.now() - timedelta(days=random.randint(1, 30)),
                    'metadata': {
                        'duration': random.randint(30, 300) if interaction_type == 'view' else None,
                        'source': 'mobile_recommendations'
                    }
                }
                
                success = db_manager.save_interaction(interaction_data)
                if success:
                    interactions_added += 1
                    
    print(f"Added {interactions_added} interactions for mobile missions")
    
    # Verify by checking total interactions
    total_interactions = len(db_manager.get_all_interactions())
    print(f"Total interactions in database: {total_interactions}")

if __name__ == "__main__":
    add_mobile_interactions()
