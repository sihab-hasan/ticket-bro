'use strict';

const path = require('path');
const dns = require('node:dns');

process.chdir(path.resolve(__dirname, '..'));
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');

const { connectDB, disconnectDB } = require('../src/config/db.config');
const { hashPassword } = require('../src/common/utils/encryption');
const { ROLES } = require('../src/common/constants/roles');

const User = require('../src/modules/users/user.model');
const Organizer = require('../src/modules/organizers/organizer.model');
const Category = require('../src/modules/categories/category.model');
const Subcategory = require('../src/modules/subcategories/subcategory.model');
const EventType = require('../src/modules/eventTypes/eventTypes.model');
const Tag = require('../src/modules/tags/tag.model');
const Event = require('../src/modules/events/event.model');
const TicketType = require('../src/modules/tickets/ticketType.model');
const Booking = require('../src/modules/bookings/booking.model');
const Payment = require('../src/modules/payments/payment.model');
const Ticket = require('../src/modules/tickets/ticket.model');
const Review = require('../src/modules/reviews/review.model');
const Promotion = require('../src/modules/promotions/promotion.model');
const Report = require('../src/modules/reports/report.model');
const AuditLog = require('../src/modules/auditLogs/audit.model');
const Payout = require('../src/modules/payouts/payout.model');
const RefreshToken = require('../src/infrastructure/tokens/tokens');
const SystemSetting = require('../src/modules/systemSettings/systemSetting.model');

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Passw0rd!123';
const DEFAULT_CURRENCY = 'BDT';
const SEED_MARKER = '[seed]';

const USER_BLUEPRINTS = [
  {
    key: 'superAdmin',
    firstName: 'Amina',
    lastName: 'Rahman',
    email: 'super.admin@ticketbro.dev',
    role: ROLES.SUPER_ADMIN,
    bio: 'Platform governance, security oversight, and system control.',
    phone: '+8801700000001',
  },
  {
    key: 'admin',
    firstName: 'Nayeem',
    lastName: 'Hasan',
    email: 'admin.ops@ticketbro.dev',
    role: ROLES.ADMIN,
    bio: 'Operations lead handling organizers, payments, and platform settings.',
    phone: '+8801700000002',
  },
  {
    key: 'moderator',
    firstName: 'Farah',
    lastName: 'Kabir',
    email: 'moderator.guard@ticketbro.dev',
    role: ROLES.MODERATOR,
    bio: 'Trust and safety moderator for event and user reports.',
    phone: '+8801700000003',
  },
  {
    key: 'organizerPulse',
    firstName: 'Imran',
    lastName: 'Sarker',
    email: 'organizer.pulse@ticketbro.dev',
    role: ROLES.ORGANIZER,
    bio: 'Runs flagship city-scale nightlife and cultural events.',
    phone: '+8801700000004',
  },
  {
    key: 'organizerCityLights',
    firstName: 'Maliha',
    lastName: 'Noor',
    email: 'organizer.citylights@ticketbro.dev',
    role: ROLES.ORGANIZER,
    bio: 'Curates leadership summits and modern online workshop series.',
    phone: '+8801700000005',
  },
  {
    key: 'organizerRising',
    firstName: 'Sabbir',
    lastName: 'Ahmed',
    email: 'organizer.rising@ticketbro.dev',
    role: ROLES.ORGANIZER,
    bio: 'An emerging startup-community organizer awaiting approval.',
    phone: '+8801700000006',
  },
  {
    key: 'attendeeSadia',
    firstName: 'Sadia',
    lastName: 'Islam',
    email: 'attendee.sadia@ticketbro.dev',
    role: ROLES.USER,
    bio: 'Frequent attendee who books workshops, food events, and concerts.',
    phone: '+8801700000007',
  },
  {
    key: 'attendeeRahim',
    firstName: 'Rahim',
    lastName: 'Uddin',
    email: 'attendee.rahim@ticketbro.dev',
    role: ROLES.USER,
    bio: 'Power user who attends business events and leaves reviews.',
    phone: '+8801700000008',
  },
  {
    key: 'suspendedMember',
    firstName: 'Tariq',
    lastName: 'Mahmud',
    email: 'member.suspended@ticketbro.dev',
    role: ROLES.USER,
    status: 'suspended',
    statusReason: 'Repeated spam reports from other attendees.',
    bio: 'Suspended test member for moderation and admin dashboards.',
    phone: '+8801700000009',
  },
  {
    key: 'bannedMember',
    firstName: 'Reza',
    lastName: 'Karim',
    email: 'member.banned@ticketbro.dev',
    role: ROLES.USER,
    status: 'banned',
    statusReason: 'Confirmed fraudulent payment activity.',
    bio: 'Banned test member for security alert coverage.',
    phone: '+8801700000010',
  },
];

const ORGANIZER_BLUEPRINTS = [
  {
    key: 'pulse',
    userKey: 'organizerPulse',
    displayName: 'Pulse Live Events',
    bio: 'Large-format music, nightlife, and festival experiences across Dhaka.',
    website: 'https://pulselive.example.com',
    email: 'hello@pulselive.example.com',
    phone: '+8801888000001',
    verificationStatus: 'verified',
    verifiedAt: new Date('2026-02-10T12:00:00+06:00'),
    socialLinks: {
      facebook: 'https://facebook.com/pulseliveevents',
      instagram: 'https://instagram.com/pulseliveevents',
      twitter: 'https://x.com/pulseliveevents',
      youtube: 'https://youtube.com/@pulseliveevents',
    },
    logo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=320&q=80',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
  },
  {
    key: 'cityLights',
    userKey: 'organizerCityLights',
    displayName: 'City Lights Collective',
    bio: 'Leadership, innovation, and creator-focused events for ambitious teams.',
    website: 'https://citylights.example.com',
    email: 'team@citylights.example.com',
    phone: '+8801888000002',
    verificationStatus: 'verified',
    verifiedAt: new Date('2026-02-22T14:00:00+06:00'),
    socialLinks: {
      facebook: 'https://facebook.com/citylightscollective',
      instagram: 'https://instagram.com/citylightscollective',
      twitter: 'https://x.com/citylightsco',
      youtube: 'https://youtube.com/@citylightscollective',
    },
    logo: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=320&q=80',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
  },
  {
    key: 'rising',
    userKey: 'organizerRising',
    displayName: 'Rising Founders Hub',
    bio: 'Early-stage founder meetups, pitch nights, and startup community forums.',
    website: 'https://risingfounders.example.com',
    email: 'community@risingfounders.example.com',
    phone: '+8801888000003',
    verificationStatus: 'pending',
    socialLinks: {
      facebook: 'https://facebook.com/risingfoundershub',
      instagram: 'https://instagram.com/risingfoundershub',
      twitter: 'https://x.com/risingfounders',
      youtube: 'https://youtube.com/@risingfoundershub',
    },
    logo: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=320&q=80',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
  },
];

const CATEGORY_BLUEPRINTS = [
  {
    key: 'music',
    name: 'Music',
    description: 'Concerts, live performances, DJ nights, and curated sound experiences.',
    subcategories: [
      { key: 'liveConcerts', name: 'Live Concerts', description: 'Concerts by solo artists, bands, and touring acts.' },
      { key: 'djNights', name: 'DJ Nights', description: 'Late-night music experiences, dance floors, and electronic sets.' },
    ],
  },
  {
    key: 'technology',
    name: 'Technology',
    description: 'Tech meetups, conferences, workshops, and innovation showcases.',
    subcategories: [
      { key: 'conferences', name: 'Conferences', description: 'Leadership talks, product strategy, and industry conferences.' },
      { key: 'workshops', name: 'Workshops', description: 'Practical hands-on training sessions and guided learning.' },
    ],
  },
  {
    key: 'foodDrink',
    name: 'Food & Drink',
    description: 'Festivals, tastings, food markets, and chef-led culinary experiences.',
    subcategories: [
      { key: 'foodFestivals', name: 'Food Festivals', description: 'Street food, pop-up stalls, and multi-vendor dining events.' },
      { key: 'tastings', name: 'Tastings', description: 'Guided tastings and chef-led curated menus.' },
    ],
  },
  {
    key: 'sports',
    name: 'Sports',
    description: 'Matches, fan experiences, outdoor games, and active community events.',
    subcategories: [
      { key: 'football', name: 'Football', description: 'Football tournaments, fan zones, and local league matches.' },
      { key: 'marathon', name: 'Marathon', description: 'Running races, charity runs, and endurance events.' },
    ],
  },
  {
    key: 'business',
    name: 'Business',
    description: 'Networking sessions, startup events, and growth-focused professional gatherings.',
    subcategories: [
      { key: 'networking', name: 'Networking', description: 'Professional networking mixers and community meetups.' },
      { key: 'startupPitch', name: 'Startup Pitch', description: 'Pitch nights, demo days, and founder showcases.' },
    ],
  },
];

