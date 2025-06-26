# GariPamoja - AI-Driven Peer-to-Peer Car Sharing Platform

**East Africa's First Luxury Peer-to-Peer Car Rental Marketplace, Powered by Agentic AI and Blockchain**

## 🚀 Project Overview

GariPamoja is a mobile-first, peer-to-peer platform enabling affluent car owners in Uganda (and later East Africa) to rent out luxury vehicles to qualified renters. The platform leverages cutting-edge AI, ML, and blockchain technologies to provide seamless, secure, and automated car sharing experiences.

## 🎯 Key Features

- **AI-Powered Platform**: LLM chatbots, dynamic pricing, fraud detection
- **Blockchain Integration**: Smart contracts, crypto payments, decentralized identity
- **Multi-Language Support**: English and Swahili
- **Advanced Security**: KYC verification, insurance integration, trust scoring
- **Mobile-First Design**: React Native app with premium UX
- **Real-time Analytics**: AI-driven insights and recommendations

## 🏗️ Architecture

```
GariPamoja/
├── backend/                 # Django REST API
├── frontend/                # React Native mobile app
├── ai-services/             # AI/ML microservices
├── blockchain/              # Smart contracts & crypto integration
├── infrastructure/          # DevOps & deployment
├── docs/                    # Documentation
└── tests/                   # Test suites
```

## 🛠️ Tech Stack

### Core Technologies
- **Backend**: Django 4.2+, Django REST Framework
- **Frontend**: React Native, Expo
- **Database**: PostgreSQL, Redis
- **Cloud**: AWS (ECS, S3, RDS, CloudFront)
- **AI/ML**: OpenAI GPT-4, Claude, LangChain, RAG
- **Blockchain**: Ethereum, USDC, Smart Contracts
- **Payments**: Flutterwave, Coinbase Commerce

### AI & ML Components
- **Chatbot**: LLM-powered support with RAG
- **Dynamic Pricing**: ML-based price optimization
- **Fraud Detection**: AI risk assessment
- **Recommendations**: Personalized car suggestions
- **Content Moderation**: AI-powered listing verification

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/isaacbuz/GariPamoja.git
cd GariPamoja
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start with Docker**
```bash
docker-compose up -d
```

4. **Run migrations**
```bash
docker-compose exec backend python manage.py migrate
```

5. **Create superuser**
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Development Setup

1. **Backend Setup**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npx expo start
```

3. **AI Services Setup**
```bash
cd ai-services
pip install -r requirements.txt
python app.py
```

## 📱 Mobile App

The React Native app provides:
- User registration and KYC
- Car listing and management
- Search and booking functionality
- Real-time messaging
- Payment processing
- AI-powered support

## 🤖 AI Services

### Chatbot Service
- 24/7 customer support
- FAQ handling
- Booking assistance
- Multi-language support

### Dynamic Pricing Engine
- Demand-based pricing
- Competitor analysis
- Seasonal adjustments
- Host recommendations

### Fraud Detection
- Behavioral analysis
- Risk scoring
- Suspicious activity detection
- Automated flagging

## 🔗 API Documentation

- **Backend API**: http://localhost:8000/api/docs/
- **AI Services**: http://localhost:8001/docs/
- **Admin Panel**: http://localhost:8000/admin/

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test

# E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Production Deployment
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic
```

### AWS Deployment
```bash
# Deploy to AWS ECS
aws ecs update-service --cluster gari-pamoja --service backend --force-new-deployment
```

## 📊 Monitoring & Analytics

- **Application Monitoring**: AWS CloudWatch, Sentry
- **Performance**: New Relic, Firebase Analytics
- **Security**: AWS GuardDuty, Security Hub
- **AI Model Monitoring**: Weights & Biases, MLflow

## 🔐 Security Features

- JWT authentication
- Data encryption (at rest and in transit)
- KYC verification
- Insurance integration
- Fraud detection
- Blockchain-based trust

## 🌍 Internationalization

- English and Swahili support
- Localized content and images
- Regional payment methods
- Cultural adaptation

## 📈 Business Metrics

- User acquisition and retention
- Booking conversion rates
- Revenue per transaction
- Host and renter satisfaction
- AI model performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

- **Email**: support@garipamoja.com
- **Phone**: +256 700 123 456
- **AI Chat**: Available 24/7 in the app

## 🗺️ Roadmap

- **Phase 1** (Q1 2026): MVP launch in Kampala
- **Phase 2** (Q2 2026): Kenya expansion
- **Phase 3** (Q3 2026): Tanzania and Rwanda
- **Phase 4** (Q4 2026): Full East Africa coverage

---

**Built with ❤️ for East Africa's growing digital economy** 