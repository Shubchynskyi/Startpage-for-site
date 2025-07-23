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
        stage('Copy Static Files to Nginx') {
            steps {
                script {
                    sh """
                        docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/css
                        docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/js
                        docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/img
                        docker exec $WEBSERVER_CONTAINER rm -f $NGINX_HTML_PATH/index.html
                        docker cp index.html $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        docker cp css $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        docker cp js $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        docker cp img $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
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