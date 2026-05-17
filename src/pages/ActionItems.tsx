import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Tag,
  Select,
  Space,
  Typography,
  Button,
  Skeleton,
  Empty,
  message,
  Tooltip,
} from 'antd';
import {
  CheckOutlined,
  UndoOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useMeetingStore } from '../store';
import StatusTag from '../components/StatusTag';
import type { ActionItem, ActionItemStatus, ActionItemPriority } from '../types';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;

const priorityColors: Record<string, string> = {
  high: 'red',
  medium: 'orange',
  low: 'default',
};

const priorityLabels: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const ActionItems = () => {
  const navigate = useNavigate();
  const { actionItems, isLoading, error, fetchActionItems, updateActionItemStatus } =
    useMeetingStore();
  const [statusFilter, setStatusFilter] = useState<ActionItemStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<ActionItemPriority | undefined>();

  useEffect(() => {
    fetchActionItems({ status: statusFilter, priority: priorityFilter });
  }, [statusFilter, priorityFilter, fetchActionItems]);

  const handleToggle = async (id: string, current: ActionItemStatus) => {
    const next = current === 'completed' ? 'pending' : 'completed';
    try {
      await updateActionItemStatus(id, next);
      message.success(current === 'completed' ? '已标记为待处理' : '已标记为完成');
    } catch {
      message.error('操作失败');
    }
  };

  const columns: ColumnsType<ActionItem> = [
    {
      title: '待办事项',
      dataIndex: 'title',
      key: 'title',
      width: 280,
      render: (title: string, record: ActionItem) => (
        <Space>
          <StatusTag status={record.status} />
          <span style={{ textDecoration: record.status === 'completed' ? 'line-through' : undefined }}>
            {title}
          </span>
        </Space>
      ),
    },
    {
      title: '所属会议',
      dataIndex: 'meetingTitle',
      key: 'meetingTitle',
      width: 200,
      render: (title: string, record: ActionItem) => (
        <Button
          type="link"
          icon={<LinkOutlined />}
          size="small"
          style={{ padding: 0 }}
          onClick={() => navigate(`/meetings/${record.meetingId}`)}
        >
          {title}
        </Button>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
      width: 100,
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      sorter: (a: ActionItem, b: ActionItem) => a.dueDate.localeCompare(b.dueDate),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (p: ActionItemPriority) => (
        <Tag color={priorityColors[p]}>{priorityLabels[p]}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: ActionItem) => (
        <Tooltip title={record.status === 'completed' ? '撤销' : '标记完成'}>
          <Button
            type={record.status === 'completed' ? 'default' : 'primary'}
            size="small"
            icon={record.status === 'completed' ? <UndoOutlined /> : <CheckOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle(record.id, record.status);
            }}
          >
            {record.status === 'completed' ? '撤销' : '完成'}
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          待办事项
          {!isLoading && (
            <span style={{ fontSize: 14, color: '#999', marginLeft: 12, fontWeight: 400 }}>
              共 {actionItems.length} 项
            </span>
          )}
        </Title>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 140 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { label: '待处理', value: 'pending' },
            { label: '进行中', value: 'in-progress' },
            { label: '已完成', value: 'completed' },
            { label: '已逾期', value: 'overdue' },
          ]}
        />
        <Select
          placeholder="优先级筛选"
          allowClear
          style={{ width: 140 }}
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={[
            { label: '高', value: 'high' },
            { label: '中', value: 'medium' },
            { label: '低', value: 'low' },
          ]}
        />
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4} type="secondary">{error}</Title>
          <Button onClick={() => fetchActionItems({ status: statusFilter, priority: priorityFilter })}>重试</Button>
        </div>
      ) : isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : actionItems.length > 0 ? (
        <Table
          dataSource={actionItems}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 项` }}
        />
      ) : (
        <Empty
          description="暂无待办事项"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: 48 }}
        />
      )}
    </div>
  );
};

export default ActionItems;
