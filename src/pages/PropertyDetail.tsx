import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StarRating from "@/components/StarRating";
import api from "@/lib/api";
import {
  MapPin,
  Star,
  Heart,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Send,
  Wifi,
  Tv,
  Car,
  Utensils,
  Snowflake,
  Dumbbell,
  Waves,
  Car as Parking,
  PawPrint,
  Flame,
  Accessibility,
  Baby,
  Shield,
  Clock,
  Users,
  Bed,
  Bath,
  Home,
  MessageSquare
} from "lucide-react";
import { Header } from "@/components/Header";
import { useFavorites } from "@/lib/favorites";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSettings } from '@/lib/SettingsProvider';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  numberOfUnits: number;
  rating: number;
  reviews: any[];
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  availability: {
    startDate: string;
    endDate: string;
  }[];
  type: string;
  phoneNumber?: string;
}

// Amenity icon mapping
const amenityIcons: { [key: string]: any } = {
  'WiFi': Wifi,
  'TV': Tv,
  'AC': Snowflake,
  'Kitchen': Utensils,
  'Pool': Waves,
  'Gym': Dumbbell,
  'Parking': Parking,
  'Pet Friendly': PawPrint,
  'Smoking Allowed': Flame,
  'Wheelchair Accessible': Accessibility,
  'Baby Friendly': Baby,
  'Security': Shield,
  '24/7 Support': Clock,
  'Car Rental': Car
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [property, setProperty] = useState<Property | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [hasBooking, setHasBooking] = useState(false);
  const [isCheckingBooking, setIsCheckingBooking] = useState(true);
  
  // Review state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState<any>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  let minCheckoutDate = minDate;
  if (checkIn) {
    const checkInDate = new Date(checkIn);
    checkInDate.setDate(checkInDate.getDate() + 1);
    minCheckoutDate = checkInDate.toISOString().split('T')[0];
  }

  const { convertCurrency } = useSettings();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await api.get(`/properties/${id}`);
        const propertyData = response.data;
        
        // Helper function to get full image URL
        const getImageUrl = (imagePath: string) => {
          if (!imagePath) return '/placeholder.svg';
          if (imagePath.startsWith('http')) return imagePath;
          return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
        };
        
        // Ensure image URLs are properly prefixed
        if (propertyData.images && propertyData.images.length > 0) {
          propertyData.images = propertyData.images.map((url: string) => getImageUrl(url));
        }
        
        // Ensure owner avatar is properly prefixed
        if (propertyData.owner?.avatar) {
          propertyData.owner.avatar = getImageUrl(propertyData.owner.avatar);
        }
        
        // Ensure reviews array exists and is properly structured
        if (!Array.isArray(propertyData.reviews)) {
          propertyData.reviews = [];
        }
        // Filter out any invalid reviews - be more lenient
        propertyData.reviews = propertyData.reviews.filter((review: any) => {
          if (!review) {
            // console.log('Filtering out null/undefined review');
            return false;
          }
          if (!review._id) {
            // console.log('Filtering out review without _id:', review);
            return false;
          }
          // Don't require user, rating, or comment to be present
          return true;
        });
        
        // console.log('Processed property data:', propertyData);
        // console.log('Reviews count:', propertyData.reviews.length);
        // console.log('Reviews array type:', Array.isArray(propertyData.reviews) ? 'Array' : typeof propertyData.reviews);
        // console.log('Reviews data:', JSON.stringify(propertyData.reviews, null, 2));
        setProperty(propertyData);
      } catch (error) {
        // console.error('Error fetching property:', error);
        toast.error("Failed to load property details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  useEffect(() => {
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      setCheckOut('');
    }
  }, [checkIn, checkOut]);

  useEffect(() => {
    const checkBookingStatus = async () => {
      if (user && id) {
        try {
          const { data } = await api.get(`/bookings/check/${id}`);
          setHasBooking(data.hasBooking);
          
          // Check if user has already reviewed this property (for all users, not just those who booked)
          try {
            // console.log('Checking for existing user review...');
            const reviewResponse = await api.get(`/reviews/user/${id}`);
            // console.log('User review response:', reviewResponse.data);
            setUserReview(reviewResponse.data.review);
          } catch (error: any) {
            // User hasn't reviewed yet, which is fine
            // console.log('No existing review found:', error.response?.status);
            setUserReview(null);
          }
        } catch (error) {
          // console.error("Failed to check booking status", error);
        } finally {
          setIsCheckingBooking(false);
        }
      } else {
        setIsCheckingBooking(false);
      }
    };

    checkBookingStatus();
  }, [user, id]);

  const handleBooking = async () => {
    if (!property) return;

    if (!checkIn || !checkOut) {
      toast.error("Please select both check-in and check-out dates.");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    const startOfTomorrow = new Date();
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);

    if (checkInDate < startOfTomorrow) {
      toast.error("Booking must be from the next day onwards.");
      return;
    }

    if (checkInDate >= checkOutDate) {
      toast.error("Check-out date must be after check-in date.");
      return;
    }
    
    if (parseInt(guests) > property.maxGuests) {
      toast.error(`This property can only accommodate up to ${property.maxGuests} guests.`);
      return;
    }

    setIsBooking(true);
    try {
      await api.post('/bookings', {
        propertyId: property._id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        guests: parseInt(guests)
      });
      toast.success("Booking Successful! Check your bookings page for details.");
      setTimeout(() => {
        navigate('/bookings');
      }, 1800);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not book the property for these dates.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!property) return;
    
    try {
      if (isFavorite(property._id)) {
        await removeFromFavorites(property._id);
      } else {
        await addToFavorites(property._id);
      }
    } catch (error) {
      // console.error('Error toggling favorite:', error);
      toast.error("Failed to update favorites.");
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !property) return;

    setIsSendingMessage(true);
    try {
      const response = await api.post('/messages/property', {
        propertyId: property._id,
        recipientId: property.owner._id,
        message: message.trim()
      });
      
      toast.success("Message sent successfully!");
      setMessage("");
      // Add a small delay before fetching messages to ensure backend has processed
      setTimeout(() => {
        fetchMessages();
      }, 500);
    } catch (error) {
      // console.error('Error sending message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const fetchMessages = async () => {
    if (!user || !property) return;
    
    try {
      const response = await api.get(`/messages/property/${property._id}/${user.id}`);
      setMessages(response.data);
    } catch (error) {
      // console.error('Error fetching messages:', error);
    }
  };

  // Fetch messages when chat is opened
  useEffect(() => {
    if (isChatOpen && user && property) {
      fetchMessages();
      
      // Set up periodic refresh every 5 seconds when chat is open
      const interval = setInterval(() => {
        fetchMessages();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isChatOpen, user, property]);

  const handleSubmitReview = async () => {
    if (!user || !property) return;
    
    if (!reviewComment.trim()) {
      toast.error("Please provide a review comment");
      return;
    }

    // console.log('Submitting review:', { propertyId: property._id, rating: reviewRating, comment: reviewComment });
    setIsSubmittingReview(true);
    try {
      const reviewData = {
        propertyId: property._id,
        rating: reviewRating,
        comment: reviewComment.trim()
      };

      // console.log('Sending review submission request...');
      const response = await api.post('/reviews', reviewData);
      // console.log('Review submission response:', response.data);
      
      toast.success("Review submitted successfully!");
      
      // Refetch the property to get updated data with populated reviews
      // console.log('Refetching property data...');
      const propertyResponse = await api.get(`/properties/${property._id}`);
      // console.log('Refetched property data:', propertyResponse.data);
      
      // Defensive: ensure reviews is always an array
      if (!Array.isArray(propertyResponse.data.reviews)) {
        propertyResponse.data.reviews = [];
      }
      setProperty(propertyResponse.data);
      
      // Set the user review to the newly created review
      setUserReview(response.data);
      setIsReviewOpen(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      // console.error('Error submitting review:', error);
      // console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleUpdateReview = async () => {
    if (!user || !property || !userReview) {
      // console.log('Update review check failed:', { user: !!user, property: !!property, userReview: !!userReview });
      toast.error("Unable to update review. Please refresh the page and try again.");
      return;
    }
    
    if (!reviewComment.trim()) {
      toast.error("Please provide a review comment");
      return;
    }

    // console.log('Updating review:', { reviewId: userReview._id, rating: reviewRating, comment: reviewComment });
    setIsSubmittingReview(true);
    try {
      const reviewData = {
        rating: reviewRating,
        comment: reviewComment.trim()
      };

      // console.log('Sending update request to:', `/reviews/${userReview._id}`);
      const response = await api.put(`/reviews/${userReview._id}`, reviewData);
      // console.log('Update response:', response.data);
      
      if (!response.data || !response.data._id) {
        throw new Error('Invalid response from server');
      }
      
      toast.success("Review updated successfully!");
      
      // Update the user review state first
      setUserReview(response.data);
      
      // Refetch the property to get updated data with populated reviews
      // console.log('Refetching property data...');
      const propertyResponse = await api.get(`/properties/${property._id}`);
      // console.log('Refetched property data:', propertyResponse.data);
      
      // Defensive: ensure reviews is always an array
      if (!Array.isArray(propertyResponse.data.reviews)) {
        propertyResponse.data.reviews = [];
      }
      setProperty(propertyResponse.data);
      
      setIsReviewOpen(false);
    } catch (error: any) {
      // console.error('Error updating review:', error);
      // console.error('Error response:', error.response?.data);
      
      // Don't show error toast if it's a network error, just log it
      if (error.response?.status) {
        toast.error(error.response?.data?.message || "Failed to update review");
      } else {
        // console.error('Network error during review update:', error);
        toast.error("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !property || !userReview) {
      // console.log('Delete review check failed:', { user: !!user, property: !!property, userReview: !!userReview });
      return;
    }

    if (!confirm("Are you sure you want to delete your review?")) return;

    // console.log('Deleting review:', { reviewId: userReview._id });
    setIsSubmittingReview(true);
    try {
      // console.log('Sending delete request to:', `/reviews/${userReview._id}`);
      await api.delete(`/reviews/${userReview._id}`);
      // console.log('Review deleted successfully');
      
      toast.success("Review deleted successfully!");
      
      // Refetch the property to get updated data with populated reviews
      // console.log('Refetching property data after deletion...');
      const propertyResponse = await api.get(`/properties/${property._id}`);
      // console.log('Refetched property data after deletion:', propertyResponse.data);
      setProperty(propertyResponse.data);
      
      setUserReview(null);
      setIsReviewOpen(false);
      setReviewComment("");
      setReviewRating(5);
    } catch (error: any) {
      // console.error('Error deleting review:', error);
      // console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || "Failed to delete review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="flex items-center justify-center h-48 sm:h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Property not found</h1>
            <Link to="/">
              <Button>Go back home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  try {
    const mainImage = property.images[selectedImage] || '/placeholder.svg';
    const thumbnailImages = property.images.slice(0, 5);
    const ownerAvatar = property.owner.avatar || '/placeholder.svg';
    const nights = checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)) : 0;
    const subtotal = nights * property.price;
    const cleaningFee = Math.round(property.price * 0.1);
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + cleaningFee + serviceFee;

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-3 sm:mb-4 md:mb-6 flex items-center space-x-2 text-sm sm:text-base"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Back</span>
          </Button>

          {/* Property Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4 sm:mb-6 md:mb-8">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                        {property.title}
                      </h1>
                      <Badge variant="outline" className="text-xs sm:text-base">
                        {property.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" className="flex items-center space-x-2 text-xs sm:text-sm h-8 sm:h-10">
                        <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Share</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleToggleFavorite}
                        className="flex items-center space-x-2 text-xs sm:text-sm h-8 sm:h-10"
                      >
                        <Heart
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite(property._id) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        <span>{isFavorite(property._id) ? "Saved" : "Save"}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-sm sm:text-base">
                      {property.location.city}, {property.location.state}, {property.location.country}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1">
                      <StarRating 
                        rating={property.rating} 
                        size="sm" 
                        readonly={true} 
                        showValue={true}
                      />
                      <span className="text-muted-foreground">({property.reviews.length} reviews)</span>
                    </div>
                    <span className="text-muted-foreground hidden sm:inline">•</span>
                    <span className="text-muted-foreground">
                      {property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">•</span>
                    <span className="text-muted-foreground">
                      {property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 md:mb-12">
            {/* Image Gallery */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-lg">
                <div className="relative">
                  <img
                    src={mainImage}
                    alt={property.title}
                    className="w-full h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] object-cover transition-transform duration-300"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 md:top-4 md:right-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleFavorite}
                      className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10"
                    >
                      <Heart
                        className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite(property._id) ? "fill-red-500 text-red-500" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
                <div className="flex p-2 bg-gray-100 overflow-x-auto">
                  {thumbnailImages.map((img, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-12 h-10 sm:w-16 sm:h-12 md:w-24 md:h-20 mx-1 rounded-md overflow-hidden border-2 ${
                        selectedImage === index ? 'border-teal-500' : 'border-transparent'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-16 sm:top-20 md:top-24">
                <CardContent className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                    <div>
                      <span className="text-lg sm:text-xl md:text-2xl font-bold">{convertCurrency(property.price)}</span>
                      <span className="text-gray-600 ml-1 text-sm sm:text-base">per night</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-sm sm:text-base">{property.rating}</span>
                      <span className="text-gray-500 text-xs sm:text-sm">({property.reviews.length})</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check-in</Label>
                        <Input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          min={minDate}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Check-out</Label>
                        <Input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          min={minCheckoutDate}
                          disabled={!checkIn}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Guests</Label>
                      <Input
                        type="number"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        min="1"
                        max={property?.maxGuests}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleBooking}
                    disabled={isBooking || !checkIn || !checkOut}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-2 sm:py-3 mt-3 sm:mt-4"
                  >
                    {isBooking ? "Booking..." : "Book Now"}
                  </Button>

                  <p className="text-center text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4">
                    You won't be charged yet
                  </p>

                  {nights > 0 && (
                    <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-2">
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>{convertCurrency(property.price)} × {nights} nights</span>
                        <span>{convertCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>Fees (cleaning + service)</span>
                        <span>{convertCurrency(Math.round(subtotal * 0.1))}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-sm sm:text-base">
                        <span>Total</span>
                        <span>{convertCurrency(subtotal + Math.round(subtotal * 0.1))}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Description */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About this place</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">What this place offers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {property.amenities && property.amenities.length > 0 ? (
                      property.amenities.map((amenity, index) => {
                        const IconComponent = amenityIcons[amenity] || Home;
                        return (
                          <div key={index} className="flex items-center space-x-3">
                            <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                            <span className="text-gray-700 text-sm sm:text-base">{amenity}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500 text-sm sm:text-base">No amenities listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Property details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center space-x-3">
                        <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</p>
                          <p className="text-xs sm:text-sm text-gray-500">Sleeping arrangements</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Bath className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">{property.bathrooms} bathroom{property.bathrooms !== 1 ? 's' : ''}</p>
                          <p className="text-xs sm:text-sm text-gray-500">Bathroom facilities</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">Up to {property.maxGuests} guests</p>
                          <p className="text-xs sm:text-sm text-gray-500">Maximum occupancy</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Home className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-sm sm:text-base">{property.numberOfUnits} unit{property.numberOfUnits !== 1 ? 's' : ''}</p>
                          <p className="text-xs sm:text-sm text-gray-500">Available units</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Host Info */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                        src={ownerAvatar}
                        alt={`${property.owner.firstName} ${property.owner.lastName}'s avatar`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold">
                        Hosted by {property.owner.firstName} {property.owner.lastName}
                      </h3>
                      <p className="text-gray-600 text-sm sm:text-base">Joined in 2024</p>
                      <div className="flex items-center space-x-2 mt-2 sm:mt-3">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium text-sm sm:text-base">{property.rating}</span>
                          <span className="text-gray-500 text-xs sm:text-sm">({property.reviews.length} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold">Reviews</h3>
                    <div className="flex items-center space-x-3">
                      <StarRating 
                        rating={property.rating} 
                        size="md" 
                        readonly={true} 
                        showValue={true}
                      />
                      <span className="text-gray-500 text-xs sm:text-sm">({property.reviews.length} reviews)</span>
                      {user && user.id !== property.owner._id && (
                        <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (userReview) {
                                  setReviewRating(userReview.rating);
                                  setReviewComment(userReview.comment);
                                } else {
                                  setReviewRating(5);
                                  setReviewComment("");
                                }
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              {userReview ? "Edit Review" : "Write Review"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle>
                                {userReview ? "Edit Your Review" : "Write a Review"}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Rating</Label>
                                <div className="mt-2">
                                  <StarRating
                                    rating={reviewRating}
                                    onRatingChange={setReviewRating}
                                    size="lg"
                                    showValue={true}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium">Comment</Label>
                                <Textarea
                                  placeholder="Share your experience..."
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  className="mt-1"
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                {userReview && (
                                  <Button 
                                    variant="destructive" 
                                    onClick={handleDeleteReview}
                                    disabled={isSubmittingReview}
                                    className="flex-1"
                                  >
                                    Delete
                                  </Button>
                                )}
                                <Button 
                                  onClick={userReview ? handleUpdateReview : handleSubmitReview}
                                  disabled={isSubmittingReview}
                                  className="flex-1"
                                >
                                  {isSubmittingReview ? "Saving..." : (userReview ? "Update" : "Submit")}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                      {!user && (
                        <div className="text-center">
                          <p className="text-gray-600 text-sm mb-2">Sign in to write a review</p>
                          <Link to="/login">
                            <Button variant="outline" size="sm">Sign In</Button>
                          </Link>
                        </div>
                      )}
                      {user && user.id === property.owner._id && (
                        <p className="text-gray-400 text-sm">You cannot review your own property</p>
                      )}
                    </div>
                  </div>
                  
                  {property.reviews && property.reviews.length > 0 ? (
                    <div className="space-y-4 sm:space-y-6">
                      {property.reviews.slice(0, 5).map((review: any, index: number) => {
                        // Defensive checks to prevent crashes
                        if (!review || !review._id) {
                          return null;
                        }
                        
                        const userName = review.user?.firstName && review.user?.lastName 
                          ? `${review.user.firstName} ${review.user.lastName}`
                          : review.user?.name || review.user?.firstName || 'Anonymous User';
                        
                        const userInitial = review.user?.firstName?.charAt(0) || 
                                          review.user?.name?.charAt(0) || 'U';
                        
                        const reviewDate = review.createdAt 
                          ? new Date(review.createdAt).toLocaleDateString()
                          : review.date 
                          ? new Date(review.date).toLocaleDateString()
                          : 'Unknown date';
                        
                        const reviewComment = review.comment || review.text || 'No comment provided';
                        const reviewRating = review.rating || 0;
                        
                        return (
                          <div key={review._id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                                    {userInitial}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm sm:text-base">
                                    {userName}
                                  </p>
                                  <StarRating 
                                    rating={reviewRating} 
                                    size="sm" 
                                    readonly={true}
                                  />
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm text-gray-500">
                                {reviewDate}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              {reviewComment}
                            </p>
                          </div>
                        );
                      }).filter(Boolean)} {/* Remove any null entries */}
                      
                      {property.reviews.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="outline" className="text-sm">
                            Show all {property.reviews.length} reviews
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 sm:py-8">
                      <MessageSquare className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <p className="text-gray-500 text-sm sm:text-base">No reviews yet</p>
                      <p className="text-gray-400 text-xs sm:text-sm">Be the first to review this property</p>
                      {user ? (
                        user.id !== property.owner._id ? (
                          <div className="mt-4">
                            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline"
                                  onClick={() => {
                                    setReviewRating(5);
                                    setReviewComment("");
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Write the First Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Write the First Review</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Rating</Label>
                                    <div className="mt-2">
                                      <StarRating
                                        rating={reviewRating}
                                        onRatingChange={setReviewRating}
                                        size="lg"
                                        showValue={true}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Comment</Label>
                                    <Textarea
                                      placeholder="Share your experience..."
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      className="mt-1"
                                      rows={4}
                                    />
                                  </div>
                                  
                                  <Button 
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview}
                                    className="w-full"
                                  >
                                    {isSubmittingReview ? "Saving..." : "Submit Review"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs sm:text-sm mt-2">You cannot review your own property</p>
                        )
                      ) : (
                        <div className="mt-4">
                          <p className="text-gray-600 text-sm mb-2">Sign in to write a review</p>
                          <Link to="/login">
                            <Button variant="outline">Sign In</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Contact Information</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {property.phoneNumber && (
                      <div className="flex items-center space-x-3">
                        <span className="text-xl sm:text-2xl">📞</span>
                        <div>
                          <p className="font-medium text-sm sm:text-base">Phone</p>
                          <p className="text-gray-600 text-sm sm:text-base">{property.phoneNumber}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Chat Option */}
                    {user && user.id !== property.owner._id && (
                      <div className="border-t pt-3 sm:pt-4">
                        {isCheckingBooking ? (
                          <Button className="w-full" disabled>Loading...</Button>
                        ) : hasBooking ? (
                          <div className="space-y-3">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger className="w-full">
                                  <Button className="w-full" disabled>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Message Host
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Use the chat in "My Bookings" to talk to the host.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {/* Review Button */}
                            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  onClick={() => {
                                    if (userReview) {
                                      setReviewRating(userReview.rating);
                                      setReviewComment(userReview.comment);
                                    } else {
                                      setReviewRating(5);
                                      setReviewComment("");
                                    }
                                  }}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  {userReview ? "Edit Review" : "Write a Review"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>
                                    {userReview ? "Edit Your Review" : "Write a Review"}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium">Rating</Label>
                                    <div className="mt-2">
                                      <StarRating
                                        rating={reviewRating}
                                        onRatingChange={setReviewRating}
                                        size="lg"
                                        showValue={true}
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium">Comment</Label>
                                    <Textarea
                                      placeholder="Share your experience..."
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      className="mt-1"
                                      rows={4}
                                    />
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    {userReview && (
                                      <Button 
                                        variant="destructive" 
                                        onClick={handleDeleteReview}
                                        disabled={isSubmittingReview}
                                        className="flex-1"
                                      >
                                        Delete
                                      </Button>
                                    )}
                                    <Button 
                                      onClick={userReview ? handleUpdateReview : handleSubmitReview}
                                      disabled={isSubmittingReview}
                                      className="flex-1"
                                    >
                                      {isSubmittingReview ? "Saving..." : (userReview ? "Update" : "Submit")}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
                            <DialogTrigger asChild>
                              <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message Host
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Message {property?.owner?.firstName}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                {/* Message History */}
                                <div className="h-64 overflow-y-auto p-4 border rounded-md bg-muted/50">
                                  {messages.map((msg) => (
                                    <div key={msg._id} className={`flex ${msg.sender._id === user.id ? 'justify-end' : 'justify-start'} mb-2`}>
                                      <div className={`rounded-lg p-3 ${msg.sender._id === user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                        <p className="text-sm">{msg.message}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {/* Message Input */}
                                <div className="flex space-x-2">
                                  <Textarea
                                    placeholder="Type your message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button onClick={handleSendMessage} disabled={isSendingMessage}>
                                    {isSendingMessage ? 'Sending...' : <Send className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    )}
                    
                    {!user && (
                      <div className="border-t pt-3 sm:pt-4">
                        <p className="text-gray-600 mb-3 text-sm sm:text-base">Sign in to message the host</p>
                        <Link to="/login">
                          <Button className="w-full">Sign In</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    // console.error('Error rendering PropertyDetail:', error);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">An error occurred</h1>
            <p className="text-gray-600 text-sm sm:text-base">Please try again later.</p>
            <Link to="/">
              <Button>Go back home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
};

export default PropertyDetail;