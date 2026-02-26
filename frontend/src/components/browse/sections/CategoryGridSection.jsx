import React from "react";
import { CategoryCard } from "../cards";

const CategoryGridSection = ({ categories }) => (
  <section className="py-12">
    <h2 className="text-2xl font-semibold mb-6">Categories</h2>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <CategoryCard key={category.id} category={category} />
      ))}
    </div>
  </section>
);

export default CategoryGridSection;