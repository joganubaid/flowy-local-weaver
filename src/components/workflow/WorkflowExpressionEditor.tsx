import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, Variable, Calculator, Database } from 'lucide-react';

interface ExpressionEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string;
  onChange: (value: string) => void;
  title?: string;
}

const EXPRESSION_HELPERS = [
  {
    category: 'Variables',
    icon: Variable,
    items: [
      { label: '$json', description: 'Current item data', example: '$json.name' },
      { label: '$input', description: 'Previous node output', example: '$input.all()' },
      { label: '$node', description: 'Specific node data', example: '$node["Node Name"].json' },
      { label: '$vars', description: 'Workflow variables', example: '$vars.myVariable' },
    ]
  },
  {
    category: 'Functions',
    icon: Calculator,
    items: [
      { label: 'String methods', description: 'Text manipulation', example: '$json.text.toLowerCase()' },
      { label: 'Date functions', description: 'Date operations', example: 'new Date().toISOString()' },
      { label: 'Math operations', description: 'Mathematical functions', example: 'Math.round($json.value)' },
      { label: 'Array methods', description: 'Array manipulation', example: '$json.items.length' },
    ]
  },
  {
    category: 'Conditionals',
    icon: Database,
    items: [
      { label: 'If statement', description: 'Conditional logic', example: '$json.status === "active" ? "yes" : "no"' },
      { label: 'Exists check', description: 'Check if value exists', example: '$json.email ? $json.email : "No email"' },
      { label: 'Comparison', description: 'Compare values', example: '$json.age >= 18' },
      { label: 'Boolean logic', description: 'AND/OR operations', example: '$json.active && $json.verified' },
    ]
  }
];

export const WorkflowExpressionEditor: React.FC<ExpressionEditorProps> = ({
  open,
  onOpenChange,
  value,
  onChange,
  title = "Expression Editor"
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleSave = () => {
    onChange(localValue);
    onOpenChange(false);
  };

  const insertExpression = (expression: string) => {
    setLocalValue(prev => prev + expression);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[60vh]">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Expression</label>
              <Textarea
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder="Enter your expression here..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Expression
              </Button>
            </div>
          </div>
          
          <div className="space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-sm">Expression Helpers</h3>
            
            {EXPRESSION_HELPERS.map((category) => (
              <Card key={category.category} className="p-3">
                <CardHeader className="p-0 pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <category.icon className="h-4 w-4" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors"
                      onClick={() => insertExpression(item.example)}
                    >
                      <div className="font-medium text-xs">{item.label}</div>
                      <div className="text-xs text-muted-foreground mb-1">{item.description}</div>
                      <Badge variant="secondary" className="text-xs font-mono">
                        {item.example}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};