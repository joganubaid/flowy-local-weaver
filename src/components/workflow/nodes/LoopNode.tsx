import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { RotateCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface LoopNodeProps {
  data: {
    label: string;
    config: {
      loopType: 'array' | 'count' | 'while';
      arrayPath?: string;
      count?: number;
      condition?: string;
    };
  };
  id: string;
}

export const LoopNode = memo(({ data, id }: LoopNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <Card className="workflow-node workflow-node--loop min-w-[200px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-workflow-loop" />
          Loop
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Loop Type</Label>
          <Select value={config.loopType} onValueChange={(value) => updateConfig('loopType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="array">For Each (Array)</SelectItem>
              <SelectItem value="count">For Count</SelectItem>
              <SelectItem value="while">While Condition</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {config.loopType === 'array' && (
          <div>
            <Label className="text-xs">Array Path</Label>
            <Input
              placeholder="data.items"
              value={config.arrayPath || ''}
              onChange={(e) => updateConfig('arrayPath', e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        {config.loopType === 'count' && (
          <div>
            <Label className="text-xs">Count</Label>
            <Input
              type="number"
              placeholder="5"
              value={config.count || ''}
              onChange={(e) => updateConfig('count', parseInt(e.target.value) || 0)}
              className="text-xs"
            />
          </div>
        )}

        {config.loopType === 'while' && (
          <div>
            <Label className="text-xs">Condition</Label>
            <Textarea
              placeholder="data.hasMore === true"
              value={config.condition || ''}
              onChange={(e) => updateConfig('condition', e.target.value)}
              className="text-xs h-16"
            />
          </div>
        )}
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
      <Handle type="source" position={Position.Right} id="loop-body" className="workflow-handle source" />
    </Card>
  );
});