import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface N8nNodeData {
  label: string;
  nodeType: string;
  icon: any;
  color: string;
  parameters: any;
  description: string;
  executionStatus?: 'idle' | 'running' | 'success' | 'error';
  executionData?: any;
}

export const N8nWorkflowNode = memo(({ id, data, selected }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [parameters, setParameters] = useState((data as N8nNodeData).parameters);

  const updateParameter = useCallback((key: string, value: any) => {
    const newParams = { ...parameters, [key]: value };
    setParameters(newParams);
    // Update the node data
    (data as N8nNodeData).parameters = newParams;
  }, [parameters, data]);

  const getStatusColor = () => {
    switch ((data as N8nNodeData).executionStatus) {
      case 'running': return 'text-blue-500';
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch ((data as N8nNodeData).executionStatus) {
      case 'running': return <Clock className="w-3 h-3" />;
      case 'success': return <CheckCircle className="w-3 h-3" />;
      case 'error': return <AlertCircle className="w-3 h-3" />;
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
          <Select value={value ? 'true' : 'false'} onValueChange={(val) => updateParameter(key, val === 'true')}>
            <SelectTrigger className="text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => updateParameter(key, val)}>
            <SelectTrigger className="text-xs">
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
        return <Textarea {...commonProps} className="text-xs font-mono min-h-[60px]" />;
      case 'number':
        return <Input {...commonProps} type="number" />;
      default:
        return <Input {...commonProps} placeholder={config.placeholder || `Enter ${key}`} />;
    }
  };

  const getParameterConfig = (nodeType: string, key: string) => {
    const configs: { [key: string]: { [key: string]: any } } = {
      httpRequest: {
        method: { type: 'select', options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ]},
        url: { placeholder: 'https://api.example.com/data' },
        headers: { type: 'textarea', placeholder: '{"Content-Type": "application/json"}' },
        body: { type: 'textarea', placeholder: 'Request body' },
      },
      code: {
        mode: { type: 'select', options: [
          { value: 'runOnceForAllItems', label: 'Run Once for All Items' },
          { value: 'runOnceForEachItem', label: 'Run Once for Each Item' },
        ]},
        jsCode: { type: 'textarea', placeholder: 'return items.map(item => ({ ...item, processed: true }));' },
      },
      webhook: {
        httpMethod: { type: 'select', options: [
          { value: 'GET', label: 'GET' },
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'DELETE', label: 'DELETE' },
        ]},
        path: { placeholder: '/webhook' },
      },
      if: {
        conditions: { type: 'textarea', placeholder: 'Define conditions' },
      },
      wait: {
        amount: { type: 'number', placeholder: '1' },
        unit: { type: 'select', options: [
          { value: 'seconds', label: 'Seconds' },
          { value: 'minutes', label: 'Minutes' },
          { value: 'hours', label: 'Hours' },
        ]},
      },
    };
    return configs[nodeType]?.[key] || {};
  };

  const IconComponent = (data as N8nNodeData).icon;

  return (
    <Card 
      className={`min-w-[200px] transition-all duration-200 ${
        selected ? 'ring-2 ring-primary shadow-lg' : 'shadow-sm'
      } ${isExpanded ? 'min-w-[300px]' : ''}`}
      style={{ borderLeftColor: data.color, borderLeftWidth: '4px' }}
    >
      {/* Input Handle */}
      {!['webhook', 'manual', 'schedule'].includes(data.nodeType) && (
        <Handle 
          type="target" 
          position={Position.Left} 
          className="w-3 h-3 bg-gray-400 border-2 border-white"
        />
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="p-1.5 rounded-md flex-shrink-0"
              style={{ backgroundColor: data.color + '20' }}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ color: data.color }}
              />
            </div>
            <div>
              <div className="font-medium text-sm">{data.label}</div>
              <div className="text-xs text-muted-foreground">{data.nodeType}</div>
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
      </CardHeader>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {Object.entries(parameters).map(([key, value]) => {
              const config = getParameterConfig(data.nodeType, key);
              return (
                <div key={key}>
                  <Label className="text-xs font-medium capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  {renderParameterField(key, value, config)}
                </div>
              );
            })}
            
            {data.executionData && (
              <div className="mt-3 pt-3 border-t">
                <Label className="text-xs font-medium">Execution Result</Label>
                <div className="text-xs bg-muted p-2 rounded font-mono">
                  {JSON.stringify(data.executionData, null, 2).slice(0, 200)}
                  {JSON.stringify(data.executionData).length > 200 && '...'}
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
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      {/* Execution Status Badge */}
      {data.executionStatus && data.executionStatus !== 'idle' && (
        <Badge 
          variant={data.executionStatus === 'success' ? 'default' : 
                  data.executionStatus === 'error' ? 'destructive' : 'secondary'}
          className="absolute -top-2 -right-2 text-xs px-1 py-0.5"
        >
          {data.executionStatus}
        </Badge>
      )}
    </Card>
  );
});