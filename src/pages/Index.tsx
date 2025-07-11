import { ReactFlowProvider } from '@xyflow/react';
import { EnhancedN8nEditor } from '@/components/n8n/EnhancedN8nEditor';

const Index = () => {
  return (
    <ReactFlowProvider>
      <EnhancedN8nEditor />
    </ReactFlowProvider>
  );
};

export default Index;
