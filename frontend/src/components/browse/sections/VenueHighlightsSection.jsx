import React from "react";

export const VenueHighlightsSection = ({ venues }) => (
  <section className="py-12">
    <h2 className="text-2xl font-semibold mb-6">Venue Highlights</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {venues.map((venue) => (
        <div key={venue.id} className="p-4 border rounded">
          <h3 className="font-bold">{venue.name}</h3>
          <p>{venue.location}</p>
        </div>
      ))}
    </div>
  </section>
);

export default VenueHighlightsSection;