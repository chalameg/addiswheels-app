# AddisWheels - Vehicle Rental Platform

AddisWheels is a comprehensive vehicle rental platform built with Next.js, TypeScript, and Prisma. The platform connects vehicle owners with renters, providing a seamless experience for listing, discovering, and renting vehicles.

## Features

### 🚗 Vehicle Management
- **Vehicle Listings**: Create, edit, and manage vehicle listings with multiple images
- **Search & Filter**: Advanced search functionality with filters for price, location, vehicle type
- **Image Gallery**: Multiple image support with gallery view
- **Featured Listings**: Highlight premium vehicles
- **Save Vehicles**: Users can save vehicles to their favorites

### 💳 Payment & Subscription System
- **One-time Payments**: Pay per vehicle listing
- **Subscription Plans**: Monthly, quarterly, and yearly plans for unlimited listings
- **Payment Processing**: Secure payment submission and management
- **Admin Payment Management**: Approve/reject payments with notifications

### 🔔 Notification System
- **Real-time Notifications**: Instant notifications for verification, payments, and vehicle approvals
- **Notification Dashboard**: Centralized notification management
- **Unread Indicators**: Visual indicators for unread notifications
- **Toast Alerts**: Real-time toast notifications for new events

### 👥 User Management
- **User Registration & Authentication**: Secure user registration and login
- **Profile Management**: Complete user profile with contact information
- **User Verification**: Document verification system with admin approval
- **Role-based Access**: User, admin, and owner roles
- **User Blocking**: Admin can block/unblock users

### 🛡️ Admin Dashboard
- **User Management**: View, block, and manage user roles
- **Vehicle Approval**: Approve/reject vehicle listings
- **Payment Management**: Process and approve payments
- **Subscription Management**: Manage user subscriptions
- **Verification System**: Approve/reject user verifications
- **Analytics**: Dashboard with key metrics and quick actions

### 💬 Messaging System
- **Real-time Chat**: Direct messaging between users
- **Conversation Management**: Organize and track conversations
- **Message Notifications**: Notify users of new messages
- **Read Receipts**: Track message read status

### 🤖 AI Chatbot
- **Gemini AI Integration**: Powered by Google's Gemini AI
- **Booking Assistance**: Help users with booking process
- **Vehicle Information**: Provide details about available vehicles
- **Payment Support**: Answer questions about payments and subscriptions
- **Smart Responses**: Context-aware conversations with message history

### 🌍 Multi-currency Support
- **Exchange Rate Integration**: Real-time currency conversion
- **Price Display**: Show prices in multiple currencies
- **Dynamic Pricing**: Automatic price updates based on exchange rates

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (via Prisma)
- **Authentication**: Custom JWT-based authentication
- **File Upload**: Built-in Next.js file handling
- **Styling**: Tailwind CSS with custom components
- **Testing**: Jest for API testing

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd addiswheels-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/addiswheels"
   JWT_SECRET="your-jwt-secret-key"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Chatbot Configuration (Optional)
   ENABLE_CHATBOT=true
   GEMINI_API_KEY="your-gemini-api-key-here"
   NEXT_PUBLIC_ENABLE_CHATBOT=true
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses Prisma with the following main models:

- **User**: User accounts with roles, verification status, and contact info
- **Vehicle**: Vehicle listings with images, pricing, and owner relations
- **Booking**: Rental bookings with dates and pricing
- **Payment**: Payment records for listings and subscriptions
- **Subscription**: User subscription plans and status
- **Notification**: User notifications with read status
- **Message**: Chat messages between users

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles/create` - Create new vehicle
- `GET /api/vehicles/[id]` - Get vehicle details
- `GET /api/vehicles/my` - Get user's vehicles
- `POST /api/vehicles/save` - Save vehicle to favorites

### Payments & Subscriptions
- `POST /api/payments/submit` - Submit payment
- `POST /api/subscriptions/submit` - Submit subscription
- `GET /api/admin/payments` - Admin payment management
- `GET /api/admin/subscriptions` - Admin subscription management

### Notifications & Messages
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/mark-read` - Mark notifications as read
- `GET /api/messages/conversations` - Get user conversations
- `POST /api/messages` - Send message

### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/vehicles` - Manage vehicles
- `GET /api/admin/verifications` - Manage verifications

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── chatbot/       # Chatbot API endpoint
│   ├── admin/             # Admin dashboard pages
│   ├── dashboard/         # User dashboard pages
│   └── vehicles/          # Vehicle-related pages
├── components/            # Reusable React components
│   └── Chatbot.tsx        # AI chatbot component
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── lib/                   # Library functions
│   └── gemini.ts          # Gemini AI integration
├── utils/                 # Utility functions
└── middleware.ts          # Next.js middleware
```

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

The application can be deployed to Vercel or any other Next.js-compatible platform:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

## 📦 Deployment (to cPanel or Node.js Server)

> For full-featured deployment (with backend logic):

1. Set your `.env.production`
2. Build the app:
```bash
npm run build
```
3. Start with PM2:
```bash
pm2 start npm --name "addiswheels" -- start
```

For static-only version:
```bash
npm run build && npm run export
```
Upload the `out/` folder to your subdomain in cPanel.


## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Chatbot Setup

For detailed chatbot setup instructions, see [CHATBOT_SETUP.md](./CHATBOT_SETUP.md).

## Support

For support and questions, please open an issue in the repository or contact the development team. 