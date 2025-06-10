#!/usr/bin/env python3
"""
Batch Processing Runner for LanceJob Recommendation System.

This script can be run as a standalone application or scheduled via cron
to perform periodic maintenance tasks.
"""

import os
import sys

# Add the parent directory (recommendation_system root) to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from src.api.batch_processor import BatchProcessor
from src.core.config import Config

if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='LanceJob Recommendation System Batch Processor')
    parser.add_argument('--test', action='store_true', help='Run a single test batch instead of continuous scheduling')
    parser.add_argument('--daily', action='store_true', help='Run daily tasks once')
    parser.add_argument('--weekly', action='store_true', help='Run weekly tasks once')
    
    args = parser.parse_args()
    
    # Setup logging directory
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Initialize batch processor
    processor = BatchProcessor()
    
    if args.test:
        print("🧪 Running batch processor test...")
        processor.health_check()
        print("✅ Health check completed")
        
    elif args.daily:
        print("📅 Running daily batch tasks...")
        processor.run_daily_tasks()
        print("✅ Daily tasks completed")
        
    elif args.weekly:
        print("📅 Running weekly batch tasks...")
        processor.run_weekly_tasks()
        print("✅ Weekly tasks completed")
        
    else:
        print("🚀 Starting continuous batch processor...")
        print("Use --test, --daily, or --weekly for one-time runs")
        # Start the continuous scheduler
        from src.api.batch_processor import main
        main()
