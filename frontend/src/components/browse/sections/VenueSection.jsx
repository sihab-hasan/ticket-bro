// frontend/src/components/events/sections/VenueSection.jsx
import React from 'react';
import {
  MapPin,
  Users,
  ParkingCircle,
  Wifi,
  Coffee,
  Accessibility,
  Info,
  Navigation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const VenueSection = ({ venue, event }) => {
  // Mock venue data
  const mockVenue = {
    id: 1,
    name: 'Madison Square Garden',
    description: 'Madison Square Garden, often called The Garden, is a multi-purpose indoor arena in New York City. It is the oldest major sporting facility in the New York metropolitan area.',
    address: '4 Pennsylvania Plaza',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'USA',
    latitude: 40.7505,
    longitude: -73.9934,
    capacity: 20000,
    parking: 'Multiple parking garages available within walking distance. Pre-booking recommended.',
    publicTransport: 'Accessible via Penn Station (subway: A, C, E, 1, 2, 3 lines) and multiple bus routes.',
    amenities: [
      { name: 'Wi-Fi', icon: Wifi, available: true },
      { name: 'Food & Beverage', icon: Coffee, available: true },
      { name: 'Accessible Seating', icon: Accessibility, available: true },
      { name: 'Parking', icon: ParkingCircle, available: true }
    ],
    rules: [
      'No outside food or beverages',
      'Bags larger than 14"x14"x6" not permitted',
      'Professional cameras not allowed',
      'Smoking prohibited indoors'
    ],
    images: [
      '/images/venues/msg-1.jpg',
      '/images/venues/msg-2.jpg',
      '/images/venues/msg-3.jpg'
    ],
    website: 'https://www.msg.com',
    phone: '+1 (212) 465-6741'
  };

  const data = venue || mockVenue;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Venue Information</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about the venue
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Map and Images */}
          <div className="space-y-6">
            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>{data.address}, {data.city}, {data.state} {data.zipCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                  {/* Map placeholder - in production, use Google Maps or Mapbox */}
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Map Preview</p>
                    <Button 
                      variant="link" 
                      className="mt-2 gap-2"
                      onClick={openGoogleMaps}
                    >
                      <Navigation className="h-4 w-4" />
                      Open in Google Maps
                    </Button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={openGoogleMaps}>
                    Get Directions
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Save Venue
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Venue Images */}
            <Card>
              <CardHeader>
                <CardTitle>Venue Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {data.images?.map((image, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-muted rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Venue Info */}
            <Card>
              <CardHeader>
                <CardTitle>{data.name}</CardTitle>
                <CardDescription>{data.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Capacity */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {data.capacity.toLocaleString()} attendees
                    </p>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h4 className="font-medium mb-3">Amenities</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {data.amenities.map((amenity, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                        <amenity.icon className="h-4 w-4 text-primary" />
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Contact</h4>
                  <p className="text-sm">
                    <a href={data.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                      {data.website}
                    </a>
                  </p>
                  <p className="text-sm">
                    <a href={`tel:${data.phone}`} className="text-primary hover:underline">
                      {data.phone}
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Transportation & Rules */}
            <Tabs defaultValue="transport" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transport">Transportation</TabsTrigger>
                <TabsTrigger value="rules">Venue Rules</TabsTrigger>
              </TabsList>
              <TabsContent value="transport">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Parking</h4>
                      <p className="text-sm text-muted-foreground">{data.parking}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Public Transit</h4>
                      <p className="text-sm text-muted-foreground">{data.publicTransport}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rules">
                <Card>
                  <CardContent className="pt-6">
                    <ul className="space-y-2">
                      {data.rules.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VenueSection;