import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Home, 
  Calendar, 
  Star, 
  Shield, 
  LogOut,
  BarChart3,
  Settings,
  Activity,
  Search,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Clock,
  Menu,
  Moon,
  Sun
} from "lucide-react";
import { toast } from "sonner";
import adminApi from "@/lib/adminApi";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  phoneNumber?: string;
}

interface Property {
  _id: string;
  title: string;
  address: string;
  price: number;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  images: string[];
}

interface Booking {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    title: string;
    address: string;
  };
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface Review {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  property: {
    title: string;
    address: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Stats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalReviews: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
};

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsItem, setDetailsItem] = useState<any>(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleAdminLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    toast.success("Admin logged out successfully");
    navigate("/admin-login");
  };

  const adminEmail = localStorage.getItem("adminEmail");

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "properties", label: "Properties", icon: Home },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case "overview":
            const statsData = await adminApi.getStats();
            setStats(statsData.stats);
            // Also fetch recent data for overview
            if (statsData.recent) {
              setUsers(statsData.recent.users || []);
              setProperties(statsData.recent.properties || []);
              setBookings(statsData.recent.bookings || []);
            }
            break;
          case "users":
            const usersData = await adminApi.getUsers();
            setUsers(usersData);
            break;
          case "properties":
            const propertiesData = await adminApi.getProperties();
            setProperties(propertiesData);
            break;
          case "bookings":
            const bookingsData = await adminApi.getBookings();
            setBookings(bookingsData);
            break;
          case "reviews":
            const reviewsData = await adminApi.getReviews();
            setReviews(reviewsData);
            break;
        }
      } catch (error) {
        toast.error(`Failed to fetch ${activeTab} data`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Delete functions
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminApi.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
        toast.success("User deleted successfully");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await adminApi.deleteProperty(propertyId);
        setProperties(properties.filter(property => property._id !== propertyId));
        toast.success("Property deleted successfully");
      } catch (error) {
        toast.error("Failed to delete property");
      }
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        await adminApi.deleteBooking(bookingId);
        setBookings(bookings.filter(booking => booking._id !== bookingId));
        toast.success("Booking deleted successfully");
      } catch (error) {
        toast.error("Failed to delete booking");
      }
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await adminApi.deleteReview(reviewId);
        setReviews(reviews.filter(review => review._id !== reviewId));
        toast.success("Review deleted successfully");
      } catch (error) {
        toast.error("Failed to delete review");
      }
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProperties = properties.filter(property =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBookings = bookings.filter(booking =>
    booking.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.property?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReviews = reviews.filter(review =>
    review.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.property?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalUsers')}</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('registeredUsers')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalProperties')}</CardTitle>
                  <Home className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('listedProperties')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalBookings')}</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('allBookings')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('totalReviews')}</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalReviews || 0}</div>
                  <p className="text-xs text-muted-foreground">{t('userReviews')}</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('systemHealth')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('database')}</span>
                      <Badge variant="default" className="text-xs">{t('connected')}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('totalRecords')}</span>
                      <span className="text-sm font-medium">
                        {((stats?.totalUsers || 0) + (stats?.totalProperties || 0) + (stats?.totalBookings || 0) + (stats?.totalReviews || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('recentGrowth')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('newUsers')} (24h)</span>
                      <span className="text-sm font-medium text-green-600">
                        {users.filter(user => {
                          const userDate = new Date(user.createdAt);
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return userDate > yesterday;
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('newProperties')} (24h)</span>
                      <span className="text-sm font-medium text-green-600">
                        {properties.filter(property => {
                          const propertyDate = new Date(property.createdAt);
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return propertyDate > yesterday;
                        }).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{t('bookingActivity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('recentBookings')}</span>
                      <span className="text-sm font-medium text-blue-600">
                        {bookings.filter(booking => {
                          const bookingDate = new Date(booking.createdAt);
                          const yesterday = new Date();
                          yesterday.setDate(yesterday.getDate() - 1);
                          return bookingDate > yesterday;
                        }).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('activeStatus')}</span>
                      <Badge variant="outline" className="text-xs">
                        {bookings.filter(booking => booking.status === 'confirmed').length} {t('confirmed')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>{t('recentActivity')}</CardTitle>
                <CardDescription>{t('latestActionsAndUpdates')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Users */}
                  {users.slice(0, 3).map((user) => (
                    <div key={`user-${user._id}`} className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t('newUserRegistered')}: {user.firstName} {user.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Recent Properties */}
                  {properties.slice(0, 3).map((property) => (
                    <div key={`property-${property._id}`} className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Home className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t('newPropertyListed')}: {property.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(property.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Recent Bookings */}
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={`booking-${booking._id}`} className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {t('newBooking')}: {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : t('unknownUser')} → {booking.property ? booking.property.title : t('unknownProperty')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show message if no recent activity */}
                  {users.length === 0 && properties.length === 0 && bookings.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">{t('noRecentActivity')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "users":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('userManagement')}</CardTitle>
                <CardDescription>{t('manageAllRegisteredUsers')}</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchUsers')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.isVerified && (
                              <Badge variant="outline">{t('verified')}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setDetailsItem(user); setDetailsOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "properties":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('propertyManagement')}</CardTitle>
                <CardDescription>{t('manageAllPropertyListings')}</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchProperties')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProperties.map((property) => (
                    <div key={property._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">{property.title}</h3>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {property.address}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ₹{property.price}/{t('night')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('owner')}: {property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : t('deletedOwner')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setDetailsItem(property); setDetailsOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteProperty(property._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "bookings":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('bookingManagement')}</CardTitle>
                <CardDescription>{t('manageAllBookingsAndReservations')}</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchBookings')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBookings.map((booking) => (
                    <div key={booking._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">
                            {booking.user ? `${booking.user.firstName} ${booking.user.lastName}` : t('deletedUser')}
                          </h3>
                          <p className="text-sm text-muted-foreground">{booking.property ? booking.property.title : t('deletedProperty')}</p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '?'} - {booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '?'}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ₹{booking.totalPrice}
                          </p>
                          <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setDetailsItem(booking); setDetailsOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteBooking(booking._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "reviews":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('reviewManagement')}</CardTitle>
                <CardDescription>{t('manageAllUserReviewsAndRatings')}</CardDescription>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('searchReviews')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReviews.map((review) => (
                    <div key={review._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-medium">
                            {review.user ? `${review.user.firstName} ${review.user.lastName}` : t('deletedUser')}
                          </h3>
                          <p className="text-sm text-muted-foreground">{review.property ? review.property.title : t('deletedProperty')}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">({review.rating}/5)</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => { setDetailsItem(review); setDetailsOpen(true); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteReview(review._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case "settings":
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure admin dashboard settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Database Status</h4>
                        <p className="text-sm text-muted-foreground">Connected to MongoDB</p>
                        <p className="text-sm text-muted-foreground">Total Records: {stats?.totalUsers + stats?.totalProperties + stats?.totalBookings + stats?.totalReviews}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Admin Account</h4>
                        <p className="text-sm text-muted-foreground">Email: {adminEmail}</p>
                        <p className="text-sm text-muted-foreground">Role: Administrator</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Users className="h-6 w-6 mb-2" />
                        <span>Manage Users</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Home className="h-6 w-6 mb-2" />
                        <span>Manage Properties</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Calendar className="h-6 w-6 mb-2" />
                        <span>View Bookings</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                        <Star className="h-6 w-6 mb-2" />
                        <span>Review Management</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">System Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats?.totalUsers || 0}</div>
                        <p className="text-sm text-muted-foreground">Users</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats?.totalProperties || 0}</div>
                        <p className="text-sm text-muted-foreground">Properties</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats?.totalBookings || 0}</div>
                        <p className="text-sm text-muted-foreground">Bookings</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold text-primary">{stats?.totalReviews || 0}</div>
                        <p className="text-sm text-muted-foreground">Reviews</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return <div>Select a tab to view content</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Logged in as {adminEmail}</p>
            </div>
          </div>
          {/* Theme Toggle Switch - Desktop Only */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <Sun className={isDark ? 'text-muted-foreground' : 'text-yellow-400'} size={18} />
            <Switch checked={isDark} onCheckedChange={setIsDark} />
            <Moon className={isDark ? 'text-blue-400' : 'text-muted-foreground'} size={18} />
          </div>
          {/* Hamburger for mobile */}
          <div className="lg:hidden">
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4 space-y-4">
                {/* Theme Toggle Switch - Mobile Only, inside Drawer */}
                <div className="w-full flex justify-end items-center mb-2 sm:hidden">
                  <div className="flex items-center gap-2">
                    <Sun className={isDark ? 'text-muted-foreground' : 'text-yellow-400'} size={18} />
                    <Switch checked={isDark} onCheckedChange={setIsDark} />
                    <Moon className={isDark ? 'text-blue-400' : 'text-muted-foreground'} size={18} />
                  </div>
                </div>
                <nav className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={activeTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => setActiveTab(item.id)}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                  <Button variant="outline" onClick={handleAdminLogout} className="w-full flex items-center gap-2">
                    <LogOut className="h-4 w-4" /> {t('logout')}
                  </Button>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar for desktop */}
        <aside className="hidden lg:block lg:w-64">
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="w-full justify-start gap-3"
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
            <Button variant="outline" onClick={handleAdminLogout} className="w-full flex items-center gap-2">
              <LogOut className="h-4 w-4" /> {t('logout')}
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">{renderContent()}</main>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Details</DialogTitle>
            <DialogDescription>
              {detailsItem && (
                <div className="space-y-6">
                  {/* User Details */}
                  {detailsItem.email && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">User Information</h3>
                          <p className="text-sm text-muted-foreground">User account details</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                          <p className="text-sm">{detailsItem.firstName} {detailsItem.lastName}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Email</label>
                          <p className="text-sm">{detailsItem.email}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                          <p className="text-sm">{detailsItem.phoneNumber || 'Not provided'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Role</label>
                          <Badge variant={detailsItem.role === 'admin' ? 'default' : 'secondary'}>
                            {detailsItem.role}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
                          <Badge variant={detailsItem.isVerified ? 'default' : 'destructive'}>
                            {detailsItem.isVerified ? 'Verified' : 'Not Verified'}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Joined Date</label>
                          <p className="text-sm">{new Date(detailsItem.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Details */}
                  {detailsItem.title && detailsItem.price && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Home className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Property Information</h3>
                          <p className="text-sm text-muted-foreground">Property listing details</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Property Title</label>
                          <p className="text-lg font-medium">{detailsItem.title}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Address</label>
                            <p className="text-sm flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {detailsItem.address}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Price per Night</label>
                            <p className="text-sm flex items-center font-medium">
                              <DollarSign className="h-3 w-3 mr-1" />
                              ₹{detailsItem.price}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Owner</label>
                            <p className="text-sm">{detailsItem.owner ? `${detailsItem.owner.firstName} ${detailsItem.owner.lastName}` : '(Deleted Owner)'}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Listed Date</label>
                            <p className="text-sm">{new Date(detailsItem.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</p>
                          </div>
                        </div>

                        {detailsItem.images && detailsItem.images.length > 0 && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Images ({detailsItem.images.length})</label>
                            <div className="grid grid-cols-3 gap-2">
                              {detailsItem.images.slice(0, 6).map((image: string, index: number) => (
                                <img 
                                  key={index} 
                                  src={getImageUrl(image)} 
                                  alt={`Property ${index + 1}`}
                                  className="w-full h-20 object-cover rounded-md"
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Booking Details */}
                  {detailsItem.checkIn && detailsItem.checkOut && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Booking Information</h3>
                          <p className="text-sm text-muted-foreground">Reservation details</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Guest</label>
                          <p className="text-sm">{detailsItem.user ? `${detailsItem.user.firstName} ${detailsItem.user.lastName}` : '(Deleted User)'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Property</label>
                          <p className="text-sm">{detailsItem.property ? detailsItem.property.title : '(Deleted Property)'}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Check-in Date</label>
                          <p className="text-sm flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(detailsItem.checkIn).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Check-out Date</label>
                          <p className="text-sm flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(detailsItem.checkOut).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Total Price</label>
                          <p className="text-sm flex items-center font-medium">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ₹{detailsItem.totalPrice}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Status</label>
                          <Badge variant={detailsItem.status === 'confirmed' ? 'default' : 'secondary'}>
                            {detailsItem.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Booking Date</label>
                          <p className="text-sm">{new Date(detailsItem.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Review Details */}
                  {detailsItem.rating && detailsItem.comment && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Review Information</h3>
                          <p className="text-sm text-muted-foreground">User feedback details</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Reviewer</label>
                            <p className="text-sm">{detailsItem.user ? `${detailsItem.user.firstName} ${detailsItem.user.lastName}` : '(Deleted User)'}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Property</label>
                            <p className="text-sm">{detailsItem.property ? detailsItem.property.title : '(Deleted Property)'}</p>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Rating</label>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < detailsItem.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm font-medium">({detailsItem.rating}/5)</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Review Date</label>
                            <p className="text-sm">{new Date(detailsItem.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Comment</label>
                          <div className="p-3 bg-muted rounded-md">
                            <p className="text-sm">{detailsItem.comment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
} 