import React from "react";
import {
  BadgeCheck,
  Calendar,
  Facebook,
  Globe,
  Instagram,
  Mail,
  Phone,
  Star,
  Twitter,
  Users,
  Youtube,
} from "lucide-react";
import { AvatarCircle, SectionHeading } from "./shared/EventShared.jsx";

const SOCIAL_LINKS = [
  { key: "instagram", icon: Instagram, baseUrl: "https://instagram.com/" },
  { key: "facebook", icon: Facebook, baseUrl: "https://facebook.com/" },
  { key: "twitter", icon: Twitter, baseUrl: "https://twitter.com/" },
  { key: "youtube", icon: Youtube, baseUrl: "https://youtube.com/" },
];

const normalizeSocialHref = (value, baseUrl) => {
  if (!value) {
    return null;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${baseUrl}${value}`;
};

const EventOrganizerSection = ({ event }) => {
  const organizer = event.organizerProfile || event.organizer;
  if (!organizer) {
    return null;
  }

  const name = organizer.name || organizer.username || "Organizer";
  const avatar = (name[0] || "O").toUpperCase();
  const stats = [
    { icon: Calendar, label: "Events", value: organizer.totalEvents || 0 },
    {
      icon: Users,
      label: "Attendees",
      value: Number(organizer.totalAttendees || 0).toLocaleString(),
    },
    {
      icon: Star,
      label: "Rating",
      value: Number(organizer.averageRating || organizer.rating || 0).toFixed(1),
    },
  ];

  const socials = organizer.socials || organizer.socialLinks || {};

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading>Organizer</SectionHeading>

      <div
        className="flex flex-col gap-4 rounded-2xl border border-border p-5"
        style={{ background: "var(--card)" }}
      >
        <div className="flex items-start gap-3">
          {organizer.avatar ? (
            <img
              src={organizer.avatar}
              alt={name}
              className="h-12 w-12 rounded-full border border-border object-cover"
            />
          ) : (
            <AvatarCircle
              initial={avatar}
              size={3}
              className="!h-12 !w-12 !text-[18px]"
            />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p
                className="text-base font-bold text-foreground"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {name}
              </p>
              {organizer.isVerified && (
                <BadgeCheck size={15} className="text-foreground" />
              )}
            </div>

            <div
              className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {stats.map(({ label, value }) => (
                <span key={label}>
                  {value} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {organizer.bio && (
          <p
            className="text-xs leading-relaxed text-muted-foreground"
            style={{ fontFamily: "var(--font-sans)" }}
          >
            {organizer.bio}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          {organizer.website && (
            <a
              href={organizer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <Globe size={12} />
              {organizer.website.replace(/https?:\/\//, "")}
            </a>
          )}
          {organizer.email && (
            <a
              href={`mailto:${organizer.email}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <Mail size={12} />
              {organizer.email}
            </a>
          )}
          {organizer.phone && (
            <a
              href={`tel:${organizer.phone}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              <Phone size={12} />
              {organizer.phone}
            </a>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border pt-3">
          {SOCIAL_LINKS.map(({ key, icon: Icon, baseUrl }) => {
            const href = normalizeSocialHref(socials[key], baseUrl);
            if (!href) {
              return null;
            }

            return (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={key}
              >
                <Icon size={15} />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EventOrganizerSection;
