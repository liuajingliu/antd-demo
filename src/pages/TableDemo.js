import React from 'react';
import { Table, Button, Tag, Space } from 'antd';
import { SwapRightOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const TableDemo = () => {
  // 子表格（表格B）列定义
  const subTableColumns = [
    {
      title: '匹配类型',
      dataIndex: 'matchType',
      key: 'matchType',
      render: (text) => {
        const typeMap = {
          'prefix': '前缀匹配',
          'exact': '精确匹配',
          'regex': '正则匹配'
        };
        return typeMap[text] || text;
      },
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '高级配置',
      dataIndex: 'advancedConfig',
      key: 'advancedConfig',
      render: (text) => (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ marginBottom: '4px' }}>Header</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>option = www</li>
              <li>expires &lt; 78000000</li>
            </ul>
          </div>
          <div>
            <div style={{ marginBottom: '4px' }}>Query</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>appName = system</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '超时时间',
      dataIndex: 'timeout',
      key: 'timeout',
      render: (text) => `${text} ms`,
    },
    {
      title: 'Header改写',
      dataIndex: 'headerRewrite',
      key: 'headerRewrite',
      render: (text) => (
        <div>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ marginBottom: '4px' }}>请求头</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><Tag color="green">添加</Tag> catch-control：no-catch</li>
              <li><Tag color="red">删除</Tag>content-language</li>
              <li><Tag color="blue">更新</Tag>content-length</li>
            </ul>
          </div>
          <div>
            <div style={{ marginBottom: '4px' }}>响应头</div>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><Tag color="red">删除</Tag>expries</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '路径重写',
      dataIndex: 'pathRewrite',
      key: 'pathRewrite',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{ 
            background: '#fff2f0', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '12px',
            border: '1px solid #ffccc7'
          }}>
            /api
          </code>
          <span style={{ color: '#8c8c8c', fontWeight: 'bold' }}>→</span>
          <code style={{ 
            background: '#f6ffed', 
            padding: '2px 6px', 
            borderRadius: '4px',
            fontFamily: 'Monaco, Consolas, monospace',
            fontSize: '12px',
            border: '1px solid #b7eb8f'
          }}>
            /route
          </code>
        </div>
      ),
    },
    {
      title: '路由指向',
      dataIndex: 'routeTo',
      key: 'routeTo',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#1890ff' }}>backend-service</span>
          <Tag color="default">专有云</Tag>
        </div>
      ),
    },
  ];

  // 主表格（表格A）列定义
  const columns = [
    {
      title: '路由名称',
      dataIndex: 'routeName',
      key: 'routeName',
    },
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      render: (text) => <span style={{ color: '#1890ff' }}>{text}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => '应用间互访',
    },
    {
      title: '跨云',
      dataIndex: 'crossCloud',
      key: 'crossCloud',
      render: (text) => text ? '是' : '否',
    },
    {
      title:   <span>转发规则（路径 <SwapRightOutlined /> 服务）</span>,
      dataIndex: 'forwardRule',
      key: 'forwardRule',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{text.path}</span>
          <SwapRightOutlined style={{ color: '#8c8c8c' }} />
          <span>{text.service}</span>
          <Tag color="default">专有云</Tag>
          <Tag color="blue">前缀匹配</Tag>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1890ff' }} />} 
            size="small"
          />
          <Button 
            type="text" 
            icon={<DeleteOutlined style={{ color: '#1890ff' }} />} 
            size="small"
          />
        </Space>
      ),
    },
  ];

  // 主表格（表格A）数据
  const data = [
    {
      key: '1',
      routeName: '主路由',
      domain: 'example.com',
      type: 'https',
      crossCloud: true,
      forwardRule: {
        path: '/api',
        service: 'backend-service'
      },
    },
  ];

  // 子表格（表格B）数据
  const subTableData = [
    {
      key: '1',
      matchType: 'prefix',
      path: '/api',
      advancedConfig: false,
      timeout: 5000,
      headerRewrite: '',
      pathRewrite: '',
      routeTo: 'service1',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>路由管理表格</h2>
      <Table 
        columns={columns} 
        dataSource={data} 
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ margin: 0 }}>
              <Table 
                columns={subTableColumns} 
                dataSource={subTableData} 
                pagination={false}
              />
            </div>
          ),
          rowExpandable: (record) => record.key === '1',
        }}
        pagination={false}
      />
    </div>
  );
};

export default TableDemo;