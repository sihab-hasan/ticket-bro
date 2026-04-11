import React from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, Users, CalendarDays } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OrganizerCard = ({ organizer, variant = "card", onFollow, className }) => {
  const initials = (organizer.name ?? "OG")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const href = organizer.slug ? `/organizer/${organizer.slug}` : "#";

  if (variant === "compact") {
    return (
      <Link
        to={href}
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border bg-card hover:border-foreground/20 hover:shadow-sm transition-all group",
          className
        )}
      >
        <Avatar size="lg" className="shrink-0">
          <AvatarImage src={organizer.avatar} alt={organizer.name} />
          <AvatarFallback className="text-sm font-bold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
            {organizer.name}
            {organizer.isVerified && <BadgeCheck className="size-3.5 text-foreground shrink-0" />}
          </p>
          {organizer.isVerified && (
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-700">
              <BadgeCheck className="size-3" />
              Trusted Organizer
            </span>
          )}
          <p className="text-xs text-muted-foreground">{organizer.eventCount ?? 0} events</p>
        </div>
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col rounded-xl border bg-card overflow-hidden", className)}>
      {/* Cover */}
      <div className="relative h-20 bg-secondary overflow-hidden">
        {organizer.cover && (
          <img src={organizer.cover} alt="" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Avatar row */}
      <div className="px-4 pb-4">
        <div className="flex items-end justify-between -mt-5 mb-3">
          <Avatar className="size-14 ring-2 ring-background shrink-0">
            <AvatarImage src={organizer.avatar} alt={organizer.name} />
            <AvatarFallback className="text-lg font-bold">{initials}</AvatarFallback>
          </Avatar>
          {onFollow && (
            <Button
              variant={organizer.isFollowing ? "secondary" : "outline"}
              size="sm"
              onClick={(e) => { e.preventDefault(); onFollow(organizer); }}
              className="text-xs h-7"
            >
              {organizer.isFollowing ? "Following" : "Follow"}
            </Button>
          )}
        </div>

        <Link to={href} className="hover:underline">
          <h3
            className="text-sm font-bold text-foreground flex items-center gap-1 leading-none"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {organizer.name}
            {organizer.isVerified && <BadgeCheck className="size-3.5 shrink-0" />}
          </h3>
        </Link>
        {organizer.isVerified && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-700">
            <BadgeCheck className="size-3" />
            Trusted Organizer
          </span>
        )}

        {organizer.bio && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{organizer.bio}</p>
        )}

        <div className="flex items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />{organizer.eventCount ?? 0} events
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3" />{organizer.followerCount ?? 0} followers
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrganizerCard;
