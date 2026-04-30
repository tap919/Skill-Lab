// @ts-nocheck
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center border border-destructive/30 bg-destructive/5 p-8 rounded-none">
            <div className="flex justify-center">
              <div className="p-4 bg-destructive/10 rounded-full">
                <ShieldAlert className="w-12 h-12 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tighter uppercase italic">System Breach</h1>
              <p className="text-sm text-muted-foreground font-mono uppercase">
                The application encountered a critical runtime exception.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-black/20 p-4 rounded-none text-left overflow-auto max-h-32">
                <pre className="text-[10px] font-mono text-destructive uppercase">
                  {this.state.error.message}
                </pre>
              </div>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="w-full font-mono text-xs uppercase"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reboot System
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
