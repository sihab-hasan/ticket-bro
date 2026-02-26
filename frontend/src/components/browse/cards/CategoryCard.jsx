import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const CategoryCard = ({ category }) => {
  return (
    <Card className="w-full max-w-xs hover:shadow-md transition-shadow">
      <CardHeader>
        <img src={category.image} alt={category.name} className="w-full h-32 object-cover rounded-md" />
      </CardHeader>
      <CardContent>
        <h3 className="text-lg font-semibold">{category.name}</h3>
        <p className="text-sm text-muted-foreground">{category.description}</p>
      </CardContent>
    </Card>
  );
};

export default CategoryCard;