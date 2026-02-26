import React from "react";
import { EventCard } from "../cards";

export const RecentlyViewedSection = ({ recentlyViewed }) => (
  <section className="py-12">
    <h2 className="text-2xl font-semibold mb-6">Recently Viewed</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {recentlyViewed.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  </section>
);

export default RecentlyViewedSection;