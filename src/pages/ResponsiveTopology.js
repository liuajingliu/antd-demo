import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 响应式节点组件
const ResponsiveNode = ({ data, selected, dragging }) => {
  const screenWidth = data.screenWidth || window.innerWidth;
  const screenHeight = data.screenHeight || window.innerHeight;

  // 根据屏幕尺寸动态计算节点大小
  const getNodeSize = () => {
    if (screenWidth < 768) {
      return {
        width: 45,
        height: 25,
        fontSize: 9,
        padding: '3px 5px',
        handleSize: 5
      };
    } else if (screenWidth < 1200) {
      return {
        width: 50,
        height: 22,
        fontSize: 10,
        padding: '4px 6px',
        handleSize: 6
      };
    } else {
      return {
        width: 65,
        height: 30,
        fontSize: 8,
        padding: '6px 8px',
        handleSize: 8
      };
    }
  };

  const nodeSize = getNodeSize();

  const nodeStyle = {
    width: nodeSize.width + 'px',
    height: nodeSize.height + 'px',
    borderRadius: '6px',
    border: `2px solid ${data.borderColor || '#1890ff'}`,
    backgroundColor: data.backgroundColor || '#fff',
    boxShadow: selected ? '0 0 10px rgba(24, 144, 255, 0.5)' : 
                dragging ? '0 8px 16px rgba(0,0,0,0.3)' : '0 2px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: nodeSize.fontSize + 'px',
    fontWeight: 'bold',
    color: data.textColor || '#333',
    padding: nodeSize.padding,
    textAlign: 'center',
    transition: dragging ? 'none' : 'all 0.2s ease',
    cursor: dragging ? 'grabbing' : 'grab',
    opacity: dragging ? 0.8 : 1,
    transform: dragging ? 'scale(1.05)' : 'scale(1)',
  };

  const handleStyle = {
    background: '#1890ff',
    width: nodeSize.handleSize + 'px',
    height: nodeSize.handleSize + 'px',
  };

  return (
    <div style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
      />
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: screenWidth < 768 ? '2px' : '4px' 
      }}>
        {data.label}
        {screenWidth >= 768 && (
          <span style={{ 
            fontSize: '10px', 
            color: '#8c8c8c',
            opacity: 0.7 
          }}>
            ⋮⋮
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
      />
    </div>
  );
};

const nodeTypes = {
  responsive: ResponsiveNode,
};

