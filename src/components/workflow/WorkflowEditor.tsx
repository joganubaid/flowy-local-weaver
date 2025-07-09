import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Play, Save } from 'lucide-react';
import { toast } from 'sonner';

import { HttpNode } from './nodes/HttpNode';
import { IfNode } from './nodes/IfNode';
import { FunctionNode } from './nodes/FunctionNode';
import { DelayNode } from './nodes/DelayNode';
import { WebhookNode } from './nodes/WebhookNode';
import { NotifyNode } from './nodes/NotifyNode';
import { NodePalette } from './NodePalette';
import { WorkflowExecutor } from '../../services/WorkflowExecutor';

const nodeTypes = {
  http: HttpNode,
  if: IfNode,
  function: FunctionNode,
  delay: DelayNode,
  webhook: WebhookNode,
  notify: NotifyNode,
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

interface WorkflowEditorProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
}

export const WorkflowEditor = ({ workflowId, onSave }: WorkflowEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((type: string) => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        config: getDefaultConfig(type),
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'http':
        return { method: 'GET', url: 'https://api.example.com/data' };
      case 'if':
        return { condition: 'data.status === "success"', trueOutput: 'success', falseOutput: 'failure' };
      case 'function':
        return { code: 'return { ...data, processed: true };' };
      case 'delay':
        return { duration: 1000 };
      case 'webhook':
        return { path: '/webhook', method: 'POST' };
      case 'notify':
        return { title: 'Notification', message: 'Workflow step completed', type: 'info' };
      default:
        return {};
    }
  };

  const saveWorkflow = useCallback(() => {
    const workflow = {
      id: workflowId || `workflow-${Date.now()}`,
      name: `Workflow ${new Date().toLocaleString()}`,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type as any,
        position: node.position,
        data: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const workflows = JSON.parse(localStorage.getItem('workflows') || '[]');
    const existingIndex = workflows.findIndex((w: any) => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem('workflows', JSON.stringify(workflows));
    onSave?.(workflow);
    toast.success('Workflow saved successfully!');
  }, [nodes, edges, workflowId, onSave]);

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes to execute the workflow');
      return;
    }

    setIsExecuting(true);
    try {
      const executor = new WorkflowExecutor();
      const result = await executor.execute({ nodes, edges });
      
      toast.success('Workflow executed successfully!');
      console.log('Execution result:', result);
    } catch (error) {
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Workflow Editor
        </h1>
        <div className="flex gap-2">
          <Button onClick={saveWorkflow} variant="outline" size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button 
            onClick={executeWorkflow} 
            disabled={isExecuting}
            size="sm"
          >
            <Play className="w-4 h-4 mr-2" />
            {isExecuting ? 'Running...' : 'Execute'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Node Palette */}
        <Card className="w-64 m-4 p-4 flex-shrink-0">
          <h3 className="font-semibold mb-4 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Node Palette
          </h3>
          <NodePalette onAddNode={addNode} />
        </Card>

        {/* Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="workflow-canvas"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};