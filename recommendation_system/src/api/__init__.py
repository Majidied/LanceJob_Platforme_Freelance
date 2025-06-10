"""
API and batch processing components.

This module contains the Flask API server and batch processing utilities
for the recommendation system.
"""

from .api_server import app
from .batch_processor import BatchProcessor

__all__ = ['app', 'BatchProcessor']
