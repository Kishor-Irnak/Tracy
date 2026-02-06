"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TodoList } from "@/components/todo-list";
import { useTasks } from "@/hooks/use-tasks";

export default function Page() {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const { tasks, loading, addTask, updateTask, deleteTask, toggleComplete } =
    useTasks();

  return (
    <SidebarProvider>
      <AppSidebar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        tasks={tasks}
      />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Task Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4 md:p-6 lg:p-8 overflow-hidden">
          <TodoList
            selectedDate={selectedDate}
            tasks={tasks}
            loading={loading}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onToggleComplete={toggleComplete}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
