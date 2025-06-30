import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import {
  User,
  Bell,
  Lock,
  Camera,
  Sun,
  Moon,
  LogOut,
  HelpCircle,
  Mail,
  Phone,
} from "lucide-react";
import { useAuth } from '@/lib/auth';
import { useTranslation } from 'react-i18next';
import { useSettings } from '@/lib/SettingsProvider';
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getAvatarUrl = (avatarPath: string) => {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  if (!avatarPath.startsWith('/public/')) {
    avatarPath = '/public' + (avatarPath.startsWith('/') ? '' : '/') + avatarPath;
  }
  return `${API_URL}${avatarPath}`;
};

const Personal = () => {
  const { t } = useTranslation();
  const { user, refreshUserProfile, logout, loading, updateUser } = useAuth();
  const { settings, updateCurrency } = useSettings();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else {
        let street = '', city = '', state = '', country = '', zipCode = '';
        if (user.address && typeof user.address === 'object' && user.address !== null) {
          const addressObj = user.address as any;
          street = addressObj?.street || '';
          city = addressObj?.city || '';
          state = addressObj?.state || '';
          country = addressObj?.country || '';
          zipCode = addressObj?.zipCode || '';
        }
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          street,
          city,
          state,
          country,
          zipCode,
        });
      }
    }
  }, [user, loading, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData) return false;
    const newErrors: any = {};
    
    if (!formData.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (formData.phone && !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !formData) return;
    try {
      await api.put('/users/profile', {
        ...formData,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          zipCode: formData.zipCode,
        },
      });
      toast.success('Profile updated successfully!');
      refreshUserProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleLogoutClick = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/");
  };
  
  const handlePasswordInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    
    let newErrors: any = {};
    if (!passwordForm.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }
    
    // Clear errors before making API call
    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });

    try {
      await api.post('/users/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);
      if (errorMessage.toLowerCase().includes('current password')) {
        newErrors = { ...newErrors, currentPassword: errorMessage };
      }
      setPasswordErrors(newErrors);
    }
  };
  
  // IMPORTANT: Do NOT set Content-Type manually when sending FormData. Let Axios/fetch set it for you.
  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error('No file selected.');
      return;
    }
    // console.log('Selected file:', file);
    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      const response = await api.post('/users/upload-avatar', uploadData);
      // console.log('Upload response:', response.data);
      await refreshUserProfile();
      // Force a UI update by updating the user object in context if needed
      if (response.data && response.data.avatarUrl) {
        // If your useAuth provides an updateUser method, call it here
        if (typeof updateUser === 'function') {
          updateUser({ ...user, avatar: response.data.avatarUrl });
        }
      }
      toast.success('Avatar updated successfully');
    } catch (error) {
      toast.error('Failed to upload avatar.');
      // console.error('Upload error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-1 sm:px-4 lg:px-6 py-3 sm:py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-8 md:gap-16 items-center md:items-start">
            <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
              <Card className="w-full bg-card rounded-xl shadow-md p-4 sm:p-6 flex flex-col items-center">
                <div className="relative mb-2">
                  <Avatar className="w-28 h-28 sm:w-32 sm:h-32 md:w-32 md:h-32 lg:w-40 lg:h-40 border-4 border-background ring-2 ring-primary">
                    <AvatarImage src={getAvatarUrl(user.avatar)} alt={formData?.firstName} />
                    <AvatarFallback className="text-3xl md:text-5xl lg:text-6xl">{formData?.firstName?.[0]}{formData?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full p-2 shadow cursor-pointer hover:from-teal-600 hover:to-blue-600 transition border-2 border-white flex items-center justify-center">
                    <Camera className="h-5 w-5 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight mb-0.5 text-center truncate text-foreground">{formData?.firstName} {formData?.lastName}</h1>
                <p className="text-xs sm:text-sm md:text-lg text-muted-foreground text-center truncate">{formData?.email}</p>
              </Card>
            </div>
            <div className="w-full md:w-2/3 mt-4 md:mt-0">
              <form onSubmit={handleSave}>
                <Card className="bg-card rounded-xl shadow-md p-4 sm:p-6">
                  <CardHeader className="pb-2 text-foreground">
                    <CardTitle className="text-lg sm:text-xl md:text-2xl text-foreground">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 md:space-y-4 text-foreground">
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-xs sm:text-sm md:text-base">First Name</Label>
                        <Input 
                          id="firstName" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First name" 
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-xs sm:text-sm md:text-base">Last Name</Label>
                        <Input 
                          id="lastName" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last name" 
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-xs sm:text-sm md:text-base">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs sm:text-sm md:text-base">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number" 
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="street" className="text-xs sm:text-sm md:text-base">Street</Label>
                        <Input 
                          id="street"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          placeholder="Street"
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="city" className="text-xs sm:text-sm md:text-base">City</Label>
                        <Input 
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="state" className="text-xs sm:text-sm md:text-base">State</Label>
                        <Input 
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="country" className="text-xs sm:text-sm md:text-base">Country</Label>
                        <Input 
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                          className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="zipCode" className="text-xs sm:text-sm md:text-base">Zip Code</Label>
                      <Input 
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Zip code"
                        className="h-8 sm:h-9 md:h-10 text-xs sm:text-sm md:text-base bg-background text-foreground"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 px-2 py-2 border-t">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 px-6 text-base bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600"
                    >
                      Save
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Personal;