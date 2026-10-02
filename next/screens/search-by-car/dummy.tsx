"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";

export default function SearchByCarDummy() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Get step from URL parameter
  useEffect(() => {
    const stepParam = searchParams?.get("step");
    const step = stepParam ? parseInt(stepParam) : 1;
    setCurrentStep(step);
  }, [searchParams]);

  // Update URL when step changes
  const updateStepInUrl = (step: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("step", step.toString());
    router.push(url.pathname + url.search);
  };

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 7) {
      updateStepInUrl(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      updateStepInUrl(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    updateStepInUrl(step);
  };

  // Step configuration
  const steps = [
    { id: 1, name: "Make", group: "BODY" },
    { id: 2, name: "Model", group: "BODY" },
    { id: 3, name: "Year", group: "BODY" },
    { id: 4, name: "Type", group: "BODY" },
    { id: 5, name: "Engine", group: "ENGINE" },
    { id: 6, name: "Trim", group: "TRIM" },
    { id: 7, name: "Confirmation", group: "CONFIRMATION" },
  ];

  // Get current step info
  const currentStepInfo = steps.find((step) => step.id === currentStep);

  // Determine which group is active
  const getActiveGroup = () => {
    if (currentStep <= 4) return "BODY";
    if (currentStep === 5) return "ENGINE";
    if (currentStep === 6) return "TRIM";
    return "CONFIRMATION";
  };

  // Check if a group is completed
  const isGroupCompleted = (group: string) => {
    switch (group) {
      case "BODY":
        return currentStep > 4;
      case "ENGINE":
        return currentStep > 5;
      case "TRIM":
        return currentStep > 6;
      default:
        return false;
    }
  };

  return (
    <Box className="min-h-screen bg-gray-50 p-4">
      <VStack className="mx-auto max-w-4xl" space="lg">
        {/* Header */}
        <Box className="w-full rounded-lg bg-white p-6 shadow-sm">
          <Text className="mb-2 text-2xl font-bold text-gray-900">Search By Car</Text>
          <Text className="text-gray-600">
            Current Step: {currentStep} - {currentStepInfo?.name}
          </Text>
        </Box>

        {/* Stepper */}
        <Box className="w-full rounded-lg bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">Progress Tracker</Text>

          <HStack className="mb-6 justify-between" space="md">
            {["BODY", "ENGINE", "TRIM"]?.map((group) => (
              <Box
                key={group}
                className={`flex-1 rounded-lg border-2 p-4 ${
                  getActiveGroup() === group
                    ? "border-blue-500 bg-blue-50"
                    : isGroupCompleted(group)
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                }`}
              >
                <HStack className="items-center justify-between">
                  <Text
                    className={`font-semibold ${
                      getActiveGroup() === group
                        ? "text-blue-700"
                        : isGroupCompleted(group)
                          ? "text-green-700"
                          : "text-gray-500"
                    }`}
                  >
                    {group}
                  </Text>
                  {isGroupCompleted(group) && <Text className="text-xl text-green-600">✓</Text>}
                </HStack>
              </Box>
            ))}
          </HStack>

          {/* Step Dots */}
          <HStack className="justify-center" space="sm">
            {steps?.map((step) => (
              <Box
                key={step.id}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${
                  currentStep === step.id
                    ? "bg-blue-500 text-white"
                    : currentStep > step.id
                      ? "bg-green-500 text-white"
                      : "bg-gray-300 text-gray-600"
                }`}
                onClick={() => goToStep(step.id)}
              >
                {currentStep > step.id ? "✓" : step.id}
              </Box>
            ))}
          </HStack>
        </Box>

        {/* Step Content */}
        <Box className="w-full rounded-lg bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Step {currentStep}: {currentStepInfo?.name}
          </Text>

          <Box className="rounded-lg bg-gray-100 p-4">
            <Text className="text-gray-700">
              This is a dummy content for step {currentStep}. In the real implementation, this will
              contain the actual step content.
            </Text>
          </Box>
        </Box>

        {/* Navigation */}
        <Box className="w-full rounded-lg bg-white p-6 shadow-sm">
          <HStack className="justify-between" space="md">
            <Button
              onPress={goToPreviousStep}
              disabled={currentStep === 1}
              className={`rounded-lg px-6 py-2 ${
                currentStep === 1
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </Button>

            <Text className="text-gray-600">
              Step {currentStep} of {steps.length}
            </Text>

            <Button
              onPress={goToNextStep}
              disabled={currentStep === 7}
              className={`rounded-lg px-6 py-2 ${
                currentStep === 7
                  ? "cursor-not-allowed bg-gray-300 text-gray-500"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </Button>
          </HStack>
        </Box>

        {/* URL Display */}
        <Box className="w-full rounded-lg bg-gray-100 p-4">
          <Text className="mb-2 text-sm text-gray-600">Current URL:</Text>
          <Text className="rounded border bg-white p-2 font-mono text-xs">
            {window.location.href}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
