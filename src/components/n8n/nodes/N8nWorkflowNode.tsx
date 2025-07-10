import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Info,
  Code,
  TestTube,
  Database,
  Key,
  Zap,
  MoreHorizontal,
  Pin,
  PinOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface N8nNodeData {
  label: string;
  nodeType: string;
  icon: any;
  color: string;
  parameters: any;
  description: string;
  category: string;
  executionStatus?: 'idle' | 'running' | 'success' | 'error' | 'waiting';
  executionData?: any;
  disabled?: boolean;
  pinData?: boolean;
  notes?: string;
  webhookId?: string;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
}

export const N8nWorkflowNode = memo(({ id, data, selected }: NodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [parameters, setParameters] = useState((data as any).parameters);
  const [activeTab, setActiveTab] = useState('parameters');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { updateNodeData, deleteElements } = useReactFlow();

  // Auto-expand when node is selected
  useEffect(() => {
    if (selected && !isExpanded) {
      setIsExpanded(true);
    }
  }, [selected, isExpanded]);

  const updateParameter = useCallback((key: string, value: any) => {
    const newParams = { ...parameters, [key]: value };
    setParameters(newParams);
    updateNodeData(id, { parameters: newParams });
  }, [parameters, id, updateNodeData]);

  const updateNodeSettings = useCallback((key: string, value: any) => {
    updateNodeData(id, { [key]: value });
  }, [id, updateNodeData]);

  const duplicateNode = useCallback(() => {
    toast.success('Node duplicated');
  }, []);

  const deleteNode = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
    toast.success('Node deleted');
  }, [id, deleteElements]);

  const testNode = useCallback(() => {
    toast.info('Testing node...', { description: 'Node test executed' });
  }, []);

  const getStatusColor = () => {
    switch ((data as any).executionStatus) {
      case 'running': return 'text-blue-500 animate-pulse';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'waiting': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch ((data as any).executionStatus) {
      case 'running': return <Clock className="w-3 h-3 animate-spin" />;
      case 'success': return <CheckCircle className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
      case 'waiting': return <Clock className="w-3 h-3" />;
      default: return <Square className="w-3 h-3" />;
    }
  };

  const renderParameterField = (key: string, value: any, config: any = {}) => {
    const commonProps = {
      value: value || '',
      onChange: (e: any) => updateParameter(key, e.target.value),
      className: "text-xs",
    };

    switch (config.type || typeof value) {
      case 'boolean':
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => updateParameter(key, checked)}
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => updateParameter(key, val)}>
            <SelectTrigger className="text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option: any) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'textarea':
        return (
          <Textarea 
            {...commonProps} 
            className="text-xs font-mono min-h-[80px] resize-y" 
            placeholder={config.placeholder}
          />
        );
      case 'number':
        return <Input {...commonProps} type="number" className="h-8" />;
      case 'password':
        return <Input {...commonProps} type="password" className="h-8" />;
      case 'json':
        return (
          <Textarea 
            {...commonProps} 
            className="text-xs font-mono min-h-[100px]" 
            placeholder="{ }"
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateParameter(key, parsed);
              } catch {
                updateParameter(key, e.target.value);
              }
            }}
          />
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {config.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Switch
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onCheckedChange={(checked) => {
                    const currentArray = Array.isArray(value) ? value : [];
                    if (checked) {
                      updateParameter(key, [...currentArray, option.value]);
                    } else {
                      updateParameter(key, currentArray.filter(v => v !== option.value));
                    }
                  }}
                />
                <Label className="text-xs">{option.label}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <Input 
            {...commonProps} 
            className="h-8"
            placeholder={config.placeholder || `Enter ${key.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`} 
          />
        );
    }
  };

  const getParameterConfig = (nodeType: string, key: string) => {
    const configs: { [key: string]: { [key: string]: any } } = {
      httpRequest: {
        method: { 
          type: 'select', 
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PATCH', label: 'PATCH' },
            { value: 'HEAD', label: 'HEAD' },
            { value: 'OPTIONS', label: 'OPTIONS' },
          ]
        },
        url: { placeholder: 'https://api.example.com/data' },
        authentication: { 
          type: 'select',
          options: [
            { value: 'none', label: 'None' },
            { value: 'basicAuth', label: 'Basic Auth' },
            { value: 'headerAuth', label: 'Header Auth' },
            { value: 'oauth2', label: 'OAuth2' },
            { value: 'bearerToken', label: 'Bearer Token' },
          ]
        },
        headers: { type: 'json', placeholder: '{\n  "Content-Type": "application/json"\n}' },
        body: { type: 'textarea', placeholder: 'Request body' },
        sendQuery: { type: 'boolean' },
        sendHeaders: { type: 'boolean' },
        sendBody: { type: 'boolean' },
        ignoreHttpStatusErrors: { type: 'boolean' },
        followRedirects: { type: 'boolean' },
        timeout: { type: 'number', placeholder: '30000' },
      },
      code: {
        mode: { 
          type: 'select', 
          options: [
            { value: 'runOnceForAllItems', label: 'Run Once for All Items' },
            { value: 'runOnceForEachItem', label: 'Run Once for Each Item' },
          ]
        },
        language: {
          type: 'select',
          options: [
            { value: 'javascript', label: 'JavaScript' },
            { value: 'python', label: 'Python' },
          ]
        },
        jsCode: { 
          type: 'textarea', 
          placeholder: '// JavaScript code\nreturn items.map(item => ({\n  json: {\n    ...item.json,\n    processed: true\n  }\n}));'
        },
        pythonCode: {
          type: 'textarea',
          placeholder: '# Python code\nfor item in items:\n    item["json"]["processed"] = True\nreturn items'
        },
      },
      webhook: {
        httpMethod: { 
          type: 'select', 
          options: [
            { value: 'GET', label: 'GET' },
            { value: 'POST', label: 'POST' },
            { value: 'PUT', label: 'PUT' },
            { value: 'DELETE', label: 'DELETE' },
            { value: 'PATCH', label: 'PATCH' },
            { value: 'HEAD', label: 'HEAD' },
            { value: 'OPTIONS', label: 'OPTIONS' },
          ]
        },
        path: { placeholder: '/webhook' },
        responseMode: {
          type: 'select',
          options: [
            { value: 'onReceived', label: 'Immediately' },
            { value: 'lastNode', label: 'When Last Node Finishes' },
            { value: 'responseNode', label: 'Using Response Node' },
          ]
        },
        responseData: { type: 'textarea', placeholder: 'Response data' },
        options: {
          type: 'multiselect',
          options: [
            { value: 'rawBody', label: 'Raw Body' },
            { value: 'allowedOrigins', label: 'Allowed Origins' },
            { value: 'noResponseBody', label: 'No Response Body' },
          ]
        },
      },
      if: {
        conditions: { 
          type: 'json', 
          placeholder: '{\n  "string": [\n    {\n      "value1": "{{$json.status}}",\n      "operation": "equal",\n      "value2": "active"\n    }\n  ]\n}' 
        },
        combineOperation: {
          type: 'select',
          options: [
            { value: 'all', label: 'All conditions must be true (AND)' },
            { value: 'any', label: 'Any condition can be true (OR)' },
          ]
        },
      },
      wait: {
        amount: { type: 'number', placeholder: '1' },
        unit: { 
          type: 'select', 
          options: [
            { value: 'seconds', label: 'Seconds' },
            { value: 'minutes', label: 'Minutes' },
            { value: 'hours', label: 'Hours' },
            { value: 'days', label: 'Days' },
          ]
        },
      },
      set: {
        values: {
          type: 'json',
          placeholder: '{\n  "string": [\n    {\n      "name": "newField",\n      "value": "{{$json.existingField}}"\n    }\n  ]\n}'
        },
        options: {
          type: 'multiselect',
          options: [
            { value: 'keepOnlySet', label: 'Keep Only Set' },
            { value: 'dotNotation', label: 'Dot Notation' },
          ]
        },
      },
      switch: {
        mode: {
          type: 'select',
          options: [
            { value: 'rules', label: 'Rules' },
            { value: 'expression', label: 'Expression' },
          ]
        },
        output: {
          type: 'select',
          options: [
            { value: 'input', label: 'Input' },
            { value: 'empty', label: 'Empty' },
          ]
        },
        rules: {
          type: 'json',
          placeholder: '{\n  "rules": [\n    {\n      "operation": "equal",\n      "value1": "{{$json.type}}",\n      "value2": "user"\n    }\n  ]\n}'
        },
      },
      schedule: {
        rule: {
          type: 'json',
          placeholder: '{\n  "interval": [\n    {\n      "field": "cronExpression",\n      "value": "0 * * * *"\n    }\n  ]\n}'
        },
        timezone: {
          type: 'select',
          options: [
            { value: 'UTC', label: 'UTC' },
            { value: 'America/New_York', label: 'America/New_York' },
            { value: 'Europe/London', label: 'Europe/London' },
            { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
          ]
        },
      },
      // Gmail specific
      gmail: {
        operation: {
          type: 'select',
          options: [
            { value: 'send', label: 'Send Email' },
            { value: 'read', label: 'Read Email' },
            { value: 'search', label: 'Search Emails' },
            { value: 'draft', label: 'Create Draft' },
          ]
        },
        to: { placeholder: 'recipient@example.com' },
        subject: { placeholder: 'Email subject' },
        message: { type: 'textarea', placeholder: 'Email message' },
        attachments: { type: 'json', placeholder: '[]' },
      },
      // Slack specific
      slack: {
        operation: {
          type: 'select',
          options: [
            { value: 'postMessage', label: 'Post Message' },
            { value: 'updateMessage', label: 'Update Message' },
            { value: 'addReaction', label: 'Add Reaction' },
            { value: 'getChannels', label: 'Get Channels' },
          ]
        },
        channel: { placeholder: '#general' },
        text: { type: 'textarea', placeholder: 'Message text' },
        attachments: { type: 'json', placeholder: '[]' },
        blocks: { type: 'json', placeholder: '[]' },
      },
      // Database nodes
      mysql: {
        operation: {
          type: 'select',
          options: [
            { value: 'select', label: 'Select' },
            { value: 'insert', label: 'Insert' },
            { value: 'update', label: 'Update' },
            { value: 'delete', label: 'Delete' },
            { value: 'executeQuery', label: 'Execute Query' },
          ]
        },
        query: { type: 'textarea', placeholder: 'SELECT * FROM users WHERE id = ?' },
        parameters: { type: 'json', placeholder: '[1]' },
      },
      // AI nodes
      openai: {
        operation: {
          type: 'select',
          options: [
            { value: 'text', label: 'Text Completion' },
            { value: 'chat', label: 'Chat Completion' },
            { value: 'image', label: 'Image Generation' },
            { value: 'embedding', label: 'Embeddings' },
            { value: 'audio', label: 'Audio Transcription' },
          ]
        },
        model: {
          type: 'select',
          options: [
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
            { value: 'text-davinci-003', label: 'Text Davinci 003' },
            { value: 'dall-e-3', label: 'DALL-E 3' },
          ]
        },
        prompt: { type: 'textarea', placeholder: 'Enter your prompt here...' },
        maxTokens: { type: 'number', placeholder: '100' },
        temperature: { type: 'number', placeholder: '0.7' },
        systemMessage: { type: 'textarea', placeholder: 'You are a helpful assistant.' },
      },
    };
    return configs[nodeType]?.[key] || {};
  };

  const getParameterGroups = (nodeType: string) => {
    const groups: { [key: string]: string[] } = {
      httpRequest: ['method', 'url', 'authentication', 'headers', 'body'],
      code: ['mode', 'language', 'jsCode', 'pythonCode'],
      webhook: ['httpMethod', 'path', 'responseMode', 'responseData'],
      if: ['conditions', 'combineOperation'],
      wait: ['amount', 'unit'],
      gmail: ['operation', 'to', 'subject', 'message', 'attachments'],
      slack: ['operation', 'channel', 'text', 'attachments', 'blocks'],
      mysql: ['operation', 'query', 'parameters'],
      openai: ['operation', 'model', 'prompt', 'maxTokens', 'temperature', 'systemMessage'],
    };
    return groups[nodeType] || Object.keys(parameters);
  };

  const IconComponent = (data as any).icon;
  const nodeData = data as any;

  return (
    <Card 
      className={`min-w-[250px] transition-all duration-200 ${
        selected ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm hover:shadow-md'
      } ${isExpanded ? 'min-w-[400px]' : ''} ${nodeData.disabled ? 'opacity-50' : ''}`}
      style={{ borderLeftColor: nodeData.color, borderLeftWidth: '4px' }}
    >
      {/* Input Handle */}
      {!['webhook', 'manual', 'schedule', 'emailTrigger', 'formTrigger', 'chatTrigger'].includes(nodeData.nodeType) && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-gray-400 border-2 border-white hover:bg-primary transition-colors"
          style={{ left: '-7px' }}
        />
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-md flex-shrink-0"
              style={{ backgroundColor: nodeData.color + '20' }}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ color: nodeData.color }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate">{nodeData.label}</div>
              <div className="text-xs text-muted-foreground">{nodeData.nodeType}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <div className={`${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 h-6 w-6"
            >
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Node actions when expanded */}
        {isExpanded && (
          <div className="flex items-center gap-1 mt-2">
            <Button variant="ghost" size="sm" onClick={testNode}>
              <TestTube className="w-3 h-3 mr-1" />
              Test
            </Button>
            <Button variant="ghost" size="sm" onClick={duplicateNode}>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={deleteNode}>
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateNodeSettings('disabled', !nodeData.disabled)}
            >
              {nodeData.disabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            </Button>
          </div>
        )}
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="parameters" className="text-xs">Parameters</TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
                <TabsTrigger value="notes" className="text-xs">Notes</TabsTrigger>
              </TabsList>

              {/* Parameters Tab */}
              <TabsContent value="parameters" className="space-y-4">
                {getParameterGroups(nodeData.nodeType).map((key) => {
                  const config = getParameterConfig(nodeData.nodeType, key);
                  const value = parameters[key];
                  
                  // Skip advanced parameters unless showAdvanced is true
                  if (config.advanced && !showAdvanced) return null;
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        {config.required && <span className="text-red-500 text-xs">*</span>}
                        {config.description && (
                          <Info className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      {renderParameterField(key, value, config)}
                      {config.help && (
                        <div className="text-xs text-muted-foreground">{config.help}</div>
                      )}
                    </div>
                  );
                })}
                
                {/* Show advanced toggle if there are advanced parameters */}
                {Object.values(getParameterConfig(nodeData.nodeType, '')).some((config: any) => config?.advanced) && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-xs"
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Continue on Fail</Label>
                    <Switch
                      checked={nodeData.continueOnFail || false}
                      onCheckedChange={(checked) => updateNodeSettings('continueOnFail', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Always Output Data</Label>
                    <Switch
                      checked={nodeData.alwaysOutputData || false}
                      onCheckedChange={(checked) => updateNodeSettings('alwaysOutputData', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Execute Once</Label>
                    <Switch
                      checked={nodeData.executeOnce || false}
                      onCheckedChange={(checked) => updateNodeSettings('executeOnce', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Retry on Fail</Label>
                    <Switch
                      checked={nodeData.retryOnFail || false}
                      onCheckedChange={(checked) => updateNodeSettings('retryOnFail', checked)}
                    />
                  </div>
                  
                  {nodeData.retryOnFail && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm">Max Tries</Label>
                        <Input
                          type="number"
                          value={nodeData.maxTries || 3}
                          onChange={(e) => updateNodeSettings('maxTries', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm">Wait Between Tries (ms)</Label>
                        <Input
                          type="number"
                          value={nodeData.waitBetweenTries || 1000}
                          onChange={(e) => updateNodeSettings('waitBetweenTries', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Node Notes</Label>
                  <Textarea
                    value={nodeData.notes || ''}
                    onChange={(e) => updateNodeSettings('notes', e.target.value)}
                    placeholder="Add notes about this node..."
                    className="min-h-[100px] text-xs"
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label className="text-sm">Node Information</Label>
                  <div className="bg-muted p-3 rounded text-xs space-y-1">
                    <div><strong>ID:</strong> {id}</div>
                    <div><strong>Type:</strong> {nodeData.nodeType}</div>
                    <div><strong>Category:</strong> {nodeData.category}</div>
                    <div><strong>Description:</strong> {nodeData.description}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Execution Data Display */}
            {nodeData.executionData && (
              <div className="mt-4 pt-4 border-t">
                <Label className="text-xs font-medium">Latest Execution Result</Label>
                <div className="mt-2 text-xs bg-muted p-3 rounded font-mono max-h-32 overflow-y-auto">
                  {JSON.stringify(nodeData.executionData, null, 2).slice(0, 500)}
                  {JSON.stringify(nodeData.executionData).length > 500 && '...'}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Output Handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-blue-500 border-2 border-white hover:bg-blue-600 transition-colors"
        style={{ right: '-7px' }}
      />

      {/* Node Status Badges */}
      <div className="absolute -top-2 -right-2 flex gap-1">
        {nodeData.executionStatus && nodeData.executionStatus !== 'idle' && (
          <Badge 
            variant={nodeData.executionStatus === 'success' ? 'default' : 
                    nodeData.executionStatus === 'error' ? 'destructive' : 'secondary'}
            className="text-[10px] px-1 py-0"
          >
            {nodeData.executionStatus}
          </Badge>
        )}
        
        {nodeData.disabled && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            Disabled
          </Badge>
        )}
        
        {nodeData.pinData && (
          <Badge variant="outline" className="text-[10px] px-1 py-0">
            <Pin className="w-2 h-2" />
          </Badge>
        )}
      </div>

      {/* Webhook URL display for webhook nodes */}
      {nodeData.nodeType === 'webhook' && nodeData.webhookId && (
        <div className="absolute -bottom-8 left-0 right-0 bg-background border rounded px-2 py-1 text-xs text-muted-foreground">
          Webhook URL: /webhook/{nodeData.webhookId}
        </div>
      )}
    </Card>
  );
});