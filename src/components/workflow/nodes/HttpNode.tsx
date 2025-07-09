import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Globe, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HttpNodeProps {
  data: {
    label: string;
    config: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: string;
    };
  };
  id: string;
}

export const HttpNode = memo(({ data, id }: HttpNodeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    // Update the node data in the flow
    data.config = newConfig;
  };

  return (
    <Card className="workflow-node workflow-node--http min-w-[200px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-workflow-http" />
          HTTP Request
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Select value={config.method} onValueChange={(value) => updateConfig('method', value)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="URL"
            value={config.url}
            onChange={(e) => updateConfig('url', e.target.value)}
            className="flex-1 text-xs"
          />
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full">
              <Settings className="w-3 h-3 mr-1" />
              {isOpen ? 'Less' : 'More'} Options
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Headers (JSON)</Label>
              <Input
                placeholder='{"Content-Type": "application/json"}'
                className="text-xs"
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value || '{}');
                    updateConfig('headers', headers);
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
              />
            </div>
            {(config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH') && (
              <div>
                <Label className="text-xs">Body</Label>
                <Input
                  placeholder="Request body"
                  value={config.body || ''}
                  onChange={(e) => updateConfig('body', e.target.value)}
                  className="text-xs"
                />
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});