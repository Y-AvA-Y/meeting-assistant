import { faker } from '@faker-js/faker/locale/zh_CN';
import type {
  Meeting,
  Participant,
  AgendaItem,
  MeetingMaterial,
  MeetingMinutes,
  ActionItem,
  MeetingStatus,
  PreparationItem,
  DiscussionPoint,
} from '../types';
import {
  MEETING_TITLES,
  DEPARTMENTS,
  AGENDA_TOPICS,
  CHECKLIST_TEMPLATES,
  ACTION_ITEM_TEMPLATES,
  MODULES,
  DECISION_TEMPLATES,
  DISCUSSION_TEMPLATES,
  MEETING_DESC_TEMPLATES,
  SUMMARY_TEMPLATES,
  SESSION_TYPES,
} from './constants';

// ============ 工具函数 ============

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
};

const randomBetween = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pad = (n: number) => n.toString().padStart(2, '0');
const toTime = (h: number, m: number) => `${pad(h)}:${pad(m)}`;

// 生成 UUID 简写
const uid = () => faker.string.uuid().slice(0, 8);

// 模板字符串替换
const fill = (template: string, deps: string[], modules: string[]) => {
  let result = template;
  result = result.replace(/\{dep\}/g, deps[0] || '');
  result = result.replace(/\{dep2\}/g, deps[1] || deps[0] || '');
  result = result.replace(/\{dept\}/g, deps[0] || '');
  result = result.replace(/\{module\}/g, modules[0] || '');
  result = result.replace(/\{time\}/g, `${randomBetween(1, 5)}个`);
  result = result.replace(/\{session\}/g, pick(SESSION_TYPES));
  return result;
};

// ============ 数据生成器 ============

const generateParticipants = (): Participant[] => {
  const count = randomBetween(3, 8);
  return Array.from({ length: count }, (_, i) => ({
    id: uid(),
    name: faker.person.fullName(),
    role: i === 0 ? 'host' : i === 1 ? 'speaker' : pick(['speaker', 'attendee']),
    email: faker.internet.email(),
    department: pick(DEPARTMENTS),
    hasConfirmed: Math.random() > 0.3,
  }));
};

const generateAgenda = (): AgendaItem[] => {
  const count = randomBetween(3, 6);
  return pickN(AGENDA_TOPICS, count).map((title, i) => ({
    id: uid(),
    title: `${title}${Math.random() > 0.5 ? ` — ${pick(MODULES)}` : ''}`,
    description: Math.random() > 0.5 ? faker.lorem.sentence() : undefined,
    duration: [10, 15, 20, 30, 45][randomBetween(0, 4)],
    speaker: faker.person.fullName(),
    order: i + 1,
  }));
};

const generateMaterials = (): MeetingMaterial[] => {
  const count = randomBetween(0, 4);
  const types: MeetingMaterial['type'][] = ['document', 'slide', 'spreadsheet', 'image', 'other'];
  return Array.from({ length: count }, () => ({
    id: uid(),
    name: pick([
      '技术方案文档',
      '产品需求文档',
      'Q3 规划.pptx',
      '周报汇总',
      '数据分析报告',
      '架构设计图',
      '用户研究报告',
    ]),
    type: pick(types),
    fileSize: `${randomBetween(1, 50) / 10} MB`,
    uploader: faker.person.fullName(),
    uploadedAt: faker.date.recent({ days: 7 }).toISOString(),
  }));
};

const generateChecklist = (): PreparationItem[] =>
  pickN(CHECKLIST_TEMPLATES, randomBetween(3, 6)).map((label) => ({
    id: uid(),
    label,
    checked: Math.random() > 0.5,
  }));

