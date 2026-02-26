// frontend/src/services/eventsService.js

// Mock data for development
const MOCK_DATA = {
  // Categories
  categories: [
    { id: 1, slug: 'concerts', name: 'Concerts', icon: '🎵', description: 'Live music performances by top artists', count: 156, image: '/images/categories/concerts.jpg' },
    { id: 2, slug: 'sports', name: 'Sports', icon: '🏆', description: 'Exciting sports events and matches', count: 89, image: '/images/categories/sports.jpg' },
    { id: 3, slug: 'theater', name: 'Theater', icon: '🎭', description: 'Broadway shows and theatrical performances', count: 45, image: '/images/categories/theater.jpg' },
    { id: 4, slug: 'comedy', name: 'Comedy', icon: '😂', description: 'Stand-up comedy and comedy shows', count: 34, image: '/images/categories/comedy.jpg' },
    { id: 5, slug: 'festivals', name: 'Festivals', icon: '🎪', description: 'Music and cultural festivals', count: 23, image: '/images/categories/festivals.jpg' },
    { id: 6, slug: 'family', name: 'Family', icon: '👨‍👩‍👧‍👦', description: 'Fun events for the whole family', count: 67, image: '/images/categories/family.jpg' },
  ],

  // Subcategories by category
  subcategories: {
    concerts: [
      { id: 101, slug: 'rock', name: 'Rock', description: 'Rock concerts and festivals', count: 45, image: '/images/subcategories/rock.jpg' },
      { id: 102, slug: 'pop', name: 'Pop', description: 'Pop music performances', count: 67, image: '/images/subcategories/pop.jpg' },
      { id: 103, slug: 'hip-hop', name: 'Hip Hop', description: 'Hip hop and rap concerts', count: 34, image: '/images/subcategories/hiphop.jpg' },
      { id: 104, slug: 'country', name: 'Country', description: 'Country music events', count: 23, image: '/images/subcategories/country.jpg' },
      { id: 105, slug: 'electronic', name: 'Electronic', description: 'EDM and electronic music', count: 28, image: '/images/subcategories/electronic.jpg' },
      { id: 106, slug: 'jazz', name: 'Jazz', description: 'Jazz performances and festivals', count: 19, image: '/images/subcategories/jazz.jpg' },
      { id: 107, slug: 'classical', name: 'Classical', description: 'Orchestra and classical concerts', count: 15, image: '/images/subcategories/classical.jpg' },
    ],
    sports: [
      { id: 201, slug: 'football', name: 'Football', description: 'NFL and college football games', count: 56, image: '/images/subcategories/football.jpg' },
      { id: 202, slug: 'basketball', name: 'Basketball', description: 'NBA and college basketball', count: 43, image: '/images/subcategories/basketball.jpg' },
      { id: 203, slug: 'baseball', name: 'Baseball', description: 'MLB games and baseball events', count: 38, image: '/images/subcategories/baseball.jpg' },
      { id: 204, slug: 'soccer', name: 'Soccer', description: 'MLS and international soccer', count: 45, image: '/images/subcategories/soccer.jpg' },
      { id: 205, slug: 'hockey', name: 'Hockey', description: 'NHL hockey games', count: 32, image: '/images/subcategories/hockey.jpg' },
      { id: 206, slug: 'tennis', name: 'Tennis', description: 'Tennis tournaments and matches', count: 22, image: '/images/subcategories/tennis.jpg' },
      { id: 207, slug: 'golf', name: 'Golf', description: 'Golf tournaments and events', count: 18, image: '/images/subcategories/golf.jpg' },
      { id: 208, slug: 'boxing', name: 'Boxing', description: 'Boxing matches and events', count: 15, image: '/images/subcategories/boxing.jpg' },
      { id: 209, slug: 'mma', name: 'MMA', description: 'UFC and MMA events', count: 20, image: '/images/subcategories/mma.jpg' },
    ],
    theater: [
      { id: 301, slug: 'musicals', name: 'Musicals', description: 'Broadway and musical theater', count: 34, image: '/images/subcategories/musicals.jpg' },
      { id: 302, slug: 'plays', name: 'Plays', description: 'Dramatic and comedic plays', count: 28, image: '/images/subcategories/plays.jpg' },
      { id: 303, slug: 'opera', name: 'Opera', description: 'Opera performances', count: 12, image: '/images/subcategories/opera.jpg' },
      { id: 304, slug: 'ballet', name: 'Ballet', description: 'Ballet and dance performances', count: 16, image: '/images/subcategories/ballet.jpg' },
    ],
    comedy: [
      { id: 401, slug: 'standup', name: 'Stand-up', description: 'Stand-up comedy shows', count: 45, image: '/images/subcategories/standup.jpg' },
      { id: 402, slug: 'improv', name: 'Improv', description: 'Improvisational comedy', count: 23, image: '/images/subcategories/improv.jpg' },
      { id: 403, slug: 'comedy-festivals', name: 'Comedy Festivals', description: 'Comedy festivals and events', count: 15, image: '/images/subcategories/comedy-festivals.jpg' },
    ],
    festivals: [
      { id: 501, slug: 'music-festivals', name: 'Music Festivals', description: 'Multi-day music festivals', count: 28, image: '/images/subcategories/music-festivals.jpg' },
      { id: 502, slug: 'cultural-festivals', name: 'Cultural Festivals', description: 'Cultural and heritage festivals', count: 19, image: '/images/subcategories/cultural-festivals.jpg' },
      { id: 503, slug: 'food-festivals', name: 'Food Festivals', description: 'Food and wine festivals', count: 22, image: '/images/subcategories/food-festivals.jpg' },
    ],
    family: [
      { id: 601, slug: 'circus', name: 'Circus', description: 'Circus performances and shows', count: 18, image: '/images/subcategories/circus.jpg' },
      { id: 602, slug: 'magic-shows', name: 'Magic Shows', description: 'Magic and illusion shows', count: 15, image: '/images/subcategories/magic.jpg' },
      { id: 603, slug: 'children-theater', name: 'Children\'s Theater', description: 'Theater for kids', count: 24, image: '/images/subcategories/kids-theater.jpg' },
    ],
  },

  // Events
  events: [
    // Concerts
    { 
      id: 1001, 
      title: 'Taylor Swift: The Eras Tour', 
      slug: 'taylor-swift-eras-tour-2024',
      description: 'Taylor Swift brings her record-breaking Eras Tour to stadiums across the country. Experience hits from all her musical eras in one spectacular show.',
      longDescription: 'The Eras Tour is the ongoing sixth concert tour by American singer-songwriter Taylor Swift. It is her second all-stadium tour after the Reputation Stadium Tour (2018). The tour celebrates Swift\'s entire discography, with the set list divided into acts representing each of her ten studio albums. The show features elaborate production, multiple costume changes, and special effects.',
      category: 'concerts',
      subcategory: 'pop',
      date: '2024-06-15T19:30:00',
      endDate: '2024-06-15T23:00:00',
      venue: 'MetLife Stadium',
      venueId: 1,
      city: 'East Rutherford',
      state: 'NJ',
      country: 'USA',
      price: 199.99,
      minPrice: 149.99,
      maxPrice: 599.99,
      image: '/images/events/taylor-swift.jpg',
      images: ['/images/events/taylor-1.jpg', '/images/events/taylor-2.jpg', '/images/events/taylor-3.jpg'],
      artist: 'Taylor Swift',
      artists: ['Taylor Swift'],
      organizer: 'Live Nation',
      status: 'on_sale',
      capacity: 82500,
      ticketsSold: 72000,
      rating: 4.9,
      reviewCount: 1245,
      isFeatured: true,
      isTrending: true,
      tags: ['pop', 'concert', 'stadium'],
    },
    { 
      id: 1002, 
      title: 'Ed Sheeran: Mathematics Tour', 
      slug: 'ed-sheeran-mathematics-tour-2024',
      description: 'Ed Sheeran brings his Mathematics Tour to North America with his full live band and loop station.',
      longDescription: 'The Mathematics Tour is the fourth concert tour by English singer-songwriter Ed Sheeran. The tour supports his albums = (Equals), - (Subtract), and his upcoming final mathematical album. The show features Sheeran\'s biggest hits along with new material, accompanied by his full band and signature loop station performances.',
      category: 'concerts',
      subcategory: 'pop',
      date: '2024-07-20T20:00:00',
      endDate: '2024-07-20T23:00:00',
      venue: 'Madison Square Garden',
      venueId: 2,
      city: 'New York',
      state: 'NY',
      country: 'USA',
      price: 149.99,
      minPrice: 99.99,
      maxPrice: 399.99,
      image: '/images/events/ed-sheeran.jpg',
      images: ['/images/events/ed-1.jpg', '/images/events/ed-2.jpg'],
      artist: 'Ed Sheeran',
      artists: ['Ed Sheeran'],
      organizer: 'AEG Presents',
      status: 'on_sale',
      capacity: 20000,
      ticketsSold: 18500,
      rating: 4.8,
      reviewCount: 892,
      isFeatured: true,
      isTrending: false,
      tags: ['pop', 'concert', 'arena'],
    },
    { 
      id: 1003, 
      title: 'Beyoncé: Renaissance World Tour', 
      slug: 'beyonce-renaissance-tour-2024',
      description: 'Beyoncé brings her critically acclaimed Renaissance World Tour to stadiums worldwide.',
      longDescription: 'The Renaissance World Tour is the ninth concert tour by American singer Beyoncé. The tour supports her seventh studio album, Renaissance (2022). The show is a celebration of dance, music, and fashion, featuring elaborate production, multiple costume changes, and a setlist spanning her entire career.',
      category: 'concerts',
      subcategory: 'r&b',
      date: '2024-08-10T19:30:00',
      endDate: '2024-08-10T23:00:00',
      venue: 'SoFi Stadium',
      venueId: 3,
      city: 'Inglewood',
      state: 'CA',
      country: 'USA',
      price: 299.99,
      minPrice: 199.99,
      maxPrice: 999.99,
      image: '/images/events/beyonce.jpg',
      images: ['/images/events/beyonce-1.jpg', '/images/events/beyonce-2.jpg', '/images/events/beyonce-3.jpg'],
      artist: 'Beyoncé',
      artists: ['Beyoncé'],
      organizer: 'Parkwood Entertainment',
      status: 'on_sale',
      capacity: 70000,
      ticketsSold: 68000,
      rating: 5.0,
      reviewCount: 2156,
      isFeatured: true,
      isTrending: true,
      tags: ['r&b', 'pop', 'concert', 'stadium'],
    },
    
    // Sports
    { 
      id: 2001, 
      title: 'NBA Finals: Game 7 - Lakers vs Celtics', 
      slug: 'nba-finals-game-7-lakers-celtics-2024',
      description: 'The ultimate showdown for the NBA Championship in a winner-takes-all Game 7.',
      longDescription: 'The NBA Finals reach their climax with a decisive Game 7 between the Los Angeles Lakers and Boston Celtics. The two most storied franchises in NBA history battle for the championship in what promises to be an unforgettable game. Experience the intensity of playoff basketball at its finest.',
      category: 'sports',
      subcategory: 'basketball',
      date: '2024-06-05T20:00:00',
      endDate: '2024-06-05T23:00:00',
      venue: 'TD Garden',
      venueId: 4,
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      price: 399.99,
      minPrice: 299.99,
      maxPrice: 2499.99,
      image: '/images/events/nba-finals.jpg',
      images: ['/images/events/nba-1.jpg', '/images/events/nba-2.jpg'],
      teams: ['Los Angeles Lakers', 'Boston Celtics'],
      league: 'NBA',
      status: 'on_sale',
      capacity: 19580,
      ticketsSold: 19580,
      rating: 4.9,
      reviewCount: 567,
      isFeatured: true,
      isTrending: true,
      tags: ['basketball', 'playoffs', 'finals'],
    },
    { 
      id: 2002, 
      title: 'Super Bowl LVIII', 
      slug: 'super-bowl-lviii-2024',
      description: 'The biggest event in American sports - the Super Bowl.',
      longDescription: 'Super Bowl LVIII is the championship game of the National Football League (NFL). This is the biggest single-day sporting event in the world, featuring the AFC and NFC champions battling for the Vince Lombardi Trophy. The event includes the famous halftime show and countless commercials.',
      category: 'sports',
      subcategory: 'football',
      date: '2024-02-11T18:30:00',
      endDate: '2024-02-11T22:00:00',
      venue: 'Allegiant Stadium',
      venueId: 5,
      city: 'Las Vegas',
      state: 'NV',
      country: 'USA',
      price: 999.99,
      minPrice: 599.99,
      maxPrice: 15000.99,
      image: '/images/events/super-bowl.jpg',
      images: ['/images/events/sb-1.jpg', '/images/events/sb-2.jpg'],
      teams: ['AFC Champion', 'NFC Champion'],
      league: 'NFL',
      status: 'on_sale',
      capacity: 65000,
      ticketsSold: 65000,
      rating: 5.0,
      reviewCount: 3456,
      isFeatured: true,
      isTrending: true,
      tags: ['football', 'super bowl', 'championship'],
    },
    
    // Theater
    { 
      id: 3001, 
      title: 'Hamilton', 
      slug: 'hamilton-broadway-2024',
      description: 'Lin-Manuel Miranda\'s groundbreaking musical about Alexander Hamilton.',
      longDescription: 'Hamilton is a musical about the life of American Founding Father Alexander Hamilton, with music, lyrics, and book by Lin-Manuel Miranda. The show has won numerous awards including 11 Tony Awards and a Pulitzer Prize for Drama. It blends hip-hop, jazz, R&B, and Broadway styles.',
      category: 'theater',
      subcategory: 'musicals',
      date: '2024-09-01T19:00:00',
      endDate: '2024-09-01T22:00:00',
      venue: 'Richard Rodgers Theatre',
      venueId: 6,
      city: 'New York',
      state: 'NY',
      country: 'USA',
      price: 199.99,
      minPrice: 129.99,
      maxPrice: 599.99,
      image: '/images/events/hamilton.jpg',
      images: ['/images/events/hamilton-1.jpg', '/images/events/hamilton-2.jpg'],
      cast: ['Miguel Cervantes', 'Krystal Joy Brown'],
      writer: 'Lin-Manuel Miranda',
      status: 'on_sale',
      capacity: 1319,
      ticketsSold: 1300,
      rating: 4.9,
      reviewCount: 4567,
      isFeatured: true,
      isTrending: false,
      tags: ['musical', 'broadway', 'theater'],
    },
  ],

  // Venues
  venues: [
    { id: 1, name: 'MetLife Stadium', city: 'East Rutherford', state: 'NJ', country: 'USA', capacity: 82500, image: '/images/venues/metlife.jpg' },
    { id: 2, name: 'Madison Square Garden', city: 'New York', state: 'NY', country: 'USA', capacity: 20000, image: '/images/venues/msg.jpg' },
    { id: 3, name: 'SoFi Stadium', city: 'Inglewood', state: 'CA', country: 'USA', capacity: 70000, image: '/images/venues/sofi.jpg' },
    { id: 4, name: 'TD Garden', city: 'Boston', state: 'MA', country: 'USA', capacity: 19580, image: '/images/venues/tdgarden.jpg' },
    { id: 5, name: 'Allegiant Stadium', city: 'Las Vegas', state: 'NV', country: 'USA', capacity: 65000, image: '/images/venues/allegiant.jpg' },
    { id: 6, name: 'Richard Rodgers Theatre', city: 'New York', state: 'NY', country: 'USA', capacity: 1319, image: '/images/venues/richard-rodgers.jpg' },
  ],

  // Artists
  artists: [
    { id: 1, name: 'Taylor Swift', genre: 'Pop', followers: '95M', image: '/images/artists/taylor-swift.jpg' },
    { id: 2, name: 'Ed Sheeran', genre: 'Pop', followers: '85M', image: '/images/artists/ed-sheeran.jpg' },
    { id: 3, name: 'Beyoncé', genre: 'R&B', followers: '80M', image: '/images/artists/beyonce.jpg' },
  ],
};

