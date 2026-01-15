
export enum AppView {
  DIAGNOSIS = 'diagnosis',
  SCRIPT = 'script',
  COPY = 'copy',
  XHS_NOTE = 'xhs_note',
  XHS_CASE = 'xhs_case',
  SETTINGS = 'settings'
}

export interface UserProfile {
  name: string;
  avatar: string; // Base64 string
  role: string;
  organization: string;
}

export interface CarModel {
  id: string;
  name: string;
  points: string[];
}

export interface DiagnosticMetric {
  label: string;
  value: number | string;
  benchmark: number;
  unit: string;
  isGood: boolean;
}

export interface ScriptData {
  time: string;
  visual: string;
  ui: string;
}

export interface ApiResponse {
  success: boolean;
  content: string;
  error?: string;
}
