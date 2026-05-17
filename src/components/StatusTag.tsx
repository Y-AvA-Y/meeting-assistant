import { Tag } from 'antd';

const statusMap: Record<string, { color: string; label: string }> = {
  // 会议状态
  upcoming: { color: 'blue', label: '待开始' },
  'in-progress': { color: 'processing', label: '进行中' },
  completed: { color: 'green', label: '已完成' },
  cancelled: { color: 'default', label: '已取消' },
  // 待办状态
  pending: { color: 'orange', label: '待处理' },
  overdue: { color: 'red', label: '已逾期' },
};

interface StatusTagProps {
  status: string;
}

const StatusTag = ({ status }: StatusTagProps) => {
  const config = statusMap[status] || { color: 'default', label: status };
  return <Tag color={config.color}>{config.label}</Tag>;
};

export default StatusTag;
