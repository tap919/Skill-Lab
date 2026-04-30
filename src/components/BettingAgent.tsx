import React, { useState } from 'react';
import { DollarSign, Target, TrendingUp, RefreshCw, Play, Square, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface BetTarget {
  id: string;
  sport: string;
  league: string;
  team: string;
  market: string;
  minOdds: number;
  maxStake: number;
  strategy: string;
  enabled: boolean;
}

export function BettingAgent() {
  const [isRunning, setIsRunning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [targets, setTargets] = useState<BetTarget[]>([
    { id: '1', sport: 'Football', league: 'NFL', team: 'Any', market: 'Moneyline', minOdds: 1.5, maxStake: 50, strategy: 'Value', enabled: true },
  ]);
  const [newTarget, setNewTarget] = useState<Partial<BetTarget>>({ sport: '', league: '', team: '', market: '', minOdds: 2, maxStake: 25, strategy: 'Value' });
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const toggleAgent = () => {
    if (isRunning) {
      setIsRunning(false);
      addLog('Betting agent stopped');
      toast.info('Agent deactivated');
    } else {
      setIsRunning(true);
      addLog('Betting agent started - scanning markets...');
      toast.success('Agent activated');
    }
  };

  const addTarget = () => {
    if (!newTarget.sport || !newTarget.market) {
      toast.error('Sport and market required');
      return;
    }
    const target: BetTarget = {
      id: Date.now().toString(),
      sport: newTarget.sport,
      league: newTarget.league || 'Any',
      team: newTarget.team || 'Any',
      market: newTarget.market,
      minOdds: newTarget.minOdds || 2,
      maxStake: newTarget.maxStake || 25,
      strategy: newTarget.strategy || 'Value',
      enabled: true,
    };
    setTargets(prev => [...prev, target]);
    setNewTarget({ sport: '', league: '', team: '', market: '', minOdds: 2, maxStake: 25, strategy: 'Value' });
    addLog(`Target added: ${target.sport} - ${target.market}`);
  };

  const removeTarget = (id: string) => {
    setTargets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-mono font-bold uppercase">Betting Agent</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-mono uppercase text-muted-foreground">Bankroll</span>
            <span className="text-sm font-mono font-bold text-emerald-500">${balance.toFixed(2)}</span>
          </div>
          <Button
            size="sm"
            onClick={toggleAgent}
            className={`h-8 font-mono text-[10px] uppercase rounded-none ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {isRunning ? <Square className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {isRunning ? 'Stop' : 'Start Agent'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="rounded-none border-border bg-card/40">
          <CardHeader className="p-3">
            <CardTitle className="text-[10px] font-mono uppercase flex items-center gap-2">
              <Target className="w-3 h-3 text-primary" />
              Bet Targets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            {targets.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 border border-border/50 bg-background/10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-mono font-bold">{t.sport} {t.league && `/ ${t.league}`}</p>
                  <p className="text-[8px] font-mono text-muted-foreground">{t.market} • Min Odds: {t.minOdds} • Max: ${t.maxStake}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] font-mono rounded-none">{t.strategy}</Badge>
                  <button onClick={() => removeTarget(t.id)} className="text-muted-foreground hover:text-red-500 text-[10px]">✕</button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 mt-3 p-2 border border-dashed border-border">
              <Input value={newTarget.sport} onChange={e => setNewTarget(prev => ({ ...prev, sport: e.target.value }))} placeholder="Sport" className="h-7 text-[9px] font-mono rounded-none bg-background/50 border-border" />
              <Input value={newTarget.league} onChange={e => setNewTarget(prev => ({ ...prev, league: e.target.value }))} placeholder="League" className="h-7 text-[9px] font-mono rounded-none bg-background/50 border-border" />
              <Input value={newTarget.market} onChange={e => setNewTarget(prev => ({ ...prev, market: e.target.value }))} placeholder="Market" className="h-7 text-[9px] font-mono rounded-none bg-background/50 border-border" />
              <Input value={newTarget.minOdds} onChange={e => setNewTarget(prev => ({ ...prev, minOdds: Number(e.target.value) }))} placeholder="Min Odds" type="number" className="h-7 text-[9px] font-mono rounded-none bg-background/50 border-border" />
              <Button size="sm" variant="outline" onClick={addTarget} className="col-span-2 h-7 font-mono text-[9px] uppercase rounded-none">
                + Add Target
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-border bg-card/40">
          <CardHeader className="p-3">
            <CardTitle className="text-[10px] font-mono uppercase flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-amber-500" />
              Agent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-48 overflow-y-auto space-y-1 font-mono">
              {logs.length === 0 && (
                <p className="text-[10px] text-muted-foreground">Start the agent to see activity</p>
              )}
              {logs.map((log, i) => (
                <p key={i} className="text-[8px] leading-relaxed">{log}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-border bg-amber-500/5 border-amber-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-mono font-bold uppercase text-amber-500">Risk Disclaimer</p>
              <p className="text-[8px] font-mono text-muted-foreground mt-1">
                Betting involves financial risk. This agent is for educational and experimental purposes only.
                Always gamble responsibly. Never bet more than you can afford to lose.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}