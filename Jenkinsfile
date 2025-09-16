pipeline 
{
    agent any

    environment 
    {
        DOCKER_COMPOSE_FILE = "docker/docker-compose.yml"
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
                sh "docker compose -f ${DOCKER_COMPOSE_FILE} build --parallel"
                sh "mkdir -p build_artifacts && echo 'built' > build_artifacts/status.txt"
                archiveArtifacts artifacts: 'build_artifacts/**', allowEmptyArchive: false
            }
        }
        // stage('Test') 
        // {
        //     steps 
        //     {
        //         echo 'Running tests...'
                
        //     }
        // }
        // stage('Code Quality') 
        // {
        //     steps 
        //     {
        //         echo 'Running code quality check...'
                
        //     }
        // }
        // stage('Security') 
        // {
        //     steps 
        //     {
        //         echo 'Running security scan...'
                
        //     }
        // }
        // stage('Deploy') 
        // {
        //     steps 
        //     {
        //         echo 'Deploying...'
                
        //     }
        // }
    }
    post 
    {
        success { echo "Build stage completed." }
        failure { echo "Build failed." }
    }

}