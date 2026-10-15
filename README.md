# Homeline - Eco-Friendly Kitchenware E-Commerce

A premium, eco-conscious e-commerce portfolio project showcasing sustainable kitchenware with a modern, editorial design aesthetic.

![Project Status](https://img.shields.io/badge/status-portfolio-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Node.js](https://img.shields.io/badge/Node.js-20-green)

## 🌿 Project Overview

Homeline is a full-stack e-commerce website built as a portfolio project, featuring:

- Modern, eco-friendly design aesthetic
- Fully responsive layout (mobile, tablet, desktop)
- Interactive shopping cart functionality
- RESTful API backend
- Docker containerization
- Production-ready structure

## 🎨 Design Features

- **Color Palette**: Deep forest green, muted sage, warm beige, and cream
- **Typography**: DM Sans (sans-serif) and DM Serif Display (display/editorial)
- **UI Components**: Reusable React components with Tailwind CSS
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design approach

## 🚀 Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Context API** - State management for cart

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Supabase** - Postgres database with RPC functions for atomic stock movement
- **CORS** - Cross-origin resource sharing

### DevOps
- **Docker & Docker Compose** - Containerization
- **Git** - Version control

## 📁 Project Structure

```
e-commerce/
├── client/                 # React frontend
│   ├── public/
│   │   └── images/        # Image assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── home/      # Home page sections
│   │   │   ├── layout/    # Header, Footer
│   │   │   ├── product/   # Product components
│   │   │   └── ui/        # Reusable UI components
│   │   ├── context/       # React Context (Cart)
│   │   ├── data/          # Product data
│   │   ├── hooks/         # Custom hooks
│   │   ├── pages/         # Page components
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                # Express backend
│   ├── server.js          # API server
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .gitignore
├── PRD.md
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose (optional)
- Git Bash or terminal

### Method 1: Docker (Recommended)

1. **Clone the repository**
```bash
cd C:\Users\OJT\Desktop\e-commerce
```

2. **Build and start containers**
```bash
docker compose up --build
```

3. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Method 2: Manual Setup

#### Frontend Setup

1. **Navigate to client directory**
```bash
cd client
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start development server**
```bash
npm run dev
```

Frontend will run on http://localhost:3000

#### Backend Setup

1. **Navigate to server directory**
```bash
cd server
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Start server**
```bash
npm run dev
```

Server will run on http://localhost:5000

## 🎯 Features

### Implemented
- ✅ Responsive navigation with mobile menu
- ✅ Hero section with sustainability badge
- ✅ Product grid with filtering, search, and category browsing
- ✅ Shopping cart with localStorage persistence
- ✅ Product detail pages with colour variants
- ✅ Checkout with promo codes, shipping, gift wrap, and tax
- ✅ Order tracking and self-service cancellation (restores stock)
- ✅ Product reviews
- ✅ Newsletter subscription and contact form
- ✅ Help chatbot, including live order lookup
- ✅ Admin Inventory dashboard — sales, activity, customers, promos, charts, CSV/print
- ✅ Server-enforced admin authorization on every sensitive route
- ✅ Docker containerization

### API Endpoints

```
# Public
GET    /api/health                     # Liveness + database status
GET    /api                            # Service banner and route list
GET    /api/products                   # Storefront products (no cost prices)
GET    /api/products/:id               # Single product
GET    /api/categories                 # All categories
GET    /api/reviews                    # Reviews, optional ?productId=
POST   /api/reviews                    # Add a review
GET    /api/promos                     # Active, unexpired codes only
GET    /api/orders/:orderNumber        # Track one order by number
POST   /api/orders                     # Place an order
POST   /api/orders/cancel              # Cancel an order, restores stock
POST   /api/orders/by-email            # A shopper's own history
POST   /api/newsletter                 # Subscribe
POST   /api/contact                    # Contact form

# Admin — require a Bearer token or X-Admin-Secret
POST   /api/admin/session              # Exchange admin password for a token
GET    /api/admin/session              # Verify the current token
DELETE /api/admin/session              # Sign out
GET    /api/orders                     # All orders + sales summary
GET    /api/inventory                  # Products incl. costPrice
GET    /api/inventory/movements        # Stock audit log
PATCH  /api/inventory/:id              # Set exact stock
POST   /api/inventory/restock          # Add stock
POST   /api/products                   # Create a product
PATCH  /api/products/:id               # Edit a product
POST   /api/promos                     # Create a promo code
PATCH  /api/promos/:id                 # Enable/disable a promo code
```

## 🎨 Component Architecture

### Reusable UI Components
- `Button` - Multiple variants (primary, secondary, outline, ghost)
- `Badge` - Product badges (promotion, new, favorite)
- `SectionTitle` - Typography component

### Home Page Sections
- `Hero` - Main banner with CTA
- `ProductCollection` - Featured products grid
- `FeaturedBanner` - Lifestyle banner
- `CategoryCarousel` - Category navigation
- `BestSellers` - Highlighted best-selling products
- `NewArrival` - Latest product showcase
- `SustainabilitySection` - Planet-prioritizing content
- `Testimonials` - Customer reviews
- `EditorialSection` - Commitment to sustainability
- `SustainabilityCTA` - Newsletter signup

### Product Components
- `ProductCard` - Individual product display with cart action
- `ProductGrid` - Responsive grid layout

## 🎨 Color Tokens

```javascript
primary: '#1a4d2e'      // Deep forest green
secondary: '#7a9b7e'    // Muted sage
accent: '#8b9474'       // Soft olive
cream: '#f5f1e8'        // Warm off-white background
beige: '#e8e0d0'        // Light beige
olive: '#697756'        // Dark olive
charcoal: '#2c2c2c'     // Dark text
muted: '#6b7669'        // Muted text
```

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1279px
- **Desktop**: ≥ 1280px

## 🚢 Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Import repository in Vercel
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `client`
4. Add environment variables if needed
5. Deploy

### Backend Deployment

The backend can be deployed to:
- Heroku
- Railway
- Render
- DigitalOcean App Platform
- AWS Elastic Beanstalk

Or convert to Vercel Serverless Functions for a unified deployment.

## 🧪 Testing

See [SMOKE_TEST.md](SMOKE_TEST.md) for the latest end-to-end report.

```bash
# 1. backend
cd server && npm install && npm start    # :5000

# 2. frontend
cd client && npm install && npm run dev # :3000

# 3. confirm
curl http://localhost:5000/api/health   # {"ok":true,"database":"supabase"}
curl http://localhost:3000/api/health   # same, through the Vite proxy
```

Manual checks worth repeating:

- Add products to the cart, change quantity and colour, reload and confirm
  `localStorage` restored it.
- Place an order at checkout, then watch stock fall in the admin dashboard.
- Track the order by number in **lowercase** — it should still resolve.
- Open `/inventory` in a signed-out browser and confirm you get the admin
  sign-in form, then that the API refuses the dashboard's data without a token.

## 📝 Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```
Optional. Without it the app uses the Vite dev proxy (`/api` → `:5000`).

### Server (.env)
```
PORT=5000
NODE_ENV=development

SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key

ADMIN_EMAIL=admin2026@gmail.com
ADMIN_API_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

`SUPABASE_URL` and `SUPABASE_ANON_KEY` are required — without them every data
route returns `503`. The API has **no** local-JSON fallback.

### Admin access

The Inventory dashboard, `GET /api/orders`, and all product/promo writes are admin
only, and this is enforced **on the server**. The React route guard is only a
convenience — hiding the link changes nothing, because the API rejects the request
regardless.

Two ways to authenticate:

- **Dashboard (browser, recommended):** log in as `admin2026@gmail.com`, open
  `/inventory`, and press **Enter inventory dashboard**. Your login session is
  revalidated server-side and only that account is accepted — no extra
  password, nothing to forget.
- **Admin password (fallback):** sign in at `/inventory` with `ADMIN_EMAIL` +
  `ADMIN_PASSWORD`. The server returns a short-lived (8h) HMAC-signed token stored
  as `homelineAdminToken` and sent as `Authorization: Bearer <token>`. Sign-in is
  rate limited to 8 attempts per IP per 15 minutes. Requires `ADMIN_PASSWORD`
  and `ADMIN_SESSION_SECRET` in the server environment.
- **Scripts and CI:** send `X-Admin-Secret: <ADMIN_API_KEY>`.

A Supabase access token is also accepted on the Bearer path and revalidated with
`auth.getUser()`.

Generate the secrets once:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"   # ADMIN_API_KEY
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # ADMIN_SESSION_SECRET
```

Leaving `ADMIN_API_KEY` blank disables secret-header access entirely, and leaving
`ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` blank disables dashboard sign-in. Both
default to denying, so a fresh checkout is never wide open.

### What the storefront does *not* authenticate

Storefront accounts are still `localStorage`-only (`Login.jsx` stores plaintext
passwords). `POST /api/orders/by-email` is therefore scoped by a posted email
rather than a verified session — better than the previous behaviour of serving
every customer to every caller, but **not** real authentication. This project is a
portfolio demo and must not handle real customer data until storefront auth moves
onto a real identity provider.

## 🤝 Contributing

This is a portfolio project. Feel free to fork and customize for your own use.

## 📄 License

This project is created for portfolio purposes. Feel free to use the code with proper attribution.

## 👤 Author

Portfolio project by OJT

## 🙏 Acknowledgments

- Design inspiration from modern eco-friendly e-commerce brands
- Google Fonts for DM Sans and DM Serif Display
- Lucide for beautiful React icons
- Tailwind CSS for utility-first styling

## 📸 Screenshots

*Add screenshots of your deployed application here*

## 🔮 Future Enhancements

Realistically the biggest remaining gap is identity:

- [ ] Replace localStorage auth with Supabase Auth (or similar) for shoppers —
      the current accounts are client-side only, and `POST /api/orders/by-email`
      trusts a posted email
- [ ] Persist passwords properly (they are stored in plaintext today)
- [ ] Tighten Supabase RLS so the `anon` key cannot read `orders` or write to
      `newsletter_subscribers` / `contact_messages` / `promo_codes`
- [ ] Payment integration
- [ ] Email notifications
- [ ] Shared rate limiting (Redis or edge) for multi-instance deploys
- [ ] Non-sequential order numbers to stop leaking daily volume
- [ ] Wishlist feature
- [ ] Dark mode toggle
- [ ] Committed E2E suite (Playwright) — the smoke harness is currently ad hoc

## 📞 Support

For questions or feedback about this portfolio project, please open an issue in the repository.

---

**Built with ❤️ and ♻️ for a sustainable future**
