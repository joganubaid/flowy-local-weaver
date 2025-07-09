export interface WorkflowNode {
  id: string;
  type: 'http' | 'if' | 'function' | 'delay' | 'webhook' | 'notify';
  position: { x: number; y: number };
  data: any;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: any;
  error?: string;
  nodeResults: Record<string, any>;
}

export interface NodeData {
  label: string;
  config: any;
}

// Node-specific configurations
export interface HttpNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface IfNodeConfig {
  condition: string; // JavaScript expression
  trueOutput: string;
  falseOutput: string;
}

export interface FunctionNodeConfig {
  code: string; // JavaScript code
  timeout?: number;
}

export interface DelayNodeConfig {
  duration: number; // milliseconds
}

export interface WebhookNodeConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface NotifyNodeConfig {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}