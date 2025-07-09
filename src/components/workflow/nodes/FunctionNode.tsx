import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Code } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FunctionNodeProps {
  data: {
    label: string;
    config: {
      code: string;
      timeout?: number;
    };
  };
  id: string;
}

export const FunctionNode = memo(({ data, id }: FunctionNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  return (
    <Card className="workflow-node workflow-node--function min-w-[250px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Code className="w-4 h-4 text-workflow-function" />
          Function
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">JavaScript Code</Label>
          <Textarea
            placeholder="return { ...data, processed: true };"
            value={config.code}
            onChange={(e) => updateConfig('code', e.target.value)}
            className="text-xs font-mono min-h-[80px] resize-none"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Available: <code>data</code> (input data), <code>console</code>, <code>Math</code>, <code>Date</code>
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});