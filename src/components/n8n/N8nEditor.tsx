import { useState, useEffect, useCallback } from 'react';
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
  Panel,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Save, 
  Upload, 
  Download, 
  Settings, 
  Zap,
  Plus,
  Globe,
  Code,
  GitBranch,
  Clock,
  Webhook,
  Bell,
  Database,
  Mail,
  Calendar,
  Search,
  Filter,
  BarChart3,
  FileText,
  Image,
  Music,
  Video,
  Folder,
  Users,
  Shield,
  Key,
  Cpu,
  Server,
  Cloud,
  Smartphone,
  MonitorSpeaker,
  Bot,
} from 'lucide-react';
import { toast } from 'sonner';

import { N8nWorkflowNode } from './nodes/N8nWorkflowNode';
import { N8nWorkflowExecutor } from '../../services/N8nWorkflowExecutor';

const nodeTypes = {
  'n8n-node': N8nWorkflowNode,
};

// n8n-style node catalog
const nodeCategories = [
  {
    name: 'Triggers',
    icon: Zap,
    color: 'bg-green-500',
    nodes: [
      { name: 'Webhook', type: 'webhook', icon: Webhook, description: 'Listen for HTTP requests' },
      { name: 'Schedule Trigger', type: 'schedule', icon: Calendar, description: 'Run on a schedule' },
      { name: 'Manual Trigger', type: 'manual', icon: Play, description: 'Start workflow manually' },
      { name: 'Email Trigger', type: 'emailTrigger', icon: Mail, description: 'Trigger on email' },
    ]
  },
  {
    name: 'Regular',
    icon: Globe,
    color: 'bg-blue-500',
    nodes: [
      { name: 'HTTP Request', type: 'httpRequest', icon: Globe, description: 'Make HTTP requests' },
      { name: 'Code', type: 'code', icon: Code, description: 'Execute JavaScript/Python' },
      { name: 'IF', type: 'if', icon: GitBranch, description: 'Conditional logic' },
      { name: 'Wait', type: 'wait', icon: Clock, description: 'Add delays' },
      { name: 'Set', type: 'set', icon: Settings, description: 'Set data values' },
      { name: 'No Operation', type: 'noOp', icon: Settings, description: 'Do nothing' },
    ]
  },
  {
    name: 'Data & Storage',
    icon: Database,
    color: 'bg-purple-500',
    nodes: [
      { name: 'Google Sheets', type: 'googleSheets', icon: FileText, description: 'Read/write spreadsheets' },
      { name: 'MySQL', type: 'mysql', icon: Database, description: 'Database operations' },
      { name: 'MongoDB', type: 'mongodb', icon: Database, description: 'Document database' },
      { name: 'Redis', type: 'redis', icon: Database, description: 'Key-value store' },
    ]
  },
  {
    name: 'Communication',
    icon: Mail,
    color: 'bg-orange-500',
    nodes: [
      { name: 'Gmail', type: 'gmail', icon: Mail, description: 'Send/receive emails' },
      { name: 'Slack', type: 'slack', icon: Users, description: 'Team communication' },
      { name: 'Discord', type: 'discord', icon: Users, description: 'Gaming communication' },
      { name: 'Telegram', type: 'telegram', icon: Smartphone, description: 'Messaging' },
    ]
  },
  {
    name: 'Productivity',
    icon: Calendar,
    color: 'bg-yellow-500',
    nodes: [
      { name: 'Google Calendar', type: 'googleCalendar', icon: Calendar, description: 'Manage events' },
      { name: 'Notion', type: 'notion', icon: FileText, description: 'Note taking' },
      { name: 'Trello', type: 'trello', icon: BarChart3, description: 'Project management' },
      { name: 'Asana', type: 'asana', icon: BarChart3, description: 'Task management' },
    ]
  },
  {
    name: 'AI',
    icon: Bot,
    color: 'bg-pink-500',
    nodes: [
      { name: 'OpenAI', type: 'openai', icon: Bot, description: 'AI text generation' },
      { name: 'Anthropic', type: 'anthropic', icon: Bot, description: 'Claude AI' },
      { name: 'Embeddings', type: 'embeddings', icon: Bot, description: 'Vector embeddings' },
      { name: 'Text Classifier', type: 'textClassifier', icon: Bot, description: 'Classify text' },
    ]
  },
];

interface N8nEditorProps {
  workflowId?: string;
  onSave?: (workflow: any) => void;
}

