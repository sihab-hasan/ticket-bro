// src/data/serviceTypes.js

// Helper function to generate realistic events
const generateEvents = (subCategoryId, count = 10) => {
  const events = [];
  
  const venues = {
    // Entertainment
    'rock-concerts': ['Madison Square Garden', 'Staples Center', 'Wembley Stadium', 'Red Rocks Amphitheatre', 'MSG Sphere', 'O2 Arena', 'Accor Stadium', 'Tokyo Dome'],
    'jazz-concerts': ['Blue Note Jazz Club', 'Birdland', "Ronnie Scott's", 'Village Vanguard', 'Blue Note Tokyo', 'Jazz Standard', 'Yoshi\'s', 'The Jazz Showcase'],
    'classical-concerts': ['Carnegie Hall', 'Royal Albert Hall', 'Sydney Opera House', 'Vienna State Opera', 'Berlin Philharmonic', 'Boston Symphony Hall', 'Amsterdam Concertgebouw', 'Moscow Conservatory'],
    'pop-concerts': ['O2 Arena', 'Rod Laver Arena', 'Tokyo Dome', 'Accor Stadium', 'AT&T Stadium', 'Maracanã Stadium', 'Optus Stadium', 'Mercedes-Benz Stadium'],
    'indie-concerts': ['Bowery Ballroom', 'The Fillmore', 'Paradise Rock Club', 'The Echo', 'The Troubadour', 'The Roxy', 'The Independent', 'The Crocodile'],
    'musicals': ['Broadway Theatre', 'West End', 'Pantages Theatre', 'Cadillac Palace Theatre', 'Majestic Theatre', 'Richard Rodgers Theatre', 'Gershwin Theatre', 'Lyceum Theatre'],
    'plays': ['The Public Theater', 'The Globe Theatre', 'Steppenwolf Theatre', 'Goodman Theatre', 'Almeida Theatre', 'Young Vic', 'Royal Court Theatre', 'Donmar Warehouse'],
    'opera': ['Metropolitan Opera House', 'La Scala', 'Royal Opera House', 'Paris Opera', 'Vienna State Opera', 'Sydney Opera House', 'Teatro Real', 'Bayerische Staatsoper'],
    'ballet': ['Bolshoi Theatre', 'Mariinsky Theatre', 'American Ballet Theatre', 'Royal Ballet', 'Paris Opera Ballet', 'New York City Ballet', 'San Francisco Ballet', 'Australian Ballet'],
    'stand-up': ['Comedy Cellar', 'The Comedy Store', 'Laugh Factory', 'The Improv', 'Apollo Theater', 'Just For Laughs Theatre', 'Comedy Central Stage', 'The Punchline'],
    
    // Sports
    'premier-league': ['Old Trafford', 'Anfield', 'Emirates Stadium', 'Etihad Stadium', 'Stamford Bridge', 'Tottenham Hotspur Stadium', 'Villa Park', 'St. James\' Park'],
    'champions-league': ['Santiago Bernabéu', 'Camp Nou', 'Allianz Arena', 'San Siro', 'Parc des Princes', 'Signal Iduna Park', 'Estádio da Luz', 'Amsterdam Arena'],
    'world-cup': ['Lusail Stadium', 'Maracanã', 'Rose Bowl', 'Olympiastadion', 'Luzhniki Stadium', 'Stade de France', 'FNB Stadium', 'Estadio Azteca'],
    'nba': ['Madison Square Garden', 'Crypto.com Arena', 'Chase Center', 'United Center', 'TD Garden', 'Footprint Center', 'American Airlines Arena', 'Barclays Center'],
    'nfl': ['AT&T Stadium', 'Lambeau Field', 'Arrowhead Stadium', 'Mercedes-Benz Superdome', 'Gillette Stadium', 'Levi\'s Stadium', 'SoFi Stadium', 'Allegiant Stadium'],
    'nhl': ['Bell Centre', 'Madison Square Garden', 'United Center', 'TD Garden', 'Rogers Arena', 'Scotiabank Arena', 'Wells Fargo Center', 'Amalie Arena'],
    'mlb': ['Yankee Stadium', 'Dodger Stadium', 'Fenway Park', 'Wrigley Field', 'Oracle Park', 'Busch Stadium', 'Coors Field', 'Petco Park'],
    
    // Travel
    'hiking': ['Rocky Mountains', 'Swiss Alps', 'Patagonia', 'Himalayas', 'Andes Mountains', 'Dolomites', 'Scottish Highlands', 'New Zealand Alps'],
    'camping': ['Yosemite National Park', 'Banff National Park', 'Lake District', 'Black Forest', 'Grand Canyon', 'Zion National Park', 'Glacier National Park', 'Acadia National Park'],
    'safari': ['Kruger National Park', 'Masai Mara', 'Serengeti', 'Okavango Delta', 'Ngorongoro Crater', 'Chobe National Park', 'South Luangwa', 'Etosha National Park'],
    
    // Wellness
    'spa': ['Mandarin Oriental Spa', 'Six Senses Spa', 'Aman Spa', 'COMO Shambhala', 'Chiva-Som', 'Ananda Spa', 'Rancho La Puerta', 'Cal-a-Vie'],
    'yoga': ['Yoga Barn Bali', 'Yoga Works', 'CorePower Yoga', 'Kripalu Center', 'Omega Institute', 'Esalen Institute', 'Yoga Retreat Costa Rica', 'Sivananda Ashram'],
    
    // Food & Drink
    'michelin': ['Eleven Madison Park', 'Osteria Francescana', 'Mirazur', 'El Celler de Can Roca', 'Noma', 'Geranium', 'Asador Etxebarri', 'Central'],
    'wine': ['Napa Valley', 'Bordeaux', 'Tuscany', 'Rioja', 'Mendoza', 'Burgundy', 'Champagne', 'Barossa Valley'],
    
    // Technology
    'tech-conferences': ['CES', 'Web Summit', 'MWC Barcelona', 'TechCrunch Disrupt', 'Google I/O', 'Apple WWDC', 'Microsoft Build', 'AWS re:Invent'],
    'hackathons': ['TechCrunch Hackathon', 'MIT Hackathon', 'NASA Space Apps', 'AngelHack', 'Major League Hacking', 'HackZurich', 'CalHacks', 'HackMIT'],
    
    // Business
    'networking': ['Forbes Conference', 'TED Conference', 'World Economic Forum', 'Fortune Summit', 'Entrepreneur 360', 'INC 5000', 'Fast Company Innovation'],
    
    // Arts
    'art-exhibitions': ['Art Basel', 'Frieze Art Fair', 'The Armory Show', 'Venice Biennale', 'Documenta', 'TEFAF Maastricht', 'FIAC Paris'],
    
    // Photography
    'photo-workshops': ['National Geographic Workshops', 'Maine Media Workshops', 'Santa Fe Workshops', 'Gulf Photo Plus'],
    
    // Fashion
    'fashion-weeks': ['Paris Fashion Week', 'Milan Fashion Week', 'New York Fashion Week', 'London Fashion Week', 'Tokyo Fashion Week', 'Berlin Fashion Week'],
    
    // Automotive
    'auto-shows': ['Geneva Motor Show', 'Frankfurt Motor Show', 'Detroit Auto Show', 'Paris Motor Show', 'Tokyo Auto Salon', 'SEMA Show'],
    
    // Literature
    'book-fairs': ['Frankfurt Book Fair', 'Guadalajara Book Fair', 'Bologna Book Fair', 'London Book Fair', 'Jaipur Literature Festival'],
    
    // Gaming
    'gaming-conventions': ['E3', 'Gamescom', 'Tokyo Game Show', 'PAX West', 'GDC', 'BlizzCon', 'EVO Championship Series'],
    
    // Comics
    'comic-cons': ['San Diego Comic-Con', 'New York Comic Con', 'WonderCon', 'Emerald City Comic Con', 'MCM London Comic Con'],
    
    // Home & Garden
    'home-shows': ['Ideal Home Show', 'Chelsea Flower Show', 'Philadelphia Flower Show', 'National Home Show'],
    
    // Science
    'science-festivals': ['World Science Festival', 'Edinburgh Science Festival', 'Cambridge Science Festival', 'Chelsea Science Festival'],
    
    // Spirituality
    'spiritual-gatherings': ['Burning Man', 'Kumbh Mela', 'Hajj', 'Camino de Santiago', 'Mahashivratri Celebration']
  };

  const eventNames = {
    // Entertainment
    'rock-concerts': ['Rock the Night', 'Summer Rock Fest', 'Classic Rock Revival', 'Rock Legends Tour', 'Metal Mayhem', 'Alternative Nation'],
    'jazz-concerts': ['Smooth Jazz Evening', 'Jazz & Blues Festival', 'Latin Jazz Night', 'Jazz in the Park', 'Jazz Masters Series', 'Women in Jazz'],
    'pop-concerts': ['Pop Sensation Tour', 'Summer Pop Hits', 'Teen Pop Extravaganza', 'Pop Classics', 'Top 40 Live', 'Boy Band Reunion'],
    'musicals': ['The Phantom of the Opera', 'Les Misérables', 'Hamilton', 'The Lion King', 'Wicked', 'Dear Evan Hansen'],
    
    // Sports
    'premier-league': ['Man United vs Liverpool', 'Arsenal vs Chelsea', 'Manchester Derby', 'North London Derby', 'Merseyside Derby', 'Boxing Day Matches'],
    'nba': ['Lakers vs Celtics', 'NBA Finals Game', 'Christmas Day Games', 'Playoff Showdown', 'All-Star Weekend', 'Rookie Showcase'],
    'super-bowl': ['Super Bowl LVIII', 'Super Bowl Halftime Show', 'Super Bowl Experience', 'Super Bowl Opening Night'],
    'world-cup': ['World Cup Final', 'World Cup Semi-Final', 'Opening Match', 'Group Stage Decider', 'Round of 16'],
    'olympics': ['Opening Ceremony', 'Closing Ceremony', 'Athletics Finals', 'Swimming Finals', 'Gymnastics Finals', 'Basketball Gold Medal Game'],
    
    // Travel
    'safari': ['Sunset Safari Drive', 'Big Five Tour', 'Photographic Safari', 'Luxury Safari Camp', 'Walking Safari', 'Night Safari'],
    'yacht-charters': ['Luxury Yacht Cruise', 'Island Hopping Yacht', 'Sunset Sailing', 'Private Catamaran Tour', 'Superyacht Experience'],
    'space-travel': ['Suborbital Space Flight', 'Zero-G Experience', 'Space Tourism Launch', 'Astronaut Training Experience'],
    
    // Wellness
    'meditation': ['Silent Meditation Retreat', 'Mindfulness Workshop', 'Vipassana Course', 'Guided Meditation Session', 'Sound Bath Healing'],
    'detox': ['7-Day Detox Retreat', 'Ayurvedic Panchakarma', 'Juice Cleanse Program', 'Holistic Detox Week'],
    
    // Food & Drink
    'wine-tasting': ['Grand Cru Tasting', 'Vineyard Tour & Tasting', 'Wine & Cheese Pairing', 'Champagne Masterclass', 'Vertical Tasting'],
    'whisky-tasting': ['Scotch Whisky Experience', 'Bourbon Tasting', 'Japanese Whisky Tasting', 'Whisky & Cigar Pairing'],
    'molecular-gastronomy': ['Science of Food Workshop', 'Molecular Mixology Class', 'Chef\'s Table Experience', 'Experimental Dining'],
    
    // Technology
    'ai-summit': ['AI in Healthcare Summit', 'Machine Learning Conference', 'Deep Learning Workshop', 'AI Ethics Forum', 'Neural Networks Symposium'],
    'blockchain': ['Blockchain World Conference', 'Crypto Summit', 'DeFi Forum', 'NFT Exhibition', 'Web3 Developer Conference'],
    'vr-ar': ['VR World Congress', 'AR/VR Innovation Summit', 'Metaverse Expo', 'XR Developer Conference'],
    
    // Business
    'pitch-competitions': ['Startup Pitch Night', 'Venture Capital Summit', 'Angel Investor Meetup', 'Demo Day', 'Pitch Perfect Competition'],
    
    // Career
    'job-fairs': ['Tech Job Fair', 'Healthcare Career Expo', 'Engineering Job Fair', 'Remote Work Summit', 'Diversity in Tech Fair'],
    
    // Real Estate
    'property-shows': ['International Property Show', 'Luxury Real Estate Expo', 'Commercial Property Fair', 'Off-Plan Property Exhibition'],
    
    // Sustainability
    'green-events': ['Climate Action Summit', 'Sustainable Living Expo', 'Green Tech Conference', 'Zero Waste Workshop', 'Eco Tourism Summit'],
    
    // Parenting
    'parenting-workshops': ['Positive Parenting Seminar', 'Baby Care Workshop', 'Teen Parenting Summit', 'Work-Life Balance for Parents'],
    
    // Relationships
    'dating-events': ['Speed Dating Night', 'Singles Mixer', 'Couples Workshop', 'Relationship Seminar', 'Wedding Planning Expo'],
    
    // Mental Health
    'mental-health': ['Anxiety Workshop', 'Stress Management Seminar', 'Mental Health Awareness', 'Therapy Conference', 'Wellbeing Festival'],
    
    // Cryptocurrency
    'crypto-events': ['Bitcoin Conference', 'Ethereum Summit', 'Crypto Mining Expo', 'DeFi Summit', 'NFT.NYC'],
    
    // Esports
    'esports': ['League of Legends World Championship', 'The International Dota 2', 'CS:GO Major', 'Fortnite World Cup', 'Esports Awards'],
    
    // Streaming
    'streaming-conventions': ['TwitchCon', 'YouTube Creator Summit', 'StreamCon', 'Influencer Expo'],
    
    // Digital Art
    'digital-art': ['NFT Art Exhibition', 'Digital Art Fair', 'Crypto Art Show', 'Generative Art Workshop'],
    
    // Pottery
    'pottery-workshops': ['Wheel Throwing Class', 'Hand Building Workshop', 'Ceramics Studio Session', 'Raku Firing Experience'],
    
    // Astronomy
    'stargazing': ['Astronomy Night', 'Meteor Shower Viewing', 'Telescope Workshop', 'Planetarium Show', 'Star Party'],
    
    // Survival
    'survival-training': ['Wilderness Survival Course', 'Bushcraft Workshop', 'Survival Skills Weekend', 'Emergency Preparedness Training'],
    
    // Beekeeping
    'beekeeping': ['Beginner Beekeeping Class', 'Honey Harvesting Workshop', 'Urban Beekeeping', 'Apiary Tour'],
    
    // Foraging
    'foraging': ['Wild Food Foraging', 'Mushroom Hunting', 'Edible Plants Walk', 'Seaweed Foraging'],
    
    // Falconry
    'falconry': ['Falconry Experience', 'Birds of Prey Display', 'Falconry Workshop', 'Hawk Walk'],
    
    // Paragliding
    'paragliding': ['Tandem Paragliding Flight', 'Paragliding Course', 'Thermal Flying Workshop', 'Cross Country Paragliding'],
    
    // Skydiving
    'skydiving': ['Tandem Skydive', 'AFF Course', 'Formation Skydiving Camp', 'Wingsuit Training'],
    
    // Boxing
    'boxing': ['Boxing Championship', 'Title Fight', 'Amateur Boxing Tournament', 'Boxing Training Camp'],
    
    // MMA
    'mma': ['UFC Fight Night', 'Bellator Championship', 'MMA Training Camp', 'Grappling Tournament'],
    
    // Wrestling
    'wrestling': ['WWE Live Event', 'AEW Dynamite', 'Pro Wrestling Training', 'Wrestling Camp'],
    
    // Sumo
    'sumo': ['Sumo Tournament', 'Sumo Wrestling Exhibition', 'Sumo Stable Visit', 'Sumo Training Session'],
    
    // Archery
    'archery': ['Archery Tournament', 'Traditional Archery Workshop', '3D Archery Shoot', 'Archery Training Camp'],
    
    // Fencing
    'fencing': ['Fencing Tournament', 'Epee Workshop', 'Foil Training Camp', 'Historical Fencing Class'],
    
    // Kayaking
    'kayaking': ['White Water Kayaking', 'Sea Kayaking Tour', 'Kayaking Clinic', 'Rolling Workshop'],
    
    // Rafting
    'rafting': ['White Water Rafting', 'Family Rafting Trip', 'Extreme Rafting', 'Rafting Guide Training'],
    
    // Canyoning
    'canyoning': ['Canyoning Adventure', 'Canyon Exploration', 'Waterfall Abseiling', 'Canyoning Training'],
    
    // Cave Exploration
    'caving': ['Cave Exploration Tour', 'Caving Expedition', 'Speleology Workshop', 'Underground Adventure'],
    
    // Volcano Tours
    'volcano-tours': ['Volcano Hiking', 'Lava Viewing Tour', 'Crater Exploration', 'Volcanic Valley Walk'],
    
    // Glacial Tours
    'glacier-tours': ['Glacier Hiking', 'Ice Cave Exploration', 'Glacier Lagoon Tour', 'Ice Climbing Experience'],
    
    // Aurora Viewing
    'aurora-viewing': ['Northern Lights Tour', 'Aurora Photography', 'Arctic Night Experience', 'Aurora Camping'],
    
    // Hot Air Balloon
    'hot-air-balloon': ['Hot Air Balloon Ride', 'Balloon Festival', 'Sunrise Balloon Tour', 'Balloon Pilot Course'],
    
    // Helicopter Tours
    'helicopter-tours': ['Helicopter Sightseeing', 'Grand Canyon Helicopter Tour', 'City Helicopter Tour', 'Helicopter Wine Tour'],
    
    // Train Journeys
    'train-journeys': ['Orient Express Journey', 'Rocky Mountaineer', 'Trans-Siberian Railway', 'Glacier Express', 'Blue Train']
  };

  const venueList = venues[subCategoryId] || ['City Convention Center', 'Grand Hotel', 'Exhibition Hall', 'Conference Center', 'Stadium', 'Arena', 'Theater', 'Park', 'Beach Club', 'Mountain Resort'];
  const nameList = eventNames[subCategoryId] || [`${subCategoryId.replace(/-/g, ' ')} Experience`, 'Premium Event', 'VIP Experience', 'Exclusive Show'];

  for (let i = 1; i <= count; i++) {
    const randomVenue = venueList[Math.floor(Math.random() * venueList.length)];
    const randomName = nameList[Math.floor(Math.random() * nameList.length)] || `${subCategoryId.replace(/-/g, ' ')} Event`;
    const randomPrice = Math.floor(Math.random() * (2000 - 50) + 50);
    const randomRating = (Math.random() * (5 - 3.8) + 3.8).toFixed(1);
    const randomAttendees = Math.floor(Math.random() * 10000) + 100;
    
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 365));
    
    events.push({
      id: `${subCategoryId}-event-${i}`,
      title: randomName + (i > 1 ? ` ${i}` : ''),
      date: date.toISOString().split('T')[0],
      time: `${Math.floor(Math.random() * 12) + 8}:00 ${['AM', 'PM'][Math.floor(Math.random() * 2)]}`,
      venue: randomVenue,
      address: `${Math.floor(Math.random() * 1000)} Main St, City, State`,
      price: randomPrice,
      originalPrice: randomPrice * 1.2,
      image: `/api/placeholder/400/200`,
      rating: parseFloat(randomRating),
      attendees: randomAttendees,
      capacity: randomAttendees + Math.floor(Math.random() * 5000),
      remainingTickets: Math.floor(Math.random() * 1000),
      description: `Experience the best ${subCategoryId.replace(/-/g, ' ')} event of the year. Featuring top artists, amazing atmosphere, and unforgettable moments.`,
      organizer: ['Live Nation', 'AEG Presents', 'Local Promotions', 'International Events', 'Global Concerts'][Math.floor(Math.random() * 5)],
      category: subCategoryId.split('-')[0],
      tags: [subCategoryId, 'featured', 'trending'].slice(0, Math.floor(Math.random() * 2) + 1),
      isHot: Math.random() > 0.7,
      isTrending: Math.random() > 0.6,
      isSoldOut: Math.random() > 0.9,
      isVIP: Math.random() > 0.8
    });
  }
  
  return events;
};

