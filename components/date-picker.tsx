"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";

interface Task {
  id: string;
  dueDate: Date | null;
  priority: "low" | "medium" | "high";
}

interface DatePickerProps {
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  tasks?: Task[];
}

export function DatePicker({
  selectedDate,
  onDateChange,
  tasks = [],
}: DatePickerProps) {
  // Get the highest priority for each date
  const getDatePriority = (date: Date) => {
    const tasksOnDate = tasks.filter((task) => {
      if (!task.dueDate) return false;
      return (
        task.dueDate.getDate() === date.getDate() &&
        task.dueDate.getMonth() === date.getMonth() &&
        task.dueDate.getFullYear() === date.getFullYear()
      );
    });

    if (tasksOnDate.length === 0) return null;

    // Return highest priority (high > medium > low)
    if (tasksOnDate.some((t) => t.priority === "high")) return "high";
    if (tasksOnDate.some((t) => t.priority === "medium")) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
      default:
        return "";
    }
  };

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateChange}
          className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
          components={{
            DayButton: ({ day, ...props }) => {
              const priority = getDatePriority(day.date);
              const isSelected =
                selectedDate &&
                day.date.getDate() === selectedDate.getDate() &&
                day.date.getMonth() === selectedDate.getMonth() &&
                day.date.getFullYear() === selectedDate.getFullYear();

              return (
                <button
                  {...props}
                  className={`relative w-full h-full rounded-md ${
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {day.date.getDate()}
                  {priority && (
                    <span
                      className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${getPriorityColor(
                        priority,
                      )}`}
                    />
                  )}
                </button>
              );
            },
          }}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
