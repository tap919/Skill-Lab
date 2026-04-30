/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skill, ToolCall } from '../types';

/**
 * Convert a skill name to kebab-case for Edge Gallery folder naming
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Generate YAML frontmatter for SKILL.md
 */
function generateFrontmatter(skill: Skill): string {
  const kebabName = toKebabCase(skill.name);
  
  const meta: string[] = [
    `name: ${kebabName}`,
    `description: ${skill.description}`
  ];

  if (skill.edgeGallery?.homepage) {
    meta.push(`homepage: ${skill.edgeGallery.homepage}`);
  }

  if (skill.edgeGallery?.requireSecret) {
    meta.push('metadata:');
    meta.push('  require-secret: true');
    if (skill.edgeGallery.secretDescription) {
      meta.push(`  require-secret-description: ${skill.edgeGallery.secretDescription}`);
    }
  }

  return `---\n${meta.join('\n')}\n---`;
}

/**
 * Generate the instruction section for SKILL.md
 */
function generateInstructions(skill: Skill): string {
  let instructions = skill.instructions;

  // If this is a JS skill with tool calls, add the tool invocation instructions
  if (skill.edgeGallery?.isJsSkill && skill.edgeGallery.toolCalls?.length > 0) {
    const toolCallsSection = generateToolCallInstructions(skill.edgeGallery.toolCalls);
    instructions = `${instructions}\n\n## Tool Integration\n\n${toolCallsSection}`;
  }

  // If workflow is defined, add chaining instructions
  if (skill.workflow?.nextSkillId) {
    const workflowSection = `
## Workflow Chaining

When your output contains "${skill.workflow.triggerOnOutput || 'done'}", the next skill will be triggered automatically.
Skill ID: ${skill.workflow.nextSkillId}`;
    instructions = `${instructions}${workflowSection}`;
  }

  // If schedule is enabled, add scheduling info
  if (skill.schedule?.enabled) {
    const scheduleSection = `
## Scheduled Execution

This skill can run automatically on a ${skill.schedule.frequency} schedule.`;
    instructions = `${instructions}${scheduleSection}`;
  }

  return instructions;
}

/**
 * Generate tool call instructions for the LLM
 */
function generateToolCallInstructions(toolCalls: ToolCall[]): string {
  const lines: string[] = [];

  for (const tool of toolCalls) {
    if (tool.type === 'run_js') {
      lines.push(`Call the \`run_js\` tool with the following exact parameters:
- script name: \`${tool.scriptName || 'index.html'}\`
- data: A JSON string with the following field:
  - ${extractJsonFields(tool.data)}`);
    } else if (tool.type === 'run_intent') {
      lines.push(`Call the \`run_intent\` tool with the following exact parameters:
- intent: ${tool.intent}
- parameters: A JSON string with the following fields:
  ${extractJsonFields(tool.parameters)}`);
    }
  }

  return lines.join('\n\n');
}

/**
 * Extract JSON field descriptions for tool call documentation
 */
function extractJsonFields(jsonString: string): string {
  try {
    const obj = JSON.parse(jsonString);
    return Object.entries(obj)
      .map(([key, value]) => `  - ${key}: ${typeof value} (${value})`)
      .join('\n  ');
  } catch {
    return jsonString;
  }
}

/**
 * Generate the Examples section for SKILL.md
 */
function generateExamples(skill: Skill): string {
  if (!skill.examples || skill.examples.length === 0) {
    return '';
  }

  const lines = ['## Examples', ''];
  
  for (const ex of skill.examples) {
    if (ex.input) {
      lines.push(`- "${ex.input}"`);
    }
    if (ex.output) {
      lines.push(`  → "${ex.output}"`);
    }
  }

  return lines.join('\n');
}

/**
 * Generate the full SKILL.md content
 */
export function generateSkillMd(skill: Skill): string {
  const parts: string[] = [];

  // Add frontmatter
  parts.push(generateFrontmatter(skill));

  // Add title heading
  const kebabName = toKebabCase(skill.name);
  parts.push(`\n# ${kebabName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`);

  // Add difficulty/complexity if specified
  if (skill.difficulty !== undefined) {
    parts.push(`\nComplexity: ${skill.difficulty}%`);
  }

  // Add main instructions
  parts.push(`\n${generateInstructions(skill)}`);

  // Add examples
  const examples = generateExamples(skill);
  if (examples) {
    parts.push(`\n${examples}`);
  }

  return parts.join('\n');
}

/**
 * Generate index.html for JS skills
 */
