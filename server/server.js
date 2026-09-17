import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample product data
const products = [
  {
    id: "eco-drinkware-01",
    name: "Reusable Drinkware",
    slug: "reusable-drinkware",
    price: 43.85,
    category: "Drinkware",
    badge: "Promotion",
    description: "Reusable drinkware designed for everyday sustainable living.",
    image: "/images/products/drinkware.jpg",
    colors: ["sage", "cream", "charcoal"],
    featured: true,
    bestSeller: false,
    newArrival: false
  },
  {
    id: "cookware-set-01",
    name: "Non-Toxic Cookware Set",
    slug: "non-toxic-cookware-set",
    price: 189.99,
    category: "Cooking",
    badge: "Customer Favorite",
    description: "Premium non-toxic cookware for healthy cooking.",
    image: "/images/products/cookware.jpg",
    colors: ["forest", "olive"],
    featured: true,
    bestSeller: true,
    newArrival: false
  },
  {
    id: "toaster-01",
    name: "Eco-Friendly Toaster",
    slug: "eco-friendly-toaster",
    price: 89.50,
    category: "Kitchen Essentials",
    badge: "New",
    description: "Energy-efficient toaster with sustainable materials.",
    image: "/images/products/toaster.jpg",
    colors: ["cream", "sage"],
    featured: true,
    bestSeller: false,
    newArrival: true
  },
  {
    id: "utensil-holder-01",
    name: "Bamboo Utensil Holder",
    slug: "bamboo-utensil-holder",
    price: 34.99,
    category: "Storage",
    badge: null,
    description: "Natural bamboo utensil organizer for your kitchen.",
    image: "/images/products/utensil-holder.jpg",
    colors: ["natural"],
    featured: true,
    bestSeller: false,
    newArrival: false
  },
  {
    id: "coffee-press-01",
    name: "French Press Coffee Maker",
    slug: "french-press-coffee-maker",
    price: 59.99,
    category: "Coffee & Drinkware",
    badge: "Best Seller",
    description: "Classic French press for rich, aromatic coffee.",
    image: "/images/products/coffee-press.jpg",
    colors: ["forest", "cream"],
    featured: false,
    bestSeller: true,
    newArrival: false
  },
  {
    id: "mixing-bowls-01",
    name: "Ceramic Mixing Bowl Set",
    slug: "ceramic-mixing-bowl-set",
    price: 75.00,
    category: "Cooking",
    badge: null,
    description: "Set of three handcrafted ceramic mixing bowls.",
    image: "/images/products/bowls.jpg",
    colors: ["sage", "cream", "olive"],
    featured: false,
    bestSeller: true,
    newArrival: false
  }
];

const categories = [
  {
    id: "coffee-drinkware",
    name: "Coffee & Drinkware",
    image: "/images/categories/coffee.jpg",
    slug: "coffee-drinkware"
  },
  {
    id: "cooking",
    name: "Cooking",
    image: "/images/categories/cooking.jpg",
    slug: "cooking"
  },
  {
    id: "natural-materials",
    name: "Natural Materials",
    image: "/images/categories/natural.jpg",
    slug: "natural-materials"
  },
  {
    id: "storage",
    name: "Storage",
    image: "/images/categories/storage.jpg",
    slug: "storage"
  },
  {
    id: "kitchen-essentials",
    name: "Kitchen Essentials",
    image: "/images/categories/essentials.jpg",
    slug: "kitchen-essentials"
  }
];

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Homeline API Server' });
});

// Get all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

// Get all categories
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Newsletter subscription
app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  // In a real app, you would save this to a database
  res.json({ message: 'Successfully subscribed to newsletter', email });
});

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  // In a real app, you would save this to a database or send an email
  res.json({ message: 'Message received successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
