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
        stage('Build') {
            steps {
                echo "Building docker images with docker compose..."
                sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} build --parallel"
            }
        }
    }

    post {
        success { echo "Build stage completed." }
        failure { echo "Build failed." }
    }
}
