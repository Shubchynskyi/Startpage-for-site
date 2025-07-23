pipeline {
    agent any
    environment {
        WEBSERVER_CONTAINER = credentials('WEBSERVER_CONTAINER')
        NGINX_HTML_PATH = '/usr/share/nginx/html'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Clean & Deploy Static Files') {
            steps {
                withCredentials([string(credentialsId: 'WEBSERVER_CONTAINER', variable: 'CONTAINER')]) {
                    sh """
                    docker exec $CONTAINER rm -rf $NGINX_HTML_PATH/*
                    docker cp index.html $CONTAINER:$NGINX_HTML_PATH/
                    docker cp css $CONTAINER:$NGINX_HTML_PATH/
                    docker cp js $CONTAINER:$NGINX_HTML_PATH/
                    docker cp img $CONTAINER:$NGINX_HTML_PATH/
                    """
                }
            }
        }


        stage('Reload Nginx') {
            steps {
                script {
                    sh "docker exec $WEBSERVER_CONTAINER nginx -s reload"
                }
            }
        }
    }
    post {
        success {
            echo 'Deployment successful.'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}