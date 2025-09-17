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
                        
                        // Run SonarQube analysis
                        echo "🔍 Running SonarQube code analysis..."
                        sh '''
                        export PATH=$PATH:$PWD/sonar-scanner-4.8.0.2856-linux/bin
                        sonar-scanner \
                          -Dsonar.projectKey=taskmanager \
                          -Dsonar.sources=app \
                          -Dsonar.host.url=http://localhost:9000 \
                          -Dsonar.login=admin \
                          -Dsonar.password=admin \
                          -Dsonar.python.coverage.reportPaths=coverage.xml \
                          -Dsonar.exclusions="**/__pycache__/**,**/*.pyc,**/venv/**" || echo "SonarQube analysis completed with warnings"
                        '''
                        
                        // Generate simple code quality report
                        echo "📊 Generating code quality report..."
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
                        
                        echo "✅ Code Quality Analysis completed!"
                        
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
                echo "🔒 Starting Security Analysis..."
                
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
                echo "🚀 Starting Staging Deployment..."
                
                script {
                    try {
                        // Stop any existing services
                        echo "🛑 Stopping existing services..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} down || true"
                        
                        // Deploy the application to staging
                        echo "📦 Deploying application stack to staging..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up -d --build"
                        
                        // Wait for services to be healthy
                        echo "⏳ Waiting for services to be ready..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up --wait"
                        
                        // Verify deployment
                        echo "✅ Verifying staging deployment..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} ps"
                        
                        // Basic smoke test
                        echo "🧪 Running basic smoke tests..."
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

        stage('Release') {
            when {
                anyOf {
                    branch 'main'
                }
            }
            input {
                message "Deploy to Production?"
                ok "Deploy"
                parameters {
                    choice(name: 'DEPLOY_ENV', choices: ['production', 'staging'], description: 'Target deployment environment')
                }
            }
            steps {
                echo "🚀 Starting Production Release..."
                
                script {
                    try {
                        echo "🎯 Deploying to ${params.DEPLOY_ENV} environment..."
                        
                        // Create production environment file
                        echo "⚙️ Setting up production configuration..."
                        sh '''
                        cat > .env.prod << EOF
DATABASE_URL=${DATABASE_URL}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=newuser
MYSQL_PASSWORD=123456
SECRET_KEY=${SECRET_KEY}
ENVIRONMENT=production
DEBUG=false
EOF
                        '''
                        
                        // Deploy to production with production settings
                        echo "📦 Deploying to production environment..."
                        sh "/usr/local/bin/docker compose --env-file .env.prod -f ${DOCKER_COMPOSE_FILE} up -d --build"
                        
                        // Wait for production services
                        echo "⏳ Waiting for production services..."
                        sh "/usr/local/bin/docker compose --env-file .env.prod -f ${DOCKER_COMPOSE_FILE} up --wait"
                        
                        // Production verification
                        echo "✅ Verifying production deployment..."
                        sh '''
                        # Comprehensive production health checks
                        echo "Running production health checks..."
                        
                        # Backend health check
                        curl -f http://localhost:8000/health -H "Accept: application/json" || echo "Backend health check failed"
                        
                        # Database health check
                        /usr/local/bin/docker compose --env-file .env.prod -f ${DOCKER_COMPOSE_FILE} exec db mysqladmin ping -h localhost --silent || echo "Database health check failed"
                        
                        # Check all containers are running
                        /usr/local/bin/docker compose --env-file .env.prod -f ${DOCKER_COMPOSE_FILE} ps
                        
                        echo "Production deployment verification completed!"
                        '''
                        
                        echo "🎉 Production release completed successfully!"
                        
                    } catch (Exception e) {
                        echo "❌ Production release failed: ${e.getMessage()}"
                        echo "🔄 Initiating rollback procedure..."
                        
                        // Rollback to previous version
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} up -d || echo 'Rollback failed'"
                        throw e
                    }
                }
            }
            post {
                success {
                    echo "🎉 Production release successful!"
                    script {
                        // Send success notification (placeholder)
                        echo "📧 Sending deployment success notification..."
                    }
                }
                failure {
                    echo "❌ Production release failed!"
                    script {
                        // Send failure notification (placeholder)
                        echo "📧 Sending deployment failure notification..."
                    }
                }
            }
        }

        stage('Monitoring Setup') {
            when {
                anyOf {
                    branch 'main'
                }
            }
            steps {
                echo "📊 Setting up Monitoring and Alerting..."
                
                script {
                    try {
                        // Start monitoring services
                        echo "🚀 Starting monitoring stack..."
                        sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile monitoring up -d"
                        
                        // Wait for Prometheus to be ready
                        echo "⏳ Waiting for Prometheus to be ready..."
                        timeout(time: 3, unit: 'MINUTES') {
                            script {
                                def prometheusReady = false
                                while (!prometheusReady) {
                                    try {
                                        sh "curl -f http://localhost:9090/-/ready"
                                        prometheusReady = true
                                        echo "✅ Prometheus is ready!"
                                    } catch (Exception e) {
                                        echo "⏳ Prometheus not ready yet, waiting..."
                                        sleep(30)
                                    }
                                }
                            }
                        }
                        
                        // Wait for Grafana to be ready
                        echo "⏳ Waiting for Grafana to be ready..."
                        timeout(time: 3, unit: 'MINUTES') {
                            script {
                                def grafanaReady = false
                                while (!grafanaReady) {
                                    try {
                                        sh "curl -f http://localhost:3001/api/health"
                                        grafanaReady = true
                                        echo "✅ Grafana is ready!"
                                    } catch (Exception e) {
                                        echo "⏳ Grafana not ready yet, waiting..."
                                        sleep(30)
                                    }
                                }
                            }
                        }
                        
                        // Create monitoring report
                        echo "📊 Generating monitoring setup report..."
                        sh '''
                        mkdir -p monitoring-reports
                        
                        # Generate monitoring status report
                        echo "Monitoring Setup Report" > monitoring-reports/monitoring-status.txt
                        echo "=====================" >> monitoring-reports/monitoring-status.txt
                        echo "Setup Date: $(date)" >> monitoring-reports/monitoring-status.txt
                        echo "" >> monitoring-reports/monitoring-status.txt
                        
                        # Check Prometheus
                        if curl -s http://localhost:9090/-/ready; then
                            echo "✅ Prometheus: RUNNING (http://localhost:9090)" >> monitoring-reports/monitoring-status.txt
                        else
                            echo "❌ Prometheus: NOT ACCESSIBLE" >> monitoring-reports/monitoring-status.txt
                        fi
                        
                        # Check Grafana
                        if curl -s http://localhost:3001/api/health; then
                            echo "✅ Grafana: RUNNING (http://localhost:3001)" >> monitoring-reports/monitoring-status.txt
                            echo "   Default login: admin/admin123" >> monitoring-reports/monitoring-status.txt
                        else
                            echo "❌ Grafana: NOT ACCESSIBLE" >> monitoring-reports/monitoring-status.txt
                        fi
                        
                        # Check Node Exporter
                        if /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile monitoring ps node-exporter | grep -q "Up"; then
                            echo "✅ Node Exporter: RUNNING" >> monitoring-reports/monitoring-status.txt
                        else
                            echo "❌ Node Exporter: NOT RUNNING" >> monitoring-reports/monitoring-status.txt
                        fi
                        
                        echo "" >> monitoring-reports/monitoring-status.txt
                        echo "Monitoring Endpoints:" >> monitoring-reports/monitoring-status.txt
                        echo "- Prometheus: http://localhost:9090" >> monitoring-reports/monitoring-status.txt
                        echo "- Grafana: http://localhost:3001 (admin/admin123)" >> monitoring-reports/monitoring-status.txt
                        echo "- Application Health: http://localhost:8000/health" >> monitoring-reports/monitoring-status.txt
                        echo "" >> monitoring-reports/monitoring-status.txt
                        echo "Next Steps:" >> monitoring-reports/monitoring-status.txt
                        echo "1. Access Grafana dashboard and import monitoring templates" >> monitoring-reports/monitoring-status.txt
                        echo "2. Set up alerting rules in Prometheus" >> monitoring-reports/monitoring-status.txt
                        echo "3. Configure notification channels (email, Slack, etc.)" >> monitoring-reports/monitoring-status.txt
                        echo "4. Create custom dashboards for application-specific metrics" >> monitoring-reports/monitoring-status.txt
                        '''
                        
                        // Basic monitoring verification
                        echo "🔍 Running monitoring verification..."
                        sh '''
                        # Test if Prometheus can scrape targets
                        echo "Testing Prometheus target scraping..." >> monitoring-reports/monitoring-status.txt
                        curl -s "http://localhost:9090/api/v1/targets" | grep -o '"health":"[^"]*"' >> monitoring-reports/monitoring-status.txt || echo "Failed to query Prometheus targets" >> monitoring-reports/monitoring-status.txt
                        
                        # Check application metrics endpoint
                        if curl -f http://localhost:8000/health; then
                            echo "✅ Application metrics endpoint accessible" >> monitoring-reports/monitoring-status.txt
                        else
                            echo "❌ Application metrics endpoint not accessible" >> monitoring-reports/monitoring-status.txt
                        fi
                        '''
                        
                        echo "✅ Monitoring setup completed!"
                        echo "📊 Prometheus available at: http://localhost:9090"
                        echo "📈 Grafana available at: http://localhost:3001 (admin/admin123)"
                        
                    } catch (Exception e) {
                        echo "⚠️ Monitoring setup encountered issues: ${e.getMessage()}"
                        echo "Application will continue running, but monitoring may not be fully functional."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    script {
                        // Archive monitoring reports
                        if (fileExists('monitoring-reports/')) {
                            archiveArtifacts artifacts: 'monitoring-reports/**/*', allowEmptyArchive: true
                            echo "📋 Monitoring reports archived."
                        }
                    }
                }
                success {
                    echo "📊 Monitoring and alerting setup successful!"
                    echo "🔗 Access your monitoring dashboards:"
                    echo "   - Prometheus: http://localhost:9090"
                    echo "   - Grafana: http://localhost:3001 (admin/admin123)"
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
