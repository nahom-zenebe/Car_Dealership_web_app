# 🚗 Car Dealership Web App

A full-stack **car dealership** web application built with **Next.js**, **Prisma ORM**, and **MongoDB**.  
It features a sleek API-driven backend with CRUD operations for cars, customers, and sales, a shopping cart, user authentication, and Stripe payment integration.

---

## 🛠️ Tech Stack

- **Next.js** — React framework for server-rendered apps & API routes  
- **Prisma** — Next-gen ORM to interact with MongoDB  
- **MongoDB** — NoSQL database for flexible, scalable data storage  
- **Stripe** — Payment gateway to process car purchases  
- **React Context / Zustand** — For managing global app state (e.g., cart)  
- **TypeScript** — Strong typing for safer code

---

## 🚀 Features

### Core

- 🔍 Browse car listings with filters (make, model, year, price)  
- 📦 Add cars to a shopping cart  
- 🛒 View, update, or remove items from cart  
- 👤 Customer registration & login (JWT-based authentication)  
- 💳 Stripe integration for secure payment checkout  
- 🗃️ Backend CRUD APIs for cars, customers, sales  
- 🛠️ Admin dashboard (optional) to manage inventory & orders

### Advanced

- 📝 User reviews & ratings for cars  
- 📞 Contact form for inquiries  
- 🔔 Email notifications for order confirmation  
- 📱 Responsive UI for mobile & desktop

---

## ⚙️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/car-dealership.git
cd car-dealership

2. Install dependencies

npm install

3. Setup environment variables

Create a .env file in the root:

DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/car_dealership?retryWrites=true&w=majority"
STRIPE_SECRET_KEY=sk_test_***************
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_**************

Replace placeholders with your actual credentials.
4. Generate Prisma Client

npx prisma generate

5. Run the development server

npm run dev

Visit http://localhost:3000 to see the app.
📦 API Endpoints (Examples)

    GET /api/cars — List all cars

    POST /api/cars — Add a new car (admin)

    GET /api/cars/[id] — Get car details

    PUT /api/cars/[id] — Update car info

    DELETE /api/cars/[id] — Remove car

    POST /api/cart — Add item to cart

    GET /api/cart — Get current cart

    POST /api/checkout — Create Stripe payment session

    POST /api/auth/login — User login

    POST /api/auth/register — User registration

💳 Stripe Payment Flow

    Users add cars to their cart

    Proceed to checkout page

    Initiate Stripe payment session on backend

    Redirect to Stripe-hosted payment page

    After payment, webhook updates sale records in database

    Send order confirmation email

🧩 Project Structure

/app
  /generated/prisma        ← Prisma Client
/pages
  /api
    /cars                 ← Cars CRUD API
    /customers            ← Customer APIs
    /sales                ← Sales & payment APIs
    /auth                 ← Authentication APIs
/components              ← React UI components
/context                 ← React Context / Zustand stores
/prisma
  schema.prisma           ← Prisma schema file
/public                  ← Static assets (images, icons)
/styles                  ← CSS / Tailwind styles
.env                     ← Environment variables

🤝 Contributing

Contributions welcome! Please open issues or PRs for features, bugs, or improvements.
📄 License

MIT License © 2025 Nahom Zenebe