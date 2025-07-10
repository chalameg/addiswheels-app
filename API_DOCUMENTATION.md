# AddisWheels - Comprehensive API & Component Documentation

## Table of Contents

1. [Overview](#overview)
2. [Database Models](#database-models)
3. [REST API Endpoints](#rest-api-endpoints)
4. [React Components](#react-components)
5. [Custom Hooks](#custom-hooks)
6. [Context Providers](#context-providers)
7. [Utility Functions](#utility-functions)
8. [Configuration](#configuration)
9. [Usage Examples](#usage-examples)

## Overview

AddisWheels is a comprehensive vehicle rental platform built with Next.js 15, TypeScript, and Prisma. It features vehicle management, user authentication, payment processing, subscription plans, real-time messaging, and multi-currency support.

**Tech Stack:**
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM
- Database: PostgreSQL
- Authentication: JWT-based custom authentication
- File Uploads: Cloudinary integration
- Payments: Multi-method payment system

## Database Models

### User Model
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string; // "user" | "admin"
  phone?: string;
  whatsapp?: string;
  blocked: boolean;
  isVerified: boolean;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  verificationDocument?: string;
  extraListings: number;
  isSubscriber: boolean;
  subscriptionExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vehicle Model
```typescript
interface Vehicle {
  id: number;
  type: "CAR" | "MOTORBIKE";
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  available: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured: boolean;
  images: string[];
  ownerId: number;
  createdAt: Date;
}
```

### Payment Model
```typescript
interface Payment {
  id: number;
  userId: number;
  amount: number;
  paymentMethod: string; // "TELEBIRR" | "CBE" | "AMOLE" | "BANK_TRANSFER" | "CASH"
  referenceNumber: string;
  screenshot?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentType: "LISTING" | "SUBSCRIPTION";
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: number;
}
```

### Subscription Model
```typescript
interface Subscription {
  id: number;
  userId: number;
  planType: "MONTHLY" | "QUARTERLY" | "YEARLY";
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  screenshot?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: number;
}
```

### Message Model
```typescript
interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  vehicleId: number;
  text: string;
  timestamp: Date;
  readAt?: Date;
}
```

### Notification Model
```typescript
interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: Date;
}
```

## REST API Endpoints

### Authentication APIs

#### POST /api/register
Register a new user account.

**Request Body:**
```typescript
{
  name: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  token?: string;
}
```

**Example:**
```javascript
const response = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    phone: '+251912345678'
  })
});
```

#### POST /api/login
Authenticate user and get access token.

**Request Body:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  token?: string;
}
```

#### POST /api/verify
Submit user verification documents.

**Request Body:**
```typescript
{
  verificationDocument: string; // File URL
}
```

**Headers:** `Authorization: Bearer <token>`

### Vehicle APIs

#### GET /api/vehicles
Get paginated list of vehicles with filtering.

**Query Parameters:**
- `type`: "CAR" | "MOTORBIKE"
- `minPrice`: number
- `maxPrice`: number
- `cursor`: number (for pagination)
- `limit`: number (default: 9)
- `status`: "PENDING" | "APPROVED" | "REJECTED"
- `featured`: "true" | "false"

**Response:**
```typescript
{
  vehicles: Vehicle[];
  nextCursor: number | null;
}
```

**Example:**
```javascript
const response = await fetch('/api/vehicles?type=CAR&minPrice=500&maxPrice=2000&limit=12');
const { vehicles, nextCursor } = await response.json();
```

#### POST /api/vehicles/create
Create a new vehicle listing.

**Request Body:**
```typescript
{
  type: "CAR" | "MOTORBIKE";
  brand: string;
  model: string;
  year: number;
  pricePerDay: number;
  images: string[];
}
```

**Headers:** `Authorization: Bearer <token>`

#### GET /api/vehicles/[id]
Get detailed information about a specific vehicle.

**Response:**
```typescript
{
  vehicle: Vehicle & {
    owner: {
      id: number;
      name: string;
      phone?: string;
      whatsapp?: string;
    };
  };
}
```

#### GET /api/vehicles/my
Get current user's vehicle listings.

**Headers:** `Authorization: Bearer <token>`

#### POST /api/vehicles/save
Save/unsave a vehicle to user's favorites.

**Request Body:**
```typescript
{
  vehicleId: number;
}
```

**Headers:** `Authorization: Bearer <token>`

#### GET /api/vehicles/saved
Get user's saved vehicles.

**Headers:** `Authorization: Bearer <token>`

### Payment APIs

#### POST /api/payments/submit
Submit payment for additional vehicle listings.

**Request Body:**
```typescript
{
  amount: number;
  paymentMethod: "TELEBIRR" | "CBE" | "AMOLE" | "BANK_TRANSFER" | "CASH";
  referenceNumber: string;
  screenshot?: string; // Cloudinary URL
}
```

**Headers:** `Authorization: Bearer <token>`

**Example:**
```javascript
const response = await fetch('/api/payments/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 500,
    paymentMethod: 'TELEBIRR',
    referenceNumber: 'TXN123456789',
    screenshot: 'https://res.cloudinary.com/...'
  })
});
```

### Subscription APIs

#### POST /api/subscriptions/submit
Submit subscription payment.

**Request Body:**
```typescript
{
  planType: "MONTHLY" | "QUARTERLY" | "YEARLY";
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  screenshot?: string;
}
```

**Headers:** `Authorization: Bearer <token>`

### Message APIs

#### GET /api/messages
Get paginated messages for a conversation.

**Query Parameters:**
- `vehicleId`: number
- `otherUserId`: number
- `cursor`: number

**Headers:** `Authorization: Bearer <token>`

#### POST /api/messages
Send a new message.

**Request Body:**
```typescript
{
  receiverId: number;
  vehicleId: number;
  text: string;
}
```

**Headers:** `Authorization: Bearer <token>`

#### GET /api/messages/conversations
Get user's message conversations.

**Headers:** `Authorization: Bearer <token>`

#### GET /api/messages/recent
Get recent messages for polling.

**Headers:** `Authorization: Bearer <token>`

### Notification APIs

#### GET /api/notifications
Get user's notifications.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```typescript
{
  notifications: Notification[];
}
```

#### POST /api/notifications/mark-read
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

### Admin APIs

#### GET /api/admin/users
Get all users (admin only).

**Headers:** `Authorization: Bearer <admin-token>`

#### PUT /api/admin/users/[id]
Update user status (block/unblock, change role).

**Request Body:**
```typescript
{
  blocked?: boolean;
  role?: "user" | "admin";
}
```

#### GET /api/admin/vehicles
Get all vehicles for admin management.

**Headers:** `Authorization: Bearer <admin-token>`

#### PUT /api/admin/vehicles/[id]
Update vehicle status.

**Request Body:**
```typescript
{
  status: "PENDING" | "APPROVED" | "REJECTED";
  featured?: boolean;
}
```

#### GET /api/admin/payments
Get all payments for admin review.

**Headers:** `Authorization: Bearer <admin-token>`

#### PUT /api/admin/payments/[id]
Approve/reject payment.

**Request Body:**
```typescript
{
  status: "APPROVED" | "REJECTED";
}
```

## React Components

### VehicleCard

Display vehicle information in a card format.

```typescript
interface VehicleCardProps {
  vehicle: {
    id: number;
    type: string;
    brand: string;
    model: string;
    year: number;
    pricePerDay: number;
    images?: string[];
    featured?: boolean;
  };
  isSaved?: boolean;
  onSave?: (vehicleId: number, e: React.MouseEvent) => void;
  saving?: boolean;
  showFeaturedBadge?: boolean;
}
```

**Usage:**
```tsx
<VehicleCard
  vehicle={vehicleData}
  isSaved={false}
  onSave={(vehicleId, e) => handleSaveVehicle(vehicleId)}
  saving={false}
  showFeaturedBadge={true}
/>
```

### PaymentModal

Modal for submitting payments for additional listings.

```typescript
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentListings: number;
  allowedListings: number;
}
```

**Usage:**
```tsx
<PaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  onSuccess={handlePaymentSuccess}
  currentListings={5}
  allowedListings={3}
/>
```

### SubscriptionModal

Modal for subscription plan selection and payment.

```typescript
interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

### ChatModal

Real-time messaging interface.

```typescript
interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicleId: number;
  otherUserId: number;
  otherUserName: string;
  vehicleTitle: string;
}
```

### ImageGallery

Display multiple vehicle images with navigation.

```typescript
interface ImageGalleryProps {
  images: string[];
  vehicleTitle: string;
  onClose: () => void;
}
```

### Navigation

Main navigation component with user authentication state.

```typescript
interface NavigationProps {
  user: {
    id: number;
    name: string;
    role: string;
  } | null;
  unreadNotifications: number;
}
```

### DashboardLayout

Layout wrapper for dashboard pages.

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  currentSection?: string;
}
```

### PriceDisplay

Multi-currency price display component.

```typescript
interface PriceDisplayProps {
  etbPrice: number;
  size?: "small" | "medium" | "large";
  showUSD?: boolean;
}
```

**Usage:**
```tsx
<PriceDisplay 
  etbPrice={1500} 
  size="medium" 
  showUSD={true} 
/>
```

### Pagination

Pagination controls for lists.

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}
```

### ConfirmationModal

Generic confirmation dialog.

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}
```

## Custom Hooks

### useNotifications

Hook for managing user notifications with real-time updates.

```typescript
function useNotifications(): {
  notifications: Notification[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: () => Promise<void>;
  unreadCount: number;
}
```

**Usage:**
```tsx
function NotificationComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <span>Unread: {unreadCount}</span>
      <button onClick={markAsRead}>Mark All Read</button>
    </div>
  );
}
```

### useMessages

Hook for real-time message polling and notifications.

```typescript
function useMessages(): {
  isPolling: boolean;
}
```

**Usage:**
```tsx
function MessagingComponent() {
  const { isPolling } = useMessages();
  
  useEffect(() => {
    // Automatically polls for new messages every 10 seconds
    // Shows toast notifications for new messages
  }, []);
  
  return <div>Messages {isPolling && "🔄"}</div>;
}
```

### useExchangeRate

Hook for fetching and managing exchange rates.

```typescript
function useExchangeRate(): {
  exchangeRate: number | null;
  loading: boolean;
  error: string | null;
}
```

## Context Providers

### ExchangeRateProvider

Provides global access to exchange rate data.

```typescript
interface ExchangeRateContextType {
  exchangeRate: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Usage:**
```tsx
// App setup
<ExchangeRateProvider>
  <App />
</ExchangeRateProvider>

// In components
function PriceComponent() {
  const { exchangeRate, loading } = useExchangeRate();
  
  if (loading) return <div>Loading rates...</div>;
  
  return <div>Rate: {exchangeRate}</div>;
}
```

## Utility Functions

### Exchange Rate Utils

```typescript
// Get current ETB to USD exchange rate
async function getETBtoUSDRate(): Promise<number>

// Convert ETB amount to USD
function convertETBtoUSD(etbAmount: number, exchangeRate: number): number

// Format USD amount with currency symbol
function formatUSD(usdAmount: number): string

// Format ETB amount with currency symbol
function formatETB(etbAmount: number): string
```

**Example:**
```typescript
import { getETBtoUSDRate, convertETBtoUSD, formatUSD } from '@/utils/exchangeRate';

const rate = await getETBtoUSDRate(); // 161.5
const usdAmount = convertETBtoUSD(1000, rate); // 6.20
const formatted = formatUSD(usdAmount); // "$6.20"
```

### Listing Limits Utils

```typescript
// Calculate payment amount needed for additional listings
function getPaymentAmount(additionalListings: number): number

// Check if user can create more listings
function canCreateListing(user: User, currentListings: number): boolean

// Get remaining free listings for user
function getRemainingListings(user: User, currentListings: number): number
```

### Notification Utils

```typescript
// Send notification to specific user
async function notifyUser(userId: number, message: string): Promise<void>
```

**Example:**
```typescript
import { notifyUser } from '@/utils/notifyUser';

await notifyUser(123, 'Your vehicle has been approved!');
```

### Logger Utils

```typescript
// Structured logging utility
const logger = {
  info: (message: string, meta?: object) => void,
  error: (message: string, error?: Error, meta?: object) => void,
  warn: (message: string, meta?: object) => void,
}
```

**Example:**
```typescript
import { logger } from '@/utils/logger';

logger.info('User registered', { userId: 123, email: 'user@example.com' });
logger.error('Payment failed', error, { paymentId: 456 });
```

## Configuration

### Application Config

```typescript
export const config = {
  listingLimit: {
    enabled: boolean,
    freeListings: 3,
    pricePerListing: 500, // ETB
  },
  subscriptionPlans: [
    {
      id: 'MONTHLY',
      name: 'Monthly Subscription',
      price: 1500, // ETB
      duration: 30, // days
      description: 'Unlimited vehicle listings for 1 month'
    },
    // ... other plans
  ],
  paymentMethods: [
    { value: 'TELEBIRR', label: 'Telebirr' },
    { value: 'CBE', label: 'CBE Birr' },
    // ... other methods
  ],
  paymentDetails: {
    telebirr: {
      number: '0912345678',
      name: 'AddisWheels Admin'
    },
    // ... other payment details
  }
}
```

## Usage Examples

### Complete Vehicle Listing Flow

```typescript
// 1. Check if user can create listing
import { canCreateListing } from '@/utils/listingLimits';

const canCreate = canCreateListing(user, currentListingsCount);

if (!canCreate) {
  // Show payment modal
  setShowPaymentModal(true);
  return;
}

// 2. Upload images to Cloudinary
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'bikerent_unsigned');
  
  const response = await fetch('https://api.cloudinary.com/v1_1/do394twgw/image/upload', {
    method: 'POST',
    body: formData,
  });
  
  const data = await response.json();
  return data.secure_url;
};

// 3. Create vehicle listing
const createVehicle = async (vehicleData: VehicleFormData) => {
  const imageUrls = await Promise.all(
    vehicleData.images.map(file => uploadImage(file))
  );
  
  const response = await fetch('/api/vehicles/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...vehicleData,
      images: imageUrls
    })
  });
  
  return response.json();
};
```

### Real-time Messaging Implementation

```typescript
// Component with messaging
function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const [showChat, setShowChat] = useState(false);
  const { isPolling } = useMessages(); // Auto-polls for new messages
  
  const handleStartChat = () => {
    setShowChat(true);
  };
  
  return (
    <div>
      <VehicleCard vehicle={vehicle} />
      <button onClick={handleStartChat}>
        Contact Owner {isPolling && "🔄"}
      </button>
      
      {showChat && (
        <ChatModal
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          vehicleId={vehicle.id}
          otherUserId={vehicle.ownerId}
          otherUserName={vehicle.owner.name}
          vehicleTitle={`${vehicle.brand} ${vehicle.model}`}
        />
      )}
    </div>
  );
}
```

### Multi-currency Price Display

```typescript
function ProductListing({ vehicle }: { vehicle: Vehicle }) {
  return (
    <ExchangeRateProvider>
      <div>
        <h2>{vehicle.brand} {vehicle.model}</h2>
        <PriceDisplay 
          etbPrice={vehicle.pricePerDay}
          size="large"
          showUSD={true}
        />
        <span>/day</span>
      </div>
    </ExchangeRateProvider>
  );
}
```

### Notification System Integration

```typescript
function Dashboard() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <DashboardLayout user={user}>
      <div className="notification-badge">
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
        <button onClick={markAsRead}>
          Clear Notifications
        </button>
      </div>
      
      <div className="notifications">
        {notifications.map(notification => (
          <div key={notification.id} className={notification.read ? 'read' : 'unread'}>
            {notification.message}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
```

### Admin Panel Implementation

```typescript
function AdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const handleApproveVehicle = async (vehicleId: number) => {
    const response = await fetch(`/api/admin/vehicles/${vehicleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'APPROVED' })
    });
    
    if (response.ok) {
      toast.success('Vehicle approved successfully');
      // Refresh vehicles list
      fetchVehicles();
    }
  };
  
  return (
    <div>
      {vehicles.map(vehicle => (
        <div key={vehicle.id}>
          <VehicleCard vehicle={vehicle} showFeaturedBadge={false} />
          <div className="admin-actions">
            <button onClick={() => handleApproveVehicle(vehicle.id)}>
              Approve
            </button>
            <button onClick={() => handleRejectVehicle(vehicle.id)}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

### API Error Responses

All API endpoints follow a consistent error response format:

```typescript
{
  error: string;
  message?: string;
  statusCode?: number;
}
```

### Common Error Codes

- **401 Unauthorized**: Invalid or missing authentication token
- **403 Forbidden**: Insufficient permissions (e.g., non-admin accessing admin routes)
- **404 Not Found**: Resource not found
- **400 Bad Request**: Invalid request data
- **429 Too Many Requests**: Rate limiting applied
- **500 Internal Server Error**: Server error

### Error Handling Examples

```typescript
// API call with error handling
const createVehicle = async (data: VehicleData) => {
  try {
    const response = await fetch('/api/vehicles/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create vehicle');
    }
    
    return result;
  } catch (error) {
    console.error('Vehicle creation failed:', error);
    toast.error(error.message);
    throw error;
  }
};
```

## Authentication & Authorization

### JWT Token Structure

```typescript
{
  userId: number;
  email: string;
  role: "user" | "admin";
  iat: number;
  exp: number;
}
```

### Authentication Middleware

```typescript
// Check authentication status
const isAuthenticated = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return !!decoded;
  } catch {
    return false;
  }
};

// Check admin permissions
const isAdmin = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.role === 'admin';
  } catch {
    return false;
  }
};
```

### Protected Route Example

```typescript
// Client-side route protection
function ProtectedPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Verify token and get user data
    fetchUserProfile(token).then(setUser).finally(() => setLoading(false));
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Redirecting...</div>;
  
  return <DashboardLayout user={user}>...</DashboardLayout>;
}
```

This documentation provides comprehensive coverage of all public APIs, components, and utilities in the AddisWheels platform. Each section includes TypeScript interfaces, usage examples, and best practices for implementation.