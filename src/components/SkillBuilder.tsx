/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, X, Plus, Trash2, HelpCircle, Terminal, Box, Workflow, Clock, Layers, Play, RefreshCw, Package, FileCode, Plug, Key } from 'lucide-react';
import { Skill, SkillExample, ToolCall } from '../types';
import { generateId } from '../lib/id';
import { toKebabCase } from '../services/edgeGalleryExporter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';

export function SkillBuilder({ 
  skill, 
  onSave, 
  onCancel 
}: { 
  skill: Skill; 
  onSave: (skill: Skill) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<Skill>({ ...skill });
  const [isSimulating, setIsSimulating] = useState(false);
  const [testResults, setTestResults] = useState<{scenario: string, expected: string, actual: string, passed: boolean, category?: string}[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [securityReport, setSecurityReport] = useState<{score: number, leaks: string[], smells: string[]} | null>(null);

  const runSecurityAudit = async () => {
    setIsAuditing(true);
    setSecurityReport(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      
      const leaks = [];
      const smells = [];
      
      const prompt = formData.instructions.toLowerCase();
      if (prompt.includes('ignore') || prompt.includes('override')) smells.push("Instruction override risk detected");
      if (prompt.includes('password') || prompt.includes('key')) leaks.push("Hardcoded secret patterns found");
      if (formData.instructions.length < 50) smells.push("Underspecified behavioral weights");
      
      if (formData.examples.length < 2) smells.push("Low few-shot density; higher hallucination risk");
      
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

  const handleAutoFix = async (context: 'tests' | 'security' = 'tests') => {
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
      const { refineSkill } = await import('../services/aiSkillAgent');
      // Wrap formData in a proposal-like object for refineSkill
      const proposal = await refineSkill({
        name: formData.name,
        description: formData.description,
        instructions: formData.instructions,
        examples: formData.examples.map(ex => ({ input: ex.input, output: ex.output })),
        tags: formData.tags,
        difficulty: formData.difficulty || 50,
        testScenarios: formData.testScenarios || [],
        traits: [],
        explanation: 'Refining for security/tests'
      }, fixInput);

      handleLogicChange(prev => ({
        ...prev,
        instructions: proposal.instructions,
        examples: proposal.examples.map(ex => ({ id: generateId(), ...ex }))
      }));
      
      setTestResults([]);
      setSecurityReport(null);
      toast.success(`Auto-Fix applied via Gemma_Node. Reviewing changes.`);
    } catch (err) {
      toast.error("Fix failed. The AI node is currently busy.");
    } finally {
      setIsFixing(false);
    }
  };

  const handleLogicChange = (updater: (prev: Skill) => Skill) => {
    setFormData(prev => {
      const next = updater(prev);
      setIsVerified(false);
      return next;
    });
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const { simulateSkill } = await import('../services/aiSkillAgent');
      const result = await simulateSkill(
        formData.instructions,
        formData.examples,
        formData.examples[0]?.input || "Hello"
      );
      toast.success(`Check Output: ${(result || '').substring(0, 50)}...`);
    } catch (err) {
      toast.error("Check failure.");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleUpdateExample = (id: string, field: keyof SkillExample, value: string) => {
    handleLogicChange(prev => ({
      ...prev,
      examples: prev.examples.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
    }));
  };

  const handleAddExample = () => {
    handleLogicChange(prev => ({
      ...prev,
      examples: [...prev.examples, { id: generateId(), input: '', output: '' }]
    }));
  };

  const handleRemoveExample = (id: string) => {
    handleLogicChange(prev => ({
      ...prev,
      examples: prev.examples.filter(ex => ex.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasTests = formData.testScenarios && formData.testScenarios.length > 0;
    if (hasTests && !isVerified) {
      toast.error("Code smells detected. Please run and pass the validation suite before saving.");
      return;
    }
    onSave({ 
      ...formData, 
      updatedAt: Date.now(),
      isVerified,
      securityScore: securityReport?.score
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-mono text-[9px] md:text-[10px] uppercase tracking-[0.2em]">
            <Terminal className="w-3 h-3" />
            Skill Designer Mode: Active
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase italic">
            Design Your Skill
          </h2>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={onCancel} className="flex-1 md:flex-none font-mono text-[10px] md:text-xs uppercase h-9">
            <X className="w-3.5 h-3.5 mr-2" />
            CANCEL
          </Button>
              <Button onClick={handleSubmit} disabled={formData.testScenarios?.length > 0 && !isVerified} className={`flex-1 md:flex-none font-mono text-[10px] md:text-xs uppercase h-9 ${formData.testScenarios?.length > 0 && !isVerified ? 'opacity-50' : ''}`}>
                <Save className="w-3.5 h-3.5 mr-2" />
                {isVerified || !formData.testScenarios?.length ? 'SAVE' : 'PENDING'}
              </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <Tabs defaultValue="definition" className="w-full">
            <div className="relative">
              <TabsList className="bg-card w-full justify-start rounded-none p-0 h-10 md:h-12 overflow-x-auto no-scrollbar">
                <TabsTrigger value="definition" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">01_NAME</TabsTrigger>
                <TabsTrigger value="prompt" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">02_RULES</TabsTrigger>
                <TabsTrigger value="examples" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">03_SAMPLES</TabsTrigger>
                <TabsTrigger value="edgegallery" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">04_EDGE</TabsTrigger>
                <TabsTrigger value="tools" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">05_TOOLS</TabsTrigger>
                <TabsTrigger value="workflow" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">06_TEAM</TabsTrigger>
                <TabsTrigger value="schedule" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">07_PLAN</TabsTrigger>
                <TabsTrigger value="tests" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">08_PRACTICE</TabsTrigger>
                <TabsTrigger value="integrate" className="rounded-none h-full data-[state=active]:bg-background data-[state=active]:border-t-2 data-[state=active]:border-t-primary px-3 md:px-6 font-mono text-[9px] md:text-xs uppercase tracking-widest whitespace-nowrap flex-shrink-0">09_SHARE</TabsTrigger>
              </TabsList>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none md:hidden" />
            </div>

            <TabsContent value="tests" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
               <div className="flex items-center justify-between">
                 <div className="space-y-1">
                   <h4 className="text-sm font-bold uppercase italic tracking-tighter">Practice Runs</h4>
                   <p className="text-[10px] font-mono text-muted-foreground uppercase">Give the skill something to do and see if it gets it right.</p>
                 </div>
                 <Button type="button" variant="outline" size="sm" onClick={() => setFormData(prev => ({ ...prev, testScenarios: [...(prev.testScenarios || []), { input: '', expectedResult: '' }] }))} className="font-mono text-[10px] uppercase">
                   <Plus className="w-3 h-3 mr-1.5" />
                   ADD_PRACTICE
                 </Button>
               </div>

               <div className="space-y-4">
                  {(formData.testScenarios || []).map((scenario, index) => (
                    <div key={index} className="border border-border bg-card/20 p-4 space-y-3 relative group">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleLogicChange(prev => ({ ...prev, testScenarios: prev.testScenarios?.filter((_, i) => i !== index) }))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[9px] font-mono text-muted-foreground uppercase">Input</Label>
                          <Input 
                            value={scenario.input}
                            onChange={(e) => {
                              handleLogicChange(prev => {
                                const next = [...(prev.testScenarios || [])];
                                next[index].input = e.target.value;
                                return { ...prev, testScenarios: next };
                              });
                            }}
                            className="bg-background/50 border-border h-8 text-[10px] font-mono rounded-none"
                            placeholder="Test input..."
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[9px] font-mono text-muted-foreground uppercase">Expect (Keyword)</Label>
                          <Input 
                            value={scenario.expectedResult}
                            onChange={(e) => {
                              handleLogicChange(prev => {
                                const next = [...(prev.testScenarios || [])];
                                next[index].expectedResult = e.target.value;
                                return { ...prev, testScenarios: next };
                              });
                            }}
                            className="bg-background/50 border-border h-8 text-[10px] font-mono rounded-none"
                            placeholder="Expected keyword..."
                          />
                        </div>
                        <div className="space-y-1 col-span-2">
                           <Label className="text-[9px] font-mono text-muted-foreground uppercase">Validation Type</Label>
                           <div className="flex gap-2">
                              {['logic', 'security', 'performance', 'edge_case'].map(cat => (
<button
                                  type="button"
                                  key={cat}
                                  onClick={() => {
                                    handleLogicChange(prev => {
                                      const next = [...(prev.testScenarios || [])];
                                      next[index].category = cat as 'logic' | 'security' | 'performance' | 'edge_case';
                                      return { ...prev, testScenarios: next };
                                    });
                                  }}
                                  className={`px-2 py-1 text-[8px] font-mono uppercase border ${scenario.category === cat ? 'bg-primary/20 border-primary text-primary' : 'bg-background/50 border-border/50 text-muted-foreground'}`}
                                >
                                  {cat.replace('_', ' ')}
                                </button>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button 
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.testScenarios || formData.testScenarios.length === 0) return;
                      setIsTesting(true);
                      setTestResults([]);
                      setIsVerified(false);
                      const { simulateSkill } = await import('../services/aiSkillAgent');
                      
                      let allPassed = true;
                      for (const scenario of formData.testScenarios) {
                        try {
                          const actual = await simulateSkill(formData.instructions, formData.examples, scenario.input);
                          const passed = actual.toLowerCase().includes(scenario.expectedResult.toLowerCase());
                          if (!passed) allPassed = false;
                          
                          setTestResults(prev => [...prev, { 
                            scenario: scenario.input, 
                            expected: scenario.expectedResult, 
                            actual, 
                            passed,
                            category: scenario.category 
                          }]);
                        } catch (err) {
                           allPassed = false;
                           setTestResults(prev => [...prev, { 
                             scenario: scenario.input, 
                             expected: scenario.expectedResult, 
                             actual: 'ERROR', 
                             passed: false,
                             category: scenario.category
                           }]);
                        }
                      }
                      setIsTesting(false);
                      if (allPassed) {
                        setIsVerified(true);
                        toast.success("Skill certified functional.");
                      } else {
                        toast.error("Validation errors detected.");
                      }
                    }}
                    disabled={isTesting || !formData.testScenarios?.length}
                    className="flex-1 h-10 border-primary/20 text-primary hover:bg-primary/5 uppercase font-mono text-[10px]"
                  >
                    {isTesting ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <Play className="w-3 h-3 mr-2" />}
                    EXECUTE_VALIDATION_SUITE
                  </Button>

                  {testResults.some(r => !r.passed) && (
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => handleAutoFix('tests')}
                      disabled={isFixing}
                      className="ml-2 h-10 border-amber-500/20 text-amber-500 hover:bg-amber-500/5 uppercase font-mono text-[10px]"
                    >
                      {isFixing ? <RefreshCw className="w-3 h-3 mr-2 animate-spin" /> : <RefreshCw className="w-3 h-3 mr-2" />}
                      FIX
                    </Button>
                  )}

                  {testResults.length > 0 && (
                    <div className="space-y-2 border-t border-border pt-4">
                      <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">Execution_Log</h5>
                      <div className="space-y-1">
                        {testResults.map((res, i) => (
                          <div key={i} className="p-2 border border-border bg-background/30 text-[9px] font-mono">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2 truncate flex-1">
                                <span className="font-bold">{res.scenario || 'EMPTY_INPUT'}</span>
                                {res.category && (
                                  <span className="text-[7px] px-1 bg-primary/10 border border-primary/20 text-primary uppercase">
                                    {res.category.replace('_', ' ')}
                                  </span>
                                )}
                              </div>
                              <span className={res.passed ? 'text-emerald-500' : 'text-red-500'}>
                                {res.passed ? '[PASS]' : '[FAIL]'}
                              </span>
                            </div>
                            <div className="opacity-60 text-[8px] space-y-0.5">
                              <div>EXP: {res.expected}</div>
                              <div className="truncate">ACT: {res.actual}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            </TabsContent>

            <TabsContent value="edgegallery" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
               <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase italic tracking-tighter">Edge Gallery Export</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Configure skill for Google AI Edge Gallery compatibility.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
<div 
                          onClick={() => handleLogicChange(prev => ({
                            ...prev,
                            edgeGallery: { ...(prev.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] }), isJsSkill: !prev.edgeGallery?.isJsSkill }
                          }))}
                         className={`p-4 border cursor-pointer transition-all ${formData.edgeGallery?.isJsSkill ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'}`}
                       >
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-mono font-bold uppercase tracking-widest">JS Skill</span>
                             <FileCode className="w-4 h-4" />
                          </div>
                          <p className="text-[8px] font-mono opacity-60 mt-1">Uses scripts/index.html</p>
                       </div>
                       <div 
onClick={() => handleLogicChange(prev => ({
                            ...prev,
                            edgeGallery: { ...(prev.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] }), requireSecret: !prev.edgeGallery?.requireSecret }
                          }))}
                         className={`p-4 border cursor-pointer transition-all ${formData.edgeGallery?.requireSecret ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'}`}
                       >
                          <div className="flex items-center justify-between">
                             <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Secret Required</span>
                             <Key className="w-4 h-4" />
                          </div>
                          <p className="text-[8px] font-mono opacity-60 mt-1">API key or token</p>
                       </div>
                    </div>

                    {formData.edgeGallery?.requireSecret && (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">Secret Description</Label>
                        <Input 
                          value={formData.edgeGallery?.secretDescription || ''}
                          onChange={(e) => handleLogicChange(prev => ({
                            ...prev,
                            edgeGallery: { ...(prev.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] }), secretDescription: e.target.value }
                          }))}
                          className="rounded-none bg-card/30 border-border font-mono h-10"
                          placeholder="e.g. Get API key from settings..."
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-mono text-muted-foreground uppercase">Homepage URL (Optional)</Label>
                      <Input 
                        value={formData.edgeGallery?.homepage || ''}
onChange={(e) => handleLogicChange(prev => ({
                            ...prev,
                            edgeGallery: { ...(prev.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] }), homepage: e.target.value }
                          }))}
                        className="rounded-none bg-card/30 border-border font-mono h-10"
                        placeholder="https://github.com/your/skill"
                      />
                    </div>

                    <div className="p-3 bg-muted/30 border border-border">
                      <div className="flex items-center gap-2 text-[10px] font-mono">
                        <Package className="w-4 h-4 text-primary" />
                        <span>Folder Name: <span className="text-primary font-bold">{toKebabCase(formData.name)}</span></span>
                      </div>
                    </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="tools" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
               <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase italic tracking-tighter">Tool Integration</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Configure which tools the LLM can call.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <button 
                       onClick={() => {
                         const newTool: ToolCall = { type: 'run_js', scriptName: 'index.html', data: '{}' };
handleLogicChange(prev => ({
                            ...prev,
                            edgeGallery: { 
                              ...(prev.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] }), 
                              toolCalls: [...(prev.edgeGallery?.toolCalls || []), newTool],
                              isJsSkill: true 
                            }
                          }));
                        }}
                       className="p-4 border border-border bg-card/20 hover:bg-primary/5 transition-colors text-left"
                     >
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase">
                          <FileCode className="w-4 h-4" />
                          run_js
                        </div>
                        <p className="text-[8px] font-mono text-muted-foreground mt-1">Execute JavaScript</p>
                     </button>
<button 
                        onClick={() => {
                          const newTool: ToolCall = { type: 'run_intent', intent: 'send_email', parameters: '{}' };
                          handleLogicChange(prev => ({
                            ...prev,
                            edgeGallery: { 
                              ...(prev.edgeGallery || { isJsSkill: false, requireSecret: false, toolCalls: [] }), 
                              toolCalls: [...(prev.edgeGallery?.toolCalls || []), newTool]
                            }
                          }));
                        }}
                        className="p-4 border border-border bg-card/20 hover:bg-primary/5 transition-colors text-left"
                      >
                         <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase">
                           <Plug className="w-4 h-4" />
                           run_intent
                         </div>
                         <p className="text-[8px] font-mono text-muted-foreground mt-1">Native action</p>
                      </button>
                   </div>

                   {(formData.edgeGallery?.toolCalls?.length || 0) > 0 && (
                     <div className="space-y-2">
                       <Label className="text-[10px] font-mono text-muted-foreground uppercase">Configured Tools</Label>
                       {formData.edgeGallery?.toolCalls?.map((tool, idx) => (
                         <div key={idx} className="p-2 border border-border bg-card/30 flex items-center justify-between">
                           <span className="text-[10px] font-mono uppercase">{tool.type}</span>
                           <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
handleLogicChange(prev => {
                                const updatedTools = (prev.edgeGallery?.toolCalls || []).filter((_, i) => i !== idx);
                                return { ...prev, edgeGallery: { ...prev.edgeGallery, toolCalls: updatedTools } };
                              });
                           }}>
                             <Trash2 className="w-3 h-3" />
                           </Button>
                         </div>
                       ))}
                     </div>
                   )}
               </div>
            </TabsContent>

            <TabsContent value="workflow" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
               <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase italic tracking-tighter">Team Collaboration</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Connect this skill to another helper to build a smart team.</p>
                  </div>
                  
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">Next Team Member (Skill ID)</Label>
                        <Input 
                           value={formData.workflow?.nextSkillId || ''}
                           onChange={(e) => handleLogicChange(prev => ({
                             ...prev,
                             workflow: { ...(prev.workflow || {}), nextSkillId: e.target.value }
                           }))}
                           className="rounded-none bg-card/30 border-border font-mono h-10"
                           placeholder="ID of the next skill to run..."
                        />
                        <p className="text-[9px] font-mono text-muted-foreground italic">Which skill should jump in after this one is done?</p>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">When to hand off? (Keywords)</Label>
                        <Input 
                           value={formData.workflow?.triggerOnOutput || ''}
                           onChange={(e) => handleLogicChange(prev => ({
                             ...prev,
                             workflow: { ...(prev.workflow || {}), triggerOnOutput: e.target.value }
                           }))}
                           className="rounded-none bg-card/30 border-border font-mono h-10"
                           placeholder="e.g. ready, success, finished"
                        />
                        <p className="text-[9px] font-mono text-muted-foreground italic">What words should we look for to trigger the team hand-off?</p>
                     </div>
                  </div>
               </div>
            </TabsContent>

            <TabsContent value="schedule" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold uppercase italic tracking-tighter">Timed Execution</h4>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase">Set this automation to run automatically on a schedule.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <div 
                        onClick={() => handleLogicChange(prev => ({ ...prev, schedule: { ...prev.schedule!, enabled: !prev.schedule?.enabled } }))}
                        className={`p-4 border cursor-pointer transition-all ${formData.schedule?.enabled ? 'bg-primary/10 border-primary text-primary' : 'bg-muted/30 border-border text-muted-foreground'}`}
                     >
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Enable Schedule</span>
                           <Clock className="w-4 h-4" />
                        </div>
                     </div>
                     <select 
                        disabled={!formData.schedule?.enabled}
                        value={formData.schedule?.frequency || 'manual'}
                        onChange={(e) => handleLogicChange(prev => ({ ...prev, schedule: { ...prev.schedule!, frequency: e.target.value as any } }))}
                        className="bg-card/30 border border-border h-10 px-3 text-xs font-mono focus-visible:ring-primary outline-none"
                     >
                        <option value="manual">Manual Only</option>
                        <option value="hourly">Every Hour</option>
                        <option value="daily">Every Day</option>
                        <option value="weekly">Every Week</option>
                     </select>
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="integrate" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
<div className="space-y-4">
                 <div className="space-y-1">
                   <h4 className="text-sm font-bold uppercase italic tracking-tighter">Implementation Snippets</h4>
                   <p className="text-[10px] font-mono text-muted-foreground uppercase">Deploy this capability to Edge Gallery or other platforms.</p>
                 </div>

                 <div className="space-y-4 p-4 bg-primary/5 border border-primary/20">
                   <div className="flex items-center justify-between mb-2">
                     <h5 className="text-[10px] font-mono font-bold uppercase text-primary">Edge Gallery Folder Export</h5>
                     <Badge variant="outline" className="rounded-none text-[8px] font-mono bg-primary/10 text-primary border-primary/20">RECOMMENDED</Badge>
                   </div>
                   <p className="text-[9px] font-mono text-muted-foreground">
                     Click the <span className="text-primary">EDGE</span> button on the skill card to export a complete Edge Gallery-ready folder with:
                   </p>
                   <ul className="text-[8px] font-mono text-muted-foreground list-disc list-inside space-y-1">
                     <li>SKILL.md (YAML frontmatter + instructions)</li>
                     {formData.edgeGallery?.isJsSkill && <li>scripts/index.html (JS skill logic)</li>}
                     {formData.edgeGallery?.requireSecret && <li>Secret/API key prompt at runtime</li>}
                     {formData.workflow?.nextSkillId && <li>Workflow chaining enabled</li>}
                   </ul>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-[10px] font-mono text-muted-foreground uppercase">Bixby Manifest (Capsule.bxb)</Label>
                   <div className="bg-muted p-4 border border-border relative group">
                     <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto text-muted-foreground">
{`capsule {
  id (example.${toKebabCase(formData.name)})
  version (${formData.version})
  format (3)
  targets {
    target (bixby-mobile-en-US)
  }
  capsule-imports {
    import (viv.core) { as (core) }
    import (viv.gemma) { as (gemma) }
  }
  permissions {
    device-inference-access
  }
}`}
                     </pre>
                     <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 text-[8px] font-mono uppercase" onClick={() => { navigator.clipboard.writeText(`capsule { id (example.${toKebabCase(formData.name)}) ... }`); toast.success("Snippet copied"); }}>Copy</Button>
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label className="text-[10px] font-mono text-muted-foreground uppercase">Android Intent (Kotlin)</Label>
                   <div className="bg-muted p-4 border border-border relative group">
                     <pre className="text-[10px] font-mono leading-relaxed overflow-x-auto text-muted-foreground">
{`val intent = Intent("com.google.android.gms.actions.GE_INFERENCE")
intent.putExtra("skill_id", "${toKebabCase(formData.name)}")
intent.putExtra("system_prompt", """${(formData.instructions || '').substring(0, Math.min(100, formData.instructions.length))}""")
intent.putExtra("execution_mode", "LOCAL_ONLY")
startActivity(intent)`}
                     </pre>
                     <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-6 text-[8px] font-mono uppercase" onClick={() => { navigator.clipboard.writeText(`val intent = Intent("com.google.android.gms.actions.GE_INFERENCE")...`); toast.success("Snippet copied"); }}>Copy</Button>
                   </div>
                 </div>
               </div>
             </TabsContent>

            <TabsContent value="definition" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="name" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Automation Name</Label>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      Edge Gallery: <span className="text-primary font-mono">{toKebabCase(formData.name)}</span>
                    </span>
                  </div>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-none bg-card/30 border-border focus-visible:ring-primary h-12 text-lg font-bold uppercase tracking-tight"
                    placeholder="E.G. PERSONAL_ASSISTANT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Description</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="rounded-none bg-card/30 border-border focus-visible:ring-primary min-h-[100px]"
                    placeholder="What does this automation do?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="version" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Version</Label>
                    <Input 
                      id="version" 
                      value={formData.version} 
                      onChange={e => setFormData({ ...formData, version: e.target.value })}
                      className="rounded-none bg-card/30 border-border font-mono h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Tags (Comma Separated)</Label>
                    <Input 
                      id="tags" 
                      value={formData.tags.join(', ')} 
                      onChange={e => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                      className="rounded-none bg-card/30 border-border font-mono h-10"
                      placeholder="writing, code, technical"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="prompt" className="pt-6 space-y-4 animate-in fade-in-50 duration-300">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prompt" className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Instructions</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] font-mono uppercase text-muted-foreground">
                      <HelpCircle className="w-3 h-3 mr-1" /> Help
                    </Button>
                  </div>
                </div>
                <Textarea 
                  id="prompt" 
                  value={formData.instructions} 
                  onChange={e => handleLogicChange(prev => ({ ...prev, instructions: e.target.value }))}
                  className="rounded-none bg-card/30 border-border focus-visible:ring-primary min-h-[400px] font-mono text-sm leading-relaxed"
                  placeholder="Explain exactly how the brain should work..."
                />
              </div>
            </TabsContent>

            <TabsContent value="examples" className="pt-6 space-y-6 animate-in fade-in-50 duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase italic tracking-tighter">Few-Shot Learning Examples</h4>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">Provide sample interactions to guide model response style.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddExample} className="font-mono text-[10px] uppercase">
                  <Plus className="w-3 h-3 mr-1.5" />
                  ADD_XMPL
                </Button>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {formData.examples.map((ex, index) => (
                    <div key={ex.id} className="relative group border border-border bg-card/20 p-4 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-primary italic">EXAMPLE_{index + 1}</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveExample(ex.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">USER_INPUT</Label>
                        <Textarea 
                          value={ex.input} 
                          onChange={e => handleUpdateExample(ex.id, 'input', e.target.value)}
                          className="rounded-none bg-background/50 border-border text-xs min-h-[60px]"
                          placeholder="What the user says..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">ASSISTANT_RESPONSE</Label>
                        <Textarea 
                          value={ex.output} 
                          onChange={e => handleUpdateExample(ex.id, 'output', e.target.value)}
                          className="rounded-none bg-background/50 border-border text-xs min-h-[100px]"
                          placeholder="How the model should respond..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-none border-border bg-card/40">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xs font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <Box className="w-4 h-4 text-primary" />
                Live_Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <span className="text-muted-foreground">Brain Memory</span>
                    <span className="text-primary">{Math.floor(formData.instructions.length / 4) + formData.examples.reduce((acc, ex) => acc + (ex.input.length + ex.output.length) / 4, 0)}</span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <span className="text-muted-foreground">Speed</span>
                    <span className="text-emerald-500">FAST</span>
                  </div>
                  <Separator className="bg-border/30" />
                  <div className="flex justify-between text-[10px] font-mono uppercase">
                    <span className="text-muted-foreground">Safety</span>
                    <button 
                      onClick={runSecurityAudit}
                      disabled={isAuditing}
                      className="text-primary hover:underline"
                    >
                      {securityReport ? `${securityReport.score}/100` : isAuditing ? 'AUDITING...' : 'RUN_AUDIT'}
                    </button>
                  </div>
                </div>

                {securityReport && (securityReport.leaks.length > 0 || securityReport.smells.length > 0) && (
                   <div className="p-3 bg-amber-500/5 border border-amber-500/20 space-y-2">
                      <p className="text-[8px] font-mono text-amber-500 uppercase font-bold tracking-widest">Logic Warnings Found</p>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleAutoFix('security')}
                        disabled={isFixing}
                        className="h-6 w-full text-[8px] font-mono uppercase text-amber-500 border border-amber-500/20 hover:bg-amber-500/10"
                      >
                         {isFixing ? <RefreshCw className="w-2 h-2 mr-2 animate-spin" /> : <Save className="w-2 h-2 mr-2" />}
                         Apply Security Fix
                      </Button>
                   </div>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className="w-full h-12 uppercase font-mono text-xs tracking-widest"
                >
                  {isSimulating ? "TRYING IT OUT..." : "TRY IT NOW"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border bg-card/20 italic">
            <CardContent className="pt-6">
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                "Technical Note: Skills created here are compatible with Google Edge Gallery's local manifest format. Ensure system prompts do not conflict with base behavioral weights."
              </p>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
