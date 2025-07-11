import { Button } from '@/components/ui/button';
import { 
  Globe, 
  GitBranch, 
  Code, 
  Clock, 
  Webhook, 
  Bell,
  Zap,
  RotateCw,
  Puzzle
} from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

const nodeConfig = [
  {
    type: 'trigger',
    label: 'Trigger',
    icon: Zap,
    description: 'Start workflow execution',
    color: 'primary',
    category: 'Triggers'
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    description: 'Listen for HTTP requests',
    color: 'workflow-webhook',
    category: 'Triggers'
  },
  {
    type: 'http',
    label: 'HTTP Request',
    icon: Globe,
    description: 'Make HTTP requests to APIs',
    color: 'workflow-http',
    category: 'Actions'
  },
  {
    type: 'integration',
    label: 'Integration',
    icon: Puzzle,
    description: 'Connect to external services',
    color: 'blue-500',
    category: 'Actions'
  },
  {
    type: 'function',
    label: 'Function',
    icon: Code,
    description: 'Execute custom JavaScript',
    color: 'workflow-function',
    category: 'Logic'
  },
  {
    type: 'if',
    label: 'IF Condition',
    icon: GitBranch,
    description: 'Conditional logic branching',
    color: 'workflow-logic',
    category: 'Logic'
  },
  {
    type: 'switch',
    label: 'Switch',
    icon: GitBranch,
    description: 'Multi-way branching',
    color: 'yellow-500',
    category: 'Logic'
  },
  {
    type: 'loop',
    label: 'Loop',
    icon: RotateCw,
    description: 'Iterate over data',
    color: 'cyan-500',
    category: 'Logic'
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Add time delays',
    color: 'workflow-delay',
    category: 'Utilities'
  },
  {
    type: 'notify',
    label: 'Notify',
    icon: Bell,
    description: 'Send notifications',
    color: 'workflow-notify',
    category: 'Utilities'
  }
];

export const NodePalette = ({ onAddNode }: NodePaletteProps) => {
  const categories = [...new Set(nodeConfig.map(node => node.category))];
  
  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
            {category}
          </h4>
          <div className="space-y-1">
            {nodeConfig
              .filter(node => node.category === category)
              .map((node) => {
                const IconComponent = node.icon;
                return (
                  <Button
                    key={node.type}
                    variant="outline"
                    className="w-full justify-start h-auto p-3 hover:shadow-md transition-all"
                    onClick={() => onAddNode(node.type)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-1 rounded bg-${node.color}/10`}>
                        <IconComponent className={`w-4 h-4 text-${node.color}`} />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm">{node.label}</div>
                        <div className="text-xs text-muted-foreground">{node.description}</div>
                      </div>
                    </div>
                  </Button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
};