export const generateMeetings = (count: number): Meeting[] => {
  const now = new Date();
  const meetings: Meeting[] = [];

  for (let i = 0; i < count; i++) {
    // 时间分布：过去7天 ~ 未来5天
    const dayOffset = randomBetween(-7, 5);
    const meetingDate = new Date(now);
    meetingDate.setDate(meetingDate.getDate() + dayOffset);

    const dateStr = meetingDate.toISOString().split('T')[0];
    const startH = randomBetween(9, 16);
    const startM = [0, 15, 30, 45][randomBetween(0, 3)];
    const duration = [30, 45, 60, 90][randomBetween(0, 3)];
    const endH = startH + Math.floor((startM + duration) / 60);
    const endM = (startM + duration) % 60;

    const todayStr = now.toISOString().split('T')[0];
    let status: MeetingStatus;
    if (dateStr < todayStr) {
      status = Math.random() > 0.1 ? 'completed' : 'cancelled';
    } else if (dateStr === todayStr) {
      const nowHour = now.getHours();
      const nowMin = now.getMinutes();
      const meetingStart = startH * 60 + startM;
      const meetingEnd = meetingStart + duration;
      const nowTotal = nowHour * 60 + nowMin;
      if (nowTotal < meetingStart) status = 'upcoming';
      else if (nowTotal >= meetingStart && nowTotal <= meetingEnd) status = 'in-progress';
      else status = 'completed';
    } else {
      status = 'upcoming';
    }

    const deps = pickN(DEPARTMENTS, 2);
    const mods = pickN(MODULES, 2);

    const meeting: Meeting = {
      id: uid(),
      title: pick(MEETING_TITLES),
      description: Math.random() > 0.3 ? fill(pick(MEETING_DESC_TEMPLATES), deps, mods) : undefined,
      date: dateStr,
      startTime: toTime(startH, startM),
      endTime: toTime(endH, endM),
      status,
      priority: pick(['high', 'medium', 'low']),
      room: Math.random() > 0.3 ? `${randomBetween(3, 12)}0${randomBetween(1, 9)}会议室` : undefined,
      meetingLink: Math.random() > 0.4 ? `https://meeting.example.com/${uid()}` : undefined,
      participants: generateParticipants(),
      agenda: generateAgenda(),
      materials: generateMaterials(),
      preparationChecklist: status === 'upcoming' ? generateChecklist() : undefined,
      createdAt: faker.date.recent({ days: 14 }).toISOString(),
      updatedAt: faker.date.recent({ days: 3 }).toISOString(),
    };

    meetings.push(meeting);
  }

  return meetings.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });
};

export const generateMinutes = (meeting: Meeting): MeetingMinutes => {
  const deps = pickN(DEPARTMENTS, 2);
  const mods = pickN(MODULES, 2);
  const actionItems = generateActionItems(randomBetween(2, 5), meeting.id, meeting.title);

  const discussionPoints: DiscussionPoint[] = pickN(DISCUSSION_TEMPLATES, randomBetween(2, 4)).map(
    (tpl, idx) => {
      const ts = meeting.startTime;
      const [h, m] = ts.split(':').map(Number);
      const totalMin = h * 60 + m + (idx + 1) * randomBetween(5, 15);
      const dh = Math.floor(totalMin / 60) % 24;
      const dm = totalMin % 60;
      return {
        id: uid(),
        topic: tpl.topic,
        content: fill(tpl.content, deps, mods),
        speaker: meeting.participants[idx % meeting.participants.length]?.name || faker.person.fullName(),
        duration: randomBetween(5, 15),
        timestamp: `${pad(dh)}:${pad(dm)}`,
      };
    }
  );

  return {
    id: uid(),
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    date: meeting.date,
    summary: fill(pick(SUMMARY_TEMPLATES), deps, mods),
    keyDecisions: pickN(DECISION_TEMPLATES, randomBetween(2, 4)).map((tpl) =>
      fill(tpl, deps, mods)
    ),
    discussionPoints,
    actionItems,
    createdAt: new Date(meeting.date + 'T' + meeting.endTime).toISOString(),
    updatedAt: new Date(meeting.date + 'T' + meeting.endTime).toISOString(),
  };
};

export const generateActionItems = (
  count: number,
  meetingId?: string,
  meetingTitle?: string
): ActionItem[] => {
  const now = new Date();
  return Array.from({ length: count }, () => {
    const tpl = pick(ACTION_ITEM_TEMPLATES);
    const dueOffset = randomBetween(-2, 7);
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + dueOffset);

    const today = new Date(now).toISOString().split('T')[0];
    const dueStr = dueDate.toISOString().split('T')[0];
    let status: ActionItem['status'] = 'pending';
    if (dueStr < today) {
      status = Math.random() > 0.4 ? 'completed' : 'overdue';
    } else if (Math.random() > 0.7) {
      status = 'in-progress';
    }

    return {
      id: uid(),
      title: tpl.title.replace('{module}', pick(MODULES)).replace('{dept}', pick(DEPARTMENTS)),
      description: Math.random() > 0.5 ? faker.lorem.sentence() : undefined,
      meetingId: meetingId || uid(),
      meetingTitle: meetingTitle || pick(MEETING_TITLES),
      assignee: faker.person.fullName(),
      dueDate: dueStr,
      status,
      priority: tpl.priority,
      createdAt: faker.date.recent({ days: 10 }).toISOString(),
      completedAt: status === 'completed' ? dueDate.toISOString() : undefined,
    };
  });
};
