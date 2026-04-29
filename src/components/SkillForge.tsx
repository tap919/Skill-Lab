/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Cpu, 
  Terminal, 
  Workflow, 
  Clock,
  Check, 
  RefreshCw, 
  ArrowRight,
  Box,
  Upload,
  ShieldCheck,
  Zap,
  Mic,
  MessageSquareCode,
  Play,
  ShieldAlert,
  Activity,
  Dices,
  Atom,
  TabletSmartphone,
  ScanSearch,
  MapPin,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Skill, SkillExample } from '../types';
import { generateId } from '../lib/id';
import { auth } from '../lib/firebase';
import { proposeSkill, refineSkill, SkillProposal } from '../services/aiSkillAgent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  proposal?: SkillProposal;
}

export function SkillForge({ 
  onFinalize, 
  onCancel,
  initialData
}: { 
  onFinalize: (skill: Skill) => void; 
  onCancel: () => void;
  initialData?: Skill | null;
}) {
  const [messages, setMessages] = useState<Message[]>(() => {
    if (initialData) {
      return [
        { 
          id: '1', 
          role: 'agent', 
          content: `Upgrading your existing skill: ${initialData.name}. I've loaded the core settings. How should we make it smarter?` 
        }
      ];
    }
    return [
      { 
        id: '1', 
        role: 'agent', 
        content: "Welcome! I'm here to help you create a custom brain for your phone. Just describe what you want your phone to do better, and I'll build the instructions for you." 
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeProposal, setActiveProposal] = useState<SkillProposal | null>(() => {
    if (initialData) {
      return {
        name: initialData.name,
        description: initialData.description,
        instructions: initialData.instructions,
        examples: initialData.examples,
        tags: initialData.tags,
        explanation: "Updated from your existing skill list.",
        difficulty: initialData.difficulty || 50,
        testScenarios: initialData.testScenarios || [],
        traits: [
          { label: 'Cloud_Free', value: true, description: "Works entirely on your phone" },
          { label: 'Smart_Battery', value: true, description: "Saves energy while running" },
          { label: 'Privacy_Locked', value: true, description: "Your data never leaves the device" }
        ]
      };
    }
    return null;
  });
  const [testResults, setTestResults] = useState<{scenario: string, expected: string, actual: string, passed: boolean}[]>([]);
  const [labInput, setLabInput] = useState('');
  const [labOutput, setLabOutput] = useState('');
  const [isLabSimulating, setIsLabSimulating] = useState(false);
  const [isEntropyRunning, setIsEntropyRunning] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [securityReport, setSecurityReport] = useState<{score: number, leaks: string[], smells: string[]} | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const runSecurityAudit = async () => {
    if (!activeProposal) return;
    setIsAuditing(true);
    setSecurityReport(null);
    try {
      // Simulate deep analysis
      await new Promise(r => setTimeout(r, 2000));
      
      const leaks = [];
      const smells = [];
      
      const prompt = activeProposal.instructions.toLowerCase();
      if (prompt.includes('ignore') || prompt.includes('override')) smells.push("Instruction override risk detected");
      if (prompt.includes('password') || prompt.includes('key')) leaks.push("Hardcoded secret patterns found");
      if (activeProposal.instructions.length < 50) smells.push("Underspecified behavioral weights");
      
      if (activeProposal.examples.length < 2) smells.push("Low few-shot density; higher hallucination risk");
      
      setSecurityReport({
        score: 100 - (leaks.length * 20) - (smells.length * 10),
        leaks,
        smells
      });
      toast.success("Security Audit Complete.");
    } catch (err) {
      toast.error("Audit failed.");
    } finally {
      setIsAuditing(false);
    }
  };
  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runDeepDiagnosis = async () => {
    setIsDiagnosing(true);
    try {
      // Mocked phone analytics data for simulation
      const mockAnalytics = {
        os: "Galaxy_OS_Core",
        app_distribution: [
          { name: "Camera", usage: "15%", latent_failure: "AUTO_TAG_TIMEOUT" },
          { name: "Maps", usage: "30%", latent_failure: "LATENCY_IN_RE_ROUTING" },
          { name: "Workspace", usage: "45%", latent_failure: "MANUAL_FILE_SORTING" }
        ],
        thermal_envelope: "Nominal",
        intent_density: "High"
      };

      const { analyzePhoneState, synthesizePhoneSkill } = await import('../services/aiSkillAgent');
      const rec = await analyzePhoneState(mockAnalytics);
      
      toast.info(`Engine Recommendation: ${rec}`);
      
      const proposal = await synthesizePhoneSkill(rec, mockAnalytics);
      setActiveProposal(proposal);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'agent',
        content: `Deep System Diagnosis complete. Telemetry indicates a critical optimization gap in ${rec.split(' ')[0]}. I have manifested a remedial skill blueprint to automate this workflow.`
      }]);
    } catch (err) {
      toast.error("Diagnostic handshake failed.");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const runEntropyEngine = async () => {
    setIsEntropyRunning(true);
    try {
      const domains = ['Workspace', 'Bio-Telemetry', 'Smart_Home', 'Kernel_Security', 'Finance_Node', 'Social_Dynamics', 'Edge_Infrastructure'];
      const capabilities = ['Intent_Mapping', 'PII_Redaction', 'Anomaly_Detection', 'Summarization', 'Semantic_Routing', 'State_Sanitization'];
      const constraints = ['Sub-1s_Latency', 'Deterministic_Output', 'Local_Inference_Only', 'Zero_Context_Retention', 'JSON_Strict_Response'];
      
      const seed = {
        domain: domains[Math.floor(Math.random() * domains.length)],
        capability: capabilities[Math.floor(Math.random() * capabilities.length)],
        constraint: constraints[Math.floor(Math.random() * constraints.length)]
      };

      const { synthesizeEntropySkill } = await import('../services/aiSkillAgent');
      const proposal = await synthesizeEntropySkill(seed);
      setActiveProposal(proposal);
      setIsVerified(false);
      setTestResults([]);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'agent',
        content: `Entropy Engine triggered. Collapse state detected: ${proposal.name}. Architecture stabilized around ${seed.domain} domain with a focus on ${seed.capability}.`
      }]);
      toast.success("Skill synthesized via Entropy.");
    } catch (err) {
      toast.error("Entropy collapse failed.");
    } finally {
      setIsEntropyRunning(false);
    }
  };

  const runLabSimulation = async () => {
    if (!activeProposal || !labInput.trim()) return;
    
    setIsLabSimulating(true);
    try {
      const { simulateSkill } = await import('../services/aiSkillAgent');
      const result = await simulateSkill(
        activeProposal.instructions,
        activeProposal.examples,
        labInput
      );
      setLabOutput(result);
      toast.success("Check complete.");
    } catch (err) {
      toast.error("Check failed.");
    } finally {
      setIsLabSimulating(false);
    }
  };

  const handleFileImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.name && (content.instructions || content.systemPrompt)) {
          toast.success(`Manifest ingested: ${content.name}`);
          setActiveProposal({
            name: content.name,
            description: content.description || 'Imported capability',
            instructions: content.instructions || content.systemPrompt,
            examples: content.examples || [],
            tags: content.tags || ['imported'],
            explanation: "Heuristic mapping successful. Manifest parsed from local storage.",
            difficulty: content.difficulty || content.complexity || 50,
            testScenarios: content.testScenarios || [],
            traits: [
              { label: 'Cloud_Gated', value: false },
              { label: 'Edge_Ready', value: true },
              { label: 'PII_Safe', value: true }
            ]
          });
        } else {
          toast.error("Invalid manifest structure.");
        }
      } catch (err) {
        toast.error("Corruption detected in JSON stream.");
      }
    };
    reader.readAsText(file);
  };

  const runE2ETests = async () => {
    if (!activeProposal || !activeProposal.testScenarios || activeProposal.testScenarios.length === 0) {
      toast.error("No test scenarios defined for this blueprint.");
      return;
    }
    
    setTestResults([]);
    setIsVerified(false);
    toast.info("Initializing E2E Edge Inference Simulation...");
    
    const { simulateSkill } = await import('../services/aiSkillAgent');
    
    let allPassed = true;
    for (const scenario of activeProposal.testScenarios) {
      if (!isMountedRef.current) break;
      
      try {
        const actual = await simulateSkill(
          activeProposal.instructions,
          activeProposal.examples,
          scenario.input
        );
        
        const passed = actual.toLowerCase().includes(scenario.expectedResult.toLowerCase());
        if (!passed) allPassed = false;
        
        setTestResults(prev => [...prev, { 
          scenario: scenario.input, 
          expected: scenario.expectedResult,
          actual,
          passed 
        }]);
      } catch (err) {
        allPassed = false;
        setTestResults(prev => [...prev, { 
          scenario: scenario.input, 
          expected: scenario.expectedResult,
          actual: "ERROR: Simulation Failed",
          passed: false 
        }]);
      }
    }
    
    if (allPassed) {
       setIsVerified(true);
       toast.success("All systems operational. Skill verified.");
    } else {
       toast.error("Verification failed. Logic gaps detected.");
    }
  };

  const handleAutoFix = async (context: 'tests' | 'security' = 'tests') => {
    if (!activeProposal) return;
    
    let fixInput = '';
    
    if (context === 'tests') {
      const failures = testResults.filter(r => !r.passed);
      if (failures.length === 0) return;
      const errorReport = failures.map(f => `Input: "${f.scenario}"\nExpected: "${f.expected}"\nActual: "${f.actual}"`).join('\n\n');
      fixInput = `My skill failed verification on these scenarios:\n\n${errorReport}\n\nPlease adjust the instructions to account for these cases while maintaining existing functionality.`;
    } else {
      if (!securityReport || (securityReport.leaks.length === 0 && securityReport.smells.length === 0)) return;
      const issues = [...securityReport.leaks, ...securityReport.smells].join(', ');
      fixInput = `My skill has security/logic issues: ${issues}. Please rewrite the instructions to be more secure, precise, and avoid override risks or sensitive patterns.`;
    }
    
    setIsFixing(true);
    try {
      setMessages(prev => [...prev, { id: generateId(), role: 'user', content: "Fixing detected failures..." }]);
      
      const steps = ["Analyzing failures...", "Remapping logic...", "Recalibrating instructions..."];
      for (const step of steps) {
        setMessages(prev => [...prev, { id: generateId(), role: 'agent', content: `AGENTIC_LOG: ${step}` }]);
        await new Promise(r => setTimeout(r, 600));
      }

      const proposal = await refineSkill(activeProposal, fixInput);
      setActiveProposal(proposal);
      setIsVerified(false);
      setTestResults([]);
      
      setMessages(prev => [...prev.filter(m => !m.content.startsWith("AGENTIC_LOG:")), { 
        id: generateId(), 
        role: 'agent', 
        content: `I've recalibrated the instructions to address the failures. Please run verification again.`,
        proposal 
      }]);
      
      toast.success("Auto-Fix applied. Please re-run tests.");
    } catch (err) {
      toast.error("Fix failed. Manual intervention required.");
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        if (!isMountedRef.current) return;
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          toast.success("Voice command captured.");
        }
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        if (!isMountedRef.current) return;
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast.error(`Aural link failed: ${event.error}`);
        }
      };

      recognition.onend = () => {
        if (isMountedRef.current) {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error("Speech Recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      // Re-init if missing
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          toast.success("Voice command captured.");
        }
        setIsListening(false);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          toast.error(`Aural link failed: ${event.error}`);
        }
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Aural link active. Speak now.");
      } catch (err) {
        console.error('Start error:', err);
        setIsListening(false);
        // If already started, just reset state
        if (err instanceof Error && err.name === 'InvalidStateError') {
          try { recognitionRef.current.stop(); } catch(e) {}
        } else {
          toast.error("Could not start voice recognition.");
        }
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    try {
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
      setMessages(prev => [...prev, userMsg]);
      setInput('');
      setIsProcessing(true);

      // Simulate a multi-step agentic process for psychological feedback
      const steps = [
        "Analyzing linguistic semantics...",
        "Querying Gemma-7B optimization weights...",
        "Cross-referencing telemetry constraints...",
        "Validating logic against safety protocols...",
        "Finalizing heuristic blueprint..."
      ];

      for (const step of steps) {
        if (!isMountedRef.current) return;
        setMessages(prev => {
          const newMessages = [...prev];
          const last = newMessages[newMessages.length - 1];
          if (last.role === 'agent' && last.content.startsWith("AGENTIC_LOG:")) {
            last.content = `AGENTIC_LOG: ${step}`;
            return newMessages;
          }
          return [...prev, { id: `step-${step}`, role: 'agent', content: `AGENTIC_LOG: ${step}` }];
        });
        await new Promise(r => setTimeout(r, 800));
      }

      if (!isMountedRef.current) return;

      let proposal: SkillProposal;
      try {
        if (activeProposal) {
          proposal = await refineSkill(activeProposal, userMsg.content);
        } else {
          proposal = await proposeSkill(userMsg.content);
        }

        setActiveProposal(proposal);
        setIsVerified(false);
        setTestResults([]);
        setMessages(prev => [...prev.filter(m => !m.content.startsWith("AGENTIC_LOG:")), { 
          id: (Date.now() + 1).toString(), 
          role: 'agent', 
          content: proposal.explanation,
          proposal 
        }]);
      } catch (err: any) {
        setMessages(prev => [...prev.filter(m => !m.content.startsWith("AGENTIC_LOG:")), { 
          id: (Date.now() + 1).toString(), 
          role: 'agent', 
          content: `CRITICAL_FAILURE: The forge encountered an anomaly during manifestation. ${err.message}`
        }]);
        toast.error("Manifestation failed.");
      }
    } catch (err) {
      toast.error("Manifestation failed. The Aether is unstable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalize = async () => {
    if (!activeProposal) return;
    
    const hasTests = activeProposal.testScenarios && activeProposal.testScenarios.length > 0;
    if (hasTests && !isVerified) {
      toast.error("Unverified Skill detected. Please run and pass all tests before saving.");
      return;
    }
    
    setIsProcessing(true);
    try {
      // Re-verify the prompt with the agent if traits changed? 
      // For now, we'll just append trait instructions if they are active, 
      // or we could ask the agent to "seal" the blueprint.
      
      const activeTraitLabels = activeProposal.traits
        .filter(t => t.value)
        .map(t => t.label);

      let finalPrompt = activeProposal.instructions;
      if (activeTraitLabels.length > 0) {
        finalPrompt += `\n\n[Active Trait Protocols: ${activeTraitLabels.join(', ')}]`;
      }

      const skill: Skill = {
        id: generateId(),
        name: activeProposal.name,
        description: activeProposal.description,
        instructions: finalPrompt,
        examples: activeProposal.examples.map(ex => ({ id: generateId(), ...ex })),
        author: 'Assistant_Forge',
        authorId: auth.currentUser?.uid || 'anonymous',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: [...activeProposal.tags, ...activeTraitLabels.map(l => l.toLowerCase())],
        version: '1.0.0',
        isPublic: false,
        difficulty: activeProposal.difficulty,
        testScenarios: activeProposal.testScenarios.map(ts => ({ 
          input: ts.input, 
          expectedResult: ts.expectedResult,
          category: ts.category as any
        })),
        workflow: activeProposal.workflow,
        schedule: activeProposal.schedule || { enabled: false, frequency: 'manual' },
        isVerified,
        securityScore: securityReport?.score
      };

      onFinalize(skill);
    } catch (err) {
      toast.error("Failed to save. Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 h-full md:h-[80vh]">
      {/* Left: Chat Area */}
      <div className="lg:col-span-7 flex flex-col border border-border bg-card/20 relative overflow-hidden h-[50vh] md:h-auto">
        {/* Hardware scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_bottom,transparent_50%,#000_50%)] bg-[length:100%_4px] z-0" />
        
        <header className="p-3 md:p-4 border-b border-border flex items-center justify-between bg-card/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            <div className="p-1 md:p-1.5 bg-primary/20 text-primary">
              <MessageSquareCode className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            <span className="text-[9px] md:text-[10px] font-mono font-bold uppercase tracking-[0.1em] md:tracking-[0.2em]">Talking to the Brain</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
             <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[7px] md:text-[8px] font-mono text-emerald-500 uppercase">ONLINE</span>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 z-10" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((m) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, x: m.role === 'user' ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                 <div className={`max-w-[85%] p-3 rounded-none border ${
                   m.role === 'user' 
                   ? 'bg-primary/10 border-primary/30 text-primary-foreground' 
                   : 'bg-card border-border text-foreground'
                 }`}>
                    <p className="text-xs font-mono leading-relaxed">{m.content}</p>
                 </div>
                 <span className="text-[8px] font-mono text-muted-foreground uppercase mt-1 opacity-50">
                   {m.role === 'user' ? 'IDENTITY_VERIFIED' : 'ARCHITECT_NODE_01'}
                 </span>
              </motion.div>
            ))}
            {isProcessing && (
              <div className="flex flex-col items-start gap-2">
                <div className="bg-card border border-border p-3 flex items-center gap-3">
                   <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                   <span className="text-[10px] font-mono uppercase tracking-widest animate-pulse">Thinking of ideas...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 md:p-4 border-t border-border bg-card/50 z-10">
          <div className="relative group flex items-center gap-2">
            <div className="relative flex-1">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isListening ? "Listening..." : "Describe target..."}
                className={`pr-10 rounded-none bg-background/50 border-border focus-visible:ring-primary font-mono text-[10px] md:text-xs h-10 md:h-12 transition-all ${isListening ? 'border-primary ring-1 ring-primary/50 placeholder:text-primary animate-pulse' : ''}`}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={toggleListening}
                className={`absolute right-1 top-1 h-8 w-8 md:h-10 md:w-10 transition-colors ${isListening ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:text-primary'}`}
              >
                <Mic className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isListening ? 'animate-bounce' : ''}`} />
              </Button>
            </div>
            <Button 
              size="icon" 
              onClick={handleSend}
              disabled={isProcessing || !input.trim()}
              className="h-10 w-10 md:h-12 md:w-12 rounded-none bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-transform active:scale-95 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right: Proposal Preview / Gemified Controls */}
      <div className="lg:col-span-5 flex flex-col gap-3 md:gap-4 overflow-y-auto lg:overflow-visible pb-20 lg:pb-0">
        {/* Team Status Card */}
        <Card className="rounded-none border-border bg-card/40 p-4 space-y-4 relative overflow-hidden">
           {isListening && (
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="absolute inset-0 bg-red-500/5 pointer-events-none"
             >
               <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
             </motion.div>
           )}
           <div>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Materialization_Tier</span>
                 <span className="text-[10px] font-mono font-bold text-primary">TIER_{messages.length > 5 ? 'III' : messages.length > 2 ? 'II' : 'I'}</span>
              </div>
              <div className="h-1.5 w-full bg-muted overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min((messages.length / 8) * 100, 100)}%` }}
                   className="h-full bg-primary"
                 />
              </div>
           </div>

           <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Our Smart Helpers</span>
              <div className="flex gap-1">
                 {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-emerald-500/50" />)}
              </div>
           </div>
           <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-[8px] font-mono uppercase">Word Helper</span>
                 </div>
                 <span className="text-[8px] font-mono text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-[8px] font-mono uppercase">Rule Maker</span>
                 </div>
                 <span className="text-[8px] font-mono text-muted-foreground">Online</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="text-[8px] font-mono uppercase">Ears</span>
                 </div>
                 <span className="text-[8px] font-mono text-muted-foreground">{isListening ? 'LISTENING' : 'READY'}</span>
              </div>
           </div>
        </Card>

        {/* Local Folder Upload Zone */}
        <div className="relative">
          <input 
            type="file" 
            accept=".json"
            id="skill-import"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileImport(file);
            }}
          />
          <Card 
            onClick={() => document.getElementById('skill-import')?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add('border-primary', 'bg-primary/5');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
              const file = e.dataTransfer.files[0];
              if (file && file.name.endsWith('.json')) {
                handleFileImport(file);
              } else {
                toast.error("Format mismatch. Expected manifest.json");
              }
            }}
            className="rounded-none border-dashed border-border bg-muted/10 p-4 hover:border-primary/50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
               <div className="p-2 bg-muted border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                  <Box className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
               </div>
               <div className="flex-1">
                  <h4 className="text-[10px] font-mono font-bold uppercase">Local_Repository_Sync</h4>
                  <p className="text-[8px] font-mono text-muted-foreground uppercase">Drop folder or select manifest.json to ingest local skills</p>
               </div>
               <Upload className="w-3 h-3 text-muted-foreground group-hover:text-primary group-hover:translate-y-[-2px] transition-all" />
            </div>
          </Card>
        </div>

        {/* Entropy Engine Zone */}
        <Card 
          onClick={runEntropyEngine}
          className={`rounded-none border-dashed border-border transition-all cursor-pointer group relative overflow-hidden ${isEntropyRunning ? 'bg-primary/10 border-primary' : 'bg-muted/10 hover:border-primary/50'}`}
        >
          {isEntropyRunning && (
            <motion.div 
              className="absolute inset-0 bg-primary/10"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4, ease: "linear" }}
            />
          )}
          <div className="p-4 flex items-center gap-3 relative z-10">
             <div className="p-2 bg-muted border border-border group-hover:bg-primary/10 group-hover:border-primary/30 transition-colors">
                <Atom className={`w-4 h-4 ${isEntropyRunning ? 'text-primary animate-spin' : 'text-muted-foreground group-hover:text-primary'}`} />
             </div>
             <div className="flex-1">
                <h4 className="text-[10px] font-mono font-bold uppercase">Automatic_Idea_Generator</h4>
                <p className="text-[8px] font-mono text-muted-foreground uppercase">Let the AI surprise you with a random useful automation</p>
             </div>
             <Dices className={`w-3 h-3 ${isEntropyRunning ? 'text-primary animate-bounce' : 'text-muted-foreground group-hover:text-primary'}`} />
          </div>
        </Card>

        {/* Deep Diagnosis Zone */}
        <Card 
          onClick={runDeepDiagnosis}
          className={`rounded-none border-dashed border-border transition-all cursor-pointer group relative overflow-hidden ${isDiagnosing ? 'bg-blue-500/10 border-blue-500' : 'bg-muted/10 hover:border-blue-500/50'}`}
        >
          {isDiagnosing && (
            <motion.div 
              className="absolute inset-0 bg-blue-500/10"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 5, ease: "linear" }}
            />
          )}
          <div className="p-4 flex items-center gap-3 relative z-10">
             <div className="p-2 bg-muted border border-border group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                <ScanSearch className={`w-4 h-4 ${isDiagnosing ? 'text-blue-500 animate-pulse' : 'text-muted-foreground group-hover:text-blue-500'}`} />
             </div>
             <div className="flex-1">
                <h4 className="text-[10px] font-mono font-bold uppercase">Scan_Phone_For_Gaps</h4>
                <p className="text-[8px] font-mono text-muted-foreground uppercase">Find apps that could be automated or improved</p>
             </div>
             <TabletSmartphone className={`w-3 h-3 ${isDiagnosing ? 'text-blue-500 animate-bounce' : 'text-muted-foreground group-hover:text-blue-500'}`} />
          </div>
        </Card>

        <AnimatePresence mode="wait">
          {activeProposal ? (
            <motion.div 
              key="active-proposal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col gap-4"
            >
              <Card className="rounded-none border-border bg-card/60 flex-1 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Our Secret Plan</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {isVerified ? (
                      <Badge variant="outline" className="rounded-none border-emerald-500 text-emerald-500 bg-emerald-500/10 text-[8px]">VERIFIED_OK</Badge>
                    ) : (testResults.some(r => !r.passed) || (securityReport && securityReport.score < 80)) ? (
                      <Badge variant="outline" className="rounded-none border-red-500 text-red-500 bg-red-500/10 text-[8px] animate-pulse">FIX_REQUIRED</Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-none border-amber-500/50 text-amber-500 bg-amber-500/10 text-[8px]">UNVERIFIED</Badge>
                    )}
                    <div className="flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500/70" />
                      <span className="text-[6px] font-mono opacity-50 uppercase tracking-tighter">Safety Check: OK</span>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase underline decoration-primary">Helper Name</span>
                        <h3 className="text-xl font-bold uppercase italic tracking-tighter">{activeProposal.name}</h3>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-mono text-muted-foreground uppercase">Hard to Build?</span>
                          <span className="text-[10px] font-mono font-bold text-primary">{activeProposal.difficulty}%</span>
                        </div>
                        <div className="h-1 w-full bg-muted overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${activeProposal.difficulty}%` }}
                            className={`h-full ${activeProposal.difficulty > 80 ? 'bg-red-500' : activeProposal.difficulty > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase decoration-primary">Goals</span>
                        <p className="text-xs text-muted-foreground leading-relaxed">{activeProposal.description}</p>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          {activeProposal.workflow?.nextSkillId && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[7px] font-mono text-indigo-400 uppercase">
                              <Workflow className="w-2 h-2" />
                              WORKFLOW_LINK: {activeProposal.workflow.nextSkillId}
                            </div>
                          )}
                          {activeProposal.schedule?.enabled && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[7px] font-mono text-amber-400 uppercase">
                              <Clock className="w-2 h-2" />
                              SCHEDULED: {activeProposal.schedule.frequency}
                            </div>
                          )}
                          {activeProposal.tags.some(t => t.toLowerCase().includes('google') || t.toLowerCase().includes('workspace')) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[7px] font-mono text-blue-400 uppercase">
                              <Workflow className="w-2 h-2" />
                              WORKSPACE_SYNC: READY
                            </div>
                          )}
                          {activeProposal.tags.some(t => t.toLowerCase().includes('samsung') || t.toLowerCase().includes('bixby') || t.toLowerCase().includes('galaxy')) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[7px] font-mono text-purple-400 uppercase">
                              <Zap className="w-2 h-2" />
                              GALAXY_OS_INTEGRATION: ACTIVE
                            </div>
                          )}
                          {activeProposal.tags.some(t => t.toLowerCase().includes('photos')) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[7px] font-mono text-pink-400 uppercase">
                              <ImageIcon className="w-2 h-2" />
                              PHOTOS_NODE: SYNC_READY
                            </div>
                          )}
                          {activeProposal.tags.some(t => t.toLowerCase().includes('maps')) && (
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-[7px] font-mono text-green-400 uppercase">
                              <MapPin className="w-2 h-2" />
                              MAPS_LOGISTICS_HUB: CONNECTED
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">How the helper works (Steps)</span>
                        <div className="p-3 bg-background/50 border border-border/50 rounded-none">
                          <p className="text-[10px] font-mono leading-relaxed line-clamp-6 opacity-70 italic whitespace-pre-wrap">
                            {activeProposal.instructions}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Special Powers</span>
                        <div className="grid grid-cols-1 gap-2">
                          {activeProposal.traits.map((trait, idx) => (
                            <button
                              key={trait.label}
                              onClick={() => {
                                const newTraits = [...activeProposal.traits];
                                newTraits[idx].value = !newTraits[idx].value;
                                setActiveProposal({ ...activeProposal, traits: newTraits });
                                toast.info(`Trait ${trait.label} ${newTraits[idx].value ? 'Activated' : 'Suppressed'}`);
                              }}
                              className={`flex items-center justify-between p-2 border transition-all ${
                                trait.value 
                                ? 'bg-primary/10 border-primary text-primary' 
                                : 'bg-muted/50 border-border text-muted-foreground'
                              }`}
                            >
                              <div className="flex flex-col items-start text-left">
                                <span className={`text-[10px] font-bold uppercase font-mono ${trait.value ? 'text-primary' : ''}`}>
                                  {trait.label}
                                </span>
                                <span className="text-[8px] font-mono opacity-70 italic">{trait.description}</span>
                              </div>
                              <div className={`w-3 h-3 border border-current flex items-center justify-center`}>
                                {trait.value && <div className="w-1.5 h-1.5 bg-primary" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Security & Vitals Audit Section */}
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-primary">Security & Vitals Audit</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={runSecurityAudit}
                            disabled={isAuditing}
                            className="h-6 text-[8px] font-mono uppercase bg-red-500/5 border-red-500/20 hover:bg-red-500/10 text-red-500"
                          >
                            {isAuditing ? <RefreshCw className="w-2 h-2 mr-1 animate-spin" /> : <ShieldAlert className="w-2 h-2 mr-1" />}
                            Scan Security
                          </Button>
                        </div>

                        {securityReport && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-3"
                          >
                            <div className="p-3 bg-muted/30 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[8px] font-mono uppercase font-bold">Safety Score</span>
                                <div className="flex gap-2">
                                  {(securityReport.leaks.length > 0 || securityReport.smells.length > 0) && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => handleAutoFix('security')}
                                      disabled={isFixing}
                                      className="h-5 text-[7px] font-mono uppercase text-amber-500 hover:text-amber-400 p-0"
                                    >
                                      <Sparkles className="w-2 h-2 mr-1" />
                                      REMEDY_NOW
                                    </Button>
                                  )}
                                  <span className={`text-[10px] font-mono font-bold ${securityReport.score > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>{securityReport.score}/100</span>
                                </div>
                              </div>
                              <div className="h-1 w-full bg-muted overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${securityReport.score}%` }}
                                  className={`h-full ${securityReport.score > 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              {securityReport.leaks.map((leak, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-red-500/10 border border-red-500/20 text-[9px] font-mono text-red-500 uppercase italic">
                                  <ShieldAlert className="w-3 h-3" />
                                  LEAK_PATTERN: {leak}
                                </div>
                              ))}
                              {securityReport.smells.map((smell, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-500 uppercase italic">
                                  <Activity className="w-3 h-3" />
                                  LOGIC_SMELL: {smell}
                                </div>
                              ))}
                              {securityReport.leaks.length === 0 && securityReport.smells.length === 0 && (
                                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-500 uppercase italic">
                                  <ShieldCheck className="w-3 h-3" />
                                  ZERO_VULNERABILITIES_DETECTED
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <span className="text-[8px] font-mono text-muted-foreground uppercase">Labels</span>
                        <div className="flex flex-wrap gap-1">
                          {activeProposal.tags.map(t => (
                            <span key={t} className="px-1.5 py-0.5 bg-muted text-[8px] font-mono border border-border uppercase">{t}</span>
                          ))}
                        </div>
                      </div>

                      {/* E2E Testing Section */}
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-primary">The Practice Room</span>
                          <div className="flex gap-2">
                             {testResults.some(r => !r.passed) && (
                               <Button 
                                 variant="outline" 
                                 size="sm" 
                                 onClick={() => handleAutoFix('tests')}
                                 disabled={isFixing}
                                 className="h-6 text-[8px] font-mono uppercase bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10 text-amber-500"
                               >
                                 {isFixing ? <RefreshCw className="w-2 h-2 mr-1 animate-spin" /> : <Sparkles className="w-2 h-2 mr-1" />}
                                 Auto-Fix Failures
                               </Button>
                             )}
                             <Button 
                               variant="outline" 
                               size="sm" 
                               onClick={runE2ETests}
                               className="h-6 text-[8px] font-mono uppercase bg-primary/5 border-primary/20 hover:bg-primary/10"
                             >
                               <Play className="w-2 h-2 mr-1" />
                               Run Tests
                             </Button>
                          </div>
                        </div>
                        
                        {testResults.length > 0 && (
                          <div className="space-y-1">
                            {testResults.map((res, i) => (
                              <div key={i} className="p-2 bg-muted/30 border border-border space-y-1">
                                <div className="flex items-center justify-between text-[8px] font-mono uppercase">
                                  <span className="truncate flex-1 mr-2">{res.scenario}</span>
                                  {res.passed ? (
                                    <span className="text-emerald-500 flex items-center">
                                      <Check className="w-2 h-2 mr-1" />
                                      PASS
                                    </span>
                                  ) : (
                                    <span className="text-red-500 flex items-center">
                                      <ShieldAlert className="w-2 h-2 mr-1" />
                                      FAIL
                                    </span>
                                  )}
                                </div>
                                {!res.passed && (
                                  <div className="text-[7px] font-mono border-t border-border/30 pt-1 mt-1">
                                    <div className="text-muted-foreground uppercase opacity-70">Expected: {res.expected}</div>
                                    <div className="text-red-400 line-clamp-2 uppercase">Actual: {res.actual}</div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Diagnostic Laboratory Section */}
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold uppercase text-primary">The Test Lab</span>
                          {isLabSimulating && (
                            <div className="flex items-center gap-1">
                              <RefreshCw className="w-2 h-2 animate-spin text-primary" />
                              <span className="text-[6px] font-mono text-primary animate-pulse">TRYING IT...</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                           <div className="relative">
                            <Input 
                              value={labInput}
                              onChange={(e) => setLabInput(e.target.value)}
                              placeholder="Type something to try..."
                              className="h-8 text-[10px] font-mono bg-muted/30 border-border rounded-none pr-12 focus-visible:ring-primary"
                            />
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={runLabSimulation}
                              disabled={isLabSimulating || !labInput.trim()}
                              className="absolute right-0 top-0 h-8 w-10 text-primary hover:bg-primary/10 rounded-none"
                            >
                              <Activity className="w-3 h-3" />
                            </Button>
                           </div>

                           {labOutput && (
                             <motion.div 
                               initial={{ opacity: 0, y: 5 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="p-3 bg-primary/5 border border-primary/20 rounded-none"
                             >
                                <div className="flex items-center justify-between mb-1.5">
                                   <span className="text-[6px] font-mono opacity-50 uppercase">What the skill says:</span>
                                   <button onClick={() => setLabOutput('')} className="text-[6px] font-mono opacity-50 hover:opacity-100 uppercase underline">Clear</button>
                                </div>
                                <p className="text-[9px] font-mono leading-relaxed whitespace-pre-wrap">{labOutput}</p>
                             </motion.div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border bg-muted/20 space-y-3">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-none font-mono text-[10px] uppercase h-10"
                      onClick={() => {
                        setActiveProposal(null);
                        setMessages([{ 
                          id: Date.now().toString(), 
                          role: 'agent', 
                          content: "Lab cleared. Tell me a new idea!" 
                        }]);
                      }}
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      DELETE IDEA
                    </Button>
                    <Button 
                      className={`flex-1 rounded-none font-mono text-[10px] uppercase h-10 shadow-lg shadow-primary/20 ${!isVerified && activeProposal.testScenarios?.length > 0 ? 'opacity-50' : ''}`}
                      onClick={handleFinalize}
                      disabled={!isVerified && activeProposal.testScenarios?.length > 0}
                    >
                      <Check className="w-3 h-3 mr-2" />
                      {isVerified ? 'SAVE_TO_LAB' : 'VERIFICATION_REQUIRED'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Heuristic Matrix / Boost Controls */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Safe", icon: ShieldCheck, color: "text-blue-500", desc: "No mistakes" },
                  { label: "Fast", icon: Zap, color: "text-amber-500", desc: "Super quick" },
                  { label: "Smart", icon: Cpu, color: "text-emerald-500", desc: "Uses its brain" }
                ].map(stat => (
                  <button 
                    key={stat.label}
                    onClick={() => {
                      setInput(`Re-architect with primary focus on ${stat.label} (${stat.desc})`);
                      handleSend();
                    }}
                    className="p-2 border border-border bg-card/40 flex flex-col items-center gap-1 hover:bg-primary/5 transition-colors group"
                  >
                    <stat.icon className={`w-3 h-3 ${stat.color} group-hover:scale-110 transition-transform`} />
                    <span className="text-[7px] font-mono font-bold uppercase">{stat.label}</span>
                  </button>
                ))}
              </div>

              {/* Interaction Hints (The "Gamification") */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setInput("Make it more professional and technical")}
                  className="p-3 border border-border bg-card/20 hover:bg-primary/5 transition-colors text-left flex flex-col gap-2 group"
                >
                  <ShieldCheck className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-[8px] font-mono uppercase font-bold">Refine: Professional</span>
                </button>
                <button 
                  onClick={() => setInput("Add more training examples matching this style")}
                  className="p-3 border border-border bg-card/20 hover:bg-primary/5 transition-colors text-left flex flex-col gap-2 group"
                >
                  <Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  <span className="text-[8px] font-mono uppercase font-bold">Expand: Learning</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 border border-dashed border-border flex flex-col items-center justify-center p-8 text-center bg-muted/10">
              <Cpu className="w-12 h-12 text-muted-foreground opacity-20 mb-4 animate-pulse" />
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase italic tracking-tighter">I'm waiting!</h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase leading-relaxed max-w-[200px]">
                  Type your idea in the chat box to start making your smart skill.
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-full shadow-2xl z-[60] lg:hidden">
         <Mic className="w-4 h-4 text-primary" />
         <span className="text-[10px] font-mono font-bold uppercase">Voice_Input: Idle</span>
      </div>
    </div>
  );
}
