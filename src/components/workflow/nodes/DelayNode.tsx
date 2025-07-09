import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DelayNodeProps {
  data: {
    label: string;
    config: {
      duration: number;
    };
  };
  id: string;
}

export const DelayNode = memo(({ data, id }: DelayNodeProps) => {
  const [config, setConfig] = useState(data.config);
  const [unit, setUnit] = useState('ms');

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  const updateDuration = (value: string, timeUnit: string) => {
    const num = parseInt(value) || 0;
    let milliseconds = num;
    
    switch (timeUnit) {
      case 's':
        milliseconds = num * 1000;
        break;
      case 'm':
        milliseconds = num * 60 * 1000;
        break;
      case 'h':
        milliseconds = num * 60 * 60 * 1000;
        break;
    }
    
    updateConfig('duration', milliseconds);
  };

  const getDisplayValue = () => {
    switch (unit) {
      case 's':
        return Math.round(config.duration / 1000);
      case 'm':
        return Math.round(config.duration / (60 * 1000));
      case 'h':
        return Math.round(config.duration / (60 * 60 * 1000));
      default:
        return config.duration;
    }
  };

  return (
    <Card className="workflow-node workflow-node--delay min-w-[180px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 text-workflow-delay" />
          Delay
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Duration</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="1"
              value={getDisplayValue()}
              onChange={(e) => updateDuration(e.target.value, unit)}
              className="text-xs"
            />
            <Select value={unit} onValueChange={(value) => {
              setUnit(value);
              updateDuration(getDisplayValue().toString(), value);
            }}>
              <SelectTrigger className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ms">ms</SelectItem>
                <SelectItem value="s">s</SelectItem>
                <SelectItem value="m">m</SelectItem>
                <SelectItem value="h">h</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Will wait {config.duration}ms before continuing
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
    </Card>
  );
});