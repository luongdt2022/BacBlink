import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
}

interface FormWizardProps {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
}

export function FormWizard({ steps, currentStep, children }: FormWizardProps) {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex flex-1 items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`flex size-10 items-center justify-center rounded-full border-2 transition-colors ${
                      isCompleted
                        ? 'border-primary bg-primary text-white'
                        : isActive
                        ? 'border-primary bg-white text-primary'
                        : 'border-[#e5e7eb] bg-white text-[#9ca3af]'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  
                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p
                      className={`${
                        isActive || isCompleted
                          ? 'text-primary'
                          : 'text-[#9ca3af]'
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-[#9ca3af]">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={`mx-4 h-0.5 flex-1 ${
                      isCompleted ? 'bg-primary' : 'bg-[#e5e7eb]'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="rounded-lg border border-[#e5e7eb] bg-white p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