const EVENT_TYPE_BLUEPRINTS = [
  { key: 'festival', name: 'Festival', description: 'Multi-act or multi-segment public event experiences.' },
  { key: 'inPerson', name: 'In Person', description: 'Events hosted physically at a venue.' },
  { key: 'online', name: 'Online', description: 'Live online sessions with remote attendance.' },
  { key: 'hybrid', name: 'Hybrid', description: 'Experiences blending in-person and online access.' },
  { key: 'workshop', name: 'Workshop', description: 'Focused learning sessions with practical takeaways.' },
];

const TAG_BLUEPRINTS = [
  { key: 'liveMusic', name: 'Live Music', description: 'Performance-led events with live acts.' },
  { key: 'premium', name: 'Premium', description: 'Elevated access or VIP event experiences.' },
  { key: 'outdoor', name: 'Outdoor', description: 'Open-air or outdoor venue experiences.' },
  { key: 'networking', name: 'Networking', description: 'Events designed for community and professional connections.' },
  { key: 'startup', name: 'Startup', description: 'Founder, investor, and startup ecosystem events.' },
  { key: 'foodie', name: 'Foodie', description: 'Food-first events and culinary experiences.' },
  { key: 'online', name: 'Online Access', description: 'Events accessible remotely.' },
  { key: 'wellness', name: 'Wellness', description: 'Mind-body and lifestyle improvement experiences.' },
  { key: 'sports', name: 'Sports', description: 'Competitive or active sporting events.' },
];

