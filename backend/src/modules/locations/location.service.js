'use strict';
const Event = require('../events/event.model');
class LocationService {
  async getCities() {
    const cities = await Event.aggregate([
      {
        $match: {
          status: 'published',
          visibility: 'public',
          deletedAt: null,
          'location.city': { $exists: true, $ne: '' },
        },
      },
      { $group: { _id: '$location.city', country: { $first: '$location.country' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 100 },
    ]);
    return { cities };
  }
}
module.exports = new LocationService();
