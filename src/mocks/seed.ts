import { generateMeetings, generateMinutes, generateActionItems } from './generators';
import type { Meeting, MeetingMinutes, ActionItem } from '../types';

// 生成 20 个会议（时间分布在过去一周到未来五天）
export const seedMeetings: Meeting[] = generateMeetings(20);

// 为已完成的会议生成纪要
export const seedMinutes: MeetingMinutes[] = seedMeetings
  .filter((m) => m.status === 'completed')
  .map((m) => generateMinutes(m));

// 从纪要中收集待办，再加一些独立的待办
const minutesActionItems = seedMinutes.flatMap((m) => m.actionItems);
const extraActions = generateActionItems(5);
export const seedActionItems: ActionItem[] = [...minutesActionItems, ...extraActions];

// 为已完成会议关联纪要 ID
seedMeetings.forEach((m) => {
  const minutes = seedMinutes.find((mm) => mm.meetingId === m.id);
  if (minutes) {
    m.minutesId = minutes.id;
  }
});
