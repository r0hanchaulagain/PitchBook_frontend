"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@ui/button";
import { Calendar } from "@ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

interface Calendar22Props {
  date?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
}

export function Calendar22({ date, onDateChange, className }: Calendar22Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="w-48 justify-between font-normal"
          >
            {date ? date.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                onDateChange?.(selectedDate);
                setOpen(false);
              }
            }}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
