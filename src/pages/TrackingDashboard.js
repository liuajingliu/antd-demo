import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Typography, Statistic, Progress, Table, DatePicker, Select, Space, Button, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ReloadOutlined, DownloadOutlined, FullscreenOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SankeyDiagram from '../components/SankeyDiagram';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 模拟数据
const generateMockData = () => {
  const today = new Date();
  const data = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      pageViews: Math.floor(Math.random() * 5000) + 3000,
      uniqueVisitors: Math.floor(Math.random() * 2000) + 1000,
      bounceRate: Math.random() * 30 + 40,
      avgSessionDuration: Math.floor(Math.random() * 180) + 120,
    });
  }
  
  return data;
};

const generateTopPagesData = () => {
  return [
    { page: '/home', views: 12543, percentage: 35.2 },
    { page: '/products', views: 8932, percentage: 25.1 },
    { page: '/about', views: 6543, percentage: 18.4 },
    { page: '/contact', views: 4321, percentage: 12.1 },
    { page: '/blog', views: 3210, percentage: 9.0 },
  ];
};

const generateDeviceData = () => {
  return [
    { name: '桌面端', value: 65, color: '#1890ff' },
    { name: '移动端', value: 30, color: '#52c41a' },
    { name: '平板', value: 5, color: '#faad14' },
  ];
};

const generateModuleData = () => {
  return [
    { name: '用户管理', value: 35, color: '#1890ff' },
    { name: '数据分析', value: 25, color: '#52c41a' },
    { name: '报表中心', value: 20, color: '#faad14' },
    { name: '系统设置', value: 12, color: '#f5222d' },
    { name: '消息通知', value: 8, color: '#722ed1' },
  ];
};

const generateSankeyData = () => {
  return {
    nodes: [
      { name: '首页' },
      { name: '用户管理' },
      { name: '数据分析' },
      { name: '报表中心' },
      { name: '系统设置' },
      { name: '消息通知' },
      { name: '用户列表' },
      { name: '用户详情' },
      { name: '数据概览' },
      { name: '数据报表' },
      { name: '报表列表' },
      { name: '报表详情' },
      { name: '系统配置' },
      { name: '权限管理' },
      { name: '消息列表' },
      { name: '消息设置' },
    ],
    links: [
      { source: 0, target: 1, value: 120 }, // 首页 -> 用户管理
      { source: 0, target: 2, value: 85 },  // 首页 -> 数据分析
      { source: 0, target: 3, value: 65 },  // 首页 -> 报表中心
      { source: 0, target: 4, value: 40 },  // 首页 -> 系统设置
      { source: 0, target: 5, value: 25 },  // 首页 -> 消息通知
      
      { source: 1, target: 6, value: 75 },  // 用户管理 -> 用户列表
      { source: 1, target: 7, value: 45 },  // 用户管理 -> 用户详情
      
      { source: 2, target: 8, value: 50 },  // 数据分析 -> 数据概览
      { source: 2, target: 9, value: 35 },  // 数据分析 -> 数据报表
      
      { source: 3, target: 10, value: 40 }, // 报表中心 -> 报表列表
      { source: 3, target: 11, value: 25 }, // 报表中心 -> 报表详情
      
      { source: 4, target: 12, value: 25 }, // 系统设置 -> 系统配置
      { source: 4, target: 13, value: 15 }, // 系统设置 -> 权限管理
      
      { source: 5, target: 14, value: 15 }, // 消息通知 -> 消息列表
      { source: 5, target: 15, value: 10 }, // 消息通知 -> 消息设置
    ]
  };
};

