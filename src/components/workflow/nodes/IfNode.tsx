import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IfNodeProps {
  data: {
    label: string;
    config: {
      condition: string;
      trueOutput: string;
      falseOutput: string;
    };
  };
  id: string;
}

export const IfNode = memo(({ data, id }: IfNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <Card className="workflow-node workflow-node--logic min-w-[220px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-workflow-logic" />
          IF Condition
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Condition (JavaScript)</Label>
          <Input
            placeholder="data.status === 'success'"
            value={config.condition}
            onChange={(e) => updateConfig('condition', e.target.value)}
            className="text-xs font-mono"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-green-600">True Output</Label>
            <Input
              placeholder="success"
              value={config.trueOutput}
              onChange={(e) => updateConfig('trueOutput', e.target.value)}
              className="text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-red-600">False Output</Label>
            <Input
              placeholder="failure"
              value={config.falseOutput}
              onChange={(e) => updateConfig('falseOutput', e.target.value)}
              className="text-xs"
            />
          </div>
        </div>
      </CardContent>

      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="true"
        style={{ left: '25%' }}
        className="workflow-handle source"
      />
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="false"
        style={{ left: '75%' }}
        className="workflow-handle source"
      />
    </Card>
  );
});