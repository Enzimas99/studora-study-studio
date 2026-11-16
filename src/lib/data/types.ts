/**
 * Domain types for Studora. These mirror the future database tables
 * (subjects, tasks, exams, study_sessions, materials, profiles) so the
 * local demo store can later be swapped for Supabase queries.
 */

export type SubjectColor = "cobalt" | "teal" | "coral" | "amber" | "plum" | "sage";

export interface SubjectTopic {
  id: string;
  title: string;
  studied: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  professor: string;
  semester: string;
  color: SubjectColor;
  schedule: string;
  room: string;
  workload: number;
  topics: SubjectTopic[];
}

export type TaskStatus = "pendente" | "andamento" | "concluido";
export type Priority = "alta" | "media" | "baixa";

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  due: string; // ISO datetime
  priority: Priority;
  status: TaskStatus;
  notes?: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string; // ISO datetime
  weight: number;
  topics: string[];
  preparation: number; // 0..100
  grade: number | null; // null while not graded
  location?: string;
}

export type SessionStatus = "planejada" | "concluida" | "perdida";

export interface StudySession {
  id: string;
  subjectId: string;
  topic: string;
  start: string; // ISO datetime
  durationMin: number;
  status: SessionStatus;
}

export type MaterialType = "pdf" | "doc" | "slides" | "planilha" | "imagem" | "link";

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  subjectId: string;
  addedAt: string; // ISO datetime
  sizeKb: number;
}

export interface Profile {
  name: string;
  email: string;
  course: string;
  university: string;
  period: string;
  studentId: string;
  weeklyGoalHours: number;
  weekStartsOn: 0 | 1;
  notifications: {
    deadlines: boolean;
    exams: boolean;
    studyReminders: boolean;
    weeklyReport: boolean;
    email: boolean;
  };
}

export interface StudoraData {
  version: number;
  profile: Profile;
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  sessions: StudySession[];
  materials: Material[];
}
