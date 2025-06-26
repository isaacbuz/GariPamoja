#!/bin/bash

# GariPamoja AWS Deployment Script
# This script deploys the platform to AWS using Terraform and ECS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
AWS_REGION=${AWS_REGION:-"eu-west-1"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
PROJECT_NAME="garipamoja"

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed"
        exit 1
    fi
    
    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        print_error "Terraform is not installed"
        exit 1
    fi
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured"
        exit 1
    fi
    
    print_success "Prerequisites met"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Get ECR login
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build and push backend
    print_status "Building backend image..."
    docker build -t $PROJECT_NAME-backend ./backend
    docker tag $PROJECT_NAME-backend:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-backend:latest
    
    # Build and push AI services
    print_status "Building AI services image..."
    docker build -t $PROJECT_NAME-ai-services ./ai-services
    docker tag $PROJECT_NAME-ai-services:latest $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-ai-services:latest
    docker push $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$PROJECT_NAME-ai-services:latest
    
    print_success "Docker images built and pushed"
}

# Deploy infrastructure with Terraform
deploy_infrastructure() {
    print_status "Deploying infrastructure with Terraform..."
    
    cd infrastructure/aws/terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan -out=tfplan
    
    # Apply deployment
    terraform apply tfplan
    
    # Get outputs
    ALB_DNS=$(terraform output -raw alb_dns_name)
    
    cd ../../../
    
    print_success "Infrastructure deployed"
    echo "Application URL: http://$ALB_DNS"
}

# Create ECS services
create_ecs_services() {
    print_status "Creating ECS services..."
    
    # Create backend service
    aws ecs create-service \
        --cluster $PROJECT_NAME-cluster \
        --service-name backend \
        --task-definition $PROJECT_NAME-backend:latest \
        --desired-count 3 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$(terraform output -raw private_subnet_ids)],securityGroups=[$(terraform output -raw ecs_security_group_id)]}" \
        --load-balancers "targetGroupArn=$(terraform output -raw backend_target_group_arn),containerName=backend,containerPort=8000"
    
    # Create AI services
    aws ecs create-service \
        --cluster $PROJECT_NAME-cluster \
        --service-name ai-services \
        --task-definition $PROJECT_NAME-ai-services:latest \
        --desired-count 2 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$(terraform output -raw private_subnet_ids)],securityGroups=[$(terraform output -raw ecs_security_group_id)]}" \
        --load-balancers "targetGroupArn=$(terraform output -raw ai_services_target_group_arn),containerName=ai-services,containerPort=8001"
    
    print_success "ECS services created"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Run migrations using ECS task
    aws ecs run-task \
        --cluster $PROJECT_NAME-cluster \
        --task-definition $PROJECT_NAME-backend:latest \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[$(terraform output -raw private_subnet_ids)],securityGroups=[$(terraform output -raw ecs_security_group_id)]}" \
        --overrides '{"containerOverrides":[{"name":"backend","command":["python","manage.py","migrate"]}]}'
    
    print_success "Migrations completed"
}

# Set up monitoring
setup_monitoring() {
    print_status "Setting up monitoring..."
    
    # Create CloudWatch dashboard
    aws cloudwatch put-dashboard \
        --dashboard-name $PROJECT_NAME-$ENVIRONMENT \
        --dashboard-body file://infrastructure/aws/cloudwatch-dashboard.json
    
    # Create alarms
    aws cloudwatch put-metric-alarm \
        --alarm-name "$PROJECT_NAME-backend-cpu-high" \
        --alarm-description "Backend CPU utilization is too high" \
        --metric-name CPUUtilization \
        --namespace AWS/ECS \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2
    
    print_success "Monitoring configured"
}

# Main deployment function
main() {
    print_status "Starting GariPamoja AWS deployment..."
    
    check_prerequisites
    build_and_push_images
    deploy_infrastructure
    create_ecs_services
    run_migrations
    setup_monitoring
    
    print_success "Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Update Route53 to point to the ALB"
    echo "2. Configure SSL certificate"
    echo "3. Set up CI/CD pipeline"
    echo "4. Monitor the application"
}

# Run main function
main "$@" 