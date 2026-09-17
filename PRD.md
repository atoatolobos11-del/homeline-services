# PRD.md — Homeline Portfolio E-Commerce UI

## 1. Project Overview

**Project Name:** Homeline  
**Project Type:** Portfolio Front-End Project  
**Primary Goal:** Recreate the visual style, layout, and user experience of the provided eco-friendly kitchenware e-commerce design as a polished responsive portfolio website.

The project is intended for portfolio presentation and deployment on Vercel. It should focus on high-quality UI implementation, responsive design, reusable React components, smooth interactions, and clean project structure.

> Note: The provided image is used as a visual reference for the interface. The project should use original or properly licensed images and assets rather than copying protected brand assets.

---

## 2. Tech Stack

### Frontend
- React
- Tailwind CSS
- Vite recommended for development
- Lucide React for icons

### Backend / API
- Node.js
- Express.js
- Lightweight REST API for products and optional contact/newsletter functionality

### Development & Deployment
- Git + Git Bash
- Docker + Docker Compose
- Vercel for frontend deployment
- Optional backend deployment separately if server-side API is used

---

## 3. Target User

The website targets users who want to browse modern, sustainable, premium-looking kitchen and home products.

For portfolio purposes, the main audience is also:
- Recruiters
- Clients
- Developers reviewing UI and frontend skills

---

## 4. Design Direction

### Visual Style
The website should closely follow the supplied reference in overall composition and mood:

- Modern editorial e-commerce layout
- Premium eco-friendly aesthetic
- Warm off-white page background
- Deep forest green primary accent
- Muted sage/olive secondary colors
- Warm beige, cream, and subtle brown highlights
- Large lifestyle photography
- Rounded cards with soft borders
- Generous whitespace
- Clean, elegant typography
- Minimal but polished animations

### Suggested Color Tokens
- Background: warm off-white / light gray
- Primary: deep forest green
- Secondary: muted sage green
- Accent: soft olive
- Text: charcoal / dark green
- Muted text: gray-green
- Card borders: very light gray or beige

Use CSS variables or Tailwind theme extensions so colors remain consistent.

---

# 5. Information Architecture

The homepage should contain the following sections:

1. Header / Navigation
2. Hero Section
3. Product Collection
4. Featured Lifestyle Banner
5. Explore Categories
6. Best Sellers
7. New Arrival
8. Thoughtful Planet-Prioritizing Section
9. Customer Testimonials
10. Editorial / Sustainable Living Section
11. Community or Sustainability CTA
12. Footer

The design can be implemented as a long scrolling landing page, similar to the reference.

---

# 6. Detailed UI Requirements

## 6.1 Header

### Desktop Layout
Include:
- Brand logo/name: `Homeline`
- Navigation links:
  - Shop
  - Bestsellers
  - Gallery
  - About
- Large rounded search input
- Search icon
- Account/profile icon
- Shopping bag/cart icon

### Behavior
- Sticky header on scroll
- Transparent or dark overlay when positioned over the hero
- Transition to a solid light background after scrolling
- Navigation links should have hover states
- Icons should have accessible labels

### Mobile
- Logo
- Hamburger menu
- Search icon
- Cart icon
- Slide-out navigation drawer

---

## 6.2 Hero Section

Create a large full-width visual hero with a kitchen lifestyle image.

### Content
**Headline:**
`Eco-Friendly`
`Kitchenware`
`for a greener home`

The second line can use an elegant italic/serif font for visual contrast.

**Supporting text:**
A short message about sustainable and thoughtfully designed kitchen essentials.

**Primary CTA:**
`Shop now →`

### Additional UI
Add a floating sustainability information card containing:
- Small label
- `Natural. Sustainable. Eco-conscious.`
- A decorative icon
- Large percentage value such as `96%`

### Requirements
- Large rounded image container
- Dark gradient overlay on the left for text readability
- Hero image should adapt to different screen sizes
- Subtle zoom or parallax effect is optional

---

## 6.3 Product Collection Section

### Heading
`Eco Essentials Planet-Friendly`
`Best Selling → Products`

Use mixed typography, including an italic accent where appropriate.

### Product Grid
Display four product cards on desktop and fewer columns responsively.

Each card should include:
- Product image
- Small badge, such as:
  - Promotion
  - New
  - Customer favorite
- Optional color swatches
- Product name
- Product price
- Rounded `+ Cart` button

### Example Products
1. Reusable Drinkware
2. Non-Toxic Cookware Set
3. Eco-Friendly Toaster
4. Bamboo Utensil Holder

### Interaction
- Product image scale on hover
- Card elevation or border transition
- Add-to-cart feedback
- Optional toast notification

---

## 6.4 Featured Lifestyle Banner

Add a wide image section showing a modern sustainable kitchen.

### Overlay
Include a small content card with:
- Category label
- Short title
- CTA button

The section should visually break up the product catalog and provide an editorial feel.

---

