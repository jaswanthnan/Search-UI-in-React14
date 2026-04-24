import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, DashboardOutlined, TeamOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

const AppLayout = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="2" icon={<TeamOutlined />}>
            Candidates
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
