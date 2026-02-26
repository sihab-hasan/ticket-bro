import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
const OrganizerCard = ({ organizer }) => {
  return (
    <Card className="w-full max-w-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex items-center gap-3">
        <Avatar src={organizer.avatar} alt={organizer.name} size="lg" />
        <div>
          <h4 className="text-md font-semibold">{organizer.name}</h4>
          <p className="text-sm text-muted-foreground">{organizer.eventsCount} Events</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{organizer.bio}</p>
      </CardContent>
    </Card>
  );
};

export default OrganizerCard;