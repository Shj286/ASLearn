// COMP 3450: Mfon Udoh, Pasang Sherpa, Shubham Jangra
export interface Lesson {
  id: string;
  mode: "gesture" | "number";
  title_card: string;
  tutorial_title: string;
  instructions: string[];
  video: string;
  signs: string;
}

