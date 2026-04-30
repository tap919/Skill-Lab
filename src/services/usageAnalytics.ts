declare global {
  interface Navigator {
    getBattery(): Promise<BatteryManager>;
  }
  interface BatteryManager {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
  }
}

let analyticsDb: IDBDatabase | null = null;

async function openAnalyticsDB(): Promise<IDBDatabase> {
  if (analyticsDb) return analyticsDb;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('skillUsageAnalytics', 1);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      analyticsDb = req.result;
      resolve(analyticsDb);
    };
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('events')) {
        db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('feedback')) {
        db.createObjectStore('feedback', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export interface SkillEvent {
  skillId: string;
  skillName: string;
  type: 'invoke' | 'success' | 'failure' | 'refine';
  context: {
    battery?: number;
    network?: string;
    location?: boolean;
  };
  timestamp: number;
  duration?: number;
  error?: string;
}

export interface SkillFeedback {
  id?: number;
  skillId: string;
  skillName: string;
  rating: 1 | 2 | 3 | 4 | 5;
  type: 'successrate' | 'relevance' | 'usability' | 'speed' | 'accuracy';
  comment?: string;
  context: {
    inputText: string;
    output?: string;
    expected?: string;
  };
  timestamp: number;
}

export async function trackSkillEvent(event: Omit<SkillEvent, 'id'>): Promise<void> {
  try {
    const db = await openAnalyticsDB();
    const tx = db.transaction('events', 'readwrite');
    const store = tx.objectStore('events');
    store.add({ ...event, id: undefined });
  } catch (e) {
    console.warn('Analytics track failed:', e);
  }
}

export async function collectFeedback(feedback: Omit<SkillFeedback, 'id'>): Promise<void> {
  try {
    const db = await openAnalyticsDB();
    const tx = db.transaction('feedback', 'readwrite');
    const store = tx.objectStore('feedback');
    store.add({ ...feedback, id: undefined });
  } catch (e) {
    console.warn('Feedback collect failed:', e);
  }
}

export async function getSkillAnalytics(skillId: string): Promise<SkillAnalyticsSummary> {
  const db = await openAnalyticsDB();
  
  return new Promise((resolve) => {
    const tx = db.transaction(['events', 'feedback'], 'readonly');
    const eventStore = tx.objectStore('events');
    const feedbackStore = tx.objectStore('feedback');
    
    const eventReq = eventStore.index('skillId').getAll(IDBKeyRange.only(skillId));
    const feedbackReq = feedbackStore.index('skillId').getAll(IDBKeyRange.only(skillId));
    
    tx.oncomplete = () => {
      const events = eventReq.result as SkillEvent[];
      const feedbacks = feedbackReq.result as SkillFeedback[];
      
      const invokes = events.filter(e => e.type === 'invoke').length;
      const successes = events.filter(e => e.type === 'success').length;
      const failures = events.filter(e => e.type === 'failure').length;
      const avgDuration = events.filter(e => e.duration).reduce((sum, e) => sum + (e.duration || 0), 0) / Math.max(invokes, 1);
      
      const ratings = feedbacks.filter(f => f.type === 'successrate').map(f => f.rating);
      const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      
      resolve({
        totalInvokes: invokes,
        successRate: invokes ? successes / invokes : 0,
        failureRate: invokes ? failures / invokes : 0,
        avgDuration,
        avgUserRating: avgRating,
        feedbackCount: feedbacks.length,
      });
    };
  });
}

export interface SkillAnalyticsSummary {
  totalInvokes: number;
  successRate: number;
  failureRate: number;
  avgDuration: number;
  avgUserRating: number;
  feedbackCount: number;
}

export async function getTopSkills(limit = 10): Promise<{ skillId: string; skillName: string; invokes: number }[]> {
  const db = await openAnalyticsDB();
  return new Promise((resolve) => {
    const tx = db.transaction('events', 'readonly');
    const store = tx.objectStore('events');
    const req = store.getAll();
    tx.oncomplete = () => {
      const events = req.result as SkillEvent[];
      const bySkill = new Map<string, { skillName: string; invokes: number }>();
      events.forEach(e => {
        const curr = bySkill.get(e.skillId) || { skillName: e.skillName, invokes: 0 };
        if (e.type === 'invoke') curr.invokes++;
        bySkill.set(e.skillId, curr);
      });
      const sorted = [...bySkill.entries()]
        .map(([skillId, { skillName, invokes }]) => ({ skillId, skillName, invokes }))
        .sort((a, b) => b.invokes - a.invokes)
        .slice(0, limit);
      resolve(sorted);
    };
  });
}