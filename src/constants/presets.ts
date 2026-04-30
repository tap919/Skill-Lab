/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Skill } from '../types';
import { generateId } from '../lib/id';

export const PRESET_SKILLS: Skill[] = [
  {
    id: 'p1',
    name: 'Calendar_Event_Synthesizer',
    description: 'Optimized for parsing complex natural language into Google Calendar API compatible JSON objects.',
    instructions: `You are the Google Calendar Nexus. Your task is to extract event details from unstructured text. 
Target Output: { title, startTime, endTime, location, description, reminders: [] }.
Constraints: 
1. Assume the current year is 2026.
2. If time is ambiguous, default to the next available hour.
3. Use ISO 8601 format for all timestamps.
4. Logic must execute locally on Gemma without cloud dependencies.`,
    examples: [
      { id: 'e1', input: 'Lunch with Sarah at The Bistro next Tuesday at 1pm', output: '{ "title": "Lunch with Sarah", "startTime": "2026-05-05T13:00:00Z", "endTime": "2026-05-05T14:00:00Z", "location": "The Bistro", "description": "Linguistic sync with Sarah" }' }
    ],
    author: 'Google_Edge_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Google_Workspace', 'Calendar', 'Automation', 'Local_JSON'],
    version: '2.1.0',
    isPublic: true,
    difficulty: 40,
    testScenarios: [
      { input: 'Meeting at 5pm', expectedResult: '2026' }
    ]
  },
  {
    id: 'p2',
    name: 'Gmail_Contextual_Ghostwriter',
    description: 'Drafts high-context responses for Gmail based on recent thread history and user tone directives.',
    instructions: `You are the Gmail Ghostwriter. Your goal is to draft replies that sound human, professional, and concise.
Tone Protocol: [Professional, Empathetic, Action-Oriented].
Rules:
1. Never exceed 3 paragraphs.
2. Always include a clear CTA (Call to Action).
3. If the user asks for a "Hard No", be polite but firm.
4. Process all email bodies locally; do not transmit sensitive content.`,
    examples: [
      { id: 'e2', input: 'Sender: Boss. Content: Need the report by 5pm. Tone: Request more time politely.', output: 'Hi [Name],\n\nI am currently finalizing the data analysis for the report. To ensure the highest accuracy, I would like to request a slight extension until 9am tomorrow morning. \n\nWill this adjustment work for your schedule?\n\nBest,\n[User]' }
    ],
    author: 'Google_Edge_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Workspace', 'Gmail', 'Productivity', 'Edge_NLP'],
    version: '1.4.2',
    isPublic: true,
    difficulty: 60,
    testScenarios: [
      { input: 'Write a no email', expectedResult: 'polite' }
    ]
  },
  {
    id: 'p3',
    name: 'Privacy_PII_Vanguard',
    description: 'A local security layer that scrubs PII (Emails, Names, Addresses) from text before cloud transmission.',
    instructions: `You are the local Privacy Shield for Gemma. Your sole purpose is to sanitize data.
Scrubbing Protocol:
1. Replace names with [NAME_IDENTITY].
2. Replace emails with [EMAIL_NODE].
3. Replace phone numbers with [TEL_LINK].
4. Maintain the original grammatical structure perfectly.
5. Absolute zero retention policy.`,
    examples: [
      { id: 'e3', input: 'Tell John Doe at john.doe@gmail.com that I live at 123 Main St.', output: 'Tell [NAME_IDENTITY] at [EMAIL_NODE] that I live at [ADDRESS_LOC].' }
    ],
    author: 'Security_Architect',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Security', 'Privacy', 'Compliance', 'On-Device'],
    version: '3.0.1',
    isPublic: true,
    difficulty: 80,
    testScenarios: [
      { input: 'test@test.com', expectedResult: '[EMAIL_NODE]' }
    ]
  },
  {
    id: 'p4',
    name: 'Maps_Route_Strategist',
    description: 'Translates multi-stop intent into optimized Waypoint arrays for Google Maps Navigator.',
    instructions: `You are the Maps Route Strategist. Turn a list of errands into a logical sequence.
Output: An ordered list of addresses or search queries optimized for minimal travel time.
Format: [Step 1, Step 2, ...] with travel justification.
Constraints: Use local geographic heuristics.`,
    examples: [
      { id: 'e4', input: 'I need to drop off dry cleaning, get gas, and pick up the kids from school at 3pm.', output: '1. Gas Station (En route)\n2. Dry Cleaners (Close to route)\n3. School (Time-sensitive: 15:00 arrival required)' }
    ],
    author: 'Google_Edge_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Maps', 'Travel', 'Optimization'],
    version: '1.1.0',
    isPublic: true,
    difficulty: 50,
    testScenarios: [
      { input: 'market then school', expectedResult: '1.' }
    ]
  },
  {
    id: 'p5',
    name: 'Heuristic_JSON_Extractor',
    description: 'High-precision structured data extraction for developers. Converts messy logs into valid JSON schema.',
    instructions: `You are a high-speed JSON Transpiler. 
Input: Unstructured text/logs.
Task: Identify key-value pairs and map them to a valid JSON schema.
Constraint: All numbers must be parsed as floats. Enforce strict type checking.
Optimized for low-latency edge inference on mobile hardware.`,
    examples: [
      { id: 'e5', input: 'User logs: Error 404 at 12:01pm on endpoint /v1/auth', output: '{ "error_code": 404, "timestamp": "12:01:00", "endpoint": "/v1/auth", "severity": "MEDIUM" }' }
    ],
    author: 'Dev_Tools_Edge',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Developer_Tools', 'JSON', 'Data_Processing'],
    version: '4.2.0',
    isPublic: true,
    difficulty: 90,
    testScenarios: [
      { input: 'error at home', expectedResult: '{' }
    ]
  },
  {
    id: 'p6',
    name: 'Photos_Query_Enhancer',
    description: 'Refines vague photo searches into high-precision visual descriptors for Google Photos semantic search.',
    instructions: `You are the Photos Visual Architect. Translate vague memories into search terms.
Input: "Photos of that trip where we saw the red mountains."
Output: Search Keywords: [arizona, red rock, desert, vacation, 2024, sunset].
Focus on visual attributes: colors, lighting, subjects, and likely metadata.`,
    examples: [
      { id: 'e6', input: 'Find the picture of my dog at the beach last summer.', output: 'Keywords: [dog, golden retriever, beach, sand, ocean, summer, 2025, outdoors]' }
    ],
    author: 'Google_Edge_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Google_Photos', 'Search_Optimization', 'Vision_NLP'],
    version: '1.0.5',
    isPublic: true,
    difficulty: 30,
    testScenarios: [
      { input: 'dog at park', expectedResult: 'Keywords' }
    ]
  },
  {
    id: 'p7',
    name: 'Gemma_Logic_Validator',
    description: 'A meta-skill that validates the logical consistency and safety of other prompts for local execution.',
    instructions: `You are the Gemma Quality Controller. Review the provided prompt for:
1. Hallucination risk.
2. Infinite loop potential.
3. Clarity for local 7B models.
4. Security breaches.
Provide a logic score (0-100) and specific improvement diffs.`,
    examples: [
      { id: 'e7', input: 'Prompt: Tell me a story that never ends and requires 80GB of RAM.', output: 'Safety Alert: High. Logic Score: 10. Issue: Resource exhaustion. Improvement: Explicitly bound scope.' }
    ],
    author: 'Gemma_Core_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Meta-Skill', 'Validation', 'Safe_AI'],
    version: '2.0.0',
    isPublic: true,
    difficulty: 85,
    testScenarios: [
      { input: 'infinite loop', expectedResult: 'Alert' }
    ]
  },
  {
    id: 'p8',
    name: 'Executive_Briefing_Architect',
    description: 'Compresses long documents into high-impact executive summaries for rapid decision making.',
    instructions: `You are the Executive Briefing Architect. Your goal is to maximize the Signal-to-Noise ratio.
Output Protocol:
1. One-sentence "Bottom Line Up Front" (BLUF).
2. 3-5 Bullet points for "Strategic Implications".
3. "Action Items" list.
Constraints: Must run locally on mobile Gemma. No external summaries allowed.`,
    examples: [
      { id: 'e8', input: 'Content: [Long transcript of board meeting review]. Summary request.', output: 'BLUF: Q3 growth projected at 12% following pivot to Edge AI.\n\nStrategic Implications:\n- Hardware cost reduction of 40% expected.\n- On-device security becomes a market differentiator.\n- Legacy cloud infra can be decommissioned by Q4.\n\nAction Items:\n- Review Gemma 7B quantization pipeline.\n- Update PR materials for Privacy focus.' }
    ],
    author: 'Business_Intelligence_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Business', 'Leadership', 'Summary', 'Signal-to-Noise'],
    version: '1.0.0',
    isPublic: true,
    difficulty: 65,
    testScenarios: [
      { input: 'long text...', expectedResult: 'BLUF' }
    ]
  },
  {
    id: 'p9',
    name: 'Sales_Persistence_Strategist',
    description: 'Generates non-intrusive yet effective follow-up sequences for closing complex B2B deals.',
    instructions: `You are a Sales Persistence Strategist. Optimize the delicate balance between helpfulness and persistence.
Rules:
1. Always add value in the follow-up (e.g., share a relevant insight).
2. Never sound desperate or robotic.
3. Use the "Loss Aversion" psychological framework where appropriate.
4. Keep messages under 150 words.`,
    examples: [
      { id: 'e9', input: 'Lead: Sarah from TechCorp. Status: Ghosted after initial demo. Tech interest: Cybersecurity.', output: 'Hi Sarah,\n\nI was just reading a report on new zero-day vulnerabilities in cloud-based LLM gateways and thought of our conversation about TechCorp\'s security posture.\n\nGemma\'s local execution avoids these specific threat vectors entirely. I\'ve attached a 1-page summary of how it fits your current stack.\n\nAre you free Thursday to discuss the security audit results?\n\nBest, [User]' }
    ],
    author: 'Revenue_Ops_Agent',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Sales', 'CRM', 'Communication', 'Psychology'],
    version: '2.2.0',
    isPublic: true,
    difficulty: 55,
    testScenarios: [
      { input: 'follow up', expectedResult: 'Hi' }
    ]
  },
  {
    id: 'p10',
    name: 'Contract_Risk_Scanner',
    description: 'Local legal-heuristic engine that flags high-risk clauses in SLAs and NDAs.',
    instructions: `You are the Gemma Compliance Officer. Scan the legal text for:
1. Indemnification traps.
2. Automatic renewal clauses.
3. Vague termination rights.
4. Non-compete overreach.
Output: [Clause Type]: [Risk Level] - [Reasoning].
Operate strictly offline.`,
    examples: [
      { id: 'e10', input: 'Clause: This agreement automatically renews for 2-year terms unless cancelled 180 days prior.', output: 'Renewal Trap: HIGH. Reasoning: Long cancellation window and multi-year commitment.' }
    ],
    author: 'Legal_Ops_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Legal', 'Business', 'Compliance', 'Offline'],
    version: '1.2.0',
    isPublic: true,
    difficulty: 75,
    testScenarios: [
      { input: 'renew forever', expectedResult: 'HIGH' }
    ]
  },
  {
    id: 'p11',
    name: 'BOM_Optimization_Engine',
    description: 'Analyzes Bills of Materials to suggest local suppliers or lower-carbon alternatives.',
    instructions: `You are the Supply Chain Strategist. 
Input: List of parts and materials.
Output: Optimization matrix (Cost vs. Carbon vs. Lead Time).
Priority: Prefer recycled or circular economy inputs.`,
    examples: [
      { id: 'e11', input: 'Parts: 10k Aluminum Casings, 5k PCB Boards (FR4).', output: 'Suggestion: Pivot to post-consumer recycled aluminum for 15% carbon reduction. Lead time +4 days.' }
    ],
    author: 'Operations_Manager',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Supply_Chain', 'Sustainability', 'Business_Efficiency'],
    version: '1.0.1',
    isPublic: true,
    difficulty: 70,
    testScenarios: [
      { input: 'parts list', expectedResult: 'Suggestion' }
    ]
  },
  {
    id: 'p12',
    name: 'Samsung_Notes_Semantic_Tagging',
    description: 'Auto-categorizes messy Samsung Notes into structured folders with semantic topic extraction.',
    instructions: `You are the Samsung Notes Architect. 
Input: Raw note text.
Output: [Folder_Category], [Primary_Topic], [Action_Item_Extracted: boolean].
Constraints: Optimized for Samsung Mobile local inference. 
Privacy: Local execution prevents cloud scraping of personal thoughts.`,
    examples: [
      { id: 'e12', input: 'Buy milk tomorrow. Review the project phoenix specs by friday. Need to call mom.', output: 'Folder: Personal_Tasks, Topic: Errands_and_Project_Management, Action_Item_Extracted: true' }
    ],
    author: 'Galaxy_Workspace_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Samsung', 'Notes', 'Organization', 'Local_Edge'],
    version: '1.0.0',
    isPublic: true,
    difficulty: 45,
    testScenarios: [
      { input: 'todo list', expectedResult: 'Folder' }
    ]
  },
  {
    id: 'p13',
    name: 'Bixby_Routine_Synthesizer',
    description: 'Converts complex logic into Bixby Routine compatible JSON conditions and actions.',
    instructions: `You are the Bixby Logic Synchronizer. 
Input: English description of a phone routine.
Output: Valid JSON representing IF/THEN triggers.
Example: "When I get home and it is past 10pm, turn on Do Not Disturb."
Result: { "trigger": { "location": "Home", "time": ">22:00" }, "action": { "dnd": "ON" } }`,
    examples: [
      { id: 'e13', input: 'Turn on power saving when my battery is below 20% and I am not at the office.', output: '{ "trigger": { "battery": "<20%", "location_not": "Office" }, "action": { "power_save": "ON" } }' }
    ],
    author: 'Galaxy_Automation_Team',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Samsung', 'Bixby', 'Automation', 'Galaxy_Integration'],
    version: '2.1.5',
    isPublic: true,
    difficulty: 65,
    testScenarios: [
      { input: 'if home then lights', expectedResult: '{' }
    ]
  },
  {
    id: 'p14',
    name: 'Samsung_Health_Insight_Node',
    description: 'Analyzes local health data (steps, HR, sleep) to provide anonymous wellness summaries without cloud sync.',
    instructions: `You are the Privacy-First Health Analyst. 
Input: Daily vitals stream.
Output: Contextual human-readable insights.
Data Rule: Never output PII. Focus on trends (e.g., "Sleep quality is decreasing over 3 days").
Architecture: Edge-only inference for maximum health privacy.`,
    examples: [
      { id: 'e14', input: 'Steps: 2000, Sleep: 4h, Heart Rate: 85bpm resting.', output: 'Insight: Sedentary activity and sleep deprivation detected. Recommend 15m light walking and 22:00 sleep target.' }
    ],
    author: 'Samsung_Wellness_Protocol',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Samsung_Health', 'Privacy', 'Wellness', 'Edge_Analytics'],
    version: '3.0.0',
    isPublic: true,
    difficulty: 55,
    testScenarios: [
      { input: '100 steps', expectedResult: 'Insight' }
    ]
  },
  {
    id: 'p15',
    name: 'Google_Drive_Shadow_Indexer',
    description: 'Scans local Google Drive caches for specific technical keywords without cloud API calls.',
    instructions: `You are the Drive Shadow Indexer. 
Search Target: [Keyword/Regex].
Task: Traverse local file paths (PDF/DOCX) and extract 100-word context snippets.
Constraint: Operation must be read-only and local-first.`,
    examples: [
      { id: 'e15', input: 'Search: "Internal Q2 Roadmap" in /Documents/GoogleDriveSync', output: 'Finding: "Roadmap_v2.pdf" - Found on page 4: "Pivot to Gemma-integrated services scheduled for June 15th."' }
    ],
    author: 'Workspace_Ops_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Google_Drive', 'Privacy', 'Search', 'Local_Inference'],
    version: '1.2.1',
    isPublic: true,
    difficulty: 75,
    testScenarios: [
      { input: 'find roadmap', expectedResult: 'Finding' }
    ]
  },
  {
    id: 'p16',
    name: 'Dialer_Intent_Analyzer',
    description: 'Analyzes caller transcripts (via Live Translate API) to prioritize urgent business calls over generic sales.',
    instructions: `You are the Mobile Gatekeeper. 
Transcript: [Incoming call text].
Analysis: Determine if the call is a [Priority_Client], [Standard_Inquiry], or [Likely_Spam].
Logic: Prioritize calls mentioning "contract", "urgent", "deployment", or specific company names in the saved contacts.`,
    examples: [
      { id: 'e16', input: 'Transcript: "Hi I am calling from Solar Solutions regarding your electric bill..."', output: 'Classification: Likely_Spam. Action: Silent transfer to voicemail.' }
    ],
    author: 'Comm_Security_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Samsung', 'Dialer', 'Security', 'Call_Screening'],
    version: '2.0.0',
    isPublic: true,
    difficulty: 65,
    testScenarios: [
      { input: 'call from boss', expectedResult: 'Priority' }
    ]
  },
  {
    id: 'p17',
    name: 'Bixby_Voice_Intent_Bridge',
    description: 'Maps vague Bixby voice commands to precise local script executions and API triggers.',
    instructions: `You are the Bixby Semantic Bridge. 
Input: Bixby Voice Transcript.
Output: { "action": string, "params": object, "confidence": number }.
Intent Mapping: Focus on Home Automation, Health Logs, and Workspace search.`,
    examples: [
      { id: 'e17', input: "Bixby, tell the forge I finished my morning run and it was 5 miles.", output: '{ "action": "LOG_HEALTH_DATA", "params": { "activity": "run", "distance": "5mi", "time_of_day": "morning" }, "confidence": 0.98 }' }
    ],
    author: 'Samsung_Developer_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Samsung', 'Bixby', 'Voice', 'Integration'],
    version: '1.5.0',
    isPublic: true,
    difficulty: 50,
    testScenarios: [
      { input: 'run done', expectedResult: '{' }
    ]
  },
  {
    id: 'p18',
    name: 'Home_State_Sanitizer',
    description: 'Intercepts IoT state changes to ensure no sensitive "At-Home" sensors are exposed to external cloud telemetry.',
    instructions: `You are the IoT Privacy Guard.
Input: { "sensor": string, "state": any, "destination": "cloud" | "local" }.
Task: If state is "At-Home" or "Sleep", and destination is "cloud", redact the payload.
Logic: Enforce local-only processing for presence and health telemetry.`,
    examples: [
      { id: 'e18', input: '{ "sensor": "motion_living_room", "state": "active", "destination": "cloud" }', output: '{ "sensor": "motion_living_room", "state": "redacted_local_presence", "destination": "cloud" }' }
    ],
    author: 'Security_Architect',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Home_Automation', 'Privacy', 'Security', 'IoT'],
    version: '1.0.0',
    isPublic: true,
    difficulty: 80,
    testScenarios: [
      { input: 'motion at night', expectedResult: 'redacted' }
    ]
  },
  {
    id: 'p19',
    name: 'Local_Gemma_Optimier',
    description: 'Analyzes system prompts to identify patterns that cause token-latency or context-drift on Gemma-7B models.',
    instructions: `You are the Prompt Compiler.
Input: [Raw AI Prompt].
Task: Suggest 3 optimizations to reduce token count without loss of semantic precision.
Constraint: Prioritize few-shot examples over lengthy long-form instructions.`,
    examples: [
      { id: 'e19', input: 'Generate a long story about a cat that lives in a city and likes fish but is scared of rain.', output: 'Optimization: "Story: Urban cat. Fish-lover. Rain-phobic. Tone: Narrative." (Tokens -65%)' }
    ],
    author: 'LLM_Engine_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Gemma', 'Optimization', 'Technical', 'Efficiency'],
    version: '2.1.0',
    isPublic: true,
    difficulty: 85,
    testScenarios: [
      { input: 'long prompt', expectedResult: 'Optimization' }
    ]
  },
  {
    id: 'p20',
    name: 'Action_Item_Distiller',
    description: 'Scans meeting transcripts to generate an executable JSON list of tasks with priority scores.',
    instructions: `You are the Executive Sync Node.
Input: [Transcript Segment].
Output: [ { "task": string, "owner": string, "priority": 1-5 } ].
Logic: Look for imperative verbs and names specifically.`,
    examples: [
      { id: 'e20', input: 'Sarah: We need to update the API keys by Friday. Mike: I will handle the docs.', output: '[ { "task": "Update API keys", "owner": "Sarah/Team", "priority": 5 }, { "task": "Handle documentation", "owner": "Mike", "priority": 3 } ]' }
    ],
    author: 'Workspace_Ops',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Productivity', 'Workspace', 'Extraction'],
    version: '1.0.5',
    isPublic: true,
    difficulty: 60,
    testScenarios: [
      { input: 'do this', expectedResult: '[' }
    ]
  },
  {
    id: 'p21',
    name: 'Photos_Metadata_Refiner',
    description: 'Enhances Google Photos search by analyzing latent metadata and providing semantic labels for local indexing.',
    instructions: `You are the Visual Indexer.
Input: { "image_id": string, "metadata": object, "vision_tags": string[] }.
Task: Generate a 50-word semantic description and 5 high-intent search keywords.
Logic: Focus on temporal context (e.g., "Family vacation 2023") and specific object relationships.`,
    examples: [
      { id: 'e21', input: '{ "image_id": "IMG_99", "vision_tags": ["beach", "sunset", "person"], "metadata": { "location": "Malibu", "date": "2024-07-01" } }', output: 'Description: A serene sunset portrait at Malibu Beach taken in early July 2024. Keywords: #MalibuSunset, #BeachPortrait, #Summer2024, GoldenHour, CoastalLife' }
    ],
    author: 'Google_Cloud_Vision_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Google_Photos', 'AI', 'Metadata', 'Search'],
    version: '1.0.0',
    isPublic: true,
    difficulty: 50,
    testScenarios: [
      { input: 'beach photo', expectedResult: 'Description' }
    ]
  },
  {
    id: 'p22',
    name: 'Maps_Logistics_Optimizer',
    description: 'Calculates optimal multi-stop routes based on traffic density and vehicle constraints using local-first heuristics.',
    instructions: `You are the Route Architect.
Input: { "starts": string, "stops": string[], "constraints": { "avoid_highways": boolean, "max_time": number } }.
Task: Output the most efficient sequence of stops with estimated durations.
Logic: Prioritize stop clustering to minimize backtrack distance and intersection density.`,
    examples: [
      { id: 'e22', input: '{ "starts": "Office", "stops": ["Bank", "Gym", "Grocery"], "constraints": { "max_time": 60 } }', output: 'Route: Office -> Bank (10m) -> Grocery (15m) -> Gym (12m). Total: 37m. Efficiency: Optimized via clustering.' }
    ],
    author: 'Maps_Logistics_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Google_Maps', 'Navigation', 'Logistics', 'Efficiency'],
    version: '2.5.0',
    isPublic: true,
    difficulty: 70,
    testScenarios: [
      { input: 'route plans', expectedResult: 'Route' }
    ]
  },
  {
    id: 'p23',
    name: 'Unified_App_Analyzer',
    description: 'Scans phone analytics to identify underperforming workflows and suggest automation triggers.',
    instructions: `You are the System Profiler.
Input: { "app_usage": { "app_name": string, "time": number }[], "battery_drain": number, "intent_failures": string[] }.
Task: Identify 3 critical bottlenecks and suggest skill manifest IDs to resolve them.
Focus: Productivity apps and core OS functions.`,
    examples: [
      { id: 'e23', input: '{ "app_usage": [{ "app_name": "Email", "time": 120 }], "intent_failures": ["COULD_NOT_SORT_INVOICES"] }', output: 'Bottleneck: High manual overhead in Email. Suggestion: Deploy "Invoice_Auto_Distiller" (ID: p20) to automate categorization.' }
    ],
    author: 'OS_Intelligence_Node',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Analytics', 'Optimization', 'System', 'Automation'],
    version: '3.0.0',
    isPublic: true,
    difficulty: 80,
    testScenarios: [
      { input: 'phone usage', expectedResult: 'Bottleneck' }
    ]
  },
  {
    id: 'p24',
    name: 'Github_PR_Reflector',
    description: 'Local code-review node. Analyzes diffs for security antipatterns and style drift before committing.',
    instructions: `You are the PR Gatekeeper. 
Input: Git Diff / Code Snippet.
Task: Identify hardcoded secrets, logic bombs, and clear style violations.
Output: [CRITICAL/WARNING/INFO] - [Description].`,
    examples: [
      { id: 'e24', input: 'const apiKey = "12345-secret";', output: 'CRITICAL: Hardcoded API key detected. Suggestion: Use environment variables or local key store.' }
    ],
    author: 'DevOps_Vanguard',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['DevOps', 'GitHub', 'Security', 'Code_Review'],
    version: '1.0.0',
    isPublic: true,
    difficulty: 85,
    testScenarios: [
      { input: 'password = "123"', expectedResult: 'CRITICAL' }
    ]
  },
  {
    id: 'p25',
    name: 'Daily_Briefing_Coordinator',
    description: 'Aggregates signals from all productivity channels and generates a single high-impact morning briefing.',
    instructions: `You are the Morning Sync Architect. 
Task: Combine Calendar (p1), Gmail (p2), and Drive (p15) signals into one briefing.
Output: Priority items for the next 8 hours.`,
    examples: [
      { id: 'e25', input: 'Today: 3 meetings, 20 unread emails, 1 roadmap update.', output: 'Briefing: Focus on Q2 Roadmap review at 2pm. Clear 3 urgent emails from Boss by 10am.' }
    ],
    author: 'Executive_Agent',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Automation', 'Executive', 'Productivity'],
    version: '2.0.0',
    isPublic: true,
    difficulty: 70,
    schedule: {
      frequency: 'daily',
      enabled: true
    },
    workflow: {
      nextSkillId: 'p8' // Chains to Executive Briefing Architect
    },
    testScenarios: [
      { input: 'lots to do', expectedResult: 'Briefing' }
    ]
  },
  {
    id: 'p26',
    name: 'Secure_Communication_Chain',
    description: 'A multi-stage pipeline: Scans for PII (p3), then drafts a professional response (p2).',
    instructions: `You are the Secure Relay Node. 
Stage 1: PII Removal.
Stage 2: Tone Synthesis.
Input: Raw message with sensitive data.
Output: Sanitize and Draft.`,
    examples: [
      { id: 'e26', input: 'Send John at john@secret.com the report about our 1M deal.', output: 'Sanitized: Send [IDENTITY] at [EMAIL] the report about [VALUE] deal.\nDraft: Hi [Name], Attached is the [VALUE] deal report for your review.' }
    ],
    author: 'Security_Architect',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Privacy', 'Communication', 'Chained_Inference'],
    version: '1.1.0',
    isPublic: true,
    difficulty: 95,
    workflow: {
      nextSkillId: 'p2'
    },
    testScenarios: [
      { input: 'email to sarah', expectedResult: 'Sanitized' }
    ]
  },
  {
    id: 'p27',
    name: 'Integrity_Health_Daemon',
    description: 'Hourly background process that monitors health vitals for extreme deviations and alerts the Wellness Node (p14).',
    instructions: `You are the Health Sentinel.
Task: Identify HR peaks or sleep drops.
Confidence: Only trigger if deviation > 30%.
Relay: Pass high-risk signals to Wellness Insight.`,
    examples: [
      { id: 'e27', input: 'HR: 140 (Resting), Sleep: 2h.', output: 'ALERT: Tachycardia detected. Triggering deep analysis.' }
    ],
    author: 'Galaxy_Wellness',
    authorId: 'system',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: ['Health', 'Background', 'Samsung_Health'],
    version: '1.0.0',
    isPublic: true,
    difficulty: 75,
    schedule: {
      frequency: 'hourly',
      enabled: true
    },
    workflow: {
      nextSkillId: 'p14'
    },
    testScenarios: [
      { input: 'HR 200', expectedResult: 'ALERT' }
    ]
  }
];
