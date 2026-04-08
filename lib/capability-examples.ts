export type CapabilityCategory =
  | 'fun'
  | 'personal'
  | 'business'
  | 'data'
  | 'website'
  | 'automation'
  | 'agent';

export interface CapabilityExample {
  id: string;
  prompt: string;
  outcome: string;
  category: CapabilityCategory;
  tone: 'silly' | 'personal' | 'business' | 'enterprise';
}

export const CAPABILITY_EXAMPLES: CapabilityExample[] = [
  // Silly / personal (permission slips)
  {
    id: 'chewbacca-game',
    prompt: 'Build a game where Chewbacca runs around and collects things',
    outcome: 'Playable browser game with sprite animation and scoring',
    category: 'fun',
    tone: 'silly',
  },
  {
    id: 'bedtime-stories',
    prompt: "Make a bedtime story generator for my kid that remembers her favorite characters",
    outcome: 'Personalized story app with character memory and age-appropriate content',
    category: 'fun',
    tone: 'silly',
  },
  {
    id: 'daily-compliment',
    prompt: 'Generate a compliment for me every morning based on my calendar',
    outcome: 'Daily motivation app that reads your schedule and cheers you on',
    category: 'fun',
    tone: 'silly',
  },

  // Personal productivity
  {
    id: 'strava-tracker',
    prompt: 'Track my Strava data and tell me when I\'m slowing down',
    outcome: 'Fitness dashboard with trend analysis and performance alerts',
    category: 'personal',
    tone: 'personal',
  },
  {
    id: 'habit-tracker',
    prompt: 'Build a habit tracker that texts me reminders via Twilio',
    outcome: 'Habit app with SMS notifications and streak tracking',
    category: 'personal',
    tone: 'personal',
  },
  {
    id: 'expense-reports',
    prompt: 'Turn my Google Drive receipts into monthly expense reports',
    outcome: 'Automated expense processor that reads receipts and generates reports',
    category: 'personal',
    tone: 'personal',
  },
  {
    id: 'sleep-monitor',
    prompt: "Monitor my sleep data and flag weeks when I'm sleep-deprived",
    outcome: 'Sleep analytics dashboard with weekly health alerts',
    category: 'personal',
    tone: 'personal',
  },

  // Small business / creator
  {
    id: 'support-chatbot',
    prompt: 'Create a friendly customer support chatbot for my Shopify store',
    outcome: 'AI chatbot trained on your products that handles customer questions',
    category: 'agent',
    tone: 'business',
  },
  {
    id: 'pr-dashboard',
    prompt: "Build a dashboard that tracks my team's GitHub PRs and flags stale ones",
    outcome: 'Team dashboard with PR status, staleness alerts, and review metrics',
    category: 'business',
    tone: 'business',
  },
  {
    id: 'competitor-pricing',
    prompt: "Monitor my competitors' pricing daily and alert me to changes",
    outcome: 'Price monitoring tool with daily scraping and change notifications',
    category: 'automation',
    tone: 'business',
  },
  {
    id: 'newsletter-drafts',
    prompt: 'Draft weekly newsletter summaries from my blog posts',
    outcome: 'Content pipeline that reads your blog and drafts newsletter copy',
    category: 'automation',
    tone: 'business',
  },

  // Serious / enterprise
  {
    id: 'inventory-sync',
    prompt: 'Build a website that syncs inventory from postgres to S3 and runs daily analysis',
    outcome: 'Automated pipeline with dashboard, runs on schedule, alerts on anomalies',
    category: 'data',
    tone: 'enterprise',
  },
  {
    id: 'contract-review',
    prompt: 'Review legal contracts and flag unfavorable clauses',
    outcome: 'Document analysis tool that highlights risk areas and suggests changes',
    category: 'agent',
    tone: 'enterprise',
  },
  {
    id: 'csv-cleanup',
    prompt: 'Turn this messy CSV of customer data into a clean database',
    outcome: 'Data cleaning pipeline with deduplication, normalization, and validation',
    category: 'data',
    tone: 'enterprise',
  },
  {
    id: 'mongo-query-tool',
    prompt: 'Build an internal tool where my team can query our MongoDB in plain English',
    outcome: 'Natural language database explorer with access controls and export',
    category: 'data',
    tone: 'enterprise',
  },
  {
    id: 'sales-analysis',
    prompt: "Analyze my Q4 sales CSV and tell me what's working",
    outcome: 'Sales analytics dashboard with trend breakdown and actionable insights',
    category: 'data',
    tone: 'enterprise',
  },
  {
    id: 'design-gallery',
    prompt: 'Build a gallery of 25 curated design websites with card layout',
    outcome: 'Curated showcase site with categories, search, and external links',
    category: 'website',
    tone: 'business',
  },
];

export interface CategoryMeta {
  id: CapabilityCategory | 'all';
  label: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all', label: 'Everything' },
  { id: 'fun', label: 'Fun stuff' },
  { id: 'personal', label: 'Personal tools' },
  { id: 'business', label: 'Business tools' },
  { id: 'data', label: 'Data pipelines' },
  { id: 'website', label: 'Websites' },
  { id: 'automation', label: 'Automations' },
  { id: 'agent', label: 'AI agents' },
];

/**
 * Returns a rotation sequence that guarantees tonal diversity:
 * at least 1 silly/personal example per 4 shown.
 */
export function getRotationSequence(
  category?: CapabilityCategory | 'all' | null,
): CapabilityExample[] {
  const pool =
    category && category !== 'all'
      ? CAPABILITY_EXAMPLES.filter((e) => e.category === category)
      : CAPABILITY_EXAMPLES;

  if (pool.length <= 4) return pool;

  const light = pool.filter((e) => e.tone === 'silly' || e.tone === 'personal');
  const heavy = pool.filter((e) => e.tone === 'business' || e.tone === 'enterprise');

  // Interleave: every 3 heavy, insert 1 light
  const result: CapabilityExample[] = [];
  let li = 0;
  let hi = 0;
  let heavySinceLastLight = 0;

  while (result.length < pool.length) {
    if (heavySinceLastLight >= 3 && li < light.length) {
      result.push(light[li++]);
      heavySinceLastLight = 0;
    } else if (hi < heavy.length) {
      result.push(heavy[hi++]);
      heavySinceLastLight++;
    } else if (li < light.length) {
      result.push(light[li++]);
      heavySinceLastLight = 0;
    } else {
      break;
    }
  }

  return result;
}
