import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Clock, Webhook } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TriggerNodeProps {
  data: {
    label: string;
    config: {
      triggerType: 'manual' | 'schedule' | 'webhook' | 'event';
      schedule?: string;
      webhookPath?: string;
      eventType?: string;
    };
  };
  id: string;
}

export const TriggerNode = memo(({ data, id }: TriggerNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  const getIcon = () => {
    switch (config.triggerType) {
      case 'schedule': return <Clock className="w-4 h-4 text-workflow-trigger" />;
      case 'webhook': return <Webhook className="w-4 h-4 text-workflow-trigger" />;
      default: return <Zap className="w-4 h-4 text-workflow-trigger" />;
    }
  };

  const triggerManually = () => {
    // Simulate manual trigger
    console.log(`Manual trigger activated for workflow node ${id}`);
  };

  return (
    <Card className="workflow-node workflow-node--trigger min-w-[200px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {getIcon()}
          Trigger
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Trigger Type</Label>
          <Select value={config.triggerType} onValueChange={(value) => updateConfig('triggerType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="schedule">Schedule (Cron)</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
              <SelectItem value="event">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.triggerType === 'schedule' && (
          <div>
            <Label className="text-xs">Schedule (Cron)</Label>
            <Input
              placeholder="0 9 * * MON-FRI"
              value={config.schedule || ''}
              onChange={(e) => updateConfig('schedule', e.target.value)}
              className="text-xs"
            />
            <div className="text-xs text-muted-foreground mt-1">
              Example: "0 9 * * MON-FRI" (9 AM weekdays)
            </div>
          </div>
        )}

        {config.triggerType === 'webhook' && (
          <div>
            <Label className="text-xs">Webhook Path</Label>
            <Input
              placeholder="/trigger/workflow"
              value={config.webhookPath || ''}
              onChange={(e) => updateConfig('webhookPath', e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        {config.triggerType === 'event' && (
          <div>
            <Label className="text-xs">Event Type</Label>
            <Select value={config.eventType || ''} onValueChange={(value) => updateConfig('eventType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="file-upload">File Upload</SelectItem>
                <SelectItem value="user-signup">User Signup</SelectItem>
                <SelectItem value="form-submit">Form Submit</SelectItem>
                <SelectItem value="data-change">Data Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {config.triggerType === 'manual' && (
          <Button size="sm" onClick={triggerManually} className="w-full">
            <Zap className="w-3 h-3 mr-1" />
            Trigger Now
          </Button>
        )}
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});