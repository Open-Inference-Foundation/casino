export type BuildStageId = 'plan' | 'style' | 'build' | 'publish';
export type EditStageId = 'read' | 'edit' | 'build' | 'verify' | 'promote';
export type StageId = BuildStageId | EditStageId;
export type StageStatus = 'pending' | 'active' | 'complete' | 'error' | 'retrying';

export interface BuildStage {
  id: StageId;
  label: string;
  description: string;
  status: StageStatus;
  detail?: string;
}

export function getInitialStages(): BuildStage[] {
  return [
    { id: 'plan', label: 'Plan', description: 'Analyzing your description', status: 'pending' },
    { id: 'style', label: 'Style', description: 'Generating design system', status: 'pending' },
    { id: 'build', label: 'Build', description: 'Compiling React app', status: 'pending' },
    { id: 'publish', label: 'Publish', description: 'Deploying to CDN', status: 'pending' },
  ];
}

// Keywords that indicate each stage is active/complete
const STAGE_SIGNALS: Record<BuildStageId, string[]> = {
  plan: ['plan', 'domain', 'collection', 'schema', 'analyzing', 'classify', 'spec'],
  style: ['style', 'design', 'color', 'font', 'theme', 'css', 'palette', 'typography'],
  build: ['build', 'npm', 'vite', 'compil', 'bundle', 'install', 'react', 'component'],
  publish: ['publish', 'deploy', 'cdn', 'upload', 's3', 'cloudfront', 'https://', 'url'],
};

export function deriveStages(
  toolCalls: Array<{ name: string; status: string; result?: unknown; agentResponse?: string }>,
  isStreaming: boolean,
  buildElapsedMs?: number,
): BuildStage[] {
  const stages = getInitialStages();

  // Find a build_site or build_static_site tool call
  const buildCall = toolCalls.find(
    (tc) => tc.name === 'build_site' || tc.name === 'build_static_site' || tc.name === 'provision_app_infrastructure',
  );

  if (!buildCall) {
    // No tool call yet — if streaming, show plan as active (agent is thinking)
    if (isStreaming && buildElapsedMs !== undefined && buildElapsedMs > 0) {
      stages[0] = { ...stages[0], status: 'active', detail: 'Starting build...' };
    }
    return stages;
  }

  const isBuildDone = buildCall.status === 'complete' || buildCall.status === 'success';

  // Aggregate all text to scan for keywords
  const toString = (v: unknown): string =>
    typeof v === 'string' ? v : v ? JSON.stringify(v) : '';

  const allText = [
    buildCall.agentResponse ?? '',
    toString(buildCall.result),
    ...toolCalls.map((tc) => tc.agentResponse ?? ''),
    ...toolCalls.map((tc) => toString(tc.result)),
  ]
    .join(' ')
    .toLowerCase();

  // Check if we have a final URL (publish complete)
  const hasUrl = /https:\/\/[a-z0-9.-]+\.(fun|com|net|io|app|dev)/.test(allText);

  // When tool is in-progress (no result yet), use elapsed time for progression
  // Pipeline stages: plan (~5s) → style (~10s) → build (~70s) → publish (~15s)
  if (!isBuildDone && buildElapsedMs !== undefined) {
    const order: StageId[] = ['plan', 'style', 'build', 'publish'];
    const elapsed = buildElapsedMs / 1000;
    let activeIdx = 0;
    if (elapsed > 75) activeIdx = 3;       // publish
    else if (elapsed > 15) activeIdx = 2;  // build
    else if (elapsed > 5) activeIdx = 1;   // style
    // else plan

    return stages.map((stage, idx) => {
      if (idx < activeIdx) return { ...stage, status: 'complete' };
      if (idx === activeIdx) return { ...stage, status: 'active', detail: extractDetail(allText, stage.id) };
      return stage;
    });
  }

  // Determine highest stage reached from keywords (used when result is available)
  let highestStage: StageId = 'plan';
  if (hasUrl) {
    highestStage = 'publish';
  } else if (STAGE_SIGNALS.build.some((kw) => allText.includes(kw))) {
    highestStage = 'build';
  } else if (STAGE_SIGNALS.style.some((kw) => allText.includes(kw))) {
    highestStage = 'style';
  }

  const order: StageId[] = ['plan', 'style', 'build', 'publish'];
  const highestIdx = order.indexOf(highestStage);

  return stages.map((stage, idx) => {
    if (idx < highestIdx) {
      return { ...stage, status: 'complete' };
    }
    if (idx === highestIdx) {
      const status: StageStatus = isBuildDone && highestStage === 'publish' ? 'complete' : 'active';
      const detail = extractDetail(allText, stage.id);
      return { ...stage, status, detail };
    }
    return stage;
  });
}

function extractDetail(text: string, stageId: StageId): string | undefined {
  switch (stageId) {
    case 'plan': {
      const domainMatch = text.match(/domain[:\s]+([a-z]+)/);
      if (domainMatch) return `Domain: ${domainMatch[1]}`;
      return 'Classifying domain and collections...';
    }
    case 'style': {
      if (text.includes('color')) return 'Generating color palette...';
      return 'Building design system...';
    }
    case 'build': {
      if (text.includes('vite build')) return 'Running vite build...';
      if (text.includes('npm install')) return 'Installing dependencies...';
      return 'Compiling components...';
    }
    case 'publish': {
      const urlMatch = text.match(/https:\/\/[^\s"']+/);
      if (urlMatch) return urlMatch[0];
      return 'Uploading to CDN...';
    }
  }
}

/** Extract preview_url and version from edit_site tool result (draft publish). */
export function extractEditResult(
  toolCalls: Array<{ name: string; result?: unknown }>,
): { previewUrl: string; version: number } | null {
  for (const tc of toolCalls) {
    if (tc.name !== 'edit_site' || !tc.result) continue;
    try {
      const parsed = typeof tc.result === 'string' ? JSON.parse(tc.result) : tc.result;
      if (parsed?.preview_url && parsed?.version) {
        return { previewUrl: parsed.preview_url, version: parsed.version };
      }
    } catch {
      /* ignore parse errors */
    }
  }
  return null;
}

/** Extract the live URL from tool results */
export function extractBuildUrl(
  toolCalls: Array<{ name: string; result?: unknown; agentResponse?: string }>,
): string | null {
  const toString = (v: unknown): string =>
    typeof v === 'string' ? v : v ? JSON.stringify(v) : '';
  for (const tc of toolCalls) {
    const text = `${toString(tc.result)} ${tc.agentResponse ?? ''}`;
    const match = text.match(/https:\/\/[a-z0-9.-]+\.(fun|com|net|io|app|dev)[^\s"')>]*/i);
    if (match) return match[0];
  }
  return null;
}

// ─── Edit stages ────────────────────────────────────────────────────────────

export function getInitialEditStages(): BuildStage[] {
  return [
    { id: 'read', label: 'Read', description: 'Reading source files', status: 'pending' },
    { id: 'edit', label: 'Edit', description: 'Applying changes', status: 'pending' },
    { id: 'build', label: 'Build', description: 'Compiling project', status: 'pending' },
    { id: 'verify', label: 'Verify', description: 'Publishing draft', status: 'pending' },
    { id: 'promote', label: 'Promote', description: 'Waiting for approval', status: 'pending' },
  ];
}

export function isEditToolCall(toolCalls: Array<{ name: string }>): boolean {
  return toolCalls.some((tc) => tc.name === 'edit_site');
}

export function deriveEditStages(
  toolCalls: Array<{ name: string; status: string; result?: unknown; agentResponse?: string }>,
  isStreaming: boolean,
  buildElapsedMs?: number,
): BuildStage[] {
  const stages = getInitialEditStages();

  // Find the most recent edit_site tool call
  const editCall = [...toolCalls].reverse().find((tc) => tc.name === 'edit_site');

  if (!editCall) {
    if (isStreaming && buildElapsedMs !== undefined && buildElapsedMs > 0) {
      stages[0] = { ...stages[0], status: 'active', detail: 'Starting edit...' };
    }
    return stages;
  }

  const isEditDone = editCall.status === 'complete' || editCall.status === 'success';

  // If the tool completed, mark pipeline stages complete but leave promote pending (needs user action)
  if (isEditDone) {
    return stages.map((s) =>
      s.id === 'promote'
        ? { ...s, status: 'pending' as StageStatus, detail: 'Click Promote to go live' }
        : { ...s, status: 'complete' as StageStatus },
    );
  }

  // Time-based progression while streaming (edit is faster than full build)
  // Read (0-5s) → Edit (5-15s) → Build (15-60s) → Verify (60s+) → Promote (user action)
  if (buildElapsedMs !== undefined) {
    const elapsed = buildElapsedMs / 1000;
    const order: EditStageId[] = ['read', 'edit', 'build', 'verify', 'promote'];
    let activeIdx = 0;
    if (elapsed > 60) activeIdx = 3;
    else if (elapsed > 15) activeIdx = 2;
    else if (elapsed > 5) activeIdx = 1;

    const details: Record<EditStageId, string> = {
      read: 'Reading source files...',
      edit: 'Claude is editing files...',
      build: 'Running npm run build...',
      verify: 'Publishing draft...',
      promote: 'Waiting for approval',
    };

    return stages.map((stage, idx) => {
      if (idx < activeIdx) return { ...stage, status: 'complete' as StageStatus };
      if (idx === activeIdx)
        return { ...stage, status: 'active' as StageStatus, detail: details[order[idx]] };
      return stage;
    });
  }

  return stages;
}
