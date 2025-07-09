import { Button } from '@/components/ui/button';
import { 
  Globe, 
  GitBranch, 
  Code, 
  Clock, 
  Webhook, 
  Bell 
} from 'lucide-react';

interface NodePaletteProps {
  onAddNode: (type: string) => void;
}

const nodeConfig = [
  {
    type: 'http',
    label: 'HTTP Request',
    icon: Globe,
    description: 'Make HTTP requests to APIs',
    color: 'workflow-http'
  },
  {
    type: 'if',
    label: 'IF Condition',
    icon: GitBranch,
    description: 'Conditional logic branching',
    color: 'workflow-logic'
  },
  {
    type: 'function',
    label: 'Function',
    icon: Code,
    description: 'Execute custom JavaScript',
    color: 'workflow-function'
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Add time delays',
    color: 'workflow-delay'
  },
  {
    type: 'webhook',
    label: 'Webhook',
    icon: Webhook,
    description: 'Listen for HTTP requests',
    color: 'workflow-webhook'
  },
  {
    type: 'notify',
    label: 'Notify',
    icon: Bell,
    description: 'Send notifications',
    color: 'workflow-notify'
  }
];

export const NodePalette = ({ onAddNode }: NodePaletteProps) => {
  return (
    <div className="space-y-2">
      {nodeConfig.map((node) => {
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
  );
};