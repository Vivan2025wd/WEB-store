# 🛍️ Store Platform

A **multi-vendor e-commerce platform** where sellers can launch their own storefront under a shared marketplace, and the platform owner earns commission on every sale.

Think Shopify / Wix Stores / WooCommerce — but multi-tenant.

---

## ✨ Features

### For Sellers
- 🔐 Register / login with JWT-based auth
- 🏪 Create and customize a store (name, logo, theme, colors, banner)
- 📦 Add, edit, and delete products (title, description, price, images, inventory)
- 🏷️ Organize products with categories and tags
- 📊 Seller dashboard with orders and revenue analytics
- 💳 Connect a payout account via Stripe

### For Buyers
- 🛒 Browse the marketplace and individual storefronts
- 🔎 View product details and add to cart
- ✅ Secure checkout via Stripe
- 📦 Order history and tracking

### For the Platform Owner (Admin)
- 👥 Manage all sellers and stores
- 💰 View total revenue and commission collected
- ⚙️ Set global or per-seller commission rates
- 🚫 Suspend or remove stores

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Routing | React Router |
| Backend | Node.js + Express |
| Database | MongoDB (Mongoose) — swap for PostgreSQL if preferred |
| Auth | JWT + bcrypt |
| Payments | Stripe Connect (marketplace payouts + commission) |
| Hosting | Vercel/Netlify (frontend) · Railway/Render (backend) |

---

## 📁 Project Structure

```
store-platform/
├─ public/                          # static assets
│  └─ logo.png
├─ src/                             # React frontend
│  ├─ components/                   # reusable UI
│  │  ├─ Navbar.jsx
│  │  ├─ Footer.jsx
│  │  ├─ StoreCard.jsx
│  │  ├─ ProductCard.jsx
│  │  └─ DashboardSidebar.jsx
│  ├─ pages/                        # route components
│  │  ├─ index.jsx                  # landing page
│  │  ├─ login.jsx                  # seller login/signup
│  │  ├─ admin_login.jsx            # platform admin login
│  │  ├─ dashboard.jsx              # seller dashboard
│  │  ├─ create-store.jsx           # store setup wizard
│  │  ├─ product.jsx                # marketplace product listing
│  │  ├─ about.jsx
│  │  └─ store/
│  │     ├─ storePage.jsx           # storefront layout
│  │     └─ [storeId].jsx           # dynamic public storefront
│  ├─ services/                     # API & business logic
│  │  ├─ api.js                     # fetch wrapper for backend calls
│  │  ├─ auth.js                    # login, register, session handling
│  │  ├─ payment.js                 # Stripe checkout + commission logic
│  │  └─ utils.js                   # shared helpers
│  ├─ styles/
│  │  └─ tailwind.css
│  ├─ App.jsx                       # routes + layout
│  └─ main.jsx                      # React entrypoint
├─ backend/
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Store.js
│  │  ├─ Product.js
│  │  └─ Order.js
│  ├─ routes/
│  │  ├─ adminRoutes.js
│  │  ├─ authRoutes.js
│  │  ├─ storeRoutes.js
│  │  ├─ productRoutes.js
│  │  ├─ orderRoutes.js
│  │  └─ paymentRoutes.js
│  ├─ config/
│  │  ├─ db.js                      # database connection
│  │  └─ stripe.js                  # Stripe client setup
│  ├─ middleware/
│  │  └─ authMiddleware.js          # JWT verification
│  ├─ server.js                     # Express entrypoint
│  └─ package.json
├─ .env
├─ .gitignore
├─ eslint.config.js
├─ index.html
├─ postcss.config.js
├─ tailwind.config.js
├─ vite.config.js
├─ package.json
└─ README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm or pnpm
- MongoDB instance (local or Atlas)
- Stripe account (test keys are fine)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/store-platform.git
cd store-platform
```

### 2. Install dependencies
```bash
# Frontend
npm install

# Backend
cd backend && npm install && cd ..
```

### 3. Configure environment variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/store-platform

# Auth
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Platform
PLATFORM_COMMISSION_RATE=0.10      # 10% commission
CLIENT_URL=http://localhost:5173
```

> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.

### 4. Run in development
```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
npm run dev
```

Frontend: `http://localhost:5173` · Backend: `http://localhost:5000`

---

## 📜 Available Scripts

### Frontend (root)
| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

### Backend (`/backend`)
| Script | Description |
|---|---|
| `npm run dev` | Start server with nodemon |
| `npm start` | Start server in production |

---

## 🔌 API Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a seller |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/stores` | List all public stores |
| `POST` | `/api/stores` | Create a store (auth) |
| `PUT` | `/api/stores/:id` | Update store settings (auth) |
| `GET` | `/api/products` | List products (filterable by store) |
| `POST` | `/api/products` | Add a product (auth) |
| `PUT` | `/api/products/:id` | Edit a product (auth) |
| `DELETE` | `/api/products/:id` | Delete a product (auth) |
| `POST` | `/api/orders` | Create an order |
| `GET` | `/api/orders/:id` | Get order details |
| `POST` | `/api/payments/checkout` | Create a Stripe Checkout session |
| `POST` | `/api/payments/webhook` | Stripe webhook handler |
| `GET` | `/api/admin/revenue` | Platform revenue + commissions (admin) |

---

## 💰 Commission Model

The platform takes a configurable cut of every sale using **Stripe Connect**:

```
Sale amount:        $100.00
Platform fee (10%):  $10.00
Seller payout:       $90.00
```

- Commission rate is set globally in `.env` (`PLATFORM_COMMISSION_RATE`)
- Can be overridden per seller in the `Store` model
- Every transaction is recorded in the `orders` / `transactions` collection for reporting and payouts
- Payouts are handled by Stripe Connect — funds route automatically to the seller's connected account

---

## 🗄️ Data Models (simplified)

| Model | Key Fields |
|---|---|
| `User` | name, email, passwordHash, role (`seller` \| `admin`) |
| `Store` | ownerId, name, slug, logo, theme, commissionRate, stripeAccountId |
| `Product` | storeId, title, description, price, images[], stock, category, tags[] |
| `Order` | buyerId, storeId, items[], total, platformFee, sellerPayout, status |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the `LICENSE` file for details.

---

**Built with ❤️ using React, Tailwind CSS, Express, and Stripe.**
