import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MapPin, Upload, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner";

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
}

interface PropertyData {
  title: string;
  description: string;
  pricePerNight: string;
  address: Address;
  phoneNumber: string;
  bedrooms: string;
  bathrooms: string;
  maxGuests: string;
  numberOfUnits: string;
  amenities: string[];
  images: File[];
  type: string;
  availability: { startDate: string; endDate: string }[];
}

export function AddProperty() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    title: "",
    description: "",
    pricePerNight: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
    },
    phoneNumber: "",
    bedrooms: "",
    bathrooms: "",
    maxGuests: "",
    numberOfUnits: "1",
    amenities: [""],
    images: [],
    type: "",
    availability: [{ startDate: "", endDate: "" }],
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value
      }
    }));
  };

  const handleSelectChange = (value: string) => {
    setPropertyData(prev => ({
      ...prev,
      type: value,
    }));
  };

  const handleAmenityChange = (index: number, value: string) => {
    const newAmenities = [...propertyData.amenities];
    newAmenities[index] = value;
    setPropertyData(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };

  const addAmenity = () => {
    setPropertyData(prev => ({
      ...prev,
      amenities: [...prev.amenities, ""]
    }));
  };

  const removeAmenity = (index: number) => {
    const newAmenities = propertyData.amenities.filter((_, i) => i !== index);
    setPropertyData(prev => ({
      ...prev,
      amenities: newAmenities
    }));
  };

  const handleAvailabilityChange = (index: number, field: 'startDate' | 'endDate', value: string) => {
    const newAvailability = [...propertyData.availability];
    newAvailability[index][field] = value;
    setPropertyData(prev => ({ ...prev, availability: newAvailability }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    
    setIsUploading(true);
    try {
      const response = await api.post('/properties/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrls(prev => [...prev, ...response.data.imageUrls]);
    } catch (error) {
      toast.error("Could not upload images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to add a property.");
      return;
    }

    if (!propertyData.type) {
      toast.error("Please select a property type.");
      return;
    }

    if (imageUrls.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalPropertyData = {
        title: propertyData.title,
        description: propertyData.description,
        pricePerNight: parseFloat(propertyData.pricePerNight),
        phoneNumber: propertyData.phoneNumber,
        bedrooms: parseInt(propertyData.bedrooms),
        bathrooms: parseInt(propertyData.bathrooms),
        maxGuests: parseInt(propertyData.maxGuests),
        numberOfUnits: parseInt(propertyData.numberOfUnits),
        type: propertyData.type,
        amenities: propertyData.amenities.filter(amenity => amenity.trim().length > 0),
        images: imageUrls,
        address: {
          street: propertyData.address.street,
          city: propertyData.address.city,
          state: propertyData.address.state,
          country: propertyData.address.country,
        },
        availability: propertyData.availability.filter(period => period.startDate && period.endDate)
      };

      console.log('=== ADDING NEW PROPERTY ===');
      console.log('Property data being sent:', JSON.stringify(finalPropertyData, null, 2));

      await api.post('/properties', finalPropertyData);
      toast.success("Property added successfully!");
      navigate('/index');
    } catch (error: any) {
      console.error('Error adding property:', error);
      toast.error(error.response?.data?.message || "Failed to add property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold mb-6">Add New Property</h1>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Basic Information</h2>
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={propertyData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={propertyData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="pricePerNight">Price per night (INR)</Label>
                      <Input
                        id="pricePerNight"
                        name="pricePerNight"
                        type="number"
                        value={propertyData.pricePerNight}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select onValueChange={handleSelectChange} required>
                        <SelectTrigger id="propertyType">
                          <SelectValue placeholder="Select property type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Apartment">Apartment</SelectItem>
                          <SelectItem value="Villa">Villa</SelectItem>
                          <SelectItem value="House">House</SelectItem>
                          <SelectItem value="Cabin">Cabin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Location</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input
                          id="street"
                          name="street"
                          value={propertyData.address.street}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={propertyData.address.city}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          name="state"
                          value={propertyData.address.state}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          name="country"
                          value={propertyData.address.country}
                          onChange={handleAddressChange}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={propertyData.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Property Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms</Label>
                      <Input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        value={propertyData.bedrooms}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        value={propertyData.bathrooms}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGuests">Max Guests</Label>
                      <Input
                        id="maxGuests"
                        name="maxGuests"
                        type="number"
                        value={propertyData.maxGuests}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="numberOfUnits">Number of Units Available</Label>
                      <Input
                        id="numberOfUnits"
                        name="numberOfUnits"
                        type="number"
                        min="1"
                        value={propertyData.numberOfUnits}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Amenities</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addAmenity}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Amenity
                    </Button>
                  </div>
                  {propertyData.amenities.map((amenity, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={amenity}
                        onChange={(e) => handleAmenityChange(index, e.target.value)}
                        placeholder="Enter amenity"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeAmenity(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Availability */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Availability</h2>
                  {propertyData.availability.map((period, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`startDate-${idx}`}>Start Date</Label>
                        <Input
                          id={`startDate-${idx}`}
                          name={`startDate-${idx}`}
                          type="date"
                          value={period.startDate}
                          onChange={(e) => handleAvailabilityChange(idx, 'startDate', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`endDate-${idx}`}>End Date</Label>
                        <Input
                          id={`endDate-${idx}`}
                          name={`endDate-${idx}`}
                          type="date"
                          value={period.endDate}
                          onChange={(e) => handleAvailabilityChange(idx, 'endDate', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Images</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imageUrls.map((image, index) => {
                      return (
                        <div key={index} className="relative group">
                          <img
                            src={getImageUrl(image)}
                            alt={`Property ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                    <label className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                        <span className="text-sm text-gray-500">Upload Images</span>
                      </div>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding Property..." : "Add Property"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 