#!/usr/bin/env python3
"""
Test Runner for LanceJob Recommendation System.

This script runs the test suite and provides detailed output.
"""

import os
import sys

# Add the parent directory (recommendation_system root) to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)

from tests.test_recommendation_system import run_tests

if __name__ == '__main__':
    print("🧪 Running LanceJob Recommendation System Test Suite")
    print("=" * 60)
    
    # Setup logs directory for testing
    log_dir = os.path.join(os.path.dirname(__file__), 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Run tests
    success = run_tests()
    
    if success:
        print("\n✅ All tests passed!")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1)
