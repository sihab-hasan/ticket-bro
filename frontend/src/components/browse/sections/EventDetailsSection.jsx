// frontend/src/components/events/sections/EventDetailsSection.jsx
import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  AlertCircle,
  CheckCircle,
  Music,
  Ticket,
  DollarSign,
  Globe,
  Phone,
  Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const EventDetailsSection = ({ event }) => {
  // Mock event data
  const mockEvent = {
    title: 'Taylor Swift: The Eras Tour',
    description: 'Taylor Swift brings her record-breaking Eras Tour to stadiums across the country. Experience hits from all her musical eras in one spectacular show.',
    longDescription: 'The Eras Tour is the ongoing sixth concert tour by American singer-songwriter Taylor Swift. It is her second all-stadium tour after the Reputation Stadium Tour (2018). The tour celebrates Swift\'s entire discography, with the set list divided into acts representing each of her ten studio albums. The show features elaborate production, multiple costume changes, and special effects.',
    date: '2024-06-15T19:30:00',
    endDate: '2024-06-15T23:00:00',
    doorsOpen: '18:30',
    venue: 'MetLife Stadium',
    address: '1 MetLife Stadium Dr',
    city: 'East Rutherford',
    state: 'NJ',
    zipCode: '07073',
    country: 'USA',
    capacity: 82500,
    expectedAttendance: 72000,
    ageRestriction: 'All ages',
    parking: 'Available on-site ($40)',
    accessibility: 'Wheelchair accessible venues available',
    refundPolicy: 'Tickets are non-refundable except for cancelled events',
    organizer: 'Live Nation',
    organizerContact: {
      email: 'support@livenation.com',
      phone: '+1 (800) 123-4567',
      website: 'https://www.livenation.com'
    },
    tags: ['pop', 'concert', 'stadium', 'family-friendly'],
    categories: ['Music', 'Concert'],
    performers: [
      { name: 'Taylor Swift', role: 'Main Performer' },
      { name: 'Paramore', role: 'Opening Act' }
    ]
  };

  const data = event || mockEvent;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {data.description}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {data.longDescription}
              </p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {data.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Performers */}
            {data.performers && (
              <div>
                <h3 className="font-semibold mb-3">Performers</h3>
                <div className="space-y-3">
                  {data.performers.map((performer, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Music className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Age Restriction</h4>
                <p className="text-sm text-muted-foreground">{data.ageRestriction}</p>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Parking</h4>
                <p className="text-sm text-muted-foreground">{data.parking}</p>
              </div>
            </div>

            {/* Accessibility */}
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Accessibility
              </h4>
              <p className="text-sm text-muted-foreground">{data.accessibility}</p>
            </div>

            {/* Refund Policy */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                Refund Policy
              </h4>
              <p className="text-sm text-muted-foreground">{data.refundPolicy}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Info Card */}
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg">Event Information</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(data.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                        {data.endDate && ` - ${new Date(data.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Doors open: {data.doorsOpen}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-sm font-medium">{data.venue}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.address}<br />
                        {data.city}, {data.state} {data.zipCode}<br />
                        {data.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        {data.capacity.toLocaleString()} · {data.expectedAttendance.toLocaleString()} expected
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Organized by</h3>
                <p className="font-medium mb-2">{data.organizer}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a href={data.organizerContact.website} className="text-primary hover:underline">
                      Visit Website
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${data.organizerContact.email}`} className="text-primary hover:underline">
                      {data.organizerContact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${data.organizerContact.phone}`} className="text-primary hover:underline">
                      {data.organizerContact.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Share Event */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold mb-3">Share This Event</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Copy Link
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;