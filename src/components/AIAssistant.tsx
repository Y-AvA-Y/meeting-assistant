import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FloatButton,
  Drawer,
  Tabs,
  Input,
  List,
  Typography,
  Tag,
  Space,
  Collapse,
  Card,
  Button,
  Empty,
  Spin,
  Badge,
} from 'antd';
import {
  RobotOutlined,
  SearchOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  RightOutlined,
  WarningOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { meetingApi, actionItemApi } from '../api/meetings';
import type { Meeting, ActionItem } from '../types';

const { Text, Title } = Typography;

interface LocalData {
  todayMeetings: Meeting[];
  tomorrowMeetings: Meeting[];
  overdueItems: ActionItem[];
  upcomingToday: number;
  pendingItems: number;
  overdueCount: number;
}

// 查询关键词 → 行为映射
interface QueryRule {
  keywords: string[];
  action: 'nav_meetings' | 'nav_action_items' | 'nav_help' | 'show_summary';
}

const QUERY_RULES: QueryRule[] = [
  { keywords: ['逾期', '超时', '过期'], action: 'nav_action_items' },
  { keywords: ['待办', '任务', '工作'], action: 'nav_action_items' },
  { keywords: ['今天', '今日', '待开'], action: 'show_summary' },
  { keywords: ['明天', '明日'], action: 'show_summary' },
  { keywords: ['会议列表', '全部会议', '所有会议'], action: 'nav_meetings' },
  { keywords: ['帮助', '使用说明', '怎么'], action: 'nav_help' },
  { keywords: ['纪要', '会议记录'], action: 'nav_meetings' },
];

const HELP_ITEMS = [
  {
    q: '如何使用会议准备功能？',
    a: '进入会议详情后，点击「会前准备」按钮，可以查看并勾选准备清单。全部完成后即可点击「开始会议」。',
  },
  {
    q: '如何查看会议纪要？',
    a: '已结束的会议会在详情页显示「会议纪要」入口。纪要包含 AI 摘要、关键决策和讨论时间线。',
  },
  {
    q: '如何管理待办事项？',
    a: '在「待办事项」页面可以查看所有待办，支持按状态、优先级筛选。勾选复选框即可标记完成。',
  },
  {
    q: '仪表盘的数字代表什么？',
    a: '仪表盘展示：会议总数、今日待开会议、待完成待办数、逾期待办数、本周已完成会议数。',
  },
  {
    q: '如何快速找到某个会议？',
    a: '在顶部搜索栏或会议列表页输入关键词，支持按会议标题搜索。也可以让 AI 助手帮你查询。',
  },
  {
    q: '会议状态有哪些含义？',
    a: '蓝色「即将开始」— 会议尚未进行；绿色「进行中」— 正在召开；灰色「已完成」— 已结束；红色「已取消」。',
  },
];

const QUICK_QUERIES = [
  { icon: <CalendarOutlined />, text: '今天有什么会议', query: '今天有什么会议' },
  { icon: <WarningOutlined />, text: '逾期待办', query: '逾期待办' },
  { icon: <RightOutlined />, text: '全部会议', query: '全部会议' },
  { icon: <QuestionCircleOutlined />, text: '使用帮助', query: '使用帮助' },
];

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');
  const [query, setQuery] = useState('');
  const [showBadge, setShowBadge] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LocalData>({
    todayMeetings: [],
    tomorrowMeetings: [],
    overdueItems: [],
    upcomingToday: 0,
    pendingItems: 0,
    overdueCount: 0,
  });
  const navigate = useNavigate();

  // 首次访问标记
  useEffect(() => {
    if (!localStorage.getItem('ai_visited')) {
      setShowBadge(true);
    }
  }, []);

  // 面板打开时加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    const [allMeetings, allActions] = await Promise.all([
      meetingApi.getList({ pageSize: 100 }),
      actionItemApi.getList(),
    ]);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    setData({
      todayMeetings: allMeetings.items.filter((m) => m.date === today && m.status !== 'cancelled'),
      tomorrowMeetings: allMeetings.items.filter((m) => m.date === tomorrow && m.status !== 'cancelled'),
      overdueItems: allActions.filter((a) => a.status === 'overdue'),
      upcomingToday: allMeetings.items.filter((m) => m.date === today && m.status === 'upcoming').length,
      pendingItems: allActions.filter((a) => a.status === 'pending' || a.status === 'in-progress').length,
      overdueCount: allActions.filter((a) => a.status === 'overdue').length,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
      if (showBadge) {
        setShowBadge(false);
        localStorage.setItem('ai_visited', '1');
      }
    }
  }, [open, loadData, showBadge]);

  // 关键词查询
  const handleQuery = (input: string) => {
    setQuery(input);
    if (!input.trim()) return;

    const lower = input.toLowerCase();
    let matched = false;

    for (const rule of QUERY_RULES) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        switch (rule.action) {
          case 'nav_meetings':
            navigate('/meetings');
            setOpen(false);
            return;
          case 'nav_action_items':
            navigate('/action-items');
            setOpen(false);
            return;
          case 'nav_help':
            setActiveTab('help');
            matched = true;
            break;
          case 'show_summary':
            setActiveTab('summary');
            matched = true;
            break;
        }
        break;
      }
    }

    if (!matched) {
      // 默认去会议列表搜索
      navigate('/meetings');
      setOpen(false);
    }
  };

  const navigateToMeeting = (id: string) => {
    navigate(`/meetings/${id}`);
    setOpen(false);
  };

  return (
    <>
      <FloatButton
        icon={<RobotOutlined />}
        type="primary"
        badge={showBadge ? { dot: true } : undefined}
        onClick={() => setOpen(true)}
        tooltip="AI 助手"
        style={{ right: 24, bottom: 24 }}
      />

      <Drawer
        title={
          <Space>
            <RobotOutlined />
            AI 助手
            <Tag color="blue">Beta</Tag>
          </Space>
        }
        placement="right"
        width={420}
        onClose={() => setOpen(false)}
        open={open}
        destroyOnClose
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'summary',
              label: (
                <span>
                  <BulbOutlined /> 今日摘要
                </span>
              ),
              children: (
                <Spin spinning={loading}>
                  {/* 统计概览 */}
                  <Card size="small" style={{ marginBottom: 16, background: '#f0f5ff', border: 'none' }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Text strong>📊 今日概览</Text>
                      <Space size={8} wrap>
                        <Tag color="blue">今日待开 {data.upcomingToday}</Tag>
                        <Tag color="orange">待办 {data.pendingItems}</Tag>
                        <Tag color="red">逾期 {data.overdueCount}</Tag>
                      </Space>
                    </Space>
                  </Card>

                  {/* 今日会议 */}
                  <Title level={5}>📅 今日会议 ({data.todayMeetings.length})</Title>
                  {data.todayMeetings.length > 0 ? (
                    <List
                      size="small"
                      dataSource={data.todayMeetings}
                      renderItem={(m) => (
                        <List.Item
                          style={{ cursor: 'pointer', padding: '8px 0' }}
                          onClick={() => navigateToMeeting(m.id)}
                        >
                          <List.Item.Meta
                            title={m.title}
                            description={`${m.startTime} - ${m.endTime}${m.room ? ` · ${m.room}` : ''}`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="今天没有会议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}

                  {/* 明日会议 */}
                  <Title level={5} style={{ marginTop: 20 }}>
                    📅 明日会议 ({data.tomorrowMeetings.length})
                  </Title>
                  {data.tomorrowMeetings.length > 0 ? (
                    <List
                      size="small"
                      dataSource={data.tomorrowMeetings}
                      renderItem={(m) => (
                        <List.Item
                          style={{ cursor: 'pointer', padding: '8px 0' }}
                          onClick={() => navigateToMeeting(m.id)}
                        >
                          <List.Item.Meta
                            title={m.title}
                            description={`${m.startTime} - ${m.endTime}${m.room ? ` · ${m.room}` : ''}`}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="明天没有会议" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  )}

                  {/* 逾期待办 */}
                  {data.overdueItems.length > 0 && (
                    <>
                      <Title level={5} style={{ marginTop: 20 }}>
                        ⚠️ 逾期待办 ({data.overdueItems.length})
                      </Title>
                      <List
                        size="small"
                        dataSource={data.overdueItems.slice(0, 5)}
                        renderItem={(a) => (
                          <List.Item
                            style={{ cursor: 'pointer', padding: '8px 0' }}
                            onClick={() => {
                              navigate('/action-items');
                              setOpen(false);
                            }}
                          >
                            <List.Item.Meta
                              title={<Text type="danger">{a.title}</Text>}
                              description={`负责人: ${a.assignee} · 截止: ${a.dueDate}`}
                            />
                          </List.Item>
                        )}
                      />
                      {data.overdueItems.length > 5 && (
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            navigate('/action-items');
                            setOpen(false);
                          }}
                        >
                          查看全部 {data.overdueItems.length} 条
                        </Button>
                      )}
                    </>
                  )}
                </Spin>
              ),
            },
            {
              key: 'query',
              label: (
                <span>
                  <SearchOutlined /> 智能查询
                </span>
              ),
              children: (
                <div>
                  <Input.Search
                    placeholder="试试输入：今天的会议、逾期待办…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onSearch={handleQuery}
                    enterButton
                    style={{ marginBottom: 16 }}
                  />

                  <Text type="secondary">快捷查询</Text>
                  <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {QUICK_QUERIES.map((q) => (
                      <Button key={q.text} icon={q.icon} onClick={() => handleQuery(q.query)}>
                        {q.text}
                      </Button>
                    ))}
                  </div>

                  <div style={{ marginTop: 24 }}>
                    <Text type="secondary">支持的关键词</Text>
                    <List
                      size="small"
                      style={{ marginTop: 8 }}
                      dataSource={[
                        '今天 / 明天的会议',
                        '逾期待办 / 待办 / 任务',
                        '会议列表 / 全部会议',
                        '帮助 / 使用说明 / 怎么用',
                      ]}
                      renderItem={(item) => (
                        <List.Item style={{ border: 'none', padding: '2px 0' }}>
                          <Text code>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </div>
                </div>
              ),
            },
            {
              key: 'help',
              label: (
                <span>
                  <QuestionCircleOutlined /> 使用帮助
                </span>
              ),
              children: (
                <Collapse
                  items={HELP_ITEMS.map((item, i) => ({
                    key: String(i),
                    label: item.q,
                    children: <Text type="secondary">{item.a}</Text>,
                  }))}
                />
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
};

export default AIAssistant;
