'use strict';
module.exports = {
  event:        (id)   => `event:${id}`,
  eventSlug:    (slug) => `event:slug:${slug}`,
  categories:   ()     => 'categories:all',
  userProfile:  (id)   => `user:${id}:profile`,
  searchResult: (hash) => `search:${hash}`,
};
