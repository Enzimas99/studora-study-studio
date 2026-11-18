export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type StudyStatus = "planned" | "done" | "skipped";
export type MaterialKind = "file" | "link";
export type EventKind = "event" | "class" | "other";

type Ts = { created_at: string; updated_at: string };

export type Profile = {
  id: string;
  full_name: string;
  course: string | null;
  university: string | null;
  current_period: string | null;
  student_id: string | null;
  avatar_url: string | null;
  timezone: string;
  weekly_study_goal_minutes: number;
  week_starts_on: number;
  notifications: Record<string, boolean> | null;
} & Ts;

export type DisciplineTopicJson = { id: string; title: string; studied: boolean };

export type Discipline = {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  professor: string | null;
  semester: string | null;
  color: string;
  schedule: string | null;
  room: string | null;
  workload_hours: number | null;
  content_progress: number;
  topics: DisciplineTopicJson[];
  notes: string | null;
  is_archived: boolean;
} & Ts;

export type Task = {
  id: string;
  user_id: string;
  discipline_id: string | null;
  title: string;
  description: string | null;
  due_at: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completed_at: string | null;
} & Ts;

export type Exam = {
  id: string;
  user_id: string;
  discipline_id: string;
  title: string;
  exam_date: string;
  weight: number;
  max_score: number;
  score: number | null;
  prep_progress: number;
  topics: string[];
  location: string | null;
  notes: string | null;
} & Ts;

export type StudySession = {
  id: string;
  user_id: string;
  discipline_id: string | null;
  title: string;
  starts_at: string;
  duration_minutes: number;
  status: StudyStatus;
  notes: string | null;
} & Ts;

export type Material = {
  id: string;
  user_id: string;
  discipline_id: string | null;
  title: string;
  description: string | null;
  kind: MaterialKind;
  url: string | null;
  storage_path: string | null;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
} & Ts;

export type CalendarEvent = {
  id: string;
  user_id: string;
  discipline_id: string | null;
  title: string;
  description: string | null;
  kind: EventKind;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
} & Ts;

export type DisciplineOverview = Pick<
  Discipline,
  | "id"
  | "user_id"
  | "name"
  | "code"
  | "professor"
  | "semester"
  | "color"
  | "workload_hours"
  | "content_progress"
  | "is_archived"
> & {
  tasks_total: number;
  tasks_done: number;
  tasks_pending: number;
  next_exam_at: string | null;
  average_score: number | null;
};

export type CalendarFeedItem = {
  user_id: string;
  source: "task" | "exam" | "study" | "event";
  source_id: string;
  title: string;
  discipline_id: string | null;
  starts_at: string;
  ends_at: string | null;
  status: string;
};

export type DashboardSummary = {
  pending_count: number;
  overdue_count: number;
  due_this_week_count: number;
  next_exam: {
    id: string;
    title: string;
    exam_date: string;
    discipline_id: string;
    discipline_name: string;
    discipline_color: string;
  } | null;
  week_studied_minutes: number;
  week_planned_minutes: number;
  week_goal_minutes: number;
  overall_average: number | null;
  graded_count: number;
};

export type WeeklyProgressDay = { day: string; done_minutes: number; planned_minutes: number };

type Insert<R, Req extends keyof R> = Pick<R, Req> & Partial<Omit<R, Req>>;
type Table<R, I> = {
  Row: R;
  Insert: I;
  Update: Partial<I>;
  Relationships: [];
};

export type DisciplineInsert = Insert<Discipline, "name">;
export type TaskInsert = Insert<Task, "title">;
export type ExamInsert = Insert<Exam, "discipline_id" | "title" | "exam_date">;
export type StudySessionInsert = Insert<StudySession, "title" | "starts_at" | "duration_minutes">;
export type MaterialInsert = Insert<Material, "title" | "kind">;
export type CalendarEventInsert = Insert<CalendarEvent, "title" | "starts_at">;

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: Table<Profile, Insert<Profile, "id">>;
      disciplines: Table<Discipline, DisciplineInsert>;
      tasks: Table<Task, TaskInsert>;
      exams: Table<Exam, ExamInsert>;
      study_sessions: Table<StudySession, StudySessionInsert>;
      materials: Table<Material, MaterialInsert>;
      calendar_events: Table<CalendarEvent, CalendarEventInsert>;
    };
    Views: {
      discipline_overview: { Row: DisciplineOverview; Relationships: [] };
      calendar_feed: { Row: CalendarFeedItem; Relationships: [] };
    };
    Functions: {
      dashboard_summary: { Args: Record<PropertyKey, never>; Returns: DashboardSummary };
      weekly_study_progress: { Args: Record<PropertyKey, never>; Returns: WeeklyProgressDay[] };
    };
    Enums: {
      task_status: TaskStatus;
      task_priority: TaskPriority;
      study_status: StudyStatus;
      material_kind: MaterialKind;
      event_kind: EventKind;
    };
    CompositeTypes: Record<string, never>;
  };
};