/**
 * Get all categories
 */
export const getAllCategories = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_DATA.categories;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.categories.find(cat => cat.slug === slug);
};

/**
 * Get category data for category page (with events, subcategories, etc.)
 */
export const getCategoryData = async (categorySlug) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const category = MOCK_DATA.categories.find(cat => cat.slug === categorySlug);
  if (!category) return null;

  const subcategories = MOCK_DATA.subcategories[categorySlug] || [];
  
  // Get events for this category
  const categoryEvents = MOCK_DATA.events.filter(event => event.category === categorySlug);
  
  // Featured events (first 3)
  const featuredEvents = categoryEvents.slice(0, 3);
  
  // Hero events (first 5 for carousel)
  const heroEvents = categoryEvents.slice(0, 5);
  
  // Upcoming events (next 8)
  const upcomingEvents = categoryEvents.slice(3, 11);
  
  // Trending events (based on rating and sold count)
  const trendingEvents = [...categoryEvents]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6);
  
  // Stats for the category
  const stats = {
    totalEvents: categoryEvents.length,
    totalTicketsSold: categoryEvents.reduce((sum, e) => sum + (e.ticketsSold || 0), 0),
    averageRating: categoryEvents.reduce((sum, e) => sum + (e.rating || 0), 0) / categoryEvents.length || 0,
    venues: [...new Set(categoryEvents.map(e => e.venue))].length,
  };

  return {
    ...category,
    heroEvents,
    featuredEvents,
    subcategories,
    upcomingEvents,
    trendingEvents,
    stats,
  };
};

