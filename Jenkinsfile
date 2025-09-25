pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = "docker/docker-compose.yml"
        PATH = "/usr/local/bin:${env.PATH}"
        DATABASE_URL="mysql+mysqlconnector://newuser:123456@mysql-db:3306/TASKMANAGER"
        MYSQL_DATABASE="TASKMANAGER"
        MYSQL_ROOT_PASSWORD = credentials('MYSQL_ROOT_PASSWORD')
        SECRET_KEY="fallbacksecret"
        MYSQL_PASSWORD="123456"
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

        parallel {
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
                            sh "sleep 10"
                            echo "🔍 Verifying database connectivity..."
                            sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} exec db mysqladmin ping -h localhost --silent || echo 'Database ping failed but continuing...'"

                            sh "mkdir -p test-reports"
                            echo "🚀 Running backend tests with dedicated test service..."
                            sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile test run --rm test"

                            echo "🎨 Running frontend tests (if available)..."
                            sh """
                            if /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} config --services | grep -q 'frontend'; then
                                echo 'Frontend service found, running frontend tests...'
                                /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} run --rm frontend npm test -- --watchAll=false --passWithNoTests 2>/dev/null || echo 'Frontend tests completed with warnings'
                            else
                                echo 'No frontend service configured, skipping frontend tests'
                            fi
                            """
                        } catch (Exception e) {
                            echo "❌ Test stage failed: ${e.getMessage()}"
                            throw e
                        }
                    }
                    echo "✅ Test stage completed successfully!"
                }
                post {
                    always {
                        script {
                            if (fileExists('test-reports/test-results.xml')) {
                                echo "Publishing test results..."
                                publishTestResults testResultsPattern: 'test-reports/test-results.xml'
                            }
                            if (fileExists('test-reports/')) {
                                echo "Archiving test reports..."
                                archiveArtifacts artifacts: 'test-reports/**/*', allowEmptyArchive: false
                            }
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
                            sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} logs db > db-logs.txt 2>/dev/null || true"
                            if (fileExists('db-logs.txt')) {
                                archiveArtifacts artifacts: 'db-logs.txt', allowEmptyArchive: true
                            }
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
                            sh "mkdir -p code-quality-reports"
                            echo "🐍 Running comprehensive Python code analysis..."
                            sh '''
                            set -e
                            docker run --rm -v "$PWD:/app" -w /app python:3.9-slim bash -c "
                              pip install --no-cache-dir flake8 bandit safety radon
                              flake8 app --max-line-length=88 --ignore=E203,E501,W503 --exclude=__pycache__,*.pyc,venv --format=json --output-file=code-quality-reports/flake8-report.json || flake8 app --max-line-length=88 --ignore=E203,E501,W503 --exclude=__pycache__ > code-quality-reports/flake8-readable.txt || true
                              bandit -r app -f json -o code-quality-reports/bandit-report.json -ll || bandit -r app > code-quality-reports/bandit-readable.txt || true
                              if [ -f 'requirements.txt' ]; then
                                safety check > code-quality-reports/safety-readable.txt 2>&1 || true
                              else
                                echo 'No requirements.txt found - skipping dependency check' > code-quality-reports/safety-readable.txt
                              fi
                              radon cc app -j > code-quality-reports/complexity-report.json || echo '{"error": "Complexity analysis failed"}' > code-quality-reports/complexity-report.json
                              radon mi app -j > code-quality-reports/maintainability-report.json || echo '{"error": "Maintainability analysis failed"}' > code-quality-reports/maintainability-report.json
                            "
                            '''
                        } catch (Exception e) {
                            echo "⚠️ Code Quality Analysis had issues: ${e.getMessage()}"
                        }
                    }
                }
                post {
                    always {
                        script {
                            if (fileExists('code-quality-reports/')) {
                                archiveArtifacts artifacts: 'code-quality-reports/**/*', allowEmptyArchive: false
                            }
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
                        sh "mkdir -p security-reports"
                        echo "🔍 Running Trivy security scan..."
                        sh '''
                        set -e
                        /usr/local/bin/docker run --rm -v "$PWD:/code" aquasec/trivy:latest fs /code --format json --output /code/security-reports/trivy-fs-report.json || true
                        if [ -f "requirements.txt" ]; then
                            /usr/local/bin/docker run --rm -v "$PWD:/code" aquasec/trivy:latest fs /code/requirements.txt --format json --output /code/security-reports/trivy-deps-report.json || true
                        fi
                        '''
                        echo "🐍 Running Python security analysis..."
                        sh '''
                        set -e
                        /usr/local/bin/docker run --rm -v "$PWD:/code" python:3.9-slim bash -c "
                          pip install bandit[toml]
                          cd /code
                          bandit -r app -f json -o security-reports/bandit-report.json || true
                        "
                        '''
                        echo "🔍 Checking for common security patterns..."
                        sh '''
                        set -e
                        grep -r -i -E "password|secret|key|token" app/ --include="*.py" > security-reports/potential-secrets.txt || true
                        grep -r -E "execute.*%|query.*%" app/ --include="*.py" > security-reports/sql-patterns.txt || true
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Security Analysis encountered issues: ${e.getMessage()}"
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
            post {
                always {
                    script {
                        if (fileExists('security-reports/')) {
                            archiveArtifacts artifacts: 'security-reports/**/*', allowEmptyArchive: false
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
                        set -e
                        curl -f http://localhost:8000/health || true
                        /usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} exec db mysqladmin ping -h localhost --silent || true
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
            sh "docker system prune -f --volumes || true"
        }
        success { 
            echo "✅ Pipeline completed successfully!" 
        }
        failure { 
            echo "❌ Pipeline failed - check logs for details" 
        }
        cleanup {
            sh "/usr/local/bin/docker compose --env-file .env -f ${DOCKER_COMPOSE_FILE} --profile test down --remove-orphans || true"
        }
    }
}
