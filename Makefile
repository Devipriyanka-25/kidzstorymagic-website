# Kidz Story Magic - Makefile

.PHONY: help install dev build test lint clean docker-up docker-down setup-db

help:
	@echo "Kidz Story Magic - Available Commands"
	@echo "======================================"
	@echo "make install       - Install dependencies for frontend and backend"
	@echo "make dev           - Start development servers (frontend + backend)"
	@echo "make dev-frontend  - Start frontend dev server"
	@echo "make dev-backend   - Start backend dev server"
	@echo "make build         - Build for production"
	@echo "make test          - Run all tests"
	@echo "make test-backend  - Run backend tests"
	@echo "make test-frontend - Run frontend tests"
	@echo "make lint          - Run linting checks"
	@echo "make clean         - Clean build and node_modules"
	@echo "make docker-up     - Start Docker containers"
	@echo "make docker-down   - Stop Docker containers"
	@echo "make setup-db      - Setup database and run migrations"
	@echo "make db-seed       - Seed database with sample data"

install:
	cd frontend && npm install
	cd backend && npm install

dev:
	@echo "Starting development servers..."
	cd backend && npm run dev &
	cd frontend && npm run dev &
	@echo "Backend running on http://localhost:5000"
	@echo "Frontend running on http://localhost:3000"

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && npm run dev

build:
	cd frontend && npm run build
	cd backend && npm run build

test:
	cd frontend && npm test
	cd backend && npm test

test-backend:
	cd backend && npm test

test-frontend:
	cd frontend && npm test

lint:
	cd backend && npm run lint || true
	cd frontend && npm run lint || true

clean:
	rm -rf frontend/node_modules backend/node_modules
	rm -rf frontend/.next backend/dist
	rm -rf coverage

docker-up:
	docker-compose up -d
	@echo "✅ Docker containers started"
	@echo "Backend: http://localhost:5000"
	@echo "Frontend: http://localhost:3000"
	@echo "PostgreSQL: localhost:5432"

docker-down:
	docker-compose down
	@echo "✅ Docker containers stopped"

docker-logs:
	docker-compose logs -f

setup-db:
	bash database-setup.sh

db-seed:
	cd backend && npm run db:seed

migrate:
	cd backend && npm run db:migrate

format:
	cd frontend && npm run format || true
	cd backend && npm run format || true

depcheck:
	cd frontend && npm run depcheck || true
	cd backend && npm run depcheck || true

security-audit:
	npm audit
	cd frontend && npm audit
	cd backend && npm audit
