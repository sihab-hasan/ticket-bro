import React from "react";
import { ChevronRight } from "lucide-react";

export const BreadcrumbSection = ({ items }) => (
  <nav className="flex items-center text-sm text-muted-foreground mb-6">
    {items.map((item, index) => (
      <span key={index} className="flex items-center">
        <a href={item.href} className="hover:underline">{item.label}</a>
        {index < items.length - 1 && <ChevronRight className="w-4 h-4 mx-1" />}
      </span>
    ))}
  </nav>
);

export default BreadcrumbSection;