/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { 
  Library, 
  PlusSquare, 
  FolderInput, 
  Settings as SettingsIcon, 
  Cpu,
  Monitor,
  Search,
  Code2,
  Box,
  Share2,
  Sparkles,
  Workflow,
  Clock,
  LogIn,
  LogOut,
  ShieldAlert,
  User as UserIcon,
  ArrowLeft,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

import { Skill, ViewMode } from './types';
import { generateId } from './lib/id';
import { SkillCard } from './components/SkillCard';
import { SkillBuilder } from './components/SkillBuilder';
import { SkillImporter } from './components/SkillImporter';
import { SkillForge } from './components/SkillForge';
import { Settings } from './components/Settings';
import { BettingAgent } from './components/BettingAgent';
import { ScreenBrowserAgent } from './components/ScreenBrowserAgent';
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './lib/firebase';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

import { PRESET_SKILLS } from './constants/presets';

export default function App() {
  const [view, setView] = useState<ViewMode>('gallery');
  const [mySkills, setMySkills] = useState<Skill[]>([]);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [remixSkill, setRemixSkill] = useState<Skill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'scheduled' | 'chained'>('all');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) {
      setMySkills([]);
      return;
    }

    const q = query(
      collection(db, 'skills'),
      where('authorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const skills: Skill[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        skills.push({ 
          id: doc.id, 
          ...data,
          instructions: data.instructions || data.systemPrompt || '',
          difficulty: data.difficulty || data.complexity || 50
        } as Skill);
      });
      setMySkills(skills);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'skills');
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('System Logged In');
    } catch (error) {
      console.error(error);
      toast.error('Authentication Failed');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('gallery');
      toast.info('System Offline');
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateNew = () => {
    if (!user) {
      handleLogin();
      return;
    }
    const newSkill: Skill = {
      id: generateId(),
      name: 'New Automation',
      description: 'Describe what this automation will do.',
      instructions: 'You are a helpful assistant that...',
      examples: [{ id: generateId(), input: '', output: '' }],
      author: user.displayName || 'User',
      authorId: user.uid,
      authorEmail: user.email || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      version: '1.0.0',
      isPublic: false,
      difficulty: 10,
      schedule: { enabled: false, frequency: 'manual' }
    };
    setEditingSkill(newSkill);
    setView('builder');
  };

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill);
    setView('builder');
  };

  const handleRemixSkill = (skill: Skill) => {
    setRemixSkill(skill);
    setView('forge');
  };

  const handleSaveSkill = async (updatedSkill: Skill) => {
    if (!user) return;

    try {
      const { id, ...data } = updatedSkill;
      const skillRef = doc(db, 'skills', id);
      
      const payload = {
        ...data,
        updatedAt: Date.now(), // Rules check for int, request.time.toMillis() is used via rules but we send raw for local state consistency if needed
      };

      await setDoc(skillRef, payload, { merge: true });
      
      setEditingSkill(null);
      setView('gallery');
      toast.success('Skill committed to cloud');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `skills/${updatedSkill.id}`);
    }
  };

  const handleImportSkills = async (imported: Skill[]) => {
    if (!user) return;
    
    setIsLoading(true);
    let count = 0;
    try {
      for (const skill of imported) {
        const { id, ...data } = skill;
        const skillRef = doc(db, 'skills', id);
        await setDoc(skillRef, {
          ...data,
          authorId: user.uid,
          author: user.displayName || 'User',
          updatedAt: Date.now(),
          createdAt: Date.now()
        });
        count++;
      }
      setView('gallery');
      toast.success(`Ported ${count} skills to cloud repository`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'skills/bulk');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'skills', id));
      toast.info('Skill purged from system');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `skills/${id}`);
    }
  };

  const handleMaterializePresets = async () => {
    if (!user) {
      handleLogin();
      return;
    }
    
    setIsLoading(true);
    try {
      for (const preset of PRESET_SKILLS) {
        const { id, ...data } = preset;
        const skillId = generateId(); // Use new IDs so they don't conflict
        const skillRef = doc(db, 'skills', skillId);
        await setDoc(skillRef, {
          ...data,
          authorId: user.uid,
          updatedAt: Date.now(),
          createdAt: Date.now()
        });
      }
      toast.success('Gemma Edge Repository Synchronized.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'skills/presets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-primary p-1.5 md:p-2 flex items-center justify-center">
              <Cpu className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm md:text-lg font-bold tracking-tight uppercase leading-tight">Skill Lab</h1>
              <p className="text-[8px] md:text-[10px] font-mono text-muted-foreground uppercase leading-none italic">Smart helpers // v1.0.4</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" onClick={() => setView('settings')} className="h-8 font-mono text-[10px] hidden md:flex">
                <SettingsIcon className="w-3.5 h-3.5 mr-2" />
                SETTINGS
             </Button>

             {!user ? (
               <Button size="sm" onClick={handleLogin} className="h-8 font-mono text-[10px]">
                 <LogIn className="w-3.5 h-3.5 mr-2" />
                 CONNECT
               </Button>
             ) : (
               <DropdownMenu>
                 <DropdownMenuTrigger 
                   className={cn(
                     buttonVariants({ variant: "ghost", size: "sm" }), 
                     "gap-2 px-1 hover:bg-accent/50 h-8 w-auto flex items-center border-none"
                   )}
                 >
                   <div className="w-6 h-6 bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground flex-shrink-0">
                     {user.displayName?.charAt(0) || 'U'}
                   </div>
                   <span className="text-[9px] font-mono font-bold uppercase hidden sm:inline truncate max-w-[80px]">
                     {user.displayName?.split(' ')[0]}
                   </span>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-48 rounded-none border-border font-mono">
                   <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Session: {user.email}</DropdownMenuLabel>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={() => setView('settings')} className="text-[10px] uppercase p-3">
                     <SettingsIcon className="w-4 h-4 mr-2" /> Configuration
                   </DropdownMenuItem>
                   <DropdownMenuSeparator />
                   <DropdownMenuItem onClick={handleLogout} className="text-[10px] uppercase p-3 text-destructive">
                     <LogOut className="w-4 h-4 mr-2" /> Disconnect
                   </DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 pb-32">
        <AnimatePresence mode="wait">
          {view === 'gallery' && (
            <motion.div 
              key="gallery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 md:space-y-8"
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase italic">Skill Directory</h2>
                  <p className="text-[10px] md:text-sm text-muted-foreground font-mono">
                    Managing {mySkills.length + PRESET_SKILLS.length} active capabilities
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {user && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleMaterializePresets}
                      className="font-mono text-[9px] md:text-[10px] uppercase border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 h-8 md:h-9"
                    >
                      <Workflow className="w-3 h-3 mr-1.5 md:mr-2" />
                      FETCH_SAMPLES
                    </Button>
                  )}
                  <div className="relative group flex-1 min-w-[150px] md:min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-8 bg-card/50 font-mono text-[10px] md:text-xs h-8 md:h-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button onClick={() => setView('forge')} className="flex-1 sm:flex-none font-mono text-[10px] md:text-xs bg-primary/90 hover:bg-primary h-8 md:h-9">
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 md:mr-2" />
                      MAKE
                    </Button>
                    <Button variant="outline" onClick={handleCreateNew} className="flex-1 sm:flex-none font-mono text-[10px] md:text-xs h-8 md:h-9">
                      <PlusSquare className="w-3.5 h-3.5 mr-1.5 md:mr-2" />
                      NEW
                    </Button>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="flex items-center gap-2 border-y border-border/30 py-2 overflow-x-auto scrollbar-hide no-scrollbar">
                 <Button 
                   variant={filterType === 'all' ? 'secondary' : 'ghost'} 
                   size="sm" 
                   onClick={() => setFilterType('all')}
                   className="font-mono text-[9px] uppercase h-7 rounded-none"
                 >
                   ALL_SKILLS
                 </Button>
                 <Button 
                   variant={filterType === 'scheduled' ? 'secondary' : 'ghost'} 
                   size="sm" 
                   onClick={() => setFilterType('scheduled')}
                   className="font-mono text-[9px] uppercase h-7 rounded-none"
                 >
                   <Clock className="w-3 h-3 mr-1.5" />
                   TIMERS
                 </Button>
                 <Button 
                   variant={filterType === 'chained' ? 'secondary' : 'ghost'} 
                   size="sm" 
                   onClick={() => setFilterType('chained')}
                   className="font-mono text-[9px] uppercase h-7 rounded-none"
                 >
                   <Workflow className="w-3 h-3 mr-1.5" />
                   TEAMWORK
                 </Button>
              </div>

              {!user && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <p className="text-xs font-mono uppercase text-amber-500 tracking-tight">Warning: Running in Local_Buffer mode. Skills will not be saved to cloud.</p>
                  </div>
                  <Button size="sm" onClick={handleLogin} className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold font-mono text-[10px]">AUTH_REQUIRED</Button>
                </div>
              )}

              {user && mySkills.length < 5 && (
                <div className="bg-primary/10 border border-primary/30 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-primary" />
                    <p className="text-xs font-mono uppercase text-primary tracking-tight">System Notice: Repository detected below threshold. Materialize Google Edge presets?</p>
                  </div>
                  <Button size="sm" onClick={handleMaterializePresets} className="bg-primary hover:bg-primary/80 text-primary-foreground font-bold font-mono text-[10px]">EXECUTE_SYNC</Button>
                </div>
              )}

              {(user && mySkills.length === 0) ? (
                <div className="border border-border bg-card/20 py-24 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
                   {/* Scanline decoration */}
                   <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_bottom,transparent_50%,#000_50%)] bg-[length:100%_4px]" />
                   
                  <div className="p-6 rounded-full bg-primary/5 border border-primary/20 animate-pulse">
                    <Monitor className="w-16 h-16 text-primary/40" />
                  </div>
                  <div className="space-y-2 max-w-sm px-4">
                    <h3 className="text-xl font-bold tracking-tighter uppercase italic">Neural_Repository_Empty</h3>
                    <p className="text-xs text-muted-foreground font-mono uppercase leading-relaxed">
                      No custom skills detected in your local cloud index. Ingest preset behaviors or forge a new automation.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs px-4">
                    <Button onClick={() => setView('forge')} className="flex-1 font-mono text-[10px] uppercase h-10">
                      <Sparkles className="w-4 h-4 mr-2" />
                      FORGE_SKILL
                    </Button>
                    <Button variant="outline" onClick={handleMaterializePresets} className="flex-1 font-mono text-[10px] uppercase h-10">
                      <Workflow className="w-4 h-4 mr-2" />
                      SYNC_PRESETS
                     </Button>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...mySkills, ...PRESET_SKILLS.filter(ps => !mySkills.some(ms => ms.name === ps.name))]
                  .filter(s => {
                    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase());
                    const matchesFilter = filterType === 'all' 
                      || (filterType === 'scheduled' && s.schedule?.enabled)
                      || (filterType === 'chained' && !!s.workflow?.nextSkillId);
                    return matchesSearch && matchesFilter;
                  })
                  .map(skill => (
                  <SkillCard 
                    key={skill.id} 
                    skill={skill} 
                    onEdit={() => handleEditSkill(skill)}
                    onRemix={() => handleRemixSkill(skill)}
                    onDelete={(id) => handleDeleteSkill(id)}
                  />
                ))}
              </div>
              )}
            </motion.div>
          )}

          {view === 'builder' && editingSkill && (
            <motion.div 
              key="builder"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SkillBuilder 
                skill={editingSkill} 
                onSave={handleSaveSkill} 
                onCancel={() => {
                  setEditingSkill(null);
                  setView('gallery');
                }} 
              />
            </motion.div>
          )}

          {view === 'forge' && (
            <motion.div 
              key="forge"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <SkillForge 
                initialData={remixSkill}
                onFinalize={(skill) => {
                  setEditingSkill(skill);
                  setRemixSkill(null);
                  setView('builder');
                  toast.success("Skill materialized. Reviewing details.");
                }} 
                onCancel={() => {
                  setRemixSkill(null);
                  setView('gallery');
                }} 
              />
            </motion.div>
          )}

          {view === 'import' && (
            <motion.div 
              key="import"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <SkillImporter onImport={handleImportSkills} onCancel={() => setView('gallery')} />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Settings onBack={() => setView('gallery')} />
            </motion.div>
          )}

          {view === 'agent' && (
            <motion.div
              key="agent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setView('gallery')} className="rounded-none">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase italic">Agent Control</h2>
              </div>
              <ScreenBrowserAgent />
              <BettingAgent />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation (Sticky Bottom for Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/80 backdrop-blur-xl z-50 sm:hidden">
        <div className="flex items-center justify-around h-16 px-4">
          <button 
            onClick={() => setView('gallery')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === 'gallery' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Library className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">SKILLS</span>
          </button>
          <button 
            onClick={() => setView('forge')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === 'forge' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">MAKE</span>
          </button>
          <button 
            onClick={handleCreateNew}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === 'builder' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <PlusSquare className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">BUILD</span>
          </button>
          <button 
            onClick={() => setView('import')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === 'import' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <FolderInput className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">ADD</span>
          </button>
          <button 
            onClick={() => setView('agent')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === 'agent' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Bot className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">AGENT</span>
          </button>
          <button 
            onClick={() => setView('settings')}
            className={`flex flex-col items-center gap-1 p-2 transition-colors ${view === 'settings' ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">SETTINGS</span>
          </button>
        </div>
      </nav>
      
      {/* Desktop Helper Sidebar (Optional or Floating) */}
      <div className="hidden sm:block fixed left-4 bottom-4">
        <p className="text-[10px] font-mono text-muted-foreground vertical-rl transform rotate-180 opacity-50 uppercase tracking-[0.3em]">
          {user ? `Protocol: ${user.uid.slice(0, 8)}` : 'Protocol: ANONYMOUS'}
        </p>
      </div>

      {isLoading && (
         <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[100] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_bottom,transparent_50%,#000_50%)] bg-[length:100%_4px]" />
            <div className="flex flex-col items-center gap-6 relative">
               <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                  <Cpu className="w-16 h-16 text-primary relative animate-pulse" />
               </div>
               <div className="space-y-2 text-center">
                  <p className="text-sm font-mono font-bold uppercase tracking-[0.5em] animate-pulse">Initializing_Nodal_Network</p>
                  <div className="flex gap-1 justify-center">
                     {[1, 2, 3, 4, 5].map(i => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0.2 }}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                          className="w-1.5 h-1.5 bg-primary"
                        />
                     ))}
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-50">Syncing with Google Edge Cloud...</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
