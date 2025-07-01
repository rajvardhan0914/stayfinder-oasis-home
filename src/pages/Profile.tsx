import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { Camera } from "lucide-react";

const Profile = () => {
  const { user, updateUser, loading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
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
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          street,
          city,
          state,
          country,
          zipCode,
        });
      } else {
        navigate("/login");
      }
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
      toast({ description: "Profile updated successfully!", variant: "default" });
      updateUser({ ...user, ...formData });
    } catch (error) {
      toast({ description: error.response?.data?.message || "Failed to update profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading) {
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-start md:gap-32 mb-1">
            <div className="relative flex-shrink-0 flex flex-col items-center md:mt-12">
              <div className="relative">
                <Avatar className="h-40 w-40 mb-1 md:mb-0">
                  <AvatarImage src={user?.avatar && user.avatar.startsWith('http') ? user.avatar : 'https://res.cloudinary.com/demo/image/upload/v1690000000/default-avatar.png'} alt={user?.firstName} />
                  <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const formData = new FormData();
                      formData.append('avatar', e.target.files[0]);
                      try {
                        const response = await api.post('/users/upload-avatar', formData, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        toast({ description: "Profile image updated!", variant: "default" });
                        updateUser({ ...user, avatar: response.data.avatarUrl });
                      } catch (error) {
                        toast({ description: error.response?.data?.message || "Failed to upload avatar.", variant: "destructive" });
                      }
                    }
                  }}
                />
                <span
                  className="absolute bottom-1 right-3 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Button
                    type="button"
                    size="icon"
                    className="h-10 w-10 p-0 rounded-full bg-gradient-to-br from-teal-500 via-blue-500 to-indigo-500 text-white shadow-lg border-2 border-white hover:scale-105 hover:from-teal-600 hover:to-blue-700 transition-transform duration-150"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </span>
              </div>
              <div className="text-lg font-semibold mt-2 text-center w-full">{user?.firstName} {user?.lastName}</div>
            </div>
            <div className="flex-1 w-full mt-2 md:-mt-6">
              <form onSubmit={handleSubmit} className="w-full">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl md:text-2xl">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 md:space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 md:space-y-2">
                        <label htmlFor="firstName" className="text-sm md:text-base">First Name</label>
                        <input 
                          id="firstName" 
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="First name" 
                          className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label htmlFor="lastName" className="text-sm md:text-base">Last Name</label>
                        <input 
                          id="lastName" 
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Last name" 
                          className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label htmlFor="email" className="text-sm md:text-base">Email</label>
                      <input 
                        id="email" 
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email" 
                        className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                      />
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label htmlFor="phone" className="text-sm md:text-base">Phone Number</label>
                      <input 
                        id="phone" 
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone number" 
                        className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 md:space-y-2">
                        <label htmlFor="street" className="text-sm md:text-base">Street</label>
                        <input 
                          id="street"
                          name="street"
                          value={formData.street}
                          onChange={handleInputChange}
                          placeholder="Street"
                          className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label htmlFor="city" className="text-sm md:text-base">City</label>
                        <input 
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="City"
                          className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1 md:space-y-2">
                        <label htmlFor="state" className="text-sm md:text-base">State</label>
                        <input 
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          placeholder="State"
                          className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                        />
                      </div>
                      <div className="space-y-1 md:space-y-2">
                        <label htmlFor="country" className="text-sm md:text-base">Country</label>
                        <input 
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="Country"
                          className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      <label htmlFor="zipCode" className="text-sm md:text-base">Zip Code</label>
                      <input 
                        id="zipCode"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        placeholder="Zip code"
                        className="h-8 md:h-10 text-sm md:text-base w-full border rounded px-2"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 px-4 py-2 border-t">
                    <Button
                      type="submit"
                      size="sm"
                      className="h-10 px-6 text-base bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
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

export default Profile; 