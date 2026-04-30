/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Skill, SkillExample } from "../types";
import { generateId } from "../lib/id";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface SkillProposal {
  name: string;
  description: string;
  instructions: string; // Simplified
  examples: Omit<SkillExample, 'id'>[];
  tags: string[];
  explanation: string;
  difficulty: number; // Simplified
  testScenarios: {
    input: string;
    expectedResult: string;
    category?: 'logic' | 'security' | 'performance' | 'edge_case';
  }[];
  traits: {
    label: string;
    value: boolean;
    description: string;
  }[];
  workflow?: {
    nextSkillId?: string;
    triggerOnOutput?: string;
  };
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    enabled: boolean;
  };
}

const SKILL_PROPOSAL_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Easy to remember name" },
    description: { type: Type.STRING, description: "What this does in simple words" },
    instructions: { type: Type.STRING, description: "The core logic for the assistant" },
    examples: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          output: { type: Type.STRING }
        },
        required: ["input", "output"]
      }
    },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    explanation: { type: Type.STRING, description: "Why this was built" },
    difficulty: { type: Type.NUMBER, description: "Effort level (0-100)" },
    testScenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          input: { type: Type.STRING },
          expectedResult: { type: Type.STRING, description: "What we expect to see" },
          category: { type: Type.STRING, enum: ["logic", "security", "performance", "edge_case"] }
        },
        required: ["input", "expectedResult", "category"]
      }
    },
    traits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.BOOLEAN },
          description: { type: Type.STRING }
        },
        required: ["label", "value", "description"]
      }
    },
    workflow: {
      type: Type.OBJECT,
      properties: {
        nextSkillId: { type: Type.STRING, description: "ID of the next skill in the chain (optional)" },
        triggerOnOutput: { type: Type.STRING, description: "Keywords that trigger the next step (optional)" }
      }
    },
    schedule: {
      type: Type.OBJECT,
      properties: {
        frequency: { type: Type.STRING, enum: ["manual", "hourly", "daily", "weekly"] },
        enabled: { type: Type.BOOLEAN }
      },
      required: ["frequency", "enabled"]
    }
  },
  required: ["name", "description", "instructions", "examples", "tags", "explanation", "traits", "difficulty", "testScenarios"]
};

export async function proposeSkill(userIntent: string): Promise<SkillProposal> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Architect a specialized AI skill based on this intent: "${userIntent}". 
      The skill should be designed for the Gemma local model family. 
      Focus on:
      1. Structured Data Output.
      2. Minimal token footprint for local execution.
      3. Resource complexity estimation (0-100).
      4. Comprehensive E2E test scenarios: must include at least one "logic" check and one "security" or "edge_case" check.
      5. 3-4 UI Traits (heuristic controls).
      6. Intelligent chaining/workflows (if applicable) and background schedules.
      7. For JS skills: Include tool call instructions using run_js tool if the skill needs custom logic.
      8. For native actions: Include tool call instructions using run_intent (e.g., send_email) if applicable.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: SKILL_PROPOSAL_SCHEMA,
        systemInstruction: `You are the lead architect of the "Gemma Forge". 
        Your goal is to turn vague ideas into high-performance, structured AI skills for Samsung Galaxy and Google Pixel on-device models.
        Focus on specialized prompts that give Gemma a distinct personality and utility.
        
        Edge Gallery Integration Tips:
        - For skills requiring custom logic: instruct the LLM to call \`run_js\` tool with script name "index.html" and JSON data
        - For skills needing native actions (email, etc.): instruct the LLM to call \`run_intent\` tool
        - Text-only skills work without any tool calls for basic LLM persona/instructions`
      }
    });

    const text = response.text.trim();
    if (!text) throw new Error("EMPTY_BRAIN_RESPONSE: The AI failed to manifest a valid blueprint.");
    return JSON.parse(text);
  } catch (err) {
    console.error("Propose Skill Error:", err);
    throw new Error(`AI_FORGE_FAILURE: ${err instanceof Error ? err.message : 'Unknown neural collapse'}`);
  }
}