// Helper function to generate routes
const generateRoutes = (subCategoryId, count = 3) => {
  const routes = [];
  
  const routeNames = {
    'hiking': ['Appalachian Trail', 'Pacific Crest Trail', 'Mount Everest Base Camp', 'Inca Trail', 'Tour du Mont Blanc', 'John Muir Trail', 'Continental Divide Trail', 'Camino de Santiago'],
    'trekking': ['Annapurna Circuit', 'Everest Base Camp Trek', 'Karakoram Highway', 'Snowman Trek', 'Laugavegur Trail', 'Overland Track', 'Milford Track'],
    'cycling': ['Tour de France Route', 'Giro d\'Italia Stages', 'Pacific Coast Highway', 'Great Divide Mountain Bike Route', 'Danube Cycle Path'],
    'kayaking': ['Colorado River', 'Fjord Kayaking Route', 'Sea of Cortez', 'Amazon River Expedition', 'Norwegian Fjords'],
    'safari': ['Serengeti Migration Route', 'Kruger Wildlife Drive', 'Okavango Delta Exploration', 'Masai Mara Circuit', 'Chobe River Safari'],
    'scuba': ['Great Barrier Reef', 'Blue Hole Belize', 'Maldives Atolls', 'Red Sea Reef', 'Galapagos Islands'],
    'skiing': ['Haute Route', 'Ski Safari Circuit', 'Alps Traverse', 'Backcountry Powder Tour', 'Glacier Skiing Route'],
    'climbing': ['Seven Summits', 'Alpine Trilogy', 'Patagonian Peaks', 'Dolomites Via Ferrata', 'Yosemite Big Walls']
  };

  const difficulties = ['Easy', 'Moderate', 'Challenging', 'Difficult', 'Extreme', 'Expert Only'];
  const durations = ['2-3 hours', 'Half day', 'Full day', '2 days', '3-5 days', '1 week', '2 weeks', '3 weeks', '1 month'];
  const distances = ['1-2 miles', '2-5 miles', '5-10 miles', '10-15 miles', '15-20 miles', '20-30 miles', '30-50 miles', '50+ miles'];
  const elevations = ['0-500 ft', '500-1000 ft', '1000-2500 ft', '2500-5000 ft', '5000-8000 ft', '8000+ ft'];

  const nameList = routeNames[subCategoryId] || [`${subCategoryId.replace(/-/g, ' ')} Adventure Route`];

  for (let i = 1; i <= count; i++) {
    const randomName = nameList[Math.floor(Math.random() * nameList.length)] + (i > 1 ? ` Route ${i}` : '');
    const randomDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const randomDuration = durations[Math.floor(Math.random() * durations.length)];
    const randomDistance = distances[Math.floor(Math.random() * distances.length)];
    const randomElevation = elevations[Math.floor(Math.random() * elevations.length)];
    const randomRating = (Math.random() * (5 - 3.8) + 3.8).toFixed(1);
    
    routes.push({
      id: `${subCategoryId}-route-${i}`,
      name: randomName,
      difficulty: randomDifficulty,
      duration: randomDuration,
      distance: randomDistance,
      elevation: randomElevation,
      rating: parseFloat(randomRating),
      reviews: Math.floor(Math.random() * 1000) + 50,
      image: `/api/placeholder/400/200`,
      startPoint: ['Trailhead Parking', 'Visitor Center', 'Base Camp', 'Mountain Lodge', 'Ranger Station'][Math.floor(Math.random() * 5)],
      endPoint: ['Summit', 'Viewpoint', 'Campground', 'Train Station', 'Beach'][Math.floor(Math.random() * 5)],
      coordinates: `${(Math.random() * 180 - 90).toFixed(4)}°, ${(Math.random() * 360 - 180).toFixed(4)}°`,
      description: `Experience this amazing ${randomDifficulty.toLowerCase()} difficulty route with stunning views and unforgettable scenery.`,
      longDescription: `This ${randomDifficulty.toLowerCase()} route offers breathtaking views, challenging terrain, and unforgettable experiences. Perfect for adventure seekers and nature lovers.`,
      bestSeason: ['Spring', 'Summer', 'Fall', 'Winter', 'Year-round'][Math.floor(Math.random() * 5)],
      facilities: ['Parking', 'Restrooms', 'Water stations', 'Campsites', 'Visitor center', 'Picnic areas', 'Showers'].slice(0, Math.floor(Math.random() * 4) + 2),
      warnings: ['Limited cell service', 'Weather changes quickly', 'Steep sections', 'Wildlife active', 'High altitude', 'Rockfall risk'].slice(0, Math.floor(Math.random() * 3) + 1),
      requiredGear: ['Hiking boots', 'Water', 'Snacks', 'First aid kit', 'Map', 'Compass', 'Headlamp'].slice(0, Math.floor(Math.random() * 4) + 3),
      difficulty_level: Math.floor(Math.random() * 5) + 1,
      popularity: Math.floor(Math.random() * 100) + 1
    });
  }
  
  return routes;
};

