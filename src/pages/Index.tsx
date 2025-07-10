import { ReactFlowProvider } from '@xyflow/react';
import { N8nEditor } from '@/components/n8n/N8nEditor';

const Index = () => {
  return (
    <ReactFlowProvider>
      <N8nEditor />
    </ReactFlowProvider>
  );
};

export default Index;
