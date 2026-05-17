// ============ 枚举类型 ============

export type MeetingStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

export type MeetingPriority = 'high' | 'medium' | 'low';

export type ParticipantRole = 'host' | 'speaker' | 'attendee';

export type ActionItemStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export type ActionItemPriority = 'high' | 'medium' | 'low';

export type MaterialType = 'document' | 'slide' | 'spreadsheet' | 'image' | 'other';

// ============ 核心数据模型 ============

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: ParticipantRole;
  email: string;
  department: string;
  hasConfirmed: boolean;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  duration: number;
  speaker: string;
  order: number;
}

export interface MeetingMaterial {
  id: string;
  name: string;
  type: MaterialType;
  fileSize: string;
  uploader: string;
  uploadedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: MeetingStatus;
  priority: MeetingPriority;
  room?: string;
  meetingLink?: string;
  participants: Participant[];
  agenda: AgendaItem[];
  materials: MeetingMaterial[];
  preparationChecklist?: PreparationItem[];
  minutesId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreparationItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface DiscussionPoint {
  id: string;
  topic: string;
  content: string;
  speaker: string;
  duration: number;
  timestamp: string;
}

export interface MeetingMinutes {
  id: string;
  meetingId: string;
  meetingTitle: string;
  date: string;
  summary: string;
  keyDecisions: string[];
  discussionPoints: DiscussionPoint[];
  actionItems: ActionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description?: string;
  meetingId: string;
  meetingTitle: string;
  assignee: string;
  dueDate: string;
  status: ActionItemStatus;
  priority: ActionItemPriority;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalMeetings: number;
  upcomingToday: number;
  pendingItems: number;
  overdueItems: number;
  completedThisWeek: number;
}

// ============ 筛选参数 ============

export interface MeetingFilter {
  status?: MeetingStatus;
  search?: string;
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

export interface ActionItemFilter {
  status?: ActionItemStatus;
  priority?: ActionItemPriority;
  assignee?: string;
  meetingId?: string;
}
