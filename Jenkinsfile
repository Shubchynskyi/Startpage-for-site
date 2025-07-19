pipeline {
    agent any
    environment {
        WEBSERVER_CONTAINER = 'webserver' // Можно вынести в параметры или credentials позже
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
                    // Копируем все нужные файлы и папки в контейнер
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
                    // Перезапускаем nginx внутри контейнера
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