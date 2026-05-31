export interface UserProfile {
  id: string;
  name: string;
  email: string;
  weeklyGoal: number;
  dailyGoal: number;
  createdAt: Date;
}

export interface DailyLog {
  id: string;
  userId: string;
  date: Date | string;
  studyHours: number;
  moodScore: number;
  focusScore: number;
  sleepHours: number;
  exerciseCompleted: boolean;
  distractionHours: number;
  notes: string | null;
  productivityScore: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Insight {
  id: string;
  userId: string;
  type: "warning" | "positive" | "neutral" | "motivation";
  category: "sleep" | "focus" | "distraction" | "streak" | "study" | "general";
  message: string;
  date: Date | string;
  read: boolean;
}

export interface ProductivityStats {
  id: string;
  userId: string;
  weekStart: Date | string;
  avgStudyHours: number;
  avgMoodScore: number;
  avgFocusScore: number;
  avgSleepHours: number;
  totalStudyHours: number;
  consistencyScore: number;
  daysLogged: number;
}

export interface DashboardData {
  todayLog: DailyLog | null;
  weeklyStats: WeeklyStats;
  currentStreak: number;
  longestStreak: number;
  recentLogs: DailyLog[];
  insights: Insight[];
  chartData: ChartDataPoint[];
  heatmapData: HeatmapDay[];
  productivityScore: number;
}

export interface WeeklyStats {
  totalStudyHours: number;
  avgMoodScore: number;
  avgFocusScore: number;
  avgSleepHours: number;
  daysLogged: number;
  consistencyScore: number;
  weeklyGoal: number;
}

export interface ChartDataPoint {
  date: string;
  studyHours: number;
  moodScore: number;
  focusScore: number;
  distractionHours: number;
  productivityScore: number;
}

export interface HeatmapDay {
  date: string;
  count: number; // productivityScore mapped to 0–4
  value: number; // raw productivity score
}

export interface AnalyticsData {
  weekly: WeeklyStats[];
  monthly: MonthlyStats;
  bestDay: DailyLog | null;
  worstDay: DailyLog | null;
  longestStreak: number;
  currentStreak: number;
  consistencyScore: number;
  avgMoodScore: number;
  allTimeTotalHours: number;
}

export interface MonthlyStats {
  month: string;
  totalStudyHours: number;
  avgMoodScore: number;
  avgFocusScore: number;
  avgSleepHours: number;
  daysLogged: number;
  consistencyScore: number;
}

export interface LogsResponse {
  logs: DailyLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}
