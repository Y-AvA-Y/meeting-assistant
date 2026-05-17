import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, Space, Skeleton, Button, Empty, List } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useMeetingStore } from '../store';
import MeetingCard from '../components/MeetingCard';
import StatusTag from '../components/StatusTag';
import type { DashboardStats } from '../types';

const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { meetings, actionItems, stats, isLoading, error, fetchMeetings, fetchActionItems } =
    useMeetingStore();

  useEffect(() => {
    fetchMeetings({ pageSize: 5 });
    fetchActionItems({ status: 'pending' });
  }, [fetchMeetings, fetchActionItems]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Title level={4} type="secondary">{error}</Title>
        <Button onClick={() => { fetchMeetings({ pageSize: 5 }); fetchActionItems({ status: 'pending' }); }}>
          重试
        </Button>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const todayMeetings = meetings.filter((m) => m.date === today);
  const overdueItems = actionItems.filter((a) => a.status === 'overdue');

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>仪表盘</Title>
          <p style={{ color: '#888', margin: '4px 0 0 0' }}>
            {today} · 今日有 {stats.upcomingToday} 场待开会议
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      {isLoading ? (
        <Skeleton active paragraph={{ rows: 1 }} />
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={8} lg={4}>
            <Card>
              <Statistic
                title="总会议数"
                value={stats.totalMeetings}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={5}>
            <Card>
              <Statistic
                title="今日待开"
                value={stats.upcomingToday}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1677ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={5}>
            <Card>
              <Statistic
                title="待办事项"
                value={stats.pendingItems}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={5}>
            <Card>
              <Statistic
                title="已逾期"
                value={stats.overdueItems}
                prefix={<WarningOutlined />}
                valueStyle={{ color: stats.overdueItems > 0 ? '#ff4d4f' : undefined }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8} lg={5}>
            <Card>
              <Statistic
                title="本周完成"
                value={stats.completedThisWeek}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[24, 24]}>
        {/* 今日会议 */}
        <Col xs={24} lg={14}>
          <Card
            title="今日会议"
            extra={
              <Button type="link" onClick={() => navigate('/meetings')}>
                全部会议 <ArrowRightOutlined />
              </Button>
            }
          >
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : todayMeetings.length > 0 ? (
              todayMeetings.map((m) => <MeetingCard key={m.id} meeting={m} />)
            ) : (
              <Empty description="今日暂无会议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </Card>
        </Col>

        {/* 待处理待办 */}
        <Col xs={24} lg={10}>
          <Card
            title="待处理事项"
            extra={
              <Button type="link" onClick={() => navigate('/action-items')}>
                全部待办 <ArrowRightOutlined />
              </Button>
            }
          >
            {isLoading ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : overdueItems.length > 0 ? (
              <List
                size="small"
                dataSource={overdueItems}
                renderItem={(item) => (
                  <List.Item
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/action-items')}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <StatusTag status={item.status} />
                          {item.title}
                        </Space>
                      }
                      description={`${item.assignee} · 截止 ${item.dueDate}`}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                description="暂无待办事项，做得很好！"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
