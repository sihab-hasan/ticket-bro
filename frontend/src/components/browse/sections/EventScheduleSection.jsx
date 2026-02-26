// frontend/src/components/events/sections/EventScheduleSection.jsx
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const EventScheduleSection = ({ schedule = [], event }) => {
  const [expandedDays, setExpandedDays] = useState([]);

  if (!schedule || schedule.length === 0) {
    // If no schedule provided, create a default one from event data
    const defaultSchedule = event ? [{
      date: event.date,
      doorsOpen: '1 hour before',
      startTime: new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: event.endDate ? new Date(event.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD',
      venue: event.venue,
      city: event.city,
      state: event.state,
      activities: [
        { time: 'Doors Open', description: 'Venue doors open for entry' },
        { time: 'Opening Act', description: 'Featured opening performance' },
        { time: 'Main Event', description: 'Main performance begins' },
      ]
    }] : [];
    
    if (defaultSchedule.length === 0) return null;
    schedule = defaultSchedule;
  }

  const toggleDay = (index) => {
    setExpandedDays(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Event Schedule</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plan your experience with our detailed event schedule. Times are subject to change.
          </p>
        </div>

        {/* Schedule Timeline */}
        <div className="max-w-4xl mx-auto">
          <Accordion type="multiple" className="space-y-4">
            {schedule.map((day, index) => (
              <AccordionItem
                key={index}
                value={`day-${index}`}
                className="border rounded-lg overflow-hidden bg-card"
              >
                {/* Day Header */}
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">
                          {new Date(day.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Doors open: {day.doorsOpen}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{day.startTime} - {day.endTime}</span>
                      </div>
                      <Badge variant="outline" className="ml-auto sm:ml-0">
                        {day.activities?.length || 0} events
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>

                {/* Day Content */}
                <AccordionContent className="px-6 pb-6">
                  {/* Venue Info */}
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{day.venue}</p>
                        <p className="text-sm text-muted-foreground">
                          {day.city}, {day.state} {day.zipCode}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

                    {/* Activities */}
                    <div className="space-y-6">
                      {day.activities?.map((activity, actIndex) => (
                        <div key={actIndex} className="relative pl-12">
                          {/* Timeline dot */}
                          <div className="absolute left-[14px] top-1.5 w-2 h-2 rounded-full bg-primary ring-4 ring-background" />
                          
                          {/* Time */}
                          <div className="mb-1">
                            <span className="text-sm font-semibold text-primary">
                              {activity.time}
                            </span>
                          </div>
                          
                          {/* Description */}
                          <div className="bg-muted/30 rounded-lg p-4">
                            <p className="font-medium mb-1">{activity.title || 'Performance'}</p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            
                            {/* Additional details if available */}
                            {activity.artist && (
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Artist:</span>
                                <span className="font-medium">{activity.artist}</span>
                              </div>
                            )}
                            
                            {activity.location && (
                              <div className="mt-1 flex items-center gap-2 text-sm">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{activity.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {day.notes && (
                    <div className="mt-6 p-4 bg-primary/5 rounded-lg text-sm">
                      <p className="font-medium mb-1">Additional Information:</p>
                      <p className="text-muted-foreground">{day.notes}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Schedule Notes */}
          <div className="mt-8 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              All times are in local timezone. Schedule subject to change without notice.
            </p>
          </div>
        </div>

        {/* Add to Calendar Button */}
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="gap-2">
            <Calendar className="h-4 w-4" />
            Add to Calendar
          </Button>
        </div>
      </div>
    </section>
  );
};

export default EventScheduleSection;