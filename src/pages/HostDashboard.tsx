import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Home,
  Calendar,
  Users,
  Star,
  Edit,
  Trash2,
  Eye,
  Camera,
  MapPin,
  Bed,
  Bath,
  Users as UsersIcon,
  User,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  MessageSquare,
  HelpCircle,
  Lock
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Header } from "@/components/Header";
import ChatDialog from "@/components/ChatDialog";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  };
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const HostDashboard = () => {
  console.log('HostDashboard component rendering');
  const { user, loading: authLoading } = useAuth();
  console.log('Auth state:', { user, authLoading });
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    location: "",
    price: "",
    description: "",
    beds: "",
    baths: "",
    guests: ""
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const { convertCurrency } = useSettings();

  // Redirect if not authenticated
  useEffect(() => {
    console.log('Auth effect running:', { authLoading, user });
    if (!authLoading && !user) {
      console.log('Redirecting to login');
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) {
        console.log('No user, skipping property fetch');
        return; // Don't fetch if no user
      }
      
      console.log('Fetching properties for user:', user.id);
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/users/my-properties');
        const properties = res.data;
        console.log('Properties fetched:', properties);
        
        // Helper function to get full image URL
        const getImageUrl = (imagePath: string) => {
          if (!imagePath) return '/placeholder.svg';
          if (imagePath.startsWith('http')) return imagePath;
          if (imagePath.startsWith('/')) {
            // If it's already a full path, return it
            if (imagePath.startsWith('/properties/')) {
              return `http://localhost:5000${imagePath}`;
            }
            return imagePath;
          }
          // For relative paths, prepend the backend URL
          return `http://localhost:5000${imagePath}`;
        };
        
        // Ensure image URLs are properly prefixed
        const processedProperties = properties.map((property: any) => ({
          ...property,
          images: property.images?.map((url: string) => getImageUrl(url)) || []
        }));
        
        console.log('Processed properties:', processedProperties);
        setListings(processedProperties);
      } catch (err: any) {
        console.error('Error fetching properties:', err);
        if (err.response?.status === 401) {
          setError('Please log in to view your properties.');
        } else if (err.response?.status === 404) {
          setError('No properties found. Add your first property to get started!');
        } else if (!err.response) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError(err.response?.data?.message || 'Failed to load properties. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchProperties();
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        console.log('No user, skipping booking fetch');
        return;
      }
      
      console.log('Fetching bookings for user:', user.id);
      setBookingsLoading(true);
      try {
        const res = await api.get('/bookings/host-bookings');
        console.log('Bookings fetched:', res.data);
        setBookings(res.data || []);
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        // Don't show error toast for bookings, just log it
      } finally {
        setBookingsLoading(false);
      }
    };
    
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewListing({
      ...newListing,
      [e.target.name]: e.target.value
    });
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await api.delete(`/properties/${propertyId}`);
        setListings(prev => prev.filter(property => property._id !== propertyId));
        toast.success('Property deleted successfully!');
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete property.');
      }
    }
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleEditProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}/edit`);
  };

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId ? { ...booking, status: newStatus as any } : booking
      ));
      toast.success(`Booking ${newStatus} successfully!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update booking status.');
    }
  };

  const handleOpenChat = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsChatOpen(true);
  };

  // Optionally, implement real add property logic here
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info("Please use the Add Property page to add real properties.");
    setShowAddForm(false);
    setNewListing({
      title: "",
      location: "",
      price: "",
      description: "",
      beds: "",
      baths: "",
      guests: ""
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
  };

  const fetchAllMessages = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/messages/host/${user.id}`);
      setAllMessages(response.data);
    } catch (error) {
      console.error('Error fetching all messages:', error);
    }
  };

  // Fetch all messages when messages section is opened
  useEffect(() => {
    if (isMessagesOpen && user) {
      fetchAllMessages();
    }
  }, [isMessagesOpen, user]);

  console.log('About to render HostDashboard with state:', {
    authLoading,
    user: !!user,
    loading,
    error,
    listingsCount: listings.length,
    bookingsCount: bookings.length
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Host Dashboard</h1>
        
        {/* Show loading while auth is loading */}
        {authLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        )}

        {/* Show content only when auth is not loading */}
        {!authLoading && (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-600 mt-2">Manage your properties and bookings</p>
              </div>
              <div className="flex gap-2">
                <Link to="/add-property">
                  <Button className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Property
                  </Button>
                </Link>
              </div>
            </div>

            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your properties...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!loading && !error && listings.length === 0 && (
              <div className="text-center py-12">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                  <Home className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first property to begin hosting!</p>
                  <Button asChild>
                    <Link to="/add-property">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Property
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="properties" className="space-y-6">
              <TabsList>
                <TabsTrigger value="properties">My Properties</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="space-y-6">
                {/* Add Property Form */}
                {showAddForm && (
                  <Card className="animate-fade-in">
                    <CardHeader>
                      <CardTitle>Add New Property</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="title">Property Title</Label>
                            <Input
                              id="title"
                              name="title"
                              value={newListing.title}
                              onChange={handleInputChange}
                              placeholder="Enter property title"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="location">Location</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="location"
                                name="location"
                                value={newListing.location}
                                onChange={handleInputChange}
                                placeholder="City, State"
                                className="pl-10"
                                required
                              />
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="price">Price per night</Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              value={newListing.price}
                              onChange={handleInputChange}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="beds">Bedrooms</Label>
                            <Input
                              id="beds"
                              name="beds"
                              type="number"
                              value={newListing.beds}
                              onChange={handleInputChange}
                              placeholder="0"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="baths">Bathrooms</Label>
                            <Input
                              id="baths"
                              name="baths"
                              type="number"
                              value={newListing.baths}
                              onChange={handleInputChange}
                              placeholder="0"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={newListing.description}
                            onChange={handleInputChange}
                            placeholder="Describe your property..."
                            rows={4}
                            required
                          />
                        </div>
                        <div className="flex items-center space-x-4">
                          <Button type="submit" className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Property
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}
                {/* Properties List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((property) => (
                    <Card key={property._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative">
                        <img
                          src={property.images && property.images.length > 0 ? property.images[0] : '/placeholder.svg'}
                          alt={property.title}
                          className="w-full h-24 md:h-48 object-cover"
                        />
                        <Badge className={`absolute top-3 right-3 ${getStatusColor('active')}`}>active</Badge>
                      </div>
                      <CardContent className="p-2 md:p-4">
                        <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2">{property.title}</h3>
                        <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">{property.description}</p>
                        <div className="flex items-center text-gray-600 mb-1 md:mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.location?.city || property.address?.city || 'Unknown'}, {property.location?.state || property.address?.state || 'Unknown'}
                          </span>
                        </div>
                        
                        {/* Property Details */}
                        <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-3 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span>{property.bedrooms || 0} beds</span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span>{property.bathrooms || 0} baths</span>
                          </div>
                          <div className="flex items-center">
                            <UsersIcon className="h-4 w-4 mr-1" />
                            <span>Up to {property.maxGuests || 0} guests</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-2 md:mb-4">
                          <span className="font-bold text-base md:text-lg">{convertCurrency(property.price || property.pricePerNight || 0)}/night</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 md:h-4 md:w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs md:text-sm">{property.rating || 0}</span>
                          </div>
                        </div>
                        
                        <div className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4">
                          <div>Type: {property.type || 'Unknown'}</div>
                          <div>Units Available: {property.numberOfUnits || 1}</div>
                          {property.amenities && property.amenities.length > 0 && (
                            <div className="mt-2">
                              <span className="font-medium">Amenities:</span> {property.amenities.slice(0, 3).join(', ')}
                              {property.amenities.length > 3 && '...'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewProperty(property._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditProperty(property._id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProperty(property._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="bookings" className="space-y-6">
                {bookingsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                      <p className="text-gray-600">When guests book your properties, they'll appear here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking._id} className="overflow-hidden">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Property Info */}
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={booking.property.images && booking.property.images.length > 0 
                                    ? booking.property.images[0] 
                                    : '/placeholder.svg'}
                                  alt={booking.property.title}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{booking.property.title}</h3>
                                <p className="text-gray-600 text-sm">
                                  {booking.property.location.city}, {booking.property.location.state}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>{booking.guests} guest{booking.guests !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Guest Info */}
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {booking.userId.firstName} {booking.userId.lastName}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">{booking.userId.email}</span>
                              </div>
                              {booking.userId.phone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-600">{booking.userId.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            {/* Status and Actions */}
                            <div className="flex flex-col items-end space-y-3 w-full">
                              <Badge className={getBookingStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                              
                              {booking.status === 'confirmed' ? (
                                <>
                                  {/* Mobile: side by side, Desktop: stacked */}
                                  <div className="flex flex-row gap-x-2 w-full sm:hidden">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenChat(booking)}
                                      className="text-teal-600 hover:text-teal-700"
                                    >
                                      <MessageCircle className="h-4 w-4 mr-1" />
                                      Chat
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBookingStatusChange(booking._id, 'completed')}
                                    >
                                      Mark Complete
                                    </Button>
                                  </div>
                                  <div className="hidden sm:flex flex-col items-end space-y-2 w-full">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenChat(booking)}
                                      className="text-teal-600 hover:text-teal-700"
                                    >
                                      <MessageCircle className="h-4 w-4 mr-1" />
                                      Chat
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleBookingStatusChange(booking._id, 'completed')}
                                    >
                                      Mark Complete
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenChat(booking)}
                                  className="text-teal-600 hover:text-teal-700"
                                >
                                  <MessageCircle className="h-4 w-4 mr-1" />
                                  Chat
                                </Button>
                              )}
                              {/* Pending status actions remain unchanged */}
                              {booking.status === 'pending' && (
                                <div className="flex space-x-2 mt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleBookingStatusChange(booking._id, 'confirmed')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Confirm
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBookingStatusChange(booking._id, 'cancelled')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Decline
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Analytics dashboard coming soon!</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Chat Dialog for specific booking */}
            <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    Chat with {selectedBooking?.userId?.firstName} {selectedBooking?.userId?.lastName}
                  </DialogTitle>
                </DialogHeader>
                {selectedBooking && (
                  <ChatDialog 
                    booking={selectedBooking}
                    isOpen={isChatOpen}
                    onOpenChange={setIsChatOpen}
                  />
                )}
              </DialogContent>
            </Dialog>

            {/* All Messages Dialog */}
            <Dialog open={isMessagesOpen} onOpenChange={setIsMessagesOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>All Messages</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {allMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No messages received yet.
                    </p>
                  ) : (
                    allMessages.map((msg) => (
                      <div key={msg._id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={msg.sender?.avatar} />
                              <AvatarFallback>
                                {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {msg.sender?.firstName} {msg.sender?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {msg.property.title || 'Property inquiry'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                        {msg.bookingId && typeof msg.bookingId === 'object' && (
                          <p className="text-xs text-muted-foreground">
                            Booking: {new Date(msg.bookingId.checkIn).toLocaleDateString()} - {new Date(msg.bookingId.checkOut).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
