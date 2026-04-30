import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { ThemeProvider } from 'next-themes';
import App from './App.tsx';
import './index.css';

const rootEl = document.getElementById('root');
if (rootEl) rootEl.innerHTML = '';

try {
  createRoot(rootEl!).render(
    <StrictMode>
      {/* @ts-ignore */}
      <ThemeProvider attribute="class" defaultTheme="dark">
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
} catch (e: any) {
  if (rootEl) {
    rootEl.innerHTML = `<div style="color:red;padding:20px;font-family:monospace;background:#111"><h2>Error</h2><pre>${e.message || e}</pre></div>`;
  }
}
