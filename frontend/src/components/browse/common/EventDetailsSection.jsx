import React from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Globe,
  Info,
  Mail,
  MapPin,
  Music,
  Phone,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const formatDate = (value, options) => {
  if (!value) return 'TBA';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'TBA' : date.toLocaleString('en-US', options);
};

const EventDetailsSection = ({ event = {} }) => {
  const tags = event.tags || event.keywords || [];
  const performers = event.performers || event.lineup || [];
  const organizer = event.organizer?.displayName || event.organizer?.name || event.organizerName || 'Organizer details coming soon';
  const contact = event.organizerContact || {
    website: event.organizer?.website,
    email: event.organizer?.email,
    phone: event.organizer?.phone,
  };

  return (
    <section className="bg-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold">About This Event</h2>
              <p className="mb-4 leading-relaxed text-muted-foreground">{event.description || 'Detailed event information will appear here once the organizer adds it.'}</p>
              {event.longDescription && (
                <p className="leading-relaxed text-muted-foreground">{event.longDescription}</p>
              )}
            </div>

            {!!tags.length && (
              <div>
                <h3 className="mb-3 font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={`${tag}-${index}`} variant="secondary" className="px-3 py-1">
                      {typeof tag === 'string' ? tag : tag.name || tag.slug || 'tag'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {!!performers.length && (
              <div>
                <h3 className="mb-3 font-semibold">Performers</h3>
                <div className="space-y-3">
                  {performers.map((performer, index) => (
                    <div key={performer.id || performer._id || `${performer.name}-${index}`} className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                      <Music className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{performer.name || performer.title || 'Performer'}</p>
                        {performer.role && <p className="text-sm text-muted-foreground">{performer.role}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="mb-2 font-medium">Age Restriction</h4>
                <p className="text-sm text-muted-foreground">{event.ageRestriction || 'See organizer terms for age guidance.'}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-4">
                <h4 className="mb-2 font-medium">Parking</h4>
                <p className="text-sm text-muted-foreground">{event.parking || 'Parking information is not available.'}</p>
              </div>
            </div>

            <div className="rounded-lg bg-primary/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <CheckCircle className="h-5 w-5 text-primary" /> Accessibility
              </h4>
              <p className="text-sm text-muted-foreground">{event.accessibility || 'Please contact the organizer for accessibility support.'}</p>
            </div>

            <div className="rounded-lg bg-muted/30 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-medium">
                <Info className="h-5 w-5 text-muted-foreground" /> Refund Policy
              </h4>
              <p className="text-sm text-muted-foreground">{event.refundPolicy || 'Refund policy has not been published for this event.'}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="space-y-4 rounded-xl bg-muted/30 p-6">
                <h3 className="text-lg font-semibold">Event Information</h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">{formatDate(event.startDate || event.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(event.startDate || event.date, { hour: '2-digit', minute: '2-digit' })}
                        {event.endDate ? ` - ${formatDate(event.endDate, { hour: '2-digit', minute: '2-digit' })}` : ''}
                      </p>
                      {event.doorsOpen && <p className="mt-1 text-xs text-muted-foreground">Doors open: {event.doorsOpen}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium">Venue</p>
                      <p className="text-sm font-medium">{event.venueName || event.location?.name || 'Venue TBA'}</p>
                      <p className="text-sm text-muted-foreground">{[event.location?.address, event.location?.city, event.location?.country].filter(Boolean).join(', ') || 'Venue details will be announced soon.'}</p>
                    </div>
                  </div>

                  {(event.totalCapacity || event.capacity || event.expectedAttendance) && (
                    <div className="flex items-start gap-3">
                      <Users className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-sm text-muted-foreground">
                          {[event.totalCapacity || event.capacity, event.expectedAttendance ? `${event.expectedAttendance} expected` : null]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-muted/30 p-6">
                <h3 className="mb-4 font-semibold">Organized by</h3>
                <p className="mb-2 font-medium">{organizer}</p>
                <div className="space-y-2 text-sm">
                  {contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={contact.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Visit Website</a>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
                    </div>
                  )}
                  {!contact.website && !contact.email && !contact.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      <span>Organizer contact details are not available.</span>
                    </div>
                  )}
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
