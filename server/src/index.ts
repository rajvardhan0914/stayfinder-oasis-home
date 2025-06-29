import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import propertyRoutes from './routes/property.routes';
import authRoutes from './routes/auth.routes';
import connectDB from './config/database';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import reviewRoutes from './routes/review.routes';
import messageRoutes from './routes/message.routes';
import adminRoutes from './routes/admin.routes';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_BASE_URL = 'http://localhost:5000';

// Connect to MongoDB
connectDB();

// Debug: Log static file paths
console.log('Serving static files from:', path.join(__dirname, 'public'));
console.log('Serving property images from:', path.join(__dirname, 'public/properties'));

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/properties', express.static(path.join(__dirname, 'public/properties')));

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to StayFinder API' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 