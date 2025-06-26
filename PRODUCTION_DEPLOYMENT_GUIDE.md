# GariPamoja Production Deployment Guide

This guide provides comprehensive instructions for deploying GariPamoja to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deployment Options](#deployment-options)
3. [AWS Deployment](#aws-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Post-Deployment Steps](#post-deployment-steps)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)
8. [Security Checklist](#security-checklist)

## Prerequisites

### Required Tools
- Docker and Docker Compose
- AWS CLI (for AWS deployment)
- kubectl (for Kubernetes deployment)
- Terraform (for infrastructure provisioning)
- Git
- OpenSSL (for certificate management)

### Required Accounts/Services
- Domain name registered and configured
- SSL certificates (or use Let's Encrypt)
- Cloud provider account (AWS, GCP, or Azure)
- Payment provider accounts (Stripe, M-Pesa, PayPal)
- AI service API keys (OpenAI, Anthropic)
- Email service provider (SendGrid, AWS SES, etc.)
- SMS service provider (Twilio, Africa's Talking)
- Monitoring services (Sentry, New Relic - optional)

## Deployment Options

### Option 1: AWS ECS Fargate
- **Best for**: Teams familiar with AWS, wanting managed container orchestration
- **Pros**: Serverless containers, auto-scaling, integrated with AWS services
- **Cons**: AWS vendor lock-in, can be expensive at scale

### Option 2: Kubernetes
- **Best for**: Teams wanting cloud-agnostic deployment, maximum control
- **Pros**: Portable across clouds, extensive ecosystem, fine-grained control
- **Cons**: More complex to manage, requires Kubernetes expertise

### Option 3: Traditional VMs
- **Best for**: Teams with existing VM infrastructure
- **Pros**: Familiar deployment model, full control
- **Cons**: Manual scaling, more maintenance overhead

## AWS Deployment

### Step 1: Prepare Environment

```bash
# Clone the repository
git clone https://github.com/isaacbuz/GariPamoja.git
cd GariPamoja

# Create production environment file
cp env.example .env.production
# Edit .env.production with your production values
```

### Step 2: Configure AWS Credentials

```bash
# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region (eu-west-1)

# Verify configuration
aws sts get-caller-identity
```

### Step 3: Provision Infrastructure

```bash
# Navigate to Terraform directory
cd infrastructure/aws/terraform

# Initialize Terraform
terraform init

# Review the infrastructure plan
terraform plan

# Apply the infrastructure
terraform apply
```

### Step 4: Build and Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin [YOUR_ECR_URL]

# Build images
docker build -t garipamoja-backend ./backend
docker build -t garipamoja-ai-services ./ai-services

# Tag images
docker tag garipamoja-backend:latest [YOUR_ECR_URL]/garipamoja-backend:latest
docker tag garipamoja-ai-services:latest [YOUR_ECR_URL]/garipamoja-ai-services:latest

# Push images
docker push [YOUR_ECR_URL]/garipamoja-backend:latest
docker push [YOUR_ECR_URL]/garipamoja-ai-services:latest
```

### Step 5: Deploy Application

```bash
# Run the deployment script
./scripts/deploy-aws.sh production

# Or manually trigger GitHub Actions workflow
# Go to GitHub Actions → Deploy to Production → Run workflow
```

### Step 6: Configure Domain and SSL

1. Update Route 53 (or your DNS provider) to point to the ALB
2. Configure SSL certificate in AWS Certificate Manager
3. Update ALB listener to use HTTPS

## Kubernetes Deployment

### Step 1: Prepare Kubernetes Cluster

```bash
# For AWS EKS
eksctl create cluster --name garipamoja-cluster --region eu-west-1

# For GKE
gcloud container clusters create garipamoja-cluster --zone europe-west1-b

# For AKS
az aks create --resource-group garipamoja-rg --name garipamoja-cluster
```

### Step 2: Setup Secrets

```bash
# Run the secrets setup script
./scripts/setup-k8s-secrets.sh

# This will create all necessary secrets in Kubernetes
```

### Step 3: Deploy Application

```bash
# Apply Kubernetes manifests
kubectl apply -f infrastructure/k8s/production/

# Verify deployment
kubectl get pods -n garipamoja
kubectl get services -n garipamoja
```

### Step 4: Setup Ingress and SSL

```bash
# Install cert-manager for automatic SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.12.0/cert-manager.yaml

# Apply ingress configuration
kubectl apply -f infrastructure/k8s/production/ingress.yaml
```

## Post-Deployment Steps

### 1. Database Migrations

```bash
# For AWS ECS
aws ecs run-task --cluster garipamoja-cluster --task-definition garipamoja-migrate

# For Kubernetes
kubectl exec -it deployment/backend -n garipamoja -- python manage.py migrate
```

### 2. Create Superuser

```bash
# For AWS ECS
aws ecs run-task --cluster garipamoja-cluster --task-definition garipamoja-createsuperuser

# For Kubernetes
kubectl exec -it deployment/backend -n garipamoja -- python manage.py createsuperuser
```

### 3. Collect Static Files

```bash
# For AWS ECS
aws ecs run-task --cluster garipamoja-cluster --task-definition garipamoja-collectstatic

# For Kubernetes
kubectl exec -it deployment/backend -n garipamoja -- python manage.py collectstatic --noinput
```

### 4. Configure Payment Webhooks

1. **Stripe**: Add webhook endpoint `https://api.garipamoja.com/api/v1/payments/stripe/webhook/`
2. **M-Pesa**: Configure callback URL in Safaricom portal
3. **PayPal**: Set up IPN URL in PayPal dashboard

### 5. Setup Monitoring

```bash
# Access Grafana dashboard
# For Kubernetes: kubectl port-forward service/grafana 3000:3000 -n monitoring
# Default credentials: admin/admin (change immediately)

# Import dashboard
# Use the dashboard at infrastructure/monitoring/grafana-dashboard.json
```

## Monitoring and Maintenance

### Health Checks

```bash
# Backend health check
curl https://api.garipamoja.com/health/

# AI services health check
curl https://api.garipamoja.com/ai/health/
```

### Logs

```bash
# AWS CloudWatch
aws logs tail /ecs/garipamoja-backend --follow

# Kubernetes
kubectl logs -f deployment/backend -n garipamoja
```

### Metrics

- CPU and Memory usage via Grafana dashboards
- Application metrics via Prometheus
- Business metrics via Django admin dashboard

### Backups

```bash
# Database backup (runs daily via cron)
./scripts/backup-database.sh

# Media files backup (to S3)
aws s3 sync /data/uploads s3://garipamoja-backups/media/
```

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if backend pods/tasks are running
   - Verify health checks are passing
   - Check security group rules

2. **Database Connection Errors**
   - Verify database credentials in secrets
   - Check network connectivity
   - Ensure RDS security group allows connections

3. **Payment Integration Failures**
   - Verify API keys are correct
   - Check webhook URLs are accessible
   - Review payment provider logs

4. **AI Service Timeouts**
   - Check AI service health
   - Verify API keys and rate limits
   - Scale AI service replicas if needed

### Debug Commands

```bash
# Get pod logs
kubectl logs -f pod-name -n garipamoja

# Describe pod for events
kubectl describe pod pod-name -n garipamoja

# Execute commands in container
kubectl exec -it pod-name -n garipamoja -- /bin/bash

# Check service endpoints
kubectl get endpoints -n garipamoja
```

## Security Checklist

### Pre-Deployment
- [ ] All secrets stored in secure secret management
- [ ] Environment variables reviewed for sensitive data
- [ ] SSL certificates configured and valid
- [ ] Security groups/firewall rules reviewed
- [ ] Database encrypted at rest
- [ ] S3 buckets have proper access policies

### Application Security
- [ ] Django DEBUG = False
- [ ] ALLOWED_HOSTS configured correctly
- [ ] CORS origins restricted
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Input validation on all endpoints

### Infrastructure Security
- [ ] VPC properly configured with private subnets
- [ ] Bastion host for SSH access (if needed)
- [ ] Container images scanned for vulnerabilities
- [ ] IAM roles follow least privilege principle
- [ ] Monitoring and alerting configured
- [ ] Backup encryption enabled

### Compliance
- [ ] GDPR compliance measures in place
- [ ] Data residency requirements met
- [ ] Audit logging enabled
- [ ] Terms of service and privacy policy updated
- [ ] Payment PCI compliance verified

## Rollback Procedures

### Quick Rollback

```bash
# For AWS ECS
aws ecs update-service --cluster garipamoja-cluster --service backend --task-definition backend:PREVIOUS_VERSION

# For Kubernetes
kubectl rollout undo deployment/backend -n garipamoja
```

### Full Rollback

1. Revert code changes in Git
2. Rebuild and push previous Docker images
3. Update task definitions/deployments
4. Run database migrations if needed
5. Clear caches
6. Verify functionality

## Support and Maintenance

### Regular Maintenance Tasks

1. **Daily**
   - Monitor error rates and performance
   - Check backup completion
   - Review security alerts

2. **Weekly**
   - Update dependencies for security patches
   - Review and optimize slow queries
   - Check disk usage and logs rotation

3. **Monthly**
   - Security audit
   - Performance optimization review
   - Cost optimization review
   - Disaster recovery drill

### Emergency Contacts

- **On-call Engineer**: [Configure PagerDuty/OpsGenie]
- **Database Admin**: [Contact]
- **Security Team**: [Contact]
- **Payment Provider Support**: [Contacts]

## Conclusion

This guide covers the essential steps for deploying GariPamoja to production. Always test changes in a staging environment first, maintain regular backups, and monitor the system continuously.

For additional support or questions, please refer to the project documentation or contact the development team. 