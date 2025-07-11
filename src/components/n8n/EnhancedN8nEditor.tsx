import React, { useState, useCallback, useEffect } from 'react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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
  Users,
  Shield,
  Bot,
  Copy,
  Trash2,
  Eye,
  History,
  User,
  LogOut,
  HelpCircle,
  Sparkles,
  Workflow,
  CreditCard,
  Cpu,
  Server,
  Cloud,
  Smartphone,
  Video,
  Folder,
  RefreshCw,
  TestTube,
  CheckCircle2,
  XCircle,
  Pause,
  StopCircle,
  ExternalLink,
  Home,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { useAuth } from '@/components/auth/AuthProvider';
import { AuthPage } from '@/components/auth/AuthPage';
import { WorkflowExpressionEditor } from '@/components/workflow/WorkflowExpressionEditor';
import { WorkflowTemplates } from '@/components/workflow/WorkflowTemplates';
import { OnboardingTour } from '@/components/workflow/OnboardingTour';
import { N8nWorkflowNode } from './nodes/N8nWorkflowNode';
import { N8nWorkflowExecutor } from '../../services/N8nWorkflowExecutor';
import { supabase } from '@/integrations/supabase/client';

const nodeTypes = {
  'n8n-node': N8nWorkflowNode,
};

// Enhanced node catalog with better organization
const nodeCategories = [
  {
    name: 'Triggers',
    icon: Zap,
    color: 'hsl(var(--node-webhook))',
    nodes: [
      { name: 'Manual Trigger', type: 'manual', icon: Play, description: 'Start workflow manually', category: 'Core' },
      { name: 'Webhook', type: 'webhook', icon: Webhook, description: 'Listen for HTTP requests', category: 'Core' },
      { name: 'Schedule Trigger', type: 'schedule', icon: Calendar, description: 'Run on a schedule', category: 'Core' },
      { name: 'Email Trigger', type: 'emailTrigger', icon: Mail, description: 'Trigger on email received', category: 'Communication' },
      { name: 'Form Trigger', type: 'formTrigger', icon: FileText, description: 'Trigger from form submission', category: 'Core' },
      { name: 'Chat Trigger', type: 'chatTrigger', icon: Users, description: 'Trigger from chat message', category: 'Communication' },
    ]
  },
  {
    name: 'Actions',
    icon: Globe,
    color: 'hsl(var(--node-http))',
    nodes: [
      { name: 'HTTP Request', type: 'httpRequest', icon: Globe, description: 'Make HTTP requests to APIs', category: 'Core' },
      { name: 'Code', type: 'code', icon: Code, description: 'Execute JavaScript/Python code', category: 'Core' },
      { name: 'IF', type: 'if', icon: GitBranch, description: 'Conditional logic branching', category: 'Core' },
      { name: 'Switch', type: 'switch', icon: GitBranch, description: 'Route data based on rules', category: 'Core' },
      { name: 'Wait', type: 'wait', icon: Clock, description: 'Add delays to workflow', category: 'Core' },
      { name: 'Set', type: 'set', icon: Settings, description: 'Set or transform data values', category: 'Core' },
      { name: 'Merge', type: 'merge', icon: GitBranch, description: 'Merge data from multiple sources', category: 'Core' },
      { name: 'No Operation', type: 'noOp', icon: Settings, description: 'Placeholder node', category: 'Core' },
    ]
  },
  {
    name: 'AI & ML',
    icon: Bot,
    color: 'hsl(var(--node-function))',
    nodes: [
      { name: 'OpenAI', type: 'openai', icon: Bot, description: 'GPT models and AI completion', category: 'AI' },
      { name: 'Anthropic Claude', type: 'anthropic', icon: Bot, description: 'Claude AI assistant', category: 'AI' },
      { name: 'Embeddings', type: 'embeddings', icon: Sparkles, description: 'Generate vector embeddings', category: 'AI' },
      { name: 'Text Classifier', type: 'textClassifier', icon: Bot, description: 'Classify and categorize text', category: 'AI' },
      { name: 'Sentiment Analysis', type: 'sentimentAnalysis', icon: Bot, description: 'Analyze text sentiment', category: 'AI' },
      { name: 'AI Agent', type: 'aiAgent', icon: Bot, description: 'Multi-step AI reasoning', category: 'AI' },
    ]
  },
  {
    name: 'Communication',
    icon: Mail,
    color: 'hsl(var(--node-notify))',
    nodes: [
      { name: 'Gmail', type: 'gmail', icon: Mail, description: 'Send and receive emails', category: 'Google' },
      { name: 'Slack', type: 'slack', icon: Users, description: 'Team communication platform', category: 'Communication' },
      { name: 'Discord', type: 'discord', icon: Users, description: 'Gaming and community chat', category: 'Communication' },
      { name: 'Telegram', type: 'telegram', icon: Smartphone, description: 'Instant messaging', category: 'Communication' },
      { name: 'Microsoft Teams', type: 'microsoftTeams', icon: Users, description: 'Microsoft team collaboration', category: 'Microsoft' },
      { name: 'Twilio', type: 'twilio', icon: Smartphone, description: 'SMS and voice communications', category: 'Communication' },
    ]
  },
  {
    name: 'Data & Storage',
    icon: Database,
    color: 'hsl(var(--node-delay))',
    nodes: [
      { name: 'Google Sheets', type: 'googleSheets', icon: FileText, description: 'Read and write spreadsheets', category: 'Google' },
      { name: 'PostgreSQL', type: 'postgres', icon: Database, description: 'PostgreSQL database operations', category: 'Database' },
      { name: 'Supabase', type: 'supabase', icon: Database, description: 'Supabase backend operations', category: 'Database' },
      { name: 'AWS S3', type: 'awsS3', icon: Cloud, description: 'Amazon S3 object storage', category: 'AWS' },
      { name: 'Google Drive', type: 'googleDrive', icon: Folder, description: 'Google Drive file operations', category: 'Google' },
      { name: 'Airtable', type: 'airtable', icon: Database, description: 'Collaborative database platform', category: 'Productivity' },
    ]
  },
  {
    name: 'Productivity',
    icon: Calendar,
    color: 'hsl(var(--node-function))',
    nodes: [
      { name: 'Google Calendar', type: 'googleCalendar', icon: Calendar, description: 'Manage calendar events', category: 'Google' },
      { name: 'Notion', type: 'notion', icon: FileText, description: 'All-in-one workspace', category: 'Productivity' },
      { name: 'Trello', type: 'trello', icon: BarChart3, description: 'Project management boards', category: 'Productivity' },
      { name: 'Asana', type: 'asana', icon: BarChart3, description: 'Task and project management', category: 'Productivity' },
      { name: 'Jira', type: 'jira', icon: BarChart3, description: 'Issue and project tracking', category: 'Productivity' },
    ]
  },
];