## 6.5 Explore Categories

Create a horizontal category section inspired by the small image cards in the reference.

Suggested categories:
- Coffee & Drinkware
- Cooking
- Natural Materials
- Storage
- Kitchen Essentials

### Layout
- Horizontal scrolling on mobile
- Card grid or horizontal row on desktop
- Image thumbnail
- Category title
- Optional arrow

---

## 6.6 Best Sellers Section

Create a two-column editorial layout.

### Left
- Heading: `Best Sellers`
- Short description
- CTA: `Shop now →`

### Right
- Large product/lifestyle image

The image should use rounded corners and maintain the premium visual style.

---

## 6.7 New Arrival Section

Create another two-column section.

### Left
Large product image, such as cookware.

### Right
- Heading: `New Arrival`
- Short descriptive paragraph
- CTA button

The layout should alternate from the Best Sellers section for visual rhythm.

---

## 6.8 Planet-Prioritizing / Product Story Section

Create a section that communicates sustainability.

### Main Content
Heading:
`Thoughtful, Planet-Prioritizing Ideas and Inspiration`

Include:
- Large editorial image
- Several smaller product or material thumbnails
- Short captions

Suggested cards:
- Natural Materials
- Low-Waste Living
- Sustainable Cooking
- Conscious Choices

---

## 6.9 Testimonials

Create a clean testimonial strip similar to the reference.

### Summary Area
Display:
- Average rating, e.g. `4.9`
- Short trust statement

### Review Cards
Show 3–4 cards containing:
- Quote icon
- Short testimonial
- Customer name
- Optional small role/location

Do not use real customer names unless they are fictional or supplied by the project owner.

---

## 6.10 Editorial Section

Create a large editorial/lifestyle image collage.

### Content
Heading:
`Discover our commitment to sustainable materials, low-impact production, and mindful partnerships.`

Use mixed font weights and italic text for emphasis.

Include:
- Multiple overlapping or grid-based images
- Small decorative labels
- Subtle animation on hover

---

## 6.11 Sustainability CTA

Add a visually strong section near the bottom.

Example message:
`A greener kitchen starts with everyday choices.`

Include:
- CTA button
- Optional email/newsletter field
- Decorative sustainable product image

---

## 6.12 Footer

Include:
- Brand
- Short description
- Shop links
- Company links
- Help/support links
- Social icons
- Copyright

Example columns:
- Shop
- About
- Sustainability
- Journal
- Contact

---

# 7. Functional Requirements

## Required Frontend Features
- Responsive navigation
- Mobile menu
- Search UI
- Product data rendering from JSON/API
- Add to cart
- Cart item count
- Remove from cart
- Quantity controls
- LocalStorage cart persistence
- Product card hover interactions
- Smooth scrolling
- Responsive layout
- Accessible buttons and form controls

## Optional Features
- Product details modal/page
- Category filtering
- Search filtering
- Dark mode
- Wishlist
- Newsletter form
- Animated page transitions

---

# 8. Backend Requirements

A simple Node.js + Express backend is enough.

## Suggested Endpoints

### Products
- `GET /api/products`
- `GET /api/products/:id`

### Categories
- `GET /api/categories`

### Newsletter
- `POST /api/newsletter`

### Contact
- `POST /api/contact`

For a portfolio version, product data may also be stored in a local JSON file if deploying a separate backend is unnecessary.

---

# 9. Suggested Data Model

## Product

```json
{
  "id": "eco-bottle-01",
  "name": "Reusable Drinkware",
  "slug": "reusable-drinkware",
  "price": 43.85,
  "category": "Drinkware",
  "badge": "Promotion",
  "description": "Reusable drinkware designed for everyday sustainable living.",
  "image": "/images/products/drinkware.jpg",
  "colors": ["sage", "cream", "charcoal"],
  "featured": true,
  "bestSeller": true,
  "newArrival": false
}
```

---

# 10. Component Architecture

Suggested React structure:

```text
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── SectionTitle.jsx
│   │   └── Badge.jsx
│   ├── product/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   └── ColorSwatches.jsx
│   └── home/
│       ├── Hero.jsx
│       ├── FeaturedBanner.jsx
│       ├── CategoryCarousel.jsx
│       ├── BestSellers.jsx
│       ├── NewArrival.jsx
│       ├── SustainabilitySection.jsx
│       └── Testimonials.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── Shop.jsx
│   ├── About.jsx
│   └── Cart.jsx
│
├── data/
│   └── products.js
│
├── hooks/
│   └── useCart.js
│
├── context/
│   └── CartContext.jsx
│
├── App.jsx
└── main.jsx
```

---

# 11. Responsive Requirements

## Desktop
Target: 1280px and above
- Large hero
- 4-column product grid
- Multi-column editorial layouts
- Full navigation

## Tablet
Target: 768px–1279px
- 2-column or 3-column product grid
- Reduced spacing
- Simplified hero typography

