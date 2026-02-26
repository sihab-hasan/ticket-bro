import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SubscriptionForm = ({ onSubscribe }) => {
  return (
    <form className="flex gap-2" onSubmit={onSubscribe}>
      <Input placeholder="Enter your email" type="email" required />
      <Button type="submit" variant="primary">Subscribe</Button>
    </form>
  );
};

export default SubscriptionForm;