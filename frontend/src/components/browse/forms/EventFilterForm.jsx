import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BookingForm = ({ onSubmit }) => {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Input placeholder="Full Name" required />
      <Input placeholder="Email" type="email" required />
      <DatePicker placeholder="Select Date" required />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select Event Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="concert">Concert</SelectItem>
          <SelectItem value="workshop">Workshop</SelectItem>
          <SelectItem value="conference">Conference</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" variant="primary">Book Now</Button>
    </form>
  );
};

export default BookingForm;