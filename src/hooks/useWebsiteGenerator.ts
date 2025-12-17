import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  agent: string;
  message: string;
  color: string;
}

export interface GenerationState {
  isGenerating: boolean;
  currentPhase: "idle" | "discussing" | "coding" | "complete";
  activeAgent: string | null;
  messages: Message[];
  generatedCode: string;
  error: string | null;
}

const AGENTS = [
  { name: "Architect", color: "cyan" },
  { name: "Designer", color: "purple" },
  { name: "Frontend", color: "pink" },
  { name: "Backend", color: "orange" },
  { name: "Optimizer", color: "green" },
];

export const useWebsiteGenerator = () => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    currentPhase: "idle",
    activeAgent: null,
    messages: [],
    generatedCode: "",
    error: null,
  });

  const generateWebsite = useCallback(async (prompt: string, referenceDescriptions?: string[]) => {
    setState({
      isGenerating: true,
      currentPhase: "discussing",
      activeAgent: null,
      messages: [],
      generatedCode: "",
      error: null,
    });

    try {
      const response = await supabase.functions.invoke("generate-website", {
        body: { 
          prompt,
          references: referenceDescriptions || []
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to generate website");
      }

      const data = response.data;

      // Process discussion messages
      if (data.discussion) {
        const discussionMessages: Message[] = data.discussion.map(
          (msg: { agent: string; message: string }, index: number) => ({
            agent: msg.agent,
            message: msg.message,
            color: AGENTS[index % AGENTS.length].color,
          })
        );

        setState((prev) => ({
          ...prev,
          messages: discussionMessages,
          currentPhase: "coding",
        }));
      }

      // Set generated code
      if (data.code) {
        setState((prev) => ({
          ...prev,
          generatedCode: data.code,
          currentPhase: "complete",
          isGenerating: false,
        }));
      }
    } catch (error) {
      console.error("Generation error:", error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "An error occurred",
        isGenerating: false,
        currentPhase: "idle",
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      currentPhase: "idle",
      activeAgent: null,
      messages: [],
      generatedCode: "",
      error: null,
    });
  }, []);

  return {
    ...state,
    generateWebsite,
    reset,
    agents: AGENTS,
  };
};
