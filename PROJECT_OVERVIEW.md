# Multi-Vendor E-Shop Platform - Project Overview

## 📋 Table of Contents
1. [Project Architecture](#project-architecture)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Core Features](#core-features)
6. [Database Schema](#database-schema)
7. [API Architecture](#api-architecture)
8. [Frontend Architecture](#frontend-architecture)
9. [Authentication & Security](#authentication--security)
10. [File Management](#file-management)
11. [Order Management System](#order-management-system)
12. [Invoice Management System](#invoice-management-system)
13. [Payment Integration](#payment-integration)
14. [Deployment & Infrastructure](#deployment--infrastructure)
15. [Development Workflow](#development-workflow)

---

## 🏗️ Project Architecture

### Overview
The Multi-Vendor E-Shop is a full-stack web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) with a modern microservices-inspired architecture.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React.js)    │◄──►│   (Express.js)  │◄──►│   (MongoDB)     │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Socket.io     │    │   File Storage  │    │   External APIs │
│   Real-time     │    │   (Cloudinary)  │    │   (Payment,     │
│   Communication │    │   Media Files   │    │   Shipping)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Directory Structure
```
Multi_vendor_E_shop/
├── frontend/           # React.js application
├── backend/            # Express.js API server
├── socket/             # Socket.io server for real-time features
├── uploads/            # Temporary file uploads (backend)
└── docs/              # Documentation files
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React.js 18+
- **State Management**: Redux Toolkit + Redux Persist
- **Routing**: React Router DOM
- **UI Framework**: Tailwind CSS + Material-UI
- **HTTP Client**: Axios + Fetch API
- **Real-time**: Socket.io Client
- **Icons**: React Icons (Feather, Material)
- **Notifications**: React Toastify
- **Charts**: Chart.js / Recharts
- **PDF Generation**: Client-side PDF utilities

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose ODM
- **Authentication**: JWT + Cookies
- **File Upload**: Multer (Memory Storage)
- **Image/Video Storage**: Cloudinary
- **PDF Generation**: Puppeteer
- **Archive Creation**: Archiver
- **Email Service**: Nodemailer
- **Validation**: Express Validator
- **Security**: bcrypt, CORS, Rate Limiting

### Database
- **Primary**: MongoDB (Document Store)
- **ODM**: Mongoose
- **Features**: Indexing, Aggregation, Transactions

### DevOps & Tools
- **Development**: Nodemon, Concurrently
- **Version Control**: Git
- **Package Management**: npm/yarn
- **Environment**: dotenv

---

## 🧩 System Components

### 1. User Management System
- User registration and authentication
- Profile management
- Role-based access control (Admin, Seller, Customer)
- Email verification and password reset

### 2. Product Management System
- Product creation and editing
- Category management
- Image/video upload and optimization
- Inventory tracking
- Product variations (size, color, etc.)

### 3. Multi-Vendor System
- Seller onboarding and verification
- Shop creation and management
- Commission and payment tracking
- Seller analytics dashboard

### 4. Order Management System
- Cart functionality
- Order placement and tracking
- Status management (Processing → Shipped → Delivered)
- Order history and management

### 5. Payment System
- Multiple payment methods (COD, Online)
- Razorpay/Stripe integration
- Refund management
- Payment history tracking

### 6. Invoice System (NEW)
- Professional PDF invoice generation
- Batch invoice downloads
- HTML preview functionality
- Automated invoice numbering

### 7. Communication System
- Real-time messaging between users
- Notifications system
- Email notifications
- Admin announcements

### 8. Admin Dashboard
- System overview and analytics
- User and seller management
- Order oversight
- Content management

---

## 👥 User Roles & Permissions

### 🔵 Customer/User
**Permissions:**
- Browse products and categories
- Add products to cart and wishlist
- Place and track orders
- Communicate with sellers
- Manage profile and addresses
- View order history and invoices

### 🟢 Seller/Vendor
**Permissions:**
- Create and manage shop
- Add/edit/delete products
- Manage inventory
- Process orders
- View sales analytics
- Communicate with customers
- Download sales reports

### 🔴 Admin
**Permissions:**
- Full system access
- Manage all users and sellers
- Oversee all orders and transactions
- Download system-wide invoices
- Manage categories and banners
- Access system analytics
- Content moderation

---

## ⚙️ Core Features

### E-Commerce Features
1. **Product Catalog**
   - Advanced search and filtering
   - Category-based browsing
   - Product recommendations
   - Wishlist functionality

2. **Shopping Cart & Checkout**
   - Add/remove items
   - Quantity management
   - Coupon code application
   - Address management
   - Payment method selection

3. **Order Management**
   - Order placement
   - Status tracking
   - Delivery management
   - Return/refund handling

### Multi-Vendor Features
1. **Seller Onboarding**
   - Registration and verification
   - Shop setup
   - Document upload
   - Approval workflow

2. **Vendor Dashboard**
   - Sales analytics
   - Order management
   - Product management
   - Earning reports

3. **Commission System**
   - Automatic commission calculation
   - Payment tracking
   - Revenue sharing

### Admin Features
1. **System Management**
   - User management
   - Seller approval
   - Order oversight
   - Content management

2. **Analytics & Reporting**
   - Sales reports
   - User analytics
   - Revenue tracking
   - System performance

3. **Invoice Management (NEW)**
   - Generate PDF invoices
   - Batch download functionality
   - Professional invoice templates
   - Invoice preview and customization

---

## 🗃️ Database Schema

### Key Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/seller/admin),
  avatar: {
    public_id: String,
    url: String
  },
  addresses: [AddressSchema],
  phoneNumber: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: ObjectId (ref: Category),
  tags: [String],
  originalPrice: Number,
  discountPrice: Number,
  stock: Number,
  images: [{
    public_id: String,
    url: String
  }],
  shopId: ObjectId (ref: Shop),
  sold_out: Number,
  isPublished: Boolean,
  createdAt: Date
}
```

#### Orders Collection
```javascript
{
  _id: ObjectId,
  cart: [CartItemSchema],
  shippingAddress: AddressSchema,
  user: UserSchema,
  totalPrice: Number,
  subTotalPrice: Number,
  shippingPrice: Number,
  discountPrice: Number,
  tax: Number,
  status: String,
  statusHistory: [StatusHistorySchema],
  trackingNumber: String,
  paymentInfo: PaymentSchema,
  paidAt: Date,
  deliveredAt: Date,
  createdAt: Date
}
```

#### Shops Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  description: String,
  address: String,
  phoneNumber: String,
  avatar: ImageSchema,
  zipCode: String,
  withdrawMethod: Object,
  availableBalance: Number,
  createdAt: Date
}
```

---

## 🔌 API Architecture

### RESTful API Design
Base URL: `http://localhost:8000/api/v2`

### Authentication Endpoints
```
POST /user/create-user              # User registration
POST /user/activation               # Email verification
POST /user/login-user              # User login
GET  /user/getuser                  # Get user profile
POST /user/logout                   # User logout
```

### Product Endpoints
```
POST /product/create-product        # Create product (seller)
GET  /product/get-all-products      # Get all published products
GET  /product/get-all-products-shop/:id  # Get shop products
PUT  /product/admin-toggle-product-status/:id  # Toggle product status (admin)
```

### Order Endpoints
```
POST /order/create-order            # Create new order
GET  /order/get-all-orders/:userId  # Get user orders
GET  /order/admin-all-orders        # Get all orders (admin)
PUT  /order/update-order-status/:id # Update order status
```

### Invoice Endpoints (NEW)
```
GET  /order/admin-invoice-pdf/:id   # Download single invoice PDF
GET  /order/admin-invoice-preview/:id # Preview invoice HTML
POST /order/admin-batch-invoices-zip # Download multiple invoices as ZIP
GET  /order/admin-orders-summary    # Enhanced orders listing with filters
```

### File Upload Endpoints
```
POST /product/upload               # Upload product images
POST /shop/upload-images          # Upload shop images
POST /user/update-avatar          # Update user avatar
```

---

## 🎨 Frontend Architecture

### Component Structure
```
src/
├── components/
│   ├── Layout/                   # Header, Footer, Navigation
│   ├── Admin/                    # Admin-specific components
│   ├── Shop/                     # Seller/Shop components
│   ├── Products/                 # Product-related components
│   ├── Cart/                     # Shopping cart components
│   ├── Orders/                   # Order management components
│   └── Invoice/                  # Invoice components (NEW)
├── pages/                        # Route components
├── redux/                        # State management
├── utils/                        # Utility functions
├── styles/                       # CSS and styling
└── server.js                     # API configuration
```

### State Management (Redux)
```javascript
store/
├── user/                         # User authentication state
├── product/                      # Product catalog state
├── cart/                         # Shopping cart state
├── order/                        # Order management state
├── shop/                         # Shop/seller state
└── ui/                          # UI state (modals, notifications)
```

### Key Frontend Features
1. **Responsive Design**: Mobile-first approach with Tailwind CSS
2. **Real-time Updates**: Socket.io for live notifications
3. **Lazy Loading**: Component and image lazy loading
4. **Error Handling**: Comprehensive error boundaries
5. **SEO Optimization**: Meta tags and structured data

---

## 🔐 Authentication & Security

### Authentication Flow
1. **Registration**: User creates account with email verification
2. **Login**: JWT token generated and stored in HTTP-only cookies
3. **Authorization**: Role-based access control middleware
4. **Session Management**: Token refresh and expiration handling

### Security Measures
1. **Password Security**: bcrypt hashing with salt rounds
2. **Input Validation**: Server-side validation for all inputs
3. **CORS Configuration**: Restricted cross-origin requests
4. **Rate Limiting**: Prevent brute force attacks
5. **File Upload Security**: File type and size validation
6. **SQL Injection Prevention**: Mongoose ORM protection

### JWT Implementation
```javascript
// Token generation
const token = jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware protection
const isAuthenticated = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorHandler("Please login", 401));
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
};
```

---

## 📁 File Management

### Cloudinary Integration
- **Images**: Product photos, user avatars, shop logos
- **Videos**: Product demonstration videos
- **Optimization**: Automatic compression and format conversion
- **CDN**: Global content delivery network

### File Upload Flow
1. **Frontend**: User selects files through form
2. **Multer**: Memory storage processes uploads
3. **Cloudinary**: Files uploaded to cloud storage
4. **Database**: URLs and public IDs stored in MongoDB
5. **Cleanup**: Temporary files removed from server

### Upload Configuration
```javascript
// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos allowed'), false);
    }
  }
});
```

---

## 📦 Order Management System

### Order Lifecycle
```
Cart → Checkout → Payment → Order Created → Processing → Shipped → Delivered
```

### Order Status Management
1. **Processing**: Order received and being prepared
2. **Confirmed**: Order confirmed by seller
3. **Shipped**: Order dispatched for delivery
4. **On the way**: Out for delivery
5. **Delivered**: Successfully delivered to customer
6. **Cancelled**: Order cancelled by user/seller
7. **Refund Success**: Refund processed

### Multi-Shop Order Handling
- Orders are split by shop automatically
- Each shop receives their portion of the order
- Proportional calculation of shipping, tax, and discounts
- Independent tracking for each shop's order

### Order Data Structure
```javascript
{
  orderId: "ORD123456",
  customerId: "user_id",
  items: [
    {
      productId: "prod_id",
      shopId: "shop_id",
      quantity: 2,
      price: 1000,
      total: 2000
    }
  ],
  shipping: {
    address: "Full address",
    method: "Standard",
    cost: 100
  },
  payment: {
    method: "razorpay",
    status: "completed",
    transactionId: "txn_123"
  },
  totals: {
    subtotal: 2000,
    shipping: 100,
    tax: 200,
    discount: 100,
    total: 2200
  }
}
```

---

## 🧾 Invoice Management System (NEW)

### Features
1. **Professional PDF Generation**: Using Puppeteer for high-quality PDFs
2. **Batch Downloads**: Download multiple invoices as ZIP file
3. **HTML Preview**: Preview invoices before downloading
4. **Responsive Design**: Mobile-friendly invoice templates
5. **Comprehensive Data**: All order, customer, and seller information

### Invoice Generation Flow
```
Order Data → HTML Template → Puppeteer → PDF Buffer → Response/Archive
```

### PDF Generation Process
1. **Data Collection**: Gather order, customer, and shop information
2. **HTML Generation**: Create styled HTML invoice template
3. **PDF Conversion**: Use Puppeteer to convert HTML to PDF
4. **Buffer Handling**: Convert Uint8Array to Node.js Buffer
5. **Response/Storage**: Send directly or add to ZIP archive

### Invoice Template Features
- Professional gradient header design
- Company branding placeholders
- Comprehensive order information
- Customer and seller details
- Itemized product listing
- Tax and shipping breakdown
- Payment information
- Status badges with color coding

### API Endpoints
```javascript
GET  /admin-invoice-pdf/:id        # Download single PDF invoice
GET  /admin-invoice-preview/:id    # Preview invoice HTML
POST /admin-batch-invoices-zip     # Download multiple invoices as ZIP
```

### Frontend Integration
```javascript
// Single invoice download
const downloadInvoice = async (order) => {
  const response = await fetch(`${server}/order/admin-invoice-pdf/${order._id}`, {
    credentials: 'include'
  });
  const blob = await response.blob();
  // Create download link and trigger download
};

// Batch invoice download
const downloadBatchInvoices = async (orderIds) => {
  const response = await fetch(`${server}/order/admin-batch-invoices-zip`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderIds })
  });
  const blob = await response.blob();
  // Download ZIP file
};
```

---

## 💳 Payment Integration

### Supported Payment Methods
1. **Cash on Delivery (COD)**: Traditional payment method
2. **Razorpay**: Online payment gateway (credit/debit cards, UPI, wallets)
3. **Stripe**: International payment processing
4. **Bank Transfer**: Direct bank account transfers

### Payment Flow
1. **Order Creation**: Order created with payment pending
2. **Payment Processing**: User redirected to payment gateway
3. **Webhook Handling**: Payment confirmation received
4. **Order Update**: Order status updated based on payment result
5. **Notification**: User and seller notified of payment status

### Payment Security
- PCI DSS compliance through payment partners
- Secure token-based transactions
- Webhook signature verification
- Encrypted payment data storage

---

## 🚀 Deployment & Infrastructure

### Environment Setup
```bash
# Backend Environment Variables
NODE_ENV=production
PORT=8000
DB_URL=mongodb://localhost:27017/multi-vendor-shop
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Development Setup
```bash
# Clone repository
git clone [repository-url]

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Start development servers
npm run dev        # Both frontend and backend
# OR
cd backend && npm run dev    # Backend only (port 8000)
cd frontend && npm run dev   # Frontend only (port 3000)
```

### Production Deployment
1. **Backend**: Deploy to services like Heroku, DigitalOcean, or AWS
2. **Frontend**: Deploy to Netlify, Vercel, or serve from backend
3. **Database**: MongoDB Atlas for cloud database
4. **File Storage**: Cloudinary for media files
5. **Domain**: Custom domain with SSL certificate

---

## 🔄 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request for review
```

### Code Standards
1. **JavaScript**: ES6+ syntax with modern features
2. **React**: Functional components with hooks
3. **Styling**: Tailwind CSS with component-based approach
4. **API**: RESTful conventions with consistent error handling
5. **Database**: Mongoose schemas with validation

### Testing Strategy
1. **Unit Tests**: Component and function testing
2. **Integration Tests**: API endpoint testing
3. **E2E Tests**: Complete user flow testing
4. **Performance Tests**: Load and stress testing

### Monitoring & Logging
1. **Error Tracking**: Comprehensive error logging
2. **Performance Monitoring**: API response times
3. **User Analytics**: User behavior tracking
4. **System Health**: Server and database monitoring

---

## 🎯 Future Enhancements

### Planned Features
1. **Mobile App**: React Native mobile application
2. **Advanced Analytics**: Machine learning insights
3. **Multi-Currency**: International currency support
4. **Advanced Search**: Elasticsearch integration
5. **Recommendation Engine**: AI-powered product recommendations
6. **Social Features**: Reviews, ratings, and social sharing
7. **Inventory Management**: Advanced stock management
8. **Marketing Tools**: Coupons, campaigns, and promotions

### Technical Improvements
1. **Microservices**: Break down into smaller services
2. **Caching**: Redis for improved performance
3. **CDN**: Content delivery network implementation
4. **API Gateway**: Centralized API management
5. **Containerization**: Docker and Kubernetes deployment
6. **CI/CD**: Automated testing and deployment pipelines

---

## 📞 Support & Maintenance

### Issue Tracking
- Bug reports and feature requests
- Performance monitoring and optimization
- Security updates and patches
- Database maintenance and backups

### Documentation
- API documentation with Swagger/Postman
- Component documentation with Storybook
- Deployment guides and tutorials
- User manuals and admin guides

---

## 📄 License & Credits

### Technology Credits
- **React.js**: Facebook Inc.
- **Node.js**: OpenJS Foundation
- **MongoDB**: MongoDB Inc.
- **Puppeteer**: Google Inc.
- **Cloudinary**: Cloudinary Ltd.

### Project Information
- **Version**: 1.0.0
- **Last Updated**: September 2025
- **Maintainer**: Development Team
- **License**: [Specify License Type]

---

*This document provides a comprehensive overview of the Multi-Vendor E-Shop platform. For specific technical details, refer to the individual component documentation and code comments.*