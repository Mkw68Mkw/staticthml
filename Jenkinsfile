pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 10, unit: 'MINUTES')
    }

    environment {
        PROJECT_NAME       = 'staticweb'
        SONAR_SCANNER_OPTS = '-Xmx512m'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare') {
            steps {
                script {
                    def rawBranch = env.CHANGE_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH?.replaceFirst(/^origin\//, '') ?: 'unknown'
                    env.BRANCH_SAFE = rawBranch.replaceAll(/[^a-zA-Z0-9._-]/, '_')
                    env.TARGET_DIR = "/var/jenkins_home/projects/${env.PROJECT_NAME}/${env.BRANCH_SAFE}"
                }
            }
        }

        stage('Build Frontend') {
            when {
                anyOf {
                    expression { return fileExists('frontend/package.json') }
                    expression { return fileExists('package.json') }
                }
            }
            steps {
                script {
                    if (fileExists('frontend/package.json')) {
                        dir('frontend') {
                            sh '''
                                npm ci
                                GENERATE_SOURCEMAP=false \
                                NODE_OPTIONS="--max-old-space-size=1024" \
                                PUBLIC_URL=/projects/${PROJECT_NAME}/${BRANCH_SAFE} \
                                REACT_APP_API_BASE=/api/${PROJECT_NAME}/${BRANCH_SAFE}/api \
                                npm run build
                            '''
                        }
                    } else if (fileExists('package.json')) {
                        sh '''
                            npm ci
                            GENERATE_SOURCEMAP=false \
                            NODE_OPTIONS="--max-old-space-size=1024" \
                            PUBLIC_URL=/projects/${PROJECT_NAME}/${BRANCH_SAFE} \
                            REACT_APP_API_BASE=/api/${PROJECT_NAME}/${BRANCH_SAFE}/api \
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Test') {
            when {
                anyOf {
                    expression { return fileExists('frontend/package.json') }
                    expression { return fileExists('package.json') }
                }
            }
            steps {
                script {
                    if (fileExists('frontend/package.json')) {
                        dir('frontend') {
                            sh 'npm run test --if-present'
                        }
                    } else {
                        sh 'npm run test --if-present'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                branch 'develop'
            }
            steps {
                sh """
                    echo "Starting SonarQube analysis of ${env.PROJECT_NAME}"
                    echo "SONAR_SCANNER_OPTS=${env.SONAR_SCANNER_OPTS}"
                    echo "BRANCH_NAME=${env.BRANCH_NAME}"
                    echo "TARGET_DIR=${env.TARGET_DIR}"
                """
                script {
                    def scannerHome = tool 'sonar-scanner'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \\
                              -Dsonar.projectKey=${env.PROJECT_NAME} \\
                              -Dsonar.branch.name=${env.BRANCH_NAME}
                        """
                    }
                }
            }
        }

        stage('Deploy Frontend') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                sh """
                    echo "Deploying frontend to ${env.TARGET_DIR}"
                    mkdir -p "${env.TARGET_DIR}"
                    rm -rf "${env.TARGET_DIR}"/*
                """
                script {
                    if (fileExists('frontend/build')) {
                        sh """
                            cp -r frontend/build/. "${env.TARGET_DIR}"/
                        """
                    } else {
                        sh """
                            for f in index.html style.css script.js; do
                                if [ -f "\$f" ]; then cp -f "\$f" "${env.TARGET_DIR}/"; fi
                            done
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}
