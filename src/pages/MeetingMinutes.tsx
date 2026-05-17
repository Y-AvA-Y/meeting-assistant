import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Typography,
  Timeline,
  List,
  Tag,
  Button,
  Space,
  Skeleton,
  Empty,
  Table,
  Divider,
  Progress,
} from 'antd';
import {
  ArrowLeftOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  OrderedListOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMeetingStore } from '../store';
import StatusTag from '../components/StatusTag';
import type { DiscussionPoint } from '../types';

const { Title, Text, Paragraph } = Typography;

const MeetingMinutes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMeeting, currentMinutes, isLoading, error, fetchMeetingById, fetchMinutes } =
    useMeetingStore();
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMeetingById(id);
      fetchMinutes(id);
    }
  }, [id, fetchMeetingById, fetchMinutes]);

  // 打字机效果：2秒后显示完整摘要
  useEffect(() => {
    if (currentMinutes) {
      const timer = setTimeout(() => setTypingDone(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [currentMinutes]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Title level={4} type="secondary">{error}</Title>
        <Button onClick={() => id && (fetchMeetingById(id), fetchMinutes(id))}>重试</Button>
      </div>
    );
  }

  if (isLoading || !currentMeeting || !currentMinutes) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const mm = currentMinutes;
  const summary = mm.summary;
  const displayedSummary = typingDone ? summary : summary.slice(0, Math.ceil(summary.length * 0.5)) + '...';

  const actionItemColumns = [
    { title: '待办事项', dataIndex: 'title', key: 'title' },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
      render: (name: string) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    { title: '截止日期', dataIndex: 'dueDate', key: 'dueDate', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: string) => <StatusTag status={s} />,
    },
  ];

  return (
    <div style={{ maxWidth: 900 }}>
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/meetings/${id}`)}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回会议详情
      </Button>

      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: '4px 0' }}>
          📄 {currentMeeting.title} — 会议纪要
        </Title>
        <Text type="secondary">{currentMeeting.date} · {currentMeeting.startTime} - {currentMeeting.endTime}</Text>
      </div>

      {/* AI 摘要 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1677ff' }} />
            AI 智能摘要
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Paragraph style={{ fontSize: 15, lineHeight: 2 }}>
          {displayedSummary}
        </Paragraph>
        {!typingDone && <Progress percent={50} showInfo={false} status="active" />}
      </Card>

      {/* 关键决策 */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            关键决策
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {mm.keyDecisions.length > 0 ? (
          <List
            size="small"
            dataSource={mm.keyDecisions}
            renderItem={(item: string, idx: number) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Tag color="green" style={{ borderRadius: '50%', width: 24, height: 24, textAlign: 'center', lineHeight: '20px', padding: 0 }}>
                      {idx + 1}
                    </Tag>
                  }
                  title={item}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无关键决策" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 讨论要点 */}
      <Card
        title={
          <Space>
            <OrderedListOutlined style={{ color: '#fa8c16' }} />
            讨论要点
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        {mm.discussionPoints.length > 0 ? (
          <Timeline
            items={mm.discussionPoints.map((dp: DiscussionPoint) => ({
              color: 'blue',
              children: (
                <div>
                  <Text strong>{dp.topic}</Text>
                  <div style={{ marginTop: 4 }}>
                    <Space size={16}>
                      <Text type="secondary">
                        <UserOutlined /> {dp.speaker}
                      </Text>
                      <Text type="secondary">
                        <ClockCircleOutlined /> {dp.timestamp} · {dp.duration} 分钟
                      </Text>
                    </Space>
                  </div>
                  <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
                    {dp.content}
                  </Paragraph>
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无讨论要点" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      {/* 关联待办 */}
      <Card
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#fa8c16' }} />
            会议待办 ({mm.actionItems.length})
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/action-items')}>
            查看全部待办
          </Button>
        }
      >
        {mm.actionItems.length > 0 ? (
          <Table
            dataSource={mm.actionItems}
            columns={actionItemColumns}
            rowKey="id"
            pagination={false}
            size="small"
          />
        ) : (
          <Empty description="暂无待办事项" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Card>

      <Divider />
      <div style={{ textAlign: 'center' }}>
        <Space>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => navigate('/action-items')}>
            管理待办事项
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default MeetingMinutes;