const generateBehaviorData = () => {
  return [
    {
      key: '1',
      name: '张三',
      department: '技术部',
      email: 'zhangsan@example.com',
      time: '2023-12-01 09:15:23',
      timeType: '页面访问',
      pageName: '首页',
      description: '用户访问了首页',
      elementName: '导航栏',
      pageUrl: '/home'
    },
    {
      key: '2',
      name: '李四',
      department: '产品部',
      email: 'lisi@example.com',
      time: '2023-12-01 10:32:45',
      timeType: '按钮点击',
      pageName: '用户管理',
      description: '用户点击了添加用户按钮',
      elementName: '添加用户按钮',
      pageUrl: '/user-management'
    },
    {
      key: '3',
      name: '王五',
      department: '运营部',
      email: 'wangwu@example.com',
      time: '2023-12-01 11:45:12',
      timeType: '表单提交',
      pageName: '数据分析',
      description: '用户提交了数据筛选表单',
      elementName: '筛选表单',
      pageUrl: '/data-analysis'
    },
    {
      key: '4',
      name: '赵六',
      department: '市场部',
      email: 'zhaoliu@example.com',
      time: '2023-12-01 14:20:36',
      timeType: '页面访问',
      pageName: '报表中心',
      description: '用户访问了报表中心',
      elementName: '页面主体',
      pageUrl: '/report-center'
    },
    {
      key: '5',
      name: '钱七',
      department: '技术部',
      email: 'qianqi@example.com',
      time: '2023-12-01 15:18:54',
      timeType: '链接点击',
      pageName: '系统设置',
      description: '用户点击了权限管理链接',
      elementName: '权限管理链接',
      pageUrl: '/system-settings'
    },
    {
      key: '6',
      name: '孙八',
      department: '产品部',
      email: 'sunba@example.com',
      time: '2023-12-01 16:05:27',
      timeType: '页面访问',
      pageName: '消息通知',
      description: '用户访问了消息通知页面',
      elementName: '页面主体',
      pageUrl: '/message-notification'
    },
    {
      key: '7',
      name: '周九',
      department: '运营部',
      email: 'zhoujiu@example.com',
      time: '2023-12-01 16:42:18',
      timeType: '下拉选择',
      pageName: '用户列表',
      description: '用户选择了每页显示10条记录',
      elementName: '分页下拉框',
      pageUrl: '/user-list'
    },
    {
      key: '8',
      name: '吴十',
      department: '市场部',
      email: 'wushi@example.com',
      time: '2023-12-01 17:15:43',
      timeType: '搜索操作',
      pageName: '数据报表',
      description: '用户搜索了月度报表',
      elementName: '搜索框',
      pageUrl: '/data-report'
    },
    {
      key: '9',
      name: '张三',
      department: '技术部',
      email: 'zhangsan@example.com',
      time: '2023-12-01 17:45:12',
      timeType: '页面访问',
      pageName: '用户详情',
      description: '用户访问了用户详情页面',
      elementName: '页面主体',
      pageUrl: '/user-detail'
    },
    {
      key: '10',
      name: '李四',
      department: '产品部',
      email: 'lisi@example.com',
      time: '2023-12-01 18:10:35',
      timeType: '按钮点击',
      pageName: '报表详情',
      description: '用户点击了导出报表按钮',
      elementName: '导出按钮',
      pageUrl: '/report-detail'
    }
  ];
};

const generateSourceData = () => {
  return [
    { source: '直接访问', value: 45, color: '#1890ff' },
    { source: '搜索引擎', value: 30, color: '#52c41a' },
    { source: '社交媒体', value: 15, color: '#faad14' },
    { source: '邮件链接', value: 7, color: '#f5222d' },
    { source: '其他', value: 3, color: '#722ed1' },
  ];
};

const generateVisitorData = () => {
  return [
    { 
      key: '1', 
      name: '张三', 
      time: '2023-12-01 09:15:23', 
      email: 'zhangsan@example.com', 
      department: '技术部', 
      pv: 125, 
      uv: 89 
    },
    { 
      key: '2', 
      name: '李四', 
      time: '2023-12-01 10:32:45', 
      email: 'lisi@example.com', 
      department: '产品部', 
      pv: 98, 
      uv: 76 
    },
    { 
      key: '3', 
      name: '王五', 
      time: '2023-12-01 11:45:12', 
      email: 'wangwu@example.com', 
      department: '运营部', 
      pv: 156, 
      uv: 112 
    },
    { 
      key: '4', 
      name: '赵六', 
      time: '2023-12-01 14:20:36', 
      email: 'zhaoliu@example.com', 
      department: '市场部', 
      pv: 87, 
      uv: 65 
    },
    { 
      key: '5', 
      name: '钱七', 
      time: '2023-12-01 15:18:54', 
      email: 'qianqi@example.com', 
      department: '技术部', 
      pv: 203, 
      uv: 145 
    },
    { 
      key: '6', 
      name: '孙八', 
      time: '2023-12-01 16:05:27', 
      email: 'sunba@example.com', 
      department: '产品部', 
      pv: 134, 
      uv: 98 
    },
    { 
      key: '7', 
      name: '周九', 
      time: '2023-12-01 16:42:18', 
      email: 'zhoujiu@example.com', 
      department: '运营部', 
      pv: 167, 
      uv: 123 
    },
    { 
      key: '8', 
      name: '吴十', 
      time: '2023-12-01 17:15:43', 
      email: 'wushi@example.com', 
      department: '市场部', 
      pv: 92, 
      uv: 71 
    },
  ];
};

