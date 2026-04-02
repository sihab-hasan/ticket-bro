'use strict';
const TYPES = ['conference','concert','sports','festival','workshop','networking','webinar','fundraiser','exhibition','other'];
class EventTypesService {
  async getAll() { return { types: TYPES.map(t => ({ value: t, label: t.charAt(0).toUpperCase()+t.slice(1) })) }; }
}
module.exports = new EventTypesService();
