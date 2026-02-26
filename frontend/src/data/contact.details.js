import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock,
  Globe,
  MessageSquare,
  ShieldCheck,
  Zap,
  Youtube,
  Facebook,
  Send,
  Music2,
  Terminal,
  HelpCircle,
  Briefcase,
  HeartHandshake,
  Code2,
} from "lucide-react";

/**
 * TICKETBRO - CENTRALIZED BRAND CONFIGURATION (V3.0.0)
 * The definitive single source of truth for all brand-related data.
 */

export const CONTACT_DETAILS = {
  // 1. BRAND CORE
  brand: {
    name: "Ticket",
    suffix: "Bro.",
    legalName: "TICKETBRO GLOBAL ENTERTAINMENT INC.",
    tagline: "The premier digital gateway for global entertainment.",
    description:
      "Empowering fans to secure their place at the world's most sought-after festivals, concerts, and exclusive experiences.",
    established: 2026,
    version: "3.0.0",
    status: "Production",
  },

  // 2. GEOGRAPHIC DATA
  office: {
    headquarters: "Baker Street Office",
    address: "221B Baker Street",
    area: "Marylebone",
    city: "London",
    postcode: "NW1 6XE",
    country: "United Kingdom",
    countryCode: "GB",
    fullAddress: "221B Baker Street, London NW1 6XE, United Kingdom",
    googleMapsLink: "https://goo.gl/maps/example",
    coordinates: { lat: 51.5237, lng: -0.1585 },
    icon: MapPin,
  },

  // 3. MULTI-CHANNEL COMMUNICATION
  communication: {
    // Specialized Email Departments
    emails: {
      primary: {
        address: "hi@sihab.dev",
        label: "General Inquiries",
        cta: "Email Us",
        icon: Mail,
      },
      support: {
        address: "support@ticketbro.com",
        label: "Help & Support",
        cta: "Get Help",
        icon: ShieldCheck,
      },
      partnership: {
        address: "partners@ticketbro.com",
        label: "Business Relations",
        cta: "Partner With Us",
        icon: HeartHandshake,
      },
      careers: {
        address: "talent@ticketbro.com",
        label: "Careers",
        cta: "Join the Team",
        icon: Briefcase,
      },
    },
    // Voice & Messaging
    phones: {
      main: {
        display: "+1.234.567.890",
        call: "+1234567890",
        label: "Global Support Line",
        icon: Phone,
      },
      whatsapp: {
        display: "WhatsApp Business",
        link: "https://wa.me/1234567890",
        label: "Chat with an Agent",
        icon: MessageSquare,
      },
    },
  },

  // 4. CATEGORIZED SOCIAL ECOSYSTEM
  // Grouped by use-case for easier mapping in different UI sections
  socials: [
    {
      id: "twitter",
      platform: "Twitter",
      href: "https://twitter.com/ticketbro",
      icon: Twitter,
      color: "#1DA1F2",
      group: "main",
    },
    {
      id: "instagram",
      platform: "Instagram",
      href: "https://instagram.com/ticketbro",
      icon: Instagram,
      color: "#E4405F",
      group: "main",
    },
    {
      id: "facebook",
      platform: "Facebook",
      href: "https://facebook.com/ticketbro",
      icon: Facebook,
      color: "#1877F2",
      group: "main",
    },
    {
      id: "linkedin",
      platform: "LinkedIn",
      href: "https://linkedin.com/company/ticketbro",
      icon: Linkedin,
      color: "#0A66C2",
      group: "professional",
    },
    {
      id: "github",
      platform: "Github",
      href: "https://github.com/ticketbro",
      icon: Github,
      color: "#181717",
      group: "dev",
    },
    {
      id: "youtube",
      platform: "YouTube",
      href: "https://youtube.com/ticketbro",
      icon: Youtube,
      color: "#FF0000",
      group: "content",
    },
    {
      id: "discord",
      platform: "Discord",
      href: "https://discord.gg/ticketbro",
      icon: MessageSquare,
      color: "#5865F2",
      group: "community",
    },
    {
      id: "tiktok",
      platform: "TikTok",
      href: "https://tiktok.com/@ticketbro",
      icon: Music2,
      color: "#000000",
      group: "content",
    },
    {
      id: "telegram",
      platform: "Telegram",
      href: "https://t.me/ticketbro",
      icon: Send,
      color: "#26A5E4",
      group: "community",
    },
  ],

  // 5. OPERATIONAL METRICS
  operations: {
    timezone: "Europe/London",
    availability: "24/7 Digital Platform",
    supportHours: {
      label: "Support Availability",
      icon: Clock,
      schedule: [
        {
          days: "Weekdays",
          hours: "09:00 - 18:00 (GMT)",
          status: "Full Support",
        },
        {
          days: "Weekends",
          hours: "10:00 - 14:00 (GMT)",
          status: "Emergency Only",
        },
      ],
    },
  },

  // 6. DEVELOPER & SYSTEM META
  meta: {
    author: "SIHAB • DEV",
    role: "Lead Architect",
    portfolio: "https://sihab.dev",
    github: "https://github.com/sihab-dev",
    lastMaintenance: "2026-01-26",
    license: "Proprietary",
    devStack: ["React", "Tailwind", "Lucide"],
    icon: Code2,
  },
};
