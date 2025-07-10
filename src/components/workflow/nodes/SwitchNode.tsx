import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { GitBranch, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SwitchCase {
  id: string;
  condition: string;
  output: string;
}

interface SwitchNodeProps {
  data: {
    label: string;
    config: {
      inputPath: string;
      cases: SwitchCase[];
      defaultOutput?: string;
    };
  };
  id: string;
}

export const SwitchNode = memo(({ data, id }: SwitchNodeProps) => {
  const [config, setConfig] = useState(data.config);

  const updateConfig = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    data.config = newConfig;
  };

  const addCase = () => {
    const newCase: SwitchCase = {
      id: `case-${Date.now()}`,
      condition: '',
      output: ''
    };
    updateConfig('cases', [...config.cases, newCase]);
  };

  const removeCase = (caseId: string) => {
    updateConfig('cases', config.cases.filter(c => c.id !== caseId));
  };

  const updateCase = (caseId: string, key: string, value: string) => {
    const updatedCases = config.cases.map(c => 
      c.id === caseId ? { ...c, [key]: value } : c
    );
    updateConfig('cases', updatedCases);
  };

  return (
    <Card className="workflow-node workflow-node--switch min-w-[250px]">
      <Handle type="target" position={Position.Top} className="workflow-handle target" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-workflow-switch" />
          Switch
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">Input Path</Label>
          <Input
            placeholder="data.type"
            value={config.inputPath}
            onChange={(e) => updateConfig('inputPath', e.target.value)}
            className="text-xs"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Cases</Label>
            <Button size="sm" variant="outline" onClick={addCase}>
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          {config.cases.map((switchCase, index) => (
            <div key={switchCase.id} className="border rounded p-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Case {index + 1}</span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => removeCase(switchCase.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Input
                placeholder="=== 'success'"
                value={switchCase.condition}
                onChange={(e) => updateCase(switchCase.id, 'condition', e.target.value)}
                className="text-xs"
              />
              <Input
                placeholder="Output value"
                value={switchCase.output}
                onChange={(e) => updateCase(switchCase.id, 'output', e.target.value)}
                className="text-xs"
              />
            </div>
          ))}
        </div>

        <div>
          <Label className="text-xs">Default Output</Label>
          <Input
            placeholder="No match"
            value={config.defaultOutput || ''}
            onChange={(e) => updateConfig('defaultOutput', e.target.value)}
            className="text-xs"
          />
        </div>
      </CardContent>

      <Handle type="source" position={Position.Bottom} className="workflow-handle source" />
      {config.cases.map((_, index) => (
        <Handle 
          key={`case-${index}`}
          type="source" 
          position={Position.Right} 
          id={`case-${index}`}
          style={{ top: `${40 + (index * 30)}px` }}
          className="workflow-handle source" 
        />
      ))}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="default"
        style={{ top: `${40 + (config.cases.length * 30)}px` }}
        className="workflow-handle source" 
      />
    </Card>
  );
});