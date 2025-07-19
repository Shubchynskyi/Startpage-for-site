pipeline {
    agent any
    environment {
        WEBSERVER_CONTAINER = 'webserver'
        NGINX_HTML_PATH = '/usr/share/nginx/html'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Copy Static Files to Nginx') {
            steps {
                script {
                    sh """
                        docker cp index.html $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        docker cp -r css $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        docker cp -r js $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        docker cp -r img $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
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