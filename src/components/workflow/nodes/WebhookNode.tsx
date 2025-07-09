import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Webhook, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface WebhookNodeProps {
  data: {
    label: string;
    config: {
      path: string;
      method: string;
    };
  };
  id: string;
}

export const WebhookNode = memo(({ data, id }: WebhookNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  const copyWebhookUrl = () => {
    const url = `http://localhost:3001${config.path}`;
    navigator.clipboard.writeText(url);
    toast.success('Webhook URL copied to clipboard!');
  };

  return (
    <Card className="workflow-node workflow-node--webhook min-w-[220px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Webhook className="w-4 h-4 text-workflow-webhook" />
          Webhook Trigger
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Method</Label>
          <Select value={config.method} onValueChange={(value) => updateConfig('method', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Path</Label>
          <Input
            placeholder="/webhook"
            value={config.path}
            onChange={(e) => updateConfig('path', e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Webhook URL:</div>
          <div className="flex items-center gap-2">
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              localhost:3001{config.path}
            </code>
            <Button size="sm" variant="ghost" onClick={copyWebhookUrl}>
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});