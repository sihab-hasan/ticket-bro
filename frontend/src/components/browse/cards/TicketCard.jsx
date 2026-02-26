import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const TicketCard = ({ ticket }) => (
  <Card className="hover:shadow-lg transition-shadow duration-200">
    <CardHeader>
      <CardTitle>{ticket.name}</CardTitle>
      <CardDescription>{ticket.type}</CardDescription>
    </CardHeader>
    <CardContent>
      <p>Price: ${ticket.price}</p>
      <p>Available: {ticket.available}</p>
    </CardContent>
    <div className="p-4">
      <Button size="sm">Book Ticket</Button>
    </div>
  </Card>
);

export default TicketCard;