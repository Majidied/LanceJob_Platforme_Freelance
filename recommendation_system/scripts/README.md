# Recommendation System Scripts

This directory contains utility scripts for managing and maintaining the recommendation system.

## Available Scripts

### Core Scripts

#### `run_batch.py`
**Batch Processing for Large Operations**
- Performs scheduled maintenance tasks
- Model retraining and optimization  
- System health checks
- Database cleanup operations

**Usage:**
```bash
# Test mode (single health check)
python3 scripts/run_batch.py --test

# Run daily maintenance tasks once
python3 scripts/run_batch.py --daily

# Run weekly maintenance tasks once  
python3 scripts/run_batch.py --weekly

# Start continuous scheduler (runs indefinitely)
python3 scripts/run_batch.py
```

#### `run_tests.py`
**Automated Testing Suite**
- Unit tests for all components
- Integration tests for API endpoints
- Performance benchmarks
- Data validation tests

**Usage:**

```bash
python3 scripts/run_tests.py
```

### Data Setup Scripts

Scripts for initial data setup and maintenance are stored in the `data_setup/` subdirectory when needed.

### Maintenance Scripts

Scripts for system maintenance and monitoring are stored in the `maintenance/` subdirectory when needed.

## Usage Guidelines

1. **Always run scripts from the root directory:**

   ```bash
   cd /home/majidi/Documents/lancejob/recommendation_system
   python3 scripts/script_name.py
   ```

2. **Check system status before running scripts:**

   ```bash
   curl http://localhost:2511/health
   ```

3. **Monitor logs during script execution:**

   ```bash
   tail -f logs/recommendation_system.log
   ```

## Development

When adding new scripts:

- Place utility scripts in appropriate subdirectories
- Add documentation to this README
- Include error handling and logging
- Follow the existing code style
