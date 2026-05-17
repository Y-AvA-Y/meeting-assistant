import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Descriptions,
  Tabs,
  Timeline,
  List,
  Avatar,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Skeleton,
  Empty,
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  FilePptOutlined,
  FileExcelOutlined,
  FileImageOutlined,
  EditOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useMeetingStore } from '../store';
import StatusTag from '../components/StatusTag';
import type { MeetingMaterial, Participant } from '../types';

const { Title, Text } = Typography;

const fileIconMap: Record<string, React.ReactNode> = {
  document: <FileTextOutlined />,
  slide: <FilePptOutlined />,
  spreadsheet: <FileExcelOutlined />,
  image: <FileImageOutlined />,
  other: <FileTextOutlined />,
};

const roleLabels: Record<string, string> = {
  host: '主持人',
  speaker: '主讲人',
  attendee: '参会人',
};

const MeetingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentMeeting, isLoading, error, fetchMeetingById, markMeetingCompleted } =
    useMeetingStore();

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

  return (
    <div>
      {/* 头部信息 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Space style={{ marginBottom: 8 }}>
            <StatusTag status={m.status} />
            {m.priority === 'high' && <Tag color="red">高优先级</Tag>}
          </Space>
          <Title level={3} style={{ margin: '4px 0 8px' }}>{m.title}</Title>
          <Descriptions size="small" column={2}>
            <Descriptions.Item label={<><ClockCircleOutlined /> 时间</>}>
              {m.date} {m.startTime} - {m.endTime}
            </Descriptions.Item>
            {m.room && (
              <Descriptions.Item label="会议室">{m.room}</Descriptions.Item>
            )}
            {m.meetingLink && (
              <Descriptions.Item label={<><VideoCameraOutlined /> 会议链接</>}>
                <a href={m.meetingLink} target="_blank" rel="noopener noreferrer">{m.meetingLink}</a>
              </Descriptions.Item>
            )}
          </Descriptions>
          {m.description && <Text type="secondary">{m.description}</Text>}
        </div>

        <Space>
          {m.status === 'upcoming' && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/meetings/${m.id}/prepare`)}
            >
              准备会议
            </Button>
          )}
          {m.status === 'completed' && m.minutesId && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/meetings/${m.id}/minutes`)}
            >
              查看纪要
            </Button>
          )}
          {m.status === 'in-progress' && (
            <Button type="primary" danger onClick={() => markMeetingCompleted(m.id)}>
              结束会议
            </Button>
          )}
        </Space>
      </div>

      {/* Tab 内容 */}
      <Tabs
        defaultActiveKey="agenda"
        items={[
          {
            key: 'agenda',
            label: `议程 (${m.agenda.length})`,
            children: m.agenda.length > 0 ? (
              <Timeline
                items={m.agenda.map((item) => ({
                  color: 'blue',
                  children: (
                    <div>
                      <Text strong>{item.order}. {item.title}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Space size={16}>
                          <Text type="secondary">
                            <ClockCircleOutlined /> {item.duration} 分钟
                          </Text>
                          <Text type="secondary">
                            <UserOutlined /> {item.speaker}
                          </Text>
                        </Space>
                      </div>
                      {item.description && (
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">{item.description}</Text>
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="暂无议程" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
          },
          {
            key: 'participants',
            label: `参与人 (${m.participants.length})`,
            children: (
              <List
                dataSource={m.participants}
                renderItem={(p: Participant) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                      }
                      title={
                        <Space>
                          {p.name}
                          <Tag>{roleLabels[p.role]}</Tag>
                        </Space>
                      }
                      description={`${p.department} · ${p.email}`}
                    />
                    <Tag color={p.hasConfirmed ? 'green' : 'orange'}>
                      {p.hasConfirmed ? '已确认' : '待确认'}
                    </Tag>
                  </List.Item>
                )}
              />
            ),
          },
          {
            key: 'materials',
            label: `会议资料 (${m.materials.length})`,
            children: m.materials.length > 0 ? (
              <Table
                dataSource={m.materials}
                rowKey="id"
                pagination={false}
                columns={[
                  {
                    title: '文件名',
                    dataIndex: 'name',
                    render: (name: string, record: MeetingMaterial) => (
                      <Space>
                        {fileIconMap[record.type]}
                        <a href="#">{name}</a>
                      </Space>
                    ),
                  },
                  { title: '大小', dataIndex: 'fileSize', width: 100 },
                  { title: '上传者', dataIndex: 'uploader', width: 100 },
                  {
                    title: '上传时间',
                    dataIndex: 'uploadedAt',
                    width: 180,
                    render: (t: string) => new Date(t).toLocaleDateString('zh-CN'),
                  },
                ]}
              />
            ) : (
              <Empty description="暂无资料" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default MeetingDetail;
