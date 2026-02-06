"use client";

import * as React from "react";
import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  Clock,
  MoreVertical,
  Plus,
  Trash2,
  Edit,
  Flag,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: Date | null;
  createdAt: Date;
}

interface TodoListProps {
  selectedDate?: Date;
  tasks: Task[];
  loading?: boolean;
  onAddTask: (task: Omit<Task, "id" | "createdAt">) => Promise<Task>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onToggleComplete: (id: string) => Promise<void>;
}

export function TodoList({
  selectedDate,
  tasks,
  loading = false,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleComplete,
}: TodoListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    dueDate: null as Date | null,
  });

  const handleAddTask = async () => {
    if (!formData.title.trim()) return;

    await onAddTask({
      title: formData.title,
      description: formData.description,
      completed: false,
      priority: formData.priority,
      dueDate: formData.dueDate,
    });

    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !formData.title.trim()) return;

    await onUpdateTask(editingTask.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
    });

    resetForm();
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleDeleteTask = async (id: string) => {
    await onDeleteTask(id);
  };

  const handleToggleComplete = async (id: string) => {
    await onToggleComplete(id);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "medium",
      dueDate: null,
    });
    setEditingTask(null);
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
    }
  };

  const getPriorityBadgeVariant = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
    }
  };

  // Filter tasks by selected date
  const filteredTasks = selectedDate
    ? tasks.filter((task) => {
        if (!task.dueDate) return false;
        return (
          task.dueDate.getDate() === selectedDate.getDate() &&
          task.dueDate.getMonth() === selectedDate.getMonth() &&
          task.dueDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : tasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const completedCount = filteredTasks.filter((t) => t.completed).length;
  const totalCount = filteredTasks.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            {selectedDate ? (
              <>
                {completedCount} of {totalCount} tasks on{" "}
                <span className="hidden sm:inline">
                  {format(selectedDate, "MMMM d, yyyy")}
                </span>
                <span className="sm:hidden">
                  {format(selectedDate, "MMM d, yyyy")}
                </span>
              </>
            ) : (
              <>
                {completedCount} of {totalCount} tasks completed
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "timeline" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("timeline")}
            >
              Timeline
            </Button>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Add Task</span>
                <span className="xs:hidden">Add</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[525px] sm:w-full">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? "Edit Task" : "Create New Task"}
                </DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? "Update the task details below."
                    : "Add a new task to your list. Click save when you're done."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: Task["priority"]) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal",
                            !formData.dueDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.dueDate ? (
                            format(formData.dueDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.dueDate || undefined}
                          onSelect={(date) =>
                            setFormData({ ...formData, dueDate: date || null })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingTask ? handleUpdateTask : handleAddTask}
                >
                  {editingTask ? "Update" : "Create"} Task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <div className="space-y-2 sm:space-y-3 flex-1 overflow-auto">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 transition-all hover:bg-accent/50",
                task.completed && "opacity-60",
              )}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task.id)}
                className="mt-1 shrink-0"
              />
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn(
                      "font-semibold text-sm sm:text-base",
                      task.completed && "line-through",
                    )}
                  >
                    {task.title}
                  </h3>
                  <Badge
                    variant={getPriorityBadgeVariant(task.priority)}
                    className="text-xs"
                  >
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                  {task.dueDate && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3 shrink-0" />
                      <span className="hidden sm:inline">
                        Due {format(task.dueDate, "MMM d, yyyy")}
                      </span>
                      <span className="sm:hidden">
                        {format(task.dueDate, "MMM d")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="hidden sm:inline">
                      Created {format(task.createdAt, "MMM d")}
                    </span>
                    <span className="sm:hidden">
                      {format(task.createdAt, "MMM d")}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(task)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No tasks yet</h3>
              <p className="text-sm text-muted-foreground">
                Get started by creating your first task
              </p>
            </div>
          )}
        </div>
      ) : (
        <TimelineView tasks={sortedTasks} />
      )}
    </div>
  );
}

function TimelineView({ tasks }: { tasks: Task[] }) {
  const groupedByDate = tasks.reduce(
    (acc, task) => {
      if (!task.dueDate) {
        if (!acc["No Due Date"]) acc["No Due Date"] = [];
        acc["No Due Date"].push(task);
      } else {
        const dateKey = format(task.dueDate, "MMMM d, yyyy");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
      }
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-blue-500";
    }
  };

  return (
    <div className="space-y-8 flex-1 overflow-auto">
      {Object.entries(groupedByDate).map(([date, dateTasks]) => (
        <div key={date} className="relative">
          <div className="sticky top-0 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10 pb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {date}
            </h3>
          </div>
          <div className="ml-6 space-y-4 border-l-2 border-border pl-6 pb-4">
            {dateTasks.map((task, index) => (
              <div key={task.id} className="relative">
                <div
                  className={cn(
                    "absolute -left-[29px] top-2 h-4 w-4 rounded-full border-2 border-background",
                    getPriorityColor(task.priority),
                  )}
                />
                <div
                  className={cn(
                    "rounded-lg border p-4 bg-card transition-all hover:shadow-md",
                    task.completed && "opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={cn(
                            "font-semibold",
                            task.completed && "line-through",
                          )}
                        >
                          {task.title}
                        </h4>
                        <Badge
                          variant={
                            task.priority === "high"
                              ? "destructive"
                              : task.priority === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => {}}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No tasks in timeline</h3>
          <p className="text-sm text-muted-foreground">
            Tasks with due dates will appear here
          </p>
        </div>
      )}
    </div>
  );
}
