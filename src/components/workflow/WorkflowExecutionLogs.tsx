import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ExecutionLog {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  nodeResults: Record<string, any>;
  error?: string;
}

interface WorkflowExecutionLogsProps {
  workflowId?: string;
  onRerun?: () => void;
  onResume?: () => void;
  onPause?: () => void;
}

export const WorkflowExecutionLogs = ({ 
  workflowId, 
  onRerun, 
  onResume, 
  onPause 
}: WorkflowExecutionLogsProps) => {
  const [executions, setExecutions] = useState<ExecutionLog[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionLog | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load execution history from localStorage
    const stored = localStorage.getItem('workflow-executions');
    if (stored) {
      const allExecutions = JSON.parse(stored);
      const filtered = workflowId 
        ? allExecutions.filter((e: ExecutionLog) => e.workflowId === workflowId)
        : allExecutions;
      setExecutions(filtered);
    }
  }, [workflowId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Execution Logs
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onRerun}>
              <RotateCcw className="w-4 h-4 mr-1" />
              Rerun
            </Button>
            <Button size="sm" variant="outline" onClick={onPause}>
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
            <Button size="sm" variant="outline" onClick={onResume}>
              <Play className="w-4 h-4 mr-1" />
              Resume
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="history" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">Execution History</TabsTrigger>
            <TabsTrigger value="details">Execution Details</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {executions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No executions found. Run your workflow to see execution history.
                  </div>
                ) : (
                  executions.map((execution) => (
                    <div
                      key={execution.id}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedExecution(execution)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(execution.status)}
                          <span className="text-sm font-medium">
                            {new Date(execution.startedAt).toLocaleString()}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStatusColor(execution.status)} text-white`}
                          >
                            {execution.status}
                          </Badge>
                        </div>
                        {execution.duration && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(execution.duration)}
                          </span>
                        )}
                      </div>
                      {execution.error && (
                        <div className="mt-2 text-xs text-red-500 truncate">
                          Error: {execution.error}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            {selectedExecution ? (
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  <div className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Execution Overview</h4>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(selectedExecution.status)} text-white`}
                      >
                        {selectedExecution.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Started:</span>
                        <div>{new Date(selectedExecution.startedAt).toLocaleString()}</div>
                      </div>
                      {selectedExecution.completedAt && (
                        <div>
                          <span className="text-muted-foreground">Completed:</span>
                          <div>{new Date(selectedExecution.completedAt).toLocaleString()}</div>
                        </div>
                      )}
                      {selectedExecution.duration && (
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div>{formatDuration(selectedExecution.duration)}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Nodes:</span>
                        <div>{Object.keys(selectedExecution.nodeResults).length}</div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium mb-3">Node Results</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedExecution.nodeResults).map(([nodeId, result]) => (
                        <Collapsible key={nodeId}>
                          <CollapsibleTrigger 
                            className="flex items-center gap-2 w-full text-left p-2 rounded hover:bg-muted/50"
                            onClick={() => toggleNodeExpansion(nodeId)}
                          >
                            {expandedNodes.has(nodeId) ? 
                              <ChevronDown className="w-4 h-4" /> : 
                              <ChevronRight className="w-4 h-4" />
                            }
                            {result.success ? 
                              <CheckCircle className="w-4 h-4 text-green-500" /> :
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            }
                            <span className="text-sm font-medium">{nodeId}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(result.executedAt).toLocaleTimeString()}
                            </span>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-8 pr-2 pb-2">
                            <div className="text-xs bg-muted/30 rounded p-2">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Select an execution from the history to view details.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};