/**
 * Get subcategories by category slug
 */
export const getSubcategoriesByCategory = async (categorySlug) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.subcategories[categorySlug] || [];
};

/**
 * Get subcategory data
 */
export const getSubcategoryData = async (categorySlug, subcategorySlug) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const category = MOCK_DATA.categories.find(cat => cat.slug === categorySlug);
  if (!category) return null;

  const subcategory = MOCK_DATA.subcategories[categorySlug]?.find(sub => sub.slug === subcategorySlug);
  if (!subcategory) return null;

  // Get events for this subcategory
  const events = MOCK_DATA.events.filter(event => 
    event.category === categorySlug && event.subcategory === subcategorySlug
  );

  // Sort events by date
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = events
    .filter(e => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Featured events (top rated)
  const featuredEvents = [...events]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  return {
    ...subcategory,
    category,
    events,
    upcomingEvents,
    pastEvents,
    featuredEvents,
    totalEvents: events.length,
  };
};

/**
 * Get all events (with optional filters)
 */
export const getAllEvents = async (filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  let events = [...MOCK_DATA.events];

  // Apply filters
  if (filters.category) {
    events = events.filter(e => e.category === filters.category);
  }
  if (filters.subcategory) {
    events = events.filter(e => e.subcategory === filters.subcategory);
  }
  if (filters.city) {
    events = events.filter(e => e.city === filters.city);
  }
  if (filters.minPrice) {
    events = events.filter(e => e.price >= filters.minPrice);
  }
  if (filters.maxPrice) {
    events = events.filter(e => e.price <= filters.maxPrice);
  }
  if (filters.date) {
    const filterDate = new Date(filters.date);
    events = events.filter(e => new Date(e.date).toDateString() === filterDate.toDateString());
  }
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    events = events.filter(e => 
      e.title.toLowerCase().includes(searchLower) ||
      e.artist?.toLowerCase().includes(searchLower) ||
      e.venue.toLowerCase().includes(searchLower)
    );
  }

  return events;
};

