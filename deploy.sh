#!/bin/bash

# GariPamoja Deployment Script
# AI-driven peer-to-peer luxury car sharing platform for East Africa

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Docker
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "System requirements met"
}

# Function to create environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Created .env file from template. Please update with your actual values."
        else
            print_error "env.example file not found. Please create a .env file manually."
            exit 1
        fi
    else
        print_status ".env file already exists"
    fi
    
    # Check if required environment variables are set
    source .env
    
    required_vars=(
        "SECRET_KEY"
        "DATABASE_URL"
        "REDIS_URL"
        "POSTGRES_DB"
        "POSTGRES_USER"
        "POSTGRES_PASSWORD"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            print_warning "Environment variable $var is not set"
        fi
    done
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p logs
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p data/backups
    mkdir -p data/uploads
    mkdir -p infrastructure/ssl
    mkdir -p infrastructure/grafana/dashboards
    mkdir -p infrastructure/grafana/datasources
    
    print_success "Directories created"
}

# Function to generate SSL certificates (self-signed for development)
generate_ssl_certificates() {
    print_status "Generating SSL certificates..."
    
    if [ ! -f infrastructure/ssl/garipamoja.crt ] || [ ! -f infrastructure/ssl/garipamoja.key ]; then
        mkdir -p infrastructure/ssl
        
        # Generate self-signed certificate
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout infrastructure/ssl/garipamoja.key \
            -out infrastructure/ssl/garipamoja.crt \
            -subj "/C=UG/ST=Kampala/L=Kampala/O=GariPamoja/CN=localhost"
        
        print_success "SSL certificates generated"
    else
        print_status "SSL certificates already exist"
    fi
}

# Function to build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend
    print_status "Building backend image..."
    docker-compose build backend
    
    # Build AI services
    print_status "Building AI services image..."
    docker-compose build ai-services
    
    # Build frontend (if Dockerfile exists)
    if [ -f frontend/Dockerfile ]; then
        print_status "Building frontend image..."
        docker-compose build frontend
    fi
    
    print_success "Docker images built successfully"
}

# Function to start services
start_services() {
    print_status "Starting GariPamoja services..."
    
    # Start core services first
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    sleep 10
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    
    # Create superuser if it doesn't exist
    print_status "Creating superuser..."
    docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@garipamoja.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
"
    
    # Start all services
    docker-compose up -d
    
    print_success "Services started successfully"
}

# Function to check service health
check_health() {
    print_status "Checking service health..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    if curl -f http://localhost:8000/health/ >/dev/null 2>&1; then
        print_success "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check AI services health
    if curl -f http://localhost:8001/health >/dev/null 2>&1; then
        print_success "AI Services are healthy"
    else
        print_warning "AI Services health check failed"
    fi
    
    # Check frontend (if running)
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
}

# Function to display service information
display_info() {
    print_success "GariPamoja deployment completed!"
    echo
    echo "Service URLs:"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost:8000"
    echo "  AI Services: http://localhost:8001"
    echo "  Admin Interface: http://localhost:8000/admin"
    echo "  API Documentation: http://localhost:8000/api/docs/"
    echo
    echo "Monitoring:"
    echo "  Prometheus: http://localhost:9090"
    echo "  Grafana: http://localhost:3001 (admin/admin)"
    echo "  Kibana: http://localhost:5601"
    echo
    echo "Default credentials:"
    echo "  Admin: admin/admin123"
    echo
    echo "Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
    echo "  Update services: docker-compose pull && docker-compose up -d"
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Run backend tests
    docker-compose exec -T backend python manage.py test
    
    # Run AI services tests (if available)
    if [ -f ai-services/test_app.py ]; then
        docker-compose exec -T ai-services python test_app.py
    fi
    
    print_success "Tests completed"
}

# Function to backup data
backup_data() {
    print_status "Creating backup..."
    
    timestamp=$(date +%Y%m%d_%H%M%S)
    backup_dir="data/backups/backup_$timestamp"
    
    mkdir -p "$backup_dir"
    
    # Backup database
    docker-compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$backup_dir/database.sql"
    
    # Backup uploads
    if [ -d data/uploads ]; then
        cp -r data/uploads "$backup_dir/"
    fi
    
    print_success "Backup created: $backup_dir"
}

# Function to restore data
restore_data() {
    if [ -z "$1" ]; then
        print_error "Please specify backup directory"
        exit 1
    fi
    
    backup_dir="$1"
    
    if [ ! -d "$backup_dir" ]; then
        print_error "Backup directory not found: $backup_dir"
        exit 1
    fi
    
    print_status "Restoring from backup: $backup_dir"
    
    # Restore database
    if [ -f "$backup_dir/database.sql" ]; then
        docker-compose exec -T postgres psql -U "$POSTGRES_USER" "$POSTGRES_DB" < "$backup_dir/database.sql"
    fi
    
    # Restore uploads
    if [ -d "$backup_dir/uploads" ]; then
        cp -r "$backup_dir/uploads" data/
    fi
    
    print_success "Restore completed"
}

# Function to show logs
show_logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Stop and remove containers
    docker-compose down -v
    
    # Remove images
    docker-compose down --rmi all
    
    # Remove volumes
    docker volume prune -f
    
    print_success "Cleanup completed"
}

# Main script logic
main() {
    case "${1:-deploy}" in
        "deploy")
            check_requirements
            setup_environment
            create_directories
            generate_ssl_certificates
            build_images
            start_services
            check_health
            display_info
            ;;
        "test")
            run_tests
            ;;
        "backup")
            backup_data
            ;;
        "restore")
            restore_data "$2"
            ;;
        "logs")
            show_logs "$2"
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "GariPamoja Deployment Script"
            echo
            echo "Usage: $0 [command]"
            echo
            echo "Commands:"
            echo "  deploy    - Deploy the entire platform (default)"
            echo "  test      - Run tests"
            echo "  backup    - Create backup of data"
            echo "  restore   - Restore from backup"
            echo "  logs      - Show logs (optionally specify service)"
            echo "  cleanup   - Clean up all containers and images"
            echo "  help      - Show this help message"
            ;;
        *)
            print_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@" 