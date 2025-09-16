pipeline {
    agent any

    environment {
        DOCKER_CONFIG = "${WORKSPACE}/.docker" // use local docker config
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building docker images with docker compose...'
                sh '/usr/local/bin/docker compose -f docker/docker-compose.yml build --parallel'
            }
        }
    }
}
