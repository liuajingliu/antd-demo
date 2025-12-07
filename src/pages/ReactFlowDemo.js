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
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes = [
  {
    id: '1',
    type: 'default',
    data: { label: '开始节点' },
    position: { x: 250, y: 25 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: '处理节点' },
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'default',
    data: { label: '决策节点' },
    position: { x: 400, y: 125 },
  },
  {
    id: '4',
    type: 'default',
    data: { label: '结束节点' },
    position: { x: 250, y: 250 },
  },
];

const initialEdges = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'smoothstep',
    animated: true,
    markerEnd: {
      type: MarkerType.ArrowClosed,
    },
  },
];

function ReactFlowDemo() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [draggedNode, setDraggedNode] = useState(null);
  const [targetNode, setTargetNode] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'default',
      data: { label: `新节点 ${nodes.length + 1}` },
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const resetFlow = () => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    setDraggedNode(null);
    setTargetNode(null);
  };

  const handleNodeDragStart = (event, node) => {
    console.log('开始拖拽节点:', node.data.label);
    setDraggedNode(node);
    setTargetNode(null);
  };

  const handleNodeDrag = (event, node) => {
    console.log('拖拽中节点:', node.data.label, '位置:', node.position);
    if (!draggedNode || draggedNode.id !== node.id) return;

    // 检查其他节点是否与拖拽节点足够接近
    const nearbyNode = nodes.find(n => {
      if (n.id === draggedNode.id) return false;
      
      const distance = Math.sqrt(
        Math.pow(n.position.x - node.position.x, 2) + 
        Math.pow(n.position.y - node.position.y, 2)
      );
      
      console.log(`距离节点 ${n.data.label}: ${distance}`);
      return distance < 80;
    });

    if (nearbyNode) {
      console.log('找到目标节点:', nearbyNode.data.label);
      setTargetNode(nearbyNode);
    } else {
      setTargetNode(null);
    }
  };

  const handleNodeDragStop = (event, node) => {
    console.log('停止拖拽节点:', node.data.label);
    console.log('目标节点:', targetNode ? targetNode.data.label : '无');
    
    if (draggedNode && targetNode && draggedNode.id !== targetNode.id) {
      console.log('开始交换位置');
      // 保存原始位置
      const draggedOriginalPosition = draggedNode.position;
      const targetOriginalPosition = targetNode.position;

      // 交换位置
      setNodes(nodes.map(n => {
        if (n.id === draggedNode.id) {
          return { ...n, position: targetOriginalPosition };
        } else if (n.id === targetNode.id) {
          return { ...n, position: draggedOriginalPosition };
        }
        return n;
      }));
    }
    
    setDraggedNode(null);
    setTargetNode(null);
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={addNode} style={{ marginRight: 8 }}>
          添加节点
        </button>
        <button onClick={resetFlow}>
          重置流程
        </button>
        <span style={{ marginLeft: 16, color: '#666' }}>
          拖拽节点到另一个节点附近可自动交换位置
        </span>
        {targetNode && (
          <span style={{ marginLeft: 16, color: '#1890ff' }}>
            目标节点: {targetNode.data.label}
          </span>
        )}
      </div>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes.map(node => {
            let style = { ...node.style };
            
            if (draggedNode && draggedNode.id === node.id) {
              // 正在拖拽的节点
              style.border = '2px solid #52c41a';
              style.boxShadow = '0 0 15px rgba(82, 196, 26, 0.6)';
            } else if (targetNode && targetNode.id === node.id) {
              // 目标节点
              style.border = '2px solid #ff4d4f';
              style.boxShadow = '0 0 15px rgba(255, 77, 79, 0.6)';
              style.backgroundColor = '#fff2f0';
            }
            
            return { ...node, style };
          })}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={handleNodeDragStart}
          onNodeDrag={handleNodeDrag}
          onNodeDragStop={handleNodeDragStop}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}

export default ReactFlowDemo;