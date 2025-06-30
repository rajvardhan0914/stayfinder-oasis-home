import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import api from "@/lib/api";
import { toast } from "sonner";
import ChatDialog from "@/components/ChatDialog";
import {
  Calendar,
  Users,
  MapPin,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { useSettings } from '@/lib/SettingsProvider';

interface Booking {
  _id: string;
  property: {
    _id: string;
    title: string;
    images: string[];
    location: {
      city: string;
      state: string;
    };
    owner?: {
      _id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
    }
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending';
  createdAt: string;
  breakdown?: {
    pricePerNight: number;
    nights: number;
    subtotal: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
    fees: number;
  };
}

interface PopulatedProperty {
  _id: string;
  title: string;
  location: {
    city: string;
    state: string;
  };
  images: string[];
}

interface PopulatedBooking extends Booking {
  property: PopulatedProperty;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

const Bookings = () => {
  const [bookings, setBookings] = useState<PopulatedBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { convertCurrency } = useSettings();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/bookings/my-bookings');
        const validBookings = response.data.filter((booking: any) => booking.property);
        setBookings(validBookings);
      } catch (error: any) {
        toast.error("Failed to load bookings. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleOpenChat = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsChatOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4 sm:mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Your Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Bookings Yet</h2>
            <p className="text-muted-foreground mb-3 sm:mb-4">You haven't made any bookings yet.</p>
            <Link to="/">
              <Button>Browse Properties</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            {bookings.map((booking) => (
              <Card key={booking._id} className="w-[98%] max-w-none bg-card rounded-2xl shadow-xl border border-gray-200 mb-10 flex justify-center mx-auto">
                <CardContent className="p-4 w-full  mx-auto">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full md:gap-20">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:w-3/4 min-h-24 order-1 md:order-1">
                      <div className="w-full md:w-40 h-24 md:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 flex items-center justify-center mx-auto md:mx-0">
                        <img
                          src={getImageUrl(booking.property.images[0])}
                          alt={booking.property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between h-full w-full md:pl-2">
                        <div className="flex justify-between items-start mb-1 sm:mb-2">
                          <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-0.5">
                              {booking.property.title}
                            </h2>
                            <div className="flex items-center text-foreground text-sm">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>
                                {booking.property.location.city}, {booking.property.location.state}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-1 sm:mb-2">
                          <div className="flex flex-col items-start text-foreground">
                            <div className="flex items-center mb-0.5">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="text-xs sm:text-sm text-foreground">Check-in</span>
                            </div>
                            <div className="font-medium text-foreground text-sm sm:text-base">{formatDate(booking.checkIn)}</div>
                          </div>
                          <div className="flex flex-col items-start text-foreground">
                            <div className="flex items-center mb-0.5">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span className="text-xs sm:text-sm text-foreground">Check-out</span>
                            </div>
                            <div className="font-medium text-foreground text-sm sm:text-base">{formatDate(booking.checkOut)}</div>
                          </div>
                          <div className="flex flex-col items-start text-foreground">
                            <div className="flex items-center mb-0.5">
                              <Users className="h-4 w-4 mr-1" />
                              <span className="text-xs sm:text-sm text-foreground">Guests</span>
                            </div>
                            <div className="font-medium text-foreground text-sm sm:text-base">{booking.guests}</div>
                          </div>
                        </div>
                        <div className="text-base sm:text-lg font-semibold text-foreground mt-1">
                          {booking.breakdown ? (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs sm:text-sm text-foreground">
                                <span>{booking.breakdown.pricePerNight} × {booking.breakdown.nights} nights</span>
                                <span>{convertCurrency(booking.breakdown.subtotal)}</span>
                              </div>
                              <div className="flex justify-between text-xs sm:text-sm text-foreground">
                                <span>Fees (cleaning + service)</span>
                                <span>{convertCurrency(booking.breakdown.fees)}</span>
                              </div>
                              <div className="flex justify-between font-bold text-sm sm:text-base border-t pt-1 mt-1 text-foreground">
                                <span>Total</span>
                                <span>{convertCurrency(booking.breakdown.total)}</span>
                              </div>
                            </div>
                          ) : (
                            <>Total: {convertCurrency(booking.totalPrice)}</>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col justify-center items-end space-y-3 md:ml-6 order-2 md:order-2 w-full md:w-auto">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'} className="mb-1">
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenChat(booking)}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat with Host
                      </Button>
                      <Link to={`/properties/${booking.property._id}`} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600">
                          View Property
                        </Button>
                      </Link>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0 md:hidden order-2">
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'destructive'} className="mb-1 w-fit self-start">
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenChat(booking)}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat with Host
                      </Button>
                      <Link to={`/properties/${booking.property._id}`} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600">
                          View Property
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {selectedBooking && (
        <ChatDialog
          booking={selectedBooking}
          isOpen={isChatOpen}
          onOpenChange={setIsChatOpen}
        />
      )}
    </div>
  );
};

export default Bookings; 