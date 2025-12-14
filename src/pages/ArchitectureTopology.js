import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Card, Typography, Space, Select, Divider, Modal } from 'antd';
import { PlusOutlined, SaveOutlined, HistoryOutlined, FullscreenOutlined } from '@ant-design/icons';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  ConnectionLineType,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 添加 CSS 动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
  .animated-line {
    animation: dash 0.5s linear infinite;
  }
  
  /* 隐藏 ReactFlow 版权信息 */
  .react-flow__attribution {
    display: none !important;
  }
  
  /* 隐藏所有可能的版权文本 */
  .react-flow__attribution a {
    display: none !important;
  }
  
  /* 隐藏底部可能出现的品牌标识 */
  [data-testid="rf__attribution"] {
    display: none !important;
  }
`;
document.head.appendChild(style);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;



// 带有 hover 事件处理的节点组件
const CustomNodeWithHover = ({ id, data, selected }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const handleMouseEnter = () => {
    setIsHovered(true);
    // 触发父组件的 hover 状态更新
    window.dispatchEvent(new CustomEvent('nodeHover', { detail: { nodeId: id } }));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // 清除 hover 状态
    window.dispatchEvent(new CustomEvent('nodeHover', { detail: { nodeId: null } }));
  };

  const nodeStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: isHovered 
      ? `2px solid ${data.borderColor || '#1890ff'}` 
      : `1px solid ${data.borderColor || '#1890ff'}`,
    backgroundColor: 'transparent',
    boxShadow: isHovered 
      ? '0 0 15px rgba(24, 144, 255, 0.6), 0 4px 8px rgba(0,0,0,0.15)'
      : selected 
        ? '0 0 10px rgba(24, 144, 255, 0.5)' 
        : '0 2px 6px rgba(0,0,0,0.1)',
    minWidth: '180px',
    width: '180px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: data.textColor || '#333',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    transform: isHovered ? 'scale(1.02)' : 'scale(1)',
  };

  return (
    <div 
      style={nodeStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#1890ff', width: 6, height: 6 }}
      />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#1890ff', width: 6, height: 6 }}
      />
    </div>
  );
};

// 区域卡片内的节点组件（更小的尺寸）
const AreaNode = ({ data, selected }) => {
  // 生成随机颜色
  const getRandomColor = () => {
    const colors = ['#ff7875', '#ff9c6e', '#ffc069', '#fff566', '#95de64', '#5cdbd3', '#69c0ff', '#b37feb', '#ff85c0'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const nodeStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #d9d9d9',
    backgroundColor: 'transparent',
    boxShadow: selected ? '0 0 8px rgba(24, 144, 255, 0.4)' : '0 1px 4px rgba(0,0,0,0.1)',
    minWidth: '80px',
    width: '80px',
    textAlign: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    color: data.textColor || '#333',
    position: 'relative',
  };

  const badgeStyle = {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '0',
    height: '0',
    borderTop: '5.6px solid transparent',  // 8 * 0.7 = 5.6
    borderRight: `9.8px solid ${getRandomColor()}`,  // 14 * 0.7 = 9.8
    borderBottom: '5.6px solid transparent',  // 8 * 0.7 = 5.6
    zIndex: 10,
  };

  return (
    <div style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#1890ff', width: 4, height: 4 }}
      />
      <div>{data.label}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#1890ff', width: 4, height: 4 }}
      />
      <div style={badgeStyle}></div>
    </div>
  );
};

// 自定义 Controls 组件
const CustomControls = ({ onFullscreen }) => {
  return (
    <button
      onClick={onFullscreen}
      style={{
        width: '24px',
        height: '24px',
        border: '1px solid #d9d9d9',
        backgroundColor: '#fff',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666',
        padding: '0',
        flexShrink: 0
      }}
      title="全屏查看"
    >
      <FullscreenOutlined />
    </button>
  );
};

// 节点类型定义
const nodeTypes = {
  custom: CustomNodeWithHover,
  area: AreaNode,
};

// 初始节点数据 - 只包含三个网关节点
const getInitialNodes = (containerWidth) => {
  const isMobile = containerWidth < 768;
  const isTablet = containerWidth >= 768 && containerWidth < 1200;
  
  // 根据容器宽度调整节点位置 - 水平等比例居中
  if (isMobile) {
    // 移动端：垂直居中
    const centerX = Math.max(containerWidth / 2 - 90, 90); // 确保不超出左边界
    return [
      { id: '1', type: 'custom', position: { x: centerX, y: 30 }, data: { label: '外网网关', borderColor: '#d9d9d9', backgroundColor: '#ffffff' } },
      { id: '2', type: 'custom', position: { x: centerX, y: 100 }, data: { label: '办公网关', borderColor: '#d9d9d9', backgroundColor: '#ffffff' } },
      { id: '3', type: 'custom', position: { x: centerX, y: 170 }, data: { label: '应用网关', borderColor: '#d9d9d9', backgroundColor: '#ffffff' } },
    ];
  } else {
    // 平板和桌面端：水平等分布居中
    const spacing = isTablet ? 100 : 150;
    const totalWidth = 3 * 180 + 2 * spacing; // 3个节点宽度 + 2个间距
    const startX = Math.max((containerWidth - totalWidth) / 2, 50); // 确保不超出左边界
    return [
      { id: '1', type: 'custom', position: { x: startX, y: 30 }, data: { label: '外网网关', borderColor: '#d9d9d9', backgroundColor: '#ffffff' } },
      { id: '2', type: 'custom', position: { x: startX + 180 + spacing, y: 30 }, data: { label: '办公网关', borderColor: '#d9d9d9', backgroundColor: '#ffffff' } },
      { id: '3', type: 'custom', position: { x: startX + 2 * (180 + spacing), y: 30 }, data: { label: '应用网关', borderColor: '#d9d9d9', backgroundColor: '#ffffff' } },
    ];
  }
};

// 初始边数据 - 网关之间无连接
const initialEdges = [];

// 四个区域的初始节点数据
const getAreaNodes = (areaName, containerWidth) => {
  // 根据区域类型设置不同的节点样式
  const areaConfig = {
    'daxing': { label: '大兴', borderColor: '#1890ff', backgroundColor: '#e6f7ff' },
    'jiuxianqiao': { label: '酒仙桥', borderColor: '#52c41a', backgroundColor: '#f6ffed' },
    'jinrongyun': { label: '金融云', borderColor: '#fa8c16', backgroundColor: '#fff7e6' },
    'zhuanyouyun': { label: '专有云', borderColor: '#722ed1', backgroundColor: '#f9f0ff' }
  };
  
  const config = areaConfig[areaName];
  
  // 缩小节点宽度和间距，确保在300px高度内可见
  return [
    { id: `${areaName}-1`, type: 'area', position: { x: 10, y: 10 }, data: { label: `${config.label}-节点1`, borderColor: config.borderColor, backgroundColor: config.backgroundColor } },
    { id: `${areaName}-2`, type: 'area', position: { x: 90, y: 10 }, data: { label: `${config.label}-节点2`, borderColor: config.borderColor, backgroundColor: config.backgroundColor } },
    { id: `${areaName}-3`, type: 'area', position: { x: 50, y: 60 }, data: { label: `${config.label}-节点3`, borderColor: config.borderColor, backgroundColor: config.backgroundColor } },
  ];
};

// 四个区域的边数据
const getAreaEdges = (areaName) => {
  return [
    { id: `${areaName}-e1`, source: `${areaName}-1`, target: `${areaName}-3`, type: 'default', animated: true, style: { stroke: '#1890ff', strokeWidth: 1 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff', width: 6, height: 6 } },
    { id: `${areaName}-e2`, source: `${areaName}-2`, target: `${areaName}-3`, type: 'default', animated: true, style: { stroke: '#1890ff', strokeWidth: 1 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff', width: 6, height: 6 } },
  ];
};

// 模拟版本数据
const mockVersions = [
  { id: '1', name: 'v1.0.0', date: '2024-01-15', description: '初始版本' },
  { id: '2', name: 'v1.1.0', date: '2024-02-20', description: '添加缓存服务' },
  { id: '3', name: 'v1.2.0', date: '2024-03-10', description: '优化数据库连接' },
  { id: '4', name: 'v2.0.0', date: '2024-04-05', description: '重构架构，添加消息队列' },
];

// 连接线组件
const ConnectionLines = ({ screenWidth, nodes, hoveredNode, hoveredArea }) => {
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1200;
  
  // 使用实际的节点位置来计算连接线起始点
  const getGatewayPositions = () => {
    return nodes.map(node => ({
      x: node.position.x + 90, // 节点中心 (180/2)
      y: node.position.y + 60, // 节点底部 (确保不被遮挡)
    }));
  };

  // 计算区域卡片位置（连接到卡片上方）
  const getAreaPositions = () => {
    const cardWidth = isMobile ? screenWidth - 32 : (screenWidth - 32 - (isTablet ? 16 : 48)) / (isTablet ? 2 : 4);
    const cardHeight = 300;
    const startY = 156; // 网关区域高度120px + 间距20px + 16px padding
    
    if (isMobile) {
      return [
        { x: 16 + cardWidth / 2, y: startY }, // 大兴卡片上方
        { x: 16 + cardWidth / 2, y: startY + cardHeight + 16 }, // 酒仙桥卡片上方
        { x: 16 + cardWidth / 2, y: startY + 2 * (cardHeight + 16) }, // 金融云卡片上方
        { x: 16 + cardWidth / 2, y: startY + 3 * (cardHeight + 16) }, // 专有云卡片上方
      ];
    } else {
      const cols = isTablet ? 2 : 4;
      const positions = [];
      for (let i = 0; i < 4; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;
        positions.push({
          x: 16 + col * (cardWidth + 16) + cardWidth / 2,
          y: startY + row * (cardHeight + 16) // 连接到卡片上方
        });
      }
      return positions;
    }
  };

  const gatewayPositions = getGatewayPositions();
  const areaPositions = getAreaPositions();

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#1890ff"
          />
        </marker>
        <marker
          id="arrowhead-start"
          markerWidth="10"
          markerHeight="7"
          refX="1"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="10 0, 0 3.5, 10 7"
            fill="#1890ff"
          />
        </marker>
      </defs>
      
      {/* 绘制连接线：每个网关到每个区域 */}
      {gatewayPositions.map((gateway, gatewayIndex) => (
        areaPositions.map((area, areaIndex) => {
          const areaNames = ['daxing', 'jiuxianqiao', 'jinrongyun', 'zhuanyouyun'];
          const currentAreaName = areaNames[areaIndex];
          const isNodeHovered = hoveredNode === nodes[gatewayIndex]?.id;
          const isAreaHovered = hoveredArea === currentAreaName;
          const isHovered = isNodeHovered || isAreaHovered;
          
          return (
            <line
              key={`${gatewayIndex}-${areaIndex}`}
              x1={gateway.x}
              y1={gateway.y}
              x2={area.x}
              y2={area.y}
              stroke="#1890ff"
              strokeWidth={isHovered ? "2" : "1"}
              strokeDasharray={isHovered ? "5,5" : "0"}
              markerStart="url(#arrowhead-start)"
              markerEnd="url(#arrowhead)"
              opacity={isHovered ? "0.8" : "0.3"}
              className={isHovered ? "animated-line" : ""}
            />
          );
        })
      ))}
    </svg>
  );
};

// 单个区域组件
const AreaCard = ({ title, areaName, containerWidth }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // 初始化节点和边
  useEffect(() => {
    const cardWidth = Math.max(containerWidth / 4 - 20, 250); // 估算卡片宽度
    setNodes(getAreaNodes(areaName, cardWidth));
    setEdges(getAreaEdges(areaName));
  }, [areaName, containerWidth, setNodes, setEdges]);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  const handleMouseEnter = () => {
    setIsHovered(true);
    // 触发区域卡片 hover 事件
    window.dispatchEvent(new CustomEvent('areaHover', { detail: { areaName } }));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // 清除区域卡片 hover 事件
    window.dispatchEvent(new CustomEvent('areaHover', { detail: { areaName: null } }));
  };

  const handleFullscreen = () => {
    setIsModalVisible(true);
  };

  // 获取放大后的节点数据（等比例放大）
  const getExpandedNodes = () => {
    const scale = 3; // 放大倍数
    return nodes.map(node => ({
      ...node,
      position: {
        x: node.position.x * scale + 100, // 添加偏移以居中
        y: node.position.y * scale + 100
      }
    }));
  };

  const cardStyle = {
    border: '1px solid #d9d9d9', 
    borderRadius: '8px', 
    overflow: 'hidden',
    backgroundColor: 'transparent',
    height: '300px',
    position: 'relative',
    zIndex: 2,
    boxShadow: isHovered 
      ? '0 0 15px rgba(24, 144, 255, 0.3), 0 4px 8px rgba(0,0,0,0.15)'
      : '0 2px 6px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease-in-out',
    transform: isHovered ? 'scale(1.01)' : 'scale(1)',
    cursor: 'pointer',
  };

  return (
    <>
      <div 
        style={cardStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ 
          padding: '8px 12px', 
          backgroundColor: '#f0f0f0', 
          borderBottom: '1px solid #d9d9d9',
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#262626',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{title}</span>
          <CustomControls onFullscreen={handleFullscreen} />
        </div>
        <div style={{ height: 'calc(100% - 41px)', position: 'relative' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.Bezier}
            fitView={true}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            style={{ background: 'transparent' }}
            attributionPosition="bottom-left"
            hideAttribution={true}
          >
            {/* <Background /> */}
          </ReactFlow>
        </div>
      </div>

      {/* 全屏弹窗 */}
      <Modal
        title={`${title} - 详细视图`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ height: '500px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
          <ReactFlow
            nodes={getExpandedNodes()}
            edges={edges}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.Bezier}
            fitView={true}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={true}
            style={{ background: 'transparent' }}
            attributionPosition="bottom-left"
          >
            {/* <Background /> */}
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </Modal>
    </>
  );
};

function ArchitectureTopology() {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [containerWidth, setContainerWidth] = useState(800); // 默认容器宽度
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(800));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedVersion, setSelectedVersion] = useState('1');
  const [versions] = useState(mockVersions);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null);

  // 获取容器实际宽度
  useEffect(() => {
    const updateContainerWidth = () => {
      const container = document.querySelector('[data-testid="rf__wrapper"]');
      if (container) {
        const width = container.offsetWidth;
        setContainerWidth(width);
        // 根据容器宽度更新节点位置
        const newNodes = getInitialNodes(width);
        setNodes(newNodes);
      }
    };

    // 初始计算
    setTimeout(updateContainerWidth, 100);
    
    // 监听窗口变化
    const handleResize = () => {
      const newWidth = window.innerWidth;
      setScreenWidth(newWidth);
      setTimeout(updateContainerWidth, 100);
    };

    // 监听节点 hover 事件
    const handleNodeHover = (event) => {
      setHoveredNode(event.detail.nodeId);
    };

    // 监听区域卡片 hover 事件
    const handleAreaHover = (event) => {
      setHoveredArea(event.detail.areaName);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('nodeHover', handleNodeHover);
    window.addEventListener('areaHover', handleAreaHover);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('nodeHover', handleNodeHover);
      window.removeEventListener('areaHover', handleAreaHover);
    };
  }, [setNodes]);

  const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  const handleGenerate = () => {
    // 生成新的拓扑结构
    console.log('生成新的拓扑结构');
    // 这里可以添加生成逻辑
  };

  const handleSave = () => {
    // 保存当前拓扑结构
    const topologyData = {
      nodes,
      edges,
      version: selectedVersion,
      timestamp: new Date().toISOString()
    };
    console.log('保存拓扑结构:', topologyData);
    // 这里可以添加保存逻辑
  };

  const handleVersionChange = (versionId) => {
    setSelectedVersion(versionId);
    // 这里可以添加版本切换逻辑
    console.log('切换到版本:', versionId);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}>
        {/* 左侧版本列表 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
            架构拓扑
          </Title>
          <Select
            value={selectedVersion}
            onChange={handleVersionChange}
            style={{ width: 150 }}
            placeholder="选择版本"
          >
            {versions.map(version => (
              <Option key={version.id} value={version.id}>
                {version.name}
              </Option>
            ))}
          </Select>
        </div>

        {/* 右侧按钮 */}
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleGenerate}
            size="large"
          >
            生成
          </Button>
          <Button 
            type="default" 
            icon={<SaveOutlined />}
            onClick={handleSave}
            size="large"
          >
            保存
          </Button>
        </Space>
      </Header>

      <Content style={{ marginTop: "10px", background: '#f5f5f5', height: 'calc(100vh - 64px)' }}>
        <div style={{ 
          height: '100%', 
          background: '#fff', 
          borderRadius: '8px', 
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative'
        }}>
          {/* 连接线层 */}
          <ConnectionLines screenWidth={screenWidth} nodes={nodes} hoveredNode={hoveredNode} hoveredArea={hoveredArea} />

          {/* 父容器 - 包含网关节点和区域卡片 */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
            zIndex: 2
          }}>
            {/* 网关节点区域 */}
            <div style={{ height: '120px', position: 'relative' }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                connectionLineType={ConnectionLineType.Bezier}
                fitView={false}
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                nodesDraggable={false}
                nodesConnectable={false}
                elementsSelectable={true}
                style={{ background: 'transparent' }}
                zoomOnScroll={false}
                zoomOnPinch={false}
                panOnDrag={false}
                attributionPosition="bottom-left"
              >
              </ReactFlow>
            </div>

            {/* 四个区域卡片 */}
            <div style={{ 
              flex: 1,
              display: 'grid',
              gridTemplateColumns: screenWidth < 768 ? '1fr' : screenWidth < 1200 ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
              gap: '16px',
              minHeight: '400px'
            }}>
              <AreaCard title="大兴区域" areaName="daxing" containerWidth={screenWidth} />
              <AreaCard title="酒仙桥区域" areaName="jiuxianqiao" containerWidth={screenWidth} />
              <AreaCard title="金融云区域" areaName="jinrongyun" containerWidth={screenWidth} />
              <AreaCard title="专有云区域" areaName="zhuanyouyun" containerWidth={screenWidth} />
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
}

export default ArchitectureTopology;