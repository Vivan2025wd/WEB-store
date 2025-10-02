# Backend Setup Instructions

## 📋 Prerequisites

- Node.js v18+ installed
- MongoDB installed locally OR MongoDB Atlas account
- Stripe account (for payment processing)

## 🚀 Installation Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce-platform
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=development
```

### 3. Set Up Stripe Webhooks

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:5000/payment/webhook
   ```
4. Copy the webhook signing secret (`whsec_...`) to your `.env` file

### 4. Start the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 🔧 Testing the Setup

### Check Server Health
```bash
curl http://localhost:5000/health
```

Should return: `{"status":"OK","timestamp":"..."}`

### Create First Admin User

Send POST request to `/auth/register`:

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123456"
  }'
```

Then manually update the user in MongoDB to make them admin:

```javascript
// In MongoDB shell or Compass:
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { isAdmin: true } }
)
```

## 📝 API Endpoints Overview

### Public Routes
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /store/slug/:slug` - View public storefront
- `GET /products/store/:storeId` - Get store products

### Protected Routes (Require JWT Token)
- `POST /store/create` - Create store
- `PUT /store/:id` - Update store
- `POST /products/add` - Add product
- `PUT /products/:id` - Edit product
- `DELETE /products/:id` - Delete product
- `GET /orders/store/:storeId` - Get store orders

### Admin Routes (Require admin role)
- `GET /admin/sellers` - List all sellers
- `GET /admin/stores` - List all stores
- `GET /admin/stats` - Platform statistics
- `GET /admin/orders` - All orders
- `DELETE /admin/sellers/:id` - Delete seller

### Payment Routes
- `POST /payment/create-checkout-session` - Create Stripe session
- `POST /payment/webhook` - Stripe webhook (called by Stripe)

## 🔑 Authentication

Include JWT token in requests:

```bash
curl http://localhost:5000/store/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Store","slug":"my-store"}'
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### Stripe Webhook Not Working
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:5000/payment/webhook`
- Check webhook secret in `.env`
- For production, configure webhook in Stripe Dashboard

### CORS Errors
- Verify `CLIENT_URL` in `.env` matches your frontend URL
- Check browser console for specific CORS errors

### JWT Errors
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration (currently 7 days)

## 📦 Project Structure

```
backend/
├── config/
│   ├── db.js              # Database connection
│   └── stripe.js          # Stripe configuration
├── middleware/
│   └── authMiddleware.js  # JWT authentication
├── models/
│   ├── User.js            # User/Seller schema
│   ├── Store.js           # Store schema
│   ├── Product.js         # Product schema
│   └── Order.js           # Order schema
├── routes/
│   ├── authRoutes.js      # Login/signup
│   ├── storeRoutes.js     # Store management
│   ├── productRoutes.js   # Product CRUD
│   ├── orderRoutes.js     # Order handling
│   ├── paymentRoutes.js   # Stripe integration
│   └── adminRoutes.js     # Admin dashboard
├── .env                   # Environment variables
├── server.js              # App entry point
└── package.json           # Dependencies
```

## 🚢 Production Deployment

### Environment Variables to Update
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Use production Stripe keys
- Update `CLIENT_URL` to production domain

### Additional Steps
1. Configure Stripe webhook in dashboard (not CLI)
2. Set up process manager (PM2)
3. Configure reverse proxy (Nginx)
4. Enable HTTPS
5. Set up monitoring and logging

### Example PM2 Configuration

```bash
pm2 start server.js --name "ecommerce-backend"
pm2 startup
pm2 save
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [JWT.io](https://jwt.io/)