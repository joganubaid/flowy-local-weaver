import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Workflow, Settings, Save } from 'lucide-react';

interface OnboardingTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOUR_STEPS = [
  {
    title: "Welcome to Workflow Builder",
    description: "Create powerful automation workflows with our visual drag-and-drop editor.",
    icon: Workflow,
    content: "This tool helps you build complex workflows by connecting different nodes that perform specific actions. Each node represents a step in your automation process."
  },
  {
    title: "Node Palette",
    description: "Browse and drag nodes from the left sidebar to build your workflow.",
    icon: Play,
    content: "The left sidebar contains all available nodes organized by categories like Triggers, Actions, Logic, and Integrations. Simply drag any node onto the canvas to start building."
  },
  {
    title: "Connecting Nodes",
    description: "Connect nodes by dragging from output handles to input handles.",
    icon: Settings,
    content: "Each node has connection points (handles). Drag from the output handle of one node to the input handle of another to create a connection and define the flow of data."
  },
  {
    title: "Configuring Nodes",
    description: "Click on any node to configure its settings and parameters.",
    icon: Settings,
    content: "Most nodes require configuration such as API endpoints, conditions, or data transformations. Click on a node to open its configuration panel."
  },
  {
    title: "Saving & Executing",
    description: "Save your workflows and execute them to see the results.",
    icon: Save,
    content: "Use the toolbar to save your workflow, execute it for testing, and manage your saved workflows. You can also access templates and settings from the top toolbar."
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finish = () => {
    onOpenChange(false);
    setCurrentStep(0);
  };

  const currentTourStep = TOUR_STEPS[currentStep];
  const StepIcon = currentTourStep.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StepIcon className="h-5 w-5 text-primary" />
            Getting Started Tour
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {TOUR_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep
                      ? 'bg-primary'
                      : index < currentStep
                      ? 'bg-primary/50'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StepIcon className="h-6 w-6 text-primary" />
                {currentTourStep.title}
              </CardTitle>
              <CardDescription>{currentTourStep.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentTourStep.content}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {TOUR_STEPS.length}
            </span>

            {currentStep === TOUR_STEPS.length - 1 ? (
              <Button onClick={finish}>
                Get Started
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};