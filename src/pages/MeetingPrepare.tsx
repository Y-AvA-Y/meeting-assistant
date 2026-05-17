import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Checkbox,
  Button,
  Space,
  Steps,
  Typography,
  Tag,
  Alert,
  Skeleton,
  Empty,
  Divider,
  Tooltip,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useMeetingStore } from '../store';
import StatusTag from '../components/StatusTag';
import type { PreparationItem } from '../types';

const { Title, Text, Paragraph } = Typography;

const MeetingPrepare = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMeeting, isLoading, error, fetchMeetingById, updateChecklistItem, markMeetingCompleted } =
    useMeetingStore();
  const [checking, setChecking] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchMeetingById(id);
  }, [id, fetchMeetingById]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Title level={4} type="secondary">{error}</Title>
        <Button onClick={() => id && fetchMeetingById(id)}>重试</Button>
      </div>
    );
  }

  if (isLoading || !currentMeeting) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  const m = currentMeeting;
  const checklist = m.preparationChecklist || [];
  const doneCount = checklist.filter((i: PreparationItem) => i.checked).length;

  const handleCheck = async (itemId: string, checked: boolean) => {
    setChecking(itemId);
    try {
      await updateChecklistItem(m.id, itemId, checked);
    } catch {
      message.error('更新失败');
    }
    setChecking(null);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      {/* 返回按钮 */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/meetings/${m.id}`)}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回会议详情
      </Button>

      {/* 标题区 */}
      <div style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 8 }}>
          <StatusTag status={m.status} />
          <Tag icon={<CalendarOutlined />} color="blue">{m.date}</Tag>
        </Space>
        <Title level={3} style={{ margin: '4px 0' }}>{m.title}</Title>
        <Space size={24}>
          <Text type="secondary">
            <ClockCircleOutlined /> {m.startTime} - {m.endTime}
          </Text>
          {m.room && <Text type="secondary">📍 {m.room}</Text>}
        </Space>
      </div>

      {/* 准备进度 */}
      <Alert
        message={`准备进度：${doneCount}/${checklist.length} 项已完成`}
        type={doneCount === checklist.length ? 'success' : 'info'}
        showIcon
        style={{ marginBottom: 24 }}
      />

      {/* 准备清单 */}
      <Card title="📋 会前准备清单" style={{ marginBottom: 24 }}>
        {checklist.length > 0 ? (
          <Checkbox.Group
            style={{ display: 'block' }}
            value={checklist.filter((i: PreparationItem) => i.checked).map((i: PreparationItem) => i.id)}
          >
            {checklist.map((item: PreparationItem) => (
              <div
                key={item.id}
                style={{
                  padding: '8px 0',
                  borderBottom: '1px solid #f5f5f5',
                }}
              >
                <Checkbox
                  value={item.id}
                  disabled={checking === item.id}
                  onChange={(e) => handleCheck(item.id, e.target.checked)}
                >
                  <Text
                    style={{
                      textDecoration: item.checked ? 'line-through' : undefined,
                      color: item.checked ? '#999' : undefined,
                      fontSize: 15,
                    }}
                  >
                    {item.label}
                  </Text>
                </Checkbox>
              </div>
            ))}
          </Checkbox.Group>
        ) : (
          <Empty description="暂无准备清单" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 会议链接 */}
      {m.meetingLink && (
        <Card title="🔗 会议链接" style={{ marginBottom: 24 }}>
          <Space>
            <LinkOutlined />
            <a href={m.meetingLink} target="_blank" rel="noopener noreferrer">
              {m.meetingLink}
            </a>
            <Tooltip title="复制链接">
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(m.meetingLink!);
                  message.success('已复制会议链接');
                }}
              />
            </Tooltip>
          </Space>
        </Card>
      )}

      {/* 议程预览 */}
      <Card title="📝 议程预览" style={{ marginBottom: 24 }}>
        {m.agenda.length > 0 ? (
          <Steps
            direction="vertical"
            current={-1}
            items={m.agenda.map((item) => ({
              title: item.title,
              subTitle: `${item.duration} 分钟`,
              description: item.speaker ? (
                <Space>
                  <UserOutlined />
                  <Text type="secondary">{item.speaker}</Text>
                </Space>
              ) : undefined,
            }))}
          />
        ) : (
          <Empty description="暂无议程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 操作区 */}
      <Divider />
      <Space>
        <Button
          type="primary"
          size="large"
          icon={<PlayCircleOutlined />}
          onClick={async () => {
            await markMeetingCompleted(m.id);
            message.success('会议已结束，可前往纪要页面查看');
            navigate(`/meetings/${m.id}/minutes`);
          }}
        >
          开始会议
        </Button>
        <Button size="large" onClick={() => navigate(`/meetings/${m.id}`)}>
          返回详情
        </Button>
      </Space>
    </div>
  );
};

export default MeetingPrepare;
