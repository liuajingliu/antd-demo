import React, { useState, useCallback } from 'react';
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
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 自定义节点组件
const CustomNode = ({ data, selected }) => {
  const nodeStyle = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: `2px solid ${data.borderColor || '#1890ff'}`,
    backgroundColor: data.backgroundColor || '#fff',
    boxShadow: selected ? '0 0 10px rgba(24, 144, 255, 0.5)' : '0 2px 6px rgba(0,0,0,0.1)',
    minWidth: '80px',
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: data.textColor || '#333',
  };

  return (
    <div style={nodeStyle}>
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

// 节点类型定义
const nodeTypes = {
  custom: CustomNode,
};

// 区域1: 完全连接的网络拓扑
const area1Nodes = [
  { id: 'a1-1', type: 'custom', position: { x: 50, y: 50 }, data: { label: '核心路由器', borderColor: '#1890ff', backgroundColor: '#e6f7ff' } },
  { id: 'a1-2', type: 'custom', position: { x: 150, y: 20 }, data: { label: '交换机1', borderColor: '#52c41a', backgroundColor: '#f6ffed' } },
  { id: 'a1-3', type: 'custom', position: { x: 150, y: 80 }, data: { label: '交换机2', borderColor: '#52c41a', backgroundColor: '#f6ffed' } },
  { id: 'a1-4', type: 'custom', position: { x: 250, y: 50 }, data: { label: '服务器', borderColor: '#fa8c16', backgroundColor: '#fff7e6' } },
];

const area1Edges = [
  { id: 'a1-e1', source: 'a1-1', target: 'a1-2', type: 'smoothstep', animated: true, style: { stroke: '#1890ff' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff' } },
  { id: 'a1-e2', source: 'a1-1', target: 'a1-3', type: 'smoothstep', animated: true, style: { stroke: '#1890ff' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff' } },
  { id: 'a1-e3', source: 'a1-2', target: 'a1-4', type: 'smoothstep', animated: true, style: { stroke: '#52c41a' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a' } },
  { id: 'a1-e4', source: 'a1-3', target: 'a1-4', type: 'smoothstep', animated: true, style: { stroke: '#52c41a' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a' } },
];

// 区域2: 部分连接的星型拓扑
const area2Nodes = [
  { id: 'a2-1', type: 'custom', position: { x: 150, y: 50 }, data: { label: '中心节点', borderColor: '#ff4d4f', backgroundColor: '#fff2f0' } },
  { id: 'a2-2', type: 'custom', position: { x: 50, y: 20 }, data: { label: '节点A', borderColor: '#722ed1', backgroundColor: '#f9f0ff' } },
  { id: 'a2-3', type: 'custom', position: { x: 250, y: 20 }, data: { label: '节点B', borderColor: '#722ed1', backgroundColor: '#f9f0ff' } },
  { id: 'a2-4', type: 'custom', position: { x: 50, y: 80 }, data: { label: '节点C', borderColor: '#722ed1', backgroundColor: '#f9f0ff' } },
  { id: 'a2-5', type: 'custom', position: { x: 250, y: 80 }, data: { label: '孤立节点', borderColor: '#d9d9d9', backgroundColor: '#fafafa' } },
];

const area2Edges = [
  { id: 'a2-e1', source: 'a2-1', target: 'a2-2', type: 'straight', animated: true, style: { stroke: '#ff4d4f' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff4d4f' } },
  { id: 'a2-e2', source: 'a2-1', target: 'a2-3', type: 'straight', animated: true, style: { stroke: '#ff4d4f' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff4d4f' } },
  { id: 'a2-e3', source: 'a2-1', target: 'a2-4', type: 'straight', animated: true, style: { stroke: '#ff4d4f' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff4d4f' } },
];

// 区域3: 无连接的独立节点
const area3Nodes = [
  { id: 'a3-1', type: 'custom', position: { x: 50, y: 30 }, data: { label: '独立节点1', borderColor: '#13c2c2', backgroundColor: '#e6fffb' } },
  { id: 'a3-2', type: 'custom', position: { x: 150, y: 30 }, data: { label: '独立节点2', borderColor: '#52c41a', backgroundColor: '#f6ffed' } },
  { id: 'a3-3', type: 'custom', position: { x: 250, y: 30 }, data: { label: '独立节点3', borderColor: '#fa8c16', backgroundColor: '#fff7e6' } },
  { id: 'a3-4', type: 'custom', position: { x: 50, y: 90 }, data: { label: '独立节点4', borderColor: '#eb2f96', backgroundColor: '#fff0f6' } },
  { id: 'a3-5', type: 'custom', position: { x: 150, y: 90 }, data: { label: '独立节点5', borderColor: '#722ed1', backgroundColor: '#f9f0ff' } },
  { id: 'a3-6', type: 'custom', position: { x: 250, y: 90 }, data: { label: '独立节点6', borderColor: '#1890ff', backgroundColor: '#e6f7ff' } },
];

const area3Edges = [];

// 区域4: 复杂混合拓扑
const area4Nodes = [
  { id: 'a4-1', type: 'custom', position: { x: 100, y: 20 }, data: { label: '主控', borderColor: '#1890ff', backgroundColor: '#e6f7ff' } },
  { id: 'a4-2', type: 'custom', position: { x: 20, y: 60 }, data: { label: '处理1', borderColor: '#52c41a', backgroundColor: '#f6ffed' } },
  { id: 'a4-3', type: 'custom', position: { x: 180, y: 60 }, data: { label: '处理2', borderColor: '#52c41a', backgroundColor: '#f6ffed' } },
  { id: 'a4-4', type: 'custom', position: { x: 100, y: 100 }, data: { label: '数据库', borderColor: '#ff4d4f', backgroundColor: '#fff2f0' } },
  { id: 'a4-5', type: 'custom', position: { x: 250, y: 40 }, data: { label: '缓存', borderColor: '#fa8c16', backgroundColor: '#fff7e6' } },
  { id: 'a4-6', type: 'custom', position: { x: 250, y: 80 }, data: { label: '监控', borderColor: '#722ed1', backgroundColor: '#f9f0ff' } },
];

const area4Edges = [
  { id: 'a4-e1', source: 'a4-1', target: 'a4-2', type: 'smoothstep', animated: true, style: { stroke: '#1890ff' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff' } },
  { id: 'a4-e2', source: 'a4-1', target: 'a4-3', type: 'smoothstep', animated: true, style: { stroke: '#1890ff' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff' } },
  { id: 'a4-e3', source: 'a4-2', target: 'a4-4', type: 'straight', style: { stroke: '#52c41a' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a' } },
  { id: 'a4-e4', source: 'a4-3', target: 'a4-4', type: 'straight', style: { stroke: '#52c41a' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a' } },
  { id: 'a4-e5', source: 'a4-3', target: 'a4-5', type: 'straight', animated: true, style: { stroke: '#fa8c16' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#fa8c16' } },
];

// 单个区域组件
const FlowArea = ({ title, nodes, edges, bgColor = '#fafafa', areaName, onNodesChange }) => {
  const [localNodes, setLocalNodes, localOnNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);
  const [draggedNode, setDraggedNode] = React.useState(null);
  const [targetNode, setTargetNode] = React.useState(null);

  // 包装 onNodesChange 以便通知父组件
  const handleNodesChange = useCallback((changes) => {
    localOnNodesChange(changes);
    if (onNodesChange) {
      onNodesChange(localNodes, areaName);
    }
  }, [localOnNodesChange, localNodes, onNodesChange, areaName]);

  const onConnect = useCallback(
    (params) => setLocalEdges((eds) => addEdge(params, eds)),
    [setLocalEdges]
  );

  const handleNodeDragStart = (event, node) => {
    console.log('[' + title + '] 开始拖拽节点:', node.data.label);
    setDraggedNode(node);
    setTargetNode(null);
  };

  const handleNodeDrag = (event, node) => {
    console.log('[' + title + '] 拖拽中节点:', node.data.label, '位置:', node.position);
    if (!draggedNode || draggedNode.id !== node.id) return;

    // 检查其他节点是否与拖拽节点足够接近
    const nearbyNode = localNodes.find(n => {
      if (n.id === draggedNode.id) return false;
      
      const distance = Math.sqrt(
        Math.pow(n.position.x - node.position.x, 2) + 
        Math.pow(n.position.y - node.position.y, 2)
      );
      
      console.log('[' + title + '] 距离节点 ' + n.data.label + ': ' + distance);
      return distance < 60; // 检测距离
    });

    if (nearbyNode) {
      console.log('[' + title + '] 找到目标节点:', nearbyNode.data.label);
    }
    setTargetNode(nearbyNode || null);
  };

  const handleNodeDragStop = (event, node) => {
    console.log('[' + title + '] 停止拖拽节点:', node.data.label);
    console.log('[' + title + '] 目标节点:', targetNode ? targetNode.data.label : '无');
    
    if (draggedNode && targetNode && draggedNode.id !== targetNode.id) {
      console.log('[' + title + '] 开始交换节点位置:', draggedNode.data.label, '<->', targetNode.data.label);
      
      // 保存原始位置
      const draggedOriginalPosition = draggedNode.position;
      const targetOriginalPosition = targetNode.position;

      // 交换位置
      const newNodes = localNodes.map(n => {
        if (n.id === draggedNode.id) {
          return { ...n, position: targetOriginalPosition };
        } else if (n.id === targetNode.id) {
          return { ...n, position: draggedOriginalPosition };
        }
        return n;
      });
      setLocalNodes(newNodes);
      
      // 通知父组件节点位置已更改
      if (onNodesChange) {
        onNodesChange(newNodes, areaName);
      }
    }
    
    setDraggedNode(null);
    setTargetNode(null);
  };

  return (
    <div style={{ 
      border: '2px solid #d9d9d9', 
      borderRadius: '8px', 
      overflow: 'hidden',
      backgroundColor: '#fff'
    }}>
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#f0f0f0', 
        borderBottom: '1px solid #d9d9d9',
        fontSize: '14px',
        fontWeight: 'bold',
        color: '#262626'
      }}>
        {title}
        {targetNode && (
          <span style={{ 
            marginLeft: '8px', 
            fontSize: '12px', 
            color: '#1890ff',
            fontWeight: 'normal'
          }}>
            目标: {targetNode.data.label}
          </span>
        )}
      </div>
      <div style={{ height: '200px', position: 'relative' }}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={localNodes.map(node => {
              let style = { ...node.style };
              
              if (draggedNode && draggedNode.id === node.id) {
                // 正在拖拽的节点
                style.border = '2px solid #52c41a';
                style.boxShadow = '0 0 15px rgba(82, 196, 26, 0.6)';
                style.zIndex = 1000;
              } else if (targetNode && targetNode.id === node.id) {
                // 目标节点
                style.border = '2px solid #ff4d4f';
                style.boxShadow = '0 0 15px rgba(255, 77, 79, 0.6)';
                style.backgroundColor = '#fff2f0';
                style.zIndex = 999;
              }
              
              return { ...node, style };
            })}
            edges={localEdges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStart={handleNodeDragStart}
            onNodeDrag={handleNodeDrag}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            style={{ background: bgColor }}
            minZoom={0.5}
            maxZoom={2}
          >
            <Background variant="dots" gap={12} size={1} />
            <Controls 
              showZoom={false}
              showFitView={false}
              showInteractive={false}
              position="bottom-left"
            />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
};

// 从 localStorage 加载保存的节点位置
const loadSavedPositions = () => {
  const savedData = localStorage.getItem('topologyNodesPositions');
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      console.error('加载保存的位置数据失败:', e);
      return {};
    }
  }
  return {};
};

// 保存节点位置到 localStorage
const savePositions = (areaName, nodes) => {
  const savedData = loadSavedPositions();
  savedData[areaName] = nodes.map(node => ({
    id: node.id,
    position: node.position
  }));
  localStorage.setItem('topologyNodesPositions', JSON.stringify(savedData));
};

// 应用保存的位置到节点
const applySavedPositions = (nodes, areaName) => {
  const savedData = loadSavedPositions();
  const areaSavedData = savedData[areaName];
  
  if (areaSavedData) {
    return nodes.map(node => {
      const savedNode = areaSavedData.find(n => n.id === node.id);
      if (savedNode) {
        return { ...node, position: savedNode.position };
      }
      return node;
    });
  }
  return nodes;
};

function TopologyDemo() {
  const [globalStats, setGlobalStats] = useState({
    totalNodes: area1Nodes.length + area2Nodes.length + area3Nodes.length + area4Nodes.length,
    totalEdges: area1Edges.length + area2Edges.length + area3Edges.length + area4Edges.length,
  });

  // 应用保存的位置
  const [area1NodesWithPositions] = useState(() => applySavedPositions(area1Nodes, 'area1'));
  const [area2NodesWithPositions] = useState(() => applySavedPositions(area2Nodes, 'area2'));
  const [area3NodesWithPositions] = useState(() => applySavedPositions(area3Nodes, 'area3'));
  const [area4NodesWithPositions] = useState(() => applySavedPositions(area4Nodes, 'area4'));

  // 存储每个区域的节点状态
  const [areaNodesState, setAreaNodesState] = useState({
    area1: area1NodesWithPositions,
    area2: area2NodesWithPositions,
    area3: area3NodesWithPositions,
    area4: area4NodesWithPositions,
  });

  // 处理节点位置变化
  const handleNodesChange = (nodes, areaName) => {
    setAreaNodesState(prev => ({
      ...prev,
      [areaName]: nodes
    }));
  };

  // 保存所有区域的位置
  const handleSaveAll = () => {
    Object.keys(areaNodesState).forEach(areaName => {
      savePositions(areaName, areaNodesState[areaName]);
    });
    
    alert('位置已保存！页面刷新后将保持当前布局。');
  };

  // 重置所有位置
  const handleResetAll = () => {
    if (confirm('确定要重置所有区域的位置吗？这将清除所有保存的数据。')) {
      localStorage.removeItem('topologyNodesPositions');
      window.location.reload();
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', padding: '16px', backgroundColor: '#f5f5f5' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: 0, color: '#1890ff' }}>四区域拓扑图演示</h2>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
          展示不同连接模式的网络拓扑：完全连接、部分连接、无连接、复杂混合
        </p>
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#8c8c8c' }}>
          总节点数: {globalStats.totalNodes} | 总连接数: {globalStats.totalEdges}
        </div>
        <div style={{ marginTop: '12px' }}>
          <button 
            onClick={handleSaveAll}
            style={{ 
              padding: '8px 16px', 
              marginRight: '8px',
              backgroundColor: '#1890ff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            💾 保存位置
          </button>
          <button 
            onClick={handleResetAll}
            style={{ 
              padding: '8px 16px',
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 重置所有
          </button>
          <span style={{ marginLeft: '16px', fontSize: '12px', color: '#666' }}>
            拖拽节点可交换位置，点击保存后刷新页面保持布局
          </span>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr 1fr', 
        gap: '16px',
        height: 'calc(100vh - 120px)'
      }}>
        <FlowArea 
          title="区域1: 完全连接网络" 
          nodes={areaNodesState.area1} 
          edges={area1Edges}
          bgColor="#e6f7ff"
          areaName="area1"
          onNodesChange={handleNodesChange}
        />
        <FlowArea 
          title="区域2: 星型拓扑 (部分连接)" 
          nodes={areaNodesState.area2} 
          edges={area2Edges}
          bgColor="#fff2f0"
          areaName="area2"
          onNodesChange={handleNodesChange}
        />
        <FlowArea 
          title="区域3: 独立节点 (无连接)" 
          nodes={areaNodesState.area3} 
          edges={area3Edges}
          bgColor="#f6ffed"
          areaName="area3"
          onNodesChange={handleNodesChange}
        />
        <FlowArea 
          title="区域4: 复杂混合拓扑" 
          nodes={areaNodesState.area4} 
          edges={area4Edges}
          bgColor="#f9f0ff"
          areaName="area4"
          onNodesChange={handleNodesChange}
        />
      </div>
    </div>
  );
}

export default TopologyDemo;