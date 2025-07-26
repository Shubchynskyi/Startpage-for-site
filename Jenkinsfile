pipeline {
    agent any
    environment {
        WEBSERVER_CONTAINER = credentials('WEBSERVER_CONTAINER')
        NGINX_HTML_PATH = '/usr/share/nginx/html'
    }
    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
                // Show current workspace and files after checkout
                sh 'echo "[WORKSPACE]" && pwd'
                sh 'echo "[WORKSPACE CONTENT]" && ls -la'
                sh 'echo "[CSS DIR]" && ls -la css'
                sh 'echo "[JS DIR]" && ls -la js'
                sh 'echo "[IMG DIR]" && ls -la img'
            }
        }
        stage('Copy Static Files to Nginx') {
            steps {
                script {
                    // Show files in container before copy
                    sh 'echo "[CONTAINER BEFORE COPY]"'
                    sh "docker exec $WEBSERVER_CONTAINER ls -la $NGINX_HTML_PATH/"
                    // Remove old files
                    sh """
                        docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/css
                        docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/js
                        docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/img
                        docker exec $WEBSERVER_CONTAINER rm -f $NGINX_HTML_PATH/index.html
                    """
                    // Copy new files
                    sh 'echo "[COPY FILES]"'
                    sh "docker cp index.html $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/"
                    sh "docker cp css $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/"
                    sh "docker cp js $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/"
                    sh "docker cp img $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/"
                    // Show files in container after copy
                    sh 'echo "[CONTAINER AFTER COPY]"'
                    sh "docker exec $WEBSERVER_CONTAINER ls -la $NGINX_HTML_PATH/"
                    sh "docker exec $WEBSERVER_CONTAINER ls -la $NGINX_HTML_PATH/css || true"
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