export async function refineSkill(current: SkillProposal, feedback: string): Promise<SkillProposal> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { text: `Current Proposal: ${JSON.stringify(current)}` },
        { text: `User Feedback: ${feedback}` },
        { text: `Refine the proposal based on the feedback while maintaining high quality and updating complexity/test scenarios if needed.` }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: SKILL_PROPOSAL_SCHEMA,
        systemInstruction: `Maintain architectural integrity. Every update must refine the Gemma-optimized prompt and examples.
        Ensure the test scenarios remain comprehensive and relevant to the changes, including at least one logic check and one security or edge case check.`
      }
    });

    const text = response.text.trim();
    if (!text) throw new Error("EMPTY_REFINEMENT_RESPONSE: The AI failed to adjust the blueprint.");
    return JSON.parse(text);
  } catch (err) {
    console.error("Refine Skill Error:", err);
    throw new Error(`AI_REFINE_FAILURE: ${err instanceof Error ? err.message : 'Unknown neural collapse during adjustment'}`);
  }
}

export async function simulateSkill(instructions: string, examples: any[], userInput: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `${instructions}\n\nTypical Examples:\n${JSON.stringify(examples)}\n\nUser Question: ${userInput}`,
    config: {
      systemInstruction: `You are simulating a helpful phone assistant. 
      Answer the user based on the instructions provided.
      Be direct and useful.`
    }
  });

  return response.text.trim();
}

