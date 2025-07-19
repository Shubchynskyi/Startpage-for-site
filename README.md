# Portfolio Landing Page

A modern landing page with information about a developer and their projects. Includes links to resume, GitHub, and various applications with availability indicators.

## Features

- Responsive design for all devices
- Multilingual support (English/Russian/German/Ukrainian)
- Browser language auto-detection
- Dark/light theme toggle
- Project availability indicators
- Clean and modern design

## Project Structure

```
├── index.html          # Main page
├── css/
│   └── styles.css      # Styles
├── js/
│   ├── scripts.js      # Main JavaScript functionality
│   └── translations.js # Translations for all languages
├── Dockerfile          # Docker configuration 
├── nginx.conf          # Nginx configuration for container
├── setup-nginx.sh      # Script to set up host Nginx
├── deploy.sh           # Deployment script
├── Jenkinsfile         # Jenkins pipeline definition
└── README.md           # Documentation
```

## Deployment

The project uses Jenkins for CI/CD with Docker for containerization:

1. Jenkins pipeline checks out the code and runs the deployment script
2. The deployment script builds a Docker image with Nginx
3. The container is started on port 80
4. Host Nginx is configured to proxy requests to the container

### Manual Deployment

To deploy manually:

```bash
# Clone the repository
git clone https://github.com/shubchynskyi/startpage.git
cd startpage

# Run the deployment script
chmod +x deploy.sh
./deploy.sh
```

## Preview

To view the page locally, simply open `index.html` in your browser or build and run the Docker container:

```bash
docker build -t portfolio-startpage .
docker run -p 8080:80 portfolio-startpage
```

Then navigate to http://localhost:8080

## License

MIT