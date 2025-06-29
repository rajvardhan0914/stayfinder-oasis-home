import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone } from "lucide-react";
import api from "@/lib/api";

const Profile = () => {
  const { user, updateUser, loading: authLoading } = useAuth();
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
        <div className="mx-auto grid w-full max-w-4xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-4xl items-start gap-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="help">Help Center</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <form onSubmit={handleSubmit}>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl md:text-2xl">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
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
            </TabsContent>
            <TabsContent value="help">
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle>Help Center</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold">Frequently Asked Questions</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {/* FAQ items from original file */}
                      <div className="border rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium mb-1 sm:mb-2">How do I book a property?</h4>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          To book a property, simply browse our listings, select your desired dates, and click "Book Now".
                        </p>
                      </div>
                      <div className="border rounded-lg p-3 sm:p-4">
                        <h4 className="font-medium mb-1 sm:mb-2">How can I cancel a booking?</h4>
                        <p className="text-muted-foreground text-sm sm:text-base">
                          Visit your Bookings page and select the booking you wish to cancel.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4 sm:pt-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Need more help?</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <Button className="w-full sm:w-auto">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact Support
                      </Button>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Phone className="mr-2 h-4 w-4" />
                        Call Us
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile; 