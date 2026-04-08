/**
 * Query category detection for timer thresholds (P0-18).
 *
 * Categories are sticky (only upgrade, never downgrade) so a query that
 * escalates from chat → build mid-flight keeps the higher threshold.
 */

export type QueryCategory = 'chat' | 'free_tool' | 'standard' | 'heavy';

/** Tool names that immediately promote to a specific category. */
const CATEGORY_OVERRIDES: Record<string, QueryCategory> = {
  // Heavy — full builds
  build_site: 'heavy',
  build_static_site: 'heavy',
  provision_app_infrastructure: 'heavy',
  // Standard — edits, code exec, premium queries
  edit_site: 'standard',
  execute_python_code: 'standard',
  execute_python_code_bedrock: 'standard',
  execute_python_code_local: 'standard',
  execute_python_claude: 'standard',
  daytona_run_code: 'standard',
  query_dataset_sql: 'standard',
  query_mongodb: 'standard',
  aggregate_mongodb: 'standard',
  query_postgresql: 'standard',
  create_histogram: 'standard',
  create_scatter_plot: 'standard',
  create_bar_chart: 'standard',
  create_line_plot: 'standard',
  create_heatmap: 'standard',
  diagram: 'standard',
  // Free tools — lightweight reads
  calculator: 'free_tool',
  current_time: 'free_tool',
  http_request: 'free_tool',
  rss: 'free_tool',
  list_datasets: 'free_tool',
  retrieve_dataset: 'free_tool',
  describe_dataset: 'free_tool',
};

const CATEGORY_RANK: Record<QueryCategory, number> = {
  chat: 0,
  free_tool: 1,
  standard: 2,
  heavy: 3,
};

/** Green / amber / red timer thresholds per category (seconds). */
export const CATEGORY_THRESHOLDS: Record<QueryCategory, { green: number; amber: number; red: number; label: string }> = {
  chat: { green: 15, amber: 30, red: 60, label: '2-15s' },
  free_tool: { green: 20, amber: 45, red: 90, label: '2-20s' },
  standard: { green: 120, amber: 240, red: 480, label: '30s - 2 min' },
  heavy: { green: 480, amber: 720, red: 1200, label: '2-8 min' },
};

/**
 * Given the current category and a new tool name, return the (possibly upgraded)
 * category. Categories only go up, never down.
 */
export function promoteCategory(current: QueryCategory, toolName: string): QueryCategory {
  const override = CATEGORY_OVERRIDES[toolName];
  if (!override) return current;
  return CATEGORY_RANK[override] > CATEGORY_RANK[current] ? override : current;
}
