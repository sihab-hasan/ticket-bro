import React from "react";
import { SubcategoryCard } from "../cards";

const SubcategoryNavSection = ({ subcategories }) => (
  <div className="flex flex-wrap gap-4 mb-6">
    {subcategories.map((sub) => (
      <SubcategoryCard key={sub.id} subcategory={sub} />
    ))}
  </div>
);

export default SubcategoryNavSection;