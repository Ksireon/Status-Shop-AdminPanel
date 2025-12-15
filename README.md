# Status Shop Admin Panel

A comprehensive administrative panel for managing the Status Shop e-commerce platform. Built with Next.js 14, TypeScript, and Tailwind CSS, providing full control over users, orders, products, and system monitoring without requiring administrator authentication.

## Features

### 🏠 Dashboard
- **Statistics Overview**: Real-time metrics for users, orders, products, and revenue
- **Recent Orders**: Quick view of the latest 10 orders with status indicators
- **Quick Actions**: Direct access to major management functions
- **Responsive Design**: Mobile-first approach with adaptive layouts

### 👥 User Management
- **Complete User Overview**: View all registered users with detailed profiles
- **User Actions**: View, edit, and delete user accounts
- **Profile Information**: Name, email, company, position, city, phone, registration date
- **Bulk Operations**: Efficient management of multiple user records

### 📦 Order Management
- **Order Tracking**: Comprehensive view of all customer orders
- **Status Management**: Filter orders by status (pending, processing, completed, cancelled)
- **Order Details**: Customer information, payment method, delivery details, items
- **Real-time Updates**: Live status changes and order modifications

### 🛍️ Product Catalog
- **Product Grid**: Visual catalog with images, prices, and specifications
- **Product Details**: Name, description, type, color, size, price, meters
- **Image Support**: Product images with fallback placeholders
- **Inventory Management**: Easy product editing and deletion

### 🛒 Cart Monitoring
- **Active Carts**: Monitor current shopping carts across all users
- **Cart Analytics**: Statistics on cart usage and abandoned items
- **User Grouping**: Organize cart items by user for better overview
- **Cart Management**: Remove items from user carts when needed

### 📊 Analytics (Coming Soon)
- **Sales Reports**: Revenue analysis and trend identification
- **Customer Analytics**: User behavior and purchase patterns
- **Product Performance**: Best-selling items and inventory insights
- **Export Capabilities**: Generate reports for business analysis

### ⚙️ System Health
- **Database Status**: Real-time Supabase connection monitoring
- **API Health**: Backend service availability and response times
- **Performance Metrics**: System uptime, response times, and connection details
- **Auto-refresh**: Automatic health checks every 30 seconds

## Technology Stack

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript 5
- **Styling**: Tailwind CSS 4 with custom components
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **State Management**: React hooks and context
- **Data Fetching**: SWR for caching and real-time updates
- **UI Components**: Headless UI, Radix UI components
- **Icons**: Lucide React
- **Charts**: Chart.js and react-chartjs-2
- **Forms**: React Hook Form with Zod validation

## Architecture

### Database Schema
- **profiles**: User account information
- **products**: Product catalog with JSON fields for multi-language support
- **orders**: Order management with embedded items array
- **cart_items**: Shopping cart items linked to users

### Security Features
- **Anonymous Access**: No authentication required for admin panel
- **Row Level Security**: Configured for anon and authenticated roles
- **Environment Variables**: Secure configuration management
- **Input Validation**: Form validation and data sanitization

### Performance Optimizations
- **Server-side Rendering**: Fast initial page loads
- **Code Splitting**: Optimized bundle sizes
- **Image Optimization**: Next.js Image component for efficient loading
- **Caching**: SWR for intelligent data fetching

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Supabase account and project

### Environment Configuration
Create a `.env.local` file with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_API_BASE_URL=https://status-shop-backend-production.up.railway.app/api/v1
```

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Usage Guide

### Accessing the Admin Panel
1. Navigate to `http://localhost:3000` (or your deployed URL)
2. The dashboard loads automatically with real-time statistics
3. Use the sidebar navigation to access different management sections

### Managing Users
1. Click "Users" in the sidebar
2. View all registered users in the table
3. Use action buttons to view, edit, or delete users
4. Click "Add New User" to create accounts manually

### Processing Orders
1. Navigate to "Orders" section
2. Filter orders by status using the dropdown
3. Click on order ID to view detailed information
4. Update order status as needed

### Product Management
1. Go to "Products" in the navigation
2. Browse products in grid layout with images
3. Click edit icon to modify product details
4. Use delete button to remove products

### Cart Monitoring
1. Access "Cart" section from sidebar
2. View active shopping carts grouped by user
3. Monitor cart statistics and abandoned items
4. Remove items from carts when necessary

### System Monitoring
1. Visit "System" page for health status
2. Check database and API connectivity
3. Monitor response times and performance metrics
4. View connection details and configuration

## API Integration

The admin panel integrates with the Status Shop backend API:
- **Base URL**: `https://status-shop-backend-production.up.railway.app/api/v1`
- **Authentication**: Bearer token when available
- **Endpoints**: Users, Orders, Products, Cart management

### Key Endpoints
- `GET /users/:uid` - Get user details
- `GET /users/:uid/orders` - Get user orders
- `GET /orders/:id` - Get order details
- `GET /products` - Get product catalog
- `GET /users/:uid/cart` - Get user cart items

## Database Configuration

### Supabase Setup
1. Create new Supabase project
2. Run migration scripts from `/supabase/migrations`
3. Configure Row Level Security policies
4. Set up anon role permissions for admin access

### Required Tables
- **profiles**: User account data
- **products**: Product inventory
- **orders**: Order management
- **cart_items**: Shopping cart data

## Deployment

### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy with automatic builds

### Custom Deployment
1. Build the application: `npm run build`
2. Set up production environment variables
3. Deploy to your preferred hosting platform
4. Configure domain and SSL certificates

## Troubleshooting

### Common Issues
- **Database Connection**: Verify Supabase credentials
- **API Errors**: Check backend service availability
- **Permission Issues**: Ensure RLS policies are configured
- **Build Failures**: Update dependencies and check Node.js version

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=true npm run dev
```

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

## License

This project is part of the Status Shop ecosystem and follows the same licensing terms.

## Support

For technical support or questions:
- Check the troubleshooting section
- Review system health monitoring
- Verify database and API connectivity
- Consult the technical documentation

---

**Status Shop Admin Panel** - Complete e-commerce management solution with full administrative control.