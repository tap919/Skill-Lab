/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Workflow {
  nextSkillId?: string;
  triggerOnOutput?: string;
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
