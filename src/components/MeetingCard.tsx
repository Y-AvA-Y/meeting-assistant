import { useNavigate } from 'react-router-dom';
import { Card, Space, Typography, Avatar, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { Meeting } from '../types';
import StatusTag from './StatusTag';

const { Text, Paragraph } = Typography;

interface MeetingCardProps {
  meeting: Meeting;
  showActions?: boolean;
}

const MeetingCard = ({ meeting, showActions = true }: MeetingCardProps) => {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      style={{ marginBottom: 12 }}
      onClick={() => navigate(`/meetings/${meeting.id}`)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Space direction="vertical" size={4} style={{ flex: 1 }}>
          <Space>
            <StatusTag status={meeting.status} />
            <Text strong style={{ fontSize: 15 }}>{meeting.title}</Text>
          </Space>
          {meeting.description && (
            <Paragraph
              type="secondary"
              ellipsis={{ rows: 2 }}
              style={{ marginBottom: 0, maxWidth: 400 }}
            >
              {meeting.description}
            </Paragraph>
          )}
          <Space size={16} style={{ marginTop: 4 }}>
            <Text type="secondary">
              <ClockCircleOutlined /> {meeting.date} {meeting.startTime}-{meeting.endTime}
            </Text>
            {meeting.room && (
              <Text type="secondary">
                <EnvironmentOutlined /> {meeting.room}
              </Text>
            )}
            {meeting.meetingLink && (
              <Text type="secondary">
                <VideoCameraOutlined /> 线上会议
              </Text>
            )}
          </Space>
        </Space>

        <Avatar.Group max={{ count: 3 }} size="small">
          {meeting.participants.map((p) => (
            <Tooltip key={p.id} title={`${p.name} · ${p.department}`}>
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
            </Tooltip>
          ))}
        </Avatar.Group>
      </div>
    </Card>
  );
};

export default MeetingCard;