## Mobile
Target: below 768px
- Single-column content where appropriate
- Horizontal category scroll
- 2-column product grid when readable
- Hamburger navigation
- Full-width CTAs
- Touch-friendly buttons
- No horizontal page overflow

---

# 12. Typography

Use two complementary font families:

### Display / Editorial Font
For:
- Hero accent text
- Section highlights
- Italic words

Examples:
- DM Serif Display
- Playfair Display
- Cormorant Garamond

### Sans Serif
For:
- Navigation
- Product details
- Buttons
- Body text

Examples:
- Inter
- Manrope
- DM Sans

Typography should feel modern, editorial, and premium.

---

# 13. Animation Guidelines

Keep animations subtle.

Recommended:
- Fade-up on section entry
- Product image scale on hover
- Button background transition
- Navigation transition
- Smooth mobile menu animation
- Cart count feedback

Optional library:
- Framer Motion

Avoid excessive animation that affects performance.

---

# 14. Image Strategy

Use original, generated, or properly licensed assets.

Suggested folders:

```text
public/
└── images/
    ├── hero/
    ├── products/
    ├── categories/
    └── editorial/
```

Recommended image characteristics:
- Warm natural lighting
- Sustainable kitchen/home environment
- Forest green, sage, beige, cream palette
- Minimal composition
- High-resolution WebP or optimized JPG

---

# 15. Docker Setup

The project should support containerized development.

Suggested files:

```text
project-root/
├── client/
│   ├── Dockerfile
│   └── ...
├── server/
│   ├── Dockerfile
│   └── ...
├── docker-compose.yml
└── README.md
```

## Containers
- `client`: React + Vite
- `server`: Node.js + Express

Docker Compose should allow the project to start with:

```bash
docker compose up --build
```

---

# 16. Git Workflow

Recommended branches:

- `main` — production-ready code
- `develop` — integration branch
- `feature/header`
- `feature/hero`
- `feature/products`
- `feature/cart`
- `feature/responsive-ui`

Example workflow:

```bash
git checkout -b feature/hero
git add .
git commit -m "feat: add responsive hero section"
git push origin feature/hero
```

Use meaningful commits:
- `feat:`
- `fix:`
- `style:`
- `refactor:`
- `docs:`

---

# 17. Vercel Deployment

## Frontend
Deploy the React application to Vercel.

Expected workflow:

1. Push project to GitHub.
2. Import repository into Vercel.
3. Configure the frontend root directory if using a monorepo.
4. Add environment variables if needed.
5. Deploy.

For a simple portfolio project, the frontend can run independently with mock/local JSON data.

If the Express API is required, deploy it separately or convert simple API routes to Vercel serverless functions.

---

# 18. Environment Variables

Example:

```env
VITE_API_URL=http://localhost:5000/api
PORT=5000
```

Do not commit real secrets.

Create:

```text
.env.example
```

---

# 19. Performance Requirements

- Optimize images
- Lazy-load non-critical images
- Avoid unnecessary re-renders
- Use responsive image sizes
- Maintain good Lighthouse performance where practical
- Prevent layout shifts
- Keep animations GPU-friendly

---

# 20. Accessibility Requirements

- Semantic HTML
- Visible keyboard focus states
- Alt text for meaningful images
- Accessible icon buttons
- Proper heading hierarchy
- Adequate color contrast
- Labels for form controls

---

# 21. Portfolio Success Criteria

The completed project should demonstrate:

- Strong React component architecture
- Advanced Tailwind CSS styling
- Accurate recreation of the reference layout and visual hierarchy
- Responsive desktop, tablet, and mobile design
- Reusable UI components
- Working cart interactions
- Clean Git history
- Dockerized development environment
- Successful Vercel deployment
- Professional README with screenshots and setup instructions

---

# 22. Recommended Development Order

## Phase 1 — Setup
- Initialize React + Vite
- Install Tailwind CSS
- Configure fonts and theme
- Initialize Git
- Create folder structure

## Phase 2 — Core UI
- Header
- Hero
- Product cards
- Product section
- Footer

## Phase 3 — Homepage Sections
- Category cards
- Best sellers
- New arrival
- Editorial section
- Testimonials

## Phase 4 — Functionality
- Product data
- Cart context
- LocalStorage
- Search/filtering

## Phase 5 — Responsive Design
- Tablet adjustments
- Mobile navigation
- Mobile product layouts
- Touch interactions

## Phase 6 — Backend
- Express setup
- Products API
- Contact/newsletter endpoints

## Phase 7 — DevOps & Deployment
- Dockerfiles
- Docker Compose
- GitHub repository
- Vercel deployment

---

# 23. Final Deliverables

The finished repository should contain:

```text
homeline-portfolio/
├── client/
├── server/
├── public/
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
└── PRD.md
```

The final deployed website should feel like a premium, eco-conscious kitchenware brand and closely match the visual hierarchy of the provided reference while using the developer's own code, content, and properly licensed assets.