const EVENT_BLUEPRINTS = [
  {
    key: 'neonFest',
    title: 'Dhaka Neon Music Fest',
    organizerKey: 'pulse',
    categoryKey: 'music',
    subcategoryKey: 'liveConcerts',
    eventTypeKey: 'festival',
    tagKeys: ['liveMusic', 'premium', 'outdoor'],
    status: 'published',
    visibility: 'public',
    isFeatured: true,
    isTrending: true,
    isVerified: true,
    startDate: '2026-05-15T18:00:00+06:00',
    endDate: '2026-05-15T23:30:00+06:00',
    doorsOpen: '2026-05-15T17:00:00+06:00',
    shortDescription: 'A high-energy city festival blending electronic sets, pop performances, and immersive stage design.',
    description:
      'Dhaka Neon Music Fest is a flagship evening experience for fans of live production, big-stage visuals, and premium nightlife energy. The lineup combines headline performers, supporting acts, and lounge zones designed for groups who want both access and atmosphere.',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'physical',
      name: 'ICCB Open Arena',
      address: 'Kuril Bishwa Road',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      zip: '1229',
      coordinates: {
        type: 'Point',
        coordinates: [90.4255, 23.8217],
      },
    },
    agenda: [
      {
        title: 'Gate Opens',
        description: 'Check-in, wristband collection, and venue access.',
        startTime: '2026-05-15T17:00:00+06:00',
        endTime: '2026-05-15T18:00:00+06:00',
        location: 'Main Entrance',
      },
      {
        title: 'Headline Performance Block',
        description: 'Main stage performances with synchronized visuals.',
        startTime: '2026-05-15T20:30:00+06:00',
        endTime: '2026-05-15T22:30:00+06:00',
        location: 'Main Stage',
      },
    ],
    faqs: [
      {
        question: 'Is re-entry allowed?',
        answer: 'Yes, re-entry is allowed until 9:30 PM with a valid wristband.',
      },
      {
        question: 'Is parking available?',
        answer: 'Paid parking is available on-site with limited capacity.',
      },
    ],
    refundPolicy: {
      allowRefunds: true,
      cutoffHours: 48,
      percentageBack: 80,
      notes: 'Refunds are available up to 48 hours before the event starts.',
    },
    seo: {
      metaTitle: 'Dhaka Neon Music Fest | Ticket Bro',
      metaDescription: 'Book tickets for Dhaka Neon Music Fest and enjoy a premium live music experience.',
      keywords: ['music', 'festival', 'dhaka', 'live'],
    },
    ticketTypes: [
      {
        key: 'neonGeneral',
        name: 'General Admission',
        description: 'Full festival access and standing zone entry.',
        type: 'general',
        price: 1200,
        quantity: 300,
        sold: 42,
        reserved: 3,
        maxPerOrder: 6,
        color: '#1d4ed8',
        benefits: ['Main stage access', 'Food court access'],
        salesStart: '2026-03-20T00:00:00+06:00',
        salesEnd: '2026-05-15T17:00:00+06:00',
      },
      {
        key: 'neonVip',
        name: 'VIP Lounge',
        description: 'Priority entry, lounge seating, and premium viewing area.',
        type: 'vip',
        price: 2800,
        quantity: 60,
        sold: 14,
        reserved: 1,
        maxPerOrder: 4,
        color: '#f59e0b',
        benefits: ['Priority entry', 'VIP lounge access', 'Complimentary drink token'],
        salesStart: '2026-03-20T00:00:00+06:00',
        salesEnd: '2026-05-15T17:00:00+06:00',
      },
    ],
  },
  {
    key: 'productSummit',
    title: 'Product Leaders Summit Dhaka',
    organizerKey: 'cityLights',
    categoryKey: 'technology',
    subcategoryKey: 'conferences',
    eventTypeKey: 'inPerson',
    tagKeys: ['networking', 'premium'],
    status: 'published',
    visibility: 'public',
    isFeatured: true,
    isTrending: false,
    isVerified: true,
    startDate: '2026-05-28T09:00:00+06:00',
    endDate: '2026-05-28T18:00:00+06:00',
    doorsOpen: '2026-05-28T08:00:00+06:00',
    shortDescription: 'A one-day strategy summit for product, growth, and operations teams.',
    description:
      'Product Leaders Summit Dhaka brings together operators, product managers, and startup decision-makers for a dense day of talks, case studies, and structured networking. It is designed for teams who want practical execution ideas rather than generic inspiration.',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'physical',
      name: 'Le Meridien Convention Hall',
      address: 'Airport Road',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      zip: '1229',
      coordinates: {
        type: 'Point',
        coordinates: [90.4035, 23.8413],
      },
    },
    agenda: [
      {
        title: 'Opening Keynote',
        description: 'State of product and growth in South Asian startups.',
        startTime: '2026-05-28T09:30:00+06:00',
        endTime: '2026-05-28T10:15:00+06:00',
        location: 'Hall A',
      },
      {
        title: 'Operator Roundtables',
        description: 'Small-group discussions with sector leaders.',
        startTime: '2026-05-28T14:00:00+06:00',
        endTime: '2026-05-28T15:30:00+06:00',
        location: 'Hall B',
      },
    ],
    faqs: [
      {
        question: 'Will slides be shared after the summit?',
        answer: 'Yes, paid attendees receive access to presentation decks and recordings.',
      },
    ],
    refundPolicy: {
      allowRefunds: true,
      cutoffHours: 72,
      percentageBack: 90,
      notes: 'Refunds are available until three days before the summit.',
    },
    seo: {
      metaTitle: 'Product Leaders Summit Dhaka | Ticket Bro',
      metaDescription: 'Leadership summit for product, growth, and operations teams in Dhaka.',
      keywords: ['product', 'conference', 'dhaka', 'leadership'],
    },
    ticketTypes: [
      {
        key: 'summitStandard',
        name: 'Standard Pass',
        description: 'Talks, networking lounge, and session access.',
        type: 'general',
        price: 2500,
        quantity: 200,
        sold: 35,
        reserved: 0,
        maxPerOrder: 5,
        color: '#0f766e',
        benefits: ['All sessions', 'Networking lounge'],
        salesStart: '2026-03-25T00:00:00+06:00',
        salesEnd: '2026-05-28T08:00:00+06:00',
      },
      {
        key: 'summitExecutive',
        name: 'Executive Pass',
        description: 'Premium seating, speaker brunch, and summit materials.',
        type: 'vip',
        price: 4800,
        quantity: 40,
        sold: 8,
        reserved: 0,
        maxPerOrder: 3,
        color: '#7c3aed',
        benefits: ['Reserved seating', 'Speaker brunch', 'Priority check-in'],
        salesStart: '2026-03-25T00:00:00+06:00',
        salesEnd: '2026-05-28T08:00:00+06:00',
      },
    ],
  },
  {
    key: 'startupPitch',
    title: 'Startup Pitch Night 2026',
    organizerKey: 'rising',
    categoryKey: 'business',
    subcategoryKey: 'startupPitch',
    eventTypeKey: 'hybrid',
    tagKeys: ['startup', 'networking'],
    status: 'pending',
    visibility: 'public',
    isFeatured: false,
    isTrending: false,
    isVerified: false,
    startDate: '2026-05-10T18:30:00+06:00',
    endDate: '2026-05-10T21:30:00+06:00',
    doorsOpen: '2026-05-10T18:00:00+06:00',
    shortDescription: 'A community pitch night connecting founders with mentors, operators, and early angel investors.',
    description:
      'Startup Pitch Night 2026 is designed for early-stage founders who want a supportive but high-accountability room. The event is currently pending moderation review while final venue and investor panel details are being confirmed.',
    coverImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'hybrid',
      name: 'Startup Bangladesh Hub',
      address: 'Karwan Bazar',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      zip: '1215',
      coordinates: {
        type: 'Point',
        coordinates: [90.3925, 23.7516],
      },
      onlineUrl: 'https://example.com/rising-founders-live',
      onlinePlatform: 'Zoom',
    },
    agenda: [
      {
        title: 'Founder Pitches',
        description: 'Shortlisted startups present five-minute pitches.',
        startTime: '2026-05-10T19:00:00+06:00',
        endTime: '2026-05-10T20:30:00+06:00',
        location: 'Main Hall',
      },
    ],
    faqs: [
      {
        question: 'Is this event moderated yet?',
        answer: 'The event is pending final review before tickets go fully live.',
      },
    ],
    refundPolicy: {
      allowRefunds: true,
      cutoffHours: 24,
      percentageBack: 100,
      notes: 'Fully refundable while the event is pending approval.',
    },
    seo: {
      metaTitle: 'Startup Pitch Night 2026 | Ticket Bro',
      metaDescription: 'Founders, investors, and mentors meet at Startup Pitch Night 2026.',
      keywords: ['startup', 'pitch', 'dhaka', 'founders'],
    },
    ticketTypes: [
      {
        key: 'pitchFounder',
        name: 'Founder Pass',
        description: 'Entry to the pitch room and networking hour.',
        type: 'general',
        price: 1500,
        quantity: 100,
        sold: 0,
        reserved: 6,
        maxPerOrder: 4,
        color: '#2563eb',
        benefits: ['Pitch room access', 'Networking hour'],
        salesStart: '2026-04-05T00:00:00+06:00',
        salesEnd: '2026-05-10T17:00:00+06:00',
      },
      {
        key: 'pitchInvestor',
        name: 'Investor Table',
        description: 'Reserved networking table and founder deck packet.',
        type: 'vip',
        price: 5000,
        quantity: 20,
        sold: 0,
        reserved: 0,
        maxPerOrder: 2,
        color: '#dc2626',
        benefits: ['Reserved table', 'Founder deck packet'],
        salesStart: '2026-04-05T00:00:00+06:00',
        salesEnd: '2026-05-10T17:00:00+06:00',
      },
    ],
  },
  {
    key: 'foodCarnival',
    title: 'Artisan Food Carnival',
    organizerKey: 'pulse',
    categoryKey: 'foodDrink',
    subcategoryKey: 'foodFestivals',
    eventTypeKey: 'festival',
    tagKeys: ['foodie', 'outdoor'],
    status: 'published',
    visibility: 'public',
    isFeatured: false,
    isTrending: true,
    isVerified: true,
    startDate: '2026-02-14T12:00:00+06:00',
    endDate: '2026-02-14T21:00:00+06:00',
    doorsOpen: '2026-02-14T11:00:00+06:00',
    shortDescription: 'A family-friendly outdoor food experience with curated local vendors and live chef demos.',
    description:
      'Artisan Food Carnival brought together street food makers, specialty coffee teams, and independent dessert brands for a full-day celebration of local taste. The event now serves as a strong source of completed-booking and review data for the platform.',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'physical',
      name: 'Bangladesh Shilpakala Grounds',
      address: 'Segun Bagicha',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      zip: '1000',
      coordinates: {
        type: 'Point',
        coordinates: [90.4063, 23.7332],
      },
    },
    agenda: [
      {
        title: 'Chef Demo Session',
        description: 'Live preparation and tasting with featured chefs.',
        startTime: '2026-02-14T15:00:00+06:00',
        endTime: '2026-02-14T16:00:00+06:00',
        location: 'Demo Stage',
      },
    ],
    faqs: [
      {
        question: 'Are children allowed?',
        answer: 'Yes, this event is family friendly and children under 8 enter free with adults.',
      },
    ],
    refundPolicy: {
      allowRefunds: false,
      cutoffHours: 0,
      percentageBack: 0,
      notes: 'This event used a no-refund policy due to perishable vendor commitments.',
    },
    seo: {
      metaTitle: 'Artisan Food Carnival | Ticket Bro',
      metaDescription: 'Explore local food vendors and chef demos at Artisan Food Carnival.',
      keywords: ['food', 'festival', 'dhaka', 'family'],
    },
    ticketTypes: [
      {
        key: 'foodEntry',
        name: 'Entry Pass',
        description: 'Single attendee access for the full day.',
        type: 'general',
        price: 500,
        quantity: 400,
        sold: 180,
        reserved: 0,
        maxPerOrder: 8,
        color: '#f97316',
        benefits: ['Ground access', 'Live demos'],
        salesStart: '2026-01-15T00:00:00+06:00',
        salesEnd: '2026-02-14T10:00:00+06:00',
      },
      {
        key: 'foodFamily',
        name: 'Family Bundle',
        description: 'Discounted bundle for up to four attendees.',
        type: 'group',
        price: 1800,
        quantity: 60,
        sold: 25,
        reserved: 0,
        maxPerOrder: 2,
        color: '#22c55e',
        benefits: ['Ground access', 'Family fast-lane entry'],
        salesStart: '2026-01-15T00:00:00+06:00',
        salesEnd: '2026-02-14T10:00:00+06:00',
      },
    ],
  },
  {
    key: 'wellnessWorkshop',
    title: 'Wellness Workshop Live',
    organizerKey: 'cityLights',
    categoryKey: 'technology',
    subcategoryKey: 'workshops',
    eventTypeKey: 'online',
    tagKeys: ['online', 'wellness'],
    status: 'published',
    visibility: 'public',
    isFeatured: false,
    isTrending: false,
    isVerified: true,
    startDate: '2026-04-22T19:30:00+06:00',
    endDate: '2026-04-22T21:00:00+06:00',
    doorsOpen: '2026-04-22T19:00:00+06:00',
    shortDescription: 'A guided live session on sustainable routines, focus, and stress-aware planning.',
    description:
      'Wellness Workshop Live is a fully remote session for professionals who want a practical reset. The session includes guided exercises, downloadable templates, and a moderated Q&A that works well as a lightweight online booking flow in the product.',
    coverImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'online',
      name: 'Ticket Bro Live Studio',
      city: 'Online',
      country: 'Bangladesh',
      coordinates: {
        type: 'Point',
        coordinates: [90.4125, 23.8103],
      },
      onlineUrl: 'https://example.com/ticket-bro-live-studio',
      onlinePlatform: 'Zoom',
    },
    agenda: [
      {
        title: 'Guided Planning Exercise',
        description: 'Participants build a sustainable weekly routine plan.',
        startTime: '2026-04-22T20:00:00+06:00',
        endTime: '2026-04-22T20:35:00+06:00',
        location: 'Online Session',
      },
    ],
    faqs: [
      {
        question: 'Will the session be recorded?',
        answer: 'Yes, attendees receive a replay link after the workshop ends.',
      },
    ],
    refundPolicy: {
      allowRefunds: true,
      cutoffHours: 12,
      percentageBack: 100,
      notes: 'Full refunds are available until 12 hours before the workshop.',
    },
    seo: {
      metaTitle: 'Wellness Workshop Live | Ticket Bro',
      metaDescription: 'Join a live online workshop for sustainable routines and better focus.',
      keywords: ['wellness', 'online', 'workshop', 'focus'],
    },
    ticketTypes: [
      {
        key: 'wellnessSeat',
        name: 'Online Seat',
        description: 'Single attendee access to the live workshop.',
        type: 'online',
        price: 300,
        quantity: 500,
        sold: 22,
        reserved: 2,
        maxPerOrder: 10,
        color: '#14b8a6',
        benefits: ['Live session', 'Replay access'],
        salesStart: '2026-03-25T00:00:00+06:00',
        salesEnd: '2026-04-22T18:00:00+06:00',
      },
      {
        key: 'wellnessTeam',
        name: 'Team Access',
        description: 'Five-seat access for team participation.',
        type: 'group',
        price: 1200,
        quantity: 100,
        sold: 5,
        reserved: 0,
        maxPerOrder: 3,
        color: '#0284c7',
        benefits: ['Five live seats', 'Shared workbook'],
        salesStart: '2026-03-25T00:00:00+06:00',
        salesEnd: '2026-04-22T18:00:00+06:00',
      },
    ],
  },
  {
    key: 'indieSessions',
    title: 'Rooftop Indie Sessions',
    organizerKey: 'pulse',
    categoryKey: 'music',
    subcategoryKey: 'djNights',
    eventTypeKey: 'inPerson',
    tagKeys: ['liveMusic', 'premium'],
    status: 'draft',
    visibility: 'private',
    isFeatured: false,
    isTrending: false,
    isVerified: false,
    startDate: '2026-06-12T20:00:00+06:00',
    endDate: '2026-06-12T23:00:00+06:00',
    doorsOpen: '2026-06-12T19:30:00+06:00',
    shortDescription: 'A still-drafting intimate rooftop session for indie artists and curated listeners.',
    description:
      'Rooftop Indie Sessions is kept as a draft to support organizer panel states and draft-event workflows. The event is intentionally not public yet while lineup and venue access logistics are being finalized.',
    coverImage: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'physical',
      name: 'Skyline Rooftop',
      address: 'Gulshan Avenue',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      zip: '1212',
      coordinates: {
        type: 'Point',
        coordinates: [90.4151, 23.7925],
      },
    },
    ticketTypes: [
      {
        key: 'indieEarly',
        name: 'Early Bird',
        description: 'Limited early-access pricing.',
        type: 'early_bird',
        price: 900,
        quantity: 120,
        sold: 0,
        reserved: 0,
        maxPerOrder: 4,
        color: '#4f46e5',
        benefits: ['Event access'],
        salesStart: '2026-04-25T00:00:00+06:00',
        salesEnd: '2026-06-01T00:00:00+06:00',
      },
      {
        key: 'indiePremium',
        name: 'Premium Deck',
        description: 'Elevated viewing area and welcome beverage.',
        type: 'vip',
        price: 2200,
        quantity: 30,
        sold: 0,
        reserved: 0,
        maxPerOrder: 2,
        color: '#eab308',
        benefits: ['Deck seating', 'Welcome beverage'],
        salesStart: '2026-04-25T00:00:00+06:00',
        salesEnd: '2026-06-12T18:00:00+06:00',
      },
    ],
  },
  {
    key: 'footballCup',
    title: 'Community Football Cup',
    organizerKey: 'pulse',
    categoryKey: 'sports',
    subcategoryKey: 'football',
    eventTypeKey: 'inPerson',
    tagKeys: ['sports', 'outdoor'],
    status: 'cancelled',
    visibility: 'public',
    isFeatured: false,
    isTrending: false,
    isVerified: true,
    startDate: '2026-04-30T16:00:00+06:00',
    endDate: '2026-04-30T20:00:00+06:00',
    doorsOpen: '2026-04-30T15:00:00+06:00',
    shortDescription: 'A community football event kept for cancelled-event flows and admin oversight.',
    description:
      'Community Football Cup was scheduled as a local fan and community event but was cancelled due to venue logistics. It remains in the dataset to cover cancellation states and admin event management.',
    coverImage: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1600&q=80',
    images: [
      'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=80',
    ],
    location: {
      type: 'physical',
      name: 'Army Stadium Annex',
      address: 'Banani',
      city: 'Dhaka',
      state: 'Dhaka',
      country: 'Bangladesh',
      zip: '1213',
      coordinates: {
        type: 'Point',
        coordinates: [90.404, 23.7937],
      },
    },
    ticketTypes: [
      {
        key: 'footballRegular',
        name: 'Regular Pass',
        description: 'Entry to the cup and community fan zone.',
        type: 'general',
        price: 700,
        quantity: 250,
        sold: 0,
        reserved: 0,
        maxPerOrder: 6,
        color: '#16a34a',
        benefits: ['Ground access'],
        salesStart: '2026-03-10T00:00:00+06:00',
        salesEnd: '2026-04-30T14:00:00+06:00',
      },
    ],
  },
];

