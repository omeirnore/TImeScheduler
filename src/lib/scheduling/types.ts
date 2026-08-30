// All times are minutes-since-midnight (0-1440) within a single day.

export type BlockType =
  | "COLLEGE"
  | "COMMUTE"
  | "REST"
  | "STUDY"
  | "HABIT"
  | "FREE";

export interface ScheduleBlock {
  startMinute: number;
  endMinute: number;
  type: BlockType;
  label: string;
  sourceId?: string;
  locked?: boolean;
}

export interface UnscheduledItem {
  kind: "STUDY" | "HABIT";
  id: string;
  label: string;
  durationMinutes: number;
  reason: string;
}

export interface TimetableSlotInput {
  id: string;
  startMinute: number;
  endMinute: number;
  subject: string;
  room?: string | null;
}

export interface CommuteConfigInput {
  toCollegeMinutes: number;
  fromCollegeMinutes: number;
  restBufferMinutes: number;
  wakeMinute: number;
  sleepMinute: number;
}

export interface StudyEntryInput {
  id: string;
  subjectName: string;
  durationMinutes: number;
  orderIndex: number;
}

export interface HabitInput {
  id: string;
  name: string;
  targetDays: number[]; // 0 = Sunday ... 6 = Saturday
  preferredStartMinute?: number | null;
  preferredEndMinute?: number | null;
  durationMinutes: number;
  priority: number; // lower = placed first
  locked: boolean;
  lockedStartMinute?: number | null;
}

export interface DayScheduleInput {
  dayOfWeek: number;
  timetableSlots: TimetableSlotInput[]; // already filtered for date-specific skips
  commute: CommuteConfigInput;
  studyEntries: StudyEntryInput[]; // already resolved (template or per-date override), sorted by orderIndex
  habits: HabitInput[]; // all habits; engine filters by targetDays
}

export interface DayScheduleResult {
  isCollegeDay: boolean;
  blocks: ScheduleBlock[];
  unscheduled: UnscheduledItem[];
}
