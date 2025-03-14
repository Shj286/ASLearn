// COMP 3450: Mfon Udoh, Pasang Sherpa, Shubham Jangra
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import lessons from "@/app/lessons.json";
import { Lesson } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLesson(id: string) {
  const typedLessons: Lesson[] = lessons as Lesson[];

  return typedLessons.find((lesson) => lesson.id === id) || null;
}

