import { simulateApiCall } from './client';
import { seedMeetings, seedMinutes, seedActionItems } from '../mocks/seed';
import type { Meeting, ActionItem, MeetingFilter, ActionItemFilter } from '../types';

// 内存中的数据副本，支持运行时修改
const meetings = [...seedMeetings];
const minutes = [...seedMinutes];
const actionItems = [...seedActionItems];

let meetingIdCounter = 100;

// ============ 会议 API ============

export const meetingApi = {
  /** 获取会议列表 */
  async getList(filter?: MeetingFilter) {
    await simulateApiCall(null);
    let result = [...meetings];

    if (filter?.status) {
      result = result.filter((m) => m.status === filter.status);
    }
    if (filter?.search) {
      const kw = filter.search.toLowerCase();
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(kw) ||
          m.description?.toLowerCase().includes(kw) ||
          m.participants.some((p) => p.name.includes(kw))
      );
    }
    if (filter?.dateRange) {
      const [from, to] = filter.dateRange;
      result = result.filter((m) => m.date >= from && m.date <= to);
    }

    // 分页
    const page = filter?.page || 1;
    const pageSize = filter?.pageSize || 10;
    const total = result.length;
    const items = result.slice((page - 1) * pageSize, page * pageSize);

    return { items, total, page, pageSize };
  },

  /** 获取单个会议详情 */
  async getById(id: string) {
    await simulateApiCall(null);
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) throw new Error('会议不存在');
    return { ...meeting };
  },

  /** 获取会议纪要 */
  async getMinutes(meetingId: string) {
    await simulateApiCall(null);
    const mm = minutes.find((m) => m.meetingId === meetingId);
    if (!mm) throw new Error('纪要不存在');
    return { ...mm };
  },

  /** 创建新会议 */
  async create(data: Partial<Meeting>) {
    await simulateApiCall(null);
    const newMeeting: Meeting = {
      id: String(++meetingIdCounter),
      title: data.title || '新建会议',
      date: data.date || new Date().toISOString().split('T')[0],
      startTime: data.startTime || '10:00',
      endTime: data.endTime || '11:00',
      status: 'upcoming',
      priority: data.priority || 'medium',
      participants: data.participants || [],
      agenda: data.agenda || [],
      materials: data.materials || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    meetings.unshift(newMeeting);
    return newMeeting;
  },

  /** 更新准备清单项 */
  async updateChecklistItem(meetingId: string, itemId: string, checked: boolean) {
    await simulateApiCall(null);
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) throw new Error('会议不存在');
    const item = meeting.preparationChecklist?.find((i) => i.id === itemId);
    if (item) item.checked = checked;
    return { ...meeting };
  },

  /** 标记会议为已完成 */
  async complete(id: string) {
    await simulateApiCall(null);
    const meeting = meetings.find((m) => m.id === id);
    if (!meeting) throw new Error('会议不存在');
    meeting.status = 'completed';
    meeting.updatedAt = new Date().toISOString();
    return { ...meeting };
  },
};

// ============ 待办事项 API ============

export const actionItemApi = {
  /** 获取待办列表 */
  async getList(filter?: ActionItemFilter) {
    await simulateApiCall(null);
    let result = [...actionItems];

    if (filter?.status) {
      result = result.filter((a) => a.status === filter.status);
    }
    if (filter?.priority) {
      result = result.filter((a) => a.priority === filter.priority);
    }
    if (filter?.assignee) {
      const kw = filter.assignee.toLowerCase();
      result = result.filter((a) => a.assignee.toLowerCase().includes(kw));
    }
    if (filter?.meetingId) {
      result = result.filter((a) => a.meetingId === filter.meetingId);
    }

    return result;
  },

  /** 更新待办状态 */
  async updateStatus(id: string, status: ActionItem['status']) {
    await simulateApiCall(null);
    const item = actionItems.find((a) => a.id === id);
    if (!item) throw new Error('待办不存在');
    item.status = status;
    if (status === 'completed') {
      item.completedAt = new Date().toISOString();
    }
    return { ...item };
  },
};