const BOOKING_BLUEPRINTS = [
  {
    key: 'neonPaid',
    bookingRef: 'BK-SEED-NEON-001',
    userKey: 'attendeeSadia',
    eventKey: 'neonFest',
    status: 'confirmed',
    paymentStatus: 'paid',
    payment: {
      gatewayPaymentId: 'pi_seed_neon_001',
      status: 'succeeded',
      paymentMethod: {
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expMonth: 12,
        expYear: 2030,
      },
      paidAt: '2026-04-01T11:00:00+06:00',
    },
    items: [
      {
        ticketTypeKey: 'neonGeneral',
        quantity: 2,
        attendees: [
          { firstName: 'Sadia', lastName: 'Islam', email: 'attendee.sadia@ticketbro.dev', phone: '+8801700000007' },
          { firstName: 'Mira', lastName: 'Ahmed', email: 'mira.guest@ticketbro.dev', phone: '+8801711111111' },
        ],
      },
    ],
    contactName: 'Sadia Islam',
    contactEmail: 'attendee.sadia@ticketbro.dev',
    contactPhone: '+8801700000007',
    ticketStates: ['active', 'active'],
  },
  {
    key: 'summitPaid',
    bookingRef: 'BK-SEED-SUMMIT-001',
    userKey: 'attendeeRahim',
    eventKey: 'productSummit',
    status: 'confirmed',
    paymentStatus: 'paid',
    payment: {
      gatewayPaymentId: 'pi_seed_summit_001',
      status: 'succeeded',
      paymentMethod: {
        type: 'card',
        last4: '1881',
        brand: 'mastercard',
        expMonth: 11,
        expYear: 2029,
      },
      paidAt: '2026-04-02T15:10:00+06:00',
    },
    items: [
      {
        ticketTypeKey: 'summitStandard',
        quantity: 1,
        attendees: [
          { firstName: 'Rahim', lastName: 'Uddin', email: 'attendee.rahim@ticketbro.dev', phone: '+8801700000008' },
        ],
      },
    ],
    contactName: 'Rahim Uddin',
    contactEmail: 'attendee.rahim@ticketbro.dev',
    contactPhone: '+8801700000008',
    ticketStates: ['active'],
  },
  {
    key: 'foodPaid',
    bookingRef: 'BK-SEED-FOOD-001',
    userKey: 'attendeeRahim',
    eventKey: 'foodCarnival',
    status: 'checked_in',
    paymentStatus: 'paid',
    payment: {
      gatewayPaymentId: 'pi_seed_food_001',
      status: 'succeeded',
      paymentMethod: {
        type: 'card',
        last4: '0101',
        brand: 'visa',
        expMonth: 8,
        expYear: 2031,
      },
      paidAt: '2026-02-10T13:20:00+06:00',
    },
    items: [
      {
        ticketTypeKey: 'foodEntry',
        quantity: 3,
        attendees: [
          { firstName: 'Rahim', lastName: 'Uddin', email: 'attendee.rahim@ticketbro.dev', phone: '+8801700000008' },
          { firstName: 'Nabila', lastName: 'Karim', email: 'nabila.guest@ticketbro.dev', phone: '+8801722222222' },
          { firstName: 'Omar', lastName: 'Karim', email: 'omar.guest@ticketbro.dev', phone: '+8801733333333' },
        ],
      },
    ],
    contactName: 'Rahim Uddin',
    contactEmail: 'attendee.rahim@ticketbro.dev',
    contactPhone: '+8801700000008',
    checkedInAt: '2026-02-14T12:15:00+06:00',
    ticketStates: ['used', 'used', 'used'],
  },
  {
    key: 'wellnessPending',
    bookingRef: 'BK-SEED-WELLNESS-001',
    userKey: 'attendeeSadia',
    eventKey: 'wellnessWorkshop',
    status: 'pending',
    paymentStatus: 'pending',
    payment: {
      gatewayPaymentId: 'pi_seed_wellness_001',
      status: 'pending',
      paymentMethod: {
        type: 'card',
        last4: '2048',
        brand: 'visa',
        expMonth: 7,
        expYear: 2028,
      },
    },
    items: [
      {
        ticketTypeKey: 'wellnessSeat',
        quantity: 1,
        attendees: [
          { firstName: 'Sadia', lastName: 'Islam', email: 'attendee.sadia@ticketbro.dev', phone: '+8801700000007' },
        ],
      },
    ],
    contactName: 'Sadia Islam',
    contactEmail: 'attendee.sadia@ticketbro.dev',
    contactPhone: '+8801700000007',
    ticketStates: [],
  },
  {
    key: 'neonRefunded',
    bookingRef: 'BK-SEED-NEON-REFUND',
    userKey: 'attendeeRahim',
    eventKey: 'neonFest',
    status: 'refunded',
    paymentStatus: 'refunded',
    payment: {
      gatewayPaymentId: 'pi_seed_neon_refund_001',
      status: 'refunded',
      paymentMethod: {
        type: 'card',
        last4: '9090',
        brand: 'mastercard',
        expMonth: 5,
        expYear: 2030,
      },
      paidAt: '2026-03-30T16:05:00+06:00',
      refundedAt: '2026-04-01T09:15:00+06:00',
      refundReason: 'Customer requested refund before cutoff.',
    },
    items: [
      {
        ticketTypeKey: 'neonVip',
        quantity: 1,
        attendees: [
          { firstName: 'Rahim', lastName: 'Uddin', email: 'attendee.rahim@ticketbro.dev', phone: '+8801700000008' },
        ],
      },
    ],
    contactName: 'Rahim Uddin',
    contactEmail: 'attendee.rahim@ticketbro.dev',
    contactPhone: '+8801700000008',
    ticketStates: ['cancelled'],
  },
  {
    key: 'pitchPending',
    bookingRef: 'BK-SEED-PITCH-001',
    userKey: 'attendeeSadia',
    eventKey: 'startupPitch',
    status: 'pending',
    paymentStatus: 'pending',
    payment: {
      gatewayPaymentId: 'pi_seed_pitch_001',
      status: 'pending',
      paymentMethod: {
        type: 'card',
        last4: '5678',
        brand: 'visa',
        expMonth: 10,
        expYear: 2029,
      },
    },
    items: [
      {
        ticketTypeKey: 'pitchFounder',
        quantity: 2,
        attendees: [
          { firstName: 'Sadia', lastName: 'Islam', email: 'attendee.sadia@ticketbro.dev', phone: '+8801700000007' },
          { firstName: 'Asif', lastName: 'Rafi', email: 'asif.guest@ticketbro.dev', phone: '+8801744444444' },
        ],
      },
    ],
    contactName: 'Sadia Islam',
    contactEmail: 'attendee.sadia@ticketbro.dev',
    contactPhone: '+8801700000007',
    ticketStates: [],
  },
];

