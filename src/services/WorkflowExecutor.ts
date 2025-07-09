import { toast } from 'sonner';

interface ExecutionContext {
  nodes: any[];
  edges: any[];
}

interface NodeResult {
  nodeId: string;
  success: boolean;
  data?: any;
  error?: string;
  executedAt: string;
}

export class WorkflowExecutor {
  private nodeResults: Map<string, any> = new Map();

  async execute(workflow: ExecutionContext): Promise<any> {
    this.nodeResults.clear();
    
    // Find starting nodes (nodes with no incoming edges or webhook nodes)
    const startingNodes = this.findStartingNodes(workflow);
    
    if (startingNodes.length === 0) {
      throw new Error('No starting nodes found. Add a Webhook node or ensure some nodes have no incoming connections.');
    }

    console.log('Starting workflow execution with nodes:', startingNodes.map(n => n.id));

    // Execute each starting node
    const results = [];
    for (const node of startingNodes) {
      try {
        const result = await this.executeNode(node, {}, workflow);
        results.push(result);
      } catch (error) {
        console.error(`Failed to execute starting node ${node.id}:`, error);
        throw error;
      }
    }

    return {
      success: true,
      results,
      nodeResults: Object.fromEntries(this.nodeResults),
      executedAt: new Date().toISOString()
    };
  }

  private findStartingNodes(workflow: ExecutionContext) {
    const { nodes, edges } = workflow;
    const nodesWithIncoming = new Set(edges.map(edge => edge.target));
    
    return nodes.filter(node => 
      !nodesWithIncoming.has(node.id) || node.type === 'webhook'
    );
  }

  private async executeNode(node: any, inputData: any, workflow: ExecutionContext): Promise<NodeResult> {
    console.log(`Executing node ${node.id} (${node.type})`);
    
    try {
      let result: any;

      switch (node.type) {
        case 'http':
          result = await this.executeHttpNode(node, inputData);
          break;
        case 'if':
          result = await this.executeIfNode(node, inputData);
          break;
        case 'function':
          result = await this.executeFunctionNode(node, inputData);
          break;
        case 'delay':
          result = await this.executeDelayNode(node, inputData);
          break;
        case 'webhook':
          result = await this.executeWebhookNode(node, inputData);
          break;
        case 'notify':
          result = await this.executeNotifyNode(node, inputData);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }

      const nodeResult: NodeResult = {
        nodeId: node.id,
        success: true,
        data: result,
        executedAt: new Date().toISOString()
      };

      this.nodeResults.set(node.id, nodeResult);

      // Execute connected nodes
      await this.executeConnectedNodes(node, result, workflow);

      return nodeResult;
    } catch (error) {
      const nodeResult: NodeResult = {
        nodeId: node.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString()
      };

      this.nodeResults.set(node.id, nodeResult);
      throw error;
    }
  }

  private async executeConnectedNodes(sourceNode: any, sourceData: any, workflow: ExecutionContext) {
    const { edges } = workflow;
    const outgoingEdges = edges.filter(edge => edge.source === sourceNode.id);

    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find(n => n.id === edge.target);
      if (targetNode && !this.nodeResults.has(targetNode.id)) {
        await this.executeNode(targetNode, sourceData, workflow);
      }
    }
  }

  private async executeHttpNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    const url = this.interpolateString(config.url, inputData);
    
    const requestOptions: RequestInit = {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };

    if (config.body && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
      requestOptions.body = typeof config.body === 'string' 
        ? this.interpolateString(config.body, inputData)
        : JSON.stringify(config.body);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType?.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData
    };
  }

  private async executeIfNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    
    try {
      // Create a safe evaluation environment
      const evaluateCondition = new Function('data', `return Boolean(${config.condition})`);
      const result = evaluateCondition(inputData);
      
      return {
        condition: config.condition,
        result,
        output: result ? config.trueOutput : config.falseOutput,
        branch: result ? 'true' : 'false'
      };
    } catch (error) {
      throw new Error(`Invalid condition: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeFunctionNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    
    try {
      // Create a sandboxed function execution environment
      const userFunction = new Function(
        'data',
        'console',
        'Math',
        'Date',
        config.code
      );
      
      const result = userFunction(inputData, console, Math, Date);
      return result;
    } catch (error) {
      throw new Error(`Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeDelayNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    
    await new Promise(resolve => setTimeout(resolve, config.duration));
    
    return {
      delayed: config.duration,
      data: inputData
    };
  }

  private async executeWebhookNode(node: any, inputData: any): Promise<any> {
    // For demo purposes, webhook nodes just pass through the data
    // In a real implementation, this would set up a webhook listener
    console.log(`Webhook node ${node.id} would listen on ${node.data.config.path}`);
    
    return {
      webhook: {
        path: node.data.config.path,
        method: node.data.config.method
      },
      data: inputData || { triggered: true, timestamp: new Date().toISOString() }
    };
  }

  private async executeNotifyNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    
    const title = this.interpolateString(config.title, inputData);
    const message = this.interpolateString(config.message, inputData);
    
    // Show toast notification
    switch (config.type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      default:
        toast.info(title, { description: message });
    }

    return {
      notification: {
        title,
        message,
        type: config.type
      },
      data: inputData
    };
  }

  private interpolateString(template: string, data: any): string {
    if (!template || typeof template !== 'string') return template;
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      try {
        const value = this.getNestedValue(data, path.trim());
        return value !== undefined ? String(value) : match;
      } catch {
        return match;
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}