import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const SubcategoryCard = ({ subcategory }) => {
  return (
    <Card className="w-full max-w-xs hover:shadow-md transition-shadow">
      <CardHeader>
        <img src={subcategory.image} alt={subcategory.name} className="w-full h-28 object-cover rounded-md" />
      </CardHeader>
      <CardContent>
        <h4 className="text-md font-semibold">{subcategory.name}</h4>
      </CardContent>
    </Card>
  );
};

export default SubcategoryCard;