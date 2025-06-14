
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Star,
  Heart,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Coffee,
  Tv,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Shield,
  Award
} from "lucide-react";
import Header from "@/components/Header";

// Mock property data (in real app, this would come from API)
const mockProperty = {
  id: 1,
  title: "Modern Apartment in Downtown",
  location: "New York, NY",
  price: 125,
  rating: 4.9,
  reviews: 87,
  images: [
    "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=800&h=600&fit=crop"
  ],
  host: {
    name: "Sarah",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c724?w=100&h=100&fit=crop&crop=face",
    joinedYear: "2019",
    verified: true,
    superhost: true
  },
  beds: 2,
  baths: 1,
  guests: 4,
  description: "Welcome to our stunning modern apartment in the heart of downtown! This beautifully designed space offers the perfect blend of comfort and style, making it ideal for both business travelers and vacation guests. The apartment features floor-to-ceiling windows with breathtaking city views, a fully equipped kitchen, and thoughtfully curated decor throughout.",
  amenities: [
    { icon: Wifi, name: "Free WiFi" },
    { icon: Car, name: "Free parking" },
    { icon: Coffee, name: "Coffee maker" },
    { icon: Tv, name: "Smart TV" }
  ],
  rules: [
    "Check-in: 3:00 PM - 11:00 PM",
    "Check-out: 11:00 AM",
    "No smoking",
    "No pets allowed",
    "No parties or events"
  ]
};

const PropertyDetail = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to listings
        </Link>

        {/* Property Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {mockProperty.title}
              </h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium">{mockProperty.rating}</span>
                  <span className="ml-1">({mockProperty.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{mockProperty.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button variant="outline" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Share</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsLiked(!isLiked)}
                className="flex items-center space-x-2"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span>Save</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden">
                <img
                  src={mockProperty.images[selectedImage]}
                  alt="Property"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {mockProperty.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      selectedImage === index
                        ? "border-teal-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <span className="text-2xl font-bold">${mockProperty.price}</span>
                    <span className="text-gray-600 ml-1">per night</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{mockProperty.rating}</span>
                    <span className="text-gray-500">({mockProperty.reviews})</span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-in
                      </label>
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Check-out
                      </label>
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guests
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={mockProperty.guests}
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      placeholder="Number of guests"
                    />
                  </div>
                </div>

                <Button className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3">
                  Reserve Now
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  You won't be charged yet
                </p>

                <div className="border-t pt-4 mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>$125 × 5 nights</span>
                    <span>$625</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cleaning fee</span>
                    <span>$25</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service fee</span>
                    <span>$50</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>$700</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={mockProperty.host.avatar}
                    alt={mockProperty.host.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">
                        Hosted by {mockProperty.host.name}
                      </h3>
                      {mockProperty.host.superhost && (
                        <Badge className="bg-gradient-to-r from-teal-500 to-blue-500">
                          <Award className="h-3 w-3 mr-1" />
                          Superhost
                        </Badge>
                      )}
                      {mockProperty.host.verified && (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600">
                      Joined in {mockProperty.host.joinedYear}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Stats */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="h-6 w-6 text-gray-600 mb-2" />
                    <span className="font-semibold">{mockProperty.guests}</span>
                    <span className="text-sm text-gray-600">Guests</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bed className="h-6 w-6 text-gray-600 mb-2" />
                    <span className="font-semibold">{mockProperty.beds}</span>
                    <span className="text-sm text-gray-600">Bedrooms</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="h-6 w-6 text-gray-600 mb-2" />
                    <span className="font-semibold">{mockProperty.baths}</span>
                    <span className="text-sm text-gray-600">Bathrooms</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About this place</h3>
                <p className="text-gray-700 leading-relaxed">{mockProperty.description}</p>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mockProperty.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <amenity.icon className="h-5 w-5 text-gray-600" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* House Rules */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">House Rules</h3>
                <ul className="space-y-2">
                  {mockProperty.rules.map((rule, index) => (
                    <li key={index} className="text-gray-700">
                      • {rule}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{mockProperty.rating}</span>
                  <span className="text-gray-600">({mockProperty.reviews} reviews)</span>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={`https://images.unsplash.com/photo-${1500000000000 + review}?w=40&h=40&fit=crop&crop=face`}
                          alt="Reviewer"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-medium text-sm">Guest {review}</span>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-3 w-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">
                        Great location and beautiful apartment. Host was very responsive!
                      </p>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  Show all reviews
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
