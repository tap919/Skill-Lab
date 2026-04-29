/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Edit2, Trash2, Code2, Download, Share2, Tag, Sparkles, Clock, Workflow } from 'lucide-react';
import { Skill } from '../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TagBadge = ({ children, variant = "outline", className = "", ...props }: { children: React.ReactNode; variant?: "outline" | "default" | "secondary" | "destructive"; className?: string; [key: string]: any }) => (
  <Badge variant={variant} className={`rounded-none font-mono text-[10px] uppercase tracking-tighter ${variant === "outline" ? "bg-muted/50" : ""} ${className}`} {...props}>
    {children}
  </Badge>
);

export function SkillCard({ 
  skill, 
  onEdit, 
  onRemix,
  onDelete,
  ...props
}: { 
  skill: Skill; 
  onEdit: () => void; 
  onRemix?: () => void;
  onDelete: (id: string) => void | Promise<void>; 
  [key: string]: any;
}) {
  const exportToJson = () => {
    const data = JSON.stringify(skill, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${skill.name.toLowerCase().replace(/\s+/g, '_')}_skill.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="rounded-none border-border bg-card/40 hover:bg-card transition-all group overflow-hidden relative">
      {/* Decorative Hardware Accent */}
      <div className="absolute top-0 right-0 w-8 h-8 opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-[1px] h-full bg-foreground" />
        <div className="absolute top-0 right-0 h-[1px] w-full bg-foreground" />
      </div>

      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tighter uppercase">{skill.name}</h3>
            <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest italic">
              <Code2 className="w-3 h-3" />
              v{skill.version} // {new Date(skill.createdAt).toLocaleDateString()}
              {skill.isVerified && (
                <span className="text-emerald-500 font-bold ml-2">Verified_OK</span>
              )}
              {skill.securityScore !== undefined && (
                <span className={`ml-2 ${skill.securityScore > 80 ? 'text-emerald-500' : 'text-amber-500'} font-bold`}>
                  S:{skill.securityScore}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(skill.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2 md:line-clamp-3">
          {skill.description}
        </p>

        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {skill.schedule?.enabled && (
            <TagBadge variant="secondary" className="border-primary/30 text-primary">
              <Clock className="w-2.5 h-2.5 mr-1" />
              {skill.schedule.frequency}
            </TagBadge>
          )}
          {skill.workflow?.nextSkillId && (
            <TagBadge variant="secondary" className="border-indigo-500/30 text-indigo-400">
              <Workflow className="w-2.5 h-2.5 mr-1" />
              THEN: {skill.workflow.nextSkillId}
            </TagBadge>
          )}
          {skill.tags.map(tag => (
            <TagBadge key={tag}>{tag}</TagBadge>
          ))}
          {skill.tags.length === 0 && !skill.schedule?.enabled && !skill.workflow?.nextSkillId && <TagBadge>ANYTHING</TagBadge>}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center gap-2">
        <div className="flex -space-x-2">
           <div className="w-6 h-6 rounded-none bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground border border-background">
             {(skill.author || 'A').charAt(0)}
           </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 font-mono text-[10px] uppercase" onClick={exportToJson}>
            <Download className="w-3 h-3 mr-1.5" />
            SHARE
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 font-mono text-[10px] uppercase"
            onClick={onRemix}
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            BORROW
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
