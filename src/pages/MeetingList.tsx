import { useEffect, useState } from 'react';
import { Input, Select, Typography, Skeleton, Button, Empty, Pagination } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useMeetingStore } from '../store';
import MeetingCard from '../components/MeetingCard';
import type { MeetingStatus } from '../types';

const { Title } = Typography;
const { Search } = Input;

const MeetingList = () => {
  const { meetings, meetingTotal, isLoading, error, fetchMeetings } = useMeetingStore();
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMeetings({ status: statusFilter, search, page, pageSize: 10 });
  }, [statusFilter, search, page, fetchMeetings]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>会议列表</Title>
        <Button type="primary" icon={<PlusOutlined />}>
          新建会议
        </Button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Search
          placeholder="搜索会议标题、描述或参与人..."
          allowClear
          onSearch={(v) => { setSearch(v); setPage(1); }}
          style={{ maxWidth: 360 }}
        />
        <Select
          placeholder="状态筛选"
          allowClear
          style={{ width: 140 }}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          options={[
            { label: '待开始', value: 'upcoming' },
            { label: '进行中', value: 'in-progress' },
            { label: '已完成', value: 'completed' },
            { label: '已取消', value: 'cancelled' },
          ]}
        />
      </div>

      {error ? (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Title level={4} type="secondary">{error}</Title>
          <Button onClick={() => fetchMeetings({ status: statusFilter, search, page, pageSize: 10 })}>重试</Button>
        </div>
      ) : isLoading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : meetings.length > 0 ? (
        <>
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} />
          ))}
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Pagination
              current={page}
              total={meetingTotal}
              pageSize={10}
              onChange={(p) => setPage(p)}
              showTotal={(t) => `共 ${t} 个会议`}
            />
          </div>
        </>
      ) : (
        <Empty
          description="暂无符合条件的会议"
          style={{ padding: 48 }}
        >
          <Button type="primary" onClick={() => { setStatusFilter(undefined); setSearch(''); }}>
            清除筛选
          </Button>
        </Empty>
      )}
    </div>
  );
};

export default MeetingList;
