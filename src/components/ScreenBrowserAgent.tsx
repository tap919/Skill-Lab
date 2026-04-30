import React, { useState, useRef, useEffect } from 'react';
import { Globe, Camera, Play, Square, RefreshCw, Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ScreenBrowserAgent() {
  const [url, setUrl] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-99), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const navigate = () => {
    if (!url.trim()) return;
    addLog(`Navigating to: ${url}`);
    if (iframeRef.current) {
      iframeRef.current.src = url.startsWith('http') ? url : `https://${url}`;
    }
  };

  const startAgent = async () => {
    setIsRunning(true);
    addLog('Agent started - monitoring page...');
    toast.info('Browser agent is running');
  };

  const stopAgent = () => {
    setIsRunning(false);
    addLog('Agent stopped');
  };

  const captureScreen = () => {
    addLog('Screen capture requested (requires Android screen capture permission)');
    toast.info('Screen capture triggered');
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-mono font-bold uppercase">Screen Browser Agent</h3>
        </div>
        <div className="flex gap-2">
          {!isRunning ? (
            <Button size="sm" onClick={startAgent} className="h-8 font-mono text-[10px] uppercase rounded-none">
              <Play className="w-3 h-3 mr-1" /> Start
            </Button>
          ) : (
            <Button size="sm" variant="destructive" onClick={stopAgent} className="h-8 font-mono text-[10px] uppercase rounded-none">
              <Square className="w-3 h-3 mr-1" /> Stop
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={captureScreen} className="h-8 font-mono text-[10px] uppercase rounded-none">
            <Camera className="w-3 h-3 mr-1" /> Screenshot
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigate()}
          placeholder="Enter URL to browse..."
          className="flex-1 h-9 font-mono text-[10px] rounded-none bg-background/50 border-border"
        />
        <Button size="sm" onClick={navigate} className="h-9 font-mono text-[10px] uppercase rounded-none">
          <Globe className="w-3 h-3 mr-1" /> Go
        </Button>
      </div>

      <Card className="rounded-none border-border bg-card/30 overflow-hidden">
        <div className="bg-card/60 border-b border-border px-3 py-2 flex items-center justify-between">
          <span className="text-[8px] font-mono text-muted-foreground uppercase">Browser Viewport</span>
          <RefreshCw className="w-3 h-3 text-muted-foreground cursor-pointer hover:text-primary" onClick={navigate} />
        </div>
        <div className="bg-white w-full" style={{ height: '400px' }}>
          <iframe
            ref={iframeRef}
            className="w-full h-full"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            title="Browser Agent"
          />
        </div>
      </Card>

      <Card className="rounded-none border-border bg-card/30">
        <div
          className="bg-card/60 border-b border-border px-3 py-2 flex items-center justify-between cursor-pointer"
          onClick={() => setShowLogs(!showLogs)}
        >
          <span className="text-[8px] font-mono text-muted-foreground uppercase">Agent Logs ({logs.length})</span>
          {showLogs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
        {showLogs && (
          <div ref={logRef} className="h-32 overflow-y-auto p-3 space-y-1 font-mono" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {logs.length === 0 && (
              <p className="text-[10px] text-muted-foreground">No logs yet. Start the agent or navigate to a URL.</p>
            )}
            {logs.map((log, i) => (
              <p key={i} className="text-[9px] leading-relaxed">{log}</p>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}