/**
 * Get featured events
 */
export const getFeaturedEvents = async (limit = 6) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.events.filter(e => e.isFeatured).slice(0, limit);
};

/**
 * Get trending events
 */
export const getTrendingEvents = async (limit = 6) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.events.filter(e => e.isTrending).slice(0, limit);
};

/**
 * Get upcoming events
 */
export const getUpcomingEvents = async (limit = 8) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const now = new Date();
  return MOCK_DATA.events
    .filter(e => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit);
};

/**
 * Get event by slug
 */
export const getEventBySlug = async (slug) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_DATA.events.find(e => e.slug === slug);
};

/**
 * Get event by ID
 */
export const getEventById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.events.find(e => e.id === parseInt(id));
};

/**
 * Get event details with related data
 */
export const getEventDetails = async (slug) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const event = MOCK_DATA.events.find(e => e.slug === slug);
  if (!event) return null;

  // Get venue details
  const venue = MOCK_DATA.venues.find(v => v.id === event.venueId);

  // Get artist details if applicable
  let artist = null;
  if (event.artist) {
    artist = MOCK_DATA.artists.find(a => a.name === event.artist);
  }

  // Get related events (same category or venue)
  const relatedEvents = MOCK_DATA.events
    .filter(e => 
      e.id !== event.id && 
      (e.category === event.category || e.venueId === event.venueId)
    )
    .slice(0, 4);

  // Get available ticket types
  const ticketTypes = [
    { type: 'General Admission', price: event.price, available: 100, maxPerOrder: 8 },
    { type: 'VIP', price: event.maxPrice, available: 20, maxPerOrder: 4 },
    { type: 'Early Bird', price: event.minPrice, available: 50, maxPerOrder: 6 },
  ];

  // Get seating sections if available
  const seatingSections = event.capacity ? [
    { section: 'Floor', rows: ['A', 'B', 'C', 'D'], seatsPerRow: 20, price: event.maxPrice },
    { section: '100 Level', rows: ['101-110'], seatsPerRow: 15, price: event.price },
    { section: '200 Level', rows: ['201-220'], seatsPerRow: 12, price: event.minPrice },
  ] : null;

  return {
    ...event,
    venue,
    artist,
    relatedEvents,
    ticketTypes,
    seatingSections,
  };
};