const topPagesColumns = [
  {
    title: '页面路径',
    dataIndex: 'page',
    key: 'page',
  },
  {
    title: '浏览量',
    dataIndex: 'views',
    key: 'views',
    sorter: (a, b) => a.views - b.views,
  },
  {
    title: '占比',
    dataIndex: 'percentage',
    key: 'percentage',
    render: (percentage) => `${percentage}%`,
    sorter: (a, b) => a.percentage - b.percentage,
  },
];

const visitorColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 100,
  },
  {
    title: '访问时间',
    dataIndex: 'time',
    key: 'time',
    width: 180,
  },
  {
    title: '邮件',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100,
  },
  {
    title: 'PV',
    dataIndex: 'pv',
    key: 'pv',
    width: 80,
    sorter: (a, b) => a.pv - b.pv,
  },
];

const behaviorColumns = [
  {
    title: '姓名',
    dataIndex: 'name',
    key: 'name',
    fixed: 'left',
    width: 100,
  },
  {
    title: '部门',
    dataIndex: 'department',
    key: 'department',
    width: 100,
  },
  {
    title: '邮件',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  {
    title: '时间',
    dataIndex: 'time',
    key: 'time',
    width: 180,
    sorter: (a, b) => new Date(a.time) - new Date(b.time),
  },
  {
    title: '事件类型',
    dataIndex: 'timeType',
    key: 'timeType',
    width: 100,
  },
  {
    title: '页面名称',
    dataIndex: 'pageName',
    key: 'pageName',
    width: 120,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
  },
  {
    title: '元素名称',
    dataIndex: 'elementName',
    key: 'elementName',
    width: 120,
  },
  {
    title: '页面URL',
    dataIndex: 'pageUrl',
    key: 'pageUrl',
    width: 150,
  },
];

function TrackingDashboard() {
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPage, setSelectedPage] = useState('all'); // 新增：页面选择
  const [selectedMetric, setSelectedMetric] = useState('pv'); // 新增：PV/UV选择，默认为PV
  const [chartData, setChartData] = useState([]);
  const [topPagesData, setTopPagesData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [moduleData, setModuleData] = useState([]);
  const [sankeyData, setSankeyData] = useState({});
  const [behaviorData, setBehaviorData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [dateRange, selectedPerson, selectedDepartment, selectedPage, selectedMetric]);

  const loadData = () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setChartData(generateMockData());
      setTopPagesData(generateTopPagesData());
      setDeviceData(generateDeviceData());
      setSourceData(generateSourceData());
      setVisitorData(generateVisitorData());
      setModuleData(generateModuleData());
      setSankeyData(generateSankeyData());
      setBehaviorData(generateBehaviorData());
      setLoading(false);
    }, 500);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    // 模拟导出功能
    console.log('导出数据');
  };

  const handleFullscreen = () => {
    // 模拟全屏功能
    console.log('全屏显示');
  };

  // 日期范围预设选项
  const rangePresets = [
    {
      label: '今天',
      value: [dayjs().startOf('day'), dayjs().endOf('day')],
    },
    {
      label: '最近7天',
      value: [dayjs().subtract(7, 'day'), dayjs()],
    },
    {
      label: '最近30天',
      value: [dayjs().subtract(30, 'day'), dayjs()],
    },
  ];

  // 处理日期范围变化
  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setDateRange(dates);
      // 这里可以根据日期范围重新加载数据
      loadData();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0 }}>埋点大盘</Title>
        <Space>
          <RangePicker 
            value={dateRange}
            presets={rangePresets}
            onChange={handleDateRangeChange}
          />
          <Select 
            // value={selectedPerson} 
            onChange={setSelectedPerson} 
            style={{ width: 120 }}
            placeholder="请选择人员"
          >
            <Option value="all">全部人员</Option>
            <Option value="person1">张三</Option>
            <Option value="person2">李四</Option>
            <Option value="person3">王五</Option>
            <Option value="person4">赵六</Option>
          </Select>
          <Select 
            // value={selectedDepartment}
            onChange={setSelectedDepartment} 
            style={{ width: 120 }}
            placeholder="选择部门"
          >
            <Option value="all">全部部门</Option>
            <Option value="dept1">技术部</Option>
            <Option value="dept2">产品部</Option>
            <Option value="dept3">运营部</Option>
            <Option value="dept4">市场部</Option>
          </Select>
          <Select 
            // value={selectedPage}
            onChange={setSelectedPage} 
            style={{ width: 120 }}
            placeholder="请选择页面"
          >
            <Option value="all">全部页面</Option>
            <Option value="home">首页</Option>
            <Option value="user-management">用户管理</Option>
            <Option value="data-analysis">数据分析</Option>
            <Option value="report-center">报表中心</Option>
            <Option value="system-settings">系统设置</Option>
            <Option value="message-notification">消息通知</Option>
          </Select>
          <Tooltip title="刷新数据">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading} />
          </Tooltip>
          <Tooltip title="导出数据">
            <Button icon={<DownloadOutlined />} onClick={handleExport} />
          </Tooltip>
          {/* <Tooltip title="全屏显示">
            <Button icon={<FullscreenOutlined />} onClick={handleFullscreen} />
          </Tooltip> */}
        </Space>
      </Header>
      <Content style={{ margin: '24px', background: '#f0f2f5' }}>
        <Row gutter={[16, 16]}>
          {/* 统计卡片 */}
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="PV"
                value={112,893}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<span />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="UV"
                value={35,678}
                precision={0}
                valueStyle={{ color: '#1890ff' }}
                prefix={<span />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="功能渗透率"
                value={68.5}
                precision={1}
                suffix="%"
                valueStyle={{ color: '#52c41a' }}
                prefix={<span />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>功能使用频次</span>
                    <Tooltip title="功能累计使用次数（日/周/月）：所有用户对该功能的调用总次数">
                      <QuestionCircleOutlined style={{ marginLeft: '5px', color: '#8c8c8c' }} />
                    </Tooltip>
                  </div>
                }
                value={96}
                precision={1}
                // suffix="次/人"
                valueStyle={{ color: '#722ed1' }}
                prefix={<span />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* 访问人员表格 */}
          <Col xs={24} lg={16}>
            <Card title="访问人员" style={{ height: 400 }}>
              <Table
                columns={visitorColumns}
                dataSource={visitorData}
                pagination={{ pageSize: 8 }}
                scroll={{ x: 800, y: 280 }}
                pagination={false}
                size="small"
                loading={loading}
                rowKey="key"
              />
            </Card>
          </Col>

          {/* 功能模块占比 */}
          <Col xs={24} lg={8}>
            <Card 
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>功能模块占比</span>
                  <Select 
                    value={selectedMetric} 
                    onChange={setSelectedMetric} 
                    style={{ width: 80 }}
                    size="small"
                  >
                    <Option value="pv">PV</Option>
                    <Option value="uv">UV</Option>
                  </Select>
                </div>
              } 
              style={{ height: 400 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={moduleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moduleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
          {/* 用户访问路径 */}
          <Col xs={24} lg={24}>
            <Card title="用户访问路径" style={{ height: 400 }}>
              <div style={{ width: '100%', height: 320, overflow: 'auto' }}>
                <SankeyDiagram data={sankeyData} width={800} height={320} />
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {/* 行为记录 */}
          <Col xs={24}>
            <Card title="行为记录" style={{ height: 500 }}>
              <Table
                columns={behaviorColumns}
                dataSource={behaviorData}
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200, y: 380 }}
                size="small"
                loading={loading}
                rowKey="key"
              />
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}

export default TrackingDashboard;