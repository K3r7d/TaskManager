# Task Manager Application - Complete DevOps Pipeline

## Project Overview
This comprehensive DevOps capstone project demonstrates a full-stack Task Manager application with enterprise-grade CI/CD pipeline, containerization, and cloud deployment. The application showcases modern development practices with automated testing, security analysis, and multi-environment deployment.

### Architecture Stack
- **Backend**: FastAPI (Python 3.12) with SQLAlchemy ORM
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS  
- **Database**: MySQL 8.0 with persistent storage
- **Containerization**: Docker & Docker Compose orchestration
- **Cloud Platform**: Railway.app for production deployment
- **CI/CD**: Jenkins Pipeline with comprehensive automation

### Key Features
- **Full-Stack Application**: Complete task management with authentication
- **Security-First**: JWT authentication, SQL injection protection, vulnerability scanning
- **Real-time Dashboard**: Interactive UI with file uploads and notifications
- **Multi-Environment**: Local, staging, and production deployments
- **Test Coverage**: Comprehensive backend and frontend testing
- **Quality Gates**: Automated code quality and security analysis

## Quick Start

### Clone & Setup
```bash
git clone https://github.com/K3r7d/TaskManager.git
cd TaskManager
```

### Environment Configuration
Create your environment file:
```bash
# Copy and customize environment variables
cp .env.example .env

# Required variables:
# - MYSQL_ROOT_PASSWORD
# - MYSQL_DATABASE=TASKMANAGER  
# - MYSQL_USER=newuser
# - MYSQL_PASSWORD=123456
# - SECRET_KEY=your-secret-key
```

### Local Development with Docker
Start the complete application stack:
```bash
# Production deployment
docker compose -f docker-compose.production.yml up --build

# Development with hot-reload
docker compose -f docker/docker-compose.yml up --build
```

### Manual Development Setup
**Backend Setup:**
```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend Setup:**
```bash
cd front-dash-boost
npm install
npm run dev
```

### Access Points
- **Frontend**: http://localhost:3000 (React Application)
- **Backend API**: http://localhost:8000 (FastAPI with auto-docs)
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Production**: https://front-end-task-flow-production.up.railway.app


## CI/CD Pipeline Architecture

### Jenkins Pipeline Stages

#### **1. Checkout & Build**
- Source code retrieval from GitHub
- Parallel Docker image building (backend, frontend, database)
- Optimized build caching and multi-stage builds

#### **2. Comprehensive Testing**
- **Backend Tests**: FastAPI endpoints, database integration, authentication
- **Frontend Tests**: React components, UI interactions, API integration  
- **Database Tests**: Connection health, query performance, migrations
- **Coverage Reports**: XML/HTML test results with detailed metrics

#### **3. Code Quality Analysis**
- **Style & Linting**: flake8 for Python code standards
- **Complexity Analysis**: radon for maintainability metrics
- **Type Checking**: MyPy for Python type safety
- **Frontend Quality**: ESLint + TypeScript strict mode

#### **4. Security Analysis**
- **Code Security**: bandit for Python vulnerability detection
- **Dependency Scanning**: safety + trivy for known CVEs
- **Container Scanning**: Docker image vulnerability analysis
- **Secret Detection**: Automated credential leak prevention

#### **5. Staging Deployment**
- **Local Staging**: Docker Compose deployment with health checks
- **Smoke Tests**: API endpoint verification and database connectivity
- **Performance Tests**: Basic load testing and response time validation

#### **6. Production Release Verification**
- **Railway Health Checks**: Backend API availability verification
- **Frontend Validation**: UI accessibility and routing tests
- **Database Connection**: Production database connectivity verification
- **End-to-End Tests**: Complete user workflow validation

### **Pipeline Features**
- **Fast Feedback**: Parallel execution and optimized caching
- **Security-First**: Multiple security gates and vulnerability scanning
- **Quality Gates**: Automated quality thresholds and manual approvals
- **Branch Strategy**: `main` for production, `deployment` for staging
- **Rich Reporting**: Comprehensive test, security, and quality reports



## Deployment Architecture

### **Production Environment (Railway.app)**
- **Backend Service**: `https://taskmanager-production-4880.up.railway.app`
- **Frontend Service**: `https://front-end-task-flow-production.up.railway.app`  
- **Database**: MySQL 8.0 with persistent volumes and automated backups
- **Auto-Deployment**: GitHub integration with branch protection rules

### **Container Strategy**
- **Multi-Stage Builds**: Optimized Docker images with minimal attack surface
- **Health Checks**: Comprehensive container and service health monitoring
- **Smart API Configuration**: Environment-aware endpoint detection
- **Resource Optimization**: Production-tuned container configurations