// MEGA COMPLETE SERVICE TYPES - 20+ Categories, 100+ Categories, 500+ Subcategories
export const serviceTypes = [
  // 1. ENTERTAINMENT & ARTS
  {
    id: "entertainment",
    name: "Entertainment & Arts",
    icon: "🎭",
    color: "#FF6B6B",
    description:
      "Live performances, concerts, theater shows, and cultural events",
    featured: true,
    categories: [
      {
        id: "concerts",
        name: "Concerts & Live Music",
        description: "Live music performances across all genres",
        icon: "🎸",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "rock-concerts",
            name: "Rock Concerts",
            events: generateEvents("rock-concerts", 6),
          },
          {
            id: "jazz-concerts",
            name: "Jazz Concerts",
            events: generateEvents("jazz-concerts", 5),
          },
          {
            id: "classical-concerts",
            name: "Classical Concerts",
            events: generateEvents("classical-concerts", 4),
          },
          {
            id: "pop-concerts",
            name: "Pop Concerts",
            events: generateEvents("pop-concerts", 6),
          },
          {
            id: "indie-concerts",
            name: "Indie Concerts",
            events: generateEvents("indie-concerts", 5),
          },
          {
            id: "electronic-concerts",
            name: "Electronic Music",
            events: generateEvents("electronic-concerts", 5),
          },
          {
            id: "hip-hop-concerts",
            name: "Hip Hop Concerts",
            events: generateEvents("hip-hop-concerts", 6),
          },
          {
            id: "country-concerts",
            name: "Country Music",
            events: generateEvents("country-concerts", 4),
          },
          {
            id: "blues-concerts",
            name: "Blues Concerts",
            events: generateEvents("blues-concerts", 4),
          },
          {
            id: "reggae-concerts",
            name: "Reggae Concerts",
            events: generateEvents("reggae-concerts", 3),
          },
          {
            id: "latin-concerts",
            name: "Latin Music",
            events: generateEvents("latin-concerts", 5),
          },
          {
            id: "world-music",
            name: "World Music",
            events: generateEvents("world-music", 4),
          },
        ],
      },
      {
        id: "theater",
        name: "Theater & Performing Arts",
        description: "Broadway shows, plays, and performing arts",
        icon: "🎭",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "musicals",
            name: "Musicals",
            events: generateEvents("musicals", 6),
          },
          {
            id: "plays",
            name: "Plays & Drama",
            events: generateEvents("plays", 5),
          },
          { id: "opera", name: "Opera", events: generateEvents("opera", 4) },
          { id: "ballet", name: "Ballet", events: generateEvents("ballet", 4) },
          {
            id: "contemporary-dance",
            name: "Contemporary Dance",
            events: generateEvents("contemporary-dance", 4),
          },
          {
            id: "experimental-theater",
            name: "Experimental Theater",
            events: generateEvents("experimental-theater", 3),
          },
          {
            id: "puppetry",
            name: "Puppetry & Marionettes",
            events: generateEvents("puppetry", 3),
          },
          {
            id: "circus-arts",
            name: "Circus Arts",
            events: generateEvents("circus-arts", 4),
          },
          {
            id: "street-theater",
            name: "Street Theater",
            events: generateEvents("street-theater", 3),
          },
          {
            id: "immersive-theater",
            name: "Immersive Theater",
            events: generateEvents("immersive-theater", 4),
          },
        ],
      },
      {
        id: "comedy",
        name: "Comedy",
        description: "Stand-up, improv, and laughter-filled shows",
        icon: "😂",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "stand-up",
            name: "Stand-up Comedy",
            events: generateEvents("stand-up", 6),
          },
          {
            id: "improv",
            name: "Improvisation",
            events: generateEvents("improv", 5),
          },
          {
            id: "sketch-comedy",
            name: "Sketch Comedy",
            events: generateEvents("sketch-comedy", 4),
          },
          {
            id: "comedy-clubs",
            name: "Comedy Clubs",
            events: generateEvents("comedy-clubs", 5),
          },
          {
            id: "roasts",
            name: "Comedy Roasts",
            events: generateEvents("roasts", 3),
          },
          {
            id: "dark-comedy",
            name: "Dark Comedy",
            events: generateEvents("dark-comedy", 3),
          },
          {
            id: "observational-comedy",
            name: "Observational Comedy",
            events: generateEvents("observational-comedy", 4),
          },
          {
            id: "character-comedy",
            name: "Character Comedy",
            events: generateEvents("character-comedy", 3),
          },
        ],
      },
      {
        id: "festivals",
        name: "Festivals & Celebrations",
        description: "Multi-day celebrations of music, film, and culture",
        icon: "🎪",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "music-festivals",
            name: "Music Festivals",
            events: generateEvents("music-festivals", 5),
          },
          {
            id: "film-festivals",
            name: "Film Festivals",
            events: generateEvents("film-festivals", 4),
          },
          {
            id: "food-festivals",
            name: "Food Festivals",
            events: generateEvents("food-festivals", 5),
          },
          {
            id: "cultural-festivals",
            name: "Cultural Festivals",
            events: generateEvents("cultural-festivals", 4),
          },
          {
            id: "arts-festivals",
            name: "Arts Festivals",
            events: generateEvents("arts-festivals", 4),
          },
          {
            id: "beer-festivals",
            name: "Beer Festivals",
            events: generateEvents("beer-festivals", 5),
          },
          {
            id: "wine-festivals",
            name: "Wine Festivals",
            events: generateEvents("wine-festivals", 5),
          },
          {
            id: "comic-cons",
            name: "Comic Cons",
            events: generateEvents("comic-cons", 4),
          },
          {
            id: "renaissance-faires",
            name: "Renaissance Faires",
            events: generateEvents("renaissance-faires", 3),
          },
          {
            id: "pride-festivals",
            name: "Pride Festivals",
            events: generateEvents("pride-festivals", 4),
          },
        ],
      },
      {
        id: "visual-arts",
        name: "Visual Arts",
        description: "Art exhibitions, galleries, and installations",
        icon: "🎨",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "art-exhibitions",
            name: "Art Exhibitions",
            events: generateEvents("art-exhibitions", 5),
          },
          {
            id: "gallery-openings",
            name: "Gallery Openings",
            events: generateEvents("gallery-openings", 6),
          },
          {
            id: "art-fairs",
            name: "Art Fairs",
            events: generateEvents("art-fairs", 4),
          },
          {
            id: "sculpture-exhibits",
            name: "Sculpture Exhibits",
            events: generateEvents("sculpture-exhibits", 3),
          },
          {
            id: "photography-exhibits",
            name: "Photography Exhibits",
            events: generateEvents("photography-exhibits", 4),
          },
          {
            id: "digital-art",
            name: "Digital Art",
            events: generateEvents("digital-art", 4),
          },
          {
            id: "street-art",
            name: "Street Art",
            events: generateEvents("street-art", 3),
          },
          {
            id: "installations",
            name: "Art Installations",
            events: generateEvents("installations", 4),
          },
        ],
      },
      {
        id: "film-cinema",
        name: "Film & Cinema",
        description: "Movie screenings, premieres, and film events",
        icon: "🎬",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "movie-premieres",
            name: "Movie Premieres",
            events: generateEvents("movie-premieres", 5),
          },
          {
            id: "film-screenings",
            name: "Film Screenings",
            events: generateEvents("film-screenings", 6),
          },
          {
            id: "documentary-showings",
            name: "Documentary Showings",
            events: generateEvents("documentary-showings", 4),
          },
          {
            id: "cult-classics",
            name: "Cult Classics",
            events: generateEvents("cult-classics", 4),
          },
          {
            id: "midnight-movies",
            name: "Midnight Movies",
            events: generateEvents("midnight-movies", 3),
          },
          {
            id: "imax-experiences",
            name: "IMAX Experiences",
            events: generateEvents("imax-experiences", 4),
          },
          {
            id: "3d-screenings",
            name: "3D Screenings",
            events: generateEvents("3d-screenings", 3),
          },
          {
            id: "drive-in-theaters",
            name: "Drive-in Theaters",
            events: generateEvents("drive-in-theaters", 4),
          },
        ],
      },
    ],
  },

  // 2. SPORTS & RECREATION
  {
    id: "sports",
    name: "Sports & Recreation",
    icon: "⚽",
    color: "#4ECDC4",
    description: "Live sporting events, matches, and tournaments",
    featured: true,
    categories: [
      {
        id: "football",
        name: "Football (Soccer)",
        description: "The world's most popular sport",
        icon: "⚽",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "premier-league",
            name: "Premier League",
            events: generateEvents("premier-league", 8),
          },
          {
            id: "champions-league",
            name: "Champions League",
            events: generateEvents("champions-league", 7),
          },
          {
            id: "world-cup",
            name: "World Cup",
            events: generateEvents("world-cup", 4),
          },
          {
            id: "euro-cup",
            name: "Euro Cup",
            events: generateEvents("euro-cup", 4),
          },
          {
            id: "copa-america",
            name: "Copa America",
            events: generateEvents("copa-america", 3),
          },
          {
            id: "africa-cup",
            name: "Africa Cup of Nations",
            events: generateEvents("africa-cup", 3),
          },
          {
            id: "asian-cup",
            name: "Asian Cup",
            events: generateEvents("asian-cup", 3),
          },
          {
            id: "gold-cup",
            name: "Gold Cup",
            events: generateEvents("gold-cup", 3),
          },
          {
            id: "la-liga",
            name: "La Liga",
            events: generateEvents("la-liga", 6),
          },
          {
            id: "serie-a",
            name: "Serie A",
            events: generateEvents("serie-a", 6),
          },
          {
            id: "bundesliga",
            name: "Bundesliga",
            events: generateEvents("bundesliga", 6),
          },
          {
            id: "ligue-1",
            name: "Ligue 1",
            events: generateEvents("ligue-1", 5),
          },
          { id: "mls", name: "MLS", events: generateEvents("mls", 5) },
          {
            id: "womens-world-cup",
            name: "Women's World Cup",
            events: generateEvents("womens-world-cup", 4),
          },
          {
            id: "olympic-football",
            name: "Olympic Football",
            events: generateEvents("olympic-football", 4),
          },
        ],
      },
      {
        id: "american-football",
        name: "American Football",
        description: "NFL and college football",
        icon: "🏈",
        image: "/api/placeholder/800/400",
        subcategories: [
          { id: "nfl", name: "NFL Games", events: generateEvents("nfl", 8) },
          {
            id: "super-bowl",
            name: "Super Bowl",
            events: generateEvents("super-bowl", 2),
          },
          {
            id: "college-football",
            name: "College Football",
            events: generateEvents("college-football", 7),
          },
          {
            id: "playoffs",
            name: "NFL Playoffs",
            events: generateEvents("playoffs", 4),
          },
          {
            id: "pro-bowl",
            name: "Pro Bowl",
            events: generateEvents("pro-bowl", 2),
          },
          {
            id: "rose-bowl",
            name: "Rose Bowl",
            events: generateEvents("rose-bowl", 2),
          },
          {
            id: "cotton-bowl",
            name: "Cotton Bowl",
            events: generateEvents("cotton-bowl", 2),
          },
          {
            id: "orange-bowl",
            name: "Orange Bowl",
            events: generateEvents("orange-bowl", 2),
          },
        ],
      },
      {
        id: "basketball",
        name: "Basketball",
        description: "NBA, college, and international basketball",
        icon: "🏀",
        image: "/api/placeholder/800/400",
        subcategories: [
          { id: "nba", name: "NBA Games", events: generateEvents("nba", 8) },
          {
            id: "nba-finals",
            name: "NBA Finals",
            events: generateEvents("nba-finals", 3),
          },
          {
            id: "ncaa-basketball",
            name: "NCAA Basketball",
            events: generateEvents("ncaa-basketball", 7),
          },
          {
            id: "march-madness",
            name: "March Madness",
            events: generateEvents("march-madness", 4),
          },
          {
            id: "euroleague",
            name: "EuroLeague",
            events: generateEvents("euroleague", 5),
          },
          {
            id: "world-cup-basketball",
            name: "FIBA World Cup",
            events: generateEvents("world-cup-basketball", 3),
          },
          {
            id: "olympic-basketball",
            name: "Olympic Basketball",
            events: generateEvents("olympic-basketball", 3),
          },
          { id: "wnba", name: "WNBA", events: generateEvents("wnba", 4) },
          {
            id: "all-star-game",
            name: "NBA All-Star Game",
            events: generateEvents("all-star-game", 2),
          },
        ],
      },
      {
        id: "baseball",
        name: "Baseball",
        description: "MLB and international baseball",
        icon: "⚾",
        image: "/api/placeholder/800/400",
        subcategories: [
          { id: "mlb", name: "MLB Games", events: generateEvents("mlb", 8) },
          {
            id: "world-series",
            name: "World Series",
            events: generateEvents("world-series", 3),
          },
          {
            id: "spring-training",
            name: "Spring Training",
            events: generateEvents("spring-training", 5),
          },
          {
            id: "all-star-game",
            name: "MLB All-Star Game",
            events: generateEvents("all-star-game", 2),
          },
          {
            id: "playoffs",
            name: "MLB Playoffs",
            events: generateEvents("playoffs", 4),
          },
          {
            id: "world-baseball-classic",
            name: "World Baseball Classic",
            events: generateEvents("world-baseball-classic", 3),
          },
          {
            id: "japanese-baseball",
            name: "Japanese Baseball",
            events: generateEvents("japanese-baseball", 4),
          },
          {
            id: "korean-baseball",
            name: "Korean Baseball",
            events: generateEvents("korean-baseball", 4),
          },
          {
            id: "little-league",
            name: "Little League World Series",
            events: generateEvents("little-league", 3),
          },
        ],
      },
      {
        id: "hockey",
        name: "Ice Hockey",
        description: "NHL and international hockey",
        icon: "🏒",
        image: "/api/placeholder/800/400",
        subcategories: [
          { id: "nhl", name: "NHL Games", events: generateEvents("nhl", 7) },
          {
            id: "stanley-cup",
            name: "Stanley Cup Playoffs",
            events: generateEvents("stanley-cup", 4),
          },
          {
            id: "world-championships",
            name: "World Championships",
            events: generateEvents("world-championships", 3),
          },
          {
            id: "olympic-hockey",
            name: "Olympic Hockey",
            events: generateEvents("olympic-hockey", 3),
          },
          {
            id: "world-cup-hockey",
            name: "World Cup of Hockey",
            events: generateEvents("world-cup-hockey", 2),
          },
          { id: "ahl", name: "AHL Games", events: generateEvents("ahl", 4) },
          { id: "khl", name: "KHL Games", events: generateEvents("khl", 4) },
          {
            id: "womens-hockey",
            name: "Women's Hockey",
            events: generateEvents("womens-hockey", 3),
          },
        ],
      },
      {
        id: "tennis",
        name: "Tennis",
        description: "Grand slam tournaments and professional tours",
        icon: "🎾",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "grand-slam",
            name: "Grand Slam",
            events: generateEvents("grand-slam", 5),
          },
          {
            id: "wimbledon",
            name: "Wimbledon",
            events: generateEvents("wimbledon", 3),
          },
          {
            id: "us-open",
            name: "US Open",
            events: generateEvents("us-open", 3),
          },
          {
            id: "french-open",
            name: "French Open",
            events: generateEvents("french-open", 3),
          },
          {
            id: "australian-open",
            name: "Australian Open",
            events: generateEvents("australian-open", 3),
          },
          {
            id: "atp-tour",
            name: "ATP Tour",
            events: generateEvents("atp-tour", 6),
          },
          {
            id: "wta-tour",
            name: "WTA Tour",
            events: generateEvents("wta-tour", 6),
          },
          {
            id: "davis-cup",
            name: "Davis Cup",
            events: generateEvents("davis-cup", 3),
          },
          {
            id: "fed-cup",
            name: "Fed Cup",
            events: generateEvents("fed-cup", 3),
          },
        ],
      },
      {
        id: "golf",
        name: "Golf",
        description: "PGA Tour and major championships",
        icon: "🏌️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "pga-tour",
            name: "PGA Tour",
            events: generateEvents("pga-tour", 7),
          },
          {
            id: "the-masters",
            name: "The Masters",
            events: generateEvents("the-masters", 2),
          },
          {
            id: "pga-championship",
            name: "PGA Championship",
            events: generateEvents("pga-championship", 2),
          },
          {
            id: "us-open-golf",
            name: "US Open Golf",
            events: generateEvents("us-open-golf", 2),
          },
          {
            id: "the-open",
            name: "The Open Championship",
            events: generateEvents("the-open", 2),
          },
          {
            id: "ryder-cup",
            name: "Ryder Cup",
            events: generateEvents("ryder-cup", 2),
          },
          {
            id: "presidents-cup",
            name: "Presidents Cup",
            events: generateEvents("presidents-cup", 2),
          },
          {
            id: "lpga-tour",
            name: "LPGA Tour",
            events: generateEvents("lpga-tour", 5),
          },
          {
            id: "european-tour",
            name: "European Tour",
            events: generateEvents("european-tour", 5),
          },
        ],
      },
      {
        id: "motorsports",
        name: "Motorsports",
        description: "Racing events across multiple disciplines",
        icon: "🏎️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "formula-1",
            name: "Formula 1",
            events: generateEvents("formula-1", 6),
          },
          {
            id: "moto-gp",
            name: "Moto GP",
            events: generateEvents("moto-gp", 5),
          },
          { id: "nascar", name: "NASCAR", events: generateEvents("nascar", 6) },
          {
            id: "indycar",
            name: "IndyCar",
            events: generateEvents("indycar", 4),
          },
          {
            id: "world-rally",
            name: "World Rally Championship",
            events: generateEvents("world-rally", 4),
          },
          {
            id: "le-mans",
            name: "24 Hours of Le Mans",
            events: generateEvents("le-mans", 2),
          },
          {
            id: "daytona-500",
            name: "Daytona 500",
            events: generateEvents("daytona-500", 2),
          },
          {
            id: "monaco-gp",
            name: "Monaco Grand Prix",
            events: generateEvents("monaco-gp", 2),
          },
          {
            id: "drag-racing",
            name: "Drag Racing",
            events: generateEvents("drag-racing", 4),
          },
          {
            id: "motocross",
            name: "Motocross",
            events: generateEvents("motocross", 4),
          },
        ],
      },
      {
        id: "combat-sports",
        name: "Combat Sports",
        description: "Boxing, MMA, and wrestling events",
        icon: "🥊",
        image: "/api/placeholder/800/400",
        subcategories: [
          { id: "boxing", name: "Boxing", events: generateEvents("boxing", 6) },
          { id: "ufc", name: "UFC", events: generateEvents("ufc", 5) },
          {
            id: "wrestling",
            name: "Wrestling",
            events: generateEvents("wrestling", 5),
          },
          { id: "mma", name: "MMA", events: generateEvents("mma", 6) },
          {
            id: "kickboxing",
            name: "Kickboxing",
            events: generateEvents("kickboxing", 4),
          },
          {
            id: "muay-thai",
            name: "Muay Thai",
            events: generateEvents("muay-thai", 4),
          },
          { id: "judo", name: "Judo", events: generateEvents("judo", 4) },
          {
            id: "taekwondo",
            name: "Taekwondo",
            events: generateEvents("taekwondo", 4),
          },
          { id: "karate", name: "Karate", events: generateEvents("karate", 4) },
          {
            id: "sumo",
            name: "Sumo Wrestling",
            events: generateEvents("sumo", 3),
          },
        ],
      },
      {
        id: "winter-sports",
        name: "Winter Sports",
        description: "Skiing, snowboarding, and ice sports",
        icon: "⛷️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "skiing",
            name: "Skiing Competitions",
            events: generateEvents("skiing", 5),
          },
          {
            id: "snowboarding",
            name: "Snowboarding",
            events: generateEvents("snowboarding", 5),
          },
          {
            id: "figure-skating",
            name: "Figure Skating",
            events: generateEvents("figure-skating", 4),
          },
          {
            id: "speed-skating",
            name: "Speed Skating",
            events: generateEvents("speed-skating", 3),
          },
          {
            id: "bobsled",
            name: "Bobsled",
            events: generateEvents("bobsled", 2),
          },
          { id: "luge", name: "Luge", events: generateEvents("luge", 2) },
          {
            id: "skeleton",
            name: "Skeleton",
            events: generateEvents("skeleton", 2),
          },
          {
            id: "curling",
            name: "Curling",
            events: generateEvents("curling", 3),
          },
          {
            id: "biathlon",
            name: "Biathlon",
            events: generateEvents("biathlon", 3),
          },
        ],
      },
      {
        id: "water-sports",
        name: "Water Sports",
        description: "Swimming, surfing, and water competitions",
        icon: "🏊",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "swimming",
            name: "Swimming Competitions",
            events: generateEvents("swimming", 5),
          },
          {
            id: "surfing",
            name: "Surfing",
            events: generateEvents("surfing", 5),
          },
          { id: "diving", name: "Diving", events: generateEvents("diving", 4) },
          {
            id: "water-polo",
            name: "Water Polo",
            events: generateEvents("water-polo", 4),
          },
          {
            id: "synchronized-swimming",
            name: "Synchronized Swimming",
            events: generateEvents("synchronized-swimming", 3),
          },
          {
            id: "open-water",
            name: "Open Water Swimming",
            events: generateEvents("open-water", 4),
          },
          {
            id: "kayaking",
            name: "Kayaking",
            events: generateEvents("kayaking", 4),
          },
          { id: "rowing", name: "Rowing", events: generateEvents("rowing", 4) },
          {
            id: "sailing",
            name: "Sailing",
            events: generateEvents("sailing", 4),
          },
        ],
      },
    ],
  },

  // 3. TRAVEL & ADVENTURE
  {
    id: "travel",
    name: "Travel & Adventure",
    icon: "✈️",
    color: "#45B7D1",
    description: "Guided tours, adventures, and travel experiences",
    featured: true,
    categories: [
      {
        id: "adventure-travel",
        name: "Adventure Travel",
        description: "Thrilling outdoor experiences",
        icon: "🏔️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "hiking",
            name: "Hiking & Trekking",
            events: generateEvents("hiking", 6),
            routes: generateRoutes("hiking", 5),
          },
          {
            id: "camping",
            name: "Camping",
            events: generateEvents("camping", 5),
            routes: generateRoutes("camping", 4),
          },
          {
            id: "mountaineering",
            name: "Mountaineering",
            events: generateEvents("mountaineering", 4),
            routes: generateRoutes("mountaineering", 4),
          },
          {
            id: "rock-climbing",
            name: "Rock Climbing",
            events: generateEvents("rock-climbing", 4),
            routes: generateRoutes("rock-climbing", 4),
          },
          {
            id: "canyoning",
            name: "Canyoning",
            events: generateEvents("canyoning", 3),
            routes: generateRoutes("canyoning", 3),
          },
          {
            id: "caving",
            name: "Cave Exploration",
            events: generateEvents("caving", 3),
            routes: generateRoutes("caving", 3),
          },
          {
            id: "zip-lining",
            name: "Zip Lining",
            events: generateEvents("zip-lining", 4),
          },
          {
            id: "bungee-jumping",
            name: "Bungee Jumping",
            events: generateEvents("bungee-jumping", 3),
          },
          {
            id: "skydiving",
            name: "Skydiving",
            events: generateEvents("skydiving", 4),
          },
          {
            id: "paragliding",
            name: "Paragliding",
            events: generateEvents("paragliding", 3),
          },
        ],
      },
      {
        id: "safari-wildlife",
        name: "Safari & Wildlife",
        description: "Animal encounters and wildlife viewing",
        icon: "🦁",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "safari",
            name: "Safari Adventures",
            events: generateEvents("safari", 5),
            routes: generateRoutes("safari", 4),
          },
          {
            id: "whale-watching",
            name: "Whale Watching",
            events: generateEvents("whale-watching", 4),
          },
          {
            id: "bird-watching",
            name: "Bird Watching",
            events: generateEvents("bird-watching", 4),
          },
          {
            id: "jungle-trekking",
            name: "Jungle Trekking",
            events: generateEvents("jungle-trekking", 4),
            routes: generateRoutes("jungle-trekking", 3),
          },
          {
            id: "polar-expeditions",
            name: "Polar Expeditions",
            events: generateEvents("polar-expeditions", 3),
            routes: generateRoutes("polar-expeditions", 2),
          },
          {
            id: "gorilla-trekking",
            name: "Gorilla Trekking",
            events: generateEvents("gorilla-trekking", 2),
            routes: generateRoutes("gorilla-trekking", 2),
          },
          {
            id: "turtle-nesting",
            name: "Turtle Nesting Tours",
            events: generateEvents("turtle-nesting", 3),
          },
          {
            id: "shark-diving",
            name: "Shark Diving",
            events: generateEvents("shark-diving", 3),
          },
        ],
      },
      {
        id: "cultural-travel",
        name: "Cultural Travel",
        description: "Immersive cultural experiences",
        icon: "🏛️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "historical-tours",
            name: "Historical Tours",
            events: generateEvents("historical-tours", 5),
            routes: generateRoutes("historical-tours", 4),
          },
          {
            id: "museum-tours",
            name: "Museum Tours",
            events: generateEvents("museum-tours", 5),
          },
          {
            id: "heritage-sites",
            name: "Heritage Sites",
            events: generateEvents("heritage-sites", 4),
            routes: generateRoutes("heritage-sites", 3),
          },
          {
            id: "religious-tours",
            name: "Religious Tours",
            events: generateEvents("religious-tours", 4),
            routes: generateRoutes("religious-tours", 3),
          },
          {
            id: "tribal-experiences",
            name: "Tribal Experiences",
            events: generateEvents("tribal-experiences", 3),
          },
          {
            id: "local-cuisine-tours",
            name: "Local Cuisine Tours",
            events: generateEvents("local-cuisine-tours", 5),
          },
          {
            id: "craft-workshops",
            name: "Craft Workshops",
            events: generateEvents("craft-workshops", 4),
          },
          {
            id: "music-dance-tours",
            name: "Music & Dance Tours",
            events: generateEvents("music-dance-tours", 4),
          },
        ],
      },
      {
        id: "beach-resorts",
        name: "Beach & Island Resorts",
        description: "Relaxing beach getaways",
        icon: "🏖️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "tropical-beaches",
            name: "Tropical Beaches",
            events: generateEvents("tropical-beaches", 6),
          },
          {
            id: "luxury-resorts",
            name: "Luxury Resorts",
            events: generateEvents("luxury-resorts", 5),
          },
          {
            id: "island-getaways",
            name: "Island Getaways",
            events: generateEvents("island-getaways", 5),
          },
          {
            id: "private-islands",
            name: "Private Islands",
            events: generateEvents("private-islands", 3),
          },
          {
            id: "overwater-bungalows",
            name: "Overwater Bungalows",
            events: generateEvents("overwater-bungalows", 3),
          },
          {
            id: "beach-clubs",
            name: "Beach Clubs",
            events: generateEvents("beach-clubs", 4),
          },
          {
            id: "snorkeling-spots",
            name: "Snorkeling Spots",
            events: generateEvents("snorkeling-spots", 4),
          },
          {
            id: "scuba-diving",
            name: "Scuba Diving",
            events: generateEvents("scuba-diving", 5),
            routes: generateRoutes("scuba-diving", 4),
          },
        ],
      },
      {
        id: "city-breaks",
        name: "City Breaks",
        description: "Urban exploration and city tours",
        icon: "🌆",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "european-cities",
            name: "European Cities",
            events: generateEvents("european-cities", 6),
            routes: generateRoutes("european-cities", 4),
          },
          {
            id: "asian-cities",
            name: "Asian Cities",
            events: generateEvents("asian-cities", 5),
            routes: generateRoutes("asian-cities", 3),
          },
          {
            id: "american-cities",
            name: "American Cities",
            events: generateEvents("american-cities", 5),
            routes: generateRoutes("american-cities", 3),
          },
          {
            id: "australian-cities",
            name: "Australian Cities",
            events: generateEvents("australian-cities", 4),
            routes: generateRoutes("australian-cities", 2),
          },
          {
            id: "african-cities",
            name: "African Cities",
            events: generateEvents("african-cities", 4),
            routes: generateRoutes("african-cities", 2),
          },
          {
            id: "middle-east-cities",
            name: "Middle East Cities",
            events: generateEvents("middle-east-cities", 4),
            routes: generateRoutes("middle-east-cities", 2),
          },
          {
            id: "capital-cities",
            name: "Capital Cities",
            events: generateEvents("capital-cities", 5),
          },
          {
            id: "nightlife-tours",
            name: "Nightlife Tours",
            events: generateEvents("nightlife-tours", 4),
          },
        ],
      },
      {
        id: "wellness-retreats",
        name: "Wellness Retreats",
        description: "Health and wellness getaways",
        icon: "🧘",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "yoga-retreats",
            name: "Yoga Retreats",
            events: generateEvents("yoga-retreats", 5),
          },
          {
            id: "spa-retreats",
            name: "Spa Retreats",
            events: generateEvents("spa-retreats", 5),
          },
          {
            id: "meditation-retreats",
            name: "Meditation Retreats",
            events: generateEvents("meditation-retreats", 4),
          },
          {
            id: "detox-programs",
            name: "Detox Programs",
            events: generateEvents("detox-programs", 4),
          },
          {
            id: "fitness-camps",
            name: "Fitness Camps",
            events: generateEvents("fitness-camps", 4),
          },
          {
            id: "weight-loss-retreats",
            name: "Weight Loss Retreats",
            events: generateEvents("weight-loss-retreats", 3),
          },
          {
            id: "ayurveda-retreats",
            name: "Ayurveda Retreats",
            events: generateEvents("ayurveda-retreats", 3),
          },
          {
            id: "wellness-weekends",
            name: "Wellness Weekends",
            events: generateEvents("wellness-weekends", 4),
          },
        ],
      },
      {
        id: "luxury-travel",
        name: "Luxury Travel",
        description: "Premium and exclusive experiences",
        icon: "💎",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "luxury-cruises",
            name: "Luxury Cruises",
            events: generateEvents("luxury-cruises", 4),
          },
          {
            id: "private-jets",
            name: "Private Jet Experiences",
            events: generateEvents("private-jets", 3),
          },
          {
            id: "yacht-charters",
            name: "Yacht Charters",
            events: generateEvents("yacht-charters", 4),
          },
          {
            id: "villa-rentals",
            name: "Villa Rentals",
            events: generateEvents("villa-rentals", 4),
          },
          {
            id: "helicopter-tours",
            name: "Helicopter Tours",
            events: generateEvents("helicopter-tours", 4),
          },
          {
            id: "luxury-trains",
            name: "Luxury Train Journeys",
            events: generateEvents("luxury-trains", 3),
            routes: generateRoutes("luxury-trains", 2),
          },
          {
            id: "private-guides",
            name: "Private Guides",
            events: generateEvents("private-guides", 4),
          },
          {
            id: "vip-experiences",
            name: "VIP Experiences",
            events: generateEvents("vip-experiences", 5),
          },
        ],
      },
      {
        id: "eco-tourism",
        name: "Eco-Tourism",
        description: "Sustainable and green travel",
        icon: "🌿",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "rainforest-tours",
            name: "Rainforest Tours",
            events: generateEvents("rainforest-tours", 4),
            routes: generateRoutes("rainforest-tours", 3),
          },
          {
            id: "conservation-volunteer",
            name: "Conservation Volunteering",
            events: generateEvents("conservation-volunteer", 3),
          },
          {
            id: "eco-lodges",
            name: "Eco-Lodges",
            events: generateEvents("eco-lodges", 4),
          },
          {
            id: "carbon-neutral-tours",
            name: "Carbon Neutral Tours",
            events: generateEvents("carbon-neutral-tours", 3),
          },
          {
            id: "wildlife-conservation",
            name: "Wildlife Conservation",
            events: generateEvents("wildlife-conservation", 3),
          },
          {
            id: "sustainable-farms",
            name: "Sustainable Farm Stays",
            events: generateEvents("sustainable-farms", 3),
          },
          {
            id: "national-parks",
            name: "National Parks",
            events: generateEvents("national-parks", 5),
            routes: generateRoutes("national-parks", 5),
          },
        ],
      },
    ],
  },

  // 4. EDUCATION & LEARNING
  {
    id: "education",
    name: "Education & Learning",
    icon: "📚",
    color: "#96CEB4",
    description: "Workshops, courses, and learning experiences",
    featured: true,
    categories: [
      {
        id: "workshops",
        name: "Workshops & Masterclasses",
        description: "Hands-on learning sessions",
        icon: "🔧",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "professional-development",
            name: "Professional Development",
            events: generateEvents("professional-development", 6),
          },
          {
            id: "creative-writing",
            name: "Creative Writing",
            events: generateEvents("creative-writing", 5),
          },
          {
            id: "art-workshops",
            name: "Art Workshops",
            events: generateEvents("art-workshops", 5),
          },
          {
            id: "music-workshops",
            name: "Music Workshops",
            events: generateEvents("music-workshops", 5),
          },
          {
            id: "photography-workshops",
            name: "Photography Workshops",
            events: generateEvents("photography-workshops", 5),
          },
          {
            id: "film-making",
            name: "Film Making",
            events: generateEvents("film-making", 4),
          },
          {
            id: "pottery-workshops",
            name: "Pottery Workshops",
            events: generateEvents("pottery-workshops", 4),
          },
          {
            id: "cooking-workshops",
            name: "Cooking Workshops",
            events: generateEvents("cooking-workshops", 5),
          },
          {
            id: "dance-workshops",
            name: "Dance Workshops",
            events: generateEvents("dance-workshops", 5),
          },
          {
            id: "acting-workshops",
            name: "Acting Workshops",
            events: generateEvents("acting-workshops", 4),
          },
        ],
      },
      {
        id: "academic-courses",
        name: "Academic Courses",
        description: "Structured learning programs",
        icon: "🎓",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "online-courses",
            name: "Online Courses",
            events: generateEvents("online-courses", 7),
          },
          {
            id: "university-courses",
            name: "University Courses",
            events: generateEvents("university-courses", 6),
          },
          {
            id: "language-courses",
            name: "Language Courses",
            events: generateEvents("language-courses", 6),
          },
          {
            id: "certification-programs",
            name: "Certification Programs",
            events: generateEvents("certification-programs", 5),
          },
          {
            id: "executive-education",
            name: "Executive Education",
            events: generateEvents("executive-education", 4),
          },
          {
            id: "summer-schools",
            name: "Summer Schools",
            events: generateEvents("summer-schools", 4),
          },
          {
            id: "study-abroad",
            name: "Study Abroad",
            events: generateEvents("study-abroad", 4),
          },
          {
            id: "continuing-education",
            name: "Continuing Education",
            events: generateEvents("continuing-education", 5),
          },
        ],
      },
      {
        id: "seminars-conferences",
        name: "Seminars & Conferences",
        description: "Expert-led presentations and talks",
        icon: "🎤",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "business-seminars",
            name: "Business Seminars",
            events: generateEvents("business-seminars", 5),
          },
          {
            id: "technology-seminars",
            name: "Technology Seminars",
            events: generateEvents("technology-seminars", 5),
          },
          {
            id: "health-seminars",
            name: "Health Seminars",
            events: generateEvents("health-seminars", 4),
          },
          {
            id: "finance-seminars",
            name: "Finance Seminars",
            events: generateEvents("finance-seminars", 4),
          },
          {
            id: "science-conferences",
            name: "Science Conferences",
            events: generateEvents("science-conferences", 4),
          },
          {
            id: "medical-conferences",
            name: "Medical Conferences",
            events: generateEvents("medical-conferences", 4),
          },
          {
            id: "legal-seminars",
            name: "Legal Seminars",
            events: generateEvents("legal-seminars", 4),
          },
          {
            id: "marketing-conferences",
            name: "Marketing Conferences",
            events: generateEvents("marketing-conferences", 5),
          },
          {
            id: "leadership-summits",
            name: "Leadership Summits",
            events: generateEvents("leadership-summits", 4),
          },
        ],
      },
      {
        id: "tech-learning",
        name: "Technology & Coding",
        description: "Programming and tech skills",
        icon: "💻",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "coding-bootcamps",
            name: "Coding Bootcamps",
            events: generateEvents("coding-bootcamps", 5),
          },
          {
            id: "data-science",
            name: "Data Science",
            events: generateEvents("data-science", 5),
          },
          {
            id: "ai-machine-learning",
            name: "AI & Machine Learning",
            events: generateEvents("ai-machine-learning", 5),
          },
          {
            id: "web-development",
            name: "Web Development",
            events: generateEvents("web-development", 6),
          },
          {
            id: "mobile-development",
            name: "Mobile Development",
            events: generateEvents("mobile-development", 5),
          },
          {
            id: "cybersecurity",
            name: "Cybersecurity",
            events: generateEvents("cybersecurity", 4),
          },
          {
            id: "cloud-computing",
            name: "Cloud Computing",
            events: generateEvents("cloud-computing", 4),
          },
          { id: "devops", name: "DevOps", events: generateEvents("devops", 4) },
          {
            id: "blockchain",
            name: "Blockchain",
            events: generateEvents("blockchain", 4),
          },
          {
            id: "game-development",
            name: "Game Development",
            events: generateEvents("game-development", 4),
          },
        ],
      },
      {
        id: "personal-development",
        name: "Personal Development",
        description: "Self-improvement and growth",
        icon: "🌟",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "public-speaking",
            name: "Public Speaking",
            events: generateEvents("public-speaking", 4),
          },
          {
            id: "leadership-skills",
            name: "Leadership Skills",
            events: generateEvents("leadership-skills", 5),
          },
          {
            id: "time-management",
            name: "Time Management",
            events: generateEvents("time-management", 4),
          },
          {
            id: "communication-skills",
            name: "Communication Skills",
            events: generateEvents("communication-skills", 5),
          },
          {
            id: "negotiation-skills",
            name: "Negotiation Skills",
            events: generateEvents("negotiation-skills", 4),
          },
          {
            id: "emotional-intelligence",
            name: "Emotional Intelligence",
            events: generateEvents("emotional-intelligence", 4),
          },
          {
            id: "mindfulness-training",
            name: "Mindfulness Training",
            events: generateEvents("mindfulness-training", 4),
          },
          {
            id: "career-coaching",
            name: "Career Coaching",
            events: generateEvents("career-coaching", 5),
          },
        ],
      },
    ],
  },

  // 5. FOOD & DINING
  {
    id: "food-dining",
    name: "Food & Dining",
    icon: "🍽️",
    color: "#FFB347",
    description: "Culinary experiences and dining events",
    featured: true,
    categories: [
      {
        id: "food-tours",
        name: "Food Tours",
        description: "Guided culinary explorations",
        icon: "🚶",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "wine-tasting",
            name: "Wine Tasting",
            events: generateEvents("wine-tasting", 6),
          },
          {
            id: "culinary-tours",
            name: "Culinary Tours",
            events: generateEvents("culinary-tours", 5),
          },
          {
            id: "street-food-tours",
            name: "Street Food Tours",
            events: generateEvents("street-food-tours", 5),
          },
          {
            id: "farmers-market-tours",
            name: "Farmers Market Tours",
            events: generateEvents("farmers-market-tours", 4),
          },
          {
            id: "chocolate-tours",
            name: "Chocolate Tours",
            events: generateEvents("chocolate-tours", 4),
          },
          {
            id: "cheese-tasting",
            name: "Cheese Tasting",
            events: generateEvents("cheese-tasting", 4),
          },
          {
            id: "whisky-tasting",
            name: "Whisky Tasting",
            events: generateEvents("whisky-tasting", 5),
          },
          {
            id: "beer-tours",
            name: "Brewery Tours",
            events: generateEvents("beer-tours", 5),
          },
          {
            id: "coffee-tours",
            name: "Coffee Tours",
            events: generateEvents("coffee-tours", 4),
          },
          {
            id: "tea-tasting",
            name: "Tea Tasting",
            events: generateEvents("tea-tasting", 4),
          },
        ],
      },
      {
        id: "cooking-classes",
        name: "Cooking Classes",
        description: "Hands-on culinary instruction",
        icon: "👩‍🍳",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "baking-classes",
            name: "Baking Classes",
            events: generateEvents("baking-classes", 5),
          },
          {
            id: "international-cuisine",
            name: "International Cuisine",
            events: generateEvents("international-cuisine", 5),
          },
          {
            id: "pastry-making",
            name: "Pastry Making",
            events: generateEvents("pastry-making", 4),
          },
          {
            id: "chef-masterclasses",
            name: "Chef Masterclasses",
            events: generateEvents("chef-masterclasses", 4),
          },
          {
            id: "sushi-making",
            name: "Sushi Making",
            events: generateEvents("sushi-making", 4),
          },
          {
            id: "pizza-making",
            name: "Pizza Making",
            events: generateEvents("pizza-making", 4),
          },
          {
            id: "pasta-making",
            name: "Pasta Making",
            events: generateEvents("pasta-making", 4),
          },
          {
            id: "vegan-cooking",
            name: "Vegan Cooking",
            events: generateEvents("vegan-cooking", 4),
          },
          {
            id: "gluten-free-baking",
            name: "Gluten-Free Baking",
            events: generateEvents("gluten-free-baking", 3),
          },
          {
            id: "molecular-gastronomy",
            name: "Molecular Gastronomy",
            events: generateEvents("molecular-gastronomy", 3),
          },
        ],
      },
      {
        id: "food-festivals",
        name: "Food Festivals",
        description: "Celebrations of food and drink",
        icon: "🎉",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "wine-festivals",
            name: "Wine Festivals",
            events: generateEvents("wine-festivals", 5),
          },
          {
            id: "beer-festivals",
            name: "Beer Festivals",
            events: generateEvents("beer-festivals", 5),
          },
          {
            id: "food-truck-festivals",
            name: "Food Truck Festivals",
            events: generateEvents("food-truck-festivals", 4),
          },
          {
            id: "gourmet-food-festivals",
            name: "Gourmet Food Festivals",
            events: generateEvents("gourmet-food-festivals", 4),
          },
          {
            id: "seafood-festivals",
            name: "Seafood Festivals",
            events: generateEvents("seafood-festivals", 4),
          },
          {
            id: "bbq-festivals",
            name: "BBQ Festivals",
            events: generateEvents("bbq-festivals", 4),
          },
          {
            id: "chocolate-festivals",
            name: "Chocolate Festivals",
            events: generateEvents("chocolate-festivals", 4),
          },
          {
            id: "coffee-festivals",
            name: "Coffee Festivals",
            events: generateEvents("coffee-festivals", 3),
          },
          {
            id: "farm-to-table",
            name: "Farm to Table Dinners",
            events: generateEvents("farm-to-table", 4),
          },
        ],
      },
      {
        id: "fine-dining",
        name: "Fine Dining Experiences",
        description: "Exclusive culinary events",
        icon: "🍷",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "michelin-star",
            name: "Michelin Star Restaurants",
            events: generateEvents("michelin-star", 5),
          },
          {
            id: "chef-tables",
            name: "Chef's Table",
            events: generateEvents("chef-tables", 4),
          },
          {
            id: "wine-pairing-dinners",
            name: "Wine Pairing Dinners",
            events: generateEvents("wine-pairing-dinners", 5),
          },
          {
            id: "tasting-menus",
            name: "Tasting Menus",
            events: generateEvents("tasting-menus", 5),
          },
          {
            id: "private-dining",
            name: "Private Dining",
            events: generateEvents("private-dining", 4),
          },
          {
            id: "pop-up-restaurants",
            name: "Pop-up Restaurants",
            events: generateEvents("pop-up-restaurants", 4),
          },
          {
            id: "omakase",
            name: "Omakase Experiences",
            events: generateEvents("omakase", 3),
          },
        ],
      },
    ],
  },

  // 6. BUSINESS & PROFESSIONAL
  {
    id: "business",
    name: "Business & Professional",
    icon: "💼",
    color: "#6C5B7B",
    description: "Networking, conferences, and business events",
    categories: [
      {
        id: "networking-events",
        name: "Networking Events",
        description: "Connect with professionals",
        icon: "🤝",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "business-mixers",
            name: "Business Mixers",
            events: generateEvents("business-mixers", 5),
          },
          {
            id: "industry-meetups",
            name: "Industry Meetups",
            events: generateEvents("industry-meetups", 5),
          },
          {
            id: "speed-networking",
            name: "Speed Networking",
            events: generateEvents("speed-networking", 4),
          },
          {
            id: "alumni-events",
            name: "Alumni Events",
            events: generateEvents("alumni-events", 4),
          },
          {
            id: "women-in-business",
            name: "Women in Business",
            events: generateEvents("women-in-business", 4),
          },
          {
            id: "young-professionals",
            name: "Young Professionals",
            events: generateEvents("young-professionals", 5),
          },
          {
            id: "executive-roundtables",
            name: "Executive Roundtables",
            events: generateEvents("executive-roundtables", 3),
          },
        ],
      },
      {
        id: "trade-shows",
        name: "Trade Shows & Expos",
        description: "Industry exhibitions",
        icon: "🏢",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "tech-expos",
            name: "Tech Expos",
            events: generateEvents("tech-expos", 5),
          },
          {
            id: "auto-shows",
            name: "Auto Shows",
            events: generateEvents("auto-shows", 4),
          },
          {
            id: "fashion-expos",
            name: "Fashion Expos",
            events: generateEvents("fashion-expos", 4),
          },
          {
            id: "home-shows",
            name: "Home Shows",
            events: generateEvents("home-shows", 4),
          },
          {
            id: "boat-shows",
            name: "Boat Shows",
            events: generateEvents("boat-shows", 3),
          },
          {
            id: "travel-expos",
            name: "Travel Expos",
            events: generateEvents("travel-expos", 4),
          },
          {
            id: "wedding-expos",
            name: "Wedding Expos",
            events: generateEvents("wedding-expos", 4),
          },
        ],
      },
      {
        id: "entrepreneurship",
        name: "Entrepreneurship",
        description: "Startup and business events",
        icon: "🚀",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "pitch-competitions",
            name: "Pitch Competitions",
            events: generateEvents("pitch-competitions", 4),
          },
          {
            id: "startup-weekends",
            name: "Startup Weekends",
            events: generateEvents("startup-weekends", 4),
          },
          {
            id: "incubator-demo-days",
            name: "Incubator Demo Days",
            events: generateEvents("incubator-demo-days", 3),
          },
          {
            id: "angel-investor-meetups",
            name: "Angel Investor Meetups",
            events: generateEvents("angel-investor-meetups", 3),
          },
          {
            id: "venture-capital-summits",
            name: "Venture Capital Summits",
            events: generateEvents("venture-capital-summits", 3),
          },
          {
            id: "small-business-workshops",
            name: "Small Business Workshops",
            events: generateEvents("small-business-workshops", 5),
          },
        ],
      },
    ],
  },

  // 7. TECHNOLOGY & INNOVATION
  {
    id: "technology",
    name: "Technology & Innovation",
    icon: "💻",
    color: "#4A90E2",
    description: "Tech conferences, hackathons, and innovation events",
    categories: [
      {
        id: "tech-conferences",
        name: "Tech Conferences",
        description: "Major technology gatherings",
        icon: "🎯",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "ai-conferences",
            name: "AI Conferences",
            events: generateEvents("ai-conferences", 5),
          },
          {
            id: "cloud-computing",
            name: "Cloud Computing",
            events: generateEvents("cloud-computing", 5),
          },
          {
            id: "cybersecurity-summits",
            name: "Cybersecurity Summits",
            events: generateEvents("cybersecurity-summits", 4),
          },
          {
            id: "blockchain-summits",
            name: "Blockchain Summits",
            events: generateEvents("blockchain-summits", 4),
          },
          {
            id: "iot-conferences",
            name: "IoT Conferences",
            events: generateEvents("iot-conferences", 4),
          },
          {
            id: "5g-technology",
            name: "5G Technology",
            events: generateEvents("5g-technology", 3),
          },
          {
            id: "quantum-computing",
            name: "Quantum Computing",
            events: generateEvents("quantum-computing", 3),
          },
        ],
      },
      {
        id: "hackathons",
        name: "Hackathons",
        description: "Coding competitions",
        icon: "⚡",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "university-hackathons",
            name: "University Hackathons",
            events: generateEvents("university-hackathons", 5),
          },
          {
            id: "corporate-hackathons",
            name: "Corporate Hackathons",
            events: generateEvents("corporate-hackathons", 4),
          },
          {
            id: "blockchain-hackathons",
            name: "Blockchain Hackathons",
            events: generateEvents("blockchain-hackathons", 4),
          },
          {
            id: "ai-hackathons",
            name: "AI Hackathons",
            events: generateEvents("ai-hackathons", 4),
          },
          {
            id: "game-jams",
            name: "Game Jams",
            events: generateEvents("game-jams", 4),
          },
          {
            id: "space-hackathons",
            name: "Space Hackathons",
            events: generateEvents("space-hackathons", 3),
          },
        ],
      },
      {
        id: "vr-ar",
        name: "VR/AR Experiences",
        description: "Virtual and augmented reality",
        icon: "🥽",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "vr-gaming",
            name: "VR Gaming",
            events: generateEvents("vr-gaming", 5),
          },
          {
            id: "ar-workshops",
            name: "AR Workshops",
            events: generateEvents("ar-workshops", 4),
          },
          {
            id: "vr-film-festivals",
            name: "VR Film Festivals",
            events: generateEvents("vr-film-festivals", 3),
          },
          {
            id: "mixed-reality",
            name: "Mixed Reality",
            events: generateEvents("mixed-reality", 3),
          },
          {
            id: "vr-training",
            name: "VR Training",
            events: generateEvents("vr-training", 4),
          },
        ],
      },
    ],
  },

  // 8. HEALTH & WELLNESS
  {
    id: "health-wellness",
    name: "Health & Wellness",
    icon: "🧘",
    color: "#9B59B6",
    description: "Fitness, meditation, and healthcare events",
    categories: [
      {
        id: "fitness",
        name: "Fitness",
        description: "Workouts and fitness events",
        icon: "💪",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "marathons",
            name: "Marathons",
            events: generateEvents("marathons", 5),
          },
          {
            id: "yoga-festivals",
            name: "Yoga Festivals",
            events: generateEvents("yoga-festivals", 4),
          },
          {
            id: "crossfit-competitions",
            name: "CrossFit Competitions",
            events: generateEvents("crossfit-competitions", 4),
          },
          {
            id: "fitness-expos",
            name: "Fitness Expos",
            events: generateEvents("fitness-expos", 4),
          },
          {
            id: "boot-camps",
            name: "Boot Camps",
            events: generateEvents("boot-camps", 4),
          },
          {
            id: "pilates-workshops",
            name: "Pilates Workshops",
            events: generateEvents("pilates-workshops", 4),
          },
        ],
      },
      {
        id: "mental-health",
        name: "Mental Health",
        description: "Wellness and mindfulness",
        icon: "🧠",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "meditation-retreats",
            name: "Meditation Retreats",
            events: generateEvents("meditation-retreats", 4),
          },
          {
            id: "therapy-workshops",
            name: "Therapy Workshops",
            events: generateEvents("therapy-workshops", 4),
          },
          {
            id: "stress-management",
            name: "Stress Management",
            events: generateEvents("stress-management", 4),
          },
          {
            id: "mindfulness-seminars",
            name: "Mindfulness Seminars",
            events: generateEvents("mindfulness-seminars", 4),
          },
          {
            id: "wellness-coaching",
            name: "Wellness Coaching",
            events: generateEvents("wellness-coaching", 3),
          },
        ],
      },
      {
        id: "healthcare",
        name: "Healthcare",
        description: "Medical and health events",
        icon: "🏥",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "medical-conferences",
            name: "Medical Conferences",
            events: generateEvents("medical-conferences", 4),
          },
          {
            id: "health-fairs",
            name: "Health Fairs",
            events: generateEvents("health-fairs", 4),
          },
          {
            id: "wellness-expos",
            name: "Wellness Expos",
            events: generateEvents("wellness-expos", 4),
          },
          {
            id: "nutrition-workshops",
            name: "Nutrition Workshops",
            events: generateEvents("nutrition-workshops", 4),
          },
          {
            id: "mental-health-awareness",
            name: "Mental Health Awareness",
            events: generateEvents("mental-health-awareness", 3),
          },
        ],
      },
    ],
  },

  // 9. FASHION & BEAUTY
  {
    id: "fashion-beauty",
    name: "Fashion & Beauty",
    icon: "👗",
    color: "#FF69B4",
    description: "Fashion shows, beauty events, and style workshops",
    categories: [
      {
        id: "fashion-shows",
        name: "Fashion Shows",
        description: "Runway events",
        icon: "👠",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "fashion-weeks",
            name: "Fashion Weeks",
            events: generateEvents("fashion-weeks", 5),
          },
          {
            id: "designer-showcases",
            name: "Designer Showcases",
            events: generateEvents("designer-showcases", 4),
          },
          {
            id: "model-castings",
            name: "Model Castings",
            events: generateEvents("model-castings", 3),
          },
          {
            id: "fashion-awards",
            name: "Fashion Awards",
            events: generateEvents("fashion-awards", 3),
          },
          {
            id: "bridal-shows",
            name: "Bridal Shows",
            events: generateEvents("bridal-shows", 4),
          },
        ],
      },
      {
        id: "beauty-events",
        name: "Beauty Events",
        description: "Makeup and skincare",
        icon: "💄",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "makeup-workshops",
            name: "Makeup Workshops",
            events: generateEvents("makeup-workshops", 5),
          },
          {
            id: "skincare-seminars",
            name: "Skincare Seminars",
            events: generateEvents("skincare-seminars", 4),
          },
          {
            id: "beauty-expos",
            name: "Beauty Expos",
            events: generateEvents("beauty-expos", 4),
          },
          {
            id: "hair-shows",
            name: "Hair Shows",
            events: generateEvents("hair-shows", 4),
          },
          {
            id: "spa-days",
            name: "Spa Days",
            events: generateEvents("spa-days", 4),
          },
        ],
      },
      {
        id: "style-workshops",
        name: "Style Workshops",
        description: "Personal styling",
        icon: "👔",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "personal-styling",
            name: "Personal Styling",
            events: generateEvents("personal-styling", 4),
          },
          {
            id: "wardrobe-consulting",
            name: "Wardrobe Consulting",
            events: generateEvents("wardrobe-consulting", 4),
          },
          {
            id: "fashion-illustration",
            name: "Fashion Illustration",
            events: generateEvents("fashion-illustration", 3),
          },
          {
            id: "sustainable-fashion",
            name: "Sustainable Fashion",
            events: generateEvents("sustainable-fashion", 3),
          },
        ],
      },
    ],
  },

  // 10. MUSIC & NIGHTLIFE
  {
    id: "nightlife",
    name: "Music & Nightlife",
    icon: "🌃",
    color: "#2C3E50",
    description: "Clubs, parties, and night events",
    categories: [
      {
        id: "clubs",
        name: "Nightclubs",
        description: "Club events",
        icon: "🎵",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "dj-sets",
            name: "DJ Sets",
            events: generateEvents("dj-sets", 6),
          },
          {
            id: "theme-parties",
            name: "Theme Parties",
            events: generateEvents("theme-parties", 5),
          },
          {
            id: "guest-djs",
            name: "Guest DJs",
            events: generateEvents("guest-djs", 5),
          },
          {
            id: "club-openings",
            name: "Club Openings",
            events: generateEvents("club-openings", 4),
          },
          {
            id: "after-parties",
            name: "After Parties",
            events: generateEvents("after-parties", 4),
          },
        ],
      },
      {
        id: "bars-pubs",
        name: "Bars & Pubs",
        description: "Bar events",
        icon: "🍸",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "cocktail-tastings",
            name: "Cocktail Tastings",
            events: generateEvents("cocktail-tastings", 5),
          },
          {
            id: "pub-crawls",
            name: "Pub Crawls",
            events: generateEvents("pub-crawls", 4),
          },
          {
            id: "trivia-nights",
            name: "Trivia Nights",
            events: generateEvents("trivia-nights", 5),
          },
          {
            id: "karaoke-nights",
            name: "Karaoke Nights",
            events: generateEvents("karaoke-nights", 5),
          },
          {
            id: "open-mic",
            name: "Open Mic Nights",
            events: generateEvents("open-mic", 4),
          },
          {
            id: "beer-tastings",
            name: "Beer Tastings",
            events: generateEvents("beer-tastings", 5),
          },
          {
            id: "wine-bars",
            name: "Wine Bars",
            events: generateEvents("wine-bars", 4),
          },
        ],
      },
      {
        id: "concerts-venues",
        name: "Live Music Venues",
        description: "Intimate live music",
        icon: "🎸",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "acoustic-sessions",
            name: "Acoustic Sessions",
            events: generateEvents("acoustic-sessions", 5),
          },
          {
            id: "band-performances",
            name: "Band Performances",
            events: generateEvents("band-performances", 6),
          },
          {
            id: "open-stage",
            name: "Open Stage",
            events: generateEvents("open-stage", 4),
          },
          {
            id: "battle-of-bands",
            name: "Battle of Bands",
            events: generateEvents("battle-of-bands", 4),
          },
          {
            id: "tribute-bands",
            name: "Tribute Bands",
            events: generateEvents("tribute-bands", 5),
          },
        ],
      },
    ],
  },

  // 11. FAMILY & KIDS
  {
    id: "family-kids",
    name: "Family & Kids",
    icon: "👨‍👩‍👧‍👦",
    color: "#FF9F1C",
    description: "Family-friendly events and activities",
    categories: [
      {
        id: "kids-entertainment",
        name: "Kids Entertainment",
        description: "Fun for children",
        icon: "🎈",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "children-theater",
            name: "Children's Theater",
            events: generateEvents("children-theater", 5),
          },
          {
            id: "puppet-shows",
            name: "Puppet Shows",
            events: generateEvents("puppet-shows", 4),
          },
          {
            id: "magic-shows",
            name: "Magic Shows",
            events: generateEvents("magic-shows", 5),
          },
          {
            id: "circus-workshops",
            name: "Circus Workshops",
            events: generateEvents("circus-workshops", 4),
          },
          {
            id: "storytelling",
            name: "Storytelling Sessions",
            events: generateEvents("storytelling", 4),
          },
          {
            id: "character-meet-greets",
            name: "Character Meet & Greets",
            events: generateEvents("character-meet-greets", 4),
          },
        ],
      },
      {
        id: "family-fun",
        name: "Family Fun",
        description: "Activities for all ages",
        icon: "🎡",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "carnivals",
            name: "Carnivals",
            events: generateEvents("carnivals", 4),
          },
          {
            id: "family-festivals",
            name: "Family Festivals",
            events: generateEvents("family-festivals", 4),
          },
          {
            id: "picnic-events",
            name: "Picnic Events",
            events: generateEvents("picnic-events", 5),
          },
          {
            id: "outdoor-movies",
            name: "Outdoor Movies",
            events: generateEvents("outdoor-movies", 4),
          },
          {
            id: "petting-zoos",
            name: "Petting Zoos",
            events: generateEvents("petting-zoos", 3),
          },
          {
            id: "farm-visits",
            name: "Farm Visits",
            events: generateEvents("farm-visits", 4),
          },
        ],
      },
      {
        id: "educational-kids",
        name: "Educational Kids",
        description: "Learning through fun",
        icon: "📚",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "science-kids",
            name: "Science for Kids",
            events: generateEvents("science-kids", 4),
          },
          {
            id: "art-classes-kids",
            name: "Art Classes for Kids",
            events: generateEvents("art-classes-kids", 5),
          },
          {
            id: "music-classes-kids",
            name: "Music Classes for Kids",
            events: generateEvents("music-classes-kids", 5),
          },
          {
            id: "coding-kids",
            name: "Coding for Kids",
            events: generateEvents("coding-kids", 4),
          },
          {
            id: "language-kids",
            name: "Language Classes for Kids",
            events: generateEvents("language-kids", 4),
          },
          {
            id: "museum-kids",
            name: "Museum Workshops for Kids",
            events: generateEvents("museum-kids", 4),
          },
        ],
      },
      {
        id: "birthday-parties",
        name: "Birthday Parties",
        description: "Celebration venues",
        icon: "🎂",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "party-venues",
            name: "Party Venues",
            events: generateEvents("party-venues", 4),
          },
          {
            id: "entertainment-packages",
            name: "Entertainment Packages",
            events: generateEvents("entertainment-packages", 4),
          },
          {
            id: "themed-parties",
            name: "Themed Parties",
            events: generateEvents("themed-parties", 4),
          },
          {
            id: "party-planners",
            name: "Party Planners",
            events: generateEvents("party-planners", 3),
          },
        ],
      },
    ],
  },

  // 12. WEDDINGS & EVENTS
  {
    id: "weddings",
    name: "Weddings & Events",
    icon: "💒",
    color: "#F08080",
    description: "Wedding planning and special occasions",
    categories: [
      {
        id: "wedding-venues",
        name: "Wedding Venues",
        description: "Ceremony and reception locations",
        icon: "🏰",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "banquet-halls",
            name: "Banquet Halls",
            events: generateEvents("banquet-halls", 5),
          },
          {
            id: "outdoor-weddings",
            name: "Outdoor Weddings",
            events: generateEvents("outdoor-weddings", 5),
          },
          {
            id: "beach-weddings",
            name: "Beach Weddings",
            events: generateEvents("beach-weddings", 4),
          },
          {
            id: "destination-weddings",
            name: "Destination Weddings",
            events: generateEvents("destination-weddings", 4),
          },
          {
            id: "historic-venues",
            name: "Historic Venues",
            events: generateEvents("historic-venues", 4),
          },
          {
            id: "hotel-weddings",
            name: "Hotel Weddings",
            events: generateEvents("hotel-weddings", 5),
          },
          {
            id: "garden-weddings",
            name: "Garden Weddings",
            events: generateEvents("garden-weddings", 4),
          },
        ],
      },
      {
        id: "wedding-services",
        name: "Wedding Services",
        description: "Professional wedding services",
        icon: "💍",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "wedding-planners",
            name: "Wedding Planners",
            events: generateEvents("wedding-planners", 4),
          },
          {
            id: "wedding-photography",
            name: "Wedding Photography",
            events: generateEvents("wedding-photography", 5),
          },
          {
            id: "wedding-videography",
            name: "Wedding Videography",
            events: generateEvents("wedding-videography", 5),
          },
          {
            id: "wedding-catering",
            name: "Wedding Catering",
            events: generateEvents("wedding-catering", 5),
          },
          {
            id: "wedding-cakes",
            name: "Wedding Cakes",
            events: generateEvents("wedding-cakes", 4),
          },
          {
            id: "wedding-flowers",
            name: "Wedding Flowers",
            events: generateEvents("wedding-flowers", 4),
          },
          {
            id: "wedding-dj",
            name: "Wedding DJs",
            events: generateEvents("wedding-dj", 5),
          },
          {
            id: "wedding-music",
            name: "Wedding Bands",
            events: generateEvents("wedding-music", 5),
          },
        ],
      },
      {
        id: "bridal-events",
        name: "Bridal Events",
        description: "Pre-wedding celebrations",
        icon: "👰",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "bridal-shows",
            name: "Bridal Shows",
            events: generateEvents("bridal-shows", 4),
          },
          {
            id: "dress-tryons",
            name: "Dress Try-on Events",
            events: generateEvents("dress-tryons", 4),
          },
          {
            id: "engagement-parties",
            name: "Engagement Parties",
            events: generateEvents("engagement-parties", 4),
          },
          {
            id: "bridal-showers",
            name: "Bridal Showers",
            events: generateEvents("bridal-showers", 4),
          },
          {
            id: "bachelorette-parties",
            name: "Bachelorette Parties",
            events: generateEvents("bachelorette-parties", 4),
          },
          {
            id: "bachelor-parties",
            name: "Bachelor Parties",
            events: generateEvents("bachelor-parties", 4),
          },
        ],
      },
    ],
  },

  // 13. HOME & GARDEN
  {
    id: "home-garden",
    name: "Home & Garden",
    icon: "🏡",
    color: "#8B4513",
    description: "Home improvement, gardening, and DIY",
    categories: [
      {
        id: "home-improvement",
        name: "Home Improvement",
        description: "Workshops and events",
        icon: "🔨",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "diy-workshops",
            name: "DIY Workshops",
            events: generateEvents("diy-workshops", 5),
          },
          {
            id: "home-renovation",
            name: "Home Renovation Shows",
            events: generateEvents("home-renovation", 4),
          },
          {
            id: "interior-design",
            name: "Interior Design Events",
            events: generateEvents("interior-design", 4),
          },
          {
            id: "furniture-making",
            name: "Furniture Making",
            events: generateEvents("furniture-making", 3),
          },
          {
            id: "home-staging",
            name: "Home Staging",
            events: generateEvents("home-staging", 3),
          },
        ],
      },
      {
        id: "gardening",
        name: "Gardening",
        description: "Green thumb events",
        icon: "🌱",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "gardening-workshops",
            name: "Gardening Workshops",
            events: generateEvents("gardening-workshops", 5),
          },
          {
            id: "plant-sales",
            name: "Plant Sales",
            events: generateEvents("plant-sales", 5),
          },
          {
            id: "flower-shows",
            name: "Flower Shows",
            events: generateEvents("flower-shows", 4),
          },
          {
            id: "landscaping-tours",
            name: "Landscaping Tours",
            events: generateEvents("landscaping-tours", 3),
          },
          {
            id: "community-gardens",
            name: "Community Gardens",
            events: generateEvents("community-gardens", 4),
          },
          {
            id: "organic-gardening",
            name: "Organic Gardening",
            events: generateEvents("organic-gardening", 4),
          },
        ],
      },
      {
        id: "home-decor",
        name: "Home Decor",
        description: "Decorating inspiration",
        icon: "🖼️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "decor-shows",
            name: "Decor Shows",
            events: generateEvents("decor-shows", 4),
          },
          {
            id: "antique-fairs",
            name: "Antique Fairs",
            events: generateEvents("antique-fairs", 4),
          },
          {
            id: "flea-markets",
            name: "Flea Markets",
            events: generateEvents("flea-markets", 5),
          },
          {
            id: "home-staging",
            name: "Home Staging Events",
            events: generateEvents("home-staging", 3),
          },
          {
            id: "seasonal-decor",
            name: "Seasonal Decor",
            events: generateEvents("seasonal-decor", 4),
          },
        ],
      },
    ],
  },

  // 14. PETS & ANIMALS
  {
    id: "pets-animals",
    name: "Pets & Animals",
    icon: "🐾",
    color: "#DDA0DD",
    description: "Pet events and animal activities",
    categories: [
      {
        id: "pet-events",
        name: "Pet Events",
        description: "Fun with pets",
        icon: "🐕",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "dog-shows",
            name: "Dog Shows",
            events: generateEvents("dog-shows", 4),
          },
          {
            id: "cat-shows",
            name: "Cat Shows",
            events: generateEvents("cat-shows", 4),
          },
          {
            id: "pet-expos",
            name: "Pet Expos",
            events: generateEvents("pet-expos", 4),
          },
          {
            id: "adoption-events",
            name: "Adoption Events",
            events: generateEvents("adoption-events", 5),
          },
          {
            id: "pet-costume",
            name: "Pet Costume Contests",
            events: generateEvents("pet-costume", 4),
          },
          {
            id: "dog-walks",
            name: "Charity Dog Walks",
            events: generateEvents("dog-walks", 4),
          },
        ],
      },
      {
        id: "pet-services",
        name: "Pet Services",
        description: "Professional pet care",
        icon: "🐈",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "training-classes",
            name: "Pet Training Classes",
            events: generateEvents("training-classes", 5),
          },
          {
            id: "grooming-workshops",
            name: "Grooming Workshops",
            events: generateEvents("grooming-workshops", 4),
          },
          {
            id: "pet-first-aid",
            name: "Pet First Aid",
            events: generateEvents("pet-first-aid", 3),
          },
          {
            id: "pet-nutrition",
            name: "Pet Nutrition",
            events: generateEvents("pet-nutrition", 3),
          },
          {
            id: "pet-photography",
            name: "Pet Photography",
            events: generateEvents("pet-photography", 4),
          },
        ],
      },
      {
        id: "animal-encounters",
        name: "Animal Encounters",
        description: "Wildlife experiences",
        icon: "🦒",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "zoo-events",
            name: "Zoo Events",
            events: generateEvents("zoo-events", 4),
          },
          {
            id: "aquarium-events",
            name: "Aquarium Events",
            events: generateEvents("aquarium-events", 4),
          },
          {
            id: "wildlife-parks",
            name: "Wildlife Parks",
            events: generateEvents("wildlife-parks", 4),
          },
          {
            id: "bird-sanctuaries",
            name: "Bird Sanctuaries",
            events: generateEvents("bird-sanctuaries", 3),
          },
          {
            id: "butterfly-gardens",
            name: "Butterfly Gardens",
            events: generateEvents("butterfly-gardens", 3),
          },
        ],
      },
    ],
  },

  // 15. HOBBIES & CRAFTS
  {
    id: "hobbies-crafts",
    name: "Hobbies & Crafts",
    icon: "✂️",
    color: "#CD5C5C",
    description: "Creative hobbies and crafting events",
    categories: [
      {
        id: "crafts",
        name: "Crafts",
        description: "Handmade creations",
        icon: "🧶",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "knitting-crochet",
            name: "Knitting & Crochet",
            events: generateEvents("knitting-crochet", 5),
          },
          {
            id: "sewing-quilting",
            name: "Sewing & Quilting",
            events: generateEvents("sewing-quilting", 5),
          },
          {
            id: "embroidery",
            name: "Embroidery",
            events: generateEvents("embroidery", 4),
          },
          {
            id: "paper-crafts",
            name: "Paper Crafts",
            events: generateEvents("paper-crafts", 4),
          },
          {
            id: "jewelry-making",
            name: "Jewelry Making",
            events: generateEvents("jewelry-making", 5),
          },
          {
            id: "woodworking",
            name: "Woodworking",
            events: generateEvents("woodworking", 4),
          },
          {
            id: "leather-working",
            name: "Leather Working",
            events: generateEvents("leather-working", 3),
          },
          {
            id: "glass-art",
            name: "Glass Art",
            events: generateEvents("glass-art", 3),
          },
        ],
      },
      {
        id: "collectibles",
        name: "Collectibles",
        description: "Collector events",
        icon: "🏺",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "coin-shows",
            name: "Coin Shows",
            events: generateEvents("coin-shows", 4),
          },
          {
            id: "stamp-shows",
            name: "Stamp Shows",
            events: generateEvents("stamp-shows", 4),
          },
          {
            id: "comic-book-fairs",
            name: "Comic Book Fairs",
            events: generateEvents("comic-book-fairs", 5),
          },
          {
            id: "toy-fairs",
            name: "Toy Fairs",
            events: generateEvents("toy-fairs", 4),
          },
          {
            id: "vintage-collectibles",
            name: "Vintage Collectibles",
            events: generateEvents("vintage-collectibles", 4),
          },
          {
            id: "trading-card-events",
            name: "Trading Card Events",
            events: generateEvents("trading-card-events", 5),
          },
        ],
      },
      {
        id: "photography",
        name: "Photography",
        description: "Photo walks and workshops",
        icon: "📷",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "photo-walks",
            name: "Photo Walks",
            events: generateEvents("photo-walks", 5),
          },
          {
            id: "photography-classes",
            name: "Photography Classes",
            events: generateEvents("photography-classes", 5),
          },
          {
            id: "camera-clubs",
            name: "Camera Clubs",
            events: generateEvents("camera-clubs", 4),
          },
          {
            id: "photo-exhibitions",
            name: "Photo Exhibitions",
            events: generateEvents("photo-exhibitions", 4),
          },
          {
            id: "wildlife-photography",
            name: "Wildlife Photography",
            events: generateEvents("wildlife-photography", 4),
          },
          {
            id: "portrait-workshops",
            name: "Portrait Workshops",
            events: generateEvents("portrait-workshops", 4),
          },
        ],
      },
      {
        id: "gardening-hobby",
        name: "Gardening Hobby",
        description: "Plant enthusiasts",
        icon: "🌿",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "bonsai-workshops",
            name: "Bonsai Workshops",
            events: generateEvents("bonsai-workshops", 4),
          },
          {
            id: "orchid-shows",
            name: "Orchid Shows",
            events: generateEvents("orchid-shows", 4),
          },
          {
            id: "succulent-workshops",
            name: "Succulent Workshops",
            events: generateEvents("succulent-workshops", 5),
          },
          {
            id: "herb-gardening",
            name: "Herb Gardening",
            events: generateEvents("herb-gardening", 4),
          },
          {
            id: "seed-swaps",
            name: "Seed Swaps",
            events: generateEvents("seed-swaps", 3),
          },
        ],
      },
    ],
  },

  // 16. SPIRITUALITY & RELIGION
  {
    id: "spirituality",
    name: "Spirituality & Religion",
    icon: "🕊️",
    color: "#E6E6FA",
    description: "Spiritual gatherings and religious events",
    categories: [
      {
        id: "spiritual-retreats",
        name: "Spiritual Retreats",
        description: "Inner peace journeys",
        icon: "🧘",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "meditation-camps",
            name: "Meditation Camps",
            events: generateEvents("meditation-camps", 4),
          },
          {
            id: "silent-retreats",
            name: "Silent Retreats",
            events: generateEvents("silent-retreats", 4),
          },
          {
            id: "pilgrimages",
            name: "Pilgrimages",
            events: generateEvents("pilgrimages", 3),
          },
          {
            id: "ashram-visits",
            name: "Ashram Visits",
            events: generateEvents("ashram-visits", 3),
          },
          {
            id: "spiritual-workshops",
            name: "Spiritual Workshops",
            events: generateEvents("spiritual-workshops", 4),
          },
        ],
      },
      {
        id: "religious-services",
        name: "Religious Services",
        description: "Worship and ceremonies",
        icon: "⛪",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "special-services",
            name: "Special Services",
            events: generateEvents("special-services", 5),
          },
          {
            id: "festival-celebrations",
            name: "Festival Celebrations",
            events: generateEvents("festival-celebrations", 5),
          },
          {
            id: "interfaith-events",
            name: "Interfaith Events",
            events: generateEvents("interfaith-events", 3),
          },
          {
            id: "choir-performances",
            name: "Choir Performances",
            events: generateEvents("choir-performances", 4),
          },
          {
            id: "religious-education",
            name: "Religious Education",
            events: generateEvents("religious-education", 4),
          },
        ],
      },
      {
        id: "holistic-health",
        name: "Holistic Health",
        description: "Alternative healing",
        icon: "✨",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "reiki-sessions",
            name: "Reiki Sessions",
            events: generateEvents("reiki-sessions", 4),
          },
          {
            id: "crystal-workshops",
            name: "Crystal Workshops",
            events: generateEvents("crystal-workshops", 4),
          },
          {
            id: "astrology-readings",
            name: "Astrology Readings",
            events: generateEvents("astrology-readings", 4),
          },
          {
            id: "tarot-readings",
            name: "Tarot Readings",
            events: generateEvents("tarot-readings", 4),
          },
          {
            id: "sound-healing",
            name: "Sound Healing",
            events: generateEvents("sound-healing", 4),
          },
          {
            id: "energy-healing",
            name: "Energy Healing",
            events: generateEvents("energy-healing", 3),
          },
        ],
      },
    ],
  },

  // 17. SCIENCE & NATURE
  {
    id: "science-nature",
    name: "Science & Nature",
    icon: "🔬",
    color: "#20B2AA",
    description: "Scientific discoveries and nature exploration",
    categories: [
      {
        id: "science-events",
        name: "Science Events",
        description: "Educational science activities",
        icon: "🧪",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "science-festivals",
            name: "Science Festivals",
            events: generateEvents("science-festivals", 4),
          },
          {
            id: "astronomy-nights",
            name: "Astronomy Nights",
            events: generateEvents("astronomy-nights", 5),
          },
          {
            id: "planetarium-shows",
            name: "Planetarium Shows",
            events: generateEvents("planetarium-shows", 4),
          },
          {
            id: "science-museum-events",
            name: "Science Museum Events",
            events: generateEvents("science-museum-events", 5),
          },
          {
            id: "rocket-launches",
            name: "Rocket Launches",
            events: generateEvents("rocket-launches", 3),
          },
          {
            id: "space-exhibitions",
            name: "Space Exhibitions",
            events: generateEvents("space-exhibitions", 4),
          },
        ],
      },
      {
        id: "nature-walks",
        name: "Nature Walks",
        description: "Outdoor exploration",
        icon: "🌲",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "guided-nature-walks",
            name: "Guided Nature Walks",
            events: generateEvents("guided-nature-walks", 5),
          },
          {
            id: "bird-watching-tours",
            name: "Bird Watching Tours",
            events: generateEvents("bird-watching-tours", 4),
          },
          {
            id: "wildlife-tracking",
            name: "Wildlife Tracking",
            events: generateEvents("wildlife-tracking", 3),
          },
          {
            id: "botanical-garden-tours",
            name: "Botanical Garden Tours",
            events: generateEvents("botanical-garden-tours", 4),
          },
          {
            id: "forest-bathing",
            name: "Forest Bathing",
            events: generateEvents("forest-bathing", 4),
          },
          {
            id: "stargazing-nights",
            name: "Stargazing Nights",
            events: generateEvents("stargazing-nights", 5),
          },
        ],
      },
      {
        id: "environmental",
        name: "Environmental Events",
        description: "Eco-awareness",
        icon: "🌍",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "earth-day-events",
            name: "Earth Day Events",
            events: generateEvents("earth-day-events", 4),
          },
          {
            id: "beach-cleanups",
            name: "Beach Cleanups",
            events: generateEvents("beach-cleanups", 4),
          },
          {
            id: "tree-planting",
            name: "Tree Planting",
            events: generateEvents("tree-planting", 4),
          },
          {
            id: "climate-change-talks",
            name: "Climate Change Talks",
            events: generateEvents("climate-change-talks", 4),
          },
          {
            id: "sustainable-living",
            name: "Sustainable Living Workshops",
            events: generateEvents("sustainable-living", 4),
          },
          {
            id: "conservation-projects",
            name: "Conservation Projects",
            events: generateEvents("conservation-projects", 3),
          },
        ],
      },
    ],
  },

  // 18. GAMING & ESPORTS
  {
    id: "gaming-esports",
    name: "Gaming & Esports",
    icon: "🎮",
    color: "#4B0082",
    description: "Video game tournaments and gaming conventions",
    categories: [
      {
        id: "esports-tournaments",
        name: "Esports Tournaments",
        description: "Competitive gaming",
        icon: "🏆",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "league-of-legends",
            name: "League of Legends",
            events: generateEvents("league-of-legends", 5),
          },
          { id: "dota-2", name: "Dota 2", events: generateEvents("dota-2", 5) },
          { id: "csgo", name: "CS:GO", events: generateEvents("csgo", 5) },
          {
            id: "valorant",
            name: "Valorant",
            events: generateEvents("valorant", 5),
          },
          {
            id: "overwatch",
            name: "Overwatch",
            events: generateEvents("overwatch", 4),
          },
          {
            id: "fortnite",
            name: "Fortnite",
            events: generateEvents("fortnite", 5),
          },
          {
            id: "call-of-duty",
            name: "Call of Duty",
            events: generateEvents("call-of-duty", 4),
          },
          {
            id: "fighting-games",
            name: "Fighting Games",
            events: generateEvents("fighting-games", 4),
          },
          {
            id: "mobile-esports",
            name: "Mobile Esports",
            events: generateEvents("mobile-esports", 4),
          },
        ],
      },
      {
        id: "gaming-conventions",
        name: "Gaming Conventions",
        description: "Gaming gatherings",
        icon: "🎪",
        image: "/api/placeholder/800/400",
        subcategories: [
          { id: "e3", name: "E3", events: generateEvents("e3", 2) },
          {
            id: "gamescom",
            name: "Gamescom",
            events: generateEvents("gamescom", 2),
          },
          {
            id: "tokyo-game-show",
            name: "Tokyo Game Show",
            events: generateEvents("tokyo-game-show", 2),
          },
          { id: "pax", name: "PAX", events: generateEvents("pax", 3) },
          {
            id: "dreamhack",
            name: "DreamHack",
            events: generateEvents("dreamhack", 3),
          },
          {
            id: "minecraft-fest",
            name: "Minecraft Fest",
            events: generateEvents("minecraft-fest", 3),
          },
          {
            id: "retro-gaming",
            name: "Retro Gaming Expos",
            events: generateEvents("retro-gaming", 4),
          },
        ],
      },
      {
        id: "game-launches",
        name: "Game Launches",
        description: "Midnight releases and events",
        icon: "🚀",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "midnight-launches",
            name: "Midnight Launches",
            events: generateEvents("midnight-launches", 5),
          },
          {
            id: "preview-events",
            name: "Preview Events",
            events: generateEvents("preview-events", 4),
          },
          {
            id: "beta-testing",
            name: "Beta Testing",
            events: generateEvents("beta-testing", 3),
          },
          {
            id: "fan-meetups",
            name: "Fan Meetups",
            events: generateEvents("fan-meetups", 4),
          },
          {
            id: "developer-q-and-a",
            name: "Developer Q&A",
            events: generateEvents("developer-q-and-a", 3),
          },
        ],
      },
    ],
  },

  // 19. VOLUNTEERING & COMMUNITY
  {
    id: "volunteering",
    name: "Volunteering & Community",
    icon: "🤝",
    color: "#2E8B57",
    description: "Give back and community service",
    categories: [
      {
        id: "community-service",
        name: "Community Service",
        description: "Local volunteering",
        icon: "🏘️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "food-banks",
            name: "Food Bank Volunteering",
            events: generateEvents("food-banks", 5),
          },
          {
            id: "homeless-outreach",
            name: "Homeless Outreach",
            events: generateEvents("homeless-outreach", 4),
          },
          {
            id: "senior-centers",
            name: "Senior Center Visits",
            events: generateEvents("senior-centers", 4),
          },
          {
            id: "youth-mentoring",
            name: "Youth Mentoring",
            events: generateEvents("youth-mentoring", 4),
          },
          {
            id: "community-centers",
            name: "Community Center Help",
            events: generateEvents("community-centers", 4),
          },
        ],
      },
      {
        id: "environmental-volunteering",
        name: "Environmental Volunteering",
        description: "Green initiatives",
        icon: "🌳",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "park-cleanups",
            name: "Park Cleanups",
            events: generateEvents("park-cleanups", 5),
          },
          {
            id: "trail-maintenance",
            name: "Trail Maintenance",
            events: generateEvents("trail-maintenance", 4),
          },
          {
            id: "wildlife-rescue",
            name: "Wildlife Rescue",
            events: generateEvents("wildlife-rescue", 3),
          },
          {
            id: "community-gardens",
            name: "Community Gardens",
            events: generateEvents("community-gardens", 4),
          },
          {
            id: "recycling-drives",
            name: "Recycling Drives",
            events: generateEvents("recycling-drives", 4),
          },
        ],
      },
      {
        id: "fundraisers",
        name: "Fundraisers",
        description: "Charity events",
        icon: "🎗️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "charity-runs",
            name: "Charity Runs",
            events: generateEvents("charity-runs", 5),
          },
          {
            id: "benefit-concerts",
            name: "Benefit Concerts",
            events: generateEvents("benefit-concerts", 4),
          },
          {
            id: "auctions",
            name: "Charity Auctions",
            events: generateEvents("auctions", 4),
          },
          {
            id: "galas",
            name: "Charity Galas",
            events: generateEvents("galas", 4),
          },
          {
            id: "crowdfunding-events",
            name: "Crowdfunding Events",
            events: generateEvents("crowdfunding-events", 3),
          },
        ],
      },
    ],
  },

  // 20. LUXURY & EXCLUSIVE
  {
    id: "luxury",
    name: "Luxury & Exclusive",
    icon: "💎",
    color: "#D4AF37",
    description: "Premium experiences and VIP events",
    categories: [
      {
        id: "luxury-experiences",
        name: "Luxury Experiences",
        description: "Ultra-premium events",
        icon: "👑",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "private-jet-parties",
            name: "Private Jet Parties",
            events: generateEvents("private-jet-parties", 3),
          },
          {
            id: "superyacht-charters",
            name: "Superyacht Charters",
            events: generateEvents("superyacht-charters", 3),
          },
          {
            id: "private-island-rentals",
            name: "Private Island Rentals",
            events: generateEvents("private-island-rentals", 2),
          },
          {
            id: "luxury-retreats",
            name: "Luxury Retreats",
            events: generateEvents("luxury-retreats", 4),
          },
          {
            id: "vip-packages",
            name: "VIP Packages",
            events: generateEvents("vip-packages", 5),
          },
        ],
      },
      {
        id: "exclusive-parties",
        name: "Exclusive Parties",
        description: "Invitation-only events",
        icon: "🥂",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "private-clubs",
            name: "Private Club Events",
            events: generateEvents("private-clubs", 4),
          },
          {
            id: "celebrity-parties",
            name: "Celebrity Parties",
            events: generateEvents("celebrity-parties", 3),
          },
          {
            id: "red-carpet-events",
            name: "Red Carpet Events",
            events: generateEvents("red-carpet-events", 4),
          },
          {
            id: "after-parties",
            name: "Award After Parties",
            events: generateEvents("after-parties", 4),
          },
          {
            id: "industry-only",
            name: "Industry Only Events",
            events: generateEvents("industry-only", 3),
          },
        ],
      },
      {
        id: "luxury-weddings",
        name: "Luxury Weddings",
        description: "Destination and high-end weddings",
        icon: "💒",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "destination-weddings-luxury",
            name: "Destination Weddings",
            events: generateEvents("destination-weddings-luxury", 3),
          },
          {
            id: "castle-weddings",
            name: "Castle Weddings",
            events: generateEvents("castle-weddings", 3),
          },
          {
            id: "villa-weddings",
            name: "Villa Weddings",
            events: generateEvents("villa-weddings", 3),
          },
          {
            id: "luxury-honeymoons",
            name: "Luxury Honeymoons",
            events: generateEvents("luxury-honeymoons", 3),
          },
        ],
      },
    ],
  },

  // 21. CAREER & JOB FAIRS
  {
    id: "career",
    name: "Career & Job Fairs",
    icon: "💼",
    color: "#4682B4",
    description: "Career opportunities and networking",
    categories: [
      {
        id: "job-fairs",
        name: "Job Fairs",
        description: "Employment opportunities",
        icon: "📋",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "tech-job-fairs",
            name: "Tech Job Fairs",
            events: generateEvents("tech-job-fairs", 5),
          },
          {
            id: "healthcare-job-fairs",
            name: "Healthcare Job Fairs",
            events: generateEvents("healthcare-job-fairs", 4),
          },
          {
            id: "engineering-job-fairs",
            name: "Engineering Job Fairs",
            events: generateEvents("engineering-job-fairs", 4),
          },
          {
            id: "finance-job-fairs",
            name: "Finance Job Fairs",
            events: generateEvents("finance-job-fairs", 4),
          },
          {
            id: "marketing-job-fairs",
            name: "Marketing Job Fairs",
            events: generateEvents("marketing-job-fairs", 4),
          },
          {
            id: "remote-job-fairs",
            name: "Remote Job Fairs",
            events: generateEvents("remote-job-fairs", 5),
          },
        ],
      },
      {
        id: "career-development",
        name: "Career Development",
        description: "Professional growth",
        icon: "📈",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "resume-workshops",
            name: "Resume Workshops",
            events: generateEvents("resume-workshops", 5),
          },
          {
            id: "interview-prep",
            name: "Interview Prep",
            events: generateEvents("interview-prep", 5),
          },
          {
            id: "career-coaching",
            name: "Career Coaching",
            events: generateEvents("career-coaching", 4),
          },
          {
            id: "linkedin-optimization",
            name: "LinkedIn Optimization",
            events: generateEvents("linkedin-optimization", 4),
          },
          {
            id: "salary-negotiation",
            name: "Salary Negotiation",
            events: generateEvents("salary-negotiation", 4),
          },
        ],
      },
      {
        id: "internships",
        name: "Internship Fairs",
        description: "Student opportunities",
        icon: "🎓",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "college-internships",
            name: "College Internships",
            events: generateEvents("college-internships", 5),
          },
          {
            id: "summer-internships",
            name: "Summer Internships",
            events: generateEvents("summer-internships", 5),
          },
          {
            id: "co-op-programs",
            name: "Co-op Programs",
            events: generateEvents("co-op-programs", 4),
          },
          {
            id: "graduate-programs",
            name: "Graduate Programs",
            events: generateEvents("graduate-programs", 4),
          },
        ],
      },
    ],
  },

  // 22. REAL ESTATE & PROPERTY
  {
    id: "real-estate",
    name: "Real Estate & Property",
    icon: "🏢",
    color: "#8B4513",
    description: "Property shows and real estate events",
    categories: [
      {
        id: "property-shows",
        name: "Property Shows",
        description: "Real estate exhibitions",
        icon: "🏠",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "international-property",
            name: "International Property Shows",
            events: generateEvents("international-property", 4),
          },
          {
            id: "luxury-real-estate",
            name: "Luxury Real Estate",
            events: generateEvents("luxury-real-estate", 4),
          },
          {
            id: "commercial-property",
            name: "Commercial Property",
            events: generateEvents("commercial-property", 4),
          },
          {
            id: "off-plan-property",
            name: "Off-Plan Property",
            events: generateEvents("off-plan-property", 4),
          },
          {
            id: "property-investment",
            name: "Property Investment",
            events: generateEvents("property-investment", 4),
          },
        ],
      },
      {
        id: "open-houses",
        name: "Open Houses",
        description: "Property viewings",
        icon: "🔑",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "luxury-open-houses",
            name: "Luxury Open Houses",
            events: generateEvents("luxury-open-houses", 5),
          },
          {
            id: "new-developments",
            name: "New Developments",
            events: generateEvents("new-developments", 5),
          },
          {
            id: "historical-properties",
            name: "Historical Properties",
            events: generateEvents("historical-properties", 4),
          },
          {
            id: "auction-viewings",
            name: "Auction Viewings",
            events: generateEvents("auction-viewings", 4),
          },
        ],
      },
      {
        id: "real-estate-seminars",
        name: "Real Estate Seminars",
        description: "Investment education",
        icon: "📊",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "first-time-buyers",
            name: "First Time Buyers",
            events: generateEvents("first-time-buyers", 5),
          },
          {
            id: "property-investing",
            name: "Property Investing",
            events: generateEvents("property-investing", 4),
          },
          {
            id: "real-estate-licensing",
            name: "Real Estate Licensing",
            events: generateEvents("real-estate-licensing", 4),
          },
          {
            id: "mortgage-seminars",
            name: "Mortgage Seminars",
            events: generateEvents("mortgage-seminars", 4),
          },
        ],
      },
    ],
  },

  // 23. AUTOMOTIVE
  {
    id: "automotive",
    name: "Automotive",
    icon: "🚗",
    color: "#2F4F4F",
    description: "Car shows and automotive events",
    categories: [
      {
        id: "car-shows",
        name: "Car Shows",
        description: "Vehicle exhibitions",
        icon: "🏎️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "classic-cars",
            name: "Classic Car Shows",
            events: generateEvents("classic-cars", 5),
          },
          {
            id: "luxury-cars",
            name: "Luxury Car Shows",
            events: generateEvents("luxury-cars", 4),
          },
          {
            id: "supercars",
            name: "Supercar Events",
            events: generateEvents("supercars", 4),
          },
          {
            id: "electric-vehicles",
            name: "Electric Vehicle Shows",
            events: generateEvents("electric-vehicles", 5),
          },
          {
            id: "motorcycle-shows",
            name: "Motorcycle Shows",
            events: generateEvents("motorcycle-shows", 4),
          },
          {
            id: "auto-expos",
            name: "Auto Expos",
            events: generateEvents("auto-expos", 4),
          },
        ],
      },
      {
        id: "racing-events",
        name: "Racing Events",
        description: "Motorsports",
        icon: "🏁",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "track-days",
            name: "Track Days",
            events: generateEvents("track-days", 5),
          },
          {
            id: "drag-racing",
            name: "Drag Racing",
            events: generateEvents("drag-racing", 4),
          },
          {
            id: "rally-events",
            name: "Rally Events",
            events: generateEvents("rally-events", 4),
          },
          {
            id: "car-club-meets",
            name: "Car Club Meets",
            events: generateEvents("car-club-meets", 5),
          },
          {
            id: "autocross",
            name: "Autocross",
            events: generateEvents("autocross", 4),
          },
        ],
      },
      {
        id: "automotive-workshops",
        name: "Automotive Workshops",
        description: "DIY and maintenance",
        icon: "🔧",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "maintenance-classes",
            name: "Maintenance Classes",
            events: generateEvents("maintenance-classes", 5),
          },
          {
            id: "performance-tuning",
            name: "Performance Tuning",
            events: generateEvents("performance-tuning", 4),
          },
          {
            id: "restoration-workshops",
            name: "Restoration Workshops",
            events: generateEvents("restoration-workshops", 4),
          },
          {
            id: "detailing-classes",
            name: "Detailing Classes",
            events: generateEvents("detailing-classes", 4),
          },
        ],
      },
    ],
  },

  // 24. AVIATION
  {
    id: "aviation",
    name: "Aviation",
    icon: "✈️",
    color: "#4169E1",
    description: "Air shows and aviation events",
    categories: [
      {
        id: "air-shows",
        name: "Air Shows",
        description: "Aviation displays",
        icon: "🛩️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "military-air-shows",
            name: "Military Air Shows",
            events: generateEvents("military-air-shows", 4),
          },
          {
            id: "civilian-air-shows",
            name: "Civilian Air Shows",
            events: generateEvents("civilian-air-shows", 4),
          },
          {
            id: "aerobatics",
            name: "Aerobatic Displays",
            events: generateEvents("aerobatics", 4),
          },
          {
            id: "vintage-aircraft",
            name: "Vintage Aircraft",
            events: generateEvents("vintage-aircraft", 4),
          },
        ],
      },
      {
        id: "aviation-expos",
        name: "Aviation Expos",
        description: "Industry events",
        icon: "🛰️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "airline-expos",
            name: "Airline Expos",
            events: generateEvents("airline-expos", 4),
          },
          {
            id: "private-aviation",
            name: "Private Aviation",
            events: generateEvents("private-aviation", 4),
          },
          {
            id: "drone-shows",
            name: "Drone Shows",
            events: generateEvents("drone-shows", 5),
          },
          {
            id: "space-aviation",
            name: "Space Aviation",
            events: generateEvents("space-aviation", 3),
          },
        ],
      },
      {
        id: "flight-training",
        name: "Flight Training",
        description: "Learn to fly",
        icon: "🎓",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "discovery-flights",
            name: "Discovery Flights",
            events: generateEvents("discovery-flights", 4),
          },
          {
            id: "pilot-training",
            name: "Pilot Training",
            events: generateEvents("pilot-training", 4),
          },
          {
            id: "flight-simulator",
            name: "Flight Simulator",
            events: generateEvents("flight-simulator", 5),
          },
          {
            id: "aviation-careers",
            name: "Aviation Careers",
            events: generateEvents("aviation-careers", 4),
          },
        ],
      },
    ],
  },

  // 25. MARITIME & BOATING
  {
    id: "maritime",
    name: "Maritime & Boating",
    icon: "⛵",
    color: "#1E90FF",
    description: "Boat shows and water activities",
    categories: [
      {
        id: "boat-shows",
        name: "Boat Shows",
        description: "Marine exhibitions",
        icon: "🛥️",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "yacht-shows",
            name: "Yacht Shows",
            events: generateEvents("yacht-shows", 4),
          },
          {
            id: "powerboat-shows",
            name: "Powerboat Shows",
            events: generateEvents("powerboat-shows", 4),
          },
          {
            id: "sailboat-shows",
            name: "Sailboat Shows",
            events: generateEvents("sailboat-shows", 4),
          },
          {
            id: "fishing-boat-shows",
            name: "Fishing Boat Shows",
            events: generateEvents("fishing-boat-shows", 4),
          },
        ],
      },
      {
        id: "boating-events",
        name: "Boating Events",
        description: "On-water activities",
        icon: "🚤",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "regattas",
            name: "Regattas",
            events: generateEvents("regattas", 4),
          },
          {
            id: "boat-parades",
            name: "Boat Parades",
            events: generateEvents("boat-parades", 4),
          },
          {
            id: "fishing-tournaments",
            name: "Fishing Tournaments",
            events: generateEvents("fishing-tournaments", 5),
          },
          {
            id: "sailing-cruises",
            name: "Sailing Cruises",
            events: generateEvents("sailing-cruises", 5),
          },
        ],
      },
      {
        id: "boating-education",
        name: "Boating Education",
        description: "Learn to boat",
        icon: "📚",
        image: "/api/placeholder/800/400",
        subcategories: [
          {
            id: "boating-safety",
            name: "Boating Safety",
            events: generateEvents("boating-safety", 4),
          },
          {
            id: "sailing-lessons",
            name: "Sailing Lessons",
            events: generateEvents("sailing-lessons", 5),
          },
          {
            id: "navigation-courses",
            name: "Navigation Courses",
            events: generateEvents("navigation-courses", 4),
          },
          {
            id: "captain-license",
            name: "Captain License",
            events: generateEvents("captain-license", 3),
          },
        ],
      },
    ],
  },
];

// Calculate totals for documentation
const totalServiceTypes = serviceTypes.length;
const totalCategories = serviceTypes.reduce(
  (acc, st) => acc + st.categories.length,
  0,
);
const totalSubcategories = serviceTypes.reduce(
  (acc, st) =>
    acc + st.categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
  0,
);

console.log(`📊 Data Summary:
- Service Types: ${totalServiceTypes}
- Categories: ${totalCategories}
- Subcategories: ${totalSubcategories}
- Total Events: ~${totalSubcategories * 4}+
`);

// Export both named and default
export default serviceTypes;