// 响应式区域组件内部组件
const ResponsiveAreaInner = ({ 
  title, 
  nodes, 
  edges, 
  bgColor = '#fafafa', 
  areaName,
  globalZoom = 1,
  onAreaZoomChange,
  screenSize,
  currentAreaZoom = 1 // 新增：从父组件传入的当前缩放值
}) => {
  const [localNodes, setLocalNodes, onNodesChange] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChange] = useEdgesState(edges);
  const [areaZoom, setAreaZoom] = useState(currentAreaZoom);
  const { setViewport, getViewport, setZoom, fitView } = useReactFlow();
  const prevScreenWidth = useRef(screenSize.width);
  const [draggedNode, setDraggedNode] = useState(null);
  
  // 使用ref来存储最新的areaZoom值，避免闭包问题
  const areaZoomRef = useRef(areaZoom);
  areaZoomRef.current = areaZoom;
  
  // 强制更新标记
  const forceUpdateRef = useRef(false);

  // 同步全局areaZooms状态
  useEffect(() => {
    if (onAreaZoomChange) {
      onAreaZoomChange(areaName, areaZoom);
    }
  }, [areaZoom, areaName, onAreaZoomChange]);

  // 响应父组件传入的currentAreaZoom变化（避免循环更新）
  useEffect(() => {
    // 如果是强制更新期间，跳过处理
    if (forceUpdateRef.current) return;
    
    // 只有在差异较大且不是由当前区域触发时才更新
    if (Math.abs(currentAreaZoom - areaZoom) > 0.05) {
      setAreaZoom(currentAreaZoom);
    }
  }, [currentAreaZoom, areaZoom]); // 添加areaZoom依赖，确保正确比较

  // 页面变宽时重置缩放为1，确保一致性
  useEffect(() => {
    if (screenSize.width > prevScreenWidth.current && screenSize.width > 1200) {
      // 重置区域缩放为1，确保所有区域缩放一致
      setAreaZoom(1);
      if (onAreaZoomChange) {
        onAreaZoomChange(areaName, 1);
      }
    }
    prevScreenWidth.current = screenSize.width;
  }, [screenSize.width, onAreaZoomChange, areaName]);

  // 根据屏幕尺寸调整节点位置和大小
  useEffect(() => {
    const scaleFactor = Math.min(screenSize.width / 1920, screenSize.height / 1080);
    
    const adjustedNodes = localNodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        screenWidth: screenSize.width,
        screenHeight: screenSize.height
      },
      // 根据屏幕缩放调整位置
      position: {
        x: node.position.x * scaleFactor,
        y: node.position.y * scaleFactor
      }
    }));

    // 检查位置是否真的需要更新
    const needsUpdate = adjustedNodes.some((node, index) => {
      const currentNode = localNodes[index];
      return (
        node.position.x !== currentNode.position.x ||
        node.position.y !== currentNode.position.y ||
        node.data.screenWidth !== currentNode.data.screenWidth ||
        node.data.screenHeight !== currentNode.data.screenHeight
      );
    });

    if (needsUpdate) {
      setLocalNodes(adjustedNodes);
    }
  }, [screenSize.width, screenSize.height, setLocalNodes]);

  const onConnect = useCallback(
    (params) => setLocalEdges((eds) => addEdge(params, eds)),
    [setLocalEdges]
  );

  // 处理节点拖拽开始
  const onNodeDragStart = useCallback((event, node) => {
    setDraggedNode(node);
  }, []);

  // 处理节点拖拽结束
  const onNodeDragStop = useCallback((event, node) => {
    if (!draggedNode) return;

    // 只有在真正拖拽操作时才进行交换（排除动画状态下的自动移动）
    const hasActuallyDragged = 
      Math.abs(node.position.x - draggedNode.position.x) > 5 || 
      Math.abs(node.position.y - draggedNode.position.y) > 5;

    if (!hasActuallyDragged) {
      setDraggedNode(null);
      return;
    }

    // 获取节点尺寸
    const getNodeDimensions = (nodeData) => {
      const screenWidth = nodeData.screenWidth || screenSize.width;
      if (screenWidth < 768) {
        return { width: 45, height: 25 };
      } else if (screenWidth < 1200) {
        return { width: 50, height: 22 };
      } else {
        return { width: 65, height: 30 };
      }
    };

    // 计算两个矩形的交叉面积
    const calculateOverlapArea = (rect1, rect2) => {
      const x1 = Math.max(rect1.x, rect2.x);
      const y1 = Math.max(rect1.y, rect2.y);
      const x2 = Math.min(rect1.x + rect1.width, rect2.x + rect2.width);
      const y2 = Math.min(rect1.y + rect1.height, rect2.y + rect2.height);
      
      if (x2 <= x1 || y2 <= y1) return 0;
      
      return (x2 - x1) * (y2 - y1);
    };

    // 检查是否拖拽到了其他节点上（交叉面积达到60%）
    const targetNode = localNodes.find(n => {
      if (n.id === node.id) return false;
      
      const draggedDimensions = getNodeDimensions(node.data);
      const targetDimensions = getNodeDimensions(n.data);
      
      const draggedRect = {
        x: node.position.x,
        y: node.position.y,
        width: draggedDimensions.width,
        height: draggedDimensions.height
      };
      
      const targetRect = {
        x: n.position.x,
        y: n.position.y,
        width: targetDimensions.width,
        height: targetDimensions.height
      };
      
      const overlapArea = calculateOverlapArea(draggedRect, targetRect);
      const draggedArea = draggedDimensions.width * draggedDimensions.height;
      const targetArea = targetDimensions.width * targetDimensions.height;
      const minArea = Math.min(draggedArea, targetArea);
      
      const overlapPercentage = (overlapArea / minArea) * 100;
      
      return overlapPercentage >= 60;
    });

    if (targetNode) {
      // 交换节点位置，添加动画效果
      setLocalNodes(prevNodes => 
        prevNodes.map(n => {
          if (n.id === node.id) {
            return { ...n, position: { ...targetNode.position } };
          } else if (n.id === targetNode.id) {
            return { ...n, position: { ...draggedNode.position } };
          }
          return n;
        })
      );
    } else {
      // 如果没有满足条件的交换，将拖拽的节点恢复到原始位置
      setLocalNodes(prevNodes => 
        prevNodes.map(n => {
          if (n.id === node.id) {
            return { ...n, position: { ...draggedNode.position } };
          }
          return n;
        })
      );
    }

    setDraggedNode(null);
  }, [localNodes, draggedNode, setLocalNodes, screenSize.width]);

  // 处理鼠标滚轮缩放 - 直接更新显示
  const handleWheel = useCallback((event) => {
    try {
      // 只处理非Ctrl键的滚轮事件（区域缩放）
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        
        // 使用ref获取最新的areaZoom值，避免闭包问题
        const currentAreaZoom = areaZoomRef.current;
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        const newAreaZoom = Math.max(0.3, Math.min(3, currentAreaZoom * delta));
        
        if (!isNaN(newAreaZoom) && isFinite(newAreaZoom)) {
          // 标记强制更新
          forceUpdateRef.current = true;
          
          // 立即更新显示
          console.log('鼠标滚轮更新areaZoom:', newAreaZoom);
          setAreaZoom(newAreaZoom);
          
          // 更新视口 - 直接使用areaZoom
          const viewport = getViewport();
          setViewport({
            x: viewport.x,
            y: viewport.y,
            zoom: newAreaZoom
          });
          
          // 同步到全局状态
          if (onAreaZoomChange) {
            onAreaZoomChange(areaName, newAreaZoom);
          }
          
          // 重置标记 - 确保足够时间防止冲突
          setTimeout(() => {
            forceUpdateRef.current = false;
          }, 300);
        }
      }
    } catch (error) {
      console.error('鼠标滚轮处理错误:', error);
    }
  }, [areaName, onAreaZoomChange, setViewport]);

  // 处理视口变化（包括按钮缩放等）
  const handleZoomChange = useCallback((viewport) => {
    try {
      // 如果是强制更新期间，跳过处理
      if (forceUpdateRef.current) return;
      
      if (viewport.zoom) {
        const newAreaZoom = viewport.zoom;
        
        if (!isNaN(newAreaZoom) && isFinite(newAreaZoom)) {
          // 只有当变化较大时才更新，避免频繁更新
          if (Math.abs(newAreaZoom - areaZoomRef.current) > 0.01) {
            setAreaZoom(newAreaZoom);
            
            // 同步到全局状态
            if (onAreaZoomChange) {
              onAreaZoomChange(areaName, newAreaZoom);
            }
          }
        }
      }
    } catch (error) {
      console.error('缩放变化处理错误:', error);
    }
  }, [areaName, onAreaZoomChange]);

  // 应用全局缩放（当globalZoom变化时更新视口）
  useEffect(() => {
    const viewport = getViewport();
    const targetZoom = areaZoom * globalZoom;
    
    // 只有当缩放值真正改变时才更新
    if (Math.abs(viewport.zoom - targetZoom) > 0.01) {
      setViewport({
        x: viewport.x,
        y: viewport.y,
        zoom: targetZoom
      });
    }
  }, [globalZoom, areaZoom]); // 响应globalZoom和areaZoom变化

  // 区域缩放控制
  const handleAreaZoomIn = () => {
    try {
      // 使用ref获取最新的areaZoom值
      const currentAreaZoom = areaZoomRef.current;
      const newAreaZoom = Math.min(currentAreaZoom * 1.2, 3);
      const viewport = getViewport();
      
      // 立即更新显示
      setAreaZoom(newAreaZoom);
      
      // 更新视口 - 直接使用areaZoom
      setViewport({
        x: viewport.x,
        y: viewport.y,
        zoom: newAreaZoom
      });
      
      // 同步到全局状态
      if (onAreaZoomChange) {
        onAreaZoomChange(areaName, newAreaZoom);
      }
    } catch (error) {
      console.error('区域放大错误:', error);
    }
  };

  const handleAreaZoomOut = () => {
    try {
      // 使用ref获取最新的areaZoom值
      const currentAreaZoom = areaZoomRef.current;
      const newAreaZoom = Math.max(currentAreaZoom / 1.2, 0.3);
      const viewport = getViewport();
      
      // 立即更新显示
      setAreaZoom(newAreaZoom);
      
      // 更新视口 - 直接使用areaZoom
      setViewport({
        x: viewport.x,
        y: viewport.y,
        zoom: newAreaZoom
      });
      
      // 同步到全局状态
      if (onAreaZoomChange) {
        onAreaZoomChange(areaName, newAreaZoom);
      }
    } catch (error) {
      console.error('区域缩小错误:', error);
    }
  };

  const handleAreaFitView = () => {
    try {
      // 立即更新显示
      setAreaZoom(1);
      
      // 同步到全局状态
      if (onAreaZoomChange) {
        onAreaZoomChange(areaName, 1);
      }
      
      fitView({ 
        padding: 0.1,
        includeHiddenNodes: false,
        maxZoom: 1,
        duration: 300
      });
    } catch (error) {
      console.error('适应视图错误:', error);
    }
  };

  return (
    <div 
      style={{ 
        border: '2px solid #d9d9d9', 
        borderRadius: '8px', 
        overflow: 'hidden',
        backgroundColor: '#fff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ 
        padding: '8px 12px', 
        backgroundColor: '#f0f0f0', 
        borderBottom: '1px solid #d9d9d9',
        fontSize: screenSize.width < 768 ? '12px' : '14px',
        fontWeight: 'bold',
        color: '#262626',
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          {title}
          <span style={{ 
            marginLeft: '8px', 
            fontSize: screenSize.width < 768 ? '10px' : '12px', 
            color: '#8c8c8c',
            fontWeight: 'normal'
          }}>
            ({screenSize.width}x{screenSize.height})
          </span>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: screenSize.width < 768 ? '10px' : '11px', 
            color: '#666',
            marginRight: '4px'
          }}>
            缩放: {Math.round((isNaN(areaZoom) ? 1 : areaZoom) * 100)}%
          </span>
          <button
            onClick={handleAreaZoomOut}
            style={{
              padding: '2px 6px',
              fontSize: screenSize.width < 768 ? '10px' : '11px',
              border: '1px solid #d9d9d9',
              borderRadius: '3px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            -
          </button>
          <button
            onClick={handleAreaZoomIn}
            style={{
              padding: '2px 6px',
              fontSize: screenSize.width < 768 ? '10px' : '11px',
              border: '1px solid #d9d9d9',
              borderRadius: '3px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            +
          </button>
          <button
            onClick={handleAreaFitView}
            style={{
              padding: '2px 6px',
              fontSize: screenSize.width < 768 ? '10px' : '11px',
              border: '1px solid #d9d9d9',
              borderRadius: '3px',
              backgroundColor: '#fff',
              cursor: 'pointer'
            }}
          >
            ⟲
          </button>
        </div>
      </div>
      <div style={{ 
        flex: 1, 
        position: 'relative',
        minHeight: '200px'
      }}>
        <ReactFlow
          nodes={localNodes}
          edges={localEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onViewportChange={handleZoomChange}
          onWheel={handleWheel} // 自定义鼠标滚轮处理
          nodeTypes={nodeTypes}
          connectionLineType={ConnectionLineType.Bezier}
          fitView={false} // 禁用自动fitView，确保缩放一致
          style={{ background: bgColor }}
          minZoom={0.3}
          maxZoom={3}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          <Background 
            variant="dots" 
            gap={screenSize.width < 768 ? 8 : 12} 
            size={screenSize.width < 768 ? 0.5 : 1} 
          />
          <Controls 
            showZoom={false}
            showFitView={false}
            showInteractive={true}
            position="bottom-left"
            style={{ 
              fontSize: screenSize.width < 768 ? '10px' : '12px'
            }}
          />
          <MiniMap 
            nodeColor={(node) => {
              return node.data.borderColor || '#1890ff';
            }}
            style={{ 
              backgroundColor: '#fff',
              width: screenSize.width < 768 ? 60 : 80,
              height: screenSize.width < 768 ? 40 : 60
            }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};

// 响应式区域组件
const ResponsiveArea = ({ 
  title, 
  nodes, 
  edges, 
  bgColor = '#fafafa', 
  areaName,
  globalZoom = 1,
  onAreaZoomChange,
  screenSize,
  currentAreaZoom = 1 // 新增：当前区域的缩放值
}) => {
  return (
    <ReactFlowProvider>
      <ResponsiveAreaInner
        title={title}
        nodes={nodes}
        edges={edges}
        bgColor={bgColor}
        areaName={areaName}
        globalZoom={globalZoom}
        onAreaZoomChange={onAreaZoomChange}
        screenSize={screenSize}
        currentAreaZoom={currentAreaZoom}
      />
    </ReactFlowProvider>
  );
};

// 初始节点数据
const area1Nodes = [
  { id: 'a1-1', type: 'responsive', position: { x: 40, y: 30 }, data: { label: '路由器', borderColor: '#1890ff' } },
  { id: 'a1-2', type: 'responsive', position: { x: 150, y: 15 }, data: { label: '交换机1', borderColor: '#52c41a' } },
  { id: 'a1-3', type: 'responsive', position: { x: 150, y: 75 }, data: { label: '交换机2', borderColor: '#52c41a' } },
  { id: 'a1-4', type: 'responsive', position: { x: 260, y: 45 }, data: { label: '服务器', borderColor: '#fa8c16' } },
];

const area1Edges = [
  { id: 'a1-e1', source: 'a1-1', target: 'a1-2', type: 'default', animated: true, style: { stroke: '#1890ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff', width: 8, height: 8 } },
  { id: 'a1-e2', source: 'a1-1', target: 'a1-3', type: 'default', animated: true, style: { stroke: '#1890ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff', width: 8, height: 8 } },
  { id: 'a1-e3', source: 'a1-2', target: 'a1-4', type: 'default', animated: true, style: { stroke: '#52c41a', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a', width: 8, height: 8 } },
  { id: 'a1-e4', source: 'a1-3', target: 'a1-4', type: 'default', animated: true, style: { stroke: '#52c41a', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a', width: 8, height: 8 } },
];

const area2Nodes = [
  { id: 'a2-1', type: 'responsive', position: { x: 120, y: 35 }, data: { label: '中心节点', borderColor: '#722ed1' } },
  { id: 'a2-2', type: 'responsive', position: { x: 40, y: 120 }, data: { label: '子节点1', borderColor: '#eb2f96' } },
  { id: 'a2-3', type: 'responsive', position: { x: 200, y: 120 }, data: { label: '子节点2', borderColor: '#eb2f96' } },
  { id: 'a2-4', type: 'responsive', position: { x: 120, y: 200 }, data: { label: '孤立节点', borderColor: '#8c8c8c' } },
];

const area2Edges = [
  { id: 'a2-e1', source: 'a2-1', target: 'a2-2', type: 'default', animated: true, style: { stroke: '#722ed1', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#722ed1', width: 8, height: 8 } },
  { id: 'a2-e2', source: 'a2-1', target: 'a2-3', type: 'default', animated: true, style: { stroke: '#722ed1', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#722ed1', width: 8, height: 8 } },
];

const area3Nodes = [
  { id: 'a3-1', type: 'responsive', position: { x: 30, y: 30 }, data: { label: '节点1', borderColor: '#f5222d' } },
  { id: 'a3-2', type: 'responsive', position: { x: 160, y: 30 }, data: { label: '节点2', borderColor: '#fa8c16' } },
  { id: 'a3-3', type: 'responsive', position: { x: 290, y: 30 }, data: { label: '节点3', borderColor: '#fadb14' } },
  { id: 'a3-4', type: 'responsive', position: { x: 30, y: 150 }, data: { label: '节点4', borderColor: '#52c41a' } },
  { id: 'a3-5', type: 'responsive', position: { x: 160, y: 150 }, data: { label: '节点5', borderColor: '#1890ff' } },
  { id: 'a3-6', type: 'responsive', position: { x: 290, y: 150 }, data: { label: '节点6', borderColor: '#722ed1' } },
];

const area3Edges = [];

const area4Nodes = [
  { id: 'a4-1', type: 'responsive', position: { x: 120, y: 20 }, data: { label: '主控', borderColor: '#1890ff' } },
  { id: 'a4-2', type: 'responsive', position: { x: 40, y: 90 }, data: { label: '处理1', borderColor: '#52c41a' } },
  { id: 'a4-3', type: 'responsive', position: { x: 200, y: 90 }, data: { label: '处理2', borderColor: '#52c41a' } },
  { id: 'a4-4', type: 'responsive', position: { x: 40, y: 160 }, data: { label: '数据库', borderColor: '#fa8c16' } },
  { id: 'a4-5', type: 'responsive', position: { x: 200, y: 160 }, data: { label: '缓存', borderColor: '#722ed1' } },
  { id: 'a4-6', type: 'responsive', position: { x: 120, y: 230 }, data: { label: '监控', borderColor: '#f5222d' } },
];

const area4Edges = [
  { id: 'a4-e1', source: 'a4-1', target: 'a4-2', type: 'default', animated: true, style: { stroke: '#1890ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff', width: 8, height: 8 } },
  { id: 'a4-e2', source: 'a4-1', target: 'a4-3', type: 'default', animated: true, style: { stroke: '#1890ff', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#1890ff', width: 8, height: 8 } },
  { id: 'a4-e3', source: 'a4-2', target: 'a4-4', type: 'default', animated: true, style: { stroke: '#52c41a', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a', width: 8, height: 8 } },
  { id: 'a4-e4', source: 'a4-3', target: 'a4-4', type: 'default', animated: true, style: { stroke: '#52c41a', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#52c41a', width: 8, height: 8 } },
  { id: 'a4-e5', source: 'a4-3', target: 'a4-5', type: 'default', animated: true, style: { stroke: '#fa8c16', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#fa8c16', width: 8, height: 8 } },
  { id: 'a4-e6', source: 'a4-4', target: 'a4-6', type: 'default', animated: true, style: { stroke: '#fa8c16', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#fa8c16', width: 8, height: 8 } },
  { id: 'a4-e7', source: 'a4-5', target: 'a4-6', type: 'default', animated: true, style: { stroke: '#722ed1', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#722ed1', width: 8, height: 8 } },
];

function ResponsiveTopology() {
  const [screenInfo, setScreenInfo] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1200,
    isDesktop: window.innerWidth >= 1200
  });
  const [globalZoom, setGlobalZoom] = useState(1);
  const [areaZooms, setAreaZooms] = useState({
    responsive1: 1,
    responsive2: 1,
    responsive3: 1,
    responsive4: 1
  });

  // 处理区域缩放变化
  const handleAreaZoomChange = useCallback((areaName, zoom) => {
    setAreaZooms(prev => ({
      ...prev,
      [areaName]: zoom
    }));
  }, []);

  // 处理全局滚轮缩放
  const handleGlobalWheel = useCallback((event) => {
    try {
      // 检查是否按住 Ctrl 键
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        
        const delta = event.deltaY > 0 ? 0.9 : 1.1;
        setGlobalZoom(prev => {
          const newZoom = prev * delta;
          return Math.max(0.3, Math.min(3, newZoom));
        });
        
        // 同时更新所有区域的areaZoom，保持相对缩放比例
        setAreaZooms(prev => {
          const newAreaZooms = { ...prev };
          Object.keys(newAreaZooms).forEach(areaName => {
            // 保持areaZoom不变，因为这是相对缩放比例
          });
          return newAreaZooms;
        });
      }
    } catch (error) {
      console.error('全局缩放错误:', error);
    }
  }, []);

  // 全局缩放控制
  const handleGlobalReset = () => {
    setGlobalZoom(1);
    setAreaZooms({
      responsive1: 1,
      responsive2: 1,
      responsive3: 1,
      responsive4: 1
    });
    // 强制所有区域重置缩放状态
    setAreaZoom(1);
  };

  // 监听屏幕尺寸变化和全局滚轮事件
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setScreenInfo({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1200,
        isDesktop: width >= 1200
      });
      
      // 页面变宽时重置缩放以确保节点在视口中
      const prevWidth = screenInfo.width;
      if (width > prevWidth && width > 1200) {
        setGlobalZoom(1);
        setAreaZooms({
          responsive1: 1,
          responsive2: 1,
          responsive3: 1,
          responsive4: 1
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleGlobalWheel);
    };
  }, [screenInfo.width]);

  // 根据屏幕尺寸获取布局样式
  const getLayoutStyle = () => {
    if (screenInfo.isMobile) {
      return {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        height: 'calc(100vh - 180px)',
        overflow: 'auto'
      };
    } else if (screenInfo.isTablet) {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '8px',
        height: 'calc(100vh - 180px)',
        padding: '0 8px',
        boxSizing: 'border-box'
      };
    } else {
      return {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '8px',
        height: 'calc(100vh - 180px)',
        padding: '0 8px',
        boxSizing: 'border-box'
      };
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      padding: screenInfo.isMobile ? '8px' : '16px', 
      backgroundColor: '#f5f5f5',
      overflow: 'hidden'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ 
          margin: 0, 
          color: '#1890ff',
          fontSize: screenInfo.isMobile ? '18px' : '24px'
        }}>
          响应式拓扑图演示
        </h2>
        <p style={{ 
          margin: '8px 0 0 0', 
          color: '#666', 
          fontSize: screenInfo.isMobile ? '12px' : '14px' 
        }}>
          根据屏幕分辨率自动调整节点大小和布局，支持独立区域缩放和全局缩放
        </p>
        <p style={{ 
          margin: '4px 0 0 0', 
          color: '#1890ff', 
          fontSize: screenInfo.isMobile ? '11px' : '13px',
          fontWeight: 'bold'
        }}>
          🎯 拖拽节点到其他节点附近可交换位置
        </p>
        <div style={{ 
          marginTop: '8px', 
          fontSize: screenInfo.isMobile ? '10px' : '12px', 
          color: '#8c8c8c',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <span>📱 {screenInfo.width}x{screenInfo.height}</span>
          <span>💻 {screenInfo.isMobile ? '移动端' : screenInfo.isTablet ? '平板端' : '桌面端'}</span>
          <span>🔧 {screenInfo.isMobile ? '1列布局' : screenInfo.isTablet ? '2x2布局' : '4列布局'}</span>
          <span style={{ 
            color: '#1890ff',
            fontWeight: 'bold',
            marginLeft: '8px'
          }}>
            全局缩放: {Math.round(globalZoom * 100)}%
          </span>
        </div>
        
        {/* 全局缩放控制 */}
        <div style={{ 
          marginTop: '12px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: screenInfo.isMobile ? '12px' : '14px',
            color: '#262626',
            fontWeight: 'bold'
          }}>
            全局控制:
          </span>
          <button
            onClick={handleGlobalReset}
            style={{
              padding: '6px 12px',
              fontSize: screenInfo.isMobile ? '12px' : '14px',
              border: '1px solid #1890ff',
              borderRadius: '4px',
              backgroundColor: '#1890ff',
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#40a9ff';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#1890ff';
            }}
          >
            🔄 重置全部
          </button>
          <span style={{ 
            fontSize: screenInfo.isMobile ? '11px' : '12px', 
            color: '#1890ff',
            fontWeight: 'bold',
            marginLeft: '8px'
          }}>
            按住 Ctrl/Cmd + 滚轮 进行全局缩放
          </span>
          <span style={{ 
            fontSize: screenInfo.isMobile ? '10px' : '11px', 
            color: '#8c8c8c',
            marginLeft: '8px'
          }}>
            每个区域右上角有独立缩放控制
          </span>
        </div>
      </div>

      <div style={getLayoutStyle()}>
        <ResponsiveArea 
          title="区域1: 完全连接" 
          nodes={area1Nodes} 
          edges={area1Edges}
          bgColor="transparent"
          areaName="responsive1"
          globalZoom={globalZoom}
          onAreaZoomChange={handleAreaZoomChange}
          screenSize={screenInfo}
          currentAreaZoom={areaZooms.responsive1}
        />
        <ResponsiveArea 
          title="区域2: 部分连接" 
          nodes={area2Nodes} 
          edges={area2Edges}
          bgColor="transparent"
          areaName="responsive2"
          globalZoom={globalZoom}
          onAreaZoomChange={handleAreaZoomChange}
          screenSize={screenInfo}
          currentAreaZoom={areaZooms.responsive2}
        />
        <ResponsiveArea 
          title="区域3: 无连接" 
          nodes={area3Nodes} 
          edges={area3Edges}
          bgColor="transparent"
          areaName="responsive3"
          globalZoom={globalZoom}
          onAreaZoomChange={handleAreaZoomChange}
          screenSize={screenInfo}
          currentAreaZoom={areaZooms.responsive3}
        />
        <ResponsiveArea 
          title="区域4: 混合拓扑" 
          nodes={area4Nodes} 
          edges={area4Edges}
          bgColor="transparent"
          areaName="responsive4"
          globalZoom={globalZoom}
          onAreaZoomChange={handleAreaZoomChange}
          screenSize={screenInfo}
          currentAreaZoom={areaZooms.responsive4}
        />
      </div>
    </div>
  );
}

export default ResponsiveTopology;