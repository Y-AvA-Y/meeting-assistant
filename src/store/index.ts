import { create } from 'zustand';
import type { Meeting, MeetingMinutes, ActionItem, DashboardStats, MeetingFilter, ActionItemFilter } from '../types';
import { meetingApi, actionItemApi } from '../api/meetings';

// ============ 会议 Store ============

interface MeetingState {
  meetings: Meeting[];
  meetingTotal: number;
  currentMeeting: Meeting | null;
  currentMinutes: MeetingMinutes | null;
  actionItems: ActionItem[];
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;

  fetchMeetings: (filter?: MeetingFilter) => Promise<void>;
  fetchMeetingById: (id: string) => Promise<void>;
  fetchMinutes: (meetingId: string) => Promise<void>;
  fetchActionItems: (filter?: ActionItemFilter) => Promise<void>;
  updateActionItemStatus: (id: string, status: ActionItem['status']) => Promise<void>;
  updateChecklistItem: (meetingId: string, itemId: string, checked: boolean) => Promise<void>;
  markMeetingCompleted: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useMeetingStore = create<MeetingState>((set, get) => ({
  meetings: [],
  meetingTotal: 0,
  currentMeeting: null,
  currentMinutes: null,
  actionItems: [],
  stats: {
    totalMeetings: 0,
    upcomingToday: 0,
    pendingItems: 0,
    overdueItems: 0,
    completedThisWeek: 0,
  },
  isLoading: false,
  error: null,

  fetchMeetings: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const { items, total } = await meetingApi.getList(filter);
      // 同时计算统计
      const allMeetings = await meetingApi.getList({ pageSize: 100 });
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split('T')[0];

      const allActions = await actionItemApi.getList();
      set({
        meetings: items,
        meetingTotal: total,
        stats: {
          totalMeetings: allMeetings.total,
          upcomingToday: allMeetings.items.filter((m) => m.date === today && m.status === 'upcoming').length,
          pendingItems: allActions.filter((a) => a.status === 'pending' || a.status === 'in-progress').length,
          overdueItems: allActions.filter((a) => a.status === 'overdue').length,
          completedThisWeek: allMeetings.items.filter(
            (m) => m.status === 'completed' && m.date >= weekStr
          ).length,
        },
        isLoading: false,
      });
    } catch {
      set({ error: '加载失败，请稍后重试', isLoading: false });
    }
  },

  fetchMeetingById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const meeting = await meetingApi.getById(id);
      set({ currentMeeting: meeting, isLoading: false });
    } catch {
      set({ error: '会议不存在', isLoading: false });
    }
  },

  fetchMinutes: async (meetingId) => {
    set({ isLoading: true, error: null });
    try {
      const minutes = await meetingApi.getMinutes(meetingId);
      set({ currentMinutes: minutes, isLoading: false });
    } catch {
      set({ error: '纪要不存在', isLoading: false });
    }
  },

  fetchActionItems: async (filter) => {
    set({ isLoading: true, error: null });
    try {
      const items = await actionItemApi.getList(filter);
      set({ actionItems: items, isLoading: false });
    } catch {
      set({ error: '加载待办失败', isLoading: false });
    }
  },

  updateActionItemStatus: async (id, status) => {
    try {
      const updated = await actionItemApi.updateStatus(id, status);
      const currentItems = get().actionItems;
      set({
        actionItems: currentItems.map((a) => (a.id === id ? updated : a)),
      });
    } catch {
      set({ error: '更新失败' });
    }
  },

  updateChecklistItem: async (meetingId, itemId, checked) => {
    try {
      const updated = await meetingApi.updateChecklistItem(meetingId, itemId, checked);
      set({ currentMeeting: updated });
    } catch {
      set({ error: '更新失败' });
    }
  },

  markMeetingCompleted: async (id) => {
    try {
      const updated = await meetingApi.complete(id);
      const allMeetings = get().meetings;
      set({
        currentMeeting: updated,
        meetings: allMeetings.map((m) => (m.id === id ? updated : m)),
      });
    } catch {
      set({ error: '操作失败' });
    }
  },

  clearError: () => set({ error: null }),
}));

// ============ UI Store ============

interface UIState {
  sidebarCollapsed: boolean;
  searchQuery: string;
  toggleSidebar: () => void;
  setSearchQuery: (q: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  searchQuery: '',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