const REVIEW_BLUEPRINTS = [
  {
    key: 'foodReviewRahim',
    eventKey: 'foodCarnival',
    userKey: 'attendeeRahim',
    bookingRef: 'BK-SEED-FOOD-001',
    rating: 5,
    title: 'Excellent vendor mix and crowd flow',
    body: '[seed] Great variety of stalls, fast entry, and a surprisingly clean venue throughout the day.',
    pros: ['Great food mix', 'Fast check-in', 'Family friendly'],
    cons: ['Parking filled early'],
    isVerified: true,
    isPublished: true,
    reported: false,
  },
  {
    key: 'foodReviewSadia',
    eventKey: 'foodCarnival',
    userKey: 'attendeeSadia',
    rating: 4,
    title: 'Very enjoyable, but shade could be better',
    body: '[seed] The food quality was strong and the layout was easy to navigate, but outdoor seating could use more covered shade.',
    pros: ['Easy layout', 'Good dessert vendors'],
    cons: ['Not enough shaded seating'],
    isVerified: false,
    isPublished: true,
    reported: true,
  },
];

const PROMOTION_BLUEPRINTS = [
  {
    code: 'TBNEON10',
    organizerKey: 'organizerPulse',
    eventKey: 'neonFest',
    type: 'percentage',
    value: 10,
    maxUses: 200,
    usedCount: 12,
    minAmount: 1000,
    startDate: '2026-03-20T00:00:00+06:00',
    endDate: '2026-05-14T23:59:00+06:00',
    isActive: true,
  },
  {
    code: 'TBSUMMIT150',
    organizerKey: 'organizerCityLights',
    eventKey: 'productSummit',
    type: 'fixed',
    value: 150,
    maxUses: 80,
    usedCount: 5,
    minAmount: 1200,
    startDate: '2026-03-25T00:00:00+06:00',
    endDate: '2026-05-27T23:59:00+06:00',
    isActive: true,
  },
  {
    code: 'TBONLINE20',
    organizerKey: 'organizerCityLights',
    eventKey: 'wellnessWorkshop',
    type: 'percentage',
    value: 20,
    maxUses: 100,
    usedCount: 3,
    minAmount: 300,
    startDate: '2026-04-01T00:00:00+06:00',
    endDate: '2026-04-21T23:59:00+06:00',
    isActive: true,
  },
];

const PAYOUT_BLUEPRINTS = [
  {
    organizerKey: 'organizerPulse',
    eventKey: 'neonFest',
    amount: 18000,
    status: 'pending',
    notes: '[seed] Pending payout for Dhaka Neon Music Fest.',
    bankDetails: {
      accountNumber: '1234567890',
      routingNumber: '9988776655',
      bankName: 'Dutch-Bangla Bank',
      accountName: 'Pulse Live Events',
    },
  },
  {
    organizerKey: 'organizerCityLights',
    eventKey: 'productSummit',
    amount: 7200,
    status: 'completed',
    notes: '[seed] Completed payout for Product Leaders Summit Dhaka.',
    bankDetails: {
      accountNumber: '2234567890',
      routingNumber: '8877665544',
      bankName: 'BRAC Bank',
      accountName: 'City Lights Collective',
    },
    processedByKey: 'admin',
    processedAt: '2026-04-01T10:30:00+06:00',
  },
];

const REPORT_BLUEPRINTS = [
  {
    entityType: 'event',
    entityKey: 'startupPitch',
    reportedByKey: 'attendeeSadia',
    reason: 'misleading',
    description: '[seed] The event page still says venue details are pending and I am not sure if it is final.',
    status: 'open',
  },
  {
    entityType: 'review',
    entityKey: 'foodReviewSadia',
    reportedByKey: 'attendeeRahim',
    reportedUserKey: 'attendeeSadia',
    reason: 'other',
    description: '[seed] This review may overstate a few details compared with the actual experience.',
    status: 'under_review',
    assignedToKey: 'moderator',
  },
  {
    entityType: 'user',
    entityKey: 'bannedMember',
    reportedByKey: 'attendeeRahim',
    reportedUserKey: 'bannedMember',
    reason: 'fraud',
    description: '[seed] Fake payment confirmation screenshots were shared with other attendees.',
    status: 'resolved',
    reviewedByKey: 'moderator',
    reviewedAt: '2026-04-02T12:45:00+06:00',
    resolution: 'resolved',
    resolutionNote: 'User was already banned after payment review.',
    actionTaken: 'user_banned',
  },
];

const AUDIT_BLUEPRINTS = [
  {
    userKey: 'superAdmin',
    action: 'user.role.changed',
    resource: 'user',
    resourceKey: 'moderator',
    metadata: {
      seed: true,
      fromRole: 'user',
      toRole: 'moderator',
      note: 'Seeded role governance event.',
    },
  },
  {
    userKey: 'moderator',
    action: 'user.warned',
    resource: 'user',
    resourceKey: 'attendeeSadia',
    metadata: {
      seed: true,
      warning: 'Please keep community chat focused and avoid repeated promotional messages.',
    },
  },
  {
    userKey: 'moderator',
    action: 'event.approved',
    resource: 'event',
    resourceKey: 'productSummit',
    metadata: {
      seed: true,
      note: 'Approved after verifying venue and organizer details.',
    },
  },
];

const SESSION_BLUEPRINTS = [
  {
    userKey: 'superAdmin',
    token: 'seed-super-admin-session',
    userAgent: 'Seeded Chrome Session',
    ipAddress: '203.76.115.10',
    deviceInfo: 'Windows 11 Desktop',
  },
  {
    userKey: 'admin',
    token: 'seed-admin-session',
    userAgent: 'Seeded Firefox Session',
    ipAddress: '203.76.115.11',
    deviceInfo: 'MacBook Pro',
  },
  {
    userKey: 'organizerPulse',
    token: 'seed-organizer-session',
    userAgent: 'Seeded Organizer Dashboard',
    ipAddress: '203.76.115.12',
    deviceInfo: 'Dell XPS',
  },
  {
    userKey: 'attendeeSadia',
    token: 'seed-user-session',
    userAgent: 'Seeded Mobile Session',
    ipAddress: '203.76.115.13',
    deviceInfo: 'Android Mobile',
  },
];

