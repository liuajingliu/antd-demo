import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

const SankeyDiagram = ({ data, width = 800, height = 320 }) => {
  const chartRef = useRef(null);

  // 将数据转换为ECharts桑基图所需的格式
  const getSankeyOption = () => {
    if (!data || !data.nodes || !data.links) return {};

    return {
      title: {
        text: '用户访问路径',
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove'
      },
      series: [
        {
          type: 'sankey',
          data: data.nodes.map(node => ({
            name: node.name
          })),
          links: data.links.map(link => ({
            source: data.nodes[link.source].name,
            target: data.nodes[link.target].name,
            value: link.value
          })),
          emphasis: {
            focus: 'adjacency'
          },
          lineStyle: {
            color: 'gradient',
            curveness: 0.5
          },
          itemStyle: {
            color: '#1f77b4',
            borderColor: '#1f77b4'
          },
          label: {
            position: 'right',
            fontSize: 12
          },
          left: '10%',
          right: '20%',
          nodeWidth: 20,
          nodeGap: 8,
          layoutIterations: 32
        }
      ]
    };
  };

  return (
    <ReactECharts
      ref={chartRef}
      option={getSankeyOption()}
      style={{ width: '100%', height: '100%' }}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default SankeyDiagram;