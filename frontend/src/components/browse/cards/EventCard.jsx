import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "../utils/formatters";

const EventCard = ({ event }) => {
  return (
    <Card className="w-full max-w-sm shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="p-0">
        <img src={event.image} alt={event.title} className="w-full h-48 object-cover rounded-t-md" />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold">{event.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{formatDate(event.date)}</p>
        <div className="flex gap-2 mt-2">
          {event.tags?.map((tag) => (
            <Badge key={tag} variant="outline">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="font-bold text-primary">${event.price}</span>
        <Button size="sm" variant="secondary">Book</Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;