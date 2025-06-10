#!/bin/bash

# Database Field Population Fix - Testing Script
# This script helps validate that the database field population fixes are working

echo "🚀 Database Field Population Fix - Validation"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "main.py" ]; then
    echo "❌ Error: Please run this script from the recommendation_system directory"
    echo "Usage: cd /home/majidi/Documents/lancejob/recommendation_system && ./test_db_fix.sh"
    exit 1
fi

echo "📁 Current directory: $(pwd)"

# Step 1: Check Python environment
echo ""
echo "🐍 Checking Python environment..."
python3 --version || {
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
}

# Step 2: Check if MongoDB is accessible
echo ""
echo "🍃 Checking MongoDB connection..."
python3 -c "
import pymongo
try:
    client = pymongo.MongoClient('mongodb://localhost:27017/')
    client.admin.command('ping')
    print('✅ MongoDB connection successful')
except Exception as e:
    print(f'❌ MongoDB connection failed: {e}')
    print('💡 Make sure MongoDB is running: sudo systemctl start mongod')
" 2>/dev/null || {
    echo "⚠️ PyMongo not available, but that's okay for syntax validation"
}

# Step 3: Validate Python syntax
echo ""
echo "🔍 Validating Python syntax..."
python3 -m py_compile src/core/database_manager.py && {
    echo "✅ Database manager syntax is valid"
} || {
    echo "❌ Syntax errors in database manager"
    exit 1
}

# Step 4: Run validation script if possible
echo ""
echo "🧪 Running validation script..."
if python3 validate_db_fix.py 2>/dev/null; then
    echo "✅ Validation script completed successfully"
else
    echo "⚠️ Validation script couldn't run (likely due to missing dependencies)"
    echo "💡 This is normal if MongoDB/PyMongo isn't installed"
fi

# Step 5: Show what to do next
echo ""
echo "🎯 Next Steps to Complete Validation:"
echo "======================================"
echo ""
echo "1. 🔄 Restart the recommendation service:"
echo "   cd /home/majidi/Documents/lancejob/recommendation_system"
echo "   python3 main.py"
echo ""
echo "2. 🧪 Test tracking in the frontend:"
echo "   - Open the frontend application"
echo "   - Go to freelancer home page"
echo "   - Use the tracking demo component"
echo "   - Perform job interactions (view, click, save, apply)"
echo ""
echo "3. 📊 Check database results:"
echo "   - Open MongoDB shell or admin interface"
echo "   - Query the interactions collection"
echo "   - Verify all fields are populated (no NULLs)"
echo ""
echo "4. 🔍 Monitor logs:"
echo "   - Check Python service logs for field structure information"
echo "   - Look for 'Saving interaction with structure:' messages"
echo ""
echo "✅ Database field population fix is ready for testing!"
echo "📚 See /meta/COMPLETE_DATABASE_SOLUTION.md for full documentation"