export const N8nEditor = ({ workflowId, onSave }: N8nEditorProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Triggers');
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addNode = useCallback((nodeData: any) => {
    const newNode: Node = {
      id: `${nodeData.type}-${Date.now()}`,
      type: 'n8n-node',
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: nodeData.name,
        nodeType: nodeData.type,
        icon: nodeData.icon,
        color: getNodeColor(nodeData.type),
        parameters: getDefaultParameters(nodeData.type),
        description: nodeData.description,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getNodeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      webhook: '#FF6B6B',
      httpRequest: '#4ECDC4',
      code: '#45B7D1',
      if: '#FFA07A',
      wait: '#98D8C8',
      manual: '#F7DC6F',
      schedule: '#BB8FCE',
      gmail: '#EA4335',
      slack: '#4A154B',
      googleSheets: '#34A853',
      mysql: '#4479A1',
      openai: '#412991',
    };
    return colors[type] || '#6B7280';
  };

  const getDefaultParameters = (type: string) => {
    const defaults: { [key: string]: any } = {
      webhook: { httpMethod: 'POST', path: '/webhook' },
      httpRequest: { method: 'GET', url: 'https://httpbin.org/get' },
      code: { mode: 'runOnceForAllItems', jsCode: 'return items;' },
      if: { conditions: { string: [{ value1: '', operation: 'equal', value2: '' }] } },
      wait: { amount: 1, unit: 'seconds' },
      manual: {},
      schedule: { rule: { interval: [{ field: 'cronExpression', value: '0 * * * *' }] } },
    };
    return defaults[type] || {};
  };

  const saveWorkflow = useCallback(() => {
    const workflow = {
      id: workflowId || `workflow-${Date.now()}`,
      name: workflowName,
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.data.label,
        type: node.data.nodeType,
        typeVersion: 1,
        position: [node.position.x, node.position.y],
        parameters: node.data.parameters,
      })),
      connections: edges.reduce((acc, edge) => {
        if (!acc[edge.source]) {
          acc[edge.source] = { main: [[{ node: edge.target, type: 'main', index: 0 }]] };
        } else if (!acc[edge.source].main) {
          acc[edge.source].main = [[{ node: edge.target, type: 'main', index: 0 }]];
        } else {
          acc[edge.source].main[0].push({ node: edge.target, type: 'main', index: 0 });
        }
        return acc;
      }, {} as any),
      active: false,
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage (simulating n8n's storage)
    const workflows = JSON.parse(localStorage.getItem('n8n-workflows') || '[]');
    const existingIndex = workflows.findIndex((w: any) => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem('n8n-workflows', JSON.stringify(workflows));
    onSave?.(workflow);
    toast.success('Workflow saved successfully!');
  }, [nodes, edges, workflowId, workflowName, onSave]);

  const executeWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Add some nodes to execute the workflow');
      return;
    }

    setIsExecuting(true);
    try {
      const executor = new N8nWorkflowExecutor();
      const result = await executor.execute({
        nodes: nodes.map(node => ({
          ...node.data,
          id: node.id,
          type: node.data.nodeType,
          position: node.position,
        })),
        edges,
      });
      
      setExecutionHistory(prev => [result, ...prev.slice(0, 9)]);
      toast.success('Workflow executed successfully!');
      console.log('Execution result:', result);
    } catch (error) {
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges]);

  const filteredNodes = nodeCategories
    .find(cat => cat.name === selectedCategory)
    ?.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Node Palette */}
      <Card className="w-80 m-4 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="w-5 h-5" />
            Add Nodes
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
            />
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-2 mb-4">
              {nodeCategories.slice(0, 6).map((category, idx) => (
                <TabsTrigger
                  key={category.name}
                  value={category.name}
                  className="text-xs p-2"
                >
                  <category.icon className="w-3 h-3 mr-1" />
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <ScrollArea className="flex-1">
              {nodeCategories.map((category) => (
                <TabsContent key={category.name} value={category.name} className="mt-0">
                  <div className="space-y-2">
                    {filteredNodes.map((node) => {
                      const IconComponent = node.icon;
                      return (
                        <Button
                          key={node.type}
                          variant="outline"
                          className="w-full justify-start h-auto p-3 hover:shadow-md transition-all"
                          onClick={() => addNode(node)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            <div 
                              className="p-1.5 rounded-md"
                              style={{ backgroundColor: getNodeColor(node.type) + '20' }}
                            >
                              <IconComponent 
                                className="w-4 h-4" 
                                style={{ color: getNodeColor(node.type) }}
                              />
                            </div>
                            <div className="text-left flex-1">
                              <div className="font-medium text-sm">{node.name}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {node.description}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-xl font-bold bg-transparent border-none outline-none"
            />
            <Badge variant="secondary">Draft</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveWorkflow}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button 
              onClick={executeWorkflow} 
              disabled={isExecuting}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isExecuting ? 'Executing...' : 'Execute'}
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

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
            className="bg-slate-50"
          >
            <Background color="#e2e8f0" gap={20} />
            <Controls position="bottom-right" />
            <MiniMap 
              position="bottom-left"
              className="bg-background border border-border"
              zoomable
              pannable
            />
            
            {/* Canvas Status Panel */}
            <Panel position="top-left" className="bg-background/80 backdrop-blur-sm border rounded-lg p-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{nodes.length} nodes</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{edges.length} connections</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Right Sidebar - Execution History */}
      <Card className="w-80 m-4 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="w-5 h-5" />
            Executions
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {executionHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No executions yet</p>
                <p className="text-xs">Run your workflow to see results</p>
              </div>
            ) : (
              <div className="space-y-3">
                {executionHistory.map((execution, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge 
                        variant={execution.success ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {execution.success ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(execution.executedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium mb-1">
                        Duration: {execution.duration || 'N/A'}ms
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {execution.nodesExecuted || 0} nodes executed
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};