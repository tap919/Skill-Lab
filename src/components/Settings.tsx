/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ExternalLink, HardDrive, Cpu, Terminal, Database, ShieldAlert, RotateCcw, Bot, Palette, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function Settings({ onBack }: { onBack: () => void }) {
  const [brainName, setBrainName] = React.useState('Gemma-OS');
  const [verbosity, setVerbosity] = React.useState('75%');
  
  const handleReset = () => {
    if (window.confirm('CRITICAL: This will wipe all local skills. Continue?')) {
      localStorage.removeItem('edge_skills');
      toast.info('System storage wiped.');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-none">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tighter uppercase italic">Control Center</h2>
          <p className="text-muted-foreground text-[10px] font-mono uppercase tracking-widest leading-none">System Architecture: v1.0.4-Stable</p>
        </div>
      </div>

      <Tabs defaultValue="system" className="w-full">
        <TabsList className="bg-card/50 w-full justify-start rounded-none border-b border-border p-0 h-10 overflow-x-auto no-scrollbar">
          <TabsTrigger value="system" className="rounded-none h-full data-[state=active]:bg-primary/10 px-6 font-mono text-[10px] uppercase">01_SYSTEM</TabsTrigger>
          <TabsTrigger value="brain" className="rounded-none h-full data-[state=active]:bg-primary/10 px-6 font-mono text-[10px] uppercase">02_BRAIN</TabsTrigger>
          <TabsTrigger value="interface" className="rounded-none h-full data-[state=active]:bg-primary/10 px-6 font-mono text-[10px] uppercase">03_UI</TabsTrigger>
          <TabsTrigger value="prive" className="rounded-none h-full data-[state=active]:bg-primary/10 px-6 font-mono text-[10px] uppercase">04_PRIVACY</TabsTrigger>
        </TabsList>

        <TabsContent value="system" className="pt-6 space-y-6">
          <Card className="rounded-none border-border bg-card/40 relative overflow-hidden">
             <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,#000_50%)] bg-[length:100%_4px]" />
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-primary" />
                Storage Management
              </CardTitle>
              <CardDescription className="text-[10px] font-mono uppercase">Local database & skill indexes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-border bg-background/20 space-y-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase block">Integrity Check</span>
                  <span className="text-emerald-500 font-bold uppercase italic">VERIFIED</span>
                </div>
                <div className="p-4 border border-border bg-background/20 space-y-2">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase block">Sync Mode</span>
                  <span className="text-primary font-bold uppercase italic">LOCAL_EDGE</span>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleReset} className="w-full font-mono text-[10px] uppercase tracking-widest h-10">
                <RotateCcw className="w-3 h-3 mr-2" />
                RESET DATABASE
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-none border-border bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                Nodes & Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
               {[
                 { label: 'Gemma API Endpoint', status: 'DEFAULT', icon: Terminal },
                 { label: 'Cloud Synchronizer', status: 'READY', icon: Database },
                 { label: 'Aural Feedback Engine', status: 'ON', icon: Cpu }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 border border-border/50 bg-background/10">
                   <div className="flex items-center gap-3">
                     <item.icon className="w-4 h-4 text-muted-foreground" />
                     <span className="text-xs uppercase font-bold tracking-tight">{item.label}</span>
                   </div>
                   <span className="text-[9px] font-mono px-2 py-0.5 bg-primary/10 text-primary">{item.status}</span>
                 </div>
               ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brain" className="pt-6 space-y-6">
           <Card className="rounded-none border-border bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-mono uppercase text-muted-foreground">Internal Persona Name</Label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={brainName} 
                    onChange={(e) => setBrainName(e.target.value)}
                    className="flex-1 bg-background/50 border border-border px-3 py-2 font-mono text-xs focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-mono uppercase text-muted-foreground">Output Verbosity</Label>
                  <span className="text-[10px] font-mono text-primary font-bold">{verbosity}</span>
                </div>
                <div className="flex gap-1">
                  {['25%', '50%', '75%', 'MAX'].map(v => (
                    <button 
                      key={v}
                      onClick={() => setVerbosity(v)}
                      className={`flex-1 py-2 text-[10px] font-mono border transition-all ${verbosity === v ? 'bg-primary text-primary-foreground border-primary' : 'border-border bg-background/20 hover:border-primary/50'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interface" className="pt-6 space-y-6">
           <Card className="rounded-none border-border bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Visual Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               {[
                 { label: 'Brutalist Scanlines', enabled: true },
                 { label: 'Dynamic Glow Effects', enabled: true },
                 { label: 'High Density Layout', enabled: false },
                 { label: 'Matrix Character Stream', enabled: true }
               ].map((opt, i) => (
                 <div key={i} className="flex items-center justify-between p-3 border border-border/50 bg-background/10">
                   <span className="text-xs uppercase font-bold tracking-tight">{opt.label}</span>
                   <div className={`w-8 h-4 rounded-full p-1 transition-colors cursor-pointer ${opt.enabled ? 'bg-primary' : 'bg-muted'}`}>
                     <div className={`w-2 h-2 rounded-full bg-white transition-transform ${opt.enabled ? 'translate-x-4' : 'translate-x-0'}`} />
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prive" className="pt-6 space-y-6">
           <Card className="rounded-none border-border bg-card/40">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-[0.2em] flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Encryption & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex items-center gap-4 p-4 border border-emerald-500/30 bg-emerald-500/5">
                 <ShieldAlert className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                 <p className="text-[10px] font-mono text-emerald-500 uppercase leading-relaxed">
                   Privacy Protocol: ACTIVE. All generated skills are processed using secure ephemeral sessions. Local cache is encrypted using your UID.
                 </p>
               </div>
               <div className="p-4 border border-border/50 space-y-3">
                 <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-mono uppercase">Cloud Data Mirroring</Label>
                   <span className="text-[8px] font-mono bg-emerald-500 text-white px-1">ENABLED</span>
                 </div>
                 <div className="flex items-center justify-between">
                   <Label className="text-[10px] font-mono uppercase">Anonymous Telemetry</Label>
                   <span className="text-[8px] font-mono bg-muted text-muted-foreground px-1">DISABLED</span>
                 </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="p-8 border border-border bg-card/5 text-center">
          <p className="text-[10px] font-mono text-muted-foreground uppercase italic leading-loose">
            EdgeSkill Builder is a community-driven initiative for local AI interoperability.<br />
            Config ID: {Math.random().toString(36).substring(7).toUpperCase()}-NODE
          </p>
      </div>
    </div>
  );
}

const Badge = ({ children, className, variant }: { children: React.ReactNode, className?: string, variant?: 'destructive' | 'default' }) => (
  <span className={`px-2 py-0.5 text-[10px] font-mono rounded-none uppercase tracking-tighter border ${variant === 'destructive' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-muted text-foreground border-border'} ${className}`}>
    {children}
  </span>
);