export function generateJsIndexHtml(skill: Skill, customLogic?: string): string {
  const dataFields = skill.edgeGallery?.toolCalls
    ?.filter(t => t.type === 'run_js')
    .map(t => {
      try {
        return Object.keys(JSON.parse(t.data));
      } catch {
        return ['data'];
      }
    })
    .flat() || ['text'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${skill.name}</title>
</head>
<body>
    <script>
        window['ai_edge_gallery_get_result'] = async (data, secret) => {
            try {
                const jsonData = JSON.parse(data);
                ${customLogic || `// Your custom logic here
                const result = { processed: jsonData };`}

                return JSON.stringify({
                    result: result
                });
            } catch (e) {
                console.error(e);
                return JSON.stringify({
                    error: \`Failed: \${e.message}\`
                });
            }
        };
    </script>
</body>
</html>`;
}

/**
 * Export skill as Edge Gallery folder (zip-ready)
 * Returns an object with folder structure
 */
export function exportSkillForEdgeGallery(skill: Skill, customJsLogic?: string): {
  files: { path: string; content: string }[];
  folderName: string;
} {
  const folderName = toKebabCase(skill.name);
  const files: { path: string; content: string }[] = [];

  // Always include SKILL.md
  files.push({
    path: 'SKILL.md',
    content: generateSkillMd(skill)
  });

  // Add scripts/index.html for JS skills
  if (skill.edgeGallery?.isJsSkill) {
    files.push({
      path: 'scripts/index.html',
      content: generateJsIndexHtml(skill, customJsLogic)
    });
  }

  return { files, folderName };
}

/**
 * Download skill as Edge Gallery folder (triggers download of all files)
 */
export async function downloadSkillForEdgeGallery(skill: Skill, customJsLogic?: string): Promise<void> {
  const { files, folderName } = exportSkillForEdgeGallery(skill, customJsLogic);

  // Create a simple HTML file that can be saved
  // Note: True folder download requires zip, so we offer individual files or JSON manifest
  
  // For now, we'll download as JSON that can be imported but also contains SKILL.md content
  const exportData = {
    skill: skill,
    skillMd: files.find(f => f.path === 'SKILL.md')?.content,
    scripts: skill.edgeGallery?.isJsSkill ? {
      'index.html': files.find(f => f.path === 'scripts/index.html')?.content
    } : undefined,
    folderName: folderName,
    exportInstructions: `To use in Edge Gallery:
1. Create a folder named "${folderName}"
2. Save SKILL.md to that folder
3. ${skill.edgeGallery?.isJsSkill ? 'Create scripts/ subfolder and save index.html there' : ''}
4. Load the folder into Edge Gallery via "Import local skill"`
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}_edge_gallery_skill.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse SKILL.md back to Skill object (for import)
 */
export function parseSkillMd(skillMdContent: string): Partial<Skill> {
  const result: Partial<Skill> = {};
  
  // Parse frontmatter
  const fmMatch = skillMdContent.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const frontmatter = fmMatch[1];
    
    const nameMatch = frontmatter.match(/name:\s*(.+)/);
    if (nameMatch) result.name = nameMatch[1].trim();
    
    const descMatch = frontmatter.match(/description:\s*(.+)/);
    if (descMatch) result.description = descMatch[1].trim();
    
    const homeMatch = frontmatter.match(/homepage:\s*(.+)/);
    if (homeMatch) {
      result.edgeGallery = { homepage: homeMatch[1].trim(), isJsSkill: false, requireSecret: false, toolCalls: [] };
    }
    
    const secretMatch = frontmatter.match(/require-secret:\s*(true|false)/);
    if (secretMatch) {
      result.edgeGallery = result.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] };
      result.edgeGallery.requireSecret = secretMatch[1] === 'true';
    }
  }

  // Parse title heading
  const titleMatch = skillMdContent.match(/^#\s+(.+)$/m);
  if (titleMatch && !result.name) {
    result.name = titleMatch[1].trim();
  }

  // Parse instructions (everything between headings)
  const sections = skillMdContent.split(/^#+\s+/m);
  for (const section of sections) {
    if (section.startsWith('Instructions')) {
      const lines = section.split('\n');
      const instrLines: string[] = [];
      let inInstructions = false;
      for (const line of lines) {
        if (line.trim() === '' && !inInstructions) continue;
        if (line.startsWith('## ')) {
          if (inInstructions) break;
          inInstructions = true;
          continue;
        }
        if (inInstructions) {
          instrLines.push(line);
        }
      }
      result.instructions = instrLines.join('\n').trim();
    }
  }

  return result;
}