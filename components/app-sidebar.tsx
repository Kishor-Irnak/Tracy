import * as React from "react";

import { DatePicker } from "@/components/date-picker";
import { NavUser } from "@/components/nav-user";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

interface Task {
  id: string;
  dueDate: Date | null;
  priority: "low" | "medium" | "high";
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedDate?: Date;
  onDateChange?: (date: Date | undefined) => void;
  tasks?: Task[];
}

export function AppSidebar({
  selectedDate,
  onDateChange,
  tasks,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader className="border-sidebar-border h-16 border-b">
        <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          tasks={tasks}
        />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
