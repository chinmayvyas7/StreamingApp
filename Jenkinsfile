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
                sh 'docker --version'
                sh 'kubectl version --client'
                sh 'helm version'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker build -t chinmayvyas7/streaming-auth:1.0.0 backend/authService'
                sh 'docker build -t chinmayvyas7/streaming-stream:1.0.0 -f backend/streamingService/Dockerfile backend'
                sh 'docker build -t chinmayvyas7/streaming-admin:1.0.0 -f backend/adminService/Dockerfile backend'
                sh 'docker build -t chinmayvyas7/streaming-chat:1.0.0 -f backend/chatService/Dockerfile backend'
                sh 'docker build -t chinmayvyas7/streaming-frontend:1.0.7 frontend'
            }
        }

        stage('Verify Helm Chart') {
            steps {
                sh 'helm lint streamingapp'
                sh 'helm template streamingapp streamingapp'
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