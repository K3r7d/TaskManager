pipeline 
{
    agent any

    environment 
    {
        DOCKER_COMPOSE_FILE = "docker/docker-compose.yml"
        DOCKER_CONFIG = "${WORKSPACE}/.docker"
    }

    stages 
    {
        stage('Checkout')
        {
            steps { checkout scm }
        }
        stage('Build') 
        {
            steps 
            {
                echo "Building docker images with docker compose..."
                sh "/usr/local/bin/docker compose -f ${DOCKER_COMPOSE_FILE} build --parallel"
                sh "mkdir -p build_artifacts && echo 'built' > build_artifacts/status.txt"
                archiveArtifacts artifacts: 'build_artifacts/**', allowEmptyArchive: false
            }
        }
    }
    post 
    {
        success { echo "Build stage completed." }
        failure { echo "Build failed." }
    }

}