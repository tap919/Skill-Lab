export interface PhoneState {
  battery: BatteryInfo | null;
  network: NetworkInfo;
  screen: ScreenInfo;
  device: DeviceInfo;
  userActivity: UserActivityInfo;
  location: GeoLocation | null;
  permissions: PermissionStatus;
  timestamp: number;
}

export interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export interface NetworkInfo {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface ScreenInfo {
  width: number;
  height: number;
  availWidth: number;
  availHeight: number;
  colorDepth: number;
  pixelRatio: number;
  orientation: 'landscape' | 'portrait';
}

export interface DeviceInfo {
  memory: number | null;
  cores: number;
  platform: string;
  userAgent: string;
  mobile: boolean;
}

export interface UserActivityInfo {
  idleTime: number;
  isIdle: boolean;
  online: boolean;
  visibility: 'visible' | 'hidden' | 'prerender' | 'unloaded';
}

export interface GeoLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface PermissionStatus {
  geolocation: 'granted' | 'denied' | 'prompt';
  notifications: 'granted' | 'denied' | 'prompt' | 'default';
}

let idleTime = 0;
let idleInterval: ReturnType<typeof setInterval> | null = null;

export async function scanPhoneState(): Promise<PhoneState> {
  const [battery, network, screen, device, userActivity, location, permissions] = await Promise.all([
    getBatteryInfo(),
    getNetworkInfo(),
    getScreenInfo(),
    getDeviceInfo(),
    getUserActivityInfo(),
    getLocation(),
    getPermissions(),
  ]);

  return {
    battery,
    network,
    screen,
    device,
    userActivity,
    location,
    permissions,
    timestamp: Date.now(),
  };
}

async function getBatteryInfo(): Promise<BatteryInfo | null> {
  try {
    if (!navigator.getBattery) return null;
    const battery = await navigator.getBattery();
    return {
      level: Math.round(battery.level * 100),
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  } catch {
    return null;
  }
}

function getNetworkInfo(): NetworkInfo {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  return {
    type: conn?.type || 'unknown',
    effectiveType: conn?.effectiveType || 'unknown',
    downlink: conn?.downlink || 0,
    rtt: conn?.rtt || 0,
    saveData: conn?.saveData || false,
  };
}

function getScreenInfo(): ScreenInfo {
  const s = window.screen;
  const w = window;
  const orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  return {
    width: w.innerWidth,
    height: w.innerHeight,
    availWidth: s.width,
    availHeight: s.height,
    colorDepth: s.colorDepth,
    pixelRatio: w.devicePixelRatio,
    orientation,
  };
}

function getDeviceInfo(): DeviceInfo {
  return {
    memory: (navigator as any).deviceMemory || null,
    cores: navigator.hardwareConcurrency || 0,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    mobile: /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
  };
}

function getUserActivityInfo(): UserActivityInfo {
  return {
    idleTime,
    isIdle: idleTime > 60,
    online: navigator.onLine,
    visibility: document.visibilityState,
  };
}

async function getLocation(): Promise<GeoLocation | null> {
  if (!navigator.geolocation) return null;
  try {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          coords: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            altitude: pos.coords.altitude,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          },
          timestamp: pos.timestamp,
        }),
        () => resolve(null),
        { timeout: 3000, maximumAge: 60000 }
      );
    });
  } catch {
    return null;
  }
}

async function getPermissions(): Promise<PermissionStatus> {
  try {
    const result: PermissionStatus = {
      geolocation: 'prompt',
      notifications: 'default',
    };
    if (navigator.permissions) {
      try {
        const geo = await navigator.permissions.query({ name: 'geolocation' });
        result.geolocation = geo.state;
      } catch {}
      try {
        const notif = await navigator.permissions.query({ name: 'notifications' });
        result.notifications = notif.state;
      } catch {}
    }
    return result;
  } catch {
    return { geolocation: 'prompt', notifications: 'default' };
  }
}

export function startIdleTracking(): void {
  if (idleInterval) return;
  const resetIdle = () => { idleTime = 0; };
  ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    document.addEventListener(evt, resetIdle, { passive: true });
  });
  idleInterval = setInterval(() => { idleTime++; }, 1000);
}

export function stopIdleTracking(): void {
  if (idleInterval) {
    clearInterval(idleInterval);
    idleInterval = null;
  }
}

export function estimateUserContext(state: PhoneState): UserContext {
  const ctx: UserContext = {
    activity: 'active',
    battery: 'normal',
    attention: 'full',
    dataSaver: false,
    locationAware: false,
  };

  if (state.battery) {
    if (state.battery.level < 20 && !state.battery.charging) ctx.battery = 'low';
    else if (state.battery.level < 50) ctx.battery = 'medium';
    else if (state.battery.charging) ctx.battery = 'charging';
  }

  if (state.userActivity.isIdle) {
    ctx.activity = 'idle';
    ctx.attention = 'minimal';
  } else if (state.userActivity.idleTime > 30) {
    ctx.activity = 'resuming';
    ctx.attention = 'partial';
  }

  if (state.network.saveData) ctx.dataSaver = true;
  if (state.network.effectiveType === 'slow') ctx.activity = 'impatient';

  if (state.permissions.geolocation === 'granted' && state.location) {
    ctx.locationAware = true;
  }

  return ctx;
}

export interface UserContext {
  activity: 'active' | 'idle' | 'impatient' | 'resuming';
  battery: 'low' | 'medium' | 'normal' | 'charging';
  attention: 'full' | 'partial' | 'minimal';
  dataSaver: boolean;
  locationAware: boolean;
}

export interface GapSuggestion {
  id: string;
  title: string;
  description: string;
  trigger: {
    context: UserContext;
    confidence: number;
  };
  skillTemplate?: Partial<SkillReference>;
}

export interface SkillReference {
  id: string;
  name: string;
  description: string;
}

export function detectGaps(state: PhoneState, existingSkills: SkillReference[] = []): GapSuggestion[] {
  const ctx = estimateUserContext(state);
  const suggestions: GapSuggestion[] = [];

  if (ctx.dataSaver && existingSkills.every(s => !s.name.includes('offline'))) {
    suggestions.push({
      id: 'offline-mode',
      title: 'Offline Mode Skill',
      description: 'Create a skill that works without network for low-bandwidth situations',
      trigger: { context: { ...ctx, activity: 'impatient' }, confidence: 0.8 },
    });
  }

  if (ctx.battery === 'low' && existingSkills.every(s => !s.name.includes('battery'))) {
    suggestions.push({
      id: 'battery-saver',
      title: 'Battery Saver Skill',
      description: 'Create skill optimized for minimal battery usage',
      trigger: { context: { ...ctx, battery: 'low' }, confidence: 0.9 },
    });
  }

  if (ctx.activity === 'idle' && existingSkills.every(s => !s.name.includes('quick'))) {
    suggestions.push({
      id: 'quick-action',
      title: 'Quick Action Skill',
      description: 'Create skill for when user returns - single tap actions',
      trigger: { context: { ...ctx, activity: 'resuming' }, confidence: 0.7 },
    });
  }

  if (ctx.locationAware && existingSkills.every(s => !s.name.includes('location'))) {
    suggestions.push({
      id: 'location-trigger',
      title: 'Location-Aware Skill',
      description: 'Create skill that triggers based on geolocation',
      trigger: { context: { ...ctx, locationAware: true }, confidence: 0.85 },
    });
  }

  return suggestions;
}