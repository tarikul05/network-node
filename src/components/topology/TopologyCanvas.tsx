'use client';

import { useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { useTopologyStore, useUIStore } from '@/store';
import { generateTopology, applyTierLayout } from '@/lib/topology/generator';

// Design spec colors
const CANVAS_BG = '#0a3a5f';

export function TopologyCanvas() {
  const { routers, unknownPeers } = useTopologyStore();
  const { showMinimap, showGrid, selectRouter, selectConnection } = useUIStore();
  
  // Generate topology from routers
  const { initialNodes, initialEdges } = useMemo(() => {
    if (routers.length === 0) {
      return { initialNodes: [], initialEdges: [] };
    }
    
    const { nodes, edges } = generateTopology(routers);
    const layoutedNodes = applyTierLayout(nodes, edges);
    
    return { initialNodes: layoutedNodes, initialEdges: edges };
  }, [routers]);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes/edges when routers change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);
  
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type === 'router') {
      selectRouter(node.id);
    }
  }, [selectRouter]);
  
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    selectConnection(edge.id);
  }, [selectConnection]);
  
  const onPaneClick = useCallback(() => {
    selectRouter(null);
    selectConnection(null);
  }, [selectRouter, selectConnection]);

  // Empty state
  if (routers.length === 0) {
    return (
      <div 
        className="h-full flex items-center justify-center"
        style={{ backgroundColor: CANVAS_BG }}
      >
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">No topology yet</h3>
          <p className="mt-1 text-sm text-white/60">
            Upload router configuration files to visualize your network
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full" style={{ backgroundColor: CANVAS_BG }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        attributionPosition="bottom-left"
        style={{ backgroundColor: CANVAS_BG }}
        onlyRenderVisibleElements
      >
        {showGrid && (
          <Background color="rgba(255,255,255,0.1)" gap={20} size={1} />
        )}
        <Controls />
        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'router':
                  return '#f2c94c';
                case 'remoteRouter':
                  return '#9ca3af';
                case 'internet':
                case 'cloud':
                  return '#8b5cf6';
                case 'network':
                  return '#22c55e';
                case 'site':
                  return '#1e88c8';
                default:
                  return '#6b7280';
              }
            }}
            maskColor="rgba(10, 58, 95, 0.8)"
            style={{ backgroundColor: '#0a3a5f' }}
          />
        )}
      </ReactFlow>
    </div>
  );
}