export async function synthesizeEntropySkill(seeds: { domain: string, capability: string, constraint: string }): Promise<SkillProposal> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `SYNTHESIS TARGET:
Domain: ${seeds.domain}
Capability: ${seeds.capability}
Constraint: ${seeds.constraint}

Generate a user-friendly Brain Blueprint for a specialized phone capability.
Include a clear, descriptive name.
Strictly optimize for local phone execution (simple words, high accuracy).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: SKILL_PROPOSAL_SCHEMA,
      systemInstruction: `You are the Synthesis Architect. Create a high-performance SkillProposal JSON.
      Ensure the instructions are deterministic and the test scenarios cover logic, security, and edge cases.`
    }
  });

  return JSON.parse(response.text.trim());
}

export interface AutoForgeOptions {
  userIntent: string;
  targetPlatform?: 'edge-gallery' | 'bixby' | 'generic';
  autoDetectJs?: boolean;
  forceJs?: boolean;
  generateTests?: boolean;
}

export interface AutoForgeResult {
  skill: SkillProposal;
  verification: {
    passed: boolean;
    testResults: { input: string; expected: string; actual: string; passed: boolean }[];
  };
  security: {
    score: number;
    leaks: string[];
    smells: string[];
  };
  export: {
    isJsSkill: boolean;
    needsSecret: boolean;
    toolCalls: { type: string; name: string }[];
  };
  errors: string[];
}

export async function autoForgeSkill(options: AutoForgeOptions): Promise<AutoForgeResult> {
  const { userIntent, targetPlatform = 'edge-gallery', autoDetectJs = true, forceJs = false, generateTests = true } = options;
  
  const errors: string[] = [];
  
  try {
    let proposal = await proposeSkill(userIntent);
    
    if (generateTests && proposal.testScenarios.length === 0) {
      proposal.testScenarios = [
        { input: "test input 1", expectedResult: "key result", category: "logic" },
        { input: "edge case", expectedResult: "fallback behavior", category: "edge_case" }
      ];
    }
    
    const testResults: AutoForgeResult['verification']['testResults'] = [];
    let testsPassed = true;
    
    if (generateTests && proposal.testScenarios.length > 0) {
      for (const scenario of proposal.testScenarios) {
        try {
          const actual = await simulateSkill(proposal.instructions, proposal.examples, scenario.input);
          const passed = actual.toLowerCase().includes(scenario.expectedResult.toLowerCase());
          testResults.push({
            input: scenario.input,
            expected: scenario.expectedResult,
            actual,
            passed
          });
          if (!passed) testsPassed = false;
        } catch (e) {
          testResults.push({
            input: scenario.input,
            expected: scenario.expectedResult,
            actual: 'ERROR',
            passed: false
          });
          testsPassed = false;
        }
      }
    }
    
    const securityLeaks: string[] = [];
    const securitySmells: string[] = [];
    const prompt = proposal.instructions.toLowerCase();
    
    if (prompt.includes('ignore') || prompt.includes('override')) {
      securitySmells.push("Instruction override risk detected");
    }
    if (prompt.includes('password') || prompt.includes('key') || prompt.includes('api_key')) {
      securityLeaks.push("Hardcoded secret patterns found");
    }
    if (proposal.instructions.length < 50) {
      securitySmells.push("Underspecified behavioral weights");
    }
    if (proposal.examples.length < 2) {
      securitySmells.push("Low few-shot density; higher hallucination risk");
    }
    
    const securityScore = Math.max(10, 100 - (securityLeaks.length * 20) - (securitySmells.length * 10));
    
    const isJsSkill = forceJs || autoDetectJs && (
      proposal.instructions.toLowerCase().includes('run_js') ||
      proposal.instructions.toLowerCase().includes('javascript') ||
      proposal.instructions.toLowerCase().includes('script')
    );
    
    const needsSecret = proposal.instructions.toLowerCase().includes('api key') ||
                       proposal.instructions.toLowerCase().includes('secret') ||
                       proposal.instructions.toLowerCase().includes('token');
    
    const toolCalls: { type: string; name: string }[] = [];
    if (proposal.instructions.toLowerCase().includes('run_js')) {
      toolCalls.push({ type: 'run_js', name: 'index.html' });
    }
    if (proposal.instructions.toLowerCase().includes('run_intent') || proposal.instructions.toLowerCase().includes('send_email')) {
      toolCalls.push({ type: 'run_intent', name: 'send_email' });
    }
    
    if (!testsPassed) {
      errors.push("Some test scenarios failed - skill may not work as expected");
    }
    if (securityScore < 70) {
      errors.push("Security score below threshold - review instructions");
    }
    
    return {
      skill: proposal,
      verification: {
        passed: testsPassed,
        testResults
      },
      security: {
        score: securityScore,
        leaks: securityLeaks,
        smells: securitySmells
      },
      export: {
        isJsSkill,
        needsSecret,
        toolCalls
      },
      errors
    };
  } catch (err) {
    throw new Error(`AUTO_FORGE_FAILURE: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function autoRefineFromFeedback(
  skill: SkillProposal, 
  userFeedback: string,
  failureExamples: { input: string; expected: string; actual: string }[]
): Promise<SkillProposal> {
  const refined = await refineSkill(skill, userFeedback);
  
  if (failureExamples.length > 0) {
    const newScenarios = failureExamples.map(f => ({
      input: f.input,
      expectedResult: f.expected,
      category: 'logic' as const
    }));
    refined.testScenarios = [...refined.testScenarios, ...newScenarios];
  }
  
  return refined;
}

export async function analyzePhoneState(analytics: any): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `PHONE ANALYTICS DATA:
${JSON.stringify(analytics, null, 2)}

Identify the single most impactful capability needed to optimize this environment.
Respond with a concise, 100-character max recommendation of a new skill to build.`,
    config: {
      systemInstruction: "You are the OS Intelligence Architect. Analyze phone telemetry and recommend specialized automation skills for Gemma local models."
    }
  });

  return response.text.trim();
}

export async function synthesizePhoneSkill(recommendation: string, context: any): Promise<SkillProposal> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `RECOMMENDATION: ${recommendation}
CONTEXT: ${JSON.stringify(context)}

Manifest a specialized SkillProposal JSON for this recommendation.
Optimize for on-device execution.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: SKILL_PROPOSAL_SCHEMA,
      systemInstruction: `You are the Auto-Forge Agent. Synthesize a complete blueprint based on OS analytics recommendations.
      Ensure the instructions are optimized for Gemma and the test scenarios cover logic, security, and edge cases.`
    }
  });

  return JSON.parse(response.text.trim());
}

