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
        case 'loop':
          result = await this.executeLoopNode(node, inputData, workflow);
          break;
        case 'switch':
          result = await this.executeSwitchNode(node, inputData);
          break;
        case 'trigger':
          result = await this.executeTriggerNode(node, inputData);
          break;
        case 'integration':
          result = await this.executeIntegrationNode(node, inputData);
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

  private async executeLoopNode(node: any, inputData: any, workflow: ExecutionContext): Promise<any> {
    const config = node.data.config;
    const results = [];
    
    switch (config.loopType) {
      case 'array':
        const arrayData = this.getNestedValue(inputData, config.arrayPath || 'data');
        if (Array.isArray(arrayData)) {
          for (let i = 0; i < arrayData.length; i++) {
            const itemData = { ...inputData, item: arrayData[i], index: i };
            results.push(itemData);
            // Execute loop body nodes here (would need more complex edge handling)
          }
        }
        break;
      
      case 'count':
        for (let i = 0; i < (config.count || 0); i++) {
          const itemData = { ...inputData, index: i, count: config.count };
          results.push(itemData);
        }
        break;
        
      case 'while':
        let iterations = 0;
        const maxIterations = 100; // Safety limit
        while (iterations < maxIterations) {
          try {
            const evaluateCondition = new Function('data', `return Boolean(${config.condition})`);
            if (!evaluateCondition(inputData)) break;
            
            results.push({ ...inputData, iteration: iterations });
            iterations++;
          } catch {
            break;
          }
        }
        break;
    }
    
    return {
      loopType: config.loopType,
      iterations: results.length,
      results: results
    };
  }

  private async executeSwitchNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    const inputValue = this.getNestedValue(inputData, config.inputPath);
    
    for (const switchCase of config.cases) {
      try {
        const evaluateCondition = new Function('value', `return value ${switchCase.condition}`);
        if (evaluateCondition(inputValue)) {
          return {
            matched: true,
            case: switchCase,
            output: switchCase.output,
            inputValue
          };
        }
      } catch (error) {
        console.warn(`Switch condition evaluation failed: ${error}`);
      }
    }
    
    return {
      matched: false,
      output: config.defaultOutput || null,
      inputValue
    };
  }

  private async executeTriggerNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    
    return {
      trigger: {
        type: config.triggerType,
        triggeredAt: new Date().toISOString(),
        ...(config.schedule && { schedule: config.schedule }),
        ...(config.webhookPath && { webhookPath: config.webhookPath }),
        ...(config.eventType && { eventType: config.eventType })
      },
      data: inputData || { triggered: true }
    };
  }

  private async executeIntegrationNode(node: any, inputData: any): Promise<any> {
    const config = node.data.config;
    
    // This is a mock implementation - in reality, this would connect to actual services
    console.log(`Integration: ${config.service} - ${config.action}`);
    
    const mockResponses: Record<string, any> = {
      'slack-send-message': { messageId: 'msg_123', channel: '#general', sent: true },
      'google-sheets-append-row': { rowId: 42, spreadsheetId: 'sheet_123', success: true },
      'notion-create-page': { pageId: 'page_123', title: 'New Page', created: true },
      'gmail-send-email': { messageId: 'email_123', to: 'user@example.com', sent: true },
      'telegram-send-message': { messageId: 456, chatId: '123', sent: true }
    };
    
    const mockKey = `${config.service}-${config.action}`;
    const mockResponse = mockResponses[mockKey] || { success: true, action: config.action };
    
    return {
      integration: {
        service: config.service,
        action: config.action,
        parameters: config.parameters
      },
      response: mockResponse,
      inputData
    };
  }
}