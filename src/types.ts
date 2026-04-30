/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ToolCall = 
  | { type: 'run_js'; scriptName?: string; data: string }
  | { type: 'run_intent'; intent: string; parameters: string }
  | { type: 'custom'; name: string; parameters: string };

export interface Workflow {
  nextSkillId?: string;
  triggerOnOutput?: string;
}

export type SkillOutputFormat = 'json' | 'skill_md';

export interface EdgeGalleryConfig {
  isJsSkill: boolean;
  requireSecret: boolean;
  secretDescription?: string;
  toolCalls: ToolCall[];
  homepage?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  instructions: string;
  examples: SkillExample[];
  author: string;
  authorId: string;
  authorEmail?: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  version: string;
  isPublic: boolean;
  difficulty?: number;
  testScenarios?: {
    input: string;
    expectedResult: string;
    category?: 'logic' | 'security' | 'performance' | 'edge_case';
  }[];
  workflow?: Workflow;
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    enabled: boolean;
  };
  isVerified?: boolean;
  securityScore?: number;
  
  // Edge Gallery-specific fields
  outputFormat?: SkillOutputFormat;
  edgeGallery?: EdgeGalleryConfig;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  instructions: string; // Simplified from systemPrompt
  examples: SkillExample[];
  author: string;
  authorId: string;
  authorEmail?: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
  version: string;
  isPublic: boolean;
  difficulty?: number; // Simplified from complexity
  testScenarios?: {
    input: string;
    expectedResult: string;
    category?: 'logic' | 'security' | 'performance' | 'edge_case';
  }[];
  // New features
  workflow?: Workflow;
  schedule?: {
    frequency: 'manual' | 'hourly' | 'daily' | 'weekly';
    enabled: boolean;
  };
isVerified?: boolean;
  securityScore?: number;
}

export interface SkillExample {
  id: string;
  input: string;
  output: string;
}

export type ViewMode = 'gallery' | 'builder' | 'settings' | 'import' | 'forge';
