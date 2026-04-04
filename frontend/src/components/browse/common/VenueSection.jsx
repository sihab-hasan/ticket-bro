import React from 'react';
import {
  MapPin,
  Users,
  ParkingCircle,
  Wifi,
  Coffee,
  Accessibility,
  Info,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const normalizeAmenities = (amenities = []) => {
  const iconMap = {
    wifi: Wifi,
    parking: ParkingCircle,
    coffee: Coffee,
    food: Coffee,
    accessible: Accessibility,
  };

  return amenities.map((item) => {
    if (typeof item === 'string') {
      const key = item.toLowerCase();
      return { name: item, icon: iconMap[key] || Info };
    }

    const key = String(item?.name || '').toLowerCase();
    return {
      name: item?.name || 'Amenity',
      icon: item?.icon || iconMap[key] || Info,
    };
  });
};

const VenueSection = ({ venue, event }) => {
  const source = venue || event?.venue || event?.location || {};
  const data = {
    name: source.name || source.venueName || event?.venueName || 'Venue details coming soon',
    description: source.description || 'Venue information will appear here when it is available from the organizer.',
    address: source.address || source.street || event?.address || '',
    city: source.city || event?.city || '',
    state: source.state || '',
    zipCode: source.zipCode || '',
    country: source.country || '',
    latitude: source.latitude ?? source.lat ?? source.coordinates?.lat ?? null,
    longitude: source.longitude ?? source.lng ?? source.coordinates?.lng ?? null,
    capacity: Number(source.capacity || event?.totalCapacity || 0),
    parking: source.parking || event?.parking || 'Parking details are not provided.',
    publicTransport: source.publicTransport || event?.publicTransport || 'Public transport details are not provided.',
    amenities: normalizeAmenities(source.amenities || event?.amenities || []),
    rules: source.rules || event?.rules || [],
    images: source.images || event?.images || event?.gallery || [],
    website: source.website || event?.website || '',
    phone: source.phone || event?.phone || '',
  };

  const canOpenMap = data.latitude !== null && data.longitude !== null;
  const openGoogleMaps = () => {
    if (!canOpenMap) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold">Venue Information</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Everything available about the venue for this event.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  {[data.address, data.city, data.state, data.zipCode].filter(Boolean).join(', ') || 'Venue address not provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex aspect-video items-center justify-center rounded-lg bg-muted">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-12 w-12 text-primary" />
                    <p className="text-muted-foreground">
                      {canOpenMap ? 'Open the venue in Google Maps' : 'Exact map coordinates are not available yet'}
                    </p>
                    {canOpenMap && (
                      <Button variant="link" className="mt-2 gap-2" onClick={openGoogleMaps}>
                        <Navigation className="h-4 w-4" />
                        Open in Google Maps
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={openGoogleMaps} disabled={!canOpenMap}>
                    Get Directions
                  </Button>
                </div>
              </CardContent>
            </Card>

            {!!data.images.length && (
              <Card>
                <CardHeader>
                  <CardTitle>Venue Photos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    {data.images.map((image, index) => (
                      <div
                        key={`${image}-${index}`}
                        className="aspect-square rounded-lg bg-muted"
                        style={{
                          backgroundImage: `url(${image})`,
                          backgroundPosition: 'center',
                          backgroundSize: 'cover',
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{data.name}</CardTitle>
                <CardDescription>{data.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!!data.capacity && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">{data.capacity.toLocaleString()} attendees</p>
                    </div>
                  </div>
                )}

                {!!data.amenities.length && (
                  <div>
                    <h4 className="mb-3 font-medium">Amenities</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {data.amenities.map((amenity, index) => (
                        <div key={`${amenity.name}-${index}`} className="flex items-center gap-2 rounded-lg bg-muted/30 p-2">
                          <amenity.icon className="h-4 w-4 text-primary" />
                          <span className="text-sm">{amenity.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(data.website || data.phone) && (
                  <div className="border-t pt-4">
                    <h4 className="mb-2 font-medium">Contact</h4>
                    {data.website && (
                      <p className="text-sm">
                        <a href={data.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {data.website}
                        </a>
                      </p>
                    )}
                    {data.phone && (
                      <p className="text-sm">
                        <a href={`tel:${data.phone}`} className="text-primary hover:underline">
                          {data.phone}
                        </a>
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Tabs defaultValue="transport" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transport">Transportation</TabsTrigger>
                <TabsTrigger value="rules">Venue Rules</TabsTrigger>
              </TabsList>
              <TabsContent value="transport">
                <Card>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <h4 className="mb-2 font-medium">Parking</h4>
                      <p className="text-sm text-muted-foreground">{data.parking}</p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium">Public Transit</h4>
                      <p className="text-sm text-muted-foreground">{data.publicTransport}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="rules">
                <Card>
                  <CardContent className="pt-6">
                    {data.rules.length ? (
                      <ul className="space-y-2">
                        {data.rules.map((rule, index) => (
                          <li key={`${rule}-${index}`} className="flex items-start gap-2 text-sm">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span>{rule}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No additional venue rules have been published yet.</p>
                    )}
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