const SYSTEM_SETTINGS = {
  platformName: 'Ticket Bro',
  platformUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  currency: DEFAULT_CURRENCY,
  commissionRate: 8,
  maintenanceMode: false,
  registrationEnabled: true,
  payoutHoldDays: 7,
  bookingFee: 25,
  stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  smtpHost: process.env.EMAIL_HOST || 'smtp.gmail.com',
  smtpPort: Number(process.env.EMAIL_PORT || 587),
  fromEmail: process.env.EMAIL_FROM_ADDRESS || 'noreply@ticketbro.dev',
  fromName: process.env.EMAIL_FROM_NAME || 'Ticket Bro',
  enableMessaging: true,
  enableReviews: true,
  enableLoyaltyPoints: true,
  enableWaitlist: true,
  enableSeatMap: true,
  enableOAuth: true,
};

const toDate = (value) => (value ? new Date(value) : undefined);

const upsertDocument = async (Model, query, values) => {
  let doc = await Model.findOne(query);

  if (!doc) {
    doc = new Model(values);
  } else {
    Object.assign(doc, values);
  }

  await doc.save();
  return doc;
};

const ensureUsers = async () => {
  const users = {};
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  for (const blueprint of USER_BLUEPRINTS) {
    let user = await User.findOne({ email: blueprint.email, deletedAt: null }).select('+password');

    if (!user) {
      user = new User();
    }

    Object.assign(user, {
      firstName: blueprint.firstName,
      lastName: blueprint.lastName,
      email: blueprint.email,
      phone: blueprint.phone,
      password: hashedPassword,
      role: blueprint.role,
      status: blueprint.status || 'active',
      statusReason: blueprint.statusReason || '',
      bio: blueprint.bio,
      isEmailVerified: true,
      oauthProvider: 'local',
      deletedAt: null,
      avatar:
        blueprint.role === ROLES.USER
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      address: {
        city: 'Dhaka',
        state: 'Dhaka',
        country: 'Bangladesh',
      },
    });

    if (blueprint.status && blueprint.status !== 'active') {
      user.statusUpdatedAt = new Date();
    }

    await user.save();
    users[blueprint.key] = user;
  }

  return users;
};

const ensureOrganizers = async (users) => {
  const organizers = {};

  for (const blueprint of ORGANIZER_BLUEPRINTS) {
    const organizer = await upsertDocument(
      Organizer,
      { user: users[blueprint.userKey]._id },
      {
        user: users[blueprint.userKey]._id,
        displayName: blueprint.displayName,
        bio: blueprint.bio,
        logo: blueprint.logo,
        coverImage: blueprint.coverImage,
        website: blueprint.website,
        phone: blueprint.phone,
        email: blueprint.email,
        socialLinks: blueprint.socialLinks,
        verificationStatus: blueprint.verificationStatus,
        verifiedAt: blueprint.verifiedAt || null,
        isActive: true,
        deletedAt: null,
      },
    );

    organizers[blueprint.key] = organizer;
  }

  return organizers;
};

const ensureTaxonomy = async () => {
  const categories = {};
  const subcategories = {};
  const eventTypes = {};
  const tags = {};

  for (const blueprint of CATEGORY_BLUEPRINTS) {
    const category = await upsertDocument(
      Category,
      { name: blueprint.name },
      {
        name: blueprint.name,
        description: blueprint.description,
        isActive: true,
        deletedAt: null,
      },
    );

    categories[blueprint.key] = category;

    for (const subcategoryBlueprint of blueprint.subcategories) {
      const subcategory = await upsertDocument(
        Subcategory,
        {
          name: subcategoryBlueprint.name,
          category: category._id,
        },
        {
          name: subcategoryBlueprint.name,
          description: subcategoryBlueprint.description,
          category: category._id,
          isActive: true,
          deletedAt: null,
        },
      );

      subcategories[subcategoryBlueprint.key] = subcategory;
    }
  }

  for (const blueprint of EVENT_TYPE_BLUEPRINTS) {
    eventTypes[blueprint.key] = await upsertDocument(
      EventType,
      { name: blueprint.name },
      {
        name: blueprint.name,
        description: blueprint.description,
        isActive: true,
        deletedAt: null,
      },
    );
  }

  for (const blueprint of TAG_BLUEPRINTS) {
    tags[blueprint.key] = await upsertDocument(
      Tag,
      { name: blueprint.name },
      {
        name: blueprint.name,
        description: blueprint.description,
        isActive: true,
        deletedAt: null,
      },
    );
  }

  return { categories, subcategories, eventTypes, tags };
};

const clearPreviousSeedData = async () => {
  const seedEventTitles = EVENT_BLUEPRINTS.map((blueprint) => blueprint.title);
  const existingEvents = await Event.find({ title: { $in: seedEventTitles } }).select('_id');
  const eventIds = existingEvents.map((event) => event._id);

  const bookingQuery = [{ bookingRef: { $in: BOOKING_BLUEPRINTS.map((blueprint) => blueprint.bookingRef) } }];
  if (eventIds.length) {
    bookingQuery.push({ event: { $in: eventIds } });
  }

  const existingBookings = await Booking.find({ $or: bookingQuery }).select('_id');
  const bookingIds = existingBookings.map((booking) => booking._id);

  await Promise.all([
    Ticket.deleteMany({
      $or: [
        { booking: { $in: bookingIds } },
        { ticketCode: /^TK-SEED-/i },
      ],
    }),
    Payment.deleteMany({
      $or: [
        { booking: { $in: bookingIds } },
        { gatewayPaymentId: /^pi_seed_/i },
      ],
    }),
    Review.deleteMany({ body: /^\[seed\]/i }),
    Promotion.deleteMany({ code: { $in: PROMOTION_BLUEPRINTS.map((blueprint) => blueprint.code) } }),
    Report.deleteMany({ description: /^\[seed\]/i }),
    AuditLog.deleteMany({ 'metadata.seed': true }),
    Payout.deleteMany({ notes: /^\[seed\]/i }),
    RefreshToken.deleteMany({ token: /^seed-/i }),
  ]);

  if (eventIds.length) {
    await TicketType.deleteMany({ event: { $in: eventIds } });
    await Event.deleteMany({ _id: { $in: eventIds } });
  }

  if (bookingIds.length) {
    await Booking.deleteMany({ _id: { $in: bookingIds } });
  }
};

const createEvents = async ({ organizers, categories, subcategories, eventTypes, tags }) => {
  const events = {};

  for (const blueprint of EVENT_BLUEPRINTS) {
    const organizer = organizers[blueprint.organizerKey];
    const event = new Event({
      title: blueprint.title,
      description: blueprint.description,
      shortDescription: blueprint.shortDescription,
      organizer: organizer.user,
      organizerProfile: organizer._id,
      coverImage: blueprint.coverImage,
      images: blueprint.images,
      category: categories[blueprint.categoryKey]._id,
      subcategory: subcategories[blueprint.subcategoryKey]._id,
      eventType: eventTypes[blueprint.eventTypeKey]._id,
      tags: blueprint.tagKeys.map((tagKey) => tags[tagKey]._id),
      startDate: new Date(blueprint.startDate),
      endDate: new Date(blueprint.endDate),
      doorsOpen: new Date(blueprint.doorsOpen),
      timezone: 'Asia/Dhaka',
      location: blueprint.location,
      currency: DEFAULT_CURRENCY,
      status: blueprint.status,
      visibility: blueprint.visibility,
      isFeatured: blueprint.isFeatured,
      isTrending: blueprint.isTrending,
      isVerified: blueprint.isVerified,
      agenda: (blueprint.agenda || []).map((item) => ({
        ...item,
        startTime: new Date(item.startTime),
        endTime: item.endTime ? new Date(item.endTime) : undefined,
      })),
      faqs: blueprint.faqs || [],
      refundPolicy: blueprint.refundPolicy,
      seo: blueprint.seo,
      publishedAt: blueprint.status === 'published' ? new Date(blueprint.startDate) : undefined,
      cancelledAt: blueprint.status === 'cancelled' ? new Date('2026-04-01T09:00:00+06:00') : undefined,
      termsAndConditions: 'Standard venue, conduct, and ticketing terms apply.',
      accessibilityInfo: 'Please contact support at least 48 hours in advance for accessibility coordination.',
      dressCode: blueprint.key === 'neonFest' ? 'Smart casual' : undefined,
      viewCount:
        blueprint.key === 'neonFest'
          ? 1240
          : blueprint.key === 'productSummit'
          ? 860
          : blueprint.key === 'foodCarnival'
          ? 910
          : 250,
      uniqueViewCount:
        blueprint.key === 'neonFest'
          ? 920
          : blueprint.key === 'productSummit'
          ? 620
          : blueprint.key === 'foodCarnival'
          ? 710
          : 180,
      bookmarkCount:
        blueprint.key === 'neonFest'
          ? 110
          : blueprint.key === 'productSummit'
          ? 72
          : 18,
      shareCount:
        blueprint.key === 'neonFest'
          ? 74
          : blueprint.key === 'productSummit'
          ? 35
          : 14,
      likeCount:
        blueprint.key === 'neonFest'
          ? 286
          : blueprint.key === 'productSummit'
          ? 122
          : 61,
      trendScore:
        blueprint.key === 'neonFest'
          ? 94
          : blueprint.key === 'foodCarnival'
          ? 81
          : blueprint.key === 'productSummit'
          ? 76
          : 30,
      deletedAt: null,
    });

    await event.save();
    events[blueprint.key] = event;
  }

  return events;
};

