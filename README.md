# Foodsera 🍔

A modern, scalable food delivery application built with microservices architecture. Foodsera enables users to browse restaurants, place orders, make payments, and track deliveries in real-time.

![Foodsera](https://img.shields.io/badge/status-active-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-18+-blue) ![Docker](https://img.shields.io/badge/Docker-enabled-blue)

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Services](#services)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)

## 🎯 Overview

Foodsera is a comprehensive food delivery platform featuring:

- **User Management**: Registration, authentication, and profile management
- **Restaurant Management**: Restaurant listings, menus, categories, and items
- **Order Management**: Create, track, and manage food orders
- **Payment Processing**: Secure payment integration with Stripe
- **Delivery Tracking**: Real-time delivery status and driver tracking
- **Admin Dashboard**: Comprehensive admin panel for managing the platform
- **Notifications**: SMS and email notifications for orders and delivery updates

## 🏗️ Architecture

Foodsera uses a **microservices architecture** with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              API Gateway (Load Balancer)                     │
└──┬──────┬──────┬───────┬───────┬────────┬──────┬───────────┘
   │      │      │       │       │        │      │
   ▼      ▼      ▼       ▼       ▼        ▼      ▼
 Auth   Admin  Order  Payment Order   Delivery Notification
Service Service Service Service Service  Service   Service
   │      │      │       │       │        │      │
   └──────┴──────┴───────┴───────┴────────┴──────┘
           Database Layer (MongoDB/Firebase)
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Forms**: React Hook Form

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB / Firebase
- **Authentication**: Firebase Auth / JWT
- **File Storage**: Firebase Cloud Storage
- **Payment**: Stripe API
- **SMS/Email**: Custom SMS & Email Services

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Container Registry**: Docker Hub

## 📁 Project Structure

```
Foodsera/
├── backend/                    # Node.js microservices
│   ├── services/
│   │   ├── admin/             # Admin service
│   │   ├── auth/              # Authentication service
│   │   ├── delivery/          # Delivery tracking service
│   │   ├── gateway/           # API Gateway
│   │   ├── notification/      # SMS/Email notifications
│   │   ├── order/             # Order management service
│   │   ├── payment/           # Payment processing service
│   │   └── restaurant/        # Restaurant management service
│   └── docker-compose.yml     # Local development setup
│
├── foodsera-app/              # React frontend
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── contexts/          # React Context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions & types
│   │   └── api/               # API service calls
│   ├── public/                # Static assets
│   └── package.json
│
├── k8s/                       # Kubernetes manifests
│   ├── admin-service/
│   ├── auth-service/
│   ├── delivery-service/
│   ├── frontend/
│   ├── gateway/
│   ├── notification-service/
│   ├── order-service/
│   ├── payment-service/
│   └── restaurent-service/
│
└── docker-compose.yml         # Main Docker Compose configuration
```

## 🔧 Services

### Gateway Service
- Entry point for all API requests
- Load balancing and request routing
- Rate limiting and request validation

### Auth Service
- User registration and login
- JWT token generation and validation
- Password management
- Firebase authentication integration

### Restaurant Service
- Restaurant CRUD operations
- Menu management (categories and items)
- Restaurant search and filtering
- Image uploads

### Order Service
- Order creation and management
- Order status tracking
- Order history and details
- Order validation

### Payment Service
- Stripe payment processing
- Payment status management
- Invoice generation
- Transaction records

### Delivery Service
- Driver management
- Real-time delivery tracking
- Delivery status updates
- Driver assignment to orders

### Notification Service
- SMS notifications via Twilio/custom SMS provider
- Email notifications
- Push notifications
- Notification history

### Admin Service
- Admin dashboard functionality
- Platform analytics and reports
- User and restaurant management
- System configurations

## 📦 Prerequisites

- **Node.js** v18+
- **npm** or **yarn**
- **Docker** & **Docker Compose**
- **MongoDB** (or Firebase Firestore)
- **Kubernetes** (for K8s deployment)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/foodsera.git
cd Foodsera
```

### 2. Install Frontend Dependencies

```bash
cd foodsera-app
npm install
cd ..
```

### 3. Install Backend Dependencies

```bash
for service in backend/services/*/; do
  cd "$service"
  npm install
  cd ../../..
done
```

### 4. Environment Setup

Create `.env` files for each service:

```bash
# backend/services/auth/.env
MONGO_URI=mongodb://localhost:27017/foodsera
JWT_SECRET=your_jwt_secret
FIREBASE_CONFIG=your_firebase_config

# backend/services/payment/.env
STRIPE_SECRET_KEY=your_stripe_key

# backend/services/notification/.env
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

## 💻 Running Locally

### Option 1: Direct Node.js

```bash
# Terminal 1 - Frontend
cd foodsera-app
npm run dev

# Terminal 2 - Auth Service
cd backend/services/auth
npm start

# Terminal 3 - Restaurant Service
cd backend/services/restaurant
npm start

# Continue for other services...
```

### Option 2: Docker Compose

```bash
docker-compose up --build
```

This will start all services and the frontend on their respective ports.

## 🐳 Docker Deployment

### Build Docker Images

```bash
# Build all services
docker-compose build

# Or build individual services
docker build -t foodsera-gateway:latest ./backend/services/gateway
docker build -t foodsera-auth:latest ./backend/services/auth
docker build -t foodsera-frontend:latest ./foodsera-app
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Access Services
- Frontend: http://localhost:3000
- API Gateway: http://localhost:5000
- Services on their configured ports

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, EKS, GKE, etc.)
- `kubectl` configured
- Docker images pushed to registry

### Deploy to Kubernetes

```bash
# Apply all K8s manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get svc

# View logs
kubectl logs -f deployment/auth-service
```

### Accessing Services

```bash
# Get service IPs
kubectl get svc

# Port forward to access locally
kubectl port-forward svc/frontend-service 3000:80
kubectl port-forward svc/gateway-service 5000:5000
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ by the Group Members**
