import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, MapPin, Bed, Bath, Users, Heart, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useFavorites } from '../lib/favorites';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

interface Property {
  _id: string;
  title: string;
  description: string;
  price: number | string;
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

interface PropertyCardProps {
  property: Property;
  favoritesVersion?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  if (!imagePath.startsWith('/public/')) {
    imagePath = imagePath.replace(/^\//, '');
    imagePath = '/public/' + imagePath;
  }
  return `${API_URL}${imagePath}`;
};

const PropertyCard: React.FC<PropertyCardProps> = ({ property, favoritesVersion }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please log in to save favorites');
      return;
    }

    try {
      if (isFavorite(property._id)) {
        await removeFromFavorites(property._id);
      } else {
        await addToFavorites(property._id);
      }
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Check out this amazing property: ${property.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const handleViewDetails = () => {
    navigate(`/properties/${property._id}`);
  };

  const images = property.images && property.images.length > 0 ? property.images : ['/placeholder.svg'];

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-card">
      <div className="relative">
        {/* Image Carousel */}
        <div className="relative h-32 md:h-40 overflow-hidden">
          <Carousel className="w-full h-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative w-full h-full">
                    <img
                      src={getImageUrl(image)}
                      alt={`${property.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" />
              </>
            )}
          </Carousel>

          {/* Action Buttons */}
          <div className="absolute top-1 right-1 flex gap-0.5">
            <Button
              size="sm"
              variant="secondary"
              className="h-6 w-6 p-0 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm"
              onClick={handleShare}
            >
              <Share2 className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className={`h-6 w-6 p-0 rounded-full backdrop-blur-sm ${
                isFavorite(property._id)
                  ? 'bg-red-500/80 hover:bg-red-500 text-white' 
                  : 'bg-white/80 hover:bg-white'
              }`}
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-3 w-3 ${isFavorite(property._id) ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-1 left-1">
            <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] px-1.5 py-0.5">
              {typeof property.price === 'number' ? `₹${property.price}/night` : `${property.price}/night`}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-2">
          <div className="space-y-1.5">
            {/* Title and Rating */}
            <div className="flex items-start justify-between gap-1">
              <h3 className="font-normal text-[11px] sm:text-xs md:text-base text-foreground line-clamp-2 leading-snug">
                {property.title}
              </h3>
              <div className="flex items-center gap-0.5 flex-shrink-0 pt-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[11px] sm:text-xs md:text-base font-medium">{property.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs md:text-base truncate">
                {property.location.city}, {property.location.state}
              </span>
            </div>

            {/* Property Details */}
            <div className="flex items-center gap-2 text-muted-foreground pt-0.5">
              <div className="flex items-center gap-0.5">
                <Bed className="h-3 w-3" />
                <span className="text-[11px] sm:text-xs md:text-base">{property.bedrooms || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Bath className="h-3 w-3" />
                <span className="text-[11px] sm:text-xs md:text-base">{property.bathrooms || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <Users className="h-3 w-3" />
                <span className="text-[11px] sm:text-xs md:text-base">{property.maxGuests || 'N/A'}</span>
              </div>
            </div>

            {/* View Details Button */}
            <Button
              onClick={handleViewDetails}
              className="w-full mt-1 text-[11px] sm:text-xs md:text-base py-1 h-7 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-semibold shadow hover:from-teal-600 hover:to-blue-600"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default PropertyCard;
