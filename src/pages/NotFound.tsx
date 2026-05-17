import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="404"
      title="页面未找到"
      subTitle="您访问的页面不存在，请检查链接是否正确。"
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          返回首页
        </Button>
      }
    />
  );
};

export default NotFound;