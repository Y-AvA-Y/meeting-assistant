import { Layout, Button, Badge, Space, Avatar, Input } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Header } = Layout;

interface HeaderBarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const HeaderBar = ({ collapsed, onToggle }: HeaderBarProps) => {
  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: 16, width: 40, height: 40 }}
      />

      <Space size={24}>
        <Input
          placeholder="搜索会议、纪要、待办..."
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
          style={{ width: 240 }}
          variant="filled"
        />
        <Badge count={5} size="small">
          <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
        </Badge>
        <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
      </Space>
    </Header>
  );
};

export default HeaderBar;
