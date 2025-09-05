# Microservice Authentication & Email Notification System

A modern microservice architecture built with NestJS, featuring user authentication and automated email notifications using RabbitMQ for inter-service communication.

## 🏗️ Architecture Overview

This project consists of three independent microservices:

- **Auth Service** (Port 3000): Handles user registration and authentication
- **Mail Service** (Port 3001): Processes email notifications via RabbitMQ events
- **Product Service** (Port 3002): Manages product CRUD operations with gRPC communication

## 🚀 Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **Product Management**: Full CRUD operations for products with owner tracking
- **Event-Driven Architecture**: RabbitMQ-based communication between services
- **gRPC Communication**: High-performance inter-service communication for product data
- **Email Notifications**: Automated notifications for product events and user login
- **Database Integration**: PostgreSQL with TypeORM for data persistence
- **Environment Configuration**: Secure configuration management
- **TypeScript**: Full type safety and modern development experience

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **PostgreSQL** database
- **RabbitMQ** server
- **Gmail account** with App Password enabled

## 🛠️ Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd microservice_nextjs_rabbitmq
```

### 2. Install dependencies for all services
```bash
# Install auth-service dependencies
cd auth-service
npm install

# Install mail-service dependencies
cd ../mail-service
npm install

# Install product-service dependencies
cd ../product-service
npm install
```

### 3. Database Setup
Create a PostgreSQL database named `Next_User_DB` and update the connection details in both `auth-service/src/app.module.ts` and `product-service/src/app.module.ts`:

```typescript
TypeOrmModule.forRoot({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'your_password',
  database: 'Next_User_DB',
  entities: [User], // or [Product] for product-service
  synchronize: true, // For development only
})
```

### 4. RabbitMQ Setup
Start RabbitMQ server on `localhost:5672` with default credentials (`guest:guest`).

### 5. Email Configuration
Create a `.env` file in the `mail-service` directory:

```env
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-gmail-app-password
MAIL_FROM="Auth System" <your-email@gmail.com>
```

**Note**: Use Gmail App Password, not your regular password. Enable 2FA and generate an App Password in your Google Account settings.

## 🚀 Running the Application

### Start RabbitMQ
```bash
# Using Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Or install and start RabbitMQ locally
```

### Start the Services

**Terminal 1 - Auth Service:**
```bash
cd auth-service
npm run start:dev
```

**Terminal 2 - Mail Service:**
```bash
cd mail-service
npm run start:dev
```

**Terminal 3 - Product Service:**
```bash
cd product-service
npm run start:dev
```

All services will start and connect to their respective communication channels automatically.

## 📡 API Endpoints

### Auth Service (Port 3000)

#### Register User
```http
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login User
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "password": "$2b$10$..."
  }
}
```

### Product Service (Port 3002)

#### Create Product
```http
POST http://localhost:3002/product
Content-Type: application/json

{
  "name": "Sample Product",
  "description": "A sample product description",
  "price": 99.99,
  "userEmail": "owner@example.com"
}
```

#### Get All Products
```http
GET http://localhost:3002/product
```

#### Get Product by ID
```http
GET http://localhost:3002/product/1
```

#### Update Product
```http
PATCH http://localhost:3002/product/1
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 149.99
}
```

#### Delete Product
```http
DELETE http://localhost:3002/product/1
```

## 🔄 Event Flow

1. **User Registration**: Creates user account in PostgreSQL database
2. **User Login**: 
   - Validates credentials against database
   - Emits `user_logged_in` event to RabbitMQ queue
   - Returns success response
3. **Product Operations**:
   - Create/Update/Delete products via REST API
   - Emits `product_created`, `product_updated`, `product_deleted` events to RabbitMQ
   - gRPC service provides product data to other services
4. **Email Notifications**: 
   - Mail service receives events from RabbitMQ
   - Sends appropriate notification emails via Gmail SMTP
   - Fetches product details via gRPC when needed

## 🏛️ Project Structure

```
microservice_nextjs_rabbitmq/
├── auth-service/                 # Authentication microservice
│   ├── src/
│   │   ├── auth/                # Auth module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   └── user.entity.ts   # TypeORM entity
│   │   ├── app.module.ts        # Main module with TypeORM config
│   │   └── main.ts              # HTTP server bootstrap
│   └── package.json
├── mail-service/                 # Email notification microservice
│   ├── src/
│   │   ├── mail.controller.ts   # RabbitMQ event handler
│   │   ├── mail.service.ts      # Email sending logic + gRPC client
│   │   ├── app.module.ts        # Main module with ConfigModule
│   │   └── main.ts              # HTTP + Microservice bootstrap
│   └── package.json
├── product-service/              # Product management microservice
│   ├── src/
│   │   ├── product/             # Product module
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── product.controller.ts      # REST API controller
│   │   │   ├── product.grpc.controller.ts # gRPC controller
│   │   │   ├── product.service.ts         # Business logic + RabbitMQ client
│   │   │   ├── product.module.ts          # Product module
│   │   │   ├── product.entity.ts          # TypeORM entity
│   │   │   └── product.proto              # gRPC protocol definition
│   │   ├── app.module.ts        # Main module with TypeORM config
│   │   └── main.ts              # HTTP + gRPC server bootstrap
│   └── package.json
└── README.MD
```

## 🔧 Technology Stack

### Auth Service
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: bcrypt for password hashing
- **Message Queue**: RabbitMQ (Client)
- **Language**: TypeScript

### Mail Service
- **Framework**: NestJS
- **Email**: Nodemailer with Gmail SMTP
- **Message Queue**: RabbitMQ (Consumer)
- **gRPC**: Client for product data communication
- **Configuration**: @nestjs/config
- **Language**: TypeScript

### Product Service
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **API**: REST endpoints for CRUD operations
- **gRPC**: Server for inter-service communication
- **Message Queue**: RabbitMQ (Producer)
- **Language**: TypeScript

## 🧪 Testing

Run tests for each service:

```bash
# Auth Service Tests
cd auth-service
npm run test

# Mail Service Tests
cd mail-service
npm run test

# Product Service Tests
cd product-service
npm run test
```

## 🚀 Production Deployment

### Build for Production
```bash
# Auth Service
cd auth-service
npm run build
npm run start:prod

# Mail Service
cd mail-service
npm run build
npm run start:prod

# Product Service
cd product-service
npm run build
npm run start:prod
```

### Environment Variables
Set production environment variables:
- Database connection strings
- RabbitMQ connection details
- Gmail SMTP credentials
- gRPC service endpoints
- Service ports

## 🔒 Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 10
- Database credentials should be stored in environment variables
- Gmail App Passwords should be used instead of regular passwords
- Consider implementing JWT tokens for session management
- Add input validation and sanitization
- Implement rate limiting for authentication endpoints

## 🐛 Troubleshooting

### Common Issues

1. **RabbitMQ Connection Failed**
   - Ensure RabbitMQ server is running on port 5672
   - Check connection credentials

2. **Database Connection Error**
   - Verify PostgreSQL is running
   - Check database credentials and database exists

3. **Email Sending Failed**
   - Verify Gmail App Password is correct
   - Check if 2FA is enabled on Gmail account
   - Ensure less secure app access is configured

4. **TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check if type definitions are missing (`@types/*` packages)

## 📝 License

This project is licensed under the UNLICENSED license.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please open an issue in the repository.
