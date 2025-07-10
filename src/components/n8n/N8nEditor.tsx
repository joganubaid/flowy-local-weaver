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
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Copy,
  Trash2,
  Eye,
  EyeOff,
  History,
  Share2,
  GitCommit,
  Workflow,
  TestTube,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  StopCircle,
  RefreshCw,
  ExternalLink,
  Home,
  FolderOpen,
  User,
  CreditCard,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

import { N8nWorkflowNode } from './nodes/N8nWorkflowNode';
import { N8nWorkflowExecutor } from '../../services/N8nWorkflowExecutor';

const nodeTypes = {
  'n8n-node': N8nWorkflowNode,
};

// Enhanced n8n-style node catalog with all categories
const nodeCategories = [
  {
    name: 'Triggers',
    icon: Zap,
    color: 'bg-green-500',
    nodes: [
      { name: 'Webhook', type: 'webhook', icon: Webhook, description: 'Listen for HTTP requests', category: 'Core' },
      { name: 'Schedule Trigger', type: 'schedule', icon: Calendar, description: 'Run on a schedule', category: 'Core' },
      { name: 'Manual Trigger', type: 'manual', icon: Play, description: 'Start workflow manually', category: 'Core' },
      { name: 'Email Trigger', type: 'emailTrigger', icon: Mail, description: 'Trigger on email', category: 'Communication' },
      { name: 'Form Trigger', type: 'formTrigger', icon: FileText, description: 'Trigger from form submission', category: 'Core' },
      { name: 'Chat Trigger', type: 'chatTrigger', icon: Users, description: 'Trigger from chat message', category: 'Communication' },
    ]
  },
  {
    name: 'Actions',
    icon: Globe,
    color: 'bg-blue-500',
    nodes: [
      { name: 'HTTP Request', type: 'httpRequest', icon: Globe, description: 'Make HTTP requests', category: 'Core' },
      { name: 'Code', type: 'code', icon: Code, description: 'Execute JavaScript/Python', category: 'Core' },
      { name: 'IF', type: 'if', icon: GitBranch, description: 'Conditional logic', category: 'Core' },
      { name: 'Wait', type: 'wait', icon: Clock, description: 'Add delays', category: 'Core' },
      { name: 'Set', type: 'set', icon: Settings, description: 'Set data values', category: 'Core' },
      { name: 'No Operation', type: 'noOp', icon: Settings, description: 'Do nothing', category: 'Core' },
      { name: 'Switch', type: 'switch', icon: GitBranch, description: 'Route data based on rules', category: 'Core' },
      { name: 'Merge', type: 'merge', icon: GitCommit, description: 'Merge data from multiple sources', category: 'Core' },
    ]
  },
  {
    name: 'Communication',
    icon: Mail,
    color: 'bg-orange-500',
    nodes: [
      { name: 'Gmail', type: 'gmail', icon: Mail, description: 'Send/receive emails', category: 'Google' },
      { name: 'Slack', type: 'slack', icon: Users, description: 'Team communication', category: 'Communication' },
      { name: 'Discord', type: 'discord', icon: Users, description: 'Gaming communication', category: 'Communication' },
      { name: 'Telegram', type: 'telegram', icon: Smartphone, description: 'Messaging', category: 'Communication' },
      { name: 'WhatsApp', type: 'whatsapp', icon: Smartphone, description: 'WhatsApp messaging', category: 'Communication' },
      { name: 'Microsoft Teams', type: 'microsoftTeams', icon: Users, description: 'Microsoft Teams', category: 'Microsoft' },
      { name: 'Zoom', type: 'zoom', icon: Video, description: 'Video conferencing', category: 'Communication' },
      { name: 'Twilio', type: 'twilio', icon: Smartphone, description: 'SMS and voice', category: 'Communication' },
    ]
  },
  {
    name: 'Productivity',
    icon: Calendar,
    color: 'bg-yellow-500',
    nodes: [
      { name: 'Google Calendar', type: 'googleCalendar', icon: Calendar, description: 'Manage events', category: 'Google' },
      { name: 'Notion', type: 'notion', icon: FileText, description: 'Note taking', category: 'Productivity' },
      { name: 'Trello', type: 'trello', icon: BarChart3, description: 'Project management', category: 'Productivity' },
      { name: 'Asana', type: 'asana', icon: BarChart3, description: 'Task management', category: 'Productivity' },
      { name: 'Monday.com', type: 'monday', icon: BarChart3, description: 'Work OS', category: 'Productivity' },
      { name: 'Jira', type: 'jira', icon: BarChart3, description: 'Issue tracking', category: 'Productivity' },
      { name: 'ClickUp', type: 'clickup', icon: BarChart3, description: 'All-in-one workspace', category: 'Productivity' },
      { name: 'Airtable', type: 'airtable', icon: Database, description: 'Collaborative database', category: 'Productivity' },
    ]
  },
  {
    name: 'Data & Storage',
    icon: Database,
    color: 'bg-purple-500',
    nodes: [
      { name: 'Google Sheets', type: 'googleSheets', icon: FileText, description: 'Read/write spreadsheets', category: 'Google' },
      { name: 'MySQL', type: 'mysql', icon: Database, description: 'Database operations', category: 'Database' },
      { name: 'PostgreSQL', type: 'postgres', icon: Database, description: 'PostgreSQL database', category: 'Database' },
      { name: 'MongoDB', type: 'mongodb', icon: Database, description: 'Document database', category: 'Database' },
      { name: 'Redis', type: 'redis', icon: Database, description: 'Key-value store', category: 'Database' },
      { name: 'Supabase', type: 'supabase', icon: Database, description: 'Open source Firebase', category: 'Database' },
      { name: 'AWS S3', type: 'awsS3', icon: Cloud, description: 'Object storage', category: 'AWS' },
      { name: 'Google Drive', type: 'googleDrive', icon: Folder, description: 'File storage', category: 'Google' },
    ]
  },
  {
    name: 'AI',
    icon: Bot,
    color: 'bg-pink-500',
    nodes: [
      { name: 'OpenAI', type: 'openai', icon: Bot, description: 'GPT models', category: 'AI' },
      { name: 'Anthropic', type: 'anthropic', icon: Bot, description: 'Claude AI', category: 'AI' },
      { name: 'Cohere', type: 'cohere', icon: Bot, description: 'Language AI', category: 'AI' },
      { name: 'Hugging Face', type: 'huggingFace', icon: Bot, description: 'ML models', category: 'AI' },
      { name: 'Embeddings', type: 'embeddings', icon: Bot, description: 'Vector embeddings', category: 'AI' },
      { name: 'Text Classifier', type: 'textClassifier', icon: Bot, description: 'Classify text', category: 'AI' },
      { name: 'Sentiment Analysis', type: 'sentimentAnalysis', icon: Bot, description: 'Analyze sentiment', category: 'AI' },
      { name: 'AI Agent', type: 'aiAgent', icon: Bot, description: 'AI agent workflow', category: 'AI' },
    ]
  },
  {
    name: 'E-commerce',
    icon: CreditCard,
    color: 'bg-indigo-500',
    nodes: [
      { name: 'Shopify', type: 'shopify', icon: CreditCard, description: 'E-commerce platform', category: 'E-commerce' },
      { name: 'WooCommerce', type: 'woocommerce', icon: CreditCard, description: 'WordPress e-commerce', category: 'E-commerce' },
      { name: 'Stripe', type: 'stripe', icon: CreditCard, description: 'Payment processing', category: 'Finance' },
      { name: 'PayPal', type: 'paypal', icon: CreditCard, description: 'Payment processing', category: 'Finance' },
      { name: 'Square', type: 'square', icon: CreditCard, description: 'Point of sale', category: 'Finance' },
    ]
  },
  {
    name: 'Marketing',
    icon: BarChart3,
    color: 'bg-emerald-500',
    nodes: [
      { name: 'Mailchimp', type: 'mailchimp', icon: Mail, description: 'Email marketing', category: 'Marketing' },
      { name: 'HubSpot', type: 'hubspot', icon: BarChart3, description: 'CRM and marketing', category: 'Marketing' },
      { name: 'Salesforce', type: 'salesforce', icon: BarChart3, description: 'CRM platform', category: 'Marketing' },
      { name: 'Facebook', type: 'facebook', icon: Users, description: 'Social media', category: 'Social' },
      { name: 'Twitter', type: 'twitter', icon: Users, description: 'Social media', category: 'Social' },
      { name: 'LinkedIn', type: 'linkedin', icon: Users, description: 'Professional network', category: 'Social' },
      { name: 'Google Analytics', type: 'googleAnalytics', icon: BarChart3, description: 'Web analytics', category: 'Google' },
    ]
  },
];

