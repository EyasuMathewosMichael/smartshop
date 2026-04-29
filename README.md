# SmartShop – Full-Stack E-Commerce Platform

## 🎯 Overview
A modern, scalable e-commerce web application built using the MERN stack with dual payment integration supporting both international (Stripe) and local Ethiopian (Chapa) payments.

## 🧩 Technology Stack

### Frontend
- React
- Context API for state management
- Tailwind CSS
- Axios for API calls

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe & Chapa Payment Integration

## 👥 User Roles

### Customer
- Browse products with search & filters
- Add items to cart
- Place orders with payment method selection
- Track order history

### Admin
- Manage products (CRUD operations)
- Manage users
- View and update orders
- Monitor sales analytics

## 💡 Core Features

### 🛍️ Customer Features
- Product listing with search & filters
- Product detail page
- Shopping cart system
- Secure user authentication (JWT)
- Checkout with dual payment options
- Order history tracking

### 💳 Dual Payment System
- **Stripe**: International card payments
- **Chapa**: Ethiopian local payments (ETB)
- Secure payment verification via webhooks
- Real-time order status updates

### ⚙️ Admin Dashboard
- Product management with image upload
- User management
- Order management
- Sales analytics

## 🔐 Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Secure payment verification
- Protected admin routes
- Input validation

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- Stripe Account
- Chapa Account

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## 🌍 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CHAPA_SECRET_KEY=your_chapa_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 🚀 Deployment
- **Frontend**: Vercel / Netlify
- **Backend**: Render / Railway
- **Database**: MongoDB Atlas

## 📚 API Documentation
API endpoints are documented and available at `/api-docs` when running the backend server.

## 🎯 Business Value
- Sell products online globally and locally
- Reach international and Ethiopian customers
- Efficient inventory and order management
- Secure dual payment processing

## 📄 License
MIT License

## 👨‍💻 Author
Built as a production-ready e-commerce solution
