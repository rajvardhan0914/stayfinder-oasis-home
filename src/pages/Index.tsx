import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Heart, Search, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useSettings } from "@/lib/SettingsProvider";
import { useTranslation } from "react-i18next";
import { useMobile } from "@/hooks/use-mobile";
import Footer from "@/components/Footer";
import { useFavorites } from "@/lib/favorites";

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  location: {
    city: string;
    state: string;
  };
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  rating?: number;
  owner?: {
    firstName: string;
    lastName: string;
  };
}

const Index = () => {
  const { t } = useTranslation();
  const { convertCurrency } = useSettings();
  const isMobile = useMobile();
  const { favorites } = useFavorites();

  const propertiesPerPage = isMobile ? 4 : 8;

  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(propertiesPerPage);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      // console.log('Fetching properties...');
      const response = await api.get('/properties');
      // console.log('Properties response:', response.data);
      // console.log('Response data type:', typeof response.data);
      // console.log('Is array?', Array.isArray(response.data));
      
      if (!Array.isArray(response.data)) {
        // console.error('Response is not an array:', response.data);
        throw new Error('Invalid response format from server');
      }
      
      const transformedProperties = response.data.map((property: any) => ({
        _id: property._id,
        title: property.title || 'Untitled',
        description: property.description || '',
        price: property.price ?? 0,
        type: property.type || 'House',
        location: {
          city: property.location?.city || 'Unknown City',
          state: property.location?.state || 'Unknown State'
        },
        images: Array.isArray(property.images) && property.images.length > 0
          ? property.images.map((img: string) => getImageUrl(img))
          : ['/placeholder.svg'],
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        maxGuests: property.maxGuests ?? 0,
        rating: property.rating ?? 0,
        owner: property.owner
      }));
      
      // console.log('Transformed properties:', transformedProperties);
      setAllProperties(transformedProperties);
      setFilteredProperties(transformedProperties);
    } catch (error: any) {
      // console.error('Error fetching properties:', error);
      toast.error("Failed to load properties. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setVisibleCount(propertiesPerPage); // Reset to show only initial properties after search
    try {
      // Only include non-empty parameters in the search
      const searchParams: any = {};
      if (searchLocation) searchParams.location = searchLocation;
      if (checkIn) searchParams.checkIn = checkIn;
      if (checkOut) searchParams.checkOut = checkOut;
      if (guests) searchParams.guests = guests;

      const response = await api.get('/properties/search', {
        params: searchParams
      });

      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format from server');
      }

      const transformedProperties = response.data.map((property: any) => ({
        _id: property._id,
        title: property.title || 'Untitled',
        description: property.description || '',
        price: property.price ?? 0,
        type: property.type || 'House',
        location: {
          city: property.location?.city || 'Unknown City',
          state: property.location?.state || 'Unknown State'
        },
        images: Array.isArray(property.images) && property.images.length > 0
          ? property.images.map((img: string) => getImageUrl(img))
          : ['/placeholder.svg'],
        bedrooms: property.bedrooms ?? 0,
        bathrooms: property.bathrooms ?? 0,
        maxGuests: property.maxGuests ?? 0,
        rating: property.rating ?? 0,
        owner: property.owner
      }));

      setFilteredProperties(transformedProperties);

      if (transformedProperties.length === 0) {
        toast.info("No properties found matching your search criteria.");
      }
    } catch (error: any) {
      toast.error("Search Failed. Failed to search properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryFilter = (category: string | null) => {
    setActiveCategory(category);
    setVisibleCount(propertiesPerPage); // Reset visible count on new filter
    if (category) {
      const filtered = allProperties.filter(p => p.type.toLowerCase() === category.toLowerCase());
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties(allProperties);
    }
  };

  const handleViewMoreProperties = () => {
    setVisibleCount(prev => Math.min(prev + propertiesPerPage, filteredProperties.length));
  };

  const propertiesToShow = filteredProperties.slice(0, visibleCount);
  const hasMoreProperties = visibleCount < filteredProperties.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-500 via-blue-500 to-purple-600 text-white py-10 md:py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold mb-2 md:mb-4">{t('findYourPerfectStay')}</h1>
          <p className="text-[10px] sm:text-xs md:text-lg mb-3 md:mb-6">{t('discoverUniqueHomes')}</p>
          
          <Card className="max-w-4xl mx-auto p-1 sm:p-2 md:p-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-foreground">{t('where')}</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    placeholder={t('searchDestinations')}
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-9 h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-xs font-medium text-foreground">{t('checkIn')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-9 h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-xs font-medium text-foreground">{t('checkOut')}</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="pl-9 h-8 sm:h-10 text-xs sm:text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-1">
                <label className="text-xs font-medium text-foreground">{t('guests')}</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="number"
                    placeholder={t('numberOfGuests')}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="pl-9 h-8 sm:h-10 text-xs sm:text-sm"
                    min="1"
                  />
                </div>
              </div>
            </div>
            <Button className="w-full mt-2 sm:mt-3 text-xs sm:text-sm h-8 sm:h-10" size="sm" onClick={handleSearch}>
              <Search className="mr-2 h-3 w-3" />
              {t('searchProperties')}
            </Button>
          </Card>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-2">
          <div className="text-center mb-6 md:mb-10">
            <h2 className="text-base sm:text-lg md:text-2xl font-bold">{t('browseByCategory')}</h2>
            <p className="text-[10px] sm:text-xs md:text-base text-muted-foreground mt-1">{t('exploreOurMostPopularPropertyTypes')}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-0.5 sm:gap-2 mb-6 md:mb-10">
            <Button
              variant={activeCategory === null ? 'default' : 'outline'}
              onClick={() => handleCategoryFilter(null)}
            >
              All
            </Button>
            {['Apartment', 'Villa', 'House', 'Cabin'].map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? 'default' : 'outline'}
                onClick={() => handleCategoryFilter(category)}
              >
                {t(category.toLowerCase())}
              </Button>
            ))}
          </div>

          
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-muted"></Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
                {propertiesToShow.map((property) => (
                  <PropertyCard
                    key={property._id + '-' + favorites.length}
                    property={{
                        ...property,
                        price: convertCurrency(property.price)
                    }}
                  />
                ))}
              </div>
              {hasMoreProperties && (
                <div className="text-center mt-6 md:mt-10">
                  <Button onClick={handleViewMoreProperties} size="sm" className="text-xs sm:text-sm h-8 sm:h-10">
                    {t('viewMore')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <Footer />
      {/* Hidden admin access - only visible if you know where to look */}
      <div className="fixed bottom-4 right-4 opacity-10 hover:opacity-100 transition-opacity">
        <Link to="/admin-login" className="text-xs text-muted-foreground hover:text-foreground">
          Admin
        </Link>
      </div>
    </div>
  );
};

export default Index;
