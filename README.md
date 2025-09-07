# StayFinder - Complete Vacation Rental Platform

A full-stack MERN (MongoDB, Express.js, React, Node.js) application for vacation rental bookings with modern UI, real-time features, and comprehensive user management.

## 🚀 Features

### Core Functionality
- **Property Listings**: Browse, search, and filter vacation rentals
- **Booking System**: Complete booking flow with date validation and availability checking
- **User Authentication**: Secure login/register with JWT tokens
- **User Profiles**: Comprehensive profile management with preferences
- **Favorites System**: Save and manage favorite properties
- **Image Upload**: Support for multiple property images and user avatars
- **Reviews & Ratings**: Property review system
- **Multi-language Support**: Internationalization (English, Spanish, Hindi)
- **Currency Conversion**: Multi-currency support (INR, USD, EUR, GBP)

### Advanced Features
- **3D Property Visualization**: Interactive 3D property scenes
- **Real-time Search**: Location-based property search
- **Responsive Design**: Mobile-first responsive UI
- **Toast Notifications**: User-friendly feedback system
- **Form Validation**: Comprehensive client and server-side validation
- **File Upload**: Secure image upload with multer
- **Error Handling**: Robust error handling throughout the application

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** for form management
- **i18next** for internationalization
- **Sonner** for toast notifications
- **Three.js** for 3D visualizations

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stayfinder-oasis-home
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/stayfinder
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Admin Credentials (NEVER commit these to git!)
   ADMIN_EMAIL=admin@stayfinder.com
   ADMIN_PASSWORD=admin123456
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Cloudinary Configuration (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. **Database Setup**
   
   Ensure MongoDB is running locally or update the MONGODB_URI to point to your cloud instance.

6. **Start the application**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

7. **Create Admin User**
   ```bash
   cd server
   npm run seed:user
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Admin Login: http://localhost:5173/admin-login

## 🗄️ Database Schema

### User Model
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'host' | 'admin';
  avatar?: string;
  phoneNumber?: string;
  isVerified: boolean;
  favorites: ObjectId[];
  preferences: {
    language: string;
    currency: string;
    notifications: { email: boolean; sms: boolean; marketing: boolean };
    privacy: { profileVisibility: string; showEmail: boolean; showPhone: boolean };
  };
  twoFactorEnabled: boolean;
  dateOfBirth: Date;
  address: { street: string; city: string; state: string; country: string; zipCode: string };
}
```

### Property Model
```typescript
{
  title: string;
  description: string;
  price: number;
  location: { address: string; city: string; state: string; country: string; coordinates: { lat: number; lng: number } };
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  owner: ObjectId;
  rating: number;
  reviews: Array<{ user: ObjectId; rating: number; comment: string; date: Date }>;
  availability: Array<{ startDate: Date; endDate: Date }>;
  type: 'Apartment' | 'Villa' | 'House' | 'Cabin';
}
```

### Booking Model
```typescript
{
  property: ObjectId;
  user: ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `GET /api/properties/search` - Search properties
- `POST /api/properties/upload-images` - Upload property images

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-avatar` - Upload user avatar
- `GET /api/users/favorites` - Get user favorites
- `POST /api/users/favorites/:propertyId` - Add to favorites
- `DELETE /api/users/favorites/:propertyId` - Remove from favorites
- `GET /api/users/my-properties` - Get user's properties

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/:id` - Get booking details

## 🎨 UI Components

The application uses a comprehensive set of UI components built with Shadcn/ui:

- **Navigation**: Header with user menu and navigation
- **Cards**: Property cards with image galleries
- **Forms**: Comprehensive form components with validation
- **Modals**: Dialog components for confirmations
- **Toast**: Notification system for user feedback
- **3D Scenes**: Interactive property visualizations

## 🌐 Internationalization

The application supports multiple languages:
- **English** (default)
- **Spanish**
- **Hindi**

Language switching is available in the user preferences, and all text content is internationalized using i18next.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Comprehensive validation on both client and server
- **CORS Configuration**: Proper cross-origin request handling
- **File Upload Security**: Secure image upload with validation
- **Error Handling**: Secure error responses without sensitive data exposure

## 🚀 Deployment

### Current Deployment Setup
- **Backend**: Deployed on Render
- **Frontend**: Deployed on Vercel

### Frontend Deployment (Vercel)
```bash
npm run build
```

### Backend Deployment (Render)
```bash
cd server
npm run build
npm start
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

To test the database connection:
```bash
cd server
npm run dev
```

To create admin user:
```bash
cd server
npm run seed:user
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the Help Center in the application
- Review the API documentation
- Contact the development team

---

**StayFinder** - Your perfect vacation rental platform! 🏠✨