const createTicketTypesAndUpdateEvents = async (events) => {
  const ticketTypes = {};

  for (const blueprint of EVENT_BLUEPRINTS) {
    const event = events[blueprint.key];
    const eventTicketTypes = {};

    for (const ticketBlueprint of blueprint.ticketTypes) {
      const ticketType = await new TicketType({
        event: event._id,
        name: ticketBlueprint.name,
        description: ticketBlueprint.description,
        type: ticketBlueprint.type,
        price: ticketBlueprint.price,
        quantity: ticketBlueprint.quantity,
        sold: ticketBlueprint.sold,
        reserved: ticketBlueprint.reserved,
        maxPerOrder: ticketBlueprint.maxPerOrder,
        minPerOrder: 1,
        salesStart: toDate(ticketBlueprint.salesStart),
        salesEnd: toDate(ticketBlueprint.salesEnd),
        isActive: true,
        benefits: ticketBlueprint.benefits,
        color: ticketBlueprint.color,
        sortOrder: Object.keys(eventTicketTypes).length,
        deletedAt: null,
      }).save();

      eventTicketTypes[ticketBlueprint.key] = ticketType;
    }

    const ticketTypeDocs = Object.values(eventTicketTypes);
    const prices = ticketTypeDocs.map((ticketType) => Number(ticketType.price || 0));
    const totalCapacity = ticketTypeDocs.reduce((sum, ticketType) => sum + Number(ticketType.quantity || 0), 0);
    const totalSold = ticketTypeDocs.reduce((sum, ticketType) => sum + Number(ticketType.sold || 0), 0);
    const totalReserved = ticketTypeDocs.reduce((sum, ticketType) => sum + Number(ticketType.reserved || 0), 0);
    const isFree = prices.every((price) => price === 0);

    await Event.findByIdAndUpdate(event._id, {
      $set: {
        totalCapacity,
        totalSold,
        totalReserved,
        isFree,
        minPrice: prices.length ? Math.min(...prices) : 0,
        maxPrice: prices.length ? Math.max(...prices) : 0,
        currency: DEFAULT_CURRENCY,
      },
    });

    ticketTypes[blueprint.key] = eventTicketTypes;
  }

  return ticketTypes;
};

const findTicketType = (ticketTypesByEvent, ticketTypeKey) => {
  for (const eventTicketTypes of Object.values(ticketTypesByEvent)) {
    if (eventTicketTypes[ticketTypeKey]) {
      return eventTicketTypes[ticketTypeKey];
    }
  }

  throw new Error(`Ticket type not found for key: ${ticketTypeKey}`);
};

const getBookingKeyByRef = (bookingRef) => {
  const bookingBlueprint = BOOKING_BLUEPRINTS.find((blueprint) => blueprint.bookingRef === bookingRef);
  if (!bookingBlueprint) {
    throw new Error(`Booking blueprint not found for ref: ${bookingRef}`);
  }
  return bookingBlueprint.key;
};

