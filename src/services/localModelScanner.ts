export interface LocalModelCapabilities {
  webgpu: boolean;
  webnn: boolean;
  wasm: boolean;
  geminiNano: boolean;
  availableModels: { name: string; backend: string }[];
  hardwareInfo: string;
}

export async function scanLocalModels(): Promise<LocalModelCapabilities> {
  const results: LocalModelCapabilities = {
    webgpu: false,
    webnn: false,
    wasm: false,
    geminiNano: false,
    availableModels: [],
    hardwareInfo: 'Unknown',
  };

  const gpu = await detectWebGPU();
  results.webgpu = gpu.supported;
  if (gpu.adapterInfo) results.hardwareInfo = gpu.adapterInfo;

  results.webnn = await detectWebNN();

  results.wasm = typeof WebAssembly !== 'undefined' && typeof (WebAssembly as any).validate === 'function';

  results.geminiNano = await detectGeminiNano();

  if (results.webgpu) {
    results.availableModels.push({ name: 'WebGPU Compute', backend: 'GPU' });
  }
  if (results.webnn) {
    results.availableModels.push({ name: 'WebNN Inference', backend: 'NPU' });
  }
  if (results.geminiNano) {
    results.availableModels.push({ name: 'Gemini Nano', backend: 'On-Device' });
  }

  return results;
}

async function detectWebGPU(): Promise<{ supported: boolean; adapterInfo: string }> {
  const nav = navigator as any;
  if (!nav.gpu) return { supported: false, adapterInfo: 'No WebGPU' };
  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) return { supported: false, adapterInfo: 'No adapter' };
    const info = adapter.info || {};
    const name = info.description || info.device || 'Unknown GPU';
    return { supported: true, adapterInfo: `${name}` };
  } catch {
    return { supported: false, adapterInfo: 'WebGPU error' };
  }
}

async function detectWebNN(): Promise<boolean> {
  return 'ml' in navigator && !!navigator.ml;
}

async function detectGeminiNano(): Promise<boolean> {
  try {
    if (typeof (self as any).ai === 'undefined') return false;
    const canMap = await (self as any).ai?.languageModel?.capabilities?.();
    return canMap?.available === 'readily';
  } catch {
    return false;
  }
}