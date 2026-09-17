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
- ✅ Product grid with filtering capabilities
- ✅ Shopping cart with localStorage persistence
- ✅ Add to cart functionality
- ✅ Product categories
- ✅ Testimonials section
- ✅ Newsletter subscription UI
- ✅ Footer with sitemap
- ✅ RESTful API endpoints
- ✅ Docker containerization

### API Endpoints

```
GET    /api/products           # Get all products
GET    /api/products/:id       # Get product by ID
GET    /api/categories         # Get all categories
POST   /api/newsletter         # Subscribe to newsletter
POST   /api/contact            # Submit contact form
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

To test the application:

1. Start both frontend and backend servers
2. Navigate to http://localhost:3000
3. Test cart functionality:
   - Add products to cart
   - Check cart count updates
   - Verify localStorage persistence (refresh page)

## 📝 Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Server (.env)
```
PORT=5000
NODE_ENV=development
```

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

Potential features to add:
- [ ] Product detail pages
- [ ] Search functionality
- [ ] Category filtering
- [ ] User authentication
- [ ] Wishlist feature
- [ ] Payment integration
- [ ] Order history
- [ ] Product reviews
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Dark mode toggle

## 📞 Support

For questions or feedback about this portfolio project, please open an issue in the repository.

---

**Built with ❤️ and ♻️ for a sustainable future**
