#!/bin/bash

# Kidz Story Magic - Complete Setup Script
# This script sets up the entire project from scratch

set -e

echo "╔════════════════════════════════════════╗"
echo "║   Kidz Story Magic - Setup Script      ║"
echo "╚════════════════════════════════════════╝"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js installation
echo -e "\n${YELLOW}Checking prerequisites...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version)${NC}"
echo -e "${GREEN}✓ npm $(npm --version)${NC}"

# Backend Setup
echo -e "\n${YELLOW}Setting up backend...${NC}"
cd backend
cp .env.example .env
echo -e "${GREEN}✓ Created .env file${NC}"

npm install
echo -e "${GREEN}✓ Installed backend dependencies${NC}"

cd ..

# Frontend Setup
echo -e "\n${YELLOW}Setting up frontend...${NC}"
cd frontend
cp .env.local.example .env.local
echo -e "${GREEN}✓ Created .env.local file${NC}"

npm install
echo -e "${GREEN}✓ Installed frontend dependencies${NC}"

cd ..

# Create directories
echo -e "\n${YELLOW}Creating directories...${NC}"
mkdir -p backend/uploads
mkdir -p backend/pdfs
echo -e "${GREEN}✓ Created upload directories${NC}"

echo -e "\n${GREEN}✓ Setup complete!${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Update backend/.env with your credentials"
echo "2. Update frontend/.env.local with API URL"
echo "3. Run 'docker-compose up' to start all services"
echo "   OR"
echo "   Run 'npm run dev' in backend/ and 'npm run dev' in frontend/"
echo -e "\n${YELLOW}Documentation:${NC}"
echo "- README: Read README.md"
echo "- API Docs: Read docs/API-DOCUMENTATION.md"
echo "- Database: Run database schema (docs/database-schema.sql)"
