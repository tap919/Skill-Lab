/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Upload, Folder, FileJson, Check, AlertCircle, X, Terminal, Loader2 } from 'lucide-react';
import { Skill } from '../types';
import { generateId } from '../lib/id';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

export function SkillImporter({ 
  onImport, 
  onCancel 
}: { 
  onImport: (skills: Skill[]) => void; 
  onCancel: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [partitionMode, setPartitionMode] = useState(false);
  const [candidates, setCandidates] = useState<{ 
    file: File; 
    skill: Skill | null; 
    category?: 'Invoices' | 'Development' | 'Skills' | 'Unknown';
    error?: string 
  }[]>([]);

  const categorizeFile = async (file: File): Promise<'Invoices' | 'Development' | 'Skills' | 'Unknown'> => {
    const name = file.name.toLowerCase();
    
    if (name.endsWith('.json')) {
      try {
        const content = await file.text();
        const json = JSON.parse(content);
        if (json.name && (json.instructions || json.systemPrompt)) return 'Skills';
      } catch (e) {}
    }

    const isInvoice = 
      /invoice|bill|receipt|payment|tax/i.test(name) || 
      ['.pdf', '.xml', '.csv'].some(ext => name.endsWith(ext));
    
    if (isInvoice) return 'Invoices';

    const isDev = 
      /src|code|script|dev|test|api|lib|app|index/i.test(name) ||
      ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.cpp', '.java', '.html', '.css'].some(ext => name.endsWith(ext));
    
    if (isDev) return 'Development';

    return 'Unknown';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsScanning(true);
    const newCandidates: typeof candidates = [];

    // Process in chunks to maintain UI responsiveness
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const category = await categorizeFile(file);
      
      if (category === 'Skills' && file.name.endsWith('.json')) {
        try {
          const content = await file.text();
          const json = JSON.parse(content);
          
          const skill: Skill = {
            id: json.id || generateId(),
            name: json.name,
            description: json.description || 'Imported brain.',
            instructions: json.instructions || json.systemPrompt || json.prompt,
            examples: Array.isArray(json.examples) ? json.examples.map((ex: any) => ({
              id: ex.id || generateId(),
              input: ex.input || '',
              output: ex.output || ''
            })) : [],
            author: json.author || 'Imported',
            authorId: json.authorId || 'imported',
            createdAt: json.createdAt || Date.now(),
            updatedAt: Date.now(),
            difficulty: json.difficulty || json.complexity || 50,
            tags: Array.isArray(json.tags) ? json.tags : [],
            version: json.version || '1.0.0',
            isPublic: false,
            schedule: json.schedule || { enabled: false, frequency: 'manual' }
          };
          newCandidates.push({ file, skill, category: 'Skills' });
        } catch (err) {
          newCandidates.push({ file, skill: null, category: 'Unknown', error: 'Failed to parse JSON' });
        }
      } else {
        newCandidates.push({ file, skill: null, category });
      }
    }

    setCandidates(newCandidates);
    setIsScanning(false);
    if (newCandidates.some(c => c.category !== 'Skills')) {
      setPartitionMode(true);
    }
  };

  const handleConfirmImport = () => {
    const validSkills = candidates
      .map(c => c.skill)
      .filter((s): s is Skill => s !== null);
    
    if (validSkills.length > 0) {
      onImport(validSkills);
    }
  };

  const clearSelection = () => {
    setCandidates([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-[0.2em]">
          <Terminal className="w-3 h-3" />
          File Reader: Online
        </div>
        <h2 className="text-3xl font-bold tracking-tighter uppercase italic">Add from your Device</h2>
        <p className="text-muted-foreground text-sm font-mono uppercase tracking-tight">Move your helper files from your computer to the lab.</p>
      </div>

      {candidates.length === 0 ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group border border-dashed border-border aspect-video flex flex-col items-center justify-center space-y-4 cursor-pointer hover:bg-card/30 transition-all bg-card/10 relative overflow-hidden"
        >
          {/* Decorative Corner */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/20 pointer-events-none transition-all group-hover:border-primary" />
          
          <div className="bg-primary/10 p-6 rounded-none group-hover:bg-primary/20 transition-colors">
            <Folder className="w-12 h-12 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-lg font-bold tracking-tighter uppercase italic">Pick your files</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">Upload skill files or folders</p>
          </div>
          <Input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" 
            // @ts-ignore - webkitdirectory is a standard non-standard attribute
            webkitdirectory="" 
            directory="" 
            multiple 
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/20">
                 <FileJson className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase italic tracking-tighter">
                  {partitionMode ? 'Smart Partitioning Complete' : 'Done Checking'}
                </h3>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">
                  Processed {candidates.length} items // 0ms Network Latency
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="font-mono text-[10px] uppercase">
              <X className="w-3 h-3 mr-1.5" />
              TRY_AGAIN
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[400px]">
            <div className="flex flex-col border border-border bg-card/10 overflow-hidden">
               <div className="p-2 border-b border-border bg-background/50 flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-widest font-bold">DIR: /Invoices</span>
                  <span className="text-[8px] font-mono opacity-50">{candidates.filter(c => c.category === 'Invoices').length} Files</span>
               </div>
               <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {candidates.filter(c => c.category === 'Invoices').map((c, i) => (
                      <div key={i} className="text-[9px] font-mono p-1 bg-background/30 border border-border/20 truncate">
                        {c.file.name}
                      </div>
                    ))}
                  </div>
               </ScrollArea>
            </div>

            <div className="flex flex-col border border-border bg-card/10 overflow-hidden">
               <div className="p-2 border-b border-border bg-background/50 flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-widest font-bold text-amber-500">DIR: /Development</span>
                  <span className="text-[8px] font-mono opacity-50">{candidates.filter(c => c.category === 'Development').length} Files</span>
               </div>
               <ScrollArea className="flex-1">
                  <div className="p-2 space-y-1">
                    {candidates.filter(c => c.category === 'Development').map((c, i) => (
                      <div key={i} className="text-[9px] font-mono p-1 bg-background/30 border border-border/20 truncate">
                        {c.file.name}
                      </div>
                    ))}
                  </div>
               </ScrollArea>
            </div>
          </div>

          <div className="border border-border bg-card/10 p-3">
             <div className="flex items-center gap-2 mb-2">
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-mono uppercase font-bold">Detected Skills</span>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {candidates.filter(c => c.category === 'Skills').map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-emerald-500/5 border border-emerald-500/10">
                    <span className="text-[9px] font-mono truncate">{c.file.name}</span>
                    <span className="text-[7px] font-mono bg-emerald-500/10 text-emerald-500 px-1">READY</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="outline" onClick={onCancel} className="font-mono text-xs uppercase h-11">
              GO_BACK
            </Button>
            <Button 
              onClick={handleConfirmImport} 
              disabled={candidates.filter(c => c.skill).length === 0}
              className="font-mono text-xs uppercase h-11 px-8 shadow-lg shadow-primary/20"
            >
              ADD_THEM
            </Button>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-10 h-10 text-primary animate-spin" />
             <p className="text-xs font-mono uppercase tracking-[0.4em] animate-pulse">Checking files...</p>
          </div>
        </div>
      )}
    </div>
  );
}
