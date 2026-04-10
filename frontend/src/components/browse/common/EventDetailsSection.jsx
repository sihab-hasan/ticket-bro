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
  if (!event) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Event not found</p>
        </div>
      </section>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationString = (loc) => {
    if (!loc) return 'TBA';
    if (loc.type === 'online') return 'Online Event';
    if (loc.type === 'hybrid') return `${loc.name || 'Venue'} + Online`;
    return loc.name || loc.city || 'TBA';
  };

  const getFullAddress = (loc) => {
    if (!loc || loc.type === 'online') return null;
    const parts = [loc.address, loc.city, loc.state, loc.country].filter(Boolean);
    return parts.join(', ');
  };

  const ageLabels = {
    all: 'All Ages',
    teen: '13+',
    adult: '18+'
  };

  const data = {
    title: event.title || 'Untitled Event',
    description: event.description || event.shortDescription || '',
    longDescription: event.description || '',
    date: event.startDate,
    endDate: event.endDate,
    doorsOpen: event.doorsOpen,
    venue: event.location?.name || '',
    address: event.location?.address || '',
    city: event.location?.city || '',
    state: event.location?.state || '',
    zipCode: event.location?.zip || '',
    country: event.location?.country || '',
    capacity: event.totalCapacity || 0,
    expectedAttendance: event.totalSold || 0,
    ageRestriction: ageLabels[event.ageRestriction] || 'All Ages',
    parking: null,
    accessibility: event.accessibilityInfo || null,
    refundPolicy: event.refundPolicy?.allowRefunds 
      ? `Refunds available up to ${event.refundPolicy.cutoffHours} hours before event`
      : 'Tickets are non-refundable',
    organizer: event.organizer?.displayName || event.organizer?.name || 'Unknown Organizer',
    organizerContact: {
      email: event.organizer?.email || '',
      phone: event.organizer?.phone || '',
      website: event.organizer?.website || ''
    },
    tags: event.tags?.map(t => typeof t === 'string' ? t : t.name) || [],
    categories: [event.category?.name, event.subcategory?.name].filter(Boolean),
    performers: event.agenda?.filter(a => a.isFeatured).map(a => ({
      name: a.title,
      role: a.sessionType || 'Performer'
    })) || []
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {data.description || 'No description available'}
              </p>
            </div>

            {/* Tags */}
            {data.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {data.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Performers */}
            {data.performers.length > 0 && (
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
              {data.capacity > 0 && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">Capacity</h4>
                  <p className="text-sm text-muted-foreground">{data.capacity.toLocaleString()} attendees</p>
                </div>
              )}
            </div>

            {/* Accessibility */}
            {data.accessibility && (
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Accessibility
                </h4>
                <p className="text-sm text-muted-foreground">{data.accessibility}</p>
              </div>
            )}

            {/* Refund Policy */}
            {event.refundPolicy && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Refund Policy
                </h4>
                <p className="text-sm text-muted-foreground">{data.refundPolicy}</p>
                {event.refundPolicy.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{event.refundPolicy.notes}</p>
                )}
              </div>
            )}

            {/* Terms and Conditions */}
            {event.termsAndConditions && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Info className="h-5 w-5 text-muted-foreground" />
                  Terms & Conditions
                </h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.termsAndConditions}</p>
              </div>
            )}

            {/* Dress Code */}
            {event.dressCode && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Dress Code</h4>
                <p className="text-sm text-muted-foreground">{event.dressCode}</p>
              </div>
            )}
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
                        {formatDate(data.date)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(data.date)} {data.endDate && ` - ${formatTime(data.endDate)}`}
                      </p>
                    </div>
                  </div>
                  
                  {data.doorsOpen && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Doors Open</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(data.doorsOpen)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {getLocationString(event.location)}
                      </p>
                      {getFullAddress(event.location) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {getFullAddress(event.location)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {event.isFree !== undefined && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">Price</p>
                        <p className="text-sm text-muted-foreground">
                          {event.isFree ? 'Free' : `${event.currency || 'BDT'} ${event.minPrice || 0} - ${event.maxPrice || 0}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Organizer Contact */}
              {(data.organizerContact.email || data.organizerContact.phone || data.organizerContact.website) && (
                <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                  <h3 className="font-semibold text-lg">Organizer Contact</h3>
                  
                  <div className="space-y-3">
                    {data.organizerContact.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${data.organizerContact.email}`} className="text-sm text-primary hover:underline">
                          {data.organizerContact.email}
                        </a>
                      </div>
                    )}
                    
                    {data.organizerContact.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${data.organizerContact.phone}`} className="text-sm text-primary hover:underline">
                          {data.organizerContact.phone}
                        </a>
                      </div>
                    )}
                    
                    {data.organizerContact.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={data.organizerContact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {data.organizerContact.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
