import React from "react";

export const GuideSection = ({ guides }) => (
  <section className="py-12">
    <h2 className="text-2xl font-semibold mb-6">Event Guides</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {guides.map((guide) => (
        <div key={guide.id} className="p-4 border rounded">
          <h3 className="font-bold mb-2">{guide.title}</h3>
          <p>{guide.description}</p>
        </div>
      ))}
    </div>
  </section>
);

export default GuideSection;