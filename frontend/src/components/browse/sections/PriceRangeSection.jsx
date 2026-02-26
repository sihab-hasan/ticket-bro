import React from "react";

export const PriceRangeSection = ({ min, max }) => (
  <section className="py-12">
    <h2 className="text-2xl font-semibold mb-4">Price Range</h2>
    <p>
      From <span className="font-bold">${min}</span> to <span className="font-bold">${max}</span>
    </p>
  </section>
);

export default PriceRangeSection;