/**
 * Search events
 */
export const searchEvents = async (query, filters = {}) => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  let results = MOCK_DATA.events.filter(event => 
    event.title.toLowerCase().includes(query.toLowerCase()) ||
    event.artist?.toLowerCase().includes(query.toLowerCase()) ||
    event.venue.toLowerCase().includes(query.toLowerCase()) ||
    event.city.toLowerCase().includes(query.toLowerCase())
  );

  // Apply additional filters
  if (filters.category) {
    results = results.filter(e => e.category === filters.category);
  }
  if (filters.date) {
    results = results.filter(e => e.date.startsWith(filters.date));
  }

  return results;
};

/**
 * Get events by venue
 */
export const getEventsByVenue = async (venueId) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.events.filter(e => e.venueId === parseInt(venueId));
};

/**
 * Get events by artist
 */
export const getEventsByArtist = async (artistName) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return MOCK_DATA.events.filter(e => e.artist === artistName);
};

/**
 * Get popular cities for events
 */
export const getPopularCities = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  const cities = [...new Set(MOCK_DATA.events.map(e => e.city))];
  return cities.map(city => ({
    name: city,
    count: MOCK_DATA.events.filter(e => e.city === city).length,
  }));
};

// Export all functions
export default {
  getAllCategories,
  getCategoryBySlug,
  getCategoryData,
  getSubcategoriesByCategory,
  getSubcategoryData,
  getAllEvents,
  getFeaturedEvents,
  getTrendingEvents,
  getUpcomingEvents,
  getEventBySlug,
  getEventById,
  getEventDetails,
  searchEvents,
  getEventsByVenue,
  getEventsByArtist,
  getPopularCities,
};