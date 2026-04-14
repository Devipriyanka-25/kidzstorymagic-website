#!/bin/bash

# Database migration and setup script
# Usage: bash database-setup.sh

set -e

echo "🗄️ Setting up Kidz Story Magic Database..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL client (psql) is not installed"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Database connection details
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-kidz_story_magic}
DB_USER=${DB_USER:-postgres}

echo "📍 Connecting to PostgreSQL at $DB_HOST:$DB_PORT"

# Create database if it doesn't exist
echo "📦 Creating database..."
psql -h $DB_HOST -U $DB_USER -p $DB_PORT -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || psql -h $DB_HOST -U $DB_USER -p $DB_PORT -c "CREATE DATABASE $DB_NAME"

echo "✅ Database created!"

# Run schema migrations
echo "🔄 Running schema migrations..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT -f docs/database-schema.sql

echo "✅ Schema migrations completed!"

# Run seed data
echo "🌱 Seeding initial data..."
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -p $DB_PORT << EOF

-- Insert sample currency rates
INSERT INTO currency_rates (currency, exchange_rate, last_updated) 
VALUES 
  ('USD', 1.0, NOW()),
  ('CAD', 1.35, NOW()),
  ('GBP', 0.79, NOW()),
  ('EUR', 0.92, NOW()),
  ('AUD', 1.52, NOW()),
  ('INR', 83.12, NOW())
ON CONFLICT (currency) DO UPDATE SET exchange_rate = EXCLUDED.exchange_rate, last_updated = NOW();

-- Create admin user (password: Admin@123)
INSERT INTO users (name, email, password_hash, is_active) 
VALUES 
  ('Admin User', 'admin@kidzstorymagic.com', '\$2b\$10\$YourHashedPasswordHere', true)
ON CONFLICT (email) DO NOTHING;

EOF

echo "✅ Seed data inserted!"

echo ""
echo "✅ Database setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "  1. Configure your .env file with database credentials"
echo "  2. Start the backend server: npm run dev"
echo "  3. Start the frontend: npm run dev"
echo ""
echo "🎉 Happy coding!"
