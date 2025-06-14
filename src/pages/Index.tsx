
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Star, Heart, Search, Calendar, Users } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";

// Mock data for properties
const mockProperties = [
  {
    id: 1,
    title: "Modern Apartment in Downtown",
    location: "New York, NY",
    price: 125,
    rating: 4.9,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=500&h=300&fit=crop",
    host: "Sarah",
    beds: 2,
    baths: 1,
    guests: 4
  },
  {
    id: 2,
    title: "Cozy Mountain Cabin",
    location: "Aspen, CO",
    price: 200,
    rating: 4.8,
    reviews: 64,
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=500&h=300&fit=crop",
    host: "Mike",
    beds: 3,
    baths: 2,
    guests: 6
  },
  {
    id: 3,
    title: "Beachfront Villa",
    location: "Miami, FL",
    price: 350,
    rating: 4.9,
    reviews: 123,
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=500&h=300&fit=crop",
    host: "Elena",
    beds: 4,
    baths: 3,
    guests: 8
  },
  {
    id: 4,
    title: "Historic Loft in Arts District",
    location: "Los Angeles, CA",
    price: 180,
    rating: 4.7,
    reviews: 92,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=300&fit=crop",
    host: "David",
    beds: 1,
    baths: 1,
    guests: 2
  },
  {
    id: 5,
    title: "Luxury Desert Resort",
    location: "Scottsdale, AZ",
    price: 275,
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=500&h=300&fit=crop",
    host: "Amanda",
    beds: 3,
    baths: 2,
    guests: 6
  },
  {
    id: 6,
    title: "Tech-Enabled City Suite",
    location: "San Francisco, CA",
    price: 220,
    rating: 4.8,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&h=300&fit=crop",
    host: "James",
    beds: 2,
    baths: 1,
    guests: 3
  }
];

const Index = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-500 via-blue-500 to-purple-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 animate-fade-in">
            Discover unique homes and experiences around the world
          </p>
          
          {/* Search Bar */}
          <Card className="max-w-4xl mx-auto p-6 animate-scale-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Where</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search destinations"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Guests</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Add guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <Button className="w-full mt-6 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:scale-105">
              <Search className="mr-2 h-5 w-5" />
              Search Properties
            </Button>
          </Card>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Properties
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked properties that offer the best experiences for your stay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" className="px-8 py-3 text-lg">
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Apartments", count: "1,200+ stays" },
              { name: "Houses", count: "800+ stays" },
              { name: "Villas", count: "500+ stays" },
              { name: "Cabins", count: "300+ stays" }
            ].map((category) => (
              <Card key={category.name} className="p-6 text-center hover:shadow-lg transition-shadow cursor-pointer hover-scale">
                <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                <p className="text-gray-600">{category.count}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
