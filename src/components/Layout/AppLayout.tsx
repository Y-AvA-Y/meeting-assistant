import { useState, useEffect } from 'react';
import { Layout, Grid } from 'antd';
import Sidebar from './Sidebar';
import HeaderBar from './HeaderBar';
import AIAssistant from '../AIAssistant';

const { Content } = Layout;
const { useBreakpoint } = Grid;

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // 小屏自动收起侧边栏
  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <HeaderBar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <Content
          style={{
            margin: isMobile ? 8 : 16,
            padding: isMobile ? 12 : 24,
            background: '#f5f5f5',
            borderRadius: 8,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
      <AIAssistant />
    </Layout>
  );
};

export default AppLayout;