interface SavedWorkflow {
  id: string;
  name: string;
  description?: string;
  workflow_data: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EnhancedN8nEditor = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Triggers');
  const [searchTerm, setSearchTerm] = useState('');
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [currentWorkflowId, setCurrentWorkflowId] = useState<string | null>(null);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [isWorkflowActive, setIsWorkflowActive] = useState(false);
  
  // Dialog states
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showExpressionEditor, setShowExpressionEditor] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWorkflowsList, setShowWorkflowsList] = useState(false);
  
  const [currentView, setCurrentView] = useState<'canvas' | 'executions' | 'settings'>('canvas');
  const [expressionValue, setExpressionValue] = useState('');
  const [selectedNodeForExpression, setSelectedNodeForExpression] = useState<string | null>(null);

  const { fitView } = useReactFlow();

  // Load user workflows on mount
  useEffect(() => {
    if (user) {
      loadUserWorkflows();
      // Show onboarding for new users
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
        localStorage.setItem('hasSeenOnboarding', 'true');
      }
    }
  }, [user]);

  const loadUserWorkflows = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setSavedWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error loading workflows",
        description: "Failed to load your saved workflows",
        variant: "destructive"
      });
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      const edge = {
        ...params,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { strokeWidth: 2, stroke: 'hsl(var(--border))' },
        className: 'workflow-edge',
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
      className: `workflow-node workflow-node--${nodeData.type}`,
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const getNodeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      // Triggers
      webhook: 'hsl(var(--node-webhook))',
      manual: 'hsl(var(--primary))',
      schedule: 'hsl(var(--node-delay))',
      // Actions  
      httpRequest: 'hsl(var(--node-http))',
      code: 'hsl(var(--node-function))',
      if: 'hsl(var(--node-logic))',
      wait: 'hsl(var(--node-delay))',
      // Communication
      gmail: '#EA4335',
      slack: '#4A154B',
      discord: '#5865F2',
      // AI
      openai: '#10A37F',
      anthropic: '#D2691E',
      // Default
      default: 'hsl(var(--muted))',
    };
    return colorMap[type] || colorMap.default;
  };

  const getDefaultParameters = (type: string) => {
    const defaults: { [key: string]: any } = {
      webhook: { httpMethod: 'POST', path: '/webhook', responseMode: 'onReceived' },
      httpRequest: { method: 'GET', url: '', sendQuery: false, sendHeaders: false },
      code: { mode: 'runOnceForAllItems', jsCode: 'return items;' },
      if: { conditions: { string: [{ value1: '', operation: 'equal', value2: '' }] } },
      wait: { amount: 1, unit: 'seconds' },
      manual: {},
      schedule: { rule: { interval: [{ field: 'cronExpression', value: '0 * * * *' }] } },
      set: { values: { string: [], number: [], boolean: [] } },
      switch: { mode: 'rules', rules: [] },
      merge: { mode: 'append' },
    };
    return defaults[type] || {};
  };

  const saveWorkflow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save workflows",
        variant: "destructive"
      });
      return;
    }

    try {
      const workflowData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type,
          style: edge.style,
        })),
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      if (currentWorkflowId) {
        // Update existing workflow
        const { error } = await supabase
          .from('workflows')
          .update({
            name: workflowName,
            workflow_data: workflowData,
            is_active: isWorkflowActive,
          })
          .eq('id', currentWorkflowId);
        
        if (error) throw error;
        toast({
          title: "Workflow updated",
          description: `"${workflowName}" has been updated successfully`
        });
      } else {
        // Create new workflow
        const { data, error } = await supabase
          .from('workflows')
          .insert({
            user_id: user.id,
            name: workflowName,
            workflow_data: workflowData,
            is_active: isWorkflowActive,
          })
          .select()
          .single();
        
        if (error) throw error;
        setCurrentWorkflowId(data.id);
        toast({
          title: "Workflow saved",
          description: `"${workflowName}" has been saved successfully`
        });
      }
      
      loadUserWorkflows();
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast({
        title: "Error saving workflow",
        description: "Failed to save the workflow",
        variant: "destructive"
      });
    }
  };

  const loadWorkflow = (workflow: SavedWorkflow) => {
    try {
      const data = workflow.workflow_data;
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      setWorkflowName(workflow.name);
      setCurrentWorkflowId(workflow.id);
      setIsWorkflowActive(workflow.is_active);
      
      toast({
        title: "Workflow loaded",
        description: `"${workflow.name}" has been loaded`
      });
      
      setShowWorkflowsList(false);
    } catch (error) {
      toast({
        title: "Error loading workflow",
        description: "Failed to load the workflow data",
        variant: "destructive"
      });
    }
  };

  const executeWorkflow = async () => {
    if (nodes.length === 0) {
      toast({
        title: "No nodes to execute",
        description: "Add some nodes to your workflow first",
        variant: "destructive"
      });
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
      
      // Save execution to database if user is logged in
      if (user && currentWorkflowId) {
        await supabase
          .from('workflow_executions')
          .insert({
            workflow_id: currentWorkflowId,
            user_id: user.id,
            status: result.success ? 'success' : 'error',
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
            execution_data: result,
          });
      }
      
      setExecutionHistory(prev => [result, ...prev.slice(0, 49)]);
      
      toast({
        title: "Workflow executed",
        description: result.success ? "Workflow completed successfully" : "Workflow completed with errors"
      });
      
    } catch (error) {
      toast({
        title: "Execution failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const createNewWorkflow = () => {
    setNodes([]);
    setEdges([]);
    setWorkflowName('Untitled Workflow');
    setCurrentWorkflowId(null);
    setIsWorkflowActive(false);
    toast({
      title: "New workflow created",
      description: "Start building your workflow"
    });
  };

  const filteredNodes = nodeCategories
    .find(cat => cat.name === selectedCategory)
    ?.nodes.filter(node => 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Show auth page if not authenticated
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Top Toolbar */}
      <div className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Workflow className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-lg">Workflow Builder</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-48 h-8"
              placeholder="Workflow name"
            />
            <Badge variant={isWorkflowActive ? "default" : "secondary"} className="text-xs">
              {isWorkflowActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setShowTemplates(true)}>
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Templates</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setShowWorkflowsList(true)}>
                <FolderOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open Workflow</TooltipContent>
          </Tooltip>

          <Button variant="outline" size="sm" onClick={createNewWorkflow}>
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>

          <Button variant="outline" size="sm" onClick={saveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button 
            size="sm" 
            onClick={executeWorkflow}
            disabled={isExecuting}
            className="bg-primary hover:bg-primary/90"
          >
            {isExecuting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowOnboarding(true)}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Tour
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Node Palette */}
        <div className="w-80 border-r bg-sidebar flex flex-col">
          <div className="p-4 border-b">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-1">
              {nodeCategories.map((category) => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.name)}
                  className="text-xs"
                >
                  <category.icon className="h-3 w-3 mr-1" />
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {filteredNodes.map((node) => (
                <Card
                  key={node.type}
                  className="cursor-pointer hover:bg-accent/50 transition-colors p-3"
                  onClick={() => addNode(node)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <node.icon className="h-5 w-5" style={{ color: getNodeColor(node.type) }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{node.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {node.description}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {node.category}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center - Workflow Canvas */}
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
            <Background 
              color="hsl(var(--border))" 
              gap={20} 
              size={1}
            />
            <Controls 
              className="bg-card border border-border"
              showZoom
              showFitView
              showInteractive={false}
            />
            <MiniMap 
              className="bg-card border border-border"
              nodeColor={() => 'hsl(var(--primary))'}
              nodeStrokeWidth={2}
              zoomable
              pannable
            />
            
            {/* Floating Action Buttons */}
            <Panel position="top-right" className="m-4">
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fitView()}
                  className="bg-card"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowExpressionEditor(true)}
                  className="bg-card"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Right Sidebar - Executions & Data */}
        <div className="w-80 border-l bg-sidebar">
          <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 m-2">
              <TabsTrigger value="executions" className="text-xs">
                <History className="h-3 w-3 mr-1" />
                Executions
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="executions" className="flex-1 m-2 mt-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Executions</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-200px)]">
                    {executionHistory.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No executions yet
                      </div>
                    ) : (
                      <div className="space-y-2 p-4">
                        {executionHistory.map((execution, index) => (
                          <Card key={index} className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={execution.success ? "default" : "destructive"}>
                                {execution.success ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {execution.success ? "Success" : "Failed"}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(execution.startTime).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Duration: {execution.duration || 'N/A'}ms
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 m-2 mt-0">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Workflow Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={isWorkflowActive}
                        onCheckedChange={setIsWorkflowActive}
                      />
                      <span className="text-sm">{isWorkflowActive ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Execution Timeout</Label>
                    <Select defaultValue="1200">
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                        <SelectItem value="1200">20 minutes</SelectItem>
                        <SelectItem value="3600">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialogs */}
      <WorkflowTemplates
        open={showTemplates}
        onOpenChange={setShowTemplates}
        onLoadTemplate={(template) => {
          setNodes(template.nodes || []);
          setEdges(template.edges || []);
          setWorkflowName(template.name || 'Untitled Workflow');
          setCurrentWorkflowId(null);
        }}
      />

      <WorkflowExpressionEditor
        open={showExpressionEditor}
        onOpenChange={setShowExpressionEditor}
        value={expressionValue}
        onChange={setExpressionValue}
        title="Expression Editor"
      />

      <OnboardingTour
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
      />

      {/* Workflows List Dialog */}
      <Dialog open={showWorkflowsList} onOpenChange={setShowWorkflowsList}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your Workflows</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-2">
              {savedWorkflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No saved workflows found
                </div>
              ) : (
                savedWorkflows.map((workflow) => (
                  <Card
                    key={workflow.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors p-3"
                    onClick={() => loadWorkflow(workflow)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Updated {new Date(workflow.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge variant={workflow.is_active ? "default" : "secondary"}>
                        {workflow.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};