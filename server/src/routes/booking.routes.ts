import express, { Request } from 'express';
import { Booking } from '../models/Booking';
import { Property, IProperty } from '../models/Property';
import { User, IUser } from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

interface PopulatedBooking {
  _id: string;
  property: IProperty;
  user: IUser;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const router = express.Router();

// Create a new booking
router.post('/', auth, async (req: AuthRequest, res) => {
  console.log('Server UTC now:', new Date().toISOString());
  try {
    const { propertyId, checkIn, checkOut, guests } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    console.log('Booking request:', { propertyId, checkIn, checkOut, guests });

    // Validate required fields
    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({ 
        message: 'Missing required fields: propertyId, checkIn, checkOut, and guests are required' 
      });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    checkInDate.setUTCHours(0, 0, 0, 0);
    const checkOutDate = new Date(checkOut);
    checkOutDate.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    console.log('Date validation:', {
      checkInDate: checkInDate.toISOString(),
      checkOutDate: checkOutDate.toISOString(),
      today: today.toISOString()
    });

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    if (checkInDate < today) {
      return res.status(400).json({ message: 'Cannot book dates in the past' });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check for overlapping bookings for the same property
    const overlappingBookingsCount = await Booking.countDocuments({
      property: propertyId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { checkIn: { $lt: checkOutDate, $gte: checkInDate } },
        { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
        { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } }
      ]
    });
    if (overlappingBookingsCount >= property.numberOfUnits) {
      return res.status(400).json({
        message: `This property is fully booked for the selected dates. Only ${property.numberOfUnits} unit(s) available.`
      });
    }

    // Check if number of guests is within limit
    if (!property || typeof property.maxGuests !== 'number') {
      return res.status(400).json({ message: 'Property maxGuests not set.' });
    }
    if (guests > property.maxGuests) {
      return res.status(400).json({ 
        message: `This property can only accommodate up to ${property.maxGuests} guests` 
      });
    }

    // Calculate total price
    const nights = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = property.price; // Use property.price as nightly rate
    const subtotal = nights * pricePerNight;
    const fees = Math.round(subtotal * 0.1); // 10% of subtotal for both cleaning and service
    const total = subtotal + fees;

    // Create booking
    const booking = new Booking({
      property: propertyId,
      user: userId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice: total,
      status: 'confirmed'
    });

    await booking.save();
    console.log('Booking created:', booking);

    // Update property availability
    const updatedAvailability = property.availability.map(period => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      
      // If the booking completely overlaps this period, remove it
      if (checkInDate <= periodStart && checkOutDate >= periodEnd) {
        return null;
      }
      
      // If the booking starts during this period, split the period
      if (checkInDate > periodStart && checkInDate < periodEnd) {
        return {
          startDate: periodStart,
          endDate: checkInDate
        };
      }
      
      // If the booking ends during this period, split the period
      if (checkOutDate > periodStart && checkOutDate < periodEnd) {
        return {
          startDate: checkOutDate,
          endDate: periodEnd
        };
      }
      
      // If the booking doesn't overlap this period, keep it as is
      return period;
    }).filter(Boolean); // Remove null periods

    property.availability = updatedAvailability as { startDate: Date; endDate: Date }[];
    await property.save();
    console.log('Property availability updated:', property.availability);

    res.status(201).json({
      ...booking.toObject(),
      breakdown: {
        nights,
        pricePerNight,
        subtotal,
        fees,
        total
      }
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ 
      message: 'Failed to create booking',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    console.log(`Fetching bookings for user: ${req.user._id}`);
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'property',
        model: 'Property',
        populate: { 
          path: 'owner', 
          model: 'User',
          select: 'firstName lastName avatar _id' 
        }
      })
      .sort({ createdAt: -1 });
    console.log(`Found ${bookings.length} bookings.`);
    // Log if any bookings have a null property after population
    bookings.forEach(b => {
      if (!b.property) {
        console.warn(`Booking ${b._id} has a missing or null property reference.`);
      }
    });

    // Attach breakdown to each booking
    const bookingsWithBreakdown = bookings.map(b => {
      let breakdown = undefined;
      if (
        b.property &&
        typeof b.property === 'object' &&
        'price' in b.property &&
        b.checkIn && b.checkOut
      ) {
        const checkIn = new Date(b.checkIn);
        checkIn.setUTCHours(0, 0, 0, 0);
        const checkOut = new Date(b.checkOut);
        checkOut.setUTCHours(0, 0, 0, 0);
        const nights = Math.floor((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerNight = Number((b.property as any).price);
        const subtotal = nights * pricePerNight;
        const fees = Math.round(subtotal * 0.1);
        const total = subtotal + fees;
        breakdown = { nights, pricePerNight, subtotal, fees, total };
      }
      return {
        ...b.toObject(),
        breakdown
      };
    });

    res.json(bookingsWithBreakdown);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Failed to fetch bookings' });
  }
});

// Get host's bookings (bookings for properties owned by the authenticated user)
router.get('/host-bookings', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    console.log(`Fetching host bookings for user: ${req.user._id}`);
    
    // First, get all properties owned by this user
    const userProperties = await Property.find({ owner: req.user._id });
    const propertyIds = userProperties.map(property => property._id);
    
    if (propertyIds.length === 0) {
      return res.json([]);
    }
    
    // Then, get all bookings for these properties
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate({
        path: 'property',
        select: 'title images location',
        populate: { path: 'owner', select: 'firstName lastName avatar _id' },
        model: 'Property'
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email phone',
        model: 'User'
      })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${bookings.length} host bookings.`);
    
    // Transform the data to match the frontend interface
    const transformedBookings = bookings.map(booking => {
      const populatedBooking = booking as unknown as PopulatedBooking;
      return {
        _id: populatedBooking._id,
        property: {
          _id: populatedBooking.property._id,
          title: populatedBooking.property.title,
          images: populatedBooking.property.images,
          location: populatedBooking.property.location,
          owner: populatedBooking.property.owner
        },
        userId: {
          _id: populatedBooking.user._id,
          firstName: populatedBooking.user.firstName,
          lastName: populatedBooking.user.lastName,
          email: populatedBooking.user.email,
          phone: populatedBooking.user.phoneNumber
        },
        checkIn: populatedBooking.checkIn,
        checkOut: populatedBooking.checkOut,
        guests: populatedBooking.guests,
        totalPrice: populatedBooking.totalPrice,
        status: populatedBooking.status,
        createdAt: populatedBooking.createdAt
      };
    });
    
    res.json(transformedBookings);
  } catch (error) {
    console.error('Error fetching host bookings:', error);
    res.status(500).json({ message: 'Failed to fetch host bookings' });
  }
});

// Update booking status (for hosts)
router.put('/:id/status', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const { status } = req.body;
    const bookingId = req.params.id;
    
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find the booking
    const booking = await Booking.findById(bookingId).populate('property');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    // Check if the authenticated user owns the property
    const populatedBooking = booking as unknown as PopulatedBooking;
    if (populatedBooking.property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }
    
    // Update the booking status
    booking.status = status;
    await booking.save();
    
    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Get booking details
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const booking = await Booking.findById(req.params.id)
      .populate('property')
      .populate('user', 'firstName lastName email');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    const bookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (bookingUserId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Failed to fetch booking details' });
  }
});

// Cancel booking
router.post('/:id/cancel', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to cancel this booking
    const cancelBookingUserId = booking.user._id ? booking.user._id.toString() : booking.user.toString();
    if (cancelBookingUserId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled (e.g., not too close to check-in date)
    const checkInDate = new Date(booking.checkIn);
    const now = new Date();
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilCheckIn < 2) {
      return res.status(400).json({ 
        message: 'Bookings can only be cancelled at least 2 days before check-in' 
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Restore property availability
    const property = await Property.findById(booking.property);
    if (property) {
      property.availability.push({
        startDate: booking.checkIn,
        endDate: booking.checkOut
      });
      await property.save();
    }

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

// Check if a user has a booking for a specific property
router.get('/check/:propertyId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    const { propertyId } = req.params;
    const booking = await Booking.findOne({
      property: propertyId,
      user: req.user._id,
      status: { $in: ['confirmed', 'pending'] },
    });
    res.json({ hasBooking: !!booking });
  } catch (error) {
    console.error('Error checking for booking:', error);
    res.status(500).json({ message: 'Error checking for booking' });
  }
});

export default router; 