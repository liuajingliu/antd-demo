import React, { useState } from 'react';
import { Layout, Menu, Button, Card, Space, Typography, Row, Col } from 'antd';
import { HomeOutlined, SettingOutlined, UserOutlined, TableOutlined } from '@ant-design/icons';
import TableDemo from './pages/TableDemo';

const { Header, Content, Footer, Sider } = Layout;
const { Title, Paragraph } = Typography;

function App() {
  const [selectedMenu, setSelectedMenu] = useState('1');
  
  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };
  
  const renderContent = () => {
    switch(selectedMenu) {
      case '4':
        return <TableDemo />;
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
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken) => {
          console.log(broken);
        }}
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
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
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }} />
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
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