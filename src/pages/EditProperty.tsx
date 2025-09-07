import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from '@/components/Header';

// This interface should match the backend model
interface Property {
    _id: string;
    title: string;
    description: string;
    price: number;
    pricePerNight?: number;
    location?: {
        address: string;
        city: string;
        state: string;
        country: string;
    };
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
    };
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    numberOfUnits: number;
    amenities: string[];
    images: string[];
    type: 'Apartment' | 'Villa' | 'House' | 'Cabin';
    phoneNumber: string;
    availability: { startDate: string; endDate: string }[];
}

const EditProperty = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [propertyData, setPropertyData] = useState<Partial<Property>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [amenitiesInput, setAmenitiesInput] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get<Property>(`/properties/${id}`);
        
        // Ensure image URLs are properly prefixed
        const processedImages = data.images?.map((url: string) => 
          getImageUrl(url)
        ) || [];
        
        // Fetched property data
        
        setPropertyData({
            ...data,
            address: data.location ? {
              street: data.location.address || '',
              city: data.location.city || '',
              state: data.location.state || '',
              country: data.location.country || '',
            } : data.address || {
              street: '',
              city: '',
              state: '',
              country: '',
            },
            amenities: data.amenities || []
        });
        
        // Mapped property data
        setAmenitiesInput(Array.isArray(data.amenities) ? data.amenities.join(', ') : '');
        setImagePreviews(processedImages);
      } catch (error) {
        toast.error("Failed to fetch property details.");
        navigate('/host-dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'amenities') {
      setAmenitiesInput(value);
      // Convert to array and update propertyData
      const amenitiesArray = value.split(',').map(a => a.trim()).filter(a => a.length > 0);
      setPropertyData((prev) => ({
        ...prev,
        amenities: amenitiesArray,
      }));
    } else {
      setPropertyData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPropertyData(prev => ({
        ...prev,
        address: {
            ...prev?.address,
            [name]: value
        }
    }))
  }

  const handleSelectChange = (value: string) => {
    setPropertyData((prev) => ({
      ...prev,
      type: value as Property['type'],
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...files]);

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number, isExisting: boolean) => {
    const imageUrl = imagePreviews[index];

    // If it's an existing image, we need to remove it from the propertyData.images array
    if(isExisting){
      // Convert the full URL back to relative path for comparison
      const relativePath = imageUrl.replace(API_URL, '');
      setPropertyData(prev => ({
        ...prev, 
        images: prev.images?.filter(img => {
          // Compare both full URL and relative path
          const imgRelativePath = img.replace(API_URL, '');
          return img !== imageUrl && imgRelativePath !== relativePath;
        })
      }));
    } else { // If it's a new image, we remove it from the newImages array
       const objectUrlIndex = imagePreviews.slice(propertyData.images?.length || 0).findIndex(url => url === imageUrl);
       setNewImages(prev => prev.filter((_, i) => i !== objectUrlIndex));
    }
    
    // Always remove from previews
    setImagePreviews(prev => prev.filter((_, i) => i !== index));

    // If it was a new image preview, revoke its object URL
    if(!isExisting) {
        URL.revokeObjectURL(imageUrl);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    // --- Validation ---
    if (!propertyData.phoneNumber || propertyData.phoneNumber.length !== 10) {
      setFormError('Phone number must be exactly 10 digits.');
      setIsLoading(false);
      return;
    }
    if (!propertyData.address || !propertyData.address.street || !propertyData.address.city || !propertyData.address.state || !propertyData.address.country) {
      setFormError('All address fields are required.');
      setIsLoading(false);
      return;
    }
    if (!propertyData.pricePerNight && !propertyData.price) {
      setFormError('Price per night is required.');
      setIsLoading(false);
      return;
    }

    try {
      let uploadedImageUrls: string[] = [];
      // 1. Upload NEW images if any
      if (newImages.length > 0) {
        const imageFormData = new FormData();
        newImages.forEach(image => {
            imageFormData.append('images', image);
        });
        const imageUploadResponse = await api.post('/properties/upload-images', imageFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        // Ensure the image URLs are properly prefixed
        uploadedImageUrls = imageUploadResponse.data.imageUrls.map((url: string) => 
          getImageUrl(url)
        );
      }
      

      // 2. Combine old and new image URLs
      const finalImageUrls = [...(propertyData.images || []), ...uploadedImageUrls];

      // Robust price conversion
      let priceValue: number;
      if (propertyData.pricePerNight !== undefined && propertyData.pricePerNight !== null && propertyData.pricePerNight !== 0) {
        priceValue = Number(propertyData.pricePerNight);
      } else if (propertyData.price !== undefined && propertyData.price !== null && propertyData.price !== 0) {
        priceValue = Number(propertyData.price);
      } else {
        priceValue = 0;
      }
      const addressObj = propertyData.address ? { ...propertyData.address } : undefined;
      const locationObj = addressObj ? {
        address: addressObj.street,
        city: addressObj.city,
        state: addressObj.state,
        country: addressObj.country,
        coordinates: { lat: 0, lng: 0 }
      } : undefined;
      const finalPropertyData = {
        ...propertyData,
        price: priceValue,
        pricePerNight: priceValue,
        address: addressObj,
        location: locationObj,
        bedrooms: Number(propertyData.bedrooms),
        bathrooms: Number(propertyData.bathrooms),
        maxGuests: Number(propertyData.maxGuests),
        numberOfUnits: Number(propertyData.numberOfUnits),
        amenities: propertyData.amenities || [],
        images: finalImageUrls,
        phoneNumber: propertyData.phoneNumber || '',
        availability: propertyData.availability || []
      };

      // Submitting property data

      await api.put(`/properties/${id}`, finalPropertyData);
      
      toast.success('Property updated successfully!');
      navigate('/host-dashboard');
    } catch (error) {
      console.error('Failed to update property:', error);
      toast.error('Failed to update property. Please check the details and try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !propertyData.title) return <p>Loading property...</p>

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Edit Property</h1>
        {formError && <div className="mb-4 text-red-600 font-semibold">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <Label htmlFor="title">Property Title</Label>
            <Input id="title" name="title" value={propertyData.title || ''} onChange={handleInputChange} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={propertyData.description || ''} onChange={handleInputChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerNight">Price per night (INR)</Label>
              <Input id="pricePerNight" name="pricePerNight" type="number" value={propertyData.pricePerNight ?? propertyData.price ?? ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="propertyType">Property Type</Label>
              <Select onValueChange={handleSelectChange} value={propertyData.type}>
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

          <fieldset className="border p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Address</legend>
              <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="street">Street</Label>
                          <Input id="street" name="street" value={propertyData.address?.street ?? ''} onChange={handleAddressChange} required />
                      </div>
                       <div>
                          <Label htmlFor="city">City</Label>
                          <Input id="city" name="city" value={propertyData.address?.city ?? ''} onChange={handleAddressChange} required />
                      </div>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <Label htmlFor="state">State / Province</Label>
                          <Input id="state" name="state" value={propertyData.address?.state ?? ''} onChange={handleAddressChange} required />
                      </div>
                       <div>
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" name="country" value={propertyData.address?.country ?? ''} onChange={handleAddressChange} required />
                      </div>
                  </div>
              </div>
          </fieldset>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input 
              id="phoneNumber" 
              name="phoneNumber" 
              type="tel" 
              value={propertyData.phoneNumber || ''} 
              onChange={e => {
                // Only allow numbers and max 10 digits
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setPropertyData(prev => ({ ...prev, phoneNumber: value }));
              }} 
              placeholder="9876543210"
              maxLength={10}
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input id="bedrooms" name="bedrooms" type="number" value={propertyData.bedrooms || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" name="bathrooms" type="number" value={propertyData.bathrooms || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="maxGuests">Max Guests</Label>
              <Input id="maxGuests" name="maxGuests" type="number" value={propertyData.maxGuests || ''} onChange={handleInputChange} required />
            </div>
            <div>
              <Label htmlFor="numberOfUnits">Number of Units Available</Label>
              <Input id="numberOfUnits" name="numberOfUnits" type="number" min="1" value={propertyData.numberOfUnits || ''} onChange={handleInputChange} required />
            </div>
          </div>

          <div>
              <Label htmlFor="amenities">Amenities (comma-separated)</Label>
              <Input id="amenities" name="amenities" value={amenitiesInput} onChange={handleInputChange} placeholder="e.g. Wifi, Pool, Kitchen" />
          </div>

          <div>
            <Label>Images</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Add new images</p>
                </div>
                <Input id="image-upload" type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => {
                const isExisting = index < (propertyData.images?.length || 0);
                // Only call getImageUrl if not already a Cloudinary URL
                const displayUrl = preview.startsWith('http') ? preview : getImageUrl(preview);
                return (
                  <div key={preview} className="relative">
                    <img src={displayUrl} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md" />
                    <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeImage(index, isExisting)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default EditProperty; 