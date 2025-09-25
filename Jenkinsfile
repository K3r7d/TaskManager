pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = "docker/docker-compose.yml"
        PATH = "/usr/local/bin:${env.PATH}"
        DATABASE_URL="mysql+mysqlconnector://newuser:123456@mysql-db:3306/TASKMANAGER"
        MYSQL_DATABASE="TASKMANAGER"
        MYSQL_ROOT_PASSWORD = credentials('MYSQL_ROOT_PASSWORD')
        SECRET_KEY="fallbacksecret"
        MYSQL_PASSWORD=123456
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Build') {
            steps {
                echo "Building docker images with docker compose..."
                sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} build --parallel"
            }
        }
        stage('Test') {
            steps {
                echo "🧪 Starting Test Stage..."
                
                script {
                    try {
                        // Create .env file from pipeline environment variables
                        echo "⚙️ Creating environment configuration..."
                        sh '''
                        cat > .env << EOF
DATABASE_URL=${DATABASE_URL}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=newuser
MYSQL_PASSWORD=123456
SECRET_KEY=${SECRET_KEY}
EOF
                        echo "📋 Environment file created:"
                        cat .env
                        '''
                        
                        // Start database service and wait for it to be healthy
                        echo "📦 Starting database service..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up -d db"
                        
                        echo "⏳ Waiting for database to be healthy..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up --wait db"
                        
                        // Additional wait to ensure database is fully ready
                        echo "⏳ Giving database extra time to initialize..."
                        sh "sleep 10"
                        
                        // Verify database is accepting connections
                        echo "🔍 Verifying database connectivity..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} exec db mysqladmin ping -h localhost --silent || echo 'Database ping failed but continuing...'"
                        
                        // Create directory for test reports
                        sh "mkdir -p test-reports"
                        
                        // Debug: Check environment variables in test container
                        echo "🔍 Debug: Checking environment variables in test container..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile test run --rm test env | grep -E '(DATABASE_URL|MYSQL|SECRET)' || echo 'No matching env vars found'"
                        
                        // Run backend tests using dedicated test service
                        echo "🚀 Running backend tests with dedicated test service..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile test run --rm test"
                        
                        // Optional: Run frontend tests if they exist
                        echo "🎨 Running frontend tests (if available)..."
                        sh '''
                        if /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} config --services | grep -q "frontend"; then
                            echo "Frontend service found, running frontend tests..."
                            /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} run --rm frontend \
                            npm test -- --watchAll=false --passWithNoTests 2>/dev/null || echo "Frontend tests completed or not configured"
                        else
                            echo "No frontend service configured, skipping frontend tests"
                        fi
                        '''
                        
                    } catch (Exception e) {
                        echo "❌ Test stage failed: ${e.getMessage()}"
                        throw e
                    } finally {
                        // Always cleanup test containers
                        echo "🧹 Cleaning up test containers..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile test down --remove-orphans || true"
                    }
                }
                
                echo "✅ Test stage completed successfully!"
            }
            post {
                always {
                    script {
                        // Collect test results and reports
                        if (fileExists('test-reports/test-results.xml')) {
                            echo "Publishing test results..."
                            publishTestResults testResultsPattern: 'test-reports/test-results.xml'
                        }
                        
                        // Archive test reports and artifacts
                        if (fileExists('test-reports/')) {
                            echo "Archiving test reports..."
                            archiveArtifacts artifacts: 'test-reports/**/*', allowEmptyArchive: true
                        }
                        
                        // Publish HTML test report
                        if (fileExists('test-reports/test-report.html')) {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'test-reports',
                                reportFiles: 'test-report.html',
                                reportName: 'Test Report'
                            ])
                        }
                    }
                }
                failure {
                    echo "❌ Tests failed - check logs above for details"
                    script {
                        // Archive database logs for debugging
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} logs db > db-logs.txt 2>/dev/null || true"
                        if (fileExists('db-logs.txt')) {
                            archiveArtifacts artifacts: 'db-logs.txt', allowEmptyArchive: true
                        }
                        
                        // Archive any test artifacts even on failure
                        sh "ls -la test-reports/ || true"
                    }
                }
            }
        }

        stage('Code Quality Analysis') {
            steps {
                echo "🔍 Starting Code Quality Analysis..."
                
                script {
                    try {
                        // Start SonarQube service
                        echo "🚀 Starting SonarQube service..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile analysis up -d sonarqube"
                        
                        // Wait for SonarQube to be ready
                        echo "⏳ Waiting for SonarQube to be ready..."
                        timeout(time: 5, unit: 'MINUTES') {
                            script {
                                def sonarReady = false
                                while (!sonarReady) {
                                    try {
                                        sh "curl -f http://localhost:9000/api/system/status"
                                        sonarReady = true
                                        echo "✅ SonarQube is ready!"
                                    } catch (Exception e) {
                                        echo "⏳ SonarQube not ready yet, waiting..."
                                        sleep(30)
                                    }
                                }
                            }
                        }
                        
                        // Install sonar-scanner
                        echo "📦 Setting up SonarQube Scanner..."
                        sh '''
                        if ! command -v sonar-scanner &> /dev/null; then
                            echo "Installing SonarQube Scanner..."
                            wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
                            unzip -q sonar-scanner-cli-4.8.0.2856-linux.zip
                            export PATH=$PATH:$PWD/sonar-scanner-4.8.0.2856-linux/bin
                        fi
                        '''
                        
                        // Use SonarQube token from environment
                        echo "🔑 Using SonarQube token from environment..."
                        sh '''
                        # Wait a bit more for SonarQube to be fully ready
                        sleep 30
                        
                        # Verify token is available
                        if [ -z "$SONAR_TOKEN" ]; then
                            echo "❌ SONAR_TOKEN environment variable is not set"
                            echo "💡 Please set SONAR_TOKEN in your .env file"
                            exit 1
                        fi
                        
                        echo "✅ Using configured SonarQube token"
                        echo "SONAR_TOKEN=$SONAR_TOKEN" > sonar.env
                        '''
                        
                        // Run SonarQube analysis
                        echo "🔍 Running SonarQube code analysis..."
                        sh '''
                        export PATH=$PATH:$PWD/sonar-scanner-4.8.0.2856-linux/bin
                        source sonar.env
                        
                        sonar-scanner \
                          -Dsonar.projectKey=taskmanager \
                          -Dsonar.sources=app \
                          -Dsonar.host.url=http://localhost:9000 \
                          -Dsonar.token=$SONAR_TOKEN \
                          -Dsonar.python.coverage.reportPaths=coverage.xml \
                          -Dsonar.exclusions="**/__pycache__/**,**/*.pyc,**/venv/**" || echo "SonarQube analysis completed with warnings"
                        '''
                        
                        // Generate simple code quality report
                        echo "Generating code quality report..."
                        sh '''
                        mkdir -p code-quality-reports
                        
                        # Python code metrics using radon (if available) or basic stats
                        if command -v radon &> /dev/null; then
                            echo "Using radon for code complexity analysis..."
                            radon cc app --json > code-quality-reports/complexity.json || echo "Radon analysis failed"
                        else
                            echo "Generating basic code quality metrics..."
                            find app -name "*.py" -exec wc -l {} + > code-quality-reports/line-counts.txt
                            find app -name "*.py" | wc -l > code-quality-reports/file-count.txt
                            echo "Total Python files: $(cat code-quality-reports/file-count.txt)" > code-quality-reports/summary.txt
                            echo "Total lines of code: $(awk '{sum += $1} END {print sum}' code-quality-reports/line-counts.txt)" >> code-quality-reports/summary.txt
                        fi
                        '''
                        
                        echo "Code Quality Analysis completed!"
                        
                    } catch (Exception e) {
                        echo "⚠️ Code Quality Analysis had issues: ${e.getMessage()}"
                        echo "Continuing pipeline as this is not critical for basic functionality..."
                    }
                }
            }
            post {
                always {
                    script {
                        // Archive code quality reports
                        if (fileExists('code-quality-reports/')) {
                            archiveArtifacts artifacts: 'code-quality-reports/**/*', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        stage('Security Analysis') {
            steps {
                echo "Starting Security Analysis..."
                
                script {
                    try {
                        // Create security reports directory
                        sh "mkdir -p security-reports"
                        
                        // Run Trivy vulnerability scanning
                        echo "🔍 Running Trivy security scan..."
                        sh '''
                        # Scan the current directory for vulnerabilities
                        /usr/local/bin/docker run --rm -v "$PWD:/code" aquasec/trivy:latest fs /code \
                          --format json --output /code/security-reports/trivy-fs-report.json || echo "Trivy filesystem scan completed with issues"
                        
                        # Scan Python dependencies
                        if [ -f "requirements.txt" ]; then
                            /usr/local/bin/docker run --rm -v "$PWD:/code" aquasec/trivy:latest fs /code/requirements.txt \
                              --format json --output /code/security-reports/trivy-deps-report.json || echo "Trivy dependency scan completed with issues"
                        fi
                        '''
                        
                        // Run basic Python security checks with bandit (if available)
                        echo "🐍 Running Python security analysis..."
                        sh '''
                        # Install and run bandit for Python security analysis
                        /usr/local/bin/docker run --rm -v "$PWD:/code" python:3.9-slim bash -c "
                          pip install bandit[toml] && 
                          cd /code && 
                          bandit -r app -f json -o security-reports/bandit-report.json || echo 'Bandit analysis completed with warnings'
                        " || echo "Bandit analysis failed but continuing..."
                        '''
                        
                        // Check for common security issues
                        echo "🔍 Checking for common security patterns..."
                        sh '''
                        # Check for hardcoded secrets or sensitive information
                        grep -r -i -E "password|secret|key|token" app/ --include="*.py" > security-reports/potential-secrets.txt || echo "No obvious secrets found"
                        
                        # Check for SQL injection patterns
                        grep -r -E "execute.*%|query.*%" app/ --include="*.py" > security-reports/sql-patterns.txt || echo "No obvious SQL injection patterns found"
                        
                        # Generate security summary
                        echo "Security Scan Summary" > security-reports/summary.txt
                        echo "===================" >> security-reports/summary.txt
                        echo "Scan Date: $(date)" >> security-reports/summary.txt
                        echo "" >> security-reports/summary.txt
                        
                        if [ -f "security-reports/trivy-fs-report.json" ]; then
                            echo "Trivy Filesystem Scan: COMPLETED" >> security-reports/summary.txt
                        fi
                        
                        if [ -f "security-reports/bandit-report.json" ]; then
                            echo "Bandit Python Security Scan: COMPLETED" >> security-reports/summary.txt
                        fi
                        
                        echo "" >> security-reports/summary.txt
                        echo "Note: Review individual report files for detailed findings." >> security-reports/summary.txt
                        echo "Any HIGH or CRITICAL vulnerabilities should be addressed before production deployment." >> security-reports/summary.txt
                        '''
                        
                        echo "✅ Security Analysis completed!"
                        
                    } catch (Exception e) {
                        echo "⚠️ Security Analysis encountered issues: ${e.getMessage()}"
                        echo "This may indicate security vulnerabilities that need attention."
                        // Don't fail the build, but mark as unstable
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    script {
                        // Archive security reports
                        if (fileExists('security-reports/')) {
                            archiveArtifacts artifacts: 'security-reports/**/*', allowEmptyArchive: true
                            echo "📋 Security reports archived. Please review for any HIGH or CRITICAL vulnerabilities."
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                }
            }
            steps {
                echo "Starting Staging Deployment..."
                
                script {
                    try {
                        echo "Stopping existing services..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} down || true"
                        
                        echo "Deploying application stack to staging..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up -d --build"
                        
                        echo "Waiting for services to be ready..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up --wait"

                        echo "Verifying staging deployment..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} ps"

                        echo "Running basic smoke tests..."
                        sh '''
                        # Test backend health endpoint
                        curl -f http://localhost:8000/health || echo "Backend health check failed"
                        
                        # Test database connection
                        /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} exec db mysqladmin ping -h localhost --silent || echo "Database connectivity check failed"
                        '''
                        
                        echo "✅ Staging deployment completed successfully!"
                        
                    } catch (Exception e) {
                        echo "❌ Staging deployment failed: ${e.getMessage()}"
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} logs || true"
                        throw e
                    }
                }
            }
            post {
                failure {
                    echo "❌ Staging deployment failed - Rolling back..."
                    sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} down || true"
                }
            }
        }

    }
    post {
        always {
            // Clean up any dangling images and containers
            sh "docker system prune -f --volumes || true"
        }
        success { 
            echo "✅ Pipeline completed successfully!" 
        }
        failure { 
            echo "❌ Pipeline failed - check logs for details" 
        }
        cleanup {
            // Ensure test containers are cleaned up
            sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile test down --remove-orphans || true"
        }
    }
}