const createBookingsPaymentsAndTickets = async (users, events, ticketTypes) => {
  const bookings = {};
  const payments = {};
  const tickets = {};

  for (const blueprint of BOOKING_BLUEPRINTS) {
    const user = users[blueprint.userKey];
    const event = events[blueprint.eventKey];

    const items = blueprint.items.map((itemBlueprint) => {
      const ticketType = findTicketType(ticketTypes, itemBlueprint.ticketTypeKey);
      const totalPrice = Number(ticketType.price) * Number(itemBlueprint.quantity);

      return {
        ticketTypeId: ticketType._id,
        ticketTypeName: ticketType.name,
        quantity: itemBlueprint.quantity,
        unitPrice: ticketType.price,
        totalPrice,
        attendees: itemBlueprint.attendees,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const totalAmount = subtotal;

    const booking = await new Booking({
      bookingRef: blueprint.bookingRef,
      user: user._id,
      event: event._id,
      organizer: event.organizer,
      items,
      subtotal,
      discount: 0,
      tax: 0,
      totalAmount,
      currency: DEFAULT_CURRENCY,
      contactName: blueprint.contactName,
      contactEmail: blueprint.contactEmail,
      contactPhone: blueprint.contactPhone,
      status: blueprint.status,
      paymentStatus: blueprint.paymentStatus,
      paidAt:
        blueprint.paymentStatus === 'paid' || blueprint.paymentStatus === 'refunded'
          ? toDate(blueprint.payment.paidAt)
          : undefined,
      refundedAt: blueprint.paymentStatus === 'refunded' ? toDate(blueprint.payment.refundedAt) : undefined,
      checkedInAt: blueprint.checkedInAt ? toDate(blueprint.checkedInAt) : undefined,
      checkedInBy: blueprint.checkedInAt ? users.moderator._id : undefined,
      deletedAt: null,
    }).save();

    const payment = await new Payment({
      booking: booking._id,
      user: user._id,
      event: event._id,
      amount: totalAmount,
      currency: DEFAULT_CURRENCY,
      tax: 0,
      discount: 0,
      status: blueprint.payment.status,
      gateway: 'stripe',
      gatewayPaymentId: blueprint.payment.gatewayPaymentId,
      paymentMethod: blueprint.payment.paymentMethod,
      paidAt: blueprint.payment.paidAt ? toDate(blueprint.payment.paidAt) : undefined,
      refundedAt: blueprint.payment.refundedAt ? toDate(blueprint.payment.refundedAt) : undefined,
      refundReason: blueprint.payment.refundReason || undefined,
      refundAmount: blueprint.payment.status === 'refunded' ? totalAmount : 0,
      expiresAt: blueprint.payment.status === 'pending' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
      deletedAt: null,
    }).save();

    booking.payment = payment._id;
    await booking.save();

    bookings[blueprint.key] = booking;
    payments[blueprint.key] = payment;

    const createdTickets = [];
    let ticketIndex = 0;

    for (const item of items) {
      for (let i = 0; i < item.quantity; i += 1) {
        const desiredState = blueprint.ticketStates[ticketIndex];
        ticketIndex += 1;

        if (!desiredState) {
          continue;
        }

        const attendee = item.attendees?.[i] || item.attendees?.[0] || {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
        };

        const ticket = await new Ticket({
          ticketCode: `TK-SEED-${blueprint.key.toUpperCase()}-${String(ticketIndex).padStart(3, '0')}`,
          booking: booking._id,
          event: event._id,
          user: user._id,
          ticketType: item.ticketTypeId,
          ticketTypeName: item.ticketTypeName,
          price: item.unitPrice,
          currency: DEFAULT_CURRENCY,
          attendee,
          status: desiredState,
          usedAt: desiredState === 'used' ? toDate(blueprint.checkedInAt || blueprint.payment.paidAt) : undefined,
          cancelledAt: desiredState === 'cancelled' ? toDate(blueprint.payment.refundedAt || blueprint.payment.paidAt) : undefined,
          deletedAt: null,
        }).save();

        createdTickets.push(ticket);
      }
    }

    tickets[blueprint.key] = createdTickets;
  }

  return { bookings, payments, tickets };
};

const createReviews = async (users, events, bookings) => {
  const reviews = {};

  for (const blueprint of REVIEW_BLUEPRINTS) {
    const review = await new Review({
      event: events[blueprint.eventKey]._id,
      user: users[blueprint.userKey]._id,
      booking: blueprint.bookingRef ? bookings[getBookingKeyByRef(blueprint.bookingRef)]._id : undefined,
      rating: blueprint.rating,
      title: blueprint.title,
      body: blueprint.body,
      pros: blueprint.pros,
      cons: blueprint.cons,
      isVerified: blueprint.isVerified,
      isPublished: blueprint.isPublished,
      helpful: blueprint.key === 'foodReviewRahim' ? 9 : 3,
      reported: blueprint.reported,
      deletedAt: null,
    }).save();

    reviews[blueprint.key] = review;
  }

  await Event.findByIdAndUpdate(events.foodCarnival._id, {
    $set: {
      reviewCount: REVIEW_BLUEPRINTS.length,
      averageRating: 4.5,
    },
  });

  return reviews;
};

const createPromotions = async (users, events) => {
  const promotions = {};

  for (const blueprint of PROMOTION_BLUEPRINTS) {
    const promotion = await new Promotion({
      organizer: users[blueprint.organizerKey]._id,
      event: events[blueprint.eventKey]._id,
      code: blueprint.code,
      type: blueprint.type,
      value: blueprint.value,
      maxUses: blueprint.maxUses,
      usedCount: blueprint.usedCount,
      minAmount: blueprint.minAmount,
      startDate: toDate(blueprint.startDate),
      endDate: toDate(blueprint.endDate),
      isActive: blueprint.isActive,
      deletedAt: null,
    }).save();

    promotions[blueprint.code] = promotion;
  }

  return promotions;
};

const createPayouts = async (users, events) => {
  const payouts = [];

  for (const blueprint of PAYOUT_BLUEPRINTS) {
    const payout = await new Payout({
      organizer: users[blueprint.organizerKey]._id,
      event: events[blueprint.eventKey]._id,
      amount: blueprint.amount,
      currency: DEFAULT_CURRENCY,
      status: blueprint.status,
      bankDetails: blueprint.bankDetails,
      processedBy: blueprint.processedByKey ? users[blueprint.processedByKey]._id : undefined,
      processedAt: blueprint.processedAt ? toDate(blueprint.processedAt) : undefined,
      notes: blueprint.notes,
      deletedAt: null,
    }).save();

    payouts.push(payout);
  }

  return payouts;
};

const resolveEntityId = ({ blueprint, users, events, reviews }) => {
  if (blueprint.entityType === 'event') {
    return events[blueprint.entityKey]._id;
  }

  if (blueprint.entityType === 'review') {
    return reviews[blueprint.entityKey]._id;
  }

  if (blueprint.entityType === 'user') {
    return users[blueprint.entityKey]._id;
  }

  throw new Error(`Unsupported report entity type: ${blueprint.entityType}`);
};

const createReports = async (users, events, reviews) => {
  const reports = [];

  for (const blueprint of REPORT_BLUEPRINTS) {
    const report = await new Report({
      entityType: blueprint.entityType,
      entityId: resolveEntityId({ blueprint, users, events, reviews }),
      reportedBy: users[blueprint.reportedByKey]._id,
      reportedUser: blueprint.reportedUserKey ? users[blueprint.reportedUserKey]._id : undefined,
      reason: blueprint.reason,
      description: blueprint.description,
      status: blueprint.status,
      assignedTo: blueprint.assignedToKey ? users[blueprint.assignedToKey]._id : undefined,
      reviewedBy: blueprint.reviewedByKey ? users[blueprint.reviewedByKey]._id : undefined,
      reviewedAt: blueprint.reviewedAt ? toDate(blueprint.reviewedAt) : undefined,
      resolution: blueprint.resolution,
      resolutionNote: blueprint.resolutionNote,
      actionTaken: blueprint.actionTaken,
    }).save();

    reports.push(report);
  }

  return reports;
};

const createAuditLogs = async (users, events) => {
  const logs = [];

  for (const blueprint of AUDIT_BLUEPRINTS) {
    const user = users[blueprint.userKey];
    const resourceId =
      blueprint.resource === 'user'
        ? users[blueprint.resourceKey]._id.toString()
        : events[blueprint.resourceKey]._id.toString();

    const log = await new AuditLog({
      userId: user._id,
      userEmail: user.email,
      userRole: user.role,
      action: blueprint.action,
      resource: blueprint.resource,
      resourceId,
      method: 'POST',
      path: `/api/v1/${blueprint.resource}s/${resourceId}`,
      statusCode: 200,
      ipAddress: '127.0.0.1',
      userAgent: 'seed-script',
      metadata: blueprint.metadata,
    }).save();

    logs.push(log);
  }

  return logs;
};

const createRefreshTokens = async (users) => {
  const sessions = [];

  for (const blueprint of SESSION_BLUEPRINTS) {
    const session = await new RefreshToken({
      userId: users[blueprint.userKey]._id,
      token: blueprint.token,
      userAgent: blueprint.userAgent,
      ipAddress: blueprint.ipAddress,
      deviceInfo: blueprint.deviceInfo,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastUsedAt: new Date(),
    }).save();

    sessions.push(session);
  }

  return sessions;
};

const upsertSystemSettings = async (users) => {
  await Promise.all(
    Object.entries(SYSTEM_SETTINGS).map(([key, value]) =>
      SystemSetting.findOneAndUpdate(
        { key },
        {
          $set: {
            value,
            updatedBy: users.superAdmin._id,
          },
        },
        {
          upsert: true,
          returnDocument: 'after',
          setDefaultsOnInsert: true,
        },
      ),
    ),
  );
};

const updateOrganizerMetrics = async (organizers, events, payments) => {
  const revenueByOrganizerId = new Map();
  const eventCounts = new Map();

  for (const event of Object.values(events)) {
    const organizerId = event.organizer.toString();
    eventCounts.set(organizerId, (eventCounts.get(organizerId) || 0) + 1);
  }

  for (const payment of Object.values(payments)) {
    if (payment.status !== 'succeeded') {
      continue;
    }

    const event = await Event.findById(payment.event).select('organizer');
    if (!event) {
      continue;
    }

    const organizerId = event.organizer.toString();
    revenueByOrganizerId.set(
      organizerId,
      (revenueByOrganizerId.get(organizerId) || 0) + Number(payment.amount || 0),
    );
  }

  for (const organizer of Object.values(organizers)) {
    const organizerId = organizer.user.toString();
    await Organizer.findByIdAndUpdate(organizer._id, {
      $set: {
        eventCount: eventCounts.get(organizerId) || 0,
        totalRevenue: revenueByOrganizerId.get(organizerId) || 0,
      },
    });
  }
};

const printSummary = ({
  users,
  organizers,
  events,
  bookings,
  payments,
  reports,
  reviews,
}) => {
  const roleSummary = USER_BLUEPRINTS.map((blueprint) => ({
    role: blueprint.role,
    email: blueprint.email,
  }));

  console.log('\nSeed complete.');
  console.log(`Default password for seeded local accounts: ${DEFAULT_PASSWORD}`);
  console.log('\nSeeded role accounts:');
  console.table(roleSummary);
  console.log('Seeded dataset summary:');
  console.table([
    { entity: 'users', count: Object.keys(users).length },
    { entity: 'organizers', count: Object.keys(organizers).length },
    { entity: 'events', count: Object.keys(events).length },
    { entity: 'bookings', count: Object.keys(bookings).length },
    { entity: 'payments', count: Object.keys(payments).length },
    { entity: 'reviews', count: Object.keys(reviews).length },
    { entity: 'reports', count: reports.length },
  ]);
  console.log(`\nSeed marker used for cleanup: ${SEED_MARKER}`);
};

const seed = async () => {
  try {
    await connectDB();

    const users = await ensureUsers();
    const organizers = await ensureOrganizers(users);
    const taxonomy = await ensureTaxonomy();

    await clearPreviousSeedData();

    const events = await createEvents({
      organizers,
      categories: taxonomy.categories,
      subcategories: taxonomy.subcategories,
      eventTypes: taxonomy.eventTypes,
      tags: taxonomy.tags,
    });

    const ticketTypes = await createTicketTypesAndUpdateEvents(events);
    const bookingResult = await createBookingsPaymentsAndTickets(users, events, ticketTypes);
    const reviews = await createReviews(users, events, bookingResult.bookings);

    await createPromotions(users, events);
    await createPayouts(users, events);
    const reports = await createReports(users, events, reviews);
    await createAuditLogs(users, events);
    await createRefreshTokens(users);
    await upsertSystemSettings(users);
    await updateOrganizerMetrics(organizers, events, bookingResult.payments);

    printSummary({
      users,
      organizers,
      events,
      bookings: bookingResult.bookings,
      payments: bookingResult.payments,
      reports,
      reviews,
    });
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await disconnectDB();
    }
  }
};

seed().catch((error) => {
  console.error('\nSeed failed.');
  console.error(error);
  process.exit(1);
});
