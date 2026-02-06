"use client";

import { useEffect, useState } from "react";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: Date | null;
  createdAt: Date;
}

const STORAGE_KEY = "todo-tasks";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        const tasksArray = parsed.map((task: any) => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : null,
          createdAt: new Date(task.createdAt),
        }));
        setTasks(tasksArray);
      } else {
        // Initialize with sample data
        const sampleTasks: Task[] = [
          {
            id: "1",
            title: "Design new landing page",
            description: "Create wireframes and mockups for the new homepage",
            completed: false,
            priority: "high",
            dueDate: new Date(2026, 1, 10),
            createdAt: new Date(2026, 1, 5),
          },
          {
            id: "2",
            title: "Review pull requests",
            description: "Check and merge pending PRs from the team",
            completed: true,
            priority: "medium",
            dueDate: new Date(2026, 1, 7),
            createdAt: new Date(2026, 1, 4),
          },
          {
            id: "3",
            title: "Update documentation",
            description: "Add API documentation for new endpoints",
            completed: false,
            priority: "low",
            dueDate: new Date(2026, 1, 15),
            createdAt: new Date(2026, 1, 6),
          },
        ];
        setTasks(sampleTasks);
        saveTasks(sampleTasks);
      }
    } catch (e) {
      console.error("Error loading tasks:", e);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  const saveTasks = (tasksToSave: Task[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksToSave));
    } catch (e) {
      console.error("Error saving tasks:", e);
    }
  };

  const addTask = async (task: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    return newTask;
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task,
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}
