import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Puzzle, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface IntegrationNodeProps {
  data: {
    label: string;
    config: {
      service: string;
      action: string;
      credentials?: Record<string, string>;
      parameters?: Record<string, any>;
    };
  };
  id: string;
}

const integrations = {
  'google-sheets': {
    name: 'Google Sheets',
    actions: ['read-rows', 'append-row', 'update-row', 'create-sheet'],
    credentials: ['api-key', 'spreadsheet-id']
  },
  'slack': {
    name: 'Slack',
    actions: ['send-message', 'create-channel', 'invite-user'],
    credentials: ['bot-token', 'channel-id']
  },
  'notion': {
    name: 'Notion',
    actions: ['create-page', 'update-page', 'query-database'],
    credentials: ['api-key', 'database-id']
  },
  'gmail': {
    name: 'Gmail',
    actions: ['send-email', 'read-emails', 'create-label'],
    credentials: ['api-key', 'email']
  },
  'telegram': {
    name: 'Telegram',
    actions: ['send-message', 'send-photo', 'create-group'],
    credentials: ['bot-token', 'chat-id']
  }
};

export const IntegrationNode = memo(({ data, id }: IntegrationNodeProps) => {
  const [config, setConfig] = useState(data.config);
  const [isOpen, setIsOpen] = useState(false);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  const updateCredential = (key: string, value: string) => {
    const credentials = { ...config.credentials, [key]: value };
    updateConfig('credentials', credentials);
  };

  const updateParameter = (key: string, value: any) => {
    const parameters = { ...config.parameters, [key]: value };
    updateConfig('parameters', parameters);
  };

  const selectedIntegration = integrations[config.service as keyof typeof integrations];

  return (
    <Card className="workflow-node workflow-node--integration min-w-[220px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-workflow-integration" />
          Integration
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Service</Label>
          <Select value={config.service} onValueChange={(value) => updateConfig('service', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(integrations).map(([key, integration]) => (
                <SelectItem key={key} value={key}>
                  {integration.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedIntegration && (
          <div>
            <Label className="text-xs">Action</Label>
            <Select value={config.action} onValueChange={(value) => updateConfig('action', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                {selectedIntegration.actions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedIntegration && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                <Settings className="w-3 h-3 mr-1" />
                {isOpen ? 'Less' : 'More'} Configuration
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-2">
              <div>
                <Label className="text-xs font-medium">Credentials</Label>
                {selectedIntegration.credentials.map((credKey) => (
                  <div key={credKey} className="mt-1">
                    <Label className="text-xs">{credKey}</Label>
                    <Input
                      type={credKey.includes('token') || credKey.includes('key') ? 'password' : 'text'}
                      placeholder={`Enter ${credKey}`}
                      value={config.credentials?.[credKey] || ''}
                      onChange={(e) => updateCredential(credKey, e.target.value)}
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
              
              <div>
                <Label className="text-xs font-medium">Parameters</Label>
                <Textarea
                  placeholder='{"message": "Hello {{data.name}}", "channel": "#general"}'
                  value={JSON.stringify(config.parameters || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const params = JSON.parse(e.target.value || '{}');
                      updateConfig('parameters', params);
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  className="text-xs h-20"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});