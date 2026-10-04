pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
    }
    triggers {
        cron('H */6 * * *')
    }
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
                sh 'echo "[DATA DIR]" && ls -la data'
                sh 'echo "[PAGES]" && ls -la de projects'
            }
        }
        stage('Refresh GitHub Stats') {
            steps {
                sh '''
                    if command -v node >/dev/null 2>&1; then
                        node scripts/update-github-stats.js
                    else
                        container_id="$(docker create ${GITHUB_TOKEN:+-e GITHUB_TOKEN} node:24-alpine node /scripts/update-github-stats.js)"
                        cleanup() {
                            docker rm -f "$container_id" >/dev/null 2>&1 || true
                        }
                        trap cleanup EXIT

                        docker cp scripts "$container_id:/scripts"
                        docker cp data "$container_id:/data"
                        docker start -a "$container_id"
                        docker cp "$container_id:/data/github-stats.json" data/github-stats.json

                        cleanup
                        trap - EXIT
                    fi
                '''
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
                        for dir in css js img data fonts cv de projects; do
                            docker exec $WEBSERVER_CONTAINER rm -rf $NGINX_HTML_PATH/\$dir
                        done
                        for file in index.html robots.txt sitemap.xml; do
                            docker exec $WEBSERVER_CONTAINER rm -f $NGINX_HTML_PATH/\$file
                        done
                    """
                    // Copy new files
                    sh 'echo "[COPY FILES]"'
                    sh """
                        for path in index.html robots.txt sitemap.xml css js img data fonts cv de projects; do
                            docker cp \$path $WEBSERVER_CONTAINER:$NGINX_HTML_PATH/
                        done
                    """
                    // Show files in container after copy
                    sh 'echo "[CONTAINER AFTER COPY]"'
                    sh "docker exec $WEBSERVER_CONTAINER ls -la $NGINX_HTML_PATH/"
                    sh "docker exec $WEBSERVER_CONTAINER ls -la $NGINX_HTML_PATH/css || true"
                    sh "docker exec $WEBSERVER_CONTAINER ls -la $NGINX_HTML_PATH/data || true"
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
