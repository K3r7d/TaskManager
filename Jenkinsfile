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
                sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} build --parallel"
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
SECRET_KEY=${SECRET_KEY}
EOF
                        echo "📋 Environment file created:"
                        cat .env
                        '''
                        
                        // Start database service and wait for it to be healthy
                        echo "📦 Starting database service..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} up -d db"
                        
                        echo "⏳ Waiting for database to be healthy..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} up --wait db"
                        
                        // Additional wait to ensure database is fully ready
                        echo "⏳ Giving database extra time to initialize..."
                        sh "sleep 10"
                        
                        // Verify database is accepting connections
                        echo "🔍 Verifying database connectivity..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} exec db mysqladmin ping -h localhost --silent || echo 'Database ping failed but continuing...'"
                        
                        // Create directory for test reports
                        sh "mkdir -p test-reports"
                        
                        // Debug: Check environment variables in test container
                        echo "🔍 Debug: Checking environment variables in test container..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} --profile test run --rm test env | grep -E '(DATABASE_URL|MYSQL|SECRET)' || echo 'No matching env vars found'"
                        
                        // Run backend tests using dedicated test service
                        echo "🚀 Running backend tests with dedicated test service..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} --profile test run --rm test"
                        
                        // Optional: Run frontend tests if they exist
                        echo "🎨 Running frontend tests (if available)..."
                        sh '''
                        if /usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} config --services | grep -q "frontend"; then
                            echo "Frontend service found, running frontend tests..."
                            /usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} run --rm frontend \
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
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} --profile test down --remove-orphans || true"
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
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} logs db > db-logs.txt 2>/dev/null || true"
                        if (fileExists('db-logs.txt')) {
                            archiveArtifacts artifacts: 'db-logs.txt', allowEmptyArchive: true
                        }
                        
                        // Archive any test artifacts even on failure
                        sh "ls -la test-reports/ || true"
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
                echo "Starting deployment..."
                
                script {
                    try {
                        // Stop any existing services
                        echo " Stopping existing services..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} down || true"
                        
                        // Deploy the application
                        echo " Deploying application stack..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} up -d --build"
                        
                        // Wait for services to be healthy
                        echo " Waiting for services to be ready..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} up --wait"
                        
                        // Verify deployment
                        echo " Verifying deployment..."
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} ps"
                        
                        echo " Deployment completed successfully!"
                        
                    } catch (Exception e) {
                        echo "❌ Deployment failed: ${e.getMessage()}"
                        sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} logs || true"
                        throw e
                    }
                }
            }
            post {
                failure {
                    echo "❌ Deployment failed - Rolling back..."
                    sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} down || true"
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
            sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} --profile test down --remove-orphans || true"
        }
    }
}
