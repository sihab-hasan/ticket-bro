// frontend/src/components/events/sections/RelatedEventsSection.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ChevronRight,
  Star,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const RelatedEventsSection = ({ currentEventId, events = [], title = "You Might Also Like" }) => {
  // Mock related events
  const mockEvents = [
    {
      id: 2,
      title: 'Ed Sheeran: Mathematics Tour',
      slug: 'ed-sheeran-mathematics-tour-2024',
      date: '2024-07-20',
      venue: 'Madison Square Garden',
      city: 'New York',
      price: 149.99,
      image: '/images/events/ed-sheeran.jpg',
      category: 'Concert',
      rating: 4.8
    },
    {
      id: 3,
      title: 'Beyoncé: Renaissance World Tour',
      slug: 'beyonce-renaissance-tour-2024',
      date: '2024-08-10',
      venue: 'SoFi Stadium',
      city: 'Los Angeles',
      price: 299.99,
      image: '/images/events/beyonce.jpg',
      category: 'Concert',
      rating: 5.0
    },
    {
      id: 4,
      title: 'Hamilton - Broadway',
      slug: 'hamilton-broadway-2024',
      date: '2024-09-01',
      venue: 'Richard Rodgers Theatre',
      city: 'New York',
      price: 199.99,
      image: '/images/events/hamilton.jpg',
      category: 'Theater',
      rating: 4.9
    },
    {
      id: 5,
      title: 'NBA Finals: Game 7',
      slug: 'nba-finals-game-7-2024',
      date: '2024-06-05',
      venue: 'TD Garden',
      city: 'Boston',
      price: 399.99,
      image: '/images/events/nba-finals.jpg',
      category: 'Sports',
      rating: 4.9
    }
  ];

  const displayEvents = events.length > 0 ? events : mockEvents;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">
              Discover more events you might enjoy
            </p>
          </div>
          <Button variant="ghost" className="gap-2" asChild>
            <Link to="/events">
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayEvents.map((event) => (
            <Link key={event.id} to={`/events/${event.slug}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3">
                    {event.category}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-background/80 hover:bg-background"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add to wishlist
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2 line-clamp-1 group-hover:text-primary ">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0" />
                      <span>{new Date(event.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">{event.venue}, {event.city}</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <span className="font-bold text-lg">${event.price}</span>
                        <span className="text-xs text-muted-foreground">+</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{event.rating}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedEventsSection;