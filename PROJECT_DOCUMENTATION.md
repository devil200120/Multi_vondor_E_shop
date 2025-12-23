# Multi-Vendor E-Commerce Platform - Comprehensive Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Frontend Components](#frontend-components)
9. [Real-time Features](#real-time-features)
10. [Advanced Features](#advanced-features)
11. [Deployment](#deployment)
12. [Development Setup](#development-setup)

## 🚀 Project Overview

**Wanttar** is a comprehensive multi-vendor e-commerce platform designed to facilitate online marketplace operations with support for multiple sellers, customers, and administrative management. The platform provides a complete solution for modern e-commerce needs with advanced features like real-time tracking, dynamic pricing, and AI-powered assistance.

### Key Highlights
- **Multi-vendor Architecture**: Support for multiple sellers with individual dashboards
- **Role-based Access Control**: Admin, Seller, and Customer roles with specific permissions
- **Dynamic Product Attributes**: Advanced product customization with price variations
- **Real-time Features**: Live order tracking, messaging, and notifications
- **Payment Integration**: Stripe and PayPal payment gateways
- **Invoice System**: Automated PDF invoice generation
- **AI Assistance**: Integrated AI chatbot for customer support

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄───┤   Backend API   │◄───┤   Database      │
│   (React.js)    │    │   (Express.js)  │    │   (MongoDB)     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────┤  Socket Server  ├──────────────┘
                        │   (Socket.io)   │
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  External APIs  │
                        │ (Stripe, PayPal,│
                        │  Cloudinary)    │
                        └─────────────────┘
```

### Service Architecture

#### 1. **Frontend Service (React.js)**
- **Port**: 3000
- **Purpose**: User interface for customers, sellers, and admin
- **Technology**: React 18.2.0, Redux Toolkit, Tailwind CSS
- **Key Features**:
  - Responsive design with mobile-first approach
  - Component-based architecture
  - State management with Redux
  - Real-time updates via Socket.io

#### 2. **Backend API (Express.js)**
- **Port**: 8000 (configurable)
- **Purpose**: RESTful API server handling business logic
- **Technology**: Express.js, Node.js 18+
- **Key Features**:
  - JWT authentication
  - Role-based authorization
  - File upload handling with Multer
  - Error handling middleware
  - Rate limiting and security

#### 3. **Socket Server (Socket.io)**
- **Port**: 4000
- **Purpose**: Real-time communication
- **Technology**: Socket.io, Express.js
- **Key Features**:
  - Real-time messaging
  - Order status updates
  - Live delivery tracking
  - User online status

#### 4. **Database (MongoDB)**
- **Purpose**: Data persistence
- **Technology**: MongoDB with Mongoose ODM
- **Features**:
  - Document-based storage
  - Aggregation pipelines
  - Indexing for performance
  - Transactions support

## 💻 Technology Stack

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >=18.16.0 | Runtime environment |
| Express.js | ^4.18.2 | Web framework |
| MongoDB | ^7.0.0 | Database |
| Mongoose | ^7.0.0 | ODM |
| Socket.io | ^4.6.1 | Real-time communication |
| JWT | ^9.0.0 | Authentication |
| Stripe | ^12.0.0 | Payment processing |
| Cloudinary | ^2.7.0 | Image management |
| Multer | ^1.4.5 | File uploads |
| Puppeteer | ^24.22.3 | PDF generation |
| Nodemailer | ^6.9.1 | Email service |

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^18.2.0 | UI framework |
| Redux Toolkit | ^1.9.3 | State management |
| React Router | ^6.8.2 | Routing |
| Tailwind CSS | ^3.3.2 | Styling |
| Axios | ^1.4.0 | HTTP client |
| Socket.io Client | ^4.6.1 | Real-time client |
| Material-UI | ^4.12.4 | UI components |
| React Icons | ^4.7.1 | Icon library |
| React Toastify | ^9.1.1 | Notifications |

### Development Tools
| Tool | Purpose |
|------|---------|
| Nodemon | Development server |
| ESLint | Code linting |
| Prettier | Code formatting |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixes |

## 📁 Project Structure

```
Multi_vendor_E_shop/
├── backend/                     # Backend API server
│   ├── config/                 # Configuration files
│   │   └── cloudinary.js       # Cloudinary setup
│   ├── controller/             # Business logic controllers
│   │   ├── banner.js          # Banner management
│   │   ├── category.js        # Category operations
│   │   ├── order.js           # Order processing
│   │   ├── product.js         # Product management
│   │   ├── user.js            # User authentication
│   │   └── ...                # Other controllers
│   ├── db/                    # Database configuration
│   │   └── Database.js        # MongoDB connection
│   ├── middleware/            # Express middleware
│   │   ├── auth.js           # Authentication middleware
│   │   ├── error.js          # Error handling
│   │   └── catchAsyncErrors.js
│   ├── model/                 # Mongoose models
│   │   ├── product.js        # Product schema
│   │   ├── user.js           # User schema
│   │   ├── order.js          # Order schema
│   │   └── ...               # Other models
│   ├── routes/               # Route definitions
│   │   ├── pincode.js       # Pincode routes
│   │   ├── shipping.js      # Shipping routes
│   │   └── ...              # Other routes
│   ├── uploads/             # File upload directory
│   ├── utils/               # Utility functions
│   ├── server.js            # Main server file
│   └── package.json         # Dependencies

├── frontend/                   # React frontend
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   │   ├── components/        # React components
│   │   │   ├── Admin/        # Admin interface
│   │   │   ├── Shop/         # Seller interface
│   │   │   ├── Layout/       # Common layouts
│   │   │   ├── Products/     # Product components
│   │   │   ├── cart/         # Shopping cart
│   │   │   ├── Checkout/     # Checkout process
│   │   │   └── ...           # Other components
│   │   ├── redux/            # State management
│   │   │   ├── actions/      # Redux actions
│   │   │   ├── reducers/     # Redux reducers
│   │   │   └── store.js      # Redux store
│   │   ├── pages/            # Page components
│   │   ├── styles/           # CSS files
│   │   ├── utils/            # Utility functions
│   │   └── App.js            # Main App component
│   ├── tailwind.config.js    # Tailwind configuration
│   └── package.json          # Dependencies

├── socket/                    # Socket.io server
│   ├── index.js              # Socket server
│   └── package.json          # Dependencies

└── Documentation Files        # Project documentation
    ├── README.md
    ├── PROJECT_OVERVIEW.md
    ├── INVOICE_SYSTEM_WORKFLOW.md
    └── ...                   # Feature-specific docs
```

## 🎯 Core Features

### 1. **User Management System**

#### User Roles
- **Admin**: Full system access, user management, analytics
- **Seller**: Product management, order fulfillment, analytics
- **Customer**: Shopping, order tracking, profile management

#### Authentication Features
- JWT-based authentication
- Role-based access control
- Password encryption with bcrypt
- Email verification
- Password reset functionality
- Session management

### 2. **Product Management System**

#### Advanced Product Attributes
The platform features a sophisticated product attribute system with the following capabilities:

```javascript
// Product Attribute Structure
{
  name: "Color",           // Attribute name
  values: [                // Multiple values per attribute
    {
      value: "Red",        // Value name
      price: 100,          // Optional price variation
      hasPrice: true       // Price variation flag
    },
    {
      value: "Blue",
      price: 120,
      hasPrice: true
    }
  ],
  hasPriceVariation: true  // Attribute-level price variation flag
}
```

#### Key Features
- **Multi-value Attributes**: Each attribute can have multiple values (e.g., Color: Red, Blue, Green)
- **Dynamic Pricing**: Optional price variations for different attribute values
- **Flexible Configuration**: Sellers can choose whether to add price variations
- **Flipkart-style Display**: Interactive attribute selection with visual feedback
- **Real-time Price Updates**: Prices update instantly based on selected attributes

#### Product Features
- Image upload with Cloudinary integration
- Category and subcategory management
- SEO-friendly URLs
- Product reviews and ratings
- Inventory management
- Bulk operations
- Related products suggestion

### 3. **Shopping Cart & Checkout**

#### Cart Features
- **Attribute-aware Cart**: Stores selected product attributes
- **Dynamic Pricing**: Uses finalPrice when attributes have price variations
- **Persistent Storage**: Cart data saved across sessions
- **Quantity Management**: Easy quantity updates
- **Multi-vendor Support**: Groups items by seller

#### Checkout Process
- **Shipping Information**: Address management with validation
- **Order Summary**: Detailed breakdown with selected attributes
- **Payment Integration**: Stripe and PayPal support
- **Order Confirmation**: Email notifications and order tracking

### 4. **Order Management**

#### Order Processing
- **Automated Order Numbering**: Unique order IDs with timestamps
- **Multi-status Tracking**: Processing, Shipped, Delivered, Cancelled
- **Seller Notifications**: Real-time order alerts
- **Customer Updates**: Email and in-app notifications

#### Invoice System
- **Automated PDF Generation**: Professional invoice creation
- **GST Calculations**: Tax calculations based on location
- **Email Delivery**: Automatic invoice sending
- **Download Options**: Customer and seller access

### 5. **Real-time Communication**

#### Socket.io Features
- **Live Messaging**: Customer-seller communication
- **Order Tracking**: Real-time status updates
- **Delivery Tracking**: Live location updates
- **Notifications**: Instant system alerts
- **User Presence**: Online/offline status

### 6. **Payment Integration**

#### Supported Gateways
- **Stripe**: Card payments, digital wallets
- **PayPal**: PayPal and card payments
- **COD**: Cash on delivery option

#### Security Features
- PCI DSS compliance
- Secure payment processing
- Transaction logging
- Refund management

## 🗄️ Database Schema

### Key Models

#### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phoneNumber: String,
  addresses: [AddressSchema],
  role: String (customer, seller, admin),
  avatar: String,
  createdAt: Date,
  isBlocked: Boolean,
  gstDetails: {
    gstNumber: String,
    businessName: String,
    businessAddress: String
  }
}
```

#### Product Model
```javascript
{
  name: String,
  description: String,
  category: String,
  tags: [String],
  originalPrice: Number,
  discountPrice: Number,
  stock: Number,
  images: [String],
  attributes: [{
    name: String,
    values: [{
      value: String,
      price: Number,
      hasPrice: Boolean
    }],
    hasPriceVariation: Boolean
  }],
  shopId: ObjectId,
  sold_out: Number,
  createdAt: Date
}
```

#### Order Model
```javascript
{
  orderNumber: String,
  cart: [{
    productId: ObjectId,
    qty: Number,
    selectedAttributes: Object,
    finalPrice: Number
  }],
  shippingAddress: Object,
  user: ObjectId,
  totalPrice: Number,
  status: String,
  paymentInfo: Object,
  paidAt: Date,
  deliveredAt: Date,
  createdAt: Date
}
```

## 🔌 API Documentation

### Authentication Endpoints

#### User Registration
```http
POST /api/v2/user/create-user
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### User Login
```http
POST /api/v2/user/login-user
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Product Endpoints

#### Create Product
```http
POST /api/v2/product/create-product
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Sample Product",
  "description": "Product description",
  "category": "Electronics",
  "originalPrice": 100,
  "discountPrice": 80,
  "stock": 50,
  "attributes": [
    {
      "name": "Color",
      "values": [
        {"value": "Red", "price": 10, "hasPrice": true},
        {"value": "Blue", "price": 15, "hasPrice": true}
      ],
      "hasPriceVariation": true
    }
  ]
}
```

#### Get Products
```http
GET /api/v2/product/get-all-products
Query Parameters:
- category: String
- page: Number
- limit: Number
- search: String
```

### Order Endpoints

#### Create Order
```http
POST /api/v2/order/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "cart": [
    {
      "productId": "product_id",
      "qty": 2,
      "selectedAttributes": {"Color": "Red"},
      "finalPrice": 110
    }
  ],
  "shippingAddress": {...},
  "paymentInfo": {...}
}
```

#### Get User Orders
```http
GET /api/v2/order/get-all-orders/:userId
Authorization: Bearer <token>
```

## 🧩 Frontend Components

### Component Architecture

#### 1. **Layout Components**
- **Header**: Navigation, search, user menu
- **Footer**: Links, contact information
- **Sidebar**: Category navigation, filters

#### 2. **Product Components**
- **ProductCard**: Product grid display
- **ProductDetails**: Detailed product view with attributes
- **ProductAttributesForm**: Dynamic attribute creation
- **ProductDetailsCard**: Modal product preview

#### 3. **Shopping Components**
- **Cart**: Shopping cart with attribute display
- **Checkout**: Multi-step checkout process
- **Payment**: Payment gateway integration
- **Wishlist**: Saved products management

#### 4. **User Interface Components**
- **Signup/Login**: Authentication forms
- **UserProfile**: Profile management
- **OrderHistory**: Order tracking and history
- **UserOrderDetails**: Detailed order view

#### 5. **Admin Components**
- **AdminDashboard**: Analytics and overview
- **UserManagement**: User administration
- **ProductManagement**: Product operations
- **OrderManagement**: Order processing

#### 6. **Seller Components**
- **SellerDashboard**: Seller analytics
- **CreateProduct**: Product creation with attributes
- **AllOrders**: Order management
- **SellerProfile**: Shop management

### State Management (Redux)

#### Store Structure
```javascript
{
  user: {
    user: Object,
    isAuthenticated: Boolean,
    loading: Boolean,
    error: String
  },
  product: {
    products: Array,
    product: Object,
    loading: Boolean,
    error: String
  },
  cart: {
    cart: Array
  },
  order: {
    orders: Array,
    order: Object,
    loading: Boolean,
    error: String
  },
  seller: {
    seller: Object,
    isSellerAuthenticated: Boolean,
    loading: Boolean
  }
}
```

## 🔴 Real-time Features

### Socket.io Implementation

#### Connection Management
```javascript
// Client-side connection
const socket = io("http://localhost:4000");

// Add user to online list
socket.emit("addUser", userId);

// Listen for users update
socket.on("getUsers", (users) => {
  setOnlineUsers(users);
});
```

#### Messaging System
```javascript
// Send message
socket.emit("sendMessage", {
  senderId: currentUser.id,
  receiverId: selectedUser.id,
  text: message,
  images: attachments
});

// Receive message
socket.on("getMessage", (message) => {
  setMessages(prev => [...prev, message]);
});
```

#### Order Tracking
```javascript
// Order status update
socket.emit("orderStatusChanged", {
  orderId: order._id,
  status: newStatus,
  shopId: shop._id,
  timestamp: new Date()
});

// Listen for updates
socket.on("orderStatusUpdate", (data) => {
  updateOrderStatus(data);
});
```

#### Delivery Tracking
```javascript
// Live location updates
socket.emit("deliveryLocationBroadcast", {
  orderId: order._id,
  location: {lat: 12.34, lng: 56.78},
  speed: 45,
  estimatedArrival: "15 minutes"
});
```

## ⚡ Advanced Features

### 1. **AI-Powered Chatbot**
- **Natural Language Processing**: Understanding customer queries
- **Product Recommendations**: AI-driven suggestions
- **Order Assistance**: Help with order tracking and issues
- **Multi-language Support**: Regional language support

### 2. **Dynamic Pricing System**
- **Attribute-based Pricing**: Prices vary by product attributes
- **Bulk Pricing**: Quantity-based discounts
- **Time-based Pricing**: Flash sales and limited offers
- **Personalized Pricing**: User-specific pricing

### 3. **Advanced Analytics**
- **Sales Analytics**: Revenue tracking and trends
- **User Behavior**: Shopping patterns and preferences
- **Inventory Analytics**: Stock management insights
- **Performance Metrics**: System performance monitoring

### 4. **SEO Optimization**
- **Meta Tag Management**: Dynamic SEO tags
- **URL Optimization**: SEO-friendly URLs
- **Sitemap Generation**: Automated sitemap updates
- **Rich Snippets**: Structured data implementation

### 5. **Security Features**
- **Rate Limiting**: API request throttling
- **Input Validation**: XSS and injection prevention
- **CORS Configuration**: Cross-origin security
- **SSL/TLS**: Secure data transmission

### 6. **Performance Optimization**
- **Image Optimization**: Cloudinary transformations
- **Lazy Loading**: On-demand content loading
- **Caching Strategy**: Redis-based caching
- **CDN Integration**: Global content delivery

## 🚀 Deployment

### Production Deployment

#### Environment Configuration
```bash
# Backend Environment Variables
NODE_ENV=production
PORT=8000
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET_KEY=your_jwt_secret
STRIPE_API_KEY=your_stripe_key
STRIPE_SECRET_KEY=your_stripe_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

#### Docker Configuration
```dockerfile
# Dockerfile for Backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

#### Deployment Platforms
- **Render**: Current hosting platform
- **AWS**: Scalable cloud deployment
- **DigitalOcean**: Cost-effective VPS hosting
- **Vercel**: Frontend deployment

### CI/CD Pipeline
```yaml
# GitHub Actions Example
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build application
        run: npm run build
      - name: Deploy to production
        run: npm run deploy
```

## 🛠️ Development Setup

### Prerequisites
- Node.js (version 18 or higher)
- MongoDB (local or cloud)
- Git

### Installation Steps

1. **Clone the Repository**
```bash
git clone <repository-url>
cd Multi_vendor_E_shop
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in `backend/config/`:
```env
DB_URL=mongodb://localhost:27017/multivendor
JWT_SECRET_KEY=your_secret_key
STRIPE_API_KEY=your_stripe_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
```

4. **Socket Server Setup**
```bash
cd ../socket
npm install
```

5. **Start Development Servers**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

Terminal 3 (Socket Server):
```bash
cd socket
npm start
```

### Development Tools

#### Code Quality
```bash
# ESLint for code linting
npm run lint

# Prettier for code formatting
npm run format

# Pre-commit hooks
npm run pre-commit
```

#### Testing
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📊 Performance Metrics

### Current Performance
- **Page Load Time**: < 3 seconds
- **API Response Time**: < 500ms average
- **Database Query Time**: < 200ms average
- **Real-time Message Delivery**: < 100ms
- **Image Load Time**: < 2 seconds (optimized)

### Optimization Strategies
- **Database Indexing**: Optimized queries
- **Image Compression**: Cloudinary transformations
- **Code Splitting**: React lazy loading
- **Bundle Optimization**: Webpack optimization
- **CDN Usage**: Static asset delivery

## 🔮 Future Enhancements

### Planned Features
1. **Mobile Application**: React Native app
2. **Progressive Web App**: PWA implementation
3. **Advanced Analytics**: Machine learning insights
4. **Multi-language Support**: Internationalization
5. **Voice Search**: Voice-powered search
6. **AR/VR Integration**: Virtual product preview
7. **Blockchain Integration**: Cryptocurrency payments
8. **IoT Integration**: Smart device connectivity

### Scalability Plans
- **Microservices Architecture**: Service decomposition
- **Kubernetes Deployment**: Container orchestration
- **Message Queues**: Asynchronous processing
- **Load Balancing**: Traffic distribution
- **Database Sharding**: Horizontal scaling

## 📞 Support & Maintenance

### Development Team
- **Lead Developer**: Om Prakash Pattjoshi
- **Backend Team**: Node.js specialists
- **Frontend Team**: React.js developers
- **DevOps Team**: Infrastructure management

### Contact Information
- **Email**: support@wanttar.in
- **Phone**: +91-XXXXXXXXXX
- **Website**: https://www.wanttar.in

### Issue Reporting
For bug reports and feature requests, please use the GitHub issues section or contact the development team directly.

### License
This project is licensed under the ISC License. See the LICENSE file for details.

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Production Ready

This documentation provides a comprehensive overview of the Multi-Vendor E-Commerce Platform. For specific implementation details or technical assistance, please refer to the individual component documentation or contact the development team.