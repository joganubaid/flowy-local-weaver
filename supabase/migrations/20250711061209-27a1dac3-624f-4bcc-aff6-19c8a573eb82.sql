-- Create workflows table for saving user workflows
CREATE TABLE public.workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  workflow_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own workflows" 
ON public.workflows 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" 
ON public.workflows 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
ON public.workflows 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
ON public.workflows 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create workflow executions table for tracking execution history
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  execution_data JSONB,
  error_message TEXT
);

-- Enable RLS for executions
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own executions" 
ON public.workflow_executions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own executions" 
ON public.workflow_executions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create workflow templates table
CREATE TABLE public.workflow_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  workflow_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for templates
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view public templates" 
ON public.workflow_templates 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create templates" 
ON public.workflow_templates 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Create credentials table for secure API key storage
CREATE TABLE public.user_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Enable RLS for credentials
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own credentials" 
ON public.user_credentials 
FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at
  BEFORE UPDATE ON public.user_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample templates
INSERT INTO public.workflow_templates (name, description, category, workflow_data) VALUES
(
  'HTTP API Request',
  'Simple HTTP request to an API endpoint',
  'API',
  '{"nodes":[{"id":"trigger","type":"trigger","position":{"x":100,"y":100},"data":{"label":"Manual Trigger"}},{"id":"http","type":"http","position":{"x":300,"y":100},"data":{"method":"GET","url":"https://api.example.com/data"}}],"edges":[{"id":"e1","source":"trigger","target":"http"}]}'
),
(
  'Data Processing Pipeline',
  'Process and transform data with functions',
  'Data',
  '{"nodes":[{"id":"webhook","type":"webhook","position":{"x":100,"y":100},"data":{"path":"/webhook"}},{"id":"function","type":"function","position":{"x":300,"y":100},"data":{"code":"return { processed: true, data: items }"}},{"id":"notify","type":"notify","position":{"x":500,"y":100},"data":{"message":"Data processed successfully"}}],"edges":[{"id":"e1","source":"webhook","target":"function"},{"id":"e2","source":"function","target":"notify"}]}'
),
(
  'Conditional Logic Flow',
  'Route data based on conditions',
  'Logic',
  '{"nodes":[{"id":"trigger","type":"trigger","position":{"x":100,"y":100},"data":{"label":"Manual Trigger"}},{"id":"if","type":"if","position":{"x":300,"y":100},"data":{"condition":"{{$json.value}} > 100"}},{"id":"notify1","type":"notify","position":{"x":500,"y":50},"data":{"message":"High value detected"}},{"id":"notify2","type":"notify","position":{"x":500,"y":150},"data":{"message":"Normal value"}}],"edges":[{"id":"e1","source":"trigger","target":"if"},{"id":"e2","source":"if","sourceHandle":"true","target":"notify1"},{"id":"e3","source":"if","sourceHandle":"false","target":"notify2"}]}'
);