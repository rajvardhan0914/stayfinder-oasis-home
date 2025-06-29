import express, { Request } from 'express';
import { Message } from '../models/Message';
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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const router = express.Router();

// Get messages for a specific booking
router.get('/booking/:bookingId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { bookingId } = req.params;

    // Verify the booking exists and user is part of it
    const booking = await Booking.findById(bookingId)
      .populate('property', 'owner')
      .populate('user', 'firstName lastName') as PopulatedBooking | null;

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the host or the guest
    const isHost = booking.property.owner.toString() === req.user._id.toString();
    const isGuest = booking.user._id.toString() === req.user._id.toString();

    if (!isHost && !isGuest) {
      return res.status(403).json({ message: 'Not authorized to view messages for this booking' });
    }

    // Get all messages for this booking (both sent and received by the user)
    const messages = await Message.find({ 
      bookingId: bookingId
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: 1 });

    console.log(`Found ${messages.length} messages for booking ${bookingId}`);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching booking messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', auth, async (req: AuthRequest, res) => {
  console.log('--- NEW MESSAGE REQUEST ---');
  console.log('Request Body Received:', req.body);
  console.log('Authenticated User ID:', req.user?._id);

  try {
    if (!req.user) {
      console.log('Authentication check failed: No user.');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { bookingId, recipientId, message, propertyId } = req.body;

    console.log('Deconstructed Body:', { bookingId, recipientId, message, propertyId });

    if (!bookingId || !recipientId || !message || !propertyId) {
      console.log('Validation failed: Missing required fields.');
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify the booking exists and user is part of it
    console.log(`Verifying booking with ID: ${bookingId}`);
    const booking = await Booking.findById(bookingId)
      .populate('property', 'owner')
      .populate('user', 'firstName lastName') as PopulatedBooking | null;

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the host or the guest
    const isHost = booking.property.owner.toString() === req.user._id.toString();
    const isGuest = booking.user._id.toString() === req.user._id.toString();

    if (!isHost && !isGuest) {
      return res.status(403).json({ message: 'Not authorized to send messages for this booking' });
    }

    // Verify recipient is the other party in the booking
    const expectedRecipient = isHost ? booking.user._id : booking.property.owner;
    if (expectedRecipient.toString() !== recipientId) {
      return res.status(400).json({ message: 'Invalid recipient' });
    }

    // Create the message
    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      message: message.trim(),
      propertyId,
      bookingId
    });

    console.log('Creating message with data:', {
      sender: req.user._id,
      recipient: recipientId,
      message: message.trim(),
      propertyId,
      bookingId
    });

    await newMessage.save();
    console.log('Message saved with ID:', newMessage._id);

    try {
      // Populate sender and recipient info for response
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'firstName lastName avatar')
        .populate('recipient', 'firstName lastName avatar')
        .exec();

      if (!populatedMessage) {
        // This is unlikely but a good safeguard
        console.log('Could not find message after saving, sending minimal response.');
        return res.status(201).json(newMessage);
      }

      console.log('Message populated and ready to send:', {
        id: populatedMessage._id,
        sender: populatedMessage.sender,
        recipient: populatedMessage.recipient,
        message: populatedMessage.message
      });

      res.status(201).json(populatedMessage);

    } catch (populationError) {
      console.error('Error populating message for response, but message was saved:', populationError);
      // Still send a success response, but with the unpopulated message
      // The frontend will just fetch the new messages anyway
      res.status(201).json(newMessage);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Mark messages as read
router.put('/read/:bookingId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { bookingId } = req.params;

    // Mark all unread messages sent to this user for this booking as read
    await Message.updateMany(
      {
        bookingId,
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Get unread message count for user
router.get('/unread-count', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const count = await Message.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Send a property-based message (without booking)
router.post('/property', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { propertyId, recipientId, message } = req.body;

    console.log('Property message request:', { propertyId, recipientId, message, sender: req.user._id });

    if (!propertyId || !recipientId || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Verify the property exists
    const property = await Property.findById(propertyId).populate('owner', 'firstName lastName');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is messaging the property owner
    if (property.owner._id.toString() !== recipientId) {
      return res.status(400).json({ message: 'Invalid recipient' });
    }

    // Check if user is not the property owner (can't message themselves)
    if (req.user._id.toString() === recipientId) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    // Create a conversation ID for property-based messaging
    const conversationId = `property-${propertyId}-${req.user._id}`;

    console.log('Creating message with conversation ID:', conversationId);

    // Create the message
    const newMessage = new Message({
      sender: req.user._id,
      recipient: recipientId,
      message: message.trim(),
      propertyId,
      bookingId: conversationId // Use conversation ID as bookingId
    });

    await newMessage.save();

    console.log('Message saved successfully:', newMessage._id);

    // Populate sender and recipient info for response
    await newMessage.populate('sender', 'firstName lastName avatar');
    await newMessage.populate('recipient', 'firstName lastName avatar');

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending property message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get property-based messages
router.get('/property/:propertyId/:userId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { propertyId, userId } = req.params;

    console.log('Fetching property messages:', { propertyId, userId, currentUser: req.user._id });

    // Verify the property exists
    const property = await Property.findById(propertyId).populate('owner', 'firstName lastName');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is part of this conversation (either sender or recipient)
    const isSender = req.user._id.toString() === userId;
    const isRecipient = property.owner._id.toString() === req.user._id.toString();

    console.log('User authorization check:', { isSender, isRecipient, propertyOwner: property.owner._id });

    if (!isSender && !isRecipient) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Get messages for this property conversation
    // We need to check both possible conversation IDs since the sender creates the ID
    const conversationId1 = `property-${propertyId}-${userId}`;
    const conversationId2 = `property-${propertyId}-${req.user._id}`;
    
    console.log('Searching for messages with conversation IDs:', { conversationId1, conversationId2 });
    
    const messages = await Message.find({ 
      $or: [
        { bookingId: conversationId1, propertyId: propertyId },
        { bookingId: conversationId2, propertyId: propertyId }
      ]
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: 1 });

    console.log('Found messages:', messages.length);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching property messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Get all messages for a host (both booking-based and property-based)
router.get('/host/:hostId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { hostId } = req.params;

    // Check if the authenticated user is the host
    if (req.user._id.toString() !== hostId) {
      return res.status(403).json({ message: 'Not authorized to view these messages' });
    }

    // Get all messages where the host is the recipient
    const messages = await Message.find({ 
      recipient: hostId
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .populate('propertyId', 'title images')
      .sort({ createdAt: -1 });

    // Process messages to handle both booking-based and property-based messages
    const processedMessages = messages.map(msg => {
      const messageObj = msg.toObject();
      
      // If bookingId is a string (property-based), don't try to populate it
      if (typeof messageObj.bookingId === 'string') {
        messageObj.bookingId = null; // Set to null for property-based messages
      } else {
        // For booking-based messages, populate the booking details
        // This will be handled by the populate above
      }
      
      return messageObj;
    });

    res.json(processedMessages);
  } catch (error) {
    console.error('Error fetching host messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Debug endpoint to check all messages for a booking
router.get('/debug/booking/:bookingId', auth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { bookingId } = req.params;

    // Get all messages for this booking without any filtering
    const allMessages = await Message.find({ bookingId: bookingId })
      .populate('sender', 'firstName lastName avatar')
      .populate('recipient', 'firstName lastName avatar')
      .sort({ createdAt: 1 });

    console.log(`Debug: Found ${allMessages.length} total messages for booking ${bookingId}`);
    console.log('Debug: Messages:', allMessages.map(m => ({
      id: m._id,
      sender: m.sender,
      recipient: m.recipient,
      message: m.message,
      createdAt: m.createdAt
    })));

    res.json({
      bookingId,
      totalMessages: allMessages.length,
      messages: allMessages
    });
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    res.status(500).json({ message: 'Failed to fetch debug info' });
  }
});

export default router; 