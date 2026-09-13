pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Project') {
            steps {
                bat 'docker --version'
                bat 'kubectl version --client'
                bat 'helm version'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker build -t chinmayvyas7/streaming-auth:1.0.0 backend/authService'
                bat 'docker build -t chinmayvyas7/streaming-stream:1.0.0 -f backend/streamingService/Dockerfile backend'
                bat 'docker build -t chinmayvyas7/streaming-admin:1.0.0 -f backend/adminService/Dockerfile backend'
                bat 'docker build -t chinmayvyas7/streaming-chat:1.0.0 -f backend/chatService/Dockerfile backend'
                bat 'docker build -t chinmayvyas7/streaming-frontend:1.0.7 frontend'
            }
        }

        stage('Verify Helm Chart') {
            steps {
                bat 'helm lint streamingapp'
                bat 'helm template streamingapp streamingapp'
            }
        }
    }

    post {
        success {
            echo 'StreamingApp CI pipeline completed successfully.'
        }
        failure {
            echo 'StreamingApp CI pipeline failed.'
        }
    }
}