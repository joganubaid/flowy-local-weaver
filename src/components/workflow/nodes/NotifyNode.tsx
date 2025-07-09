import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface NotifyNodeProps {
  data: {
    label: string;
    config: {
      title: string;
      message: string;
      type: string;
    };
  };
  id: string;
}

export const NotifyNode = memo(({ data, id }: NotifyNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <Card className="workflow-node workflow-node--notify min-w-[200px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-workflow-notify" />
          Notification
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Type</Label>
          <Select value={config.type} onValueChange={(value) => updateConfig('type', value)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs">Title</Label>
          <Input
            placeholder="Notification title"
            value={config.title}
            onChange={(e) => updateConfig('title', e.target.value)}
            className="text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">Message</Label>
          <Textarea
            placeholder="Notification message"
            value={config.message}
            onChange={(e) => updateConfig('message', e.target.value)}
            className="text-xs min-h-[60px] resize-none"
          />
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});