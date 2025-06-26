#!/bin/bash

# Setup Kubernetes Secrets for GariPamoja Production
# This script creates all necessary secrets for the production deployment

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE=${NAMESPACE:-garipamoja}
ENV_FILE=${ENV_FILE:-.env.production}

echo -e "${GREEN}Setting up Kubernetes secrets for GariPamoja${NC}"

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}kubectl is not installed. Please install kubectl first.${NC}"
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Not connected to a Kubernetes cluster. Please configure kubectl.${NC}"
    exit 1
fi

# Create namespace if it doesn't exist
echo -e "${YELLOW}Creating namespace ${NAMESPACE}...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Check if env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Environment file ${ENV_FILE} not found!${NC}"
    echo -e "${YELLOW}Creating template environment file...${NC}"
    
    cat > ${ENV_FILE} << 'EOF'
# Django Settings
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.garipamoja.com,*.garipamoja.com

# Database
DATABASE_URL=postgres://user:password@host:5432/garipamoja
REDIS_URL=redis://redis:6379/0

# AWS Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=garipamoja-media
AWS_S3_REGION_NAME=eu-west-1

# Payment Providers
STRIPE_SECRET_KEY=sk_live_your-stripe-secret
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-mpesa-shortcode
MPESA_PASSKEY=your-mpesa-passkey
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# AI Services
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
HUGGINGFACE_API_KEY=your-huggingface-api-key

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password
DEFAULT_FROM_EMAIL=noreply@garipamoja.com

# SMS Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEW_RELIC_LICENSE_KEY=your-new-relic-license-key

# Security
CORS_ALLOWED_ORIGINS=https://garipamoja.com,https://app.garipamoja.com
CSRF_TRUSTED_ORIGINS=https://garipamoja.com,https://app.garipamoja.com
EOF
    
    echo -e "${YELLOW}Template environment file created at ${ENV_FILE}${NC}"
    echo -e "${RED}Please edit ${ENV_FILE} with your actual values before running this script again.${NC}"
    exit 1
fi

# Create Django secret
echo -e "${YELLOW}Creating Django application secrets...${NC}"
kubectl create secret generic django-secrets \
    --from-env-file=${ENV_FILE} \
    --namespace=${NAMESPACE} \
    --dry-run=client -o yaml | kubectl apply -f -

# Create database secret
echo -e "${YELLOW}Creating database secrets...${NC}"
kubectl create secret generic postgres-secrets \
    --from-literal=POSTGRES_USER=$(grep DATABASE_URL ${ENV_FILE} | sed 's/.*:\/\/\([^:]*\):.*/\1/') \
    --from-literal=POSTGRES_PASSWORD=$(grep DATABASE_URL ${ENV_FILE} | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/') \
    --from-literal=POSTGRES_DB=garipamoja \
    --namespace=${NAMESPACE} \
    --dry-run=client -o yaml | kubectl apply -f -

# Create Redis secret
echo -e "${YELLOW}Creating Redis secrets...${NC}"
kubectl create secret generic redis-secrets \
    --from-literal=REDIS_PASSWORD=$(openssl rand -base64 32) \
    --namespace=${NAMESPACE} \
    --dry-run=client -o yaml | kubectl apply -f -

# Create TLS certificates secret (if certificates exist)
if [ -f "infrastructure/ssl/fullchain.pem" ] && [ -f "infrastructure/ssl/privkey.pem" ]; then
    echo -e "${YELLOW}Creating TLS certificate secrets...${NC}"
    kubectl create secret tls garipamoja-tls \
        --cert=infrastructure/ssl/fullchain.pem \
        --key=infrastructure/ssl/privkey.pem \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo -e "${YELLOW}TLS certificates not found. Skipping TLS secret creation.${NC}"
    echo -e "${YELLOW}You can create them later using cert-manager or by providing certificates.${NC}"
fi

# Create image pull secret for private registries
echo -e "${YELLOW}Creating image pull secrets...${NC}"
read -p "Do you need to create an image pull secret for a private registry? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Docker registry server (e.g., docker.io, ghcr.io): " DOCKER_REGISTRY
    read -p "Docker username: " DOCKER_USERNAME
    read -sp "Docker password: " DOCKER_PASSWORD
    echo
    read -p "Docker email: " DOCKER_EMAIL
    
    kubectl create secret docker-registry regcred \
        --docker-server=${DOCKER_REGISTRY} \
        --docker-username=${DOCKER_USERNAME} \
        --docker-password=${DOCKER_PASSWORD} \
        --docker-email=${DOCKER_EMAIL} \
        --namespace=${NAMESPACE} \
        --dry-run=client -o yaml | kubectl apply -f -
fi

# Create monitoring secrets
echo -e "${YELLOW}Creating monitoring secrets...${NC}"
kubectl create secret generic monitoring-secrets \
    --from-literal=GRAFANA_ADMIN_PASSWORD=$(openssl rand -base64 32) \
    --from-literal=PROMETHEUS_ADMIN_PASSWORD=$(openssl rand -base64 32) \
    --namespace=${NAMESPACE} \
    --dry-run=client -o yaml | kubectl apply -f -

# Verify secrets
echo -e "${GREEN}Verifying created secrets...${NC}"
kubectl get secrets -n ${NAMESPACE}

# Create configmap for non-sensitive configuration
echo -e "${YELLOW}Creating configuration ConfigMap...${NC}"
kubectl create configmap garipamoja-config \
    --from-literal=DJANGO_SETTINGS_MODULE=garipamoja.settings \
    --from-literal=ENVIRONMENT=production \
    --from-literal=LOG_LEVEL=INFO \
    --namespace=${NAMESPACE} \
    --dry-run=client -o yaml | kubectl apply -f -

# Save secret backup
echo -e "${YELLOW}Creating encrypted backup of secrets...${NC}"
BACKUP_DIR="backups/k8s-secrets-$(date +%Y%m%d-%H%M%S)"
mkdir -p ${BACKUP_DIR}

# Export secrets
for secret in $(kubectl get secrets -n ${NAMESPACE} -o name | grep -v default-token); do
    secret_name=$(echo $secret | cut -d'/' -f2)
    kubectl get $secret -n ${NAMESPACE} -o yaml > ${BACKUP_DIR}/${secret_name}.yaml
done

# Encrypt backup
tar -czf ${BACKUP_DIR}.tar.gz ${BACKUP_DIR}
openssl enc -aes-256-cbc -salt -in ${BACKUP_DIR}.tar.gz -out ${BACKUP_DIR}.tar.gz.enc
rm -rf ${BACKUP_DIR} ${BACKUP_DIR}.tar.gz

echo -e "${GREEN}Secrets backup created at ${BACKUP_DIR}.tar.gz.enc${NC}"
echo -e "${YELLOW}Store this backup securely and remember the encryption password!${NC}"

echo -e "${GREEN}✅ Kubernetes secrets setup completed successfully!${NC}"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy the application using: kubectl apply -f infrastructure/k8s/production/"
echo "2. Check deployment status: kubectl get pods -n ${NAMESPACE}"
echo "3. View logs: kubectl logs -n ${NAMESPACE} -l app=garipamoja-backend"
echo
echo -e "${YELLOW}Important:${NC}"
echo "- Keep the ${ENV_FILE} file secure and never commit it to version control"
echo "- Store the secrets backup encryption password in a secure location"
echo "- Regularly rotate sensitive credentials like API keys and passwords" 