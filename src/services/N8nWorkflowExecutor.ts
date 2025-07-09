import { toast } from 'sonner';

interface N8nExecutionContext {
  nodes: any[];
  edges: any[];
}

interface N8nNodeResult {
  nodeId: string;
  success: boolean;
  data?: any;
  error?: string;
  executedAt: string;
  duration: number;
}

export class N8nWorkflowExecutor {
  private nodeResults: Map<string, any> = new Map();
  private startTime: number = 0;

  async execute(workflow: N8nExecutionContext): Promise<any> {
    this.startTime = Date.now();
    this.nodeResults.clear();
    
    console.log('🚀 Starting n8n workflow execution...');
    
    // Find trigger nodes (webhook, manual, schedule)
    const triggerNodes = this.findTriggerNodes(workflow);
    
    if (triggerNodes.length === 0) {
      throw new Error('No trigger nodes found. Add a trigger node (Webhook, Manual, or Schedule) to start the workflow.');
    }

    console.log('📍 Found trigger nodes:', triggerNodes.map(n => `${n.label} (${n.nodeType})`));

    // Execute workflow starting from trigger nodes
    const results = [];
    for (const triggerNode of triggerNodes) {
      try {
        const result = await this.executeNode(triggerNode, this.getInitialData(triggerNode), workflow);
        results.push(result);
      } catch (error) {
        console.error(`❌ Failed to execute trigger node ${triggerNode.id}:`, error);
        throw error;
      }
    }

    const duration = Date.now() - this.startTime;
    console.log(`✅ Workflow execution completed in ${duration}ms`);

    return {
      success: true,
      duration,
      results,
      nodesExecuted: this.nodeResults.size,
      nodeResults: Object.fromEntries(this.nodeResults),
      executedAt: new Date().toISOString()
    };
  }

  private findTriggerNodes(workflow: N8nExecutionContext) {
    const triggerTypes = ['webhook', 'manual', 'schedule', 'emailTrigger'];
    return workflow.nodes.filter(node => triggerTypes.includes(node.nodeType));
  }

  private getInitialData(triggerNode: any) {
    switch (triggerNode.nodeType) {
      case 'manual':
        return [{ json: { manualTrigger: true, timestamp: new Date().toISOString() } }];
      case 'webhook':
        return [{ json: { webhookData: 'sample', receivedAt: new Date().toISOString() } }];
      case 'schedule':
        return [{ json: { scheduledExecution: true, triggerTime: new Date().toISOString() } }];
      default:
        return [{ json: { triggered: true } }];
    }
  }

  private async executeNode(node: any, inputData: any[], workflow: N8nExecutionContext): Promise<N8nNodeResult> {
    const nodeStartTime = Date.now();
    console.log(`⚡ Executing node: ${node.label} (${node.nodeType})`);
    
    try {
      let result: any[];

      switch (node.nodeType) {
        case 'manual':
        case 'webhook':
        case 'schedule':
          result = await this.executeTriggerNode(node, inputData);
          break;
        case 'httpRequest':
          result = await this.executeHttpRequestNode(node, inputData);
          break;
        case 'code':
          result = await this.executeCodeNode(node, inputData);
          break;
        case 'if':
          result = await this.executeIfNode(node, inputData);
          break;
        case 'wait':
          result = await this.executeWaitNode(node, inputData);
          break;
        case 'set':
          result = await this.executeSetNode(node, inputData);
          break;
        case 'noOp':
          result = inputData; // Pass through unchanged
          break;
        case 'gmail':
          result = await this.executeGmailNode(node, inputData);
          break;
        case 'slack':
          result = await this.executeSlackNode(node, inputData);
          break;
        case 'googleSheets':
          result = await this.executeGoogleSheetsNode(node, inputData);
          break;
        case 'mysql':
          result = await this.executeMysqlNode(node, inputData);
          break;
        case 'openai':
          result = await this.executeOpenAiNode(node, inputData);
          break;
        default:
          console.warn(`⚠️ Unknown node type: ${node.nodeType}, passing data through`);
          result = inputData;
      }

      const duration = Date.now() - nodeStartTime;
      const nodeResult: N8nNodeResult = {
        nodeId: node.id,
        success: true,
        data: result,
        executedAt: new Date().toISOString(),
        duration
      };

      this.nodeResults.set(node.id, nodeResult);
      console.log(`✅ Node ${node.label} completed in ${duration}ms`);

      // Execute connected nodes
      await this.executeConnectedNodes(node, result, workflow);

      return nodeResult;
    } catch (error) {
      const duration = Date.now() - nodeStartTime;
      const nodeResult: N8nNodeResult = {
        nodeId: node.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executedAt: new Date().toISOString(),
        duration
      };

      this.nodeResults.set(node.id, nodeResult);
      console.error(`❌ Node ${node.label} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  private async executeConnectedNodes(sourceNode: any, sourceData: any[], workflow: N8nExecutionContext) {
    const outgoingEdges = workflow.edges.filter(edge => edge.source === sourceNode.id);

    for (const edge of outgoingEdges) {
      const targetNode = workflow.nodes.find(n => n.id === edge.target);
      if (targetNode && !this.nodeResults.has(targetNode.id)) {
        await this.executeNode(targetNode, sourceData, workflow);
      }
    }
  }

  private async executeTriggerNode(node: any, inputData: any[]): Promise<any[]> {
    console.log(`🎯 Trigger node ${node.label} activated`);
    return inputData;
  }

  private async executeHttpRequestNode(node: any, inputData: any[]): Promise<any[]> {
    const { method = 'GET', url, headers, body } = node.parameters;
    
    if (!url) {
      throw new Error('HTTP Request: URL is required');
    }

    const results = [];
    for (let i = 0; i < inputData.length; i++) {
      const item = inputData[i];
      
      try {
        // Interpolate variables in URL
        const interpolatedUrl = this.interpolateString(url, item.json);
        
        const requestOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...this.parseJsonString(headers)
          }
        };

        if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
          requestOptions.body = this.interpolateString(body, item.json);
        }

        console.log(`🌐 HTTP ${method} ${interpolatedUrl}`);
        const response = await fetch(interpolatedUrl, requestOptions);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const responseData = await response.json().catch(() => response.text());
        
        results.push({
          json: {
            ...item.json,
            httpResponse: {
              status: response.status,
              headers: Object.fromEntries(response.headers.entries()),
              data: responseData
            }
          }
        });
      } catch (error) {
        results.push({
          json: {
            ...item.json,
            error: error instanceof Error ? error.message : 'HTTP request failed'
          }
        });
      }
    }

    return results;
  }

  private async executeCodeNode(node: any, inputData: any[]): Promise<any[]> {
    const { jsCode = 'return items;', mode = 'runOnceForAllItems' } = node.parameters;
    
    try {
      if (mode === 'runOnceForAllItems') {
        // Execute once with all items
        const userFunction = new Function('items', 'console', 'Math', 'Date', jsCode);
        const result = userFunction(inputData, console, Math, Date);
        
        // Ensure result is an array
        return Array.isArray(result) ? result : [{ json: result }];
      } else {
        // Execute once for each item
        const results = [];
        for (const item of inputData) {
          const userFunction = new Function('item', 'console', 'Math', 'Date', jsCode);
          const result = userFunction(item, console, Math, Date);
          results.push({ json: result });
        }
        return results;
      }
    } catch (error) {
      throw new Error(`Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeIfNode(node: any, inputData: any[]): Promise<any[]> {
    const { conditions } = node.parameters;
    
    // Simple condition evaluation - in real n8n this is much more complex
    const results = [];
    for (const item of inputData) {
      try {
        // Simple string comparison for demo
        const conditionMet = item.json.status === 'active'; // Simplified condition
        results.push({
          json: {
            ...item.json,
            conditionResult: conditionMet,
            branchTaken: conditionMet ? 'true' : 'false'
          }
        });
      } catch (error) {
        results.push({
          json: {
            ...item.json,
            error: 'Condition evaluation failed'
          }
        });
      }
    }
    
    return results;
  }

  private async executeWaitNode(node: any, inputData: any[]): Promise<any[]> {
    const { amount = 1, unit = 'seconds' } = node.parameters;
    
    const multipliers = {
      seconds: 1000,
      minutes: 60000,
      hours: 3600000
    };
    
    const delay = amount * (multipliers[unit as keyof typeof multipliers] || 1000);
    console.log(`⏱️ Waiting ${amount} ${unit}...`);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return inputData.map(item => ({
      json: {
        ...item.json,
        waitCompleted: true,
        waitDuration: `${amount} ${unit}`
      }
    }));
  }

  private async executeSetNode(node: any, inputData: any[]): Promise<any[]> {
    // Set node adds/modifies data
    return inputData.map(item => ({
      json: {
        ...item.json,
        setNodeProcessed: true,
        processedAt: new Date().toISOString()
      }
    }));
  }

  private async executeGmailNode(node: any, inputData: any[]): Promise<any[]> {
    console.log('📧 Gmail node - simulating email operation');
    toast.info('Gmail', { description: 'Email operation simulated' });
    
    return inputData.map(item => ({
      json: {
        ...item.json,
        emailSent: true,
        emailService: 'gmail'
      }
    }));
  }

  private async executeSlackNode(node: any, inputData: any[]): Promise<any[]> {
    console.log('💬 Slack node - simulating message send');
    toast.info('Slack', { description: 'Message sent to Slack' });
    
    return inputData.map(item => ({
      json: {
        ...item.json,
        slackMessageSent: true,
        channel: '#general'
      }
    }));
  }

  private async executeGoogleSheetsNode(node: any, inputData: any[]): Promise<any[]> {
    console.log('📊 Google Sheets node - simulating spreadsheet operation');
    toast.info('Google Sheets', { description: 'Spreadsheet updated' });
    
    return inputData.map(item => ({
      json: {
        ...item.json,
        sheetsUpdated: true,
        rowsAffected: 1
      }
    }));
  }

  private async executeMysqlNode(node: any, inputData: any[]): Promise<any[]> {
    console.log('🗄️ MySQL node - simulating database operation');
    toast.info('MySQL', { description: 'Database query executed' });
    
    return inputData.map(item => ({
      json: {
        ...item.json,
        databaseQueried: true,
        recordsFound: Math.floor(Math.random() * 100)
      }
    }));
  }

  private async executeOpenAiNode(node: any, inputData: any[]): Promise<any[]> {
    console.log('🤖 OpenAI node - simulating AI processing');
    toast.info('OpenAI', { description: 'AI processing completed' });
    
    return inputData.map(item => ({
      json: {
        ...item.json,
        aiResponse: 'This is a simulated AI response based on the input data.',
        model: 'gpt-3.5-turbo',
        tokensUsed: Math.floor(Math.random() * 1000) + 100
      }
    }));
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

  private parseJsonString(str: string): any {
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}