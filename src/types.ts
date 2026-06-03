export type StudyMode =
  | "General Mode"
  | "Viva Mode"
  | "Estimation Mode"
  | "AutoCAD Mode"
  | "Math Mode"
  | "Project Mode";

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
  mode?: StudyMode;
  attachmentName?: string;
  attachmentData?: string; // base64
}

export type ActiveTab = "study_desk" | "calculator" | "autocad" | "ms_office" | "viva_board";

export interface CADCommand {
  command: string;
  shortcut: string;
  category: "Draw" | "Modify" | "Dimension" | "Format" | "Utility";
  descriptionBangla: string;
  descriptionEnglish: string;
  useCase: string;
}

export interface FormulaResult {
  title: string;
  inputs: { [key: string]: number | string };
  outputs: { [key: string]: string | number };
  steps: string[];
}