### **Environment Management**
```bash
# Local Development
VITE_API_URL=http://localhost:8000

# Railway Production  
VITE_API_URL=https://taskmanager-production-4880.up.railway.app

# Smart Detection (api.ts)
# Automatically detects environment and routes requests appropriately
```

## Advanced Features

### **Application Features**
- **JWT Authentication**: Secure user login and session management
- **Task Management**: CRUD operations with real-time updates
- **File Uploads**: Document attachment with cloud storage
- **Notifications**: Real-time user notifications and alerts
- **Dashboard**: Interactive analytics and task visualization

### **DevOps Features**  
- **Multi-Environment**: Local, staging, and production configurations
- **Monitoring**: Application health and performance monitoring
- **Automated Rollback**: Failed deployment detection and recovery
- **Quality Metrics**: Code coverage, complexity, and security scores
- **Alert System**: Failed build and deployment notifications

## Project Structure

```
TaskManager/
├── app/                          # FastAPI Backend
│   ├── main.py                      # Application entry point
│   ├── database.py                  # Database configuration
│   ├── models.py                    # SQLAlchemy models
│   ├── schemas.py                   # Pydantic schemas
│   ├── crud.py                      # Database operations
│   └── routes/                      # API route modules
│       ├── auth.py                  # Authentication endpoints
│       ├── tasks.py                 # Task management
│       ├── files.py                 # File upload handling
│       └── notifications.py         # Real-time notifications
│
├── front-dash-boost/             # React Frontend
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── auth/               # Authentication UI
│   │   │   ├── dashboard/          # Main dashboard
│   │   │   └── ui/                 # Reusable UI components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── lib/                    # Utilities and API client
│   │   └── pages/                  # Route components
│   ├── Dockerfile.frontend         # Frontend container config
│   └── railway.json               # Railway deployment config
│
├── docker/                       # Container Configurations
│   ├── docker-compose.yml          # Development environment
│   ├── Dockerfile.backend          # Backend container
│   └── Dockerfile.test             # Testing environment
│
├── Jenkinsfile                   # CI/CD Pipeline Definition
├── docker-compose.production.yml # Production Docker stack
├── railway.json                 # Backend Railway config
├── test/                        # Test suites
└── docs/                        # Documentation
    ├── DEPLOYMENT.md               # Deployment guide
    └── TESTING.md                  # Testing guide
```

## Testing Strategy

### **Test Coverage**
- **Backend**: 90%+ coverage with pytest, integration tests, and API testing
- **Frontend**: Component testing with Vitest and React Testing Library
- **E2E Testing**: User workflow validation with real database interactions
- **Performance**: Load testing and response time validation

### **Running Tests**
```bash
# Backend tests
pytest test/ -v --cov=app --cov-report=html

# Frontend tests  
cd front-dash-boost && npm test

# Full pipeline testing
docker compose -f docker/docker-compose.yml --profile test up --build
```

## Quality & Security

### **Code Quality Tools**
- **Python**: flake8, bandit, safety, radon, mypy
- **JavaScript/TypeScript**: ESLint, TypeScript strict mode
- **Security**: Trivy container scanning, dependency vulnerability checks
- **Documentation**: Automated API documentation with Swagger/OpenAPI

### **Security Measures**
- JWT authentication with secure token handling
- SQL injection prevention with parameterized queries
- CORS configuration for secure cross-origin requests
- Environment variable security and secret management
- Regular dependency updates and vulnerability patching

## Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)**: Complete deployment instructions
- **[Testing Guide](docs/TESTING.md)**: Testing strategies and examples  
- **API Documentation**: Available at `/docs` endpoint when running
- **Architecture Diagrams**: System design and data flow documentation

## Live Applications

### **Production URLs**
- **Frontend Application**: [https://front-end-task-flow-production.up.railway.app](https://front-end-task-flow-production.up.railway.app)
- **Backend API**: [https://taskmanager-production-4880.up.railway.app](https://taskmanager-production-4880.up.railway.app)
- **API Documentation**: [https://taskmanager-production-4880.up.railway.app/docs](https://taskmanager-production-4880.up.railway.app/docs)

### **Pipeline Reports**
Each Jenkins pipeline run generates comprehensive reports:
- **Test Reports**: HTML and XML format with coverage metrics
- **Code Quality**: Style, complexity, and maintainability analysis  
- **Security Scans**: Vulnerability reports and security recommendations
- **Performance**: Load testing and response time analysis

---

## **DevOps Excellence**

This project demonstrates enterprise-level DevOps practices including:
- Automated CI/CD with comprehensive testing
- Multi-environment deployment strategy  
- Container orchestration and cloud deployment
- Security-first development approach
- Quality gates and automated reporting
- Infrastructure as Code practices
- Monitoring and alerting integration
