import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  AlertCircle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const EventDetailCard = ({ eventDetail, onSelect }) => {
  const [isSelected, setIsSelected] = useState(false);

  const {
    id,
    title,
    date,
    startTime,
    endTime,
    venue,
    availableSeats,
    totalSeats,
    price,
    isSoldOut,
    isCancelled,
    status
  } = eventDetail;

  // Calculate availability percentage
  const availabilityPercentage = (availableSeats / totalSeats) * 100;
  
  // Determine availability status
  const getAvailabilityStatus = () => {
    if (isSoldOut) return { label: 'Sold Out', color: 'destructive', icon: XCircle };
    if (isCancelled) return { label: 'Cancelled', color: 'destructive', icon: AlertCircle };
    if (availableSeats < 10) return { label: 'Almost Gone', color: 'warning', icon: AlertCircle };
    if (availableSeats < 30) return { label: 'Limited Seats', color: 'warning', icon: AlertCircle };
    return { label: 'Available', color: 'success', icon: CheckCircle2 };
  };

  const availability = getAvailabilityStatus();
  const AvailabilityIcon = availability.icon;

  const handleSelect = () => {
    setIsSelected(!isSelected);
    onSelect?.(id, !isSelected);
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-300",
      isSelected && "ring-2 ring-primary",
      isSoldOut || isCancelled ? "opacity-75" : "hover:shadow-lg"
    )}>
      <CardHeader className="bg-muted/50 p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-heading font-semibold">{title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>
          
          {/* Status Badge */}
          <Badge variant={availability.color === 'destructive' ? 'destructive' : 'secondary'}>
            <AvailabilityIcon className="w-3 h-3 mr-1" />
            {availability.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Time Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              <span>{startTime} - {endTime}</span>
            </div>
          </div>
          <Badge variant="outline">${price}</Badge>
        </div>

        {/* Venue */}
        <div className="flex items-start text-sm">
          <MapPin className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-muted-foreground" />
          <div>
            <p className="font-medium">{venue?.name}</p>
            <p className="text-muted-foreground">{venue?.address}</p>
          </div>
        </div>

        {/* Availability Progress */}
        {!isSoldOut && !isCancelled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                <span>{availableSeats} seats available</span>
              </div>
              <span className="text-muted-foreground">of {totalSeats}</span>
            </div>
            <Progress 
              value={availabilityPercentage} 
              className={cn(
                "h-2",
                availabilityPercentage < 20 ? "bg-destructive/20" : "bg-muted"
              )}
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          variant={isSoldOut || isCancelled ? "outline" : "default"}
          disabled={isSoldOut || isCancelled}
          onClick={handleSelect}
        >
          {isSoldOut ? (
            'Sold Out'
          ) : isCancelled ? (
            'Cancelled'
          ) : isSelected ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Selected
            </>
          ) : (
            <>
              <Ticket className="w-4 h-4 mr-2" />
              Select Tickets
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventDetailCard;