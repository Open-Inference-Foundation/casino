export interface DomainTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  examplePrompt: string;
  collections: string[];
  color: string;
}

export const DOMAIN_TEMPLATES: DomainTemplate[] = [
  {
    id: 'finance',
    name: 'Finance Tracker',
    description: 'Track spending, categorize transactions, analyze budgets',
    icon: '💳',
    examplePrompt: 'Build me a personal finance tracker where users can upload bank statements and the AI categorizes their spending and shows budget analysis.',
    collections: ['transactions', 'accounts', 'budgets'],
    color: '#10b981',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Log workouts, track measurements, set and monitor goals',
    icon: '🏃',
    examplePrompt: 'Build a health and fitness app where users can log workouts, track body measurements over time, and get AI-powered insights on their progress.',
    collections: ['workouts', 'measurements', 'goals'],
    color: '#f59e0b',
  },
  {
    id: 'inventory',
    name: 'Inventory Manager',
    description: 'Manage items, categories, stock levels, and reorder alerts',
    icon: '📦',
    examplePrompt: 'Build an inventory management app where users can track items, categorize them, monitor stock levels, and get alerts when inventory is low.',
    collections: ['items', 'categories'],
    color: '#8b5cf6',
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Manage contacts, log interactions, track deals and pipeline',
    icon: '👥',
    examplePrompt: 'Build a simple CRM where users can manage contacts, log interactions and notes, and track deals through a sales pipeline.',
    collections: ['contacts', 'interactions', 'deals'],
    color: '#3b82f6',
  },
  {
    id: 'legal',
    name: 'Legal Document Review',
    description: 'Upload contracts, extract clauses, get AI-powered analysis',
    icon: '⚖️',
    examplePrompt: 'Build a legal document review app where users can upload contracts and the AI extracts key clauses, flags potential issues, and summarizes obligations.',
    collections: ['documents', 'clauses'],
    color: '#6366f1',
  },
  {
    id: 'productivity',
    name: 'Project Tracker',
    description: 'Manage tasks, projects, deadlines, and team progress',
    icon: '✅',
    examplePrompt: 'Build a project tracker where users can create projects, break them into tasks, set deadlines, and get AI-generated progress summaries and recommendations.',
    collections: ['tasks', 'projects'],
    color: '#ec4899',
  },
  {
    id: 'custom',
    name: 'Custom App',
    description: 'Describe anything — Casino figures out the right structure',
    icon: '✨',
    examplePrompt: 'Build me an app that ',
    collections: ['records'],
    color: '#14b8a6',
  },
];
