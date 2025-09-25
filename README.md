
## Branch Migration Notice

**This repository has migrated to a new main branch.**

All development now continues on the updated `main` branch, which replaces the previous history. If you had forks or clones, please rebase or re-clone to ensure you have the latest code and pipeline setup.

---

## Task Manager Application - CI/CD Pipeline Capstone Project

### Project Overview
This capstone project implements a comprehensive DevOps pipeline for a Task Manager application using Jenkins, Docker, and various analysis tools. The application consists of:
- **Backend**: FastAPI (Python) RESTful API
- **Frontend**: React with TypeScript
- **Database**: MySQL 8.0
- **Containerization**: Docker and Docker Compose

### Technologies Used
- **CI/CD**: Jenkins Pipeline
- **Containerization**: Docker, Docker Compose
- **Database**: MySQL 8.0
- **Backend**: FastAPI, Python 3.9+
- **Frontend**: React 18, TypeScript, Vite
- **Code Quality**: pytest, flake8, radon
- **Security**: bandit, safety, trivy

## Setting Up the Project

### Clone the Repository
```bash
git clone https://github.com/K3r7d/TaskManager.git
cd TaskManager
```

### Environment Configuration
- Copy `.env.example` to `.env` and update environment variables as needed.
- Ensure database credentials and API keys are set.

### Install Dependencies
- **Backend**:
  ```bash
  cd backend
  pip install -r requirements.txt
  ```
- **Frontend**:
  ```bash
  cd front-dash-boost
  npm install
  ```

### Start Services Locally
- Use Docker Compose to start all services:
  ```bash
  docker compose up --build
  ```
- Access the application at [http://localhost:3000](http://localhost:3000) (frontend) and [http://localhost:8000](http://localhost:8000) (API).

### Initial Database Setup
- Database migrations are handled automatically on startup.
- For manual setup, use provided SQL scripts in the `db` directory.


## Pipeline Stages

### 1. Checkout Stage
- Retrieves source code from Git repository
- Sets up workspace for subsequent stages

### 2. Build Stage
- Builds Docker images for backend, frontend, and test services
- Uses Docker Compose with parallel building for efficiency
- Creates deployable artifacts (Docker images)

### 3. Test Stage 
- **Framework**: pytest for backend testing
- **Database**: Uses dedicated test database service
- **Coverage**: Generates test reports and coverage metrics
- **Frontend**: vitest for React component testing
- **Reports**: Archives test results and HTML reports

### 4. Code Quality Analysis Stage 
- **Tools Used**: pytest (testing), flake8 (style/lint), radon (complexity)
- **Analysis**: 
  - Code style and linting (flake8)
  - Code complexity and maintainability (radon)
  - Automated backend tests and coverage (pytest)
- **Reports**: XML/HTML test reports, flake8 and radon reports

### 5. Security Analysis Stage 
- **Tools Used**: bandit (Python code security), safety (dependency vulnerabilities), trivy (filesystem & dependency scan)
- **Scans**:
  - Python code security vulnerabilities (bandit)
  - Dependency vulnerabilities (safety, trivy)
  - Filesystem vulnerabilities (trivy)
  - Manual checks for secrets and SQL injection patterns
- **Reports**: Security scan reports, manual findings

### 6. Deploy Stage (Staging)
- **Environment**: Staging deployment
- **Process**: 
  - Stops existing services
  - Deploys with health checks
  - Runs smoke tests
- **Verification**: Health endpoint and database connectivity tests

### 7. Release Stage (Production) 
- **Manual Gate**: Requires approval for production deployment
- **Environment**: Production-specific configuration
- **Process**: 
  - Production environment setup
  - Health verification
  - Rollback capability
- **Notifications**: Success/failure notifications

### 8. Monitoring Setup Stage 
- **Monitoring**: (Optional) Add monitoring tools as needed for your environment

## Pipeline Features

### Automated Testing
- Comprehensive backend API testing
- Frontend component testing
- Database integration testing
- Test report generation and archiving

###  Quality Gates
- Code quality thresholds
- Security vulnerability assessment
- Test coverage requirements
- Manual production deployment approval

### Reporting & Artifacts
- Test results (XML/HTML)
- Code quality metrics
- Security scan reports (if enabled)
- All reports archived in Jenkins

### 🐳 Containerization
- Multi-stage Docker builds
- Docker Compose orchestration
- Service health checks
- Production-ready configurations

### Security Integration
- Automated vulnerability scanning
- Security best practices enforcement
- Secret management
- Rollback mechanisms

## Setup Instructions

### Prerequisites
- Jenkins with Docker support
- Docker and Docker Compose installed
- Network access for downloading tools

### Jenkins Configuration
1. Create new Pipeline job
2. Point to this repository's Jenkinsfile
3. Configure credentials:
   - `MYSQL_ROOT_PASSWORD`: MySQL root password
4. Ensure Jenkins has Docker permissions

### Running the Pipeline
1. **Automatic Trigger**: Push to the new main branch
2. **Manual Trigger**: Build in Jenkins UI
3. **Stages Execute**: All stages run automatically until Release
4. **Manual Approval**: Production deployment requires approval

## Application Access

After successful pipeline execution:
- **Application**: http://localhost:8000 - Task Manager API
- **Frontend**: http://localhost:3000 - Task Manager UI

## Reports and Artifacts

Each pipeline run generates:
- **Test Reports**: HTML and XML format
- **Code Quality Reports**: SonarQube analysis results
- **Security Reports**: Vulnerability scan results
- **Monitoring Reports**: Setup verification status
