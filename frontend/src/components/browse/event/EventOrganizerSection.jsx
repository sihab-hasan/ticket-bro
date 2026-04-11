import React from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck, Calendar, Facebook, Globe, Instagram,
  Mail, MessageSquare, Phone, Star, Twitter, Users, Youtube,
} from "lucide-react";
import { AvatarCircle, SectionHeading } from "./shared/EventShared.jsx";
import { useAuth } from "@/context/AuthContext";
import { ROUTES } from "@/app/AppRoutes";

const SOCIAL_LINKS = [
  { key: "instagram", icon: Instagram, baseUrl: "https://instagram.com/" },
  { key: "facebook",  icon: Facebook,  baseUrl: "https://facebook.com/" },
  { key: "twitter",   icon: Twitter,   baseUrl: "https://twitter.com/"  },
  { key: "youtube",   icon: Youtube,   baseUrl: "https://youtube.com/"  },
];

const normalizeSocialHref = (value, baseUrl) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl}${value}`;
};

const EventOrganizerSection = ({ event }) => {
  const { isAuthenticated, user } = useAuth();

  // event.organizerProfile and event.organizer are merged by normalizeEvent → normalizeOrganizer
  // After normalization: organizer.userId = the User account _id (safe for chat routing)
  const organizer = event.organizerProfile || event.organizer;
  if (!organizer) return null;

  const currentUserId = user?._id || user?.id;
  const name    = organizer.name || organizer.displayName || organizer.username || "Organizer";
  const initial = (name[0] || "O").toUpperCase();

  const stats = [
    { icon: Calendar, label: "Events",    value: organizer.totalEvents || 0 },
    { icon: Users,    label: "Attendees", value: Number(organizer.totalAttendees || 0).toLocaleString() },
    { icon: Star,     label: "Rating",    value: Number(organizer.averageRating || organizer.rating || 0).toFixed(1) },
  ];

  const socials = organizer.socials || organizer.socialLinks || {};

  // userId = the organizer's User account _id — added by normalizeOrganizer
  // Falls back to reading from organizer.user (if raw, un-normalized data arrives)
  const organizerUserId =
    organizer.userId ||
    organizer.user?._id ||
    organizer.user?.id ||
    (typeof organizer.user === "string" ? organizer.user : null);

  const eventId = event._id || event.id || null;

  // Don't show chat button if viewing your own event
  const isSelf = currentUserId && organizerUserId &&
    String(currentUserId) === String(organizerUserId);

  const chatHref = organizerUserId
    ? `${ROUTES.MESSAGES.CHAT(organizerUserId)}${eventId ? `?eventId=${eventId}` : ""}`
    : null;

  return (
    <div className="flex flex-col gap-5">
      <SectionHeading>Organizer</SectionHeading>

      <div
        className="flex flex-col gap-4 rounded-2xl border border-border p-5"
        style={{ background: "var(--card)" }}
      >
        {/* ── Avatar + Name + Stats ── */}
        <div className="flex items-start gap-3">
          {organizer.avatar ? (
            <img
              src={organizer.avatar}
              alt={name}
              className="h-12 w-12 rounded-full border border-border object-cover shrink-0"
            />
          ) : (
            <AvatarCircle initial={initial} size={3} className="!h-12 !w-12 !text-[18px] shrink-0" />
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-base font-bold text-foreground" style={{ fontFamily: "var(--font-heading)" }}>
                {name}
              </p>
              {organizer.isVerified && <BadgeCheck size={15} className="text-foreground shrink-0" />}
            </div>
            {organizer.isVerified && (
              <span
                className="mt-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-green-700"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <BadgeCheck size={11} />
                Trusted Organizer
              </span>
            )}
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
              {stats.map(({ label, value }) => (
                <span key={label}>{value} {label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bio ── */}
        {organizer.bio && (
          <p className="text-xs leading-relaxed text-muted-foreground" style={{ fontFamily: "var(--font-sans)" }}>
            {organizer.bio}
          </p>
        )}

        {/* ── Contact links ── */}
        {(organizer.website || organizer.email || organizer.phone) && (
          <div className="flex flex-wrap gap-3">
            {organizer.website && (
              <a href={organizer.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Globe size={12} />
                {organizer.website.replace(/https?:\/\//, "")}
              </a>
            )}
            {organizer.email && (
              <a href={`mailto:${organizer.email}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Mail size={12} />
                {organizer.email}
              </a>
            )}
            {organizer.phone && (
              <a href={`tel:${organizer.phone}`}
                className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                style={{ fontFamily: "var(--font-sans)" }}>
                <Phone size={12} />
                {organizer.phone}
              </a>
            )}
          </div>
        )}

        {/* ── Footer: socials + Message button ── */}
        <div className="flex items-center gap-3 border-t border-border pt-3 flex-wrap">
          {SOCIAL_LINKS.map(({ key, icon: Icon, baseUrl }) => {
            const href = normalizeSocialHref(socials[key], baseUrl);
            if (!href) return null;
            return (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground" aria-label={key}>
                <Icon size={15} />
              </a>
            );
          })}

          {/* ── Message Organizer CTA ── */}
          {!isSelf && chatHref && (
            isAuthenticated ? (
              <Link
                to={chatHref}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/15 hover:border-primary/70"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <MessageSquare size={13} />
                Message Organizer
              </Link>
            ) : (
              <Link
                to={`/?auth=login`}
                className="ml-auto flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:border-foreground/30"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <MessageSquare size={13} />
                Sign in to message
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventOrganizerSection;