interface WorkflowSettings {
  timezone: string;
  saveDataSuccessExecution: string;
  saveDataErrorExecution: string;
  saveDataProgressExecution: boolean;
  executionTimeout: number;
  maxExecutionTimeout: number;
}

interface Credentials {
  id: string;
  name: string;
  type: string;
  data: any;
}

export const N8nEditor = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Triggers');
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [currentView, setCurrentView] = useState<'canvas' | 'executions' | 'settings'>('canvas');
  const [workflowSettings, setWorkflowSettings] = useState<WorkflowSettings>({
    timezone: 'UTC',
    saveDataSuccessExecution: 'all',
    saveDataErrorExecution: 'all',
    saveDataProgressExecution: false,
    executionTimeout: 1200,
    maxExecutionTimeout: 3600,
  });
  const [credentials, setCredentials] = useState<Credentials[]>([]);
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  const { fitView, getViewport } = useReactFlow();

  // Load workflows from localStorage
  useEffect(() => {
    const savedWorkflows = JSON.parse(localStorage.getItem('n8n-workflows') || '[]');
    setWorkflows(savedWorkflows);
    
    const savedCredentials = JSON.parse(localStorage.getItem('n8n-credentials') || '[]');
    setCredentials(savedCredentials);
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: '#64748b' },
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
        category: nodeData.category,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getNodeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      // Triggers
      webhook: '#FF6B6B', manual: '#F7DC6F', schedule: '#BB8FCE', emailTrigger: '#EA4335',
      formTrigger: '#4ECDC4', chatTrigger: '#45B7D1',
      // Actions
      httpRequest: '#4ECDC4', code: '#45B7D1', if: '#FFA07A', wait: '#98D8C8',
      set: '#87CEEB', noOp: '#D3D3D3', switch: '#FFB347', merge: '#DDA0DD',
      // Communication
      gmail: '#EA4335', slack: '#4A154B', discord: '#5865F2', telegram: '#0088CC',
      whatsapp: '#25D366', microsoftTeams: '#6264A7', zoom: '#2D8CFF', twilio: '#F22F46',
      // Productivity
      googleCalendar: '#4285F4', notion: '#000000', trello: '#0079BF', asana: '#F06A6A',
      monday: '#FF3D57', jira: '#0052CC', clickup: '#7B68EE', airtable: '#18BFFF',
      // Data & Storage
      googleSheets: '#34A853', mysql: '#4479A1', postgres: '#336791', mongodb: '#47A248',
      redis: '#DC382D', supabase: '#3ECF8E', awsS3: '#FF9900', googleDrive: '#4285F4',
      // AI
      openai: '#412991', anthropic: '#D2691E', cohere: '#FF6F00', huggingFace: '#FF6F00',
      embeddings: '#8A2BE2', textClassifier: '#9370DB', sentimentAnalysis: '#DA70D6',
      aiAgent: '#FF1493',
      // E-commerce
      shopify: '#96BF48', woocommerce: '#96588A', stripe: '#635BFF', paypal: '#00457C',
      square: '#3E4348',
      // Marketing
      mailchimp: '#FFE01B', hubspot: '#FF7A59', salesforce: '#00A1E0', facebook: '#1877F2',
      twitter: '#1DA1F2', linkedin: '#0A66C2', googleAnalytics: '#E37400',
    };
    return colors[type] || '#6B7280';
  };

  const getDefaultParameters = (type: string) => {
    const defaults: { [key: string]: any } = {
      webhook: { httpMethod: 'POST', path: '/webhook', responseMode: 'onReceived' },
      httpRequest: { method: 'GET', url: 'https://httpbin.org/get', sendQuery: false, sendHeaders: false },
      code: { mode: 'runOnceForAllItems', jsCode: 'return items;' },
      if: { conditions: { boolean: [], number: [], string: [{ value1: '', operation: 'equal', value2: '' }] } },
      wait: { amount: 1, unit: 'seconds' },
      manual: {},
      schedule: { rule: { interval: [{ field: 'cronExpression', value: '0 * * * *' }] } },
      set: { values: { number: [], boolean: [], string: [] } },
      switch: { mode: 'rules', rules: { rules: [] } },
      merge: { mode: 'append', output: 'input1' },
    };
    return defaults[type] || {};
  };

  const saveWorkflow = useCallback(() => {
    const workflow = {
      id: selectedWorkflow || `workflow-${Date.now()}`,
      name: workflowName,
      active: isWorkflowActive,
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
      settings: workflowSettings,
      staticData: {},
      tags: [],
      triggerCount: nodes.filter(n => ['webhook', 'manual', 'schedule', 'emailTrigger', 'formTrigger', 'chatTrigger'].includes(n.data.nodeType)).length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedWorkflows = [...workflows];
    const existingIndex = updatedWorkflows.findIndex((w: any) => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      updatedWorkflows[existingIndex] = workflow;
    } else {
      updatedWorkflows.push(workflow);
    }
    
    setWorkflows(updatedWorkflows);
    localStorage.setItem('n8n-workflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow saved successfully!');
    setSelectedWorkflow(workflow.id);
  }, [nodes, edges, workflowName, isWorkflowActive, workflowSettings, workflows, selectedWorkflow]);

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
      
      setExecutionHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50 executions
      toast.success('Workflow executed successfully!');
      
      // Update node execution status
      setNodes(nds => nds.map(node => ({
        ...node,
        data: {
          ...node.data,
          executionStatus: result.nodeResults[node.id]?.success ? 'success' : 'error',
          executionData: result.nodeResults[node.id]?.data,
        }
      })));
      
    } catch (error) {
      toast.error(`Workflow execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Execution error:', error);
    } finally {
      setIsExecuting(false);
    }
  }, [nodes, edges, setNodes]);

  const filteredNodes = nodeCategories
    .find(cat => cat.name === selectedCategory)
    ?.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.category.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const loadWorkflow = (workflow: any) => {
    const loadedNodes = workflow.nodes.map((node: any) => ({
      id: node.id,
      type: 'n8n-node',
      position: { x: node.position[0], y: node.position[1] },
      data: {
        label: node.name,
        nodeType: node.type,
        icon: nodeCategories.flatMap(cat => cat.nodes).find(n => n.type === node.type)?.icon || Globe,
        color: getNodeColor(node.type),
        parameters: node.parameters,
        description: nodeCategories.flatMap(cat => cat.nodes).find(n => n.type === node.type)?.description || '',
      },
    }));

    const loadedEdges: Edge[] = [];
    Object.entries(workflow.connections || {}).forEach(([sourceId, connections]: [string, any]) => {
      connections.main?.[0]?.forEach((conn: any, index: number) => {
        loadedEdges.push({
          id: `${sourceId}-${conn.node}-${index}`,
          source: sourceId,
          target: conn.node,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { strokeWidth: 2, stroke: '#64748b' },
        });
      });
    });

    setNodes(loadedNodes);
    setEdges(loadedEdges);
    setWorkflowName(workflow.name);
    setIsWorkflowActive(workflow.active || false);
    setWorkflowSettings(workflow.settings || workflowSettings);
    setSelectedWorkflow(workflow.id);
    toast.success(`Workflow "${workflow.name}" loaded`);
  };

  const createNewWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('My Workflow');
    setIsWorkflowActive(false);
    setSelectedWorkflow(null);
    setExecutionHistory([]);
    toast.success('New workflow created');
  };

  const duplicateWorkflow = () => {
    if (nodes.length === 0) return;
    
    const newWorkflow = {
      id: `workflow-${Date.now()}`,
      name: `${workflowName} Copy`,
      active: false,
      nodes: nodes.map(node => ({ ...node.data, id: node.id, type: node.data.nodeType, position: node.position })),
      connections: edges,
      settings: workflowSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const updatedWorkflows = [...workflows, newWorkflow];
    setWorkflows(updatedWorkflows);
    localStorage.setItem('n8n-workflows', JSON.stringify(updatedWorkflows));
    toast.success('Workflow duplicated');
  };

  const exportWorkflow = () => {
    if (nodes.length === 0) return;
    
    const workflow = {
      name: workflowName,
      nodes: nodes.map(node => ({ ...node.data, id: node.id, type: node.data.nodeType, position: node.position })),
      connections: edges,
      settings: workflowSettings,
    };
    
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflowName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - Node Palette */}
      {currentView === 'canvas' && (
        <Card className="w-80 m-4 flex flex-col border-r">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Plus className="w-5 h-5" />
                Add Nodes
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(true)}>
                <FileText className="w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search 400+ nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
              <TabsList className="grid grid-cols-2 mb-4 h-auto">
                {nodeCategories.map((category) => (
                  <TabsTrigger
                    key={category.name}
                    value={category.name}
                    className="text-xs p-2 flex flex-col gap-1"
                  >
                    <category.icon className="w-3 h-3" />
                    <span className="text-[10px]">{category.name}</span>
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
                            className="w-full justify-start h-auto p-3 hover:shadow-md transition-all hover:border-primary/50"
                            onClick={() => addNode(node)}
                          >
                            <div className="flex items-start space-x-3 w-full">
                              <div 
                                className="p-1.5 rounded-md flex-shrink-0"
                                style={{ backgroundColor: getNodeColor(node.type) + '20' }}
                              >
                                <IconComponent 
                                  className="w-4 h-4" 
                                  style={{ color: getNodeColor(node.type) }}
                                />
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{node.name}</div>
                                <div className="text-xs text-muted-foreground line-clamp-2">
                                  {node.description}
                                </div>
                                <Badge variant="secondary" className="text-[10px] mt-1">
                                  {node.category}
                                </Badge>
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
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between p-4 border-b bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('canvas')}>
                <Workflow className="w-4 h-4 mr-2" />
                Canvas
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('executions')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Executions
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentView('settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
            
            {currentView === 'canvas' && (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="text-xl font-bold bg-transparent border-none outline-none p-0 h-auto"
                />
                <Badge variant={isWorkflowActive ? "default" : "secondary"}>
                  {isWorkflowActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {currentView === 'canvas' && (
              <>
                <Button variant="outline" size="sm" onClick={createNewWorkflow}>
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
                <Button variant="outline" size="sm" onClick={saveWorkflow}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={exportWorkflow}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  onClick={executeWorkflow} 
                  disabled={isExecuting}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isExecuting ? 'Executing...' : 'Test workflow'}
                </Button>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isWorkflowActive}
                    onCheckedChange={setIsWorkflowActive}
                  />
                  <Label className="text-sm">Active</Label>
                </div>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => setShowCredentials(true)}>
              <Key className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main Canvas/Content */}
        <div className="flex-1 relative">
          {currentView === 'canvas' && (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="bg-slate-50 dark:bg-slate-900"
              snapToGrid
              snapGrid={[20, 20]}
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
              <Panel position="top-left" className="bg-background/90 backdrop-blur-sm border rounded-lg p-3">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{nodes.length} nodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>{edges.length} connections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isWorkflowActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span>{isWorkflowActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </Panel>

              {/* Workflow Actions Panel */}
              <Panel position="top-right" className="bg-background/90 backdrop-blur-sm border rounded-lg p-2">
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => fitView()}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={duplicateWorkflow}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </Panel>
            </ReactFlow>
          )}

          {currentView === 'executions' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Executions</h2>
                <p className="text-muted-foreground">View workflow execution history and results</p>
              </div>

              <div className="space-y-4">
                {executionHistory.length === 0 ? (
                  <Card className="p-12 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No executions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Run your workflow to see execution history and results
                    </p>
                    <Button onClick={() => setCurrentView('canvas')}>
                      <Play className="w-4 h-4 mr-2" />
                      Go to Canvas
                    </Button>
                  </Card>
                ) : (
                  executionHistory.map((execution, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            execution.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {execution.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium">
                              {execution.success ? 'Successful execution' : 'Failed execution'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(execution.executedAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{execution.duration}ms</div>
                          <div className="text-sm text-muted-foreground">
                            {execution.nodesExecuted} nodes
                          </div>
                        </div>
                      </div>
                      
                      {execution.nodeResults && (
                        <div className="mt-3 space-y-2">
                          <Label className="text-sm font-medium">Node Results:</Label>
                          <div className="bg-muted rounded p-3 font-mono text-xs max-h-32 overflow-y-auto">
                            {JSON.stringify(execution.nodeResults, null, 2)}
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Workflow Settings</h2>
                <p className="text-muted-foreground">Configure workflow execution settings</p>
              </div>

              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>Execution Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={workflowSettings.timezone} onValueChange={(value) => 
                      setWorkflowSettings(prev => ({ ...prev, timezone: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New_York</SelectItem>
                        <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                        <SelectItem value="Europe/London">Europe/London</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Save Data of Successful Executions</Label>
                    <Select value={workflowSettings.saveDataSuccessExecution} onValueChange={(value) => 
                      setWorkflowSettings(prev => ({ ...prev, saveDataSuccessExecution: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Save all data</SelectItem>
                        <SelectItem value="none">Save no data</SelectItem>
                        <SelectItem value="progress">Save progress only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Save Data of Error Executions</Label>
                    <Select value={workflowSettings.saveDataErrorExecution} onValueChange={(value) => 
                      setWorkflowSettings(prev => ({ ...prev, saveDataErrorExecution: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Save all data</SelectItem>
                        <SelectItem value="none">Save no data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={workflowSettings.saveDataProgressExecution}
                      onCheckedChange={(checked) => 
                        setWorkflowSettings(prev => ({ ...prev, saveDataProgressExecution: checked }))
                      }
                    />
                    <Label>Save progress data during execution</Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Execution Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value={workflowSettings.executionTimeout}
                      onChange={(e) => 
                        setWorkflowSettings(prev => ({ ...prev, executionTimeout: parseInt(e.target.value) || 1200 }))
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Workflows Sidebar */}
      <Card className="w-80 m-4 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FolderOpen className="w-5 h-5" />
            Workflows
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {workflows.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No workflows yet</p>
                <p className="text-xs">Create your first workflow</p>
              </div>
            ) : (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <Card 
                    key={workflow.id} 
                    className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedWorkflow === workflow.id ? 'border-primary bg-muted/30' : ''
                    }`}
                    onClick={() => loadWorkflow(workflow)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-sm truncate">{workflow.name}</div>
                      <Badge variant={workflow.active ? "default" : "secondary"} className="text-xs">
                        {workflow.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Nodes: {workflow.nodes?.length || 0}</div>
                      <div>Triggers: {workflow.triggerCount || 0}</div>
                      <div>Updated: {new Date(workflow.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>n8n Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="environment">Environment</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Timezone</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Log Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select log level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="users">
              <p className="text-muted-foreground">User management features coming soon...</p>
            </TabsContent>
            <TabsContent value="environment">
              <p className="text-muted-foreground">Environment configuration features coming soon...</p>
            </TabsContent>
            <TabsContent value="security">
              <p className="text-muted-foreground">Security settings features coming soon...</p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credentials</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Manage your credentials for external services
            </div>
            {credentials.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No credentials configured</p>
              </div>
            ) : (
              <div className="space-y-2">
                {credentials.map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{cred.name}</div>
                      <div className="text-sm text-muted-foreground">{cred.type}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Credential
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Workflow Templates</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Lead Generation', description: 'Capture leads from forms', nodes: 3 },
              { name: 'Email Automation', description: 'Automated email campaigns', nodes: 5 },
              { name: 'Data Sync', description: 'Sync data between apps', nodes: 4 },
              { name: 'Social Media', description: 'Post to social platforms', nodes: 6 },
              { name: 'Invoice Processing', description: 'Process and track invoices', nodes: 7 },
              { name: 'Customer Support', description: 'Automated support tickets', nodes: 8 },
            ].map((template) => (
              <Card key={template.name} className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-medium mb-2">{template.name}</div>
                <div className="text-sm text-muted-foreground mb-3">{template.description}</div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{template.nodes} nodes</Badge>
                  <Button size="sm">Use Template</Button>
                </div>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};