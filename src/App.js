import React, { useState } from 'react';
import { Layout, Menu, Button, Card, Space, Typography, Row, Col } from 'antd';
import { HomeOutlined, SettingOutlined, UserOutlined, TableOutlined, ShareAltOutlined, NodeIndexOutlined, DesktopOutlined, MenuOutlined, DeploymentUnitOutlined, BarChartOutlined } from '@ant-design/icons';
import TableDemo from './pages/TableDemo';
import ReactFlowDemo from './pages/ReactFlowDemo';
import TopologyDemo from './pages/TopologyDemo';
import ResponsiveTopology from './pages/ResponsiveTopology';
import ArchitectureTopology from './pages/ArchitectureTopology';
import TrackingDashboard from './pages/TrackingDashboard';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('8');
  const [collapsed, setCollapsed] = useState(false);
  
  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };
  
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  const renderContent = () => {
    switch(selectedMenu) {
      case '4':
        return <TableDemo />;
      case '5':
        return <ReactFlowDemo />;
      case '6':
        return <TopologyDemo />;
      case '7':
        return <ResponsiveTopology />;
      case '8':
        return <ArchitectureTopology />;
      case '9':
        return <TrackingDashboard />;
      default:
        return (
          <div>
            <Title level={2}>Ant Design 演示项目</Title>
            <Paragraph>
              这是一个使用 React、webpack 和 Ant Design 搭建的前端项目演示。
            </Paragraph>
            
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Card title="卡片标题" bordered={false}>
                  <p>卡片内容</p>
                  <Button type="primary">主要按钮</Button>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card title="另一个卡片" bordered={false}>
                  <p>更多内容</p>
                  <Space>
                    <Button>默认按钮</Button>
                    <Button type="dashed">虚线按钮</Button>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Card title="第三个卡片" bordered={false}>
                  <p>最后一些内容</p>
                  <Button type="link">链接按钮</Button>
                </Card>
              </Col>
            </Row>
          </div>
        );
    }
  };
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
      >
        <div className="demo-logo-vertical" />
        <Menu theme="dark" mode="inline" selectedKeys={[selectedMenu]} onClick={handleMenuClick}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            首页
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            用户
          </Menu.Item>
          <Menu.Item key="3" icon={<SettingOutlined />}>
            设置
          </Menu.Item>
          <Menu.Item key="4" icon={<TableOutlined />}>
            表格演示
          </Menu.Item>
          <Menu.Item key="5" icon={<ShareAltOutlined />}>
            React Flow 调研
          </Menu.Item>
          <Menu.Item key="6" icon={<NodeIndexOutlined />}>
            拓扑图演示
          </Menu.Item>
          <Menu.Item key="7" icon={<DesktopOutlined />}>
            响应式拓扑
          </Menu.Item>
          <Menu.Item key="8" icon={<DeploymentUnitOutlined />}>
            架构拓扑
          </Menu.Item>
          <Menu.Item key="9" icon={<BarChartOutlined />}>
            埋点大盘
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 16px', background: '#fff', display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleCollapsed}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ minHeight: 360}}>
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design Demo ©2023 Created by You
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;