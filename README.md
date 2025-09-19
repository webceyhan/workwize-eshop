# WorkWize eShop - Multi-Supplier E-Commerce Platform

A modern multi-supplier e-commerce application built with Laravel 12, React 19, and TypeScript. This platform enables multiple suppliers to manage their products while providing customers with a unified shopping experience.

![WorkWize eShop](./public/logo.svg)

## 🌟 Features

### 🛍️ Customer Features
- **Product Catalog**: Browse products from multiple suppliers with advanced filtering and search
- **Shopping Cart**: Add products to cart, manage quantities, and proceed to checkout
- **Order Management**: View order history and track order status
- **User Authentication**: Secure registration and login system

### 🏪 Supplier Features
- **Product Management**: Full CRUD operations for product inventory with advanced filtering and sorting
- **Dashboard**: Overview of products, sales, and orders with detailed analytics
- **Sales Analytics**: Track sales performance, revenue, and customer insights
- **Inventory Tracking**: Monitor stock levels and manage product availability
- **Order Management**: View and update order statuses for supplier products
- **Customer Analytics**: Track customer purchasing patterns and top customers

### 🔧 Technical Features
- **Role-Based Access Control**: Separate interfaces for customers and suppliers with middleware protection
- **Responsive Design**: Works seamlessly on desktop and mobile devices with modern sidebar navigation
- **Real-time Updates**: Dynamic cart updates and inventory management
- **Type Safety**: Full TypeScript integration for frontend reliability
- **Modern UI**: Clean, professional design with shadcn/ui components and consistent design system
- **Advanced Filtering**: Spatie Query Builder integration for sophisticated product and order filtering
- **Bidirectional Navigation**: Seamless switching between customer and supplier login portals

## 🛠️ Tech Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Inertia.js
- **Database**: SQLite (development), MySQL/PostgreSQL (production)
- **Styling**: Tailwind CSS 4.0, shadcn/ui
- **Build Tool**: Vite 7.0
- **Routing**: Laravel Wayfinder route system
- **Query Building**: Spatie Laravel Query Builder for advanced filtering and sorting

## 📋 Prerequisites

Before installing, ensure you have:

- **PHP 8.2 or higher**
- **Composer** (PHP dependency manager)
- **Node.js 18+ and npm** (JavaScript runtime and package manager)
- **SQLite** (for development) or **MySQL/PostgreSQL** (for production)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd workwize-eshop
```

### 2. Install PHP Dependencies

```bash
composer install
```

### 3. Install Node.js Dependencies

```bash
npm install
```

### 4. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Generate an application key:

```bash
php artisan key:generate
```

### 5. Database Setup

For development (SQLite):
```bash
# Create SQLite database file
touch database/database.sqlite
```

For production, configure your `.env` file with your database credentials:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=workwize_eshop
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 6. Run Migrations and Seed Database

```bash
php artisan migrate:fresh --seed
```

This will create all necessary tables and populate the database with sample data including:
- Test admin account: `admin@example.com` / `password`
- Test customer account: `customer@example.com` / `password`
- Test supplier accounts: `supplier1@example.com` / `password` (and supplier2, supplier3)
- Sample products from multiple suppliers with realistic categories
- Sample orders and order items with various statuses
- Shopping cart items for testing checkout flow

### 7. Start Development Servers

Start the Laravel backend server:
```bash
php artisan serve
```

In a new terminal, start the Vite development server:
```bash
npm run dev
```

The application will be available at:
- **Frontend**: `http://localhost:5173` (or the port shown in terminal)
- **Backend API**: `http://127.0.0.1:8000`

## 👥 Test Accounts

The seeder creates the following test accounts:

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `password`
- **Role**: Admin (system administration access)

### Customer Account
- **Email**: `customer@example.com`
- **Password**: `password`
- **Role**: Customer (can browse and purchase products)

### Supplier Accounts
- **Email**: `supplier1@example.com` / **Password**: `password`
- **Email**: `supplier2@example.com` / **Password**: `password`
- **Email**: `supplier3@example.com` / **Password**: `password`
- **Role**: Supplier (can manage products and view sales)

## 🎯 Usage

### For Customers

1. **Browse Products**: Visit the homepage to see all available products
2. **Filter & Search**: Use the search bar and category filters to find specific products
3. **Add to Cart**: Click "Add to Cart" on any product (requires login)
4. **Checkout**: Review your cart and proceed to checkout
5. **Order History**: View your past orders in the orders section

### For Suppliers

1. **Login**: Use one of the supplier test accounts or navigate from customer login
2. **Dashboard**: Access the supplier dashboard to see an overview with sales analytics
3. **Manage Products**: Create, edit, delete, and filter your products with advanced search
4. **View Sales**: Monitor your sales performance, revenue, and detailed analytics
5. **Track Orders**: View and manage orders containing your products
6. **Customer Insights**: Analyze your customer base and purchasing patterns
7. **Inventory Management**: Keep track of stock levels and product status

## 🔧 Development

### Building for Production

1. Build the frontend assets:
```bash
npm run build
```

2. Optimize Laravel for production:
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Running Tests

```bash
# Run PHP tests
php artisan test

# Run JavaScript tests (if configured)
npm test
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev)
- [Inertia.js Documentation](https://inertiajs.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 Support

If you encounter any issues or have questions, please open an issue in the repository or contact the development team.

---

**WorkWize eShop** - Empowering suppliers and delighting customers with seamless e-commerce experiences.
