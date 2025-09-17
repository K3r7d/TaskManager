pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = "docker/docker-compose.yml"
        PATH = "/usr/local/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Prepare Environment') {
            steps {
                echo "Copying .env file..."
                sh 'cp docker/.env .'
            }
        }

        stage('Build') {
            steps {
                echo "Building docker images with docker compose..."
                sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} build --parallel"
            }
        }
        stage('Test') {
            steps {
                echo "Running backend tests with pytest..."
                sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} run --rm backend pytest --maxfail=1 --disable-warnings -q"

                echo "Running frontend tests with npm..."
                sh """
                /usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} run --rm frontend \
                npm test src/components/auth/__tests__/AuthPage.test.tsx \
                        src/components/dashboard/__tests__/Dashboard.test.tsx \
                        -- --watchAll=false
                """
            }
        }

    }
    post {
        success { echo "Build stage completed." }
        failure { echo "Build failed." }